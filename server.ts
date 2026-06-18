import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import {
  getOrCreateUser,
  getUserData,
  syncPantry,
  saveRecipe,
  deleteRecipe,
  syncCart,
  addHistory,
  clearHistory,
} from "./src/db/queries.ts";
import { CURATED_RECIPES, CuratedRecipe } from "./src/data/curatedRecipes.ts";

dotenv.config();

// Simple high-speed in-memory cache for API recipes with a limit of 500 items
const recipeCache = new Map<string, any>();

const app = express();
const PORT = 3000;

// Set maximum payload sizes to accommodate image base64 data
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in system environments. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// REST SQL Database Sync and Session Management Endpoints
app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
  try {
    const firebaseUser = req.user!;
    const dbUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.email || "");
    const userData = await getUserData(dbUser.id);
    res.json({
      user: {
        id: dbUser.id,
        uid: dbUser.uid,
        email: dbUser.email
      },
      ...userData
    });
  } catch (error: any) {
    console.error("Auth sync error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sync-pantry", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId, pantry } = req.body;
    if (!userId || !Array.isArray(pantry)) {
      res.status(400).json({ error: "Missing required parameters." });
      return;
    }
    await syncPantry(userId, pantry);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/save-recipe", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId, recipe } = req.body;
    if (!userId || !recipe) {
      res.status(400).json({ error: "Missing required parameters." });
      return;
    }
    await saveRecipe(userId, recipe);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/delete-recipe", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId, apiRecipeId } = req.body;
    if (!userId || !apiRecipeId) {
      res.status(400).json({ error: "Missing required parameters." });
      return;
    }
    await deleteRecipe(userId, apiRecipeId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sync-cart", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId, cart } = req.body;
    if (!userId || !Array.isArray(cart)) {
      res.status(400).json({ error: "Missing required parameters." });
      return;
    }
    await syncCart(userId, cart);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/add-cooking-history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId, historyItem } = req.body;
    if (!userId || !historyItem) {
      res.status(400).json({ error: "Missing required parameters." });
      return;
    }
    await addHistory(userId, historyItem);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/clear-cooking-history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: "Missing required parameters." });
      return;
    }
    await clearHistory(userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Google Tasks Endpoints proxying requests securely
app.get("/api/tasks/lists", requireAuth, async (req: AuthRequest, res) => {
  try {
    const googleToken = req.headers["x-google-token"];
    if (!googleToken) {
      res.status(400).json({ error: "Missing Google OAuth Access Token in request headers." });
      return;
    }

    const response = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
      headers: { Authorization: `Bearer ${googleToken}` }
    });

    if (!response.ok) {
      const errBody = await response.text();
      res.status(response.status).json({ error: `Google API Error: ${errBody}` });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/tasks/add", requireAuth, async (req: AuthRequest, res) => {
  try {
    const googleToken = req.headers["x-google-token"];
    const { listId, title, notes } = req.body;
    if (!googleToken || !listId || !title) {
      res.status(400).json({ error: "Missing required parameters or credentials." });
      return;
    }

    const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${googleToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        notes,
        status: "needsAction"
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      res.status(response.status).json({ error: `Google API Error: ${errBody}` });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/api/recipes", async (req, res) => {
  try {
    const { ings, filters, engine = "instant" } = req.body;
    if (!ings || !Array.isArray(ings) || ings.length === 0) {
       res.status(400).json({ error: "Missing ingredients parameter." });
       return;
    }

    // 1. Generate unique cache key based on engine, sorted ingredients, and active filters
    const sortedIngsKey = ings.map(i => i.toLowerCase().trim()).sort().join(",");
    const filterKey = JSON.stringify(filters || {});
    const cacheKey = `${engine}:${sortedIngsKey}:${filterKey}`;

    // 2. Check in-memory query cache for instant hits
    if (recipeCache.has(cacheKey)) {
      res.json(recipeCache.get(cacheKey));
      return;
    }

    let results: any[] = [];

    if (engine === "instant") {
      // 3. SUPER-SPEED INSTANT ENGINE: Map over 30 staple recipes using dynamic heuristics
      const cleanUserIngs = ings.map(i => i.toLowerCase().trim());
      
      const scored = CURATED_RECIPES.map((recipe) => {
        const used: string[] = [];
        const missing: string[] = [];

        for (const ingLine of recipe.allIngs) {
          const lowerIng = ingLine.toLowerCase();
          
          // Match criteria: keyword matches or substring overlap
          const matchByKeyword = recipe.keywords.some(kw => {
            const inLine = lowerIng.includes(kw);
            const userHas = cleanUserIngs.some(ui => ui.includes(kw) || kw.includes(ui));
            return inLine && userHas;
          });

          const matchBySubstring = cleanUserIngs.some(ui => lowerIng.includes(ui) || ui.includes(lowerIng));

          if (matchByKeyword || matchBySubstring) {
            used.push(ingLine);
          } else {
            missing.push(ingLine);
          }
        }

        // Calculate dynamic overlapping rates
        const usedCount = used.length;
        const missingCount = missing.length;
        const matchRatio = usedCount / recipe.allIngs.length;

        // Custom diet verification heuristics
        const lowerName = recipe.name.toLowerCase();
        const lowerDesc = recipe.desc.toLowerCase();
        const lowerCuisine = recipe.cuisine.toLowerCase();
        const fullText = (recipe.allIngs.join(" ") + " " + lowerName + " " + lowerDesc + " " + lowerCuisine).toLowerCase();

        const hasMeat = ["chicken", "beef", "pork", "sausage", "bacon", "salmon", "fish", "cod", "shrimp", "tuna", "pork chop", "stewing beef"].some(x => fullText.includes(x));
        const hasDairyOrEgg = ["milk", "cream", "butter", "cheese", "egg", "yogurt", "cheddar", "mozzarella", "feta", "parmesan"].some(x => fullText.includes(x));
        const hasGluten = ["flour", "bread", "toast", "dough", "pizza", "pita", "flatbread", "pancake", "pancakes", "penne", "pasta", "spaghetti"].some(x => fullText.includes(x));
        const hasKetoVeto = ["potato", "potatoes", "rice", "oats", "sugar", "syrup", "flour", "bread", "toast", "dough", "pizza", "pita", "flatbread", "pancake", "pancakes", "penne", "pasta", "spaghetti"].some(x => fullText.includes(x));

        let isDietMatched = true;
        if (filters && filters.dietary && filters.dietary.length > 0) {
          for (const diet of filters.dietary) {
            const dLower = diet.toLowerCase();
            if (dLower.includes("vegetarian") && hasMeat) {
              isDietMatched = false;
            } else if (dLower.includes("vegan") && (hasMeat || hasDairyOrEgg)) {
              isDietMatched = false;
            } else if (dLower.includes("gluten") && hasGluten) {
              isDietMatched = false;
            } else if (dLower.includes("keto") && hasKetoVeto) {
              isDietMatched = false;
            }
          }
        }

        let isCuisineMatched = true;
        if (filters && filters.cuisine && filters.cuisine !== "Any") {
          isCuisineMatched = lowerCuisine.includes(filters.cuisine.toLowerCase()) || lowerName.includes(filters.cuisine.toLowerCase());
        }

        let isTimeMatched = true;
        if (filters && filters.time) {
          isTimeMatched = recipe.time <= Number(filters.time);
        }

        let isDifficultyMatched = true;
        if (filters && (filters.difficulty || filters.diff) && filters.difficulty !== "Any") {
          const reqDiff = (filters.difficulty || filters.diff).toLowerCase();
          isDifficultyMatched = recipe.difficulty.toLowerCase() === reqDiff;
        }

        return {
          recipe: {
            ...recipe,
            used,
            missing
          },
          usedCount,
          missingCount,
          matchRatio,
          isDietMatched,
          isCuisineMatched,
          isTimeMatched,
          isDifficultyMatched
        };
      });

      // Filter based on criteria, fall back gracefully to all if filters are too restrictive
      let filtered = scored.filter(s => s.isDietMatched && s.isCuisineMatched && s.isTimeMatched && s.isDifficultyMatched);
      if (filtered.length === 0) {
        // Fall back to just diet matched
        filtered = scored.filter(s => s.isDietMatched);
      }
      if (filtered.length === 0) {
        // Fall back to everything
        filtered = scored;
      }

      // Sort by highest available ingredients matched, then fewest missing ingredients
      filtered.sort((a, b) => {
        if (b.usedCount !== a.usedCount) {
          return b.usedCount - a.usedCount;
        }
        return a.missingCount - b.missingCount;
      });

      // Slice top 4 matched recipes
      results = filtered.slice(0, 4).map(f => f.recipe);
      
    } else {
      // 4. CREATIVE AI ENGINE: Google Gemini 3.5-Flash
      const ai = getAIClient();
      const requirements: string[] = [];
      if (filters) {
        if (filters.dietary && filters.dietary.length > 0) {
          requirements.push(`Dietary restrictions: ${filters.dietary.join(", ")}`);
        }
        if (filters.time) {
          requirements.push(`Max preparation and cook time: ${filters.time} minutes`);
        }
        if (filters.difficulty || filters.diff) {
          requirements.push(`Difficulty rating: ${filters.difficulty || filters.diff}`);
        }
        if (filters.cuisine) {
          requirements.push(`Cuisine style: ${filters.cuisine}`);
        }
      }

      const requirementPrompt = requirements.length > 0
        ? `Ensure all returned recipes adhere to these strict conditions: ${requirements.join(" | ")}.`
        : "";

      const userPrompt = `I have the following ingredients available in my kitchen: ${ings.join(", ")}.
${requirementPrompt}
Suggest exactly 4 unique, delicious, and realistic recipes utilizing these ingredients. Create realistic culinary steps and appropriate measures for other standard kitchen items.`;

      const systemInstruction = 
        "You are Chef Gemini, a high-end Michelin-starred computational chef. " +
        "Create high-quality recipes based on the user's available ingredients. " +
        "Be concise and clear in step-by-step cooking directions to optimize response speed. " +
        "Classify each ingredient in the cooking ingredients list as either 'used' (which matches the list of user input ingredients perfectly) or 'missing' (other essential elements they need to buy or prepare). " +
        "Provide complete real-world instruction steps and accurate ingredients with measurements in the 'allIngs' array. " +
        "Assign a fun, relevant emoji to represent each dish.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER, description: "A sequential integer unique ID starting from 1." },
                name: { type: Type.STRING, description: "Proper mouthwatering name of the dish." },
                emoji: { type: Type.STRING, description: "Exactly one relevant emoji capturing the dish theme." },
                time: { type: Type.INTEGER, description: "Estimated active preparation + cook time in minutes." },
                difficulty: { type: Type.STRING, description: "Difficulty level - must be 'Easy', 'Medium', or 'Hard'." },
                cuisine: { type: Type.STRING, description: "The style of cuisine, e.g. 'Italian', 'Asian', 'Mediterranean', etc." },
                servings: { type: Type.INTEGER, description: "Ideal serving size." },
                desc: { type: Type.STRING, description: "An enticing, short one-sentence hook of the dish flavor." },
                overview: { type: Type.STRING, description: "A detailed 2-3 sentence overview of this recipe, including culinary style, pairing recommendations, or background story." },
                marketPrice: { type: Type.STRING, description: "Estimated average grocery market price for ingredients or per serving, e.g., '$4.50 - $6.00' or similar local currency estimate." },
                youtubeQuery: { type: Type.STRING, description: "Ideal YouTube search query phrase to find cooking video tutorial for this recipe, e.g., 'How to cook classic Italian Marinara and Penne'." },
                nutritional: {
                  type: Type.OBJECT,
                  properties: {
                    calories: { type: Type.INTEGER, description: "Estimated Calories count for one serving wrapper." },
                    protein: { type: Type.STRING, description: "Estimated protein in grams, e.g., '24g'." },
                    carbs: { type: Type.STRING, description: "Estimated carbohydrates in grams, e.g., '45g'." },
                    fat: { type: Type.STRING, description: "Estimated total fat in grams, e.g., '12g'." },
                  },
                  required: ["calories", "protein", "carbs", "fat"],
                  description: "Basic nutritional facts estimation per serving of this dish."
                },
                used: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Array of items present in the user's input list that are utilized."
                },
                missing: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Critical ingredients required for this dish that the user doesn't have in their input list."
                },
                allIngs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "The complete ingredients list with standard measurements (e.g., '200g Pasta', '2 Cloves Garlic')."
                },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Clear, sequential preparation directions."
                }
              },
              required: [
                "id", "name", "emoji", "time", "difficulty", "cuisine", 
                "servings", "desc", "overview", "marketPrice", "youtubeQuery", "used", "missing", "allIngs", "steps", "nutritional"
              ]
            }
          }
        }
      });

      const jsonText = response.text || "[]";
      results = JSON.parse(jsonText);
    }

    // 5. Store cooked results in local Cache (evicting elder items if size > 500)
    if (recipeCache.size >= 500) {
      const firstKey = recipeCache.keys().next().value;
      if (firstKey) recipeCache.delete(firstKey);
    }
    recipeCache.set(cacheKey, results);

    res.json(results);
  } catch (err: any) {
    console.error("Error creating culinary guides:", err);
    res.status(500).json({ error: err.message || "An Error occurred during recipe estimation." });
  }
});

app.post("/api/scan", async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
       res.status(400).json({ error: "Missing image data" });
       return;
    }

    const ai = getAIClient();

    // Prepare image part
    const cleanBase64 = image.includes("base64,") ? image.split("base64,")[1] : image;
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: cleanBase64,
      }
    };

    const textPart = {
      text: "Analyze this image of ingredients, a fridge, or groceries. List all individual, recognizable raw foods or pantry components visible that can be cooked. " +
            "Be specific (e.g. use 'chicken thigh' or 'onion' or 'basil' rather than generic names). " +
            "Return only names as simple lowercase singular nouns. Return a JSON list of strings.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [imagePart, textPart]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const listText = response.text || "[]";
    res.json(JSON.parse(listText));
  } catch (err: any) {
    console.error("Error scanning pantry content:", err);
    res.status(500).json({ error: err.message || "An error occurred during pantry recognition." });
  }
});

// Setup Vite Dev Middleware vs Static assets for production
async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pantry Chef backend running at http://0.0.0.0:${PORT}`);
  });
}

runServer();
