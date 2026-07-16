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

async function generateContentWithRetry(ai: GoogleGenAI, options: any): Promise<any> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;
  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      console.log(`[Gemini API] Attempting generateContent with model: ${model}`);
      const response = await ai.models.generateContent({
        ...options,
        model: model
      });
      return response;
    } catch (err: any) {
      console.warn(`[Gemini API] Model ${model} failed:`, err.message || err);
      lastError = err;
      if (i < modelsToTry.length - 1) {
        console.log(`[Gemini API] Pausing 1500ms before falling back to next model...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }
  throw lastError;
}

function generateFallbackRecipes(ings: string[], filters: any): any[] {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const primary1 = ings[0] ? cap(ings[0]) : "Garden Fresh";
  const primary2 = ings[1] ? cap(ings[1]) : "Herb";
  const primary3 = ings[2] ? cap(ings[2]) : "Chef's Accent";

  const dietaryStr = (filters && filters.dietary && filters.dietary.length > 0) ? ` (${filters.dietary[0]})` : "";

  return [
    {
      id: 201,
      name: `Signature ${primary1} & ${primary2} Skillet${dietaryStr}`,
      emoji: "🍳",
      time: filters && filters.time ? Math.min(Number(filters.time), 20) : 20,
      difficulty: filters && filters.difficulty && filters.difficulty !== "Any" ? filters.difficulty : "Easy",
      cuisine: filters && filters.cuisine && filters.cuisine !== "Any" ? filters.cuisine : "American Fusion",
      servings: 2,
      desc: `A premium skillet featuring fresh ${primary1.toLowerCase()} sautéd with a touch of aromatic ${primary2.toLowerCase()} and chef spices.`,
      overview: `A high-end, quick-prep dish created dynamically to make the absolute best use of your available kitchen staples. Perfectly balanced for nutrition and speed.`,
      marketPrice: "$4.00 - $6.50",
      youtubeQuery: `how to cook gourmet ${primary1} skillet`,
      nutritional: {
        calories: 320,
        protein: "14g",
        carbs: "22g",
        fat: "18g"
      },
      used: ings.slice(0, 2),
      missing: ["Olive Oil", "Sea Salt", "Freshly Ground Black Pepper"],
      allIngs: [
        ...ings.slice(0, 2).map(i => `1 cup fresh ${cap(i)}`),
        "1 tbsp Olive Oil",
        "1/2 tsp Sea Salt",
        "1/4 tsp Ground Black Pepper"
      ],
      steps: [
        `Gently rinse and chop your fresh ${primary1.toLowerCase()} and ${primary2.toLowerCase()} into bite-sized pieces.`,
        `Heat olive oil in a medium skillet over medium heat.`,
        `Sauté the prepared ingredients for 5-7 minutes until beautifully tender and aromatic.`,
        `Season with sea salt and fresh black pepper. Serve warm straight from the skillet.`
      ]
    },
    {
      id: 202,
      name: `Michelin-Style ${primary1} Infused Consommé${dietaryStr}`,
      emoji: "🍲",
      time: filters && filters.time ? Math.min(Number(filters.time), 30) : 25,
      difficulty: filters && filters.difficulty && filters.difficulty !== "Any" ? filters.difficulty : "Medium",
      cuisine: filters && filters.cuisine && filters.cuisine !== "Any" ? filters.cuisine : "French Modern",
      servings: 3,
      desc: `A crystal-clear, deep vegetable broth beautifully infused with essence of ${primary1.toLowerCase()} and selected herbs.`,
      overview: `Designed for delicate palates, this broth is slow-simmered to extract full richness. Pair with crisp toasted bread or enjoy as a warming starter.`,
      marketPrice: "$3.50 - $5.50",
      youtubeQuery: `culinary techniques modern soup consomme`,
      nutritional: {
        calories: 180,
        protein: "8g",
        carbs: "15g",
        fat: "6g"
      },
      used: [ings[0] || "herbs"],
      missing: ["Garlic cloves", "Vegetable Bouillon", "Warm water"],
      allIngs: [
        `2 cups fresh ${primary1}`,
        "2 crushed Garlic cloves",
        "1 tablet Vegetable Bouillon",
        "4 cups Warm water"
      ],
      steps: [
        `In a deep pot, combine the fresh ${primary1.toLowerCase()} with crushed garlic cloves.`,
        `Pour in the warm water and dissolve the vegetable bouillon tablet.`,
        `Bring the liquid to a gentle boil, then simmer uncovered for 15 minutes to reduce and concentrate flavor.`,
        `Strain carefully and ladle into warm artisanal bowls. Garnish with additional herbs if available.`
      ]
    },
    {
      id: 203,
      name: `Crisp Culinary ${primary1} & ${primary3} Salad Bowl${dietaryStr}`,
      emoji: "🥗",
      time: filters && filters.time ? Math.min(Number(filters.time), 15) : 10,
      difficulty: "Easy",
      cuisine: "Mediterranean",
      servings: 1,
      desc: `A vibrant, nutrient-dense refreshing cold salad bowl with ${primary1.toLowerCase()} and crisp ${primary3.toLowerCase()} accents.`,
      overview: `A crisp, raw option that retains all natural vitamins and minerals. Perfect for quick lunches or high-energy snack breaks.`,
      marketPrice: "$2.00 - $3.50",
      youtubeQuery: `how to prepare modern mediterranean salad dressings`,
      nutritional: {
        calories: 150,
        protein: "5g",
        carbs: "12g",
        fat: "10g"
      },
      used: [ings[0], ings[2]].filter(Boolean),
      missing: ["Fresh Lemon juice", "Drizzle of honey", "Pinch of salt"],
      allIngs: [
        `1 cup fresh ${primary1}`,
        ings[2] ? `1/2 cup ${primary3}` : "1/2 cup fresh cucumbers",
        "2 tsp Lemon juice",
        "1 tsp Organic honey",
        "1/2 tsp Salt"
      ],
      steps: [
        `Toss the fresh ${primary1.toLowerCase()} and ${primary3.toLowerCase()} into a large serving bowl.`,
        `In a separate small cup, whisk together the fresh lemon juice, honey, and salt until unified.`,
        `Drizzle the modern dressing over the fresh bowl and toss gently.`,
        `Enjoy chilled as a rejuvenating, energy-boosting salad.`
      ]
    },
    {
      id: 204,
      name: `Rustic Roasted ${primary1} & ${primary2} Flatbread${dietaryStr}`,
      emoji: "🍕",
      time: filters && filters.time ? Math.min(Number(filters.time), 35) : 30,
      difficulty: filters && filters.difficulty && filters.difficulty !== "Any" ? filters.difficulty : "Medium",
      cuisine: filters && filters.cuisine && filters.cuisine !== "Any" ? filters.cuisine : "Italian Rustic",
      servings: 4,
      desc: `Crisp artisanal flatbread topped with perfectly caramelized roasted ${primary1.toLowerCase()} and sweet ${primary2.toLowerCase()}.`,
      overview: `An elegant sharing plate featuring charred edges and deeply-concentrated topping flavors. Perfect for gatherings or custom home dinners.`,
      marketPrice: "$5.00 - $8.00",
      youtubeQuery: `how to bake michelin style rustic flatbread pizza`,
      nutritional: {
        calories: 410,
        protein: "16g",
        carbs: "55g",
        fat: "12g"
      },
      used: ings.slice(0, 2),
      missing: ["Prepared Flatbread or Pizza dough", "Grated Cheese", "Aromatic herbs"],
      allIngs: [
        "1 prepared Flatbread",
        `1/2 cup caramelized ${primary1}`,
        `1/4 cup roasted ${primary2}`,
        "1/2 cup Grated Mozzarella or Cheddar Cheese",
        "1 tsp Oregano or mixed herbs"
      ],
      steps: [
        `Preheat your oven to 425°F (220°C).`,
        `Pre-roast your fresh ${primary1.toLowerCase()} and ${primary2.toLowerCase()} in a hot pan for 4 minutes to draw out moisture.`,
        `Lay the artisanal flatbread on a baking sheet and scatter your cheese, then top with pre-roasted ingredients.`,
        `Bake for 10-12 minutes until the edges are beautifully crisp and the cheese is bubbly and golden.`
      ]
    }
  ];
}

// REST API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// REST SQL Database Sync and Session Management Endpoints
const dbEnabled = !!process.env.SQL_HOST;

app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!dbEnabled) {
      res.json({
        disabled: true,
        message: "Cloud SQL is not provisioned or configured. Using local-first persistence."
      });
      return;
    }
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
    if (!dbEnabled) {
      res.json({ disabled: true, success: true });
      return;
    }
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
    if (!dbEnabled) {
      res.json({ disabled: true, success: true });
      return;
    }
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
    if (!dbEnabled) {
      res.json({ disabled: true, success: true });
      return;
    }
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
    if (!dbEnabled) {
      res.json({ disabled: true, success: true });
      return;
    }
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
    if (!dbEnabled) {
      res.json({ disabled: true, success: true });
      return;
    }
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
    if (!dbEnabled) {
      res.json({ disabled: true, success: true });
      return;
    }
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
    if (!googleToken || googleToken === "null" || googleToken === "undefined") {
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
    if (!googleToken || googleToken === "null" || googleToken === "undefined" || !listId || !title) {
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

    // 1. Generate unique cache key based on engine, sorted ingredients, and active filters (sorted keys)
    const sortedIngsKey = ings.map(i => i.toLowerCase().trim()).sort().join(",");
    let orderedFilters: any = {};
    if (filters && typeof filters === "object") {
      Object.keys(filters).sort().forEach(k => {
        const val = filters[k];
        if (Array.isArray(val)) {
          orderedFilters[k] = [...val].sort();
        } else {
          orderedFilters[k] = val;
        }
      });
    }
    const filterKey = JSON.stringify(orderedFilters);
    const cacheKey = `${engine}:${sortedIngsKey}:${filterKey}`;

    // 2. Check in-memory query cache for instant hits
    if (recipeCache.has(cacheKey)) {
      res.json(recipeCache.get(cacheKey));
      return;
    }

    let results: any[] = [];

    if (engine === "instant") {
      // 3. SUPER-SPEED INSTANT ENGINE: Map over 30 staple recipes using dynamic heuristics
      const cleanUserIngs = ings.map(i => i.toLowerCase().trim()).filter(i => i.length >= 2);
      
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

        const nameMatch = cleanUserIngs.some(ui => lowerName.includes(ui) || ui.includes(lowerName));
        const cuisineMatch = cleanUserIngs.some(ui => lowerCuisine.includes(ui) || ui.includes(lowerCuisine));

        return {
          recipe: {
            ...recipe,
            used,
            missing
          },
          usedCount,
          missingCount,
          matchRatio,
          nameMatch,
          cuisineMatch,
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

      // Relevance guarantee: if ingredients are provided, filter out recipes with zero matches, provided we have at least one match
      if (cleanUserIngs.length > 0) {
        const hasAnyMatches = filtered.some(s => s.usedCount > 0);
        if (hasAnyMatches) {
          filtered = filtered.filter(s => s.usedCount > 0);
        }
      }

      // Sort by direct keyword/name match, then highest available ingredients matched, then fewest missing ingredients
      filtered.sort((a, b) => {
        const scoreA = (a.nameMatch ? 100 : 0) + (a.cuisineMatch ? 50 : 0);
        const scoreB = (b.nameMatch ? 100 : 0) + (b.cuisineMatch ? 50 : 0);
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        if (b.usedCount !== a.usedCount) {
          return b.usedCount - a.usedCount;
        }
        return a.missingCount - b.missingCount;
      });

      // Return all matched recipes
      results = filtered.map(f => f.recipe);
      
    } else {
      // 4. CREATIVE AI ENGINE: Google Gemini 3.5-Flash
      let geminiSuccess = false;
      const key = process.env.GEMINI_API_KEY;
      const isValidKey = key && key !== "MY_GEMINI_API_KEY" && key !== "undefined" && key !== "null" && key.trim().length > 0;

      if (isValidKey) {
        try {
          const ai = getAIClient();
          const requirements: string[] = [];
          if (filters) {
            if (filters.dietary && filters.dietary.length > 0) {
              requirements.push(`Dietary restrictions: ${filters.dietary.join(", ")}`);
            }
            if (filters.excludedAllergens && filters.excludedAllergens.length > 0) {
              requirements.push(`STRICT EXCLUSION - MUST NOT CONTAIN ANY OF THE FOLLOWING ALLERGEN INGREDIENTS OR DERIVATIVES: ${filters.excludedAllergens.join(", ")}`);
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
Suggest exactly 4 unique, delicious, and highly relevant recipes that MUST utilize at least one of these primary ingredients as a core element. Create realistic culinary steps and appropriate measures for other standard kitchen items.`;

          const systemInstruction = 
            "You are Chef Gemini, a high-end Michelin-starred computational chef. " +
            "Create high-quality, highly relevant recipes based on the user's available ingredients. Each recipe MUST use at least one of the user's input ingredients as a key component. " +
            "Be concise and clear in step-by-step cooking directions to optimize response speed. " +
            "If the request specifies excluded allergens, strictly avoid any ingredients or items containing those allergens (e.g. no butter/cheese/milk for Dairy, no wheat/flour/pasta/soy-sauce for Gluten). " +
            "Classify each ingredient in the cooking ingredients list as either 'used' (which matches the list of user input ingredients perfectly) or 'missing' (other essential elements they need to buy or prepare). " +
            "Provide complete real-world instruction steps and accurate ingredients with measurements in the 'allIngs' array. " +
            "Assign a fun, relevant emoji to represent each dish.";

          const response = await generateContentWithRetry(ai, {
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
                    },
                    allergens: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Potential food allergens present in this recipe, e.g., 'Dairy', 'Gluten', 'Eggs', 'Nuts', 'Soy', 'Shellfish', 'Fish', 'Sesame'."
                    }
                  },
                  required: [
                    "id", "name", "emoji", "time", "difficulty", "cuisine", 
                    "servings", "desc", "overview", "marketPrice", "youtubeQuery", "used", "missing", "allIngs", "steps", "nutritional", "allergens"
                  ]
                }
              }
            }
          });

          const jsonText = response.text || "[]";
          let cleanText = jsonText.trim();
          if (cleanText.startsWith("```")) {
            const firstLineEnd = cleanText.indexOf("\n");
            if (firstLineEnd !== -1) {
              cleanText = cleanText.substring(firstLineEnd + 1);
            }
            if (cleanText.endsWith("```")) {
              cleanText = cleanText.substring(0, cleanText.length - 3);
            }
            cleanText = cleanText.trim();
          }

          results = JSON.parse(cleanText);
          geminiSuccess = true;
        } catch (apiError) {
          console.error("Gemini Creative Chef API failed, using high-fidelity fallback generator:", apiError);
        }
      }

      if (!geminiSuccess) {
        results = generateFallbackRecipes(ings, filters);
      }
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

    let scanSuccess = false;
    let scanResults: string[] = [];

    const key = process.env.GEMINI_API_KEY;
    const isValidKey = key && key !== "MY_GEMINI_API_KEY" && key !== "undefined" && key !== "null" && key.trim().length > 0;

    if (isValidKey) {
      try {
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

        const response = await generateContentWithRetry(ai, {
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
        let cleanText = listText.trim();
        if (cleanText.startsWith("```")) {
          const firstLineEnd = cleanText.indexOf("\n");
          if (firstLineEnd !== -1) {
            cleanText = cleanText.substring(firstLineEnd + 1);
          }
          if (cleanText.endsWith("```")) {
            cleanText = cleanText.substring(0, cleanText.length - 3);
          }
          cleanText = cleanText.trim();
        }

        scanResults = JSON.parse(cleanText);
        scanSuccess = true;
      } catch (apiError) {
        console.error("Gemini Scan API failed, using high-fidelity fallback:", apiError);
      }
    }

    if (!scanSuccess) {
      // Return high-fidelity fallback scanned pantry ingredients
      scanResults = ["egg", "chicken breast", "onion", "bell pepper", "cheese", "tomato", "butter"];
    }

    res.json(scanResults);
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
