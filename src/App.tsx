import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AIRecipe, FilterState, Difficulty, CookingHistoryItem } from "./types";
import RecipeDetailModal from "./components/RecipeDetailModal";
import { alarmSoundEngine } from "./utils/audio";
import { auth, googleAuthProvider } from "./lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { LogIn, LogOut, RefreshCw, Eye, Trash2, CalendarRange, Sparkles, ClipboardCheck } from "lucide-react";

const C = {
  primary: "#1E3D2F",
  accent: "#D95F2B",
  white: "#FFFFFF",
  bg: "#FAF8F4",
  border: "#EEDECA",
  text: "#1E293B",
  muted: "#64748B",
  chip: "#F1F5F9",
  lightGreen: "#E6F4EC",
  green: "#2B6B44",
  orange: "#FFF1EA"
};

const POPULAR = [
  ["🍗", "Chicken"], 
  ["🍅", "Tomato"], 
  ["🥚", "Egg"], 
  ["🧀", "Cheese"], 
  ["🐟", "Salmon"], 
  ["🥩", "Beef"], 
  ["🥔", "Potato"], 
  ["🍝", "Pasta"], 
  ["🍄", "Mushroom"], 
  ["🧄", "Garlic"], 
  ["🧅", "Onion"], 
  ["🌶️", "Pepper"], 
  ["🥦", "Broccoli"], 
  ["🍋", "Lemon"], 
  ["🥕", "Carrot"], 
  ["🍚", "Rice"]
];

const DIETARY = ["Vegetarian", "Vegan", "Halal", "Gluten-Free", "Dairy-Free"];
const TIMES = [15, 30, 45, 60];
const DIFFS = ["Easy", "Medium", "Hard"];
const CUISINES = ["Italian", "Asian", "African", "American", "Mediterranean", "Indian"];

function parseAIRecipes(rawRecipes: any[]): AIRecipe[] {
  return rawRecipes.map((r) => ({
    id: crypto.randomUUID(),
    name: r.name,
    emoji: r.emoji,
    imageUrl: r.imageUrl,
    time: r.time,
    difficulty: r.difficulty,
    cuisine: r.cuisine,
    dietaryTags: r.dietaryTags ?? [],
    servings: r.servings,
    desc: r.desc,
    overview: r.overview,
    marketPrice: r.marketPrice,
    youtubeQuery: r.youtubeQuery,
    used: r.used ?? [],
    missing: r.missing ?? [],
    allIngs: r.allIngs ?? [],
    steps: r.steps ?? [],
    nutritional: r.nutritional,
  }));
}

export default function App() {
  const [ings, setIngs] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({
    dietary: [],
    time: null,
    difficulty: null,
    cuisine: null
  });

  const [recipes, setRecipes] = useState<AIRecipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<AIRecipe[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<CookingHistoryItem[]>([]);

  // User auth, database profile synchronization, and Google Tasks integration
  const [user, setUser] = useState<any>(null);
  const [sqlUserId, setSqlUserId] = useState<number | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => {
    return sessionStorage.getItem("pantry_google_access_token") || null;
  });
  const [syncing, setSyncing] = useState<boolean>(false);
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string>("");
  const [exportingTasksCart, setExportingTasksCart] = useState<boolean>(false);
  const [tasksMessage, setTasksMessage] = useState<string | null>(null);

  // Statuses
  const [recipeEngine, setRecipeEngine] = useState<"instant" | "creative">("instant");
  const [loading, setLoading] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanMsg, setScanMsg] = useState<string>("");
  const [errorText, setErrorText] = useState<string | null>(null);

  // Tab View Navigation
  const [activeTab, setActiveTab] = useState<"search" | "saved" | "shopping" | "history">("search");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<AIRecipe | null>(null);

  // Kitchen Timer states
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerTotal, setTimerTotal] = useState<number>(0);
  const [timerOpen, setTimerOpen] = useState<boolean>(false);
  const [ringtone, setRingtone] = useState<string>(() => {
    const saved = localStorage.getItem("pantry_timer_ringtone");
    if (saved) {
      alarmSoundEngine.setRingtone(saved);
      return saved;
    }
    alarmSoundEngine.setRingtone("chime");
    return "chime";
  });
  const [isAlarmRinging, setIsAlarmRinging] = useState<boolean>(false);

  // Cart copied states
  const [cartCopied, setCartCopied] = useState<boolean>(false);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState<string>("");

  // Suggested Recipes (AI Chef Section) Sorting State
  const [recipeSortBy, setRecipeSortBy] = useState<"missing" | "time" | "calories" | "name" | "rating">(() => {
    return (localStorage.getItem("recipe_sort_by") as any) || "missing";
  });
  const [recipeSortOrder, setRecipeSortOrder] = useState<"asc" | "desc">(() => {
    return (localStorage.getItem("recipe_sort_order") as any) || "asc";
  });

  // Shopping Cart List Sorting State
  const [cartSortBy, setCartSortBy] = useState<"checked" | "alphabetical">(() => {
    return (localStorage.getItem("cart_sort_by") as any) || "checked";
  });
  const [cartSortOrder, setCartSortOrder] = useState<"asc" | "desc">(() => {
    return (localStorage.getItem("cart_sort_order") as any) || "asc";
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop alarm ringing helper
  const handleStopAlarm = () => {
    setIsAlarmRinging(false);
    alarmSoundEngine.stop();
  };

  const handleChangeRingtone = (name: string) => {
    setRingtone(name);
    alarmSoundEngine.setRingtone(name);
    localStorage.setItem("pantry_timer_ringtone", name);
    // Play quick audible preview of selected tone
    alarmSoundEngine.play();
    setTimeout(() => {
      // Keep playing if the alarm is currently ringing
      if (!isAlarmRinging) {
        alarmSoundEngine.stop();
      }
    }, 1500);
  };

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      setIsAlarmRinging(true);
      alarmSoundEngine.play();
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Clean play engines on unmount
  useEffect(() => {
    return () => {
      alarmSoundEngine.stop();
    };
  }, []);

  // Copy shopping list to clipboard helper
  const copyCartToClipboard = () => {
    if (cart.length === 0) return;
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const activeItems = cart.filter(i => !checked.includes(i));
    const checkedItems = cart.filter(i => checked.includes(i));

    let text = `🛒 FRIDGE CHEF - SHOPPING LIST (${dateStr})\n`;
    text += `========================================\n`;
    if (activeItems.length > 0) {
      text += `📝 NEED TO BUY:\n`;
      activeItems.forEach(item => {
        text += `  [ ] ${item.charAt(0).toUpperCase() + item.slice(1)}\n`;
      });
    }
    if (checkedItems.length > 0) {
      text += `\n✅ IN STOCK / GATHERED:\n`;
      checkedItems.forEach(item => {
        text += `  [x] ${item.charAt(0).toUpperCase() + item.slice(1)}\n`;
      });
    }
    text += `\n----------------------------------------\n`;
    text += `💡 Generated via Chef Gemini Pantry Intelligence.`;

    try {
      navigator.clipboard.writeText(text);
      setCartCopied(true);
      setTimeout(() => setCartCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Load persistence states on mount
  useEffect(() => {
    try {
      const storedIngs = localStorage.getItem("pantry_ingredients");
      if (storedIngs) setIngs(JSON.parse(storedIngs));

      const storedSaved = localStorage.getItem("pantry_recipes_saved");
      if (storedSaved) setSavedRecipes(JSON.parse(storedSaved));

      const storedCart = localStorage.getItem("pantry_shopping_cart");
      if (storedCart) setCart(JSON.parse(storedCart));

      const storedChecked = localStorage.getItem("pantry_checked_cart");
      if (storedChecked) setChecked(JSON.parse(storedChecked));

      const storedRatings = localStorage.getItem("pantry_recipe_ratings");
      if (storedRatings) setRatings(JSON.parse(storedRatings));

      const storedHistory = localStorage.getItem("pantry_cooking_history");
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.error("Failed to load local data:", e);
    }
  }, []);

  // Sync / Load database profile and tasks list logic
  const syncWithCloudSQL = async (currentUser: any, idToken: string) => {
    setSyncing(true);
    try {
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSqlUserId(data.user.id);
        
        // Sync online authoritative data into local state
        if (data.pantry) {
          setIngs(data.pantry);
          localStorage.setItem("pantry_ingredients", JSON.stringify(data.pantry));
        }
        if (data.savedRecipes) {
          setSavedRecipes(data.savedRecipes);
          localStorage.setItem("pantry_recipes_saved", JSON.stringify(data.savedRecipes));
        }
        if (data.cart) {
          setCart(data.cart);
          localStorage.setItem("pantry_shopping_cart", JSON.stringify(data.cart));
        }
        if (data.history) {
          setHistory(data.history);
          localStorage.setItem("pantry_cooking_history", JSON.stringify(data.history));
        }
      } else {
        console.error("SQL Synced error:", await response.text());
      }
    } catch (e) {
      console.error("Error synchronizing profile data with Cloud SQL:", e);
    } finally {
      setSyncing(false);
    }
  };

  const loadGoogleTaskLists = async (accessToken: string) => {
    if (!accessToken) return;
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;
      const res = await fetch("/api/tasks/lists", {
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "X-Google-Token": accessToken
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setTaskLists(data.items);
          setSelectedTaskListId(data.items[0].id);
        }
      } else {
        console.error("Google lists fetch failed:", await res.text());
        if (res.status === 401) {
          setGoogleAccessToken(null);
          sessionStorage.removeItem("pantry_google_access_token");
        }
      }
    } catch (e) {
      console.error("Failed to load Google Task Lists", e);
    }
  };
  
  useEffect(() => {
    localStorage.setItem("recipe_sort_by", recipeSortBy);
  }, [recipeSortBy]);

  useEffect(() => {
    localStorage.setItem("recipe_sort_order", recipeSortOrder);
  }, [recipeSortOrder]);

  useEffect(() => {
    localStorage.setItem("cart_sort_by", cartSortBy);
  }, [cartSortBy]);

  useEffect(() => {
    localStorage.setItem("cart_sort_order", cartSortOrder);
  }, [cartSortOrder]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const idToken = await currentUser.getIdToken();
        await syncWithCloudSQL(currentUser, idToken);
        
        if (googleAccessToken) {
          loadGoogleTaskLists(googleAccessToken);
        }
      } else {
        setUser(null);
        setSqlUserId(null);
      }
    });
    return () => unsubscribe();
  }, [googleAccessToken]);

  const handleConnectGoogleTasks = async (): Promise<boolean> => {
    try {
      setSyncing(true);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      if (accessToken) {
        setGoogleAccessToken(accessToken);
        sessionStorage.setItem("pantry_google_access_token", accessToken);
        await loadGoogleTaskLists(accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Google Tasks Authorization failed:", error);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setSyncing(true);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      if (accessToken) {
        setGoogleAccessToken(accessToken);
        sessionStorage.setItem("pantry_google_access_token", accessToken);
        loadGoogleTaskLists(accessToken);
      }
      
      const idToken = await result.user.getIdToken();
      await syncWithCloudSQL(result.user, idToken);
    } catch (error: any) {
      console.error("Sign-in failed:", error);
      setErrorText("Cloud authenticate failed: " + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSyncing(true);
      await signOut(auth);
      setUser(null);
      setSqlUserId(null);
      setGoogleAccessToken(null);
      sessionStorage.removeItem("pantry_google_access_token");
      setTaskLists([]);
      setSelectedTaskListId("");
      
      setIngs([]);
      setSavedRecipes([]);
      setCart([]);
      setChecked([]);
      setHistory([]);
      
      localStorage.removeItem("pantry_ingredients");
      localStorage.removeItem("pantry_recipes_saved");
      localStorage.removeItem("pantry_shopping_cart");
      localStorage.removeItem("pantry_checked_cart");
      localStorage.removeItem("pantry_cooking_history");
    } catch (error: any) {
      console.error("Sign-out failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddRecipeToGoogleTasks = async (title: string, notes: string): Promise<any> => {
    let token = googleAccessToken || sessionStorage.getItem("pantry_google_access_token");
    if (!token) {
      const connected = await handleConnectGoogleTasks();
      if (!connected) throw new Error("Google Tasks connection was declined or failed.");
      token = sessionStorage.getItem("pantry_google_access_token");
    }
    
    if (!token) throw new Error("Google access token is missing.");

    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Firebase auth token missing.");

    const listId = selectedTaskListId || "@default";

    const res = await fetch("/api/tasks/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
        "X-Google-Token": token
      },
      body: JSON.stringify({
        listId,
        title,
        notes
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Google Task insertion failed:", err);
      throw new Error("Unable to add task item to your list: " + err);
    }

    return await res.json();
  };

  const handleExportCartToGoogleTasks = async () => {
    if (cart.length === 0) return;
    let token = googleAccessToken || sessionStorage.getItem("pantry_google_access_token");
    if (!token) {
       const connected = await handleConnectGoogleTasks();
       if (!connected) return;
       token = sessionStorage.getItem("pantry_google_access_token");
    }
    setExportingTasksCart(true);
    setTasksMessage("Exporting cart items to Google Tasks...");
    try {
      const targetList = taskLists.find(l => l.id === selectedTaskListId);
      const listName = targetList ? targetList.title : "Default List";
      const idToken = await auth.currentUser?.getIdToken();

      for (const item of cart) {
        await fetch("/api/tasks/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken!}`,
            "X-Google-Token": token!
          },
          body: JSON.stringify({
            listId: selectedTaskListId || "@default",
            title: `Buy ${item} (Pantry Shopping list)`,
            notes: `Exported via Pantry Intelligence Chef application.`
          })
        });
      }
      setTasksMessage(`✓ Exported all ${cart.length} items to Tasks list "${listName}"!`);
      setTimeout(() => setTasksMessage(null), 5000);
    } catch (e: any) {
      console.error(e);
      setTasksMessage("✕ Failed to export cart: " + e.message);
    } finally {
      setExportingTasksCart(false);
    }
  };

  // Update logic helper
  const updateIngsState = (newList: string[]) => {
    setIngs(newList);
    localStorage.setItem("pantry_ingredients", JSON.stringify(newList));
    if (user && sqlUserId) {
      auth.currentUser?.getIdToken().then(token => {
        fetch("/api/sync-pantry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ userId: sqlUserId, pantry: newList })
        }).catch(err => console.error("Sync pantry error:", err));
      });
    }
  };

  const toggleIng = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    const exists = ings.some((i) => i.toLowerCase() === clean.toLowerCase());
    if (exists) {
      const filtered = ings.filter((i) => i.toLowerCase() !== clean.toLowerCase());
      updateIngsState(filtered);
    } else {
      updateIngsState([...ings, clean]);
    }
  };

  const removeIng = (name: string) => {
    const list = ings.filter((i) => i !== name);
    updateIngsState(list);
  };

  const addInput = () => {
    const clean = input.trim();
    if (clean) {
      if (!ings.some((i) => i.toLowerCase() === clean.toLowerCase())) {
        updateIngsState([...ings, clean]);
      }
      setInput("");
    }
  };

  // Convert image utility
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Trigger base64 scan
  const scan = async (file: File) => {
    setScanning(true);
    setScanMsg("Locating food resources...");
    setErrorText(null);

    try {
      const base64Content = await toBase64(file);
      setScanMsg("Analyzing food elements...");

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Content,
          mimeType: file.type
        })
      });

      if (!response.ok) {
        throw new Error("Invalid scanner status.");
      }

      const detectedList: string[] = await response.json();
      if (detectedList && detectedList.length > 0) {
        const updated = [...ings];
        detectedList.forEach((item) => {
          if (!updated.some((u) => u.toLowerCase() === item.toLowerCase().trim())) {
            updated.push(item.trim());
          }
        });
        updateIngsState(updated);
        setScanMsg(`✓ Detected ${detectedList.length} items successfully!`);
      } else {
        setScanMsg("Empty plate or unrecognized items.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorText("Pantry camera analysis failed. Please specify text chips manual style.");
      setScanMsg("Scanner failed.");
    } finally {
      setTimeout(() => setScanMsg(""), 4000);
      setScanning(false);
    }
  };

  // AI Recipes Lookup
  const findRecipes = async () => {
    if (ings.length === 0) return;

    setLoading(true);
    setErrorText(null);
    setRecipes([]);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ings,
          filters,
          engine: recipeEngine
        })
      });

      if (!response.ok) {
        const errDetail = await response.json();
        throw new Error(errDetail.error || "Pantry AI was unable to construct manuals.");
      }

      const raw: any[] = await response.json();
      const list = parseAIRecipes(raw);
      setRecipes(list);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Encountered an issue retrieving items. Try with generic ingredients.");
    } finally {
      setLoading(false);
    }
  };

  // Cook list toggles
  const handleToggleSave = (recipe: AIRecipe) => {
    let updated: AIRecipe[];
    const exists = savedRecipes.some((s) => s.id === recipe.id);
    if (exists) {
      updated = savedRecipes.filter((s) => s.id !== recipe.id);
      if (user && sqlUserId) {
        auth.currentUser?.getIdToken().then(token => {
          fetch("/api/delete-recipe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId: sqlUserId, apiRecipeId: recipe.id.toString() })
          }).catch(err => console.error("Sync delete-recipe error:", err));
        });
      }
    } else {
      updated = [...savedRecipes, recipe];
      if (user && sqlUserId) {
        auth.currentUser?.getIdToken().then(token => {
          fetch("/api/save-recipe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId: sqlUserId, recipe })
          }).catch(err => console.error("Sync save-recipe error:", err));
        });
      }
    }
    setSavedRecipes(updated);
    localStorage.setItem("pantry_recipes_saved", JSON.stringify(updated));
  };

  const handleRateRecipe = (recipeName: string, rating: number) => {
    const updated = { ...ratings, [recipeName]: rating };
    setRatings(updated);
    localStorage.setItem("pantry_recipe_ratings", JSON.stringify(updated));
  };

  const handleLogCooked = (recipe: AIRecipe) => {
    const newItem: CookingHistoryItem = {
      id: crypto.randomUUID(),
      recipeName: recipe.name,
      recipeEmoji: recipe.emoji || "🍽️",
      cookedAt: new Date().toISOString(),
      rating: ratings[recipe.name] || 0,
      ingredientsCount: recipe.allIngs ? recipe.allIngs.length : 0
    };
    const updated = [newItem, ...history];
    setHistory(updated);
    localStorage.setItem("pantry_cooking_history", JSON.stringify(updated));

    if (user && sqlUserId) {
      auth.currentUser?.getIdToken().then(token => {
        fetch("/api/add-cooking-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ userId: sqlUserId, historyItem: newItem })
        }).catch(err => console.error("Sync history error:", err));
      });
    }
  };

  const clearHistory = () => {
    if (window.confirm && !window.confirm("Are you sure you want to clear your cooking log history? This cannot be undone.")) {
      return;
    }
    setHistory([]);
    localStorage.removeItem("pantry_cooking_history");

    if (user && sqlUserId) {
      auth.currentUser?.getIdToken().then(token => {
        fetch("/api/clear-cooking-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ userId: sqlUserId })
        }).catch(err => console.error("Sync clear history error:", err));
      });
    }
  };

  const getCookCount = (recipeName: string) => {
    return history.filter((h) => h.recipeName && h.recipeName.toLowerCase() === recipeName.toLowerCase()).length;
  };

  const isSaved = (recipe: AIRecipe) => savedRecipes.some((s) => s.id === recipe.id);

  // Cart Management
  const addToCart = (newIngredients: string[]) => {
    const updated = [...cart];
    newIngredients.forEach((item) => {
      const cleanItem = item.trim().toLowerCase();
      if (cleanItem && !updated.some((c) => c.toLowerCase() === cleanItem)) {
        updated.push(item.trim());
      }
    });
    setCart(updated);
    localStorage.setItem("pantry_shopping_cart", JSON.stringify(updated));

    if (user && sqlUserId) {
      auth.currentUser?.getIdToken().then(token => {
        fetch("/api/sync-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ userId: sqlUserId, cart: updated })
        }).catch(err => console.error("Sync cart error:", err));
      });
    }
  };

  const toggleCheck = (item: string) => {
    const updated = checked.includes(item)
      ? checked.filter((x) => x !== item)
      : [...checked, item];
    setChecked(updated);
    localStorage.setItem("pantry_checked_cart", JSON.stringify(updated));
  };

  const clearChecked = () => {
    const remaining = cart.filter((item) => !checked.includes(item));
    setCart(remaining);
    localStorage.setItem("pantry_shopping_cart", JSON.stringify(remaining));

    const remainingChecked = checked.filter((item) => !checked.includes(item));
    setChecked(remainingChecked);
    localStorage.setItem("pantry_checked_cart", JSON.stringify(remainingChecked));

    if (user && sqlUserId) {
      auth.currentUser?.getIdToken().then(token => {
        fetch("/api/sync-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ userId: sqlUserId, cart: remaining })
        }).catch(err => console.error("Sync cart error:", err));
      });
    }
  };

  const filterCount = [
    filters.dietary.length > 0,
    filters.time !== null,
    filters.difficulty !== null,
    filters.cuisine !== null
  ].filter(Boolean).length;

  return (
    <div style={{ background: "#EDE8DE", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "16px", boxSizing: "border-box" }} className="selection:bg-amber-500 selection:text-white">
      {/* Handheld Device Shell Container */}
      <div 
        style={{
          width: "100%",
          maxWidth: 850,
          background: C.white,
          height: "92vh",
          minHeight: "720px",
          display: "flex",
          flexDirection: "column",
          borderRadius: 32,
          boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
          border: `1px solid rgba(0,0,0,0.06)`,
          overflow: "hidden",
          position: "relative"
        }}
      >
        {/* HEADER */}
        <div style={{ background: C.primary, padding: "40px 20px 20px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: `${C.accent}30` }} />
          <div style={{ position: "absolute", bottom: -20, left: 60, width: 80, height: 80, borderRadius: "50%", background: `${C.white}10` }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: `${C.white}70`, fontWeight: 600, textTransform: "uppercase", fontFamily: "monospace" }}>Pantry Intelligence</div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Global Timer Header Badge Button */}
                <button 
                  id="header-timer-btn"
                  onClick={() => setTimerOpen(true)}
                  style={{
                    background: isAlarmRinging ? "#DC2626" : (timerActive && timerSeconds > 0 ? C.accent : "rgba(255,255,255,0.15)"),
                    border: "none",
                    borderRadius: 20,
                    padding: "4px 10px",
                    color: C.white,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: isAlarmRinging ? "0 0 12px #DC2626" : "none"
                  }}
                  className={isAlarmRinging ? "animate-pulse" : ""}
                >
                  ⏱️ {isAlarmRinging ? "Ringing!" : (timerSeconds > 0 ? `${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, "0")}` : "Timer")}
                </button>
              </div>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: C.white, lineHeight: 1.1 }}>
              What's in<br />your Fridge?
            </div>
            <div style={{ fontSize: 12, color: `${C.white}80`, marginTop: 6 }}>
              Scan, select ingredients · get instant recipes
            </div>
          </div>
        </div>

        {/* TAB NAV */}
        <div style={{ display: "flex", background: C.primary, padding: "0 16px 16px", flexShrink: 0 }}>
          {[
            ["search", "🔍", "Discover"],
            ["saved", "❤️", `Saved${savedRecipes.length ? ` (${savedRecipes.length})` : ""}`],
            ["shopping", "🛒", `Cart${cart.length ? ` (${cart.length})` : ""}`],
            ["history", "📖", `History${history.length ? ` (${history.length})` : ""}`]
          ].map(([id, icon, label]) => (
            <button 
              key={id} 
              id={`tab-btn-${id}`}
              onClick={() => setActiveTab(id as any)} 
              style={{
                flex: 1, 
                background: activeTab === id ? C.accent : "transparent",
                border: "none", 
                borderRadius: 10, 
                padding: "8px 4px", 
                cursor: "pointer",
                color: activeTab === id ? C.white : `${C.white}60`,
                fontSize: 12, 
                fontWeight: 600, 
                transition: "all 0.2s",
                outline: "none"
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* DYNAMIC SCROLL CONTAINER */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 24px", boxSizing: "border-box" }} className="scrollbar-thin">
          <AnimatePresence mode="wait">
            {/* SEARCH TAB */}
            {activeTab === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Refurbished Welcome Greeting Card */}
                <div style={{ background: "linear-gradient(135deg, #1E3D2F 0%, #2B6B44 100%)", borderRadius: 20, padding: 16, color: "white", marginBottom: 14, position: "relative", overflow: "hidden", boxShadow: "0 4px 15px rgba(30,61,47,0.15)" }}>
                  <div style={{ position: "absolute", top: -15, right: -10, fontStyle: "normal", fontSize: 56, opacity: 0.12, transform: "rotate(15deg)" }}>👩‍🍳</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ background: "rgba(255,255,255,0.2)", fontSize: 9, padding: "2px 7px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Chef Mode Active</span>
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Let's cook something tasty!</h3>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", margin: "4px 0 0 0", lineHeight: 1.3 }}>Select ingredients in stock or scan your kitchen fridge to instantly generate smart gourmet recipe ideas.</p>
                </div>

                {/* Chef Quick Insights Widget */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div style={{ background: "#F1EBE0", borderRadius: 14, padding: "8px 12px", border: "1px solid #E5DCCF", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🥕</span>
                    <div>
                      <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>My Pantry</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{ings.length} Ingredients</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setTimerOpen(true); }}
                    style={{ 
                      background: isAlarmRinging ? "#FEE2E2" : "#FFF1EA", 
                      borderRadius: 14, 
                      padding: "8px 12px", 
                      border: isAlarmRinging ? "1px solid #FCA5A5" : "1px solid #FCDFD0", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 8, 
                      cursor: "pointer", 
                      textAlign: "left", 
                      width: "100%", 
                      outline: "none" 
                    }}
                    className={`hover:scale-[1.02] transition-transform active:scale-95 duration-150 ${isAlarmRinging ? "animate-pulse" : ""}`}
                  >
                    <span style={{ fontSize: 20 }}>⏱️</span>
                    <div>
                      <div style={{ fontSize: 9, color: isAlarmRinging ? "#991B1B" : C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {isAlarmRinging ? "ALARM RINGING" : "Kitchen Timer"}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: isAlarmRinging ? "#DC2626" : C.accent }}>
                        {isAlarmRinging ? "Stop Alarm 🔔" : (timerSeconds > 0 ? `${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, "0")}` : "Set Alarm")}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Camera Scan Box */}
                <div style={{ background: C.white, borderRadius: 16, padding: 16, marginBottom: 14, border: `1px solid ${C.border}`, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                    📸 Scan Your Fridge
                  </div>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    style={{ display: "none" }}
                    onChange={e => e.target.files?.[0] && scan(e.target.files[0])} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={scanning} 
                    style={{
                      width: "100%", 
                      padding: "12px", 
                      background: scanning ? C.chip : C.primary, 
                      color: scanning ? C.muted : C.white,
                      border: "none", 
                      borderRadius: 12, 
                      fontSize: 13, 
                      fontWeight: 700, 
                      cursor: scanning ? "not-allowed" : "pointer",
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      gap: 8, 
                      transition: "all 0.2s",
                    }}
                  >
                    {scanning ? (
                      <>
                        <div style={{ width: 14, height: 14, border: "2.5px solid #ccc", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        Scanning Shelf Elements...
                      </>
                    ) : "📸 Take / Upload Photo"}
                  </button>
                  {scanMsg && (
                    <div style={{ marginTop: 8, fontSize: 12, color: scanMsg.startsWith("✓") ? C.green : C.accent, fontWeight: 600, textAlign: "center", background: "#FAF8F4", padding: "6px", borderRadius: 8 }}>
                      {scanMsg}
                    </div>
                  )}
                </div>

                {/* Custom Input */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, display: "flex", alignItems: "center", padding: "0 14px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
                    <span style={{ color: C.muted, marginRight: 8, fontSize: 13 }}>🔍</span>
                    <input 
                      value={input} 
                      onChange={e => setInput(e.target.value)} 
                      onKeyDown={e => e.key === "Enter" && addInput()}
                      placeholder="Type kitchen ingredient..." 
                      className="placeholder:font-normal font-semibold focus:outline-hidden"
                      style={{ flex: 1, border: "none", background: "none", fontSize: 13, color: C.text, padding: "12px 0" }} 
                    />
                  </div>
                  <button 
                    onClick={addInput} 
                    style={{ background: C.accent, color: C.white, border: "none", borderRadius: 12, padding: "0 18px", fontSize: 18, cursor: "pointer", fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>

                {/* Popular chips */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>Popular Items</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {POPULAR.map(([em, name]) => {
                      const sel = ings.some(x => x.toLowerCase() === name.toLowerCase());
                      return (
                        <button 
                          key={name} 
                          onClick={() => toggleIng(name)} 
                          style={{
                            background: sel ? C.primary : "#F1EBE0", 
                            color: sel ? C.white : C.text,
                            border: "none", 
                            borderRadius: 20, 
                            padding: "6px 12px", 
                            fontSize: 11, 
                            cursor: "pointer",
                            fontWeight: sel ? 700 : 500, 
                            transition: "all 0.15s", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 4,
                          }}
                        >
                          <span>{em}</span> {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected ingredients */}
                {ings.length > 0 && (
                  <div style={{ background: C.white, borderRadius: 16, padding: 14, marginBottom: 14, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>✅ My Ingredients ({ings.length})</div>
                      <button onClick={() => updateIngsState([])} style={{ background: "none", border: "none", fontSize: 11, color: C.accent, cursor: "pointer", fontWeight: 600 }}>Clear all</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {ings.map(i => (
                        <span key={i} style={{ background: C.lightGreen, color: C.green, fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ textTransform: "capitalize" }}>{i}</span>
                          <button onClick={() => removeIng(i)} style={{ background: "none", border: "none", cursor: "pointer", color: C.green, fontSize: 14, lineHeight: 1, padding: 0, fontWeight: 700 }}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recipe Search Speed Optimization Selector */}
                <div style={{
                  background: "#FDFBF7",
                  border: `1px dashed ${C.border}`,
                  borderRadius: 14,
                  padding: "10px 14px",
                  marginBottom: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 750, color: C.text, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "monospace" }}>
                      ⚡ Recipe Lookup Engine
                    </span>
                    <span style={{ fontSize: 9, background: recipeEngine === "instant" ? C.green + "15" : C.accent + "15", color: recipeEngine === "instant" ? C.green : C.accent, fontWeight: 800, padding: "2px 6px", borderRadius: 10 }}>
                      {recipeEngine === "instant" ? "⚡ ZERO DELAYS" : "🧠 CREATIVE AI"}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", padding: 3, borderRadius: 10, gap: 2 }}>
                    <button
                      id="engine-instant-btn"
                      onClick={() => setRecipeEngine("instant")}
                      style={{
                        flex: 1,
                        background: recipeEngine === "instant" ? C.white : "transparent",
                        color: recipeEngine === "instant" ? C.text : C.muted,
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 8px",
                        fontSize: 11,
                        fontWeight: recipeEngine === "instant" ? 750 : 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        boxShadow: recipeEngine === "instant" ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4
                      }}
                    >
                      ⚡ Instant Match
                    </button>
                    <button
                      id="engine-creative-btn"
                      onClick={() => setRecipeEngine("creative")}
                      style={{
                        flex: 1,
                        background: recipeEngine === "creative" ? C.white : "transparent",
                        color: recipeEngine === "creative" ? C.text : C.muted,
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 8px",
                        fontSize: 11,
                        fontWeight: recipeEngine === "creative" ? 750 : 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        boxShadow: recipeEngine === "creative" ? "0 2px 5px rgba(0,0,0,0.08)" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4
                      }}
                    >
                      ✨ Creative Chef AI
                    </button>
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.3, fontStyle: "italic" }}>
                    {recipeEngine === "instant" 
                      ? "⚡ Instant match maps your pantry items instantly with 30 premium staple recipes. No API calls or delays!"
                      : "✨ Creative AI uses Gemini 3.5-Flash in real-time to design deep custom Michelin-starred recipes based entirely on your exact list."
                    }
                  </div>
                </div>

                {/* Find Recipes Actions */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <button 
                    onClick={() => setFilterOpen(true)} 
                    style={{
                      background: C.white, 
                      border: `1px solid ${C.border}`, 
                      borderRadius: 12, 
                      padding: "0 12px",
                      fontSize: 12, 
                      fontWeight: 700, 
                      cursor: "pointer", 
                      color: C.text, 
                      whiteSpace: "nowrap",
                      display: "flex", 
                      alignItems: "center", 
                      gap: 4, 
                      position: "relative",
                    }}
                  >
                    ⚙️ Filters
                    {filterCount > 0 && (
                      <span style={{ background: C.accent, color: C.white, borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                        {filterCount}
                      </span>
                    )}
                  </button>
                  <button 
                    id="primary-find-btn"
                    onClick={findRecipes} 
                    disabled={loading || !ings.length} 
                    style={{
                      flex: 1, 
                      background: ings.length ? C.accent : "#E2D9CE", 
                      color: ings.length ? C.white : C.muted,
                      border: "none", 
                      borderRadius: 12, 
                      padding: "12px", 
                      fontSize: 13, 
                      fontWeight: 700, 
                      cursor: ings.length ? "pointer" : "not-allowed", 
                      transition: "all 0.2s"
                    }}
                  >
                    {loading ? "🔎 Finding Recipes..." : `🍽 Find Recipes (${ings.length})`}
                  </button>
                </div>

                {/* Skeletons Loading Indicator */}
                {loading && Array.from({ length: 2 }).map((_, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      background: "#F5EFE6", 
                      borderRadius: 16, 
                      height: 110, 
                      marginBottom: 12, 
                      opacity: 0.7,
                      border: "1px dashed #E5DCCF", 
                      animation: "pulse 1.2s ease infinite", 
                      animationDelay: `${i * 0.2}s` 
                    }} 
                  />
                ))}

                {/* Error Banner */}
                {errorText && (
                  <div style={{ background: "#FDF2F2", border: "1px solid #FBD5D5", color: "#9B1C1C", fontSize: 12, padding: "12px", borderRadius: 12, marginBottom: 14, fontWeight: 500 }}>
                    ⚠️ {errorText}
                  </div>
                )}

                {/* Recipe lists suggestions */}
                {!loading && recipes.length > 0 && (() => {
                  const filteredRecipes = recipes.filter(r => {
                    const q = recipeSearchQuery.toLowerCase().trim();
                    if (!q) return true;
                    return r.name.toLowerCase().includes(q) || 
                           r.desc.toLowerCase().includes(q) || 
                           r.cuisine.toLowerCase().includes(q) ||
                           r.allIngs.some(ing => ing.toLowerCase().includes(q));
                  });

                  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
                    let valA: any = 0;
                    let valB: any = 0;
                    if (recipeSortBy === "missing") {
                      valA = a.missing ? a.missing.length : 0;
                      valB = b.missing ? b.missing.length : 0;
                    } else if (recipeSortBy === "time") {
                      valA = a.time || 0;
                      valB = b.time || 0;
                    } else if (recipeSortBy === "calories") {
                      valA = a.nutritional?.calories || 0;
                      valB = b.nutritional?.calories || 0;
                    } else if (recipeSortBy === "name") {
                      return recipeSortOrder === "asc"
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                    } else if (recipeSortBy === "rating") {
                      valA = ratings[a.name] || 0;
                      valB = ratings[b.name] || 0;
                    }
                    return recipeSortOrder === "asc" ? valA - valB : valB - valA;
                  });

                  return (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>
                          🍽️ Suggested Recipes ({filteredRecipes.length} of {recipes.length})
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>Sort:</span>
                          <select
                            id="recipe-sort-select"
                            value={recipeSortBy}
                            onChange={(e) => setRecipeSortBy(e.target.value as any)}
                            style={{
                              background: C.white,
                              border: `1px solid ${C.border}`,
                              borderRadius: 8,
                              padding: "4px 8px",
                              fontSize: 11,
                              fontWeight: 700,
                              color: C.text,
                              outline: "none",
                              cursor: "pointer",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                            }}
                          >
                            <option value="missing">Best Match (Fewer Missing)</option>
                            <option value="time">Cooking Time</option>
                            <option value="calories">Calories</option>
                            <option value="name">Alphabetical</option>
                            <option value="rating">Rating</option>
                          </select>
                          
                          <button
                            id="recipe-sort-order-btn"
                            onClick={() => setRecipeSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                            style={{
                              background: C.white,
                              border: `1px solid ${C.border}`,
                              borderRadius: 8,
                              width: 24,
                              height: 24,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              cursor: "pointer",
                              color: C.text,
                              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                            }}
                            title={recipeSortOrder === "asc" ? "Ascending Order" : "Descending Order"}
                          >
                            {recipeSortOrder === "asc" ? "↑" : "↓"}
                          </button>
                        </div>
                      </div>

                      {/* Interactive Search / Filter bar for Suggested Recipes */}
                      <div style={{ 
                        background: C.white, 
                        border: `1px solid ${C.border}`, 
                        borderRadius: 12, 
                        display: "flex", 
                        alignItems: "center", 
                        padding: "0 12px", 
                        marginBottom: 14, 
                        boxShadow: "0 1px 3px rgba(0,0,0,0.01)" 
                      }}>
                        <span style={{ color: C.muted, marginRight: 8, fontSize: 13 }}>🔍</span>
                        <input 
                          value={recipeSearchQuery} 
                          onChange={e => setRecipeSearchQuery(e.target.value)} 
                          placeholder="Filter suggestions by name, cuisine, or ingredient..." 
                          className="placeholder:font-normal font-semibold focus:outline-hidden"
                          style={{ flex: 1, border: "none", background: "none", fontSize: 12, color: C.text, padding: "10px 0", outline: "none" }} 
                        />
                        {recipeSearchQuery && (
                          <button 
                            onClick={() => setRecipeSearchQuery("")}
                            style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, fontWeight: 700, padding: "0 4px" }}
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {sortedRecipes.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "30px 10px", color: C.muted }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                          <div style={{ fontSize: 13, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.text, marginBottom: 4 }}>No recipes match your filter</div>
                          <div style={{ fontSize: 11, lineHeight: 1.4 }}>Try typing another search keyword or clear the filter query.</div>
                        </div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12, marginBottom: 12 }}>
                          {sortedRecipes.map(r => (
                            <RecipeCard 
                              key={r.id} 
                              r={r} 
                              isSaved={isSaved(r)} 
                              toggleSave={() => handleToggleSave(r)} 
                              onOpen={() => setSelectedRecipe(r)} 
                              rating={ratings[r.name] || 0}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Empty Recipes state representation */}
                {!loading && recipes.length === 0 && ings.length > 0 && (
                  <div style={{ textAlign: "center", padding: "24px 10px", color: C.muted }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🥣</div>
                    <div style={{ fontSize: 14, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.text, marginBottom: 4 }}>Ready to cook?</div>
                    <div style={{ fontSize: 11, lineHeight: 1.4 }}>Hit "Find Recipes" to generate AI chef cookbooks based on your ingredients.</div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SAVED TAB */}
            {activeTab === "saved" && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {savedRecipes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px", color: C.muted }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>❤️</div>
                    <div style={{ fontSize: 14, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.text, marginBottom: 4 }}>No Bookmarked Recipes</div>
                    <div style={{ fontSize: 11, lineHeight: 1.4 }}>Tap the heart emoji bookmark of suggestions to save steps forever.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12, fontFamily: "monospace" }}>Saved Cookbooks ({savedRecipes.length})</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12, marginBottom: 12 }}>
                      {savedRecipes.map(r => (
                        <RecipeCard 
                          key={r.id} 
                          r={r} 
                          isSaved={true} 
                          toggleSave={() => handleToggleSave(r)} 
                          onOpen={() => setSelectedRecipe(r)} 
                          rating={ratings[r.name] || 0}
                        />
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* SHOPPING TAB */}
            {activeTab === "shopping" && (
              <motion.div
                key="shopping"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 850, color: C.text, margin: 0 }}>Shopping Ingredients</h3>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{cart.length} items · {checked.length} checked</div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {cart.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Sort:</span>
                        <select
                          id="cart-sort-select"
                          value={cartSortBy}
                          onChange={(e) => setCartSortBy(e.target.value as any)}
                          style={{
                            background: C.white,
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            padding: "4px 8px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: C.text,
                            outline: "none",
                            cursor: "pointer",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                          }}
                        >
                          <option value="checked">Pending First</option>
                          <option value="alphabetical">Alphabetical</option>
                        </select>
                        <button
                          id="cart-sort-order-btn"
                          onClick={() => setCartSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                          style={{
                            background: C.white,
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            width: 24,
                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            cursor: "pointer",
                            color: C.text,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                          }}
                          title={cartSortOrder === "asc" ? "Ascending Order" : "Descending Order"}
                        >
                          {cartSortOrder === "asc" ? "↑" : "↓"}
                        </button>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 6 }}>
                      {cart.length > 0 && (
                        <button 
                          id="copy-cart-btn"
                          onClick={copyCartToClipboard}
                          style={{
                            background: cartCopied ? C.green : "#FAF6F0", 
                            color: cartCopied ? C.white : C.text, 
                            border: "1px solid #E5DCCF", 
                            borderRadius: 8, 
                            padding: "6px 10px", 
                            fontSize: 10, 
                            fontWeight: 700, 
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            transition: "all 0.15s"
                          }}
                        >
                          📋 {cartCopied ? "Copied!" : "Copy List"}
                        </button>
                      )}
                      {checked.length > 0 && (
                        <button 
                          id="clear-checked-btn"
                          onClick={clearChecked} 
                          style={{ background: C.accent, color: C.white, border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
                        >
                          Clear Checked ({checked.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {cart.length > 0 && (
                  <div style={{
                    background: "#F0F6FF",
                    border: "1px dashed #BFDBFE",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                        🗓️
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 750, color: "#1E3A8A" }}>Sync with Google Tasks</h4>
                        <p style={{ margin: 0, fontSize: 11, color: "#1E40AF" }}>
                          Export your shopping ingredients to your Google Tasks list for mobile checklists!
                        </p>
                      </div>
                    </div>

                    {!googleAccessToken ? (
                      <button
                        id="connect-tasks-cart-btn"
                        onClick={handleConnectGoogleTasks}
                        style={{
                          alignSelf: "flex-start",
                          background: "#2563EB",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 12px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        🔑 Authenticate Google Tasks
                      </button>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 10 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Target Task List</span>
                          {taskLists.length > 0 ? (
                            <select
                              id="task-list-selector"
                              value={selectedTaskListId}
                              onChange={(e) => setSelectedTaskListId(e.target.value)}
                              style={{
                                background: "#FFFFFF",
                                border: "1px solid #CBD5E1",
                                borderRadius: 8,
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#334155"
                              }}
                            >
                              {taskLists.map(list => (
                                <option key={list.id} value={list.id}>{list.title}</option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ fontSize: 11, color: "#64748B", fontStyle: "italic" }}>
                              Loading your Task Lists...
                            </span>
                          )}
                        </div>

                        <button
                          id="export-tasks-cart-btn"
                          onClick={handleExportCartToGoogleTasks}
                          disabled={exportingTasksCart || cart.length === 0}
                          style={{
                            background: "#2563EB",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 14px",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "all 0.15s",
                            opacity: exportingTasksCart ? 0.7 : 1
                          }}
                        >
                          {exportingTasksCart ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "🚀"} 
                          Export {cart.length} items to Tasks
                        </button>
                      </div>
                    )}

                    {tasksMessage && (
                      <div style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: tasksMessage.startsWith("✓") ? "#15803D" : "#B91C1C",
                        background: tasksMessage.startsWith("✓") ? "#DCFCE7" : "#FEE2E2",
                        padding: "8px 12px",
                        borderRadius: 8,
                        marginTop: 4
                      }}>
                        {tasksMessage}
                      </div>
                    )}
                  </div>
                )}

                {cart.length > 0 && (
                  <div style={{
                    background: "#F0FDF4",
                    border: "1px dashed #BBF7D0",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                        🛒
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 750, color: "#166534" }}>Order Pending Ingredients</h4>
                        <p style={{ margin: 0, fontSize: 11, color: "#15803D" }}>
                          Connect your ingredients list directly to major online grocery markets to order items in bulk!
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      <a
                        id="shop-instacart-btn"
                        href={`https://www.instacart.com/store/s?k=${encodeURIComponent(cart.filter(item => !checked.includes(item)).join(", "))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none",
                          background: "#10B981",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 12px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}
                      >
                        🥕 Shop Pending on Instacart
                      </a>

                      <a
                        id="shop-amazon-btn"
                        href={`https://www.amazon.com/s?k=${encodeURIComponent(cart.filter(item => !checked.includes(item)).join(" "))}&i=amazonfresh`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none",
                          background: "#232F3E",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 12px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}
                      >
                        📦 Shop Pending on Amazon Fresh
                      </a>

                      <a
                        id="shop-walmart-btn"
                        href={`https://www.walmart.com/search?q=${encodeURIComponent(cart.filter(item => !checked.includes(item)).join(" "))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none",
                          background: "#0071CE",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 12px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}
                      >
                        💙 Shop Pending on Walmart
                      </a>
                    </div>
                  </div>
                )}

                {cart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px", color: C.muted }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>🛒</div>
                    <div style={{ fontSize: 14, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.text, marginBottom: 4 }}>Cart list is empty</div>
                    <div style={{ fontSize: 11, lineHeight: 1.4 }}>Open any generated recipe detail card and add missing items to cart.</div>
                  </div>
                ) : (() => {
                  const sortedCart = [...cart].sort((a, b) => {
                    if (cartSortBy === "checked") {
                      const isAChecked = checked.includes(a);
                      const isBChecked = checked.includes(b);
                      if (isAChecked && !isBChecked) return cartSortOrder === "asc" ? 1 : -1;
                      if (!isAChecked && isBChecked) return cartSortOrder === "asc" ? -1 : 1;
                    }
                    // alphabetical within status OR if sorting alphabetically globally
                    return cartSortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a);
                  });

                  return (
                    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                      {sortedCart.map((item, i) => (
                        <div 
                          key={item} 
                          onClick={() => toggleCheck(item)} 
                          style={{
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12, 
                            padding: "10px 14px",
                            borderBottom: i < sortedCart.length - 1 ? `1px solid ${C.border}` : "none",
                            cursor: "pointer", 
                            transition: "background 0.15s",
                            background: checked.includes(item) ? "#FAF8F4" : C.white,
                          }}
                        >
                          <div 
                            style={{
                              width: 18, 
                              height: 18, 
                              borderRadius: 6, 
                              border: `2px solid ${checked.includes(item) ? C.green : "#CBD5E1"}`,
                              background: checked.includes(item) ? C.green : "none",
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center", 
                              flexShrink: 0, 
                              transition: "all 0.15s",
                            }}
                          >
                            {checked.includes(item) && (
                              <span style={{ color: C.white, fontSize: 11, fontWeight: 900 }}>✓</span>
                            )}
                          </div>
                          
                          <span style={{ fontSize: 13, color: checked.includes(item) ? C.muted : C.text, textDecoration: checked.includes(item) ? "line-through" : "none", flex: 1, textTransform: "capitalize", fontWeight: 600 }}>
                            {item}
                          </span>

                          {/* Quick Market Shortcuts */}
                          <div 
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 4 
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent completing item checkbox on badge click
                          >
                            <a
                              href={`https://www.instacart.com/store/s?k=${encodeURIComponent(item)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                textDecoration: "none",
                                fontSize: 10,
                                background: "#E8F5E9",
                                color: "#2E7D32",
                                border: "1px solid #A5D6A7",
                                borderRadius: 4,
                                padding: "2px 6px",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                transition: "transform 0.1s"
                              }}
                              title={`Buy "${item}" on Instacart`}
                              className="hover:scale-105 active:scale-95"
                            >
                              🥕 Buy
                            </a>
                            <a
                              href={`https://www.amazon.com/s?k=${encodeURIComponent(item)}&i=amazonfresh`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                textDecoration: "none",
                                fontSize: 10,
                                background: "#FFF3E0",
                                color: "#E65100",
                                border: "1px solid #FFCC80",
                                borderRadius: 4,
                                padding: "2px 6px",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                transition: "transform 0.1s"
                              }}
                              title={`Buy "${item}" on Amazon`}
                              className="hover:scale-105 active:scale-95"
                            >
                              📦 Fresh
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* HISTORY JOURNAL TAB */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 850, color: C.text, margin: 0 }}>My Cooking Journal</h3>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      {history.length} Gourmet dishes prepared · {(() => {
                        const rated = history.filter(h => h.rating > 0);
                        return rated.length ? `★ ${(rated.reduce((sum, h) => sum + h.rating, 0) / rated.length).toFixed(1)} Avg Rating` : "No ratings yet";
                      })()}
                    </div>
                  </div>
                  {history.length > 0 && (
                    <button 
                      id="clear-history-btn"
                      onClick={clearHistory} 
                      style={{ 
                        background: "#F1EBE0", 
                        color: C.text, 
                        border: "1px solid #E5DCCF", 
                        borderRadius: 8, 
                        padding: "6px 12px", 
                        fontSize: 10, 
                        fontWeight: 700, 
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      🗑️ Clear Log
                    </button>
                  )}
                </div>

                {/* Cooked Stats Dashboard Block */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 8, marginBottom: 16 }}>
                  <div style={{ background: "#E6F4EC", border: "1px solid #C2E7D1", borderRadius: 14, padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: 18 }}>🍳</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginTop: 2 }}>{history.length}</div>
                    <div style={{ fontSize: 8, color: C.green, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1 }}>Total Cooked</div>
                  </div>
                  <div style={{ background: "#FFF9F2", border: "1px solid #FCDFD0", borderRadius: 14, padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: 18 }}>⭐</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.accent, marginTop: 2 }}>
                      {(() => {
                        const score = history.filter(h => h.rating > 0);
                        return score.length ? (score.reduce((acc, h) => acc + h.rating, 0) / score.length).toFixed(1) : "-.-";
                      })()}
                    </div>
                    <div style={{ fontSize: 8, color: C.accent, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1 }}>Avg Rating</div>
                  </div>
                  <div style={{ background: "#FAF8F4", border: `1px solid ${C.border}`, borderRadius: 14, padding: "10px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 8, color: C.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>Favorite Dish</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.text, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={(() => {
                      if (!history.length) return "None yet";
                      const counts: Record<string, number> = {};
                      history.forEach(h => { counts[h.recipeName] = (counts[h.recipeName] || 0) + 1; });
                      const fav = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
                      return fav ? fav[0] : "None yet";
                    })()}>
                      {(() => {
                        if (!history.length) return "None yet";
                        const counts: Record<string, number> = {};
                        history.forEach(h => { counts[h.recipeName] = (counts[h.recipeName] || 0) + 1; });
                        const fav = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
                        return fav ? fav[0] : "None yet";
                      })()}
                    </div>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px", color: C.muted }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>📖</div>
                    <div style={{ fontSize: 14, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.text, marginBottom: 4 }}>No cooked entries yet</div>
                    <div style={{ fontSize: 11, lineHeight: 1.4 }}>When you prepare any recipe, hit the "🍳 Cooked this!" button in the recipe card details to preserve your customized logs here!</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {history.map((item, idx) => {
                      const cookedDate = new Date(item.cookedAt);
                      const timeStr = cookedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const dateStr = cookedDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                      const matchInPool = [...recipes, ...savedRecipes].find(r => r.name.toLowerCase() === item.recipeName.toLowerCase());

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                          className="hover:shadow-md transition-shadow"
                          style={{
                            background: C.white,
                            borderRadius: 16,
                            padding: "12px 14px",
                            border: `1px solid ${C.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                            <span style={{ fontSize: 28, background: "#FAF6F0", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #FAF1E6", flexShrink: 0 }}>
                              {item.recipeEmoji}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <h4 
                                onClick={() => {
                                  if (matchInPool) {
                                    setSelectedRecipe(matchInPool);
                                  }
                                }}
                                style={{ 
                                  fontFamily: "'Playfair Display', serif", 
                                  fontSize: 14, 
                                  fontWeight: 900, 
                                  color: C.text, 
                                  margin: 0,
                                  cursor: matchInPool ? "pointer" : "default"
                                }} 
                                className={`truncate ${matchInPool ? "hover:underline hover:text-[#2B6B44]" : ""}`}
                                title={matchInPool ? "Click to view full recipe details" : item.recipeName}
                              >
                                {item.recipeName}
                              </h4>
                              
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                                <span style={{ fontSize: 9, color: C.muted, fontWeight: 700, fontFamily: "monospace" }}>
                                  📅 {dateStr} at {timeStr}
                                </span>
                                {item.rating > 0 && (
                                  <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 800, background: "#FFFBEB", border: "1px solid #FDE68A", padding: "1px 5px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 2 }}>
                                    ★ {item.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                            {matchInPool ? (
                              <button
                                onClick={() => setSelectedRecipe(matchInPool)}
                                style={{
                                  background: "#FAF6F0",
                                  color: C.green,
                                  border: "1px solid #C2E7D1",
                                  borderRadius: 8,
                                  padding: "4px 8px",
                                  fontSize: 10,
                                  fontWeight: 800,
                                  cursor: "pointer",
                                  transition: 'all 0.1s'
                                }}
                                className="active:scale-95 hover:bg-[#E6F4EC]"
                              >
                                📖 Recipe
                              </button>
                            ) : (
                              <span style={{ fontSize: 9, color: C.muted, fontWeight: 700, fontStyle: "italic", background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "3px 6px", borderRadius: 6 }}>
                                Logged
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FILTER BOTTOM DRAWER */}
      <AnimatePresence>
        {filterOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            {/* Overlay background exit blocker */}
            <div onClick={() => setFilterOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }} />
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              style={{ 
                position: "relative", 
                background: C.white, 
                borderRadius: "24px 24px 0 0", 
                padding: "20px 20px 32px", 
                maxHeight: "80vh", 
                overflowY: "auto",
                borderTop: `1px solid ${C.border}`,
                boxShadow: "0 -4px 20px rgba(0,0,0,0.06)"
              }}
              className="scrollbar-thin"
            >
              <div style={{ width: 36, height: 4, background: "#CBD5E1", borderRadius: 2, margin: "0 auto 16px" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: C.text }}>Cook Settings</div>
                <button 
                  onClick={() => setFilters({ dietary: [], time: null, difficulty: null, cuisine: null })} 
                  style={{ background: "none", border: "none", fontSize: 12, cursor: "pointer", color: C.accent, fontWeight: 700 }}
                >
                  Reset all
                </button>
              </div>

              <FilterSection title="Dietary Needs">
                {DIETARY.map(d => {
                  const sel = filters.dietary.includes(d);
                  return (
                    <FilterChip 
                      key={d} 
                      label={d} 
                      selected={sel} 
                      onClick={() => setFilters(p => ({ ...p, dietary: sel ? p.dietary.filter(x => x !== d) : [...p.dietary, d] }))} 
                    />
                  );
                })}
              </FilterSection>

              <FilterSection title="Maximum Prep & Cook duration">
                {TIMES.map(t => (
                  <FilterChip 
                    key={t} 
                    label={`${t} min`} 
                    selected={filters.time === t} 
                    onClick={() => setFilters(p => ({ ...p, time: p.time === t ? null : t }))} 
                  />
                ))}
              </FilterSection>

              <FilterSection title="Difficulty Rank">
                {DIFFS.map(d => (
                  <FilterChip 
                    key={d} 
                    label={d} 
                    selected={filters.difficulty === d} 
                    onClick={() => setFilters(p => ({ ...p, difficulty: (p.difficulty === d ? null : d as Difficulty) }))} 
                  />
                ))}
              </FilterSection>

              <FilterSection title="Cuisines Style">
                {CUISINES.map(c => (
                  <FilterChip 
                    key={c} 
                    label={c} 
                    selected={filters.cuisine === c} 
                    onClick={() => setFilters(p => ({ ...p, cuisine: p.cuisine === c ? null : c }))} 
                  />
                ))}
              </FilterSection>

              <button 
                onClick={() => setFilterOpen(false)} 
                style={{
                  width: "100%", 
                  background: C.primary, 
                  color: C.white, 
                  border: "none", 
                  borderRadius: 12,
                  padding: "13px", 
                  fontSize: 13, 
                  fontWeight: 700, 
                  cursor: "pointer", 
                  marginTop: 14,
                }}
              >
                Apply Active Filters {filterCount > 0 ? `(${filterCount})` : ""}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KITCHEN TIMER OVERLAY DRAWER */}
      <AnimatePresence>
        {timerOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 120, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            {/* Background Backdrop */}
            <div onClick={() => setTimerOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              style={{ 
                position: "relative", 
                background: C.white, 
                borderRadius: "28px 28px 0 0", 
                padding: "24px 24px 36px", 
                maxHeight: "85vh", 
                overflowY: "auto",
                borderTop: `1px solid ${C.border}`,
                boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
                color: C.text
              }}
            >
              <div style={{ width: 40, height: 4, background: "#CBD5E1", borderRadius: 2, margin: "0 auto 20px" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 24 }}>⏱️</span>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 950, color: C.text, margin: 0 }}>Gourmet Kitchen Timer</h3>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Never overcook key ingredients</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTimerOpen(false)} 
                  style={{ background: "#FAF6F0", border: "1px solid #E5DCCF", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: "bold" }}
                >
                  ✕
                </button>
              </div>

              {/* ACTIVE ALARM BANNER */}
              {isAlarmRinging && (
                <div style={{ background: "#FEE2E2", border: "2px solid #F87171", borderRadius: 20, padding: "16px 20px", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.1)" }}>
                  <span style={{ fontSize: 36 }} className="animate-bounce">🔔</span>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: "#991B1B", marginTop: 8, marginBottom: 4 }}>Chef's Timer Completed!</div>
                  <p style={{ fontSize: 12, color: "#7F1D1D", margin: "0 0 12px 0", textAlign: "center", fontWeight: 500 }}>Your gourmet dish is completed and ready for processing!</p>
                  <button
                    onClick={handleStopAlarm}
                    style={{
                      background: "#DC2626",
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      padding: "10px 24px",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      width: "100%",
                      boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5
                    }}
                  >
                    🔇 Stop Active Alarm
                  </button>
                </div>
              )}

              {/* TIMER DISPLAY GRAPHIC */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "24px 0" }}>
                <div 
                  style={{ 
                    position: "relative", 
                    width: 170, 
                    height: 170, 
                    borderRadius: "50%", 
                    background: isAlarmRinging 
                      ? "#FEF2F2" 
                      : (timerActive && timerSeconds > 0 ? `${C.accent}0a` : "#FAF8F4"), 
                    border: isAlarmRinging 
                      ? "6px solid #EF4444" 
                      : `6px solid ${timerSeconds === 0 && timerTotal > 0 ? C.accent : "#EEDECA"}`,
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center",
                    boxShadow: "inset 0 4px 10px rgba(0,0,0,0.02), 0 4px 18px rgba(0,0,0,0.02)",
                  }}
                  className={isAlarmRinging ? "animate-pulse" : ""}
                >
                  {timerSeconds === 0 && timerTotal > 0 && !isAlarmRinging && (
                    <div style={{ fontSize: 11, color: C.accent, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                      Ding! Done 🍳
                    </div>
                  )}

                  {isAlarmRinging && (
                    <div style={{ fontSize: 11, color: "#DC2626", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                      ALERT! 🔔
                    </div>
                  )}

                  <div style={{ fontSize: 38, fontWeight: 900, fontFamily: "monospace", color: isAlarmRinging ? "#DC2626" : (timerSeconds > 0 ? C.text : C.muted), letterSpacing: -1 }}>
                    {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, "0")}
                  </div>

                  <div style={{ fontSize: 11, color: isAlarmRinging ? "#B91C1C" : C.muted, marginTop: 4, fontWeight: 600 }}>
                    {isAlarmRinging ? "Ringing..." : (timerActive ? "Active" : "Paused")}
                  </div>
                </div>
              </div>

              {/* ALARM RINGTONE SELECTOR */}
              <div style={{ marginBottom: 24, background: "#FAF8F4", padding: 14, borderRadius: 20, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 6 }}>
                  🔔 Alarm Sound Ringtone
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { id: "chime", name: "Celestial Chimes 🔔" },
                    { id: "digital", name: "Classic Beeps 📢" },
                    { id: "whistle", name: "Chef Whistle 🍲" },
                    { id: "zen", name: "Zen Bowl Sing 🧘" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleChangeRingtone(t.id)}
                      style={{
                        background: ringtone === t.id ? C.primary : "white",
                        color: ringtone === t.id ? "white" : C.text,
                        border: `1px solid ${ringtone === t.id ? C.primary : "#E2E8F0"}`,
                        borderRadius: 12,
                        padding: "8px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transition: "all 0.15s"
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 10, textAlign: "center", fontStyle: "italic", fontWeight: 500 }}>
                  Tap any preset to hear a quick live audio preview!
                </div>
              </div>

              {/* TIMER QUICK PRESETS */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace", textAlign: "center" }}>
                  Quick Preset Minutes
                </div>
                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
                  {[1, 3, 5, 8, 10, 15, 20].map(m => (
                    <button 
                      key={m}
                      onClick={() => {
                        handleStopAlarm();
                        setTimerSeconds(m * 60);
                        setTimerTotal(m * 60);
                        setTimerActive(true);
                      }}
                      style={{
                        background: timerTotal === m * 60 ? C.primary : "#FAF6F0",
                        color: timerTotal === m * 60 ? C.white : C.text,
                        border: "1px solid #E5DCCF",
                        borderRadius: 14,
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {m} Min
                    </button>
                  ))}
                </div>
              </div>

              {/* CONTROLS AREA */}
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button 
                  onClick={() => {
                    setTimerSeconds(0);
                    setTimerTotal(0);
                    setTimerActive(false);
                    handleStopAlarm();
                  }}
                  disabled={timerSeconds === 0 && !isAlarmRinging}
                  style={{
                    flex: 1,
                    background: "#F1EBE0",
                    color: C.text,
                    border: "none",
                    borderRadius: 12,
                    padding: "12px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: (timerSeconds === 0 && !isAlarmRinging) ? "not-allowed" : "pointer"
                  }}
                >
                  Reset
                </button>

                <button 
                  onClick={() => {
                    if (isAlarmRinging) {
                      handleStopAlarm();
                    } else {
                      setTimerActive(!timerActive);
                    }
                  }}
                  disabled={timerSeconds === 0 && !isAlarmRinging}
                  style={{
                    flex: 2,
                    background: isAlarmRinging ? "#DC2626" : (timerActive ? C.accent : C.green),
                    color: C.white,
                    border: "none",
                    borderRadius: 12,
                    padding: "12px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: (timerSeconds === 0 && !isAlarmRinging) ? "not-allowed" : "pointer",
                    boxShadow: isAlarmRinging ? "0 4px 14px rgba(220, 38, 38, 0.3)" : "none"
                  }}
                >
                  {isAlarmRinging ? "Stop Alarm Ringtone 🔔" : (timerActive ? "Pause Timer" : "Start Timer")}
                </button>
              </div>

              {/* MANUAL ADJUST SLIDERS */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
                <button 
                  onClick={() => {
                    const extra = Math.max(0, timerSeconds - 30);
                    setTimerSeconds(extra);
                    if (extra === 0) setTimerActive(false);
                  }}
                  disabled={timerSeconds === 0}
                  style={{ background: "#FAF8F4", border: "1px solid #CBD5E1", fontSize: 11, padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}
                >
                  -30s
                </button>
                <button 
                  onClick={() => {
                    setTimerSeconds(prev => prev + 30);
                    setTimerTotal(prev => prev + 30);
                  }}
                  style={{ background: "#FAF8F4", border: "1px solid #CBD5E1", fontSize: 11, padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}
                >
                  +30s
                </button>
                <button 
                  onClick={() => {
                    setTimerSeconds(prev => prev + 300);
                    setTimerTotal(prev => prev + 300);
                  }}
                  style={{ background: "#FAF8F4", border: "1px solid #CBD5E1", fontSize: 11, padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}
                >
                  +5m
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED INTERACTIVE MULTI-STEP RECIPE MANUAL MODAL */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeDetailModal
            recipe={selectedRecipe}
            isSaved={isSaved(selectedRecipe)}
            onToggleSave={() => handleToggleSave(selectedRecipe)}
            onAddMissingToCart={(missingItems) => {
              addToCart(missingItems);
              setActiveTab("shopping");
              setSelectedRecipe(null);
            }}
            onStartTimer={(seconds) => {
              setTimerSeconds(seconds);
              setTimerTotal(seconds);
              setTimerActive(true);
              setTimerOpen(true);
            }}
            userRating={ratings[selectedRecipe.name] || 0}
            onRateRecipe={(rating) => handleRateRecipe(selectedRecipe.name, rating)}
            onLogCooked={() => handleLogCooked(selectedRecipe)}
            cookCount={getCookCount(selectedRecipe.name)}
            onAddToTasks={handleAddRecipeToGoogleTasks}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// RECIPE SINGLE ROW CARD
function RecipeCard({ 
  r, 
  isSaved, 
  toggleSave, 
  onOpen,
  rating = 0
}: { 
  r: AIRecipe; 
  isSaved: boolean; 
  toggleSave: () => void; 
  onOpen: () => void;
  rating?: number;
  key?: any;
}) {
  return (
    <motion.div 
      onClick={onOpen}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ 
        y: -4, 
        borderColor: "#E5DCCF",
        boxShadow: "0 12px 24px -10px rgba(30, 61, 47, 0.12), 0 4px 12px -2px rgba(30, 61, 47, 0.04)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 24,
        mass: 0.8
      }}
      style={{
        background: C.white,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 30, background: "#FDFBF7", padding: "8px", borderRadius: 12, border: "1px solid #FAF4EB", display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0 }}>
        {r.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 900, color: C.text, marginBottom: 2 }} className="truncate">
          {r.name}
        </div>
        {rating > 0 && (
          <div style={{ display: "flex", gap: 2.5, alignItems: "center", marginBottom: 4 }} title={`My rating: ${rating}/5`}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <span 
                key={idx} 
                style={{ 
                  color: idx < rating ? "#F59E0B" : "#E2E8F0", 
                  fontSize: 12, 
                  lineHeight: 1,
                  textShadow: "0 1px 0 rgba(0,0,0,0.05)"
                }}
              >
                ★
              </span>
            ))}
          </div>
        )}
        <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginBottom: 6 }} className="truncate">
          "{r.desc}"
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#FAF6F0", color: C.muted, fontWeight: 700, border: "1px solid #F0E8DD" }}>⏱ {r.time}m</span>
          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#FAF6F0", color: C.muted, fontWeight: 700, border: "1px solid #F0E8DD" }}>👨‍🍳 {r.difficulty}</span>
          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#FAF6F0", color: C.muted, fontWeight: 700, border: "1px solid #F0E8DD" }}>🧠 {r.cuisine}</span>
        </div>
        
        {/* have vs missing checklist status & YouTube */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: C.lightGreen, padding: "1px 6px", borderRadius: 8 }}>✓ {r.used?.length || 0} have</span>
            {r.missing?.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: C.orange, padding: "1px 6px", borderRadius: 8 }}>🛒 {r.missing.length} need</span>
            )}
          </div>
          
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(r.youtubeQuery || `how to cook ${r.name} tutorial`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              fontWeight: 800,
              color: "white",
              background: "#FF0000",
              padding: "4px 10px",
              borderRadius: 10,
              textDecoration: "none",
              boxShadow: "0 2px 4px rgba(255, 0, 0, 0.15)",
              transition: "transform 0.1s"
            }}
            className="hover:scale-105 active:scale-95 hover:bg-[#CC0000]"
          >
            <span>▶</span> Watch Guide
          </a>
        </div>
      </div>
      
      {/* Heart quick-action */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleSave();
        }}
        style={{
          background: "none",
          border: "none",
          fontSize: 16,
          cursor: "pointer",
          padding: 6,
          color: isSaved ? C.accent : C.muted,
          position: "absolute",
          top: 8,
          right: 8,
        }}
        className="active:scale-95"
      >
        {isSaved ? "❤️" : "🤍"}
      </button>
    </motion.div>
  );
}

// REUSABLE SUB-SECTION HELPER FOR FILTER
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{children}</div>
    </div>
  );
}

// REUSABLE FILTER CHIP PILLS
function FilterChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void; key?: any }) {
  return (
    <button 
      onClick={onClick}
      style={{
        background: selected ? C.primary : "#FAF6F0",
        color: selected ? C.white : C.text,
        border: selected ? "none" : "1px solid #E5DCCF",
        borderRadius: 20,
        padding: "5px 12px",
        fontSize: 11,
        cursor: "pointer",
        fontWeight: selected ? 700 : 500,
        transition: "all 0.15s",
        outline: "none"
      }}
    >
      {label}
    </button>
  );
}
