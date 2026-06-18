import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const savedRecipes = pgTable('saved_recipes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  apiRecipeId: text('api_recipe_id').notNull(),
  name: text('name').notNull(),
  emoji: text('emoji'),
  allIngs: jsonb('all_ings'), // Array of strings
  used: jsonb('used'), // Array of strings
  missing: jsonb('missing'), // Array of strings
  instructions: jsonb('instructions'), // Array of strings
  prepTime: text('prep_time'),
  difficulty: text('difficulty'),
  cuisine: text('cuisine'),
  youtubeQuery: text('youtube_query'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  ingredient: text('ingredient').notNull(),
  checked: boolean('checked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cookingHistory = pgTable('cooking_history', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  recipeName: text('recipe_name').notNull(),
  recipeEmoji: text('recipe_emoji'),
  cookedAt: timestamp('cooked_at').notNull(),
  rating: integer('rating').default(0).notNull(),
  ingredientsCount: integer('ingredients_count').default(0).notNull(),
});

export const pantryIngredients = pgTable('pantry_ingredients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  ingredient: text('ingredient').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  savedRecipes: many(savedRecipes),
  cartItems: many(cartItems),
  cookingHistory: many(cookingHistory),
  pantryIngredients: many(pantryIngredients),
}));

export const savedRecipesRelations = relations(savedRecipes, ({ one }) => ({
  user: one(users, {
    fields: [savedRecipes.userId],
    references: [users.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
}));

export const cookingHistoryRelations = relations(cookingHistory, ({ one }) => ({
  user: one(users, {
    fields: [cookingHistory.userId],
    references: [users.id],
  }),
}));

export const pantryIngredientsRelations = relations(pantryIngredients, ({ one }) => ({
  user: one(users, {
    fields: [pantryIngredients.userId],
    references: [users.id],
  }),
}));
