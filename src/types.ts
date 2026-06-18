export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface MealDetail extends MealSummary {
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strTags?: string;
  strYoutube?: string;
  strSource?: string;
  [key: string]: string | undefined; // strIngredient1-20 / strMeasure1-20
}

export interface IngredientMeasure {
  ingredient: string;
  measure: string;
}

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface NutritionalInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface AIRecipe {
  id: string; // crypto.randomUUID()
  name: string;
  emoji: string;
  imageUrl?: string;
  time: number;
  difficulty: Difficulty;
  cuisine: string;
  dietaryTags?: string[];
  servings: number;
  desc: string;
  overview: string;
  marketPrice: string;
  youtubeQuery?: string;
  used: string[];
  missing: string[];
  allIngs: string[];
  steps: string[];
  nutritional: NutritionalInfo;
}

export interface FilterState {
  dietary: string[];
  time: number | null;
  difficulty: Difficulty | null;
  cuisine: string | null;
}

export interface CookingHistoryItem {
  id: string;
  recipeName: string;
  recipeEmoji: string;
  cookedAt: string; // ISO string
  rating: number;
  ingredientsCount: number;
}

