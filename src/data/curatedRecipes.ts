export interface CuratedRecipe {
  id: number;
  name: string;
  emoji: string;
  time: number;
  difficulty: "Easy" | "Medium" | "Hard";
  cuisine: string;
  servings: number;
  desc: string;
  overview: string;
  marketPrice: string;
  youtubeQuery: string;
  nutritional: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  allIngs: string[];
  steps: string[];
  keywords: string[];
}

export const CURATED_RECIPES: CuratedRecipe[] = [
  {
    id: 101,
    name: "Classic Scrambled Eggs & Toast",
    emoji: "🍳",
    time: 10,
    difficulty: "Easy",
    cuisine: "Breakfast",
    servings: 2,
    desc: "Perfect, fluffy, cafe-style scrambled eggs served on golden toasted bread.",
    overview: "A classic, foolproof breakfast option. Whisk the eggs with a pinch of salt until uniform before adding to a low-heat buttered pan to ensure tiny, delicate curds.",
    marketPrice: "$1.50 - $2.50",
    youtubeQuery: "How to make creamy gourmet scrambled eggs",
    nutritional: {
      calories: 320,
      protein: "14g",
      carbs: "18g",
      fat: "19g"
    },
    allIngs: [
      "4 fresh Eggs",
      "2 slices of White or Wheat Bread",
      "1 tbsp butter",
      "1 tbsp milk",
      "Pinch of salt and black pepper"
    ],
    steps: [
      "In a medium bowl, crack the eggs and whisk thoroughly with the milk and a pinch of salt.",
      "Melt butter in a non-stick skillet over low-medium heat.",
      "Pour in the egg mixture and let it set slightly, then gently push with a spatula to create curds.",
      "Toast the bread slices until golden brown.",
      "Remove eggs from heat while still slightly glossy. Serve over the warm toast with a sprinkle of pepper."
    ],
    keywords: ["egg", "eggs", "bread", "toast", "butter", "milk"]
  },
  {
    id: 102,
    name: "Classic Pasta Marinara",
    emoji: "🍝",
    time: 20,
    difficulty: "Easy",
    cuisine: "Italian",
    servings: 3,
    desc: "A rich, classic tomato-basil sauce tossed with perfectly al dente spaghetti.",
    overview: "The definition of Italian simplicity. Pure, high-quality crushed tomatoes, sautéed garlic, and fresh basil leaves created a rich sauce without sugar.",
    marketPrice: "$2.50 - $4.00",
    youtubeQuery: "Authentic quick Italian pasta marinara recipe",
    nutritional: {
      calories: 420,
      protein: "11g",
      carbs: "72g",
      fat: "8g"
    },
    allIngs: [
      "250g Spaghetti or Penne Pasta",
      "1 can Crushed Tomatoes",
      "3 cloves Garlic, sliced",
      "2 tbsp Olive Oil",
      "5 fresh Basil leaves",
      "Pendant of Parmesan cheese for garnish"
    ],
    steps: [
      "Bring a large pot of salted water to a rolling boil and cook pasta according to package instructions.",
      "In a pan, heat olive oil over medium-low heat and sauté the garlic slices until fragrant but not brown.",
      "Carefully pour in the crushed tomatoes, stir, and season with salt and pepper. Simmer on low for 12 minutes.",
      "Tear fresh basil leaves into the sauce during the last 2 minutes of simmering.",
      "Drain pasta, reserving a cup of pasta water, then toss the pasta directly in the marinara sauce. Sauté together, adding a splash of pasta water if too dry.",
      "Serve hot garnished with optional parmesan cheese."
    ],
    keywords: ["pasta", "spaghetti", "penne", "tomato", "tomatoes", "garlic", "basil", "parmesan", "cheese", "oil"]
  },
  {
    id: 103,
    name: "Golden Garlic Butter Chicken & Potatoes",
    emoji: "🍗",
    time: 35,
    difficulty: "Medium",
    cuisine: "American",
    servings: 2,
    desc: "Tender pan-seared chicken breast bites and crispy, herb-roasted potato wedges.",
    overview: "A comforting skillet meal that delivers restaurant-quality deep brown crust on chicken and potatoes, combined with aromatic garlic butter sauce.",
    marketPrice: "$5.00 - $7.50",
    youtubeQuery: "Garlic butter chicken and potato skillet tutorial",
    nutritional: {
      calories: 550,
      protein: "38g",
      carbs: "33g",
      fat: "29g"
    },
    allIngs: [
      "2 large Chicken breasts, diced into bite-sized pieces",
      "3 Russet Potatoes, cut into small wedges",
      "3 tbsp butter",
      "4 cloves Garlic, minced",
      "1 tbsp Olive Oil",
      "1 tsp Rosemary or Oregano",
      "Salt and pepper to taste"
    ],
    steps: [
      "Boil the potato wedges in salted water for 5 minutes, then drain and pat dry to ensure crispy edges.",
      "Heat olive oil and 1 tablespoon of butter in a large skillet. Add potatoes, seasoning with salt, pepper, and herbs. Cook until golden brown and crisp, then remove potatoes from pan.",
      "Add another tablespoon of butter. Sauté chicken cubes until lightly browned and cooked through (about 6-8 minutes).",
      "Reduce heat to low, return potato wedges to the skillet, add the remaining butter and minced garlic.",
      "Toss everything together for 2 minutes to cook the garlic, then serve garnished with fresh ground pepper."
    ],
    keywords: ["chicken", "potato", "potatoes", "garlic", "butter", "oil", "rosemary", "oregano"]
  },
  {
    id: 104,
    name: "Classic Egg Fried Rice",
    emoji: "🍚",
    time: 15,
    difficulty: "Easy",
    cuisine: "Asian",
    servings: 2,
    desc: "Fluffy jasmine rice stir-fried with fragrant green onions, savory soy sauce, and scrambled eggs.",
    overview: "An absolute savior of cooked left-over rice. Cold, dry day-old rice absorbs flavor and chars far better than freshly steamed rice in a fiery wok.",
    marketPrice: "$2.00 - $3.50",
    youtubeQuery: "Golden restaurant style egg fried rice",
    nutritional: {
      calories: 380,
      protein: "10g",
      carbs: "58g",
      fat: "11g"
    },
    allIngs: [
      "2 cups Cooked Rice (preferably cold, day-old)",
      "2 large Eggs, beaten",
      "2 sprigs Green Onion (scallions), chopped",
      "2 tbsp Soy sauce",
      "1 tbsp Sesame oil or vegetable oil",
      "1 clove Garlic, minced"
    ],
    steps: [
      "Heat half of the oil in a wok or spacious frying pan over high heat. Add beaten eggs and scramble quickly.",
      "Remove the scrambled eggs while still soft and set aside.",
      "Add the rest of the oil, then sauté minced garlic and whites of the green onions for 30 seconds until fragrant.",
      "Break up the cold rice and toss it into the wok. Stir-fry aggressively, breaking clumps, for 3-4 minutes to heat through.",
      "Pour soy sauce evenly over the rice, toss thoroughly, then return the scrambled eggs to the wok.",
      "Stir-fry for 1 more minute, toss in the green scallion tops, and serve instantly."
    ],
    keywords: ["rice", "egg", "eggs", "onion", "onions", "soy", "garlic", "oil"]
  },
  {
    id: 105,
    name: "Classic Avocado Toast",
    emoji: "🥑",
    time: 8,
    difficulty: "Easy",
    cuisine: "Breakfast",
    servings: 1,
    desc: "Creamy, lemon-kissed avocado spread over thick crusty toasted sourdough toast.",
    overview: "A vibrant, healthy culinary assembly. Selecting perfectly ripe, dark avocados, then adding lemon juice prevents oxidation and preserves a bright green hue.",
    marketPrice: "$2.50 - $4.00",
    youtubeQuery: "How to upgrade avocado toast gourmet style",
    nutritional: {
      calories: 270,
      protein: "6g",
      carbs: "29g",
      fat: "15g"
    },
    allIngs: [
      "1 ripe Avocado",
      "2 slices of Sourdough or Wheat Bread",
      "1 tsp Lemon juice",
      "1 tbsp Olive Oil",
      "Pinch of Chili flakes",
      "Salt and pepper to taste"
    ],
    steps: [
      "Cut the avocado, discard the pit, scoop the flesh into a bowl, and mash gently with lemon juice, salt, and pepper.",
      "Toast your bread slices to optimal crispness.",
      "Drizzle olive oil over the warm toasted slices.",
      "Generously spread the mashed avocado over the toast.",
      "Top with chili flakes and a grind of fresh black pepper. Serve immediately."
    ],
    keywords: ["avocado", "bread", "toast", "lemon", "chili", "oil"]
  },
  {
    id: 106,
    name: "Crispy Pan-Seared Salmon with Lemon Dill",
    emoji: "🍣",
    time: 20,
    difficulty: "Medium",
    cuisine: "Mediterranean",
    servings: 2,
    desc: "Crispy skin salmon tenderly cooked inside, glazed with zesty garlic-lemon butter sauce.",
    overview: "An elegant, high-protein keto staple. Cook skin-side down first on medium-high heat with continuous gentle pressure to get exceptionally crispy skin.",
    marketPrice: "$10.00 - $14.50",
    youtubeQuery: "How to sear salmon perfectly crispy skin",
    nutritional: {
      calories: 460,
      protein: "34g",
      carbs: "3g",
      fat: "32g"
    },
    allIngs: [
      "2 Salmon fillets (with skin)",
      "1 fresh Lemon, juiced",
      "2 tbsp butter",
      "1 clove Garlic, minced",
      "1 bunch Asparagus, trimmed",
      "1 tbsp Olive Oil"
    ],
    steps: [
      "Pat salmon skin absolutely dry with paper towels; season both sides with salt and pepper.",
      "Heat olive oil in a non-stick pan over medium-high heat. Place salmon fillets skin-side down and sear undisturbed for 5 minutes.",
      "Toss the asparagus in the corners of the pan during salmon cooking.",
      "Flip salmon carefully and cook for an additional 2-3 minutes. Remove salmon and asparagus from pan.",
      "Reduce heat to low, melt butter in the same pan, then stir in garlic and lemon juice. Swirl sauce for 1 minute.",
      "Plate the salmon and asparagus, then pour the glorious warm lemon butter glaze over the fish."
    ],
    keywords: ["salmon", "fish", "lemon", "butter", "garlic", "asparagus", "oil"]
  },
  {
    id: 107,
    name: "Classic Grilled Cheese Sandwich",
    emoji: "🥪",
    time: 10,
    difficulty: "Easy",
    cuisine: "American",
    servings: 1,
    desc: "Ultimate comfort food with golden crispy, thoroughly buttered bread wrapping standard melted cheese.",
    overview: "The secret to an exceptionally golden crust is spreading a thin layer of mayonnaise instead of butter on the outside faces before placing it in the pan.",
    marketPrice: "$1.00 - $2.00",
    youtubeQuery: "The ultimate cheese pull grilled cheese recipe",
    nutritional: {
      calories: 390,
      protein: "14g",
      carbs: "30g",
      fat: "22g"
    },
    allIngs: [
      "2 slices of White Bread",
      "3 slices of Cheddar or American Cheese",
      "1 tbsp butter or Mayonnaise"
    ],
    steps: [
      "Spread butter or mayonnaise evenly on one side of each slice of bread.",
      "Place one slice of bread buttered-side down on a cold skillet. Structure cheese slices on top.",
      "Cover with the other bread slice, buttered-side facing up.",
      "Turn heat to medium-low and cook slowly until bread is crisp and golden brown (about 3-4 minutes).",
      "Flip and grill the second side until the bread is perfectly toasted and cheese is completely melted."
    ],
    keywords: ["bread", "cheese", "cheddar", "butter", "mayonnaise"]
  },
  {
    id: 108,
    name: "Hearty Beef Stew & Potatoes",
    emoji: "🍲",
    time: 90,
    difficulty: "Hard",
    cuisine: "French",
    servings: 4,
    desc: "Tender chunks of slow-simmered beef, root vegetables, and potatoes in a rich broth.",
    overview: "A slow-cooked masterpiece. Searing beef cubes first carmelizes their natural sugars, adding depth to the rich onion-broth gravy stew.",
    marketPrice: "$12.00 - $18.00",
    youtubeQuery: "How to make melt in your mouth beef stew",
    nutritional: {
      calories: 490,
      protein: "36g",
      carbs: "28g",
      fat: "18g"
    },
    allIngs: [
      "500g Stewing Beef, chunked",
      "3 Potatoes, peeled and cubed",
      "2 Carrots, sliced",
      "1 large Onion, chopped",
      "3 cups Beef broth",
      "2 tbsp flour",
      "2 cloves Garlic, minced",
      "1 tbsp Olive Oil"
    ],
    steps: [
      "Toss the beef cubes with flour, salt, and pepper.",
      "Heat olive oil in a deep pot and sear beef chunks on high heat until browned. Remove beef.",
      "Add chopped onion and garlic to the pot, sautéing until soft.",
      "Pour in beef broth, scraping the bottom of the pot to release the browned savory bits.",
      "Return beef to the pot, cover, and simmer over low heat for 50 minutes.",
      "Stir in potatoes and carrots. Cover and simmer for another 35 minutes until vegetables are tender and beef is meltingly soft.",
      "Season with salt and pepper before serving."
    ],
    keywords: ["beef", "stew", "potato", "potatoes", "carrot", "carrots", "onion", "onions", "garlic", "flour", "oil"]
  },
  {
    id: 109,
    name: "Classic Fresh Greek Salad",
    emoji: "🥗",
    time: 10,
    difficulty: "Easy",
    cuisine: "Mediterranean",
    servings: 2,
    desc: "A refreshing mixture of firm tomatoes, crisp cucumber, red onion, olives, and premium Feta cheese.",
    overview: "Fresh, simple, and light. Real Greek salads never contain lettuce; instead, they feature chunks of quality tomatoes, cucumbers, tangy olives, and real sheep's milk Feta cheese.",
    marketPrice: "$4.00 - $6.50",
    youtubeQuery: "Authentic traditional Greek Horiatiki salad",
    nutritional: {
      calories: 210,
      protein: "6g",
      carbs: "11g",
      fat: "16g"
    },
    allIngs: [
      "2 juicy Tomatoes, chopped into wedges",
      "1 Cucumber, sliced",
      "1/2 Red Onion, thinly sliced",
      "100g Feta cheese, cubed",
      "10 Black Olives",
      "2 tbsp Olive Oil",
      "1 tbsp Lemon juice"
    ],
    steps: [
      "In a wide bowl, assemble the tomato wedges, cucumber slices, and thin red onion rings.",
      "Add black olives to the vegetable mix.",
      "Place solid Feta cubes on top of the salad.",
      "In a small glass, whisk the olive oil and lemon juice together, then drizzle evenly over the salads.",
      "Sprinkle optional dried oregano on the Feta, and enjoy cold."
    ],
    keywords: ["tomato", "tomatoes", "cucumber", "onion", "cheese", "feta", "olive", "olives", "oil", "lemon"]
  },
  {
    id: 110,
    name: "Gourmet Apple Pork Chops",
    emoji: "🥩",
    time: 25,
    difficulty: "Medium",
    cuisine: "American",
    servings: 2,
    desc: "Thick boneless pork chops cooked to juicy perfection, topped with warm, caramelized apple slices.",
    overview: "Pork chops pair beautifully with sweetness. Simmering apples in butter, cinnamon, and brown sugar creates a luxurious glaze that coats the pan-seared pork chops.",
    marketPrice: "$6.00 - $9.00",
    youtubeQuery: "Pan seared pork chops with cinnamon apples",
    nutritional: {
      calories: 480,
      protein: "31g",
      carbs: "22g",
      fat: "24g"
    },
    allIngs: [
      "2 Pork chops (boneless)",
      "1 Apple, cored and sliced thin",
      "2 tbsp butter",
      "1 tbsp Olive Oil",
      "1 tbsp Brown sugar",
      "Pinch of Cinnamon"
    ],
    steps: [
      "Season pork chops with salt, pepper, and olive oil.",
      "Heat oil in a heavy skillet and sear the pork chops for 4-5 minutes on each side until fully cooked. Set chops aside to rest.",
      "Melt butter in the same warm skillet on low-medium. Add apple slices, cinnamon, and brown sugar.",
      "Sauté apples gently for 5 minutes until soft and caramelized.",
      "Plate the chops, spoon the spiced sweet apples on top, and pour residual skillet butter over both."
    ],
    keywords: ["pork", "chop", "chops", "apple", "apples", "butter", "oil", "sugar", "cinnamon"]
  },
  {
    id: 111,
    name: "Creamy Garlic Parmesan Mushroom Pasta",
    emoji: "🍄",
    time: 20,
    difficulty: "Easy",
    cuisine: "Italian",
    servings: 2,
    desc: "Rich, velvety mushroom and cream sauce tossed with penne and heaps of parmesan.",
    overview: "An effortless cream-based vegetarian pasta. Dry sautéing sliced mushrooms draws out moisture first, which intensifies their earthiness before adding cream.",
    marketPrice: "$3.50 - $5.50",
    youtubeQuery: "Creamy garlic parmesan mushroom pasta recipe",
    nutritional: {
      calories: 520,
      protein: "14g",
      carbs: "62g",
      fat: "24g"
    },
    allIngs: [
      "200g Penne Pasta",
      "150g Mushrooms, sliced",
      "1/2 cup Heavy Cream (or milk)",
      "2 tbsp butter",
      "3 cloves Garlic, minced",
      "1/2 cup Parmesan cheese, grated",
      "Fresh parsley for presentation"
    ],
    steps: [
      "Cook penne in a pot of heavily salted boiling water until al dente.",
      "In a separate pan, melt butter and sauté sliced mushrooms on medium-high until lightly browned (about 5 minutes).",
      "Lower heat, stir in minced garlic, and toss for 1 minute.",
      "Pour in the heavy cream and let it bubble block gently for 2 minutes.",
      "Toss the hot drained pasta into the sauce, sprinkle the grated parmesan cheese and vigorously stir to form a silky cream emulsion.",
      "Garnish with chopped fresh parsley before serving."
    ],
    keywords: ["pasta", "penne", "mushroom", "mushrooms", "cream", "milk", "butter", "garlic", "parmesan", "cheese"]
  },
  {
    id: 112,
    name: "Gourmet Hummus & Olive Plate",
    emoji: "🧆",
    time: 10,
    difficulty: "Easy",
    cuisine: "Mediterranean",
    servings: 2,
    desc: "Rich, smooth, homemade garlic hummus drizzled with olive oil, served with olives and flatbread.",
    overview: "A Middle-Eastern high-fiber plate. Blending canned chickpeas with garlic, lemon, and rich sesame tahini yields a restaurant-tier dipping hummus.",
    marketPrice: "$3.00 - $4.50",
    youtubeQuery: "Perfect creamy homemade hummus recipe",
    nutritional: {
      calories: 310,
      protein: "9g",
      carbs: "34g",
      fat: "17g"
    },
    allIngs: [
      "1 can Chickpeas, drained and rinsed",
      "2 tbsp Tahini",
      "2 tbsp Lemon juice",
      "2 tbsp Olive Oil",
      "1 clove Garlic",
      "10 black Olives",
      "Warm Pita or flat bread"
    ],
    steps: [
      "In a food processor or reliable blender, blend the chickpea kernels, garlic, lemon juice, salt, and tahini until extremely smooth.",
      "Slowly stream in 1 tablespoon of olive oil while blending to create an emulsion.",
      "Scoop the fresh hummus into a shallow bowl, using a spoon to carve a spiral groove on top.",
      "Pour the remaining olive oil into the groove.",
      "Ring the plate with black olives and serve accompanied by warm flatbread wedges."
    ],
    keywords: ["chickpeas", "tahini", "lemon", "oil", "garlic", "olive", "olives", "bread"]
  },
  {
    id: 113,
    name: "Classic Tuna Melt Skillet",
    emoji: "🐟",
    time: 12,
    difficulty: "Easy",
    cuisine: "American",
    servings: 1,
    desc: "Delectable creamy tuna salad layered with sliced cheddar, toasted until warm and gooey.",
    overview: "A dynamic diner classic. Butter the sliced bread heavily to toast the sandwich slow and steady, rendering fully melted cheddar with crispy edges.",
    marketPrice: "$2.00 - $3.50",
    youtubeQuery: "The perfect golden diner tuna melt sandwich",
    nutritional: {
      calories: 450,
      protein: "28g",
      carbs: "26g",
      fat: "23g"
    },
    allIngs: [
      "1 can Tuna, drained",
      "2 slices of White Bread",
      "2 tbsp Mayonnaise",
      "2 slices of Cheddar cheese",
      "1/2 stalk Celery or Onion, minced",
      "1 tbsp butter"
    ],
    steps: [
      "In a small bowl, flake the tuna meat and stir together with mayonnaise and minced onion or celery.",
      "Butter one side of both bread slices.",
      "Place one bread slice buttered-side down in a medium warm pan. Pile the tuna salad on top.",
      "Top with two thick slices of cheddar cheese and cover with the second bread slice (buttered-side up).",
      "Cook on medium-low until the bottom toast is crisp and golden (about 4 minutes).",
      "Flip carefully and cook the other side until the cheddar cheese is melted and secure inside."
    ],
    keywords: ["tuna", "mayonnaise", "mayo", "bread", "cheddar", "cheese", "celery", "onion", "butter"]
  },
  {
    id: 114,
    name: "Crispy Bacon, Lettuce & Tomato Sandwich (BLT)",
    emoji: "🥪",
    time: 12,
    difficulty: "Easy",
    cuisine: "American",
    servings: 1,
    desc: "An absolutely timeless stack of smokey crispy bacon, ripe sliced tomato, and fresh lettuce.",
    overview: "A masterclass in textural balance. Spread a layer of rich, authentic mayonnaise directly on sourdough toast to shield the bread from the tomato's juices.",
    marketPrice: "$3.00 - $4.50",
    youtubeQuery: "Perfect crispy BLT sandwich tutorial",
    nutritional: {
      calories: 380,
      protein: "12g",
      carbs: "28g",
      fat: "22g"
    },
    allIngs: [
      "3 thick strips of Bacon",
      "1 ripe Tomato, sliced",
      "2 fresh Lettuce leaves",
      "2 slices of Bread",
      "1 tbsp Mayonnaise"
    ],
    steps: [
      "In a cold skillet, lay bacon strips and cook over medium heat until crispy and deep gold. Drain on paper towels.",
      "Toast bread slices till golden.",
      "Spread a generous layer of mayonnaise on one side of both toast slices.",
      "Structure the bottom toast with crisp lettuce leaves, then sliced tomato seasoned with a pinch of salt.",
      "Stack the cooked bacon strips on top of the tomatoes, cover with the second toast, cut diagonally, and enjoy active crunch."
    ],
    keywords: ["bacon", "lettuce", "tomato", "tomatoes", "bread", "mayonnaise", "mayo"]
  },
  {
    id: 115,
    name: "Healthy Fruit & Honey Oatmeal",
    emoji: "🥣",
    time: 8,
    difficulty: "Easy",
    cuisine: "Breakfast",
    servings: 1,
    desc: "Comforting Oats simmered in warm milk, topped with banana slices, berries, and raw honey.",
    overview: "A high-fiber complex carb boost. Sautéing raw oatmeal flakes in dry pans for 1 minute before milk cooking unlocks a toasted nut aroma.",
    marketPrice: "$1.50 - $2.50",
    youtubeQuery: "How to make oats taste like dessert",
    nutritional: {
      calories: 290,
      protein: "8g",
      carbs: "52g",
      fat: "4g"
    },
    allIngs: [
      "1/2 cup Rolled Oats",
      "1 cup Milk or Almond Milk",
      "1 ripe Banana, sliced",
      "1 tbsp Honey",
      "Handful of Berries (strawberries or blueberries)"
    ],
    steps: [
      "In a small saucepan, bring milk and rolled oats to a gentle simmer over medium heat.",
      "Stir constantly for 5-6 minutes until the porridge is rich and thickened.",
      "Pour hot oatmeal into a clean bowl.",
      "Arrange the sweet banana slices and fresh berries beautifully on top.",
      "Drizzle golden honey over the breakfast bowl and serve hot."
    ],
    keywords: ["oats", "milk", "banana", "honey", "strawberries", "blueberries", "berries"]
  },
  {
    id: 116,
    name: "Creamy Sausage & Spinach Penne",
    emoji: "🍝",
    time: 25,
    difficulty: "Medium",
    cuisine: "Italian",
    servings: 2,
    desc: "Hearty Italian sausage crumbles sautéed with fresh spinach and pasta in a rich garlic cream sauce.",
    overview: "A rustic, robust pasta. Searing high-quality sausage directly out of its casing infuses the skillet with essential spiced fats to coat the pasta nicely.",
    marketPrice: "$5.50 - $8.00",
    youtubeQuery: "Italian sausage and spinach cream pasta recipe",
    nutritional: {
      calories: 590,
      protein: "22g",
      carbs: "58g",
      fat: "31g"
    },
    allIngs: [
      "200g Penne or Rigatoni Pasta",
      "2 Italian Sausages, casings removed",
      "2 cups fresh Spinach",
      "1/2 cup Heavy Cream",
      "2 cloves Garlic, minced",
      "1 tbsp Olive Oil"
    ],
    steps: [
      "Boil penne pasta in a pot of salted water until al dente.",
      "Heat olive oil in a skillet over medium-high. Add sausage meat, breaking it up with a spoon, cooking until browned (about 6 minutes).",
      "Reduce heat, add minced garlic and sauté for 1 minute.",
      "Pour in raw heavy cream and bring to a lazy boil. Add the fresh spinach leaves, allowing them to wilt down.",
      "Drain pasta and add it directly to the cooking skillet.",
      "Stir everything thoroughly for 2 minutes to let the pasta absorb cream flavors, and serve with fresh pepper."
    ],
    keywords: ["pasta", "penne", "sausage", "sausages", "spinach", "cream", "garlic", "oil"]
  },
  {
    id: 117,
    name: "Classic Chicken Quesadilla",
    emoji: "🌮",
    time: 15,
    difficulty: "Easy",
    cuisine: "Mexican",
    servings: 2,
    desc: "Crispy grilled flour tortillas stuffed with melted cheese, seasoned chicken, and bell peppers.",
    overview: "Simple, savory, and quick. Pre-sautéing peppers and onions ensures sweet carmelization that combines spectacularly with gooey Monterey Jack cheese.",
    marketPrice: "$4.50 - $6.50",
    youtubeQuery: "Super crispy cheese chicken quesadilla",
    nutritional: {
      calories: 460,
      protein: "28g",
      carbs: "34g",
      fat: "22g"
    },
    allIngs: [
      "2 flour Tortillas",
      "1 cup Chicken breast, cooked and shredded",
      "1 cup Cheddar or Jack cheese, shredded",
      "1/2 Bell Pepper, sliced thin",
      "1/2 Onion, sliced thin",
      "1 tbsp butter"
    ],
    steps: [
      "In a pan, sauté bell pepper and onion slices in a touch of oil until soft and browned.",
      "Spread melted butter on one side of both flour tortillas.",
      "Place one tortilla buttered-side down in a clean frying pan. Layer with half of the cheese, chicken, sautéed veggies, and the remaining cheese.",
      "Cover with the second tortilla (buttered-side facing up).",
      "Grill on medium or medium-low heat for 3-4 minutes until golden brown, then flip and brown the second side to melt the cheese."
    ],
    keywords: ["tortilla", "tortillas", "chicken", "cheese", "cheddar", "pepper", "peppers", "onion", "butter"]
  },
  {
    id: 118,
    name: "Vibrant Green energy Smoothie",
    emoji: "🍹",
    time: 5,
    difficulty: "Easy",
    cuisine: "Breakfast",
    servings: 1,
    desc: "A nutrient-packed, silky blend of fresh spinach, banana, green apple, yogurt, and sweet honey.",
    overview: "A rapid, delicious vitamin surge. The potassium from banana masks spinach notes, creating a sweet smoothie suitable for everyone.",
    marketPrice: "$2.00 - $3.50",
    youtubeQuery: "The best tasting healthy green smoothie",
    nutritional: {
      calories: 220,
      protein: "7g",
      carbs: "42g",
      fat: "2g"
    },
    allIngs: [
      "2 cups fresh Spinach",
      "1 ripe Banana",
      "1/2 Green Apple, chopped",
      "1/2 cup Greek Yogurt",
      "1/2 cup Milk",
      "1 tbsp Honey"
    ],
    steps: [
      "Rinse greens carefully.",
      "Add green spinach leaves, chopped apple, and banana chunks into the blender.",
      "Add yogurt, milk, and sweet honey.",
      "Blend on pure high speed for 1-2 minutes until beautifully uniform and green.",
      "Pour into a tall cold glass and enjoy."
    ],
    keywords: ["spinach", "banana", "apple", "yogurt", "milk", "honey"]
  },
  {
    id: 119,
    name: "Crispy Garlic Butter Shrimp Scampi",
    emoji: "🍤",
    time: 15,
    difficulty: "Medium",
    cuisine: "Italian",
    servings: 2,
    desc: "Juicy, pan-seared shrimp bathed in a luxurious sauce of garlic, lemon juice, butter, and parsley.",
    overview: "Classic, flavorful seafood. Quick searing preventing rubbery shrimp, while emulsifying butter in hot acidic lemon juice yields a velvet sauce.",
    marketPrice: "$9.00 - $13.50",
    youtubeQuery: "Restaurant style quick shrimp scampi recipe",
    nutritional: {
      calories: 390,
      protein: "24g",
      carbs: "6g",
      fat: "31g"
    },
    allIngs: [
      "250g raw Shrimp, peeled and deveined",
      "3 tbsp butter",
      "4 cloves Garlic, minced",
      "1 tbsp Lemon juice",
      "1/2 cup Penne or Spaghetti pasta (optional)",
      "1 tbsp Olive oil",
      "Pinch of red pepper flakes"
    ],
    steps: [
      "If serving with pasta, boil penne or spaghetti separately, drain and keep warm.",
      "Pat shrimp dry, and season with light salt and pepper.",
      "Heat olive oil and 1 tablespoon of butter in a pan over medium-high heat. Sear shrimp for 2 minutes on each side until pink, then remove from pan.",
      "Lower heat, melt remaining butter in the skillet, and cook the minced garlic and pepper flakes for 1 minute.",
      "Pour in fresh lemon juice, swirl pan to emulsify, then return shrimp and cooked pasta to toss together for 1 minute."
    ],
    keywords: ["shrimp", "butter", "garlic", "lemon", "pasta", "penne", "spaghetti", "oil"]
  },
  {
    id: 120,
    name: "Classic Pepperoni Pizza",
    emoji: "🍕",
    time: 25,
    difficulty: "Medium",
    cuisine: "Italian",
    servings: 3,
    desc: "Crispy-edged crust topped with rich tomato marinara, molten mozzarella, and spicy pepperoni chips.",
    overview: "A savory comfort favorite. Pre-heating your baking sheet or stone dramatically crispifies the dough bottom, offering that authentic pizzeria crunch.",
    marketPrice: "$5.00 - $8.00",
    youtubeQuery: "How to make a perfect home oven pepperoni pizza",
    nutritional: {
      calories: 520,
      protein: "21g",
      carbs: "54g",
      fat: "24g"
    },
    allIngs: [
      "1 store-bought Pizza dough ball",
      "1/2 cup Tomato pizza sauce",
      "1 cup Mozzarella cheese, shredded",
      "50g Pepperoni slices",
      "1 tbsp Olive oil",
      "A few fresh Basil leaves"
    ],
    steps: [
      "Preheat your oven to 450°F (230°C) and grease a baking tray with olive oil.",
      "Roll or stretch the pizza dough into a circular flat disk on the tray.",
      "Spoon tomato sauce evenly over dough, leaving 1/2 inch border.",
      "Scatter shredded mozzarella cheese and pepperoni slices across the surface.",
      "Bake for 12-15 minutes until the dough edges are crispy and golden, and the cheese is beautifully blistered.",
      "Scatter fresh basil leaves, slice, and serve hot."
    ],
    keywords: ["dough", "pizza", "tomato", "cheese", "mozzarella", "pepperoni", "oil", "basil"]
  },
  {
    id: 121,
    name: "Golden Fluffy Pancakes",
    emoji: "🥞",
    time: 15,
    difficulty: "Easy",
    cuisine: "Breakfast",
    servings: 2,
    desc: "Light and airy pancakes served with melted butter and sweet maple syrup.",
    overview: "A timeless diner breakfast. For extra fluffiness, do not overmix the batter—leaving a few small flour lumps is the secret to perfect pancake rise.",
    marketPrice: "$1.20 - $2.50",
    youtubeQuery: "How to cook perfect fluffy buttermilk pancakes",
    nutritional: {
      calories: 350,
      protein: "7g",
      carbs: "58g",
      fat: "10g"
    },
    allIngs: [
      "1 cup all-purpose Flour",
      "1 tbsp Sugar",
      "1 tsp Baking powder",
      "1 cup Milk",
      "1 Egg",
      "2 tbsp butter, melted",
      "Maple syrup to garnish"
    ],
    steps: [
      "In a large bowl, whisk flour, sugar, and baking powder together.",
      "In another small bowl, mix the milk, egg, and melted butter.",
      "Pour wet ingredients into dry ingredients, folding gently together with a spatula until just combined (do not overmix).",
      "Heat a buttered skillet or flat griddle over medium heat.",
      "Pour 1/4 cup of batter per pancake. Cook until surface bubbles start popping, then flip and cook the other side until golden (about 2 minutes per side)."
    ],
    keywords: ["flour", "sugar", "milk", "egg", "eggs", "butter", "syrup"]
  },
  {
    id: 122,
    name: "Molten Chocolate Lava Cake",
    emoji: "🧁",
    time: 18,
    difficulty: "Hard",
    cuisine: "French",
    servings: 2,
    desc: "Indulgent individual chocolate cakes with rich, warm, liquid chocolate centers.",
    overview: "The gold standard of desserts. Accurate baking time is crucial: cooking just until the cake edges are firm but center slightly jiggles guarantees lava ooze.",
    marketPrice: "$4.00 - $6.00",
    youtubeQuery: "Easiest chocolate lava cake tutorial, liquid center",
    nutritional: {
      calories: 440,
      protein: "6g",
      carbs: "41g",
      fat: "28g"
    },
    allIngs: [
      "100g dark Chocolate, chopped",
      "3 tbsp butter",
      "1 large Egg + 1 Egg yolk",
      "2 tbsp Sugar",
      "2 tbsp all-purpose Flour"
    ],
    steps: [
      "Preheat your oven to 400°F (200°C). Butter and lightly flour two baking ramekins.",
      "In a microwave-safe bowl, melt the chopped dark chocolate and butter in 30-second bursts, stirring until smooth.",
      "In a separate bowl, whisk egg, yolk, and sugar together until slightly thick and pale.",
      "Fold melted chocolate and flour into the eggs gently until completely smooth.",
      "Divide batter between the two prepared ramekins. Bake for exactly 10-12 minutes. Let stand for 1 minute, invert onto a plate, and unmold carefully."
    ],
    keywords: ["chocolate", "butter", "egg", "eggs", "sugar", "flour"]
  },
  {
    id: 123,
    name: "Buffalo Cauliflower Wings",
    emoji: "🥦",
    time: 25,
    difficulty: "Easy",
    cuisine: "American",
    servings: 2,
    desc: "Crispy oven-baked cauliflower florets tossed in spicy buffalo sauce with garlic butter.",
    overview: "A flavorful, gluten-friendly party favorite. Baking florets on high heat with cornstarch produces a crisp coating that absorbs the wings sauce beautifully.",
    marketPrice: "$3.00 - $5.00",
    youtubeQuery: "Super crispy baked buffalo cauliflower wings",
    nutritional: {
      calories: 180,
      protein: "4g",
      carbs: "21g",
      fat: "10g"
    },
    allIngs: [
      "1 head Cauliflower, cut into florets",
      "1/2 cup Flour",
      "1/2 cup Milk or water",
      "1 tsp Garlic powder",
      "1/2 cup Buffalo hot sauce",
      "2 tbsp butter, melted"
    ],
    steps: [
      "Preheat oven to 450°F (230°C) and line a baking sheet with parchment paper.",
      "In a bowl, mix flour, milk, garlic powder, salt, and pepper to make a batter.",
      "Dip cauliflower florets into the batter, coating evenly. Arrange on the baking sheet.",
      "Bake for 15-18 minutes until lightly browned and crispy.",
      "In a bowl, mix melted butter and hot buffalo sauce. Toss baked cauliflower in the sauce.",
      "Return the saucy cauliflower florets to the baking sheet and bake for another 5 minutes to set the glaze."
    ],
    keywords: ["cauliflower", "flour", "milk", "sauce", "butter", "garlic"]
  },
  {
    id: 124,
    name: "Classic Fish & Chips",
    emoji: "🍟",
    time: 30,
    difficulty: "Hard",
    cuisine: "British",
    servings: 2,
    desc: "Crispy, golden, batter-fried cod fish fillets served with hot potato wedges.",
    overview: "A coastal tavern classic. Utilizing sparkling club soda or light beverage in the flour batter creates micro air-bubbles, yielding a super crunchy, light fish coat.",
    marketPrice: "$8.00 - $12.00",
    youtubeQuery: "The secrets to perfect pub-style fish and chips",
    nutritional: {
      calories: 580,
      protein: "26g",
      carbs: "48g",
      fat: "32g"
    },
    allIngs: [
      "2 fresh Cod or Pollock fillets",
      "3 large Potatoes, cut into wedges",
      "1 cup all-purpose Flour",
      "1/2 cup Club soda or cold water",
      "2 cups vegetable oil for frying",
      "Lemon wedges for presentation"
    ],
    steps: [
      "Toss potatoes cut into wedges with salt, pepper, and 1 tbsp of oil. Bake potato wedges on a baking sheet at 425°F (220°C) for 25 minutes until golden.",
      "In a bowl, mix flour, salt, pepper, and cold club soda to make a thick pancake-like batter.",
      "Heat frying oil in a deep pan until hot (350°F / 180°C).",
      "Pat fish skinless fillets completely dry, dredge in bare flour, then dip into batter.",
      "Carefully slide the coated fish into the hot oil, frying for 4-5 minutes per side until exceptionally crispy and golden brown."
    ],
    keywords: ["cod", "fish", "potato", "potatoes", "flour", "oil", "lemon"]
  },
  {
    id: 125,
    name: "Fresh Mint Lemonade",
    emoji: "🍋",
    time: 5,
    difficulty: "Easy",
    cuisine: "Beverage",
    servings: 2,
    desc: "An incredibly cooling, zesty lemonade infused with fresh muddled mint leaves.",
    overview: "Perfect for warm days. Blending the lemons whole without the white pith or simply muddying fresh mint ensures an intense mint oils release without bitter undertones.",
    marketPrice: "$1.00 - $1.50",
    youtubeQuery: "Refreshing quick mint lemonade recipe",
    nutritional: {
      calories: 90,
      protein: "0g",
      carbs: "24g",
      fat: "0g"
    },
    allIngs: [
      "2 fresh Lemons, juiced",
      "10-12 fresh Mint leaves",
      "2 tbsp Sugar or honey",
      "2 cups cold Water",
      "1 cup Ice cubes"
    ],
    steps: [
      "In a tall glass or small pitcher, muddle the fresh mint leaves gently with the sugar and lemon juice using a wooden spoon to release the natural mint oils.",
      "Add the cold water and stir vigorously until the sugar is completely dissolved.",
      "Fill two glasses with ice cubes, pour the prepared lemonade over the ice, and garnish with an extra lemon slice or mint sprig before serving."
    ],
    keywords: ["lemon", "lemons", "mint", "sugar", "water", "ice", "lemonade", "drink", "beverage", "fresh"]
  },
  {
    id: 126,
    name: "Creamy Iced Latte",
    emoji: "☕",
    time: 5,
    difficulty: "Easy",
    cuisine: "Beverage",
    servings: 1,
    desc: "A velvety, rich espresso combined with chilled milk over ice for an energetic lift.",
    overview: "A coffeehouse standard. Brewing the espresso double strength ensures the coffee notes shine boldly through the milk even as the ice melts.",
    marketPrice: "$1.50 - $2.50",
    youtubeQuery: "Perfect creamy barista iced latte at home",
    nutritional: {
      calories: 120,
      protein: "6g",
      carbs: "12g",
      fat: "5g"
    },
    allIngs: [
      "1 double shot Espresso or 1 tbsp Instant Coffee",
      "3/4 cup Whole or Oat Milk",
      "1 tbsp Honey or maple syrup",
      "1 cup Ice cubes",
      "1/4 cup hot Water"
    ],
    steps: [
      "If using instant coffee, dissolve it completely in the 1/4 cup of hot water. Otherwise, brew a fresh double shot of rich espresso.",
      "Stir the honey or maple syrup into the hot coffee until fully incorporated.",
      "Fill a tall glass to the top with fresh ice cubes.",
      "Pour the chilled milk over the ice first, then slowly pour the sweetened coffee mixture over the top to create a gorgeous cascading layered effect. Stir before sipping."
    ],
    keywords: ["coffee", "milk", "sugar", "ice", "latte", "drink", "beverage", "iced"]
  },
  {
    id: 127,
    name: "Strawberry Banana Smoothie",
    emoji: "🍓",
    time: 5,
    difficulty: "Easy",
    cuisine: "Beverage",
    servings: 2,
    desc: "A classic thick blend of sweet strawberries, creamy bananas, and a touch of organic honey.",
    overview: "A satisfying breakfast smoothie. Using a frozen sliced banana provides a thick, milkshake-like texture without needing to add extra ice which would dilute the fruit flavor.",
    marketPrice: "$2.50 - $4.00",
    youtubeQuery: "Classic strawberry banana fruit smoothie blender recipe",
    nutritional: {
      calories: 210,
      protein: "5g",
      carbs: "42g",
      fat: "2g"
    },
    allIngs: [
      "1 cup fresh Strawberries, hulled",
      "1 ripe Banana, sliced",
      "1/2 cup Greek Yogurt or Milk",
      "1 tbsp Honey",
      "1/2 cup Ice cubes"
    ],
    steps: [
      "Add the strawberries, sliced banana, greek yogurt (or milk of your choice), and honey to the blender jar.",
      "Add the ice cubes on top to help freeze-blend the ingredients.",
      "Secure the lid and blend on high speed for 45-60 seconds until the mixture is completely velvety smooth with no visible fruit chunks. Serve immediately in tall glasses."
    ],
    keywords: ["strawberry", "strawberries", "banana", "bananas", "milk", "honey", "yogurt", "ice", "smoothie", "drink", "beverage"]
  },
  {
    id: 128,
    name: "Refreshing Ginger Tea",
    emoji: "🍵",
    time: 10,
    difficulty: "Easy",
    cuisine: "Beverage",
    servings: 2,
    desc: "A warm, soothing, and fiery herbal tea infused with sliced ginger, honey, and fresh lemon.",
    overview: "A natural tonic. Simmering thin ginger root slices directly in boiling water extracts the potent, spicy gingerol oils for an authentic herbal remedy.",
    marketPrice: "$0.80 - $1.20",
    youtubeQuery: "How to make freshly brewed ginger honey lemon tea",
    nutritional: {
      calories: 45,
      protein: "0g",
      carbs: "12g",
      fat: "0g"
    },
    allIngs: [
      "2-inch piece of fresh Ginger root, sliced thin",
      "2 cups Water",
      "1 tbsp Honey",
      "1/2 fresh Lemon, sliced"
    ],
    steps: [
      "Wash and scrub the ginger root thoroughly, then cut into thin circular coins (no need to peel!).",
      "In a small cooking pot, combine the water and sliced ginger slices. Bring to a boil over medium-high heat.",
      "Reduce heat to low and let simmer gently for 8-10 minutes to extract the full ginger flavor.",
      "Turn off the heat, stir in the honey and squeeze fresh lemon juice. Strain the hot tea into cups, garnish with a lemon slice, and enjoy hot."
    ],
    keywords: ["ginger", "water", "honey", "lemon", "tea", "drink", "beverage", "hot"]
  },
  {
    id: 129,
    name: "Tropical Mango Passion Mocktail",
    emoji: "🍹",
    time: 5,
    difficulty: "Easy",
    cuisine: "Beverage",
    servings: 2,
    desc: "An exotic bubbly mocktail made with sweet mango purée, fresh lime juice, and sparkling soda.",
    overview: "An alcohol-free taste of the tropics. Layering dense mango juice first and topping with carbonated soda water creates a stunning and refreshing cocktail-style presentation.",
    marketPrice: "$2.00 - $3.50",
    youtubeQuery: "Refreshing tropical mango mocktail sparkling recipe",
    nutritional: {
      calories: 110,
      protein: "1g",
      carbs: "27g",
      fat: "0g"
    },
    allIngs: [
      "1/2 cup fresh Mango purée or juice",
      "1/2 fresh Lime, juiced",
      "1 cup Sparkling Club Soda or Sprite",
      "5-6 fresh Mint leaves",
      "1 cup Ice cubes"
    ],
    steps: [
      "Squeeze fresh lime juice into a shaker or pitcher, and add the mango purée/juice and fresh mint leaves.",
      "Muddle very gently to wake up the mint flavor without tearing the leaves.",
      "Add ice cubes and shake or stir to chill the mixture.",
      "Strain evenly into two glasses filled with ice. Top off each glass with sparkling club soda for a beautiful, fizzy finish. Garnish with lime wheels."
    ],
    keywords: ["mango", "passion", "fruit", "lime", "soda", "water", "mint", "sugar", "ice", "drink", "mocktail", "beverage", "cocktail"]
  }
];
