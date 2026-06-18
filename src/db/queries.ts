import { db } from './index.ts';
import { users, savedRecipes, cartItems, cookingHistory, pantryIngredients } from './schema.ts';
import { eq, and } from 'drizzle-orm';
import { CookingHistoryItem } from '../types.ts';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db.insert(users)
      .values({ uid, email })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to get/create user:", error);
    throw new Error("Failed to authenticate user database profile.", { cause: error });
  }
}

export async function getUserData(userId: number) {
  try {
    const saved = await db.select().from(savedRecipes).where(eq(savedRecipes.userId, userId));
    const cart = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    const history = await db.select().from(cookingHistory).where(eq(cookingHistory.userId, userId));
    const pantry = await db.select().from(pantryIngredients).where(eq(pantryIngredients.userId, userId));

    return {
      savedRecipes: saved.map(r => ({
        id: r.apiRecipeId,
        name: r.name,
        emoji: r.emoji || "🍽️",
        allIngs: r.allIngs as string[] || [],
        used: r.used as string[] || [],
        missing: r.missing as string[] || [],
        instructions: r.instructions as string[] || [],
        time: r.prepTime ? parseInt(r.prepTime) : 30,
        difficulty: r.difficulty || "Medium",
        cuisine: r.cuisine || "International",
        youtubeQuery: r.youtubeQuery || ""
      })),
      cart: cart.map(c => c.ingredient),
      history: history.map(h => ({
        id: h.id,
        recipeName: h.recipeName,
        recipeEmoji: h.recipeEmoji || "🍽️",
        cookedAt: h.cookedAt.toISOString(),
        rating: h.rating,
        ingredientsCount: h.ingredientsCount
      })),
      pantry: pantry.map(p => p.ingredient)
    };
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    throw new Error("Failed to load user account details from Cloud SQL.", { cause: error });
  }
}

export async function syncPantry(userId: number, ingredients: string[]) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(pantryIngredients).where(eq(pantryIngredients.userId, userId));
      if (ingredients.length > 0) {
        await tx.insert(pantryIngredients).values(
          ingredients.map(ing => ({ userId, ingredient: ing }))
        );
      }
    });
  } catch (error) {
    console.error("Failed to sync pantry:", error);
    throw new Error("Failed to update kitchen pantry list.", { cause: error });
  }
}

export async function saveRecipe(userId: number, recipe: any) {
  try {
    await db.insert(savedRecipes)
      .values({
        userId,
        apiRecipeId: recipe.id.toString(),
        name: recipe.name,
        emoji: recipe.emoji || "🍽️",
        allIngs: recipe.allIngs,
        used: recipe.used,
        missing: recipe.missing,
        instructions: recipe.instructions || recipe.steps,
        prepTime: recipe.time ? recipe.time.toString() : null,
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        youtubeQuery: recipe.youtubeQuery
      })
      .onConflictDoNothing();
  } catch (error) {
    console.error("Failed to save recipe:", error);
    throw new Error("Failed to bookmark recipe to your account.", { cause: error });
  }
}

export async function deleteRecipe(userId: number, apiRecipeId: string) {
  try {
    await db.delete(savedRecipes).where(
      and(
        eq(savedRecipes.userId, userId),
        eq(savedRecipes.apiRecipeId, apiRecipeId)
      )
    );
  } catch (error) {
    console.error("Failed to delete saved recipe:", error);
    throw new Error("Failed to remove saved recipe.", { cause: error });
  }
}

export async function syncCart(userId: number, items: string[]) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(cartItems).where(eq(cartItems.userId, userId));
      if (items.length > 0) {
        await tx.insert(cartItems).values(
          items.map(item => ({ userId, ingredient: item }))
        );
      }
    });
  } catch (error) {
    console.error("Failed to sync cart items:", error);
    throw new Error("Failed to update shopping cart.", { cause: error });
  }
}

export async function addHistory(userId: number, hItem: CookingHistoryItem) {
  try {
    await db.insert(cookingHistory)
      .values({
        id: hItem.id,
        userId,
        recipeName: hItem.recipeName,
        recipeEmoji: hItem.recipeEmoji,
        cookedAt: new Date(hItem.cookedAt),
        rating: hItem.rating,
        ingredientsCount: hItem.ingredientsCount
      })
      .onConflictDoNothing();
  } catch (error) {
    console.error("Failed to add cooking log history:", error);
    throw new Error("Failed to register cooking log entry.", { cause: error });
  }
}

export async function clearHistory(userId: number) {
  try {
    await db.delete(cookingHistory).where(eq(cookingHistory.userId, userId));
  } catch (error) {
    console.error("Failed to clear cooking history:", error);
    throw new Error("Failed to clear cooking history log.", { cause: error });
  }
}
