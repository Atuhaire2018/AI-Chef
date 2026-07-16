export const COMMON_ALLERGENS = [
  "Dairy",
  "Gluten",
  "Eggs",
  "Nuts",
  "Soy",
  "Shellfish",
  "Fish",
  "Sesame",
] as const;

export type AllergenType = typeof COMMON_ALLERGENS[number];

const ALLERGEN_KEYWORDS: Record<AllergenType, string[]> = {
  Dairy: [
    "milk",
    "cream",
    "butter",
    "cheese",
    "cheddar",
    "mozzarella",
    "parmesan",
    "feta",
    "yogurt",
    "yoghurt",
    "ghee",
    "whey",
    "sour cream",
    "buttermilk",
    "ricotta",
    "mascarpone"
  ],
  Gluten: [
    "wheat",
    "flour",
    "bread",
    "toast",
    "dough",
    "pizza",
    "pita",
    "flatbread",
    "pasta",
    "spaghetti",
    "penne",
    "noodle",
    "noodles",
    "barley",
    "rye",
    "tortilla",
    "pancake",
    "pancakes",
    "soy sauce" // soy sauce usually contains wheat
  ],
  Eggs: [
    "egg",
    "eggs",
    "mayo",
    "mayonnaise",
    "meringue",
    "scrambled"
  ],
  Nuts: [
    "peanut",
    "almond",
    "walnut",
    "cashew",
    "pecan",
    "hazelnut",
    "nuts",
    "pine nut",
    "macadamia",
    "pistachio",
    "nutella"
  ],
  Soy: [
    "soy",
    "tofu",
    "edamame",
    "tempeh",
    "miso"
  ],
  Shellfish: [
    "shrimp",
    "crab",
    "lobster",
    "prawn",
    "prawns",
    "clam",
    "clams",
    "mussel",
    "mussels",
    "oyster",
    "oysters",
    "scallop",
    "scallops"
  ],
  Fish: [
    "salmon",
    "tuna",
    "cod",
    "trout",
    "mackerel",
    "sardine",
    "anchovy",
    "snapper",
    "bass",
    "halibut",
    "tilapia"
  ],
  Sesame: [
    "sesame",
    "tahini",
    "halva"
  ]
};

export function getRecipeAllergens(recipe: { name: string; allIngs: string[] }): AllergenType[] {
  const detected: AllergenType[] = [];
  const fullText = (recipe.name + " " + recipe.allIngs.join(" ")).toLowerCase();

  for (const allergen of COMMON_ALLERGENS) {
    const keywords = ALLERGEN_KEYWORDS[allergen];
    const hasMatch = keywords.some(keyword => {
      // Use boundary check or substring match
      const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, "i");
      return regex.test(fullText);
    });

    if (hasMatch) {
      detected.push(allergen);
    }
  }

  return detected;
}
