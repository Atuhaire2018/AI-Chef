import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Utensils,
  Flame,
  BookOpen,
  Search,
  Award,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Info,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Zap,
  Check,
  X,
  Compass,
  Cpu,
  Scissors,
  Wrench,
  Heart,
  Lightbulb,
  ArrowUpDown
} from "lucide-react";

export interface GlobalCutleryGuideProps {
  themeColors: any;
  narrationSpeed?: number;
  soundOn?: boolean;
}

interface GuideSection {
  id: string;
  region: string;
  flag: string;
  title: string;
  category: "etiquette" | "appliances" | "traditional" | "maintenance";
  summary: string;
  utensils: string[];
  keyRules: string[];
  stepsOrDetails: string[];
  proTips: string[];
  warningNote?: string;
}

const GUIDE_SECTIONS: GuideSection[] = [
  // 1. EAST ASIA
  {
    id: "east-asia-chopsticks",
    region: "East Asia",
    flag: "🥢",
    title: "Chopstick Mastery & Dining Etiquette (China, Japan, Korea, Vietnam)",
    category: "etiquette",
    summary: "Master holding techniques, material distinctions (metal, bamboo, wood), and cultural taboos across East Asian dining tables.",
    utensils: ["Chopsticks (Kuàizi/Hashi/Jeotgarak)", "Soup Spoon (Renge/Tángchí)", "Chopstick Rest (Hashi-oki)", "Sujeo (Korean Spoon & Chopstick)"],
    keyRules: [
      "NEVER stick chopsticks vertically into a bowl of rice (resembles funerary incense burning - 'tate-bashi'). Place them across the bowl or on a rest.",
      "NEVER pass food directly chopstick-to-chopstick ('hashi-watashi'). Use serving chopsticks or the back end to transfer food to a plate.",
      "NEVER point with chopsticks or spear food unless attempting a particularly slippery item in a casual setting.",
      "In Korea, use metal flat chopsticks alongside a long-handled spoon (Sujeo). Keep the rice bowl on the table; do not lift it to your mouth as in China or Japan.",
      "In Japan, it is acceptable and customary to pick up rice and soup bowls with one hand close to your chest."
    ],
    stepsOrDetails: [
      "1. Grip Position: Hold the upper chopstick like a pencil between thumb, index, and middle finger.",
      "2. Anchor: Rest the lower chopstick firmly in the V-shaped web between your thumb and index finger, resting on your ring finger.",
      "3. Pivot: Only move the TOP chopstick while keeping the lower chopstick completely stationary as an anchor.",
      "4. Soup Spoon Usage: Rest index finger inside the channel groove of the soup spoon to maintain control without spilling broth."
    ],
    proTips: [
      "Use bamboo or wooden chopsticks for hot pots and delicate noodles; metal chopsticks offer superior hygiene for barbecue and heavy meats.",
      "Always use chopstick rests (Hashi-oki) when taking a break from eating or drinking water."
    ],
    warningNote: "Spillages and dropping chopsticks during formal banquets is considered bad luck. Always keep chopsticks aligned on the rest."
  },

  // 2. WESTERN (EUROPE & AMERICAS)
  {
    id: "western-formal",
    region: "Europe & Americas",
    flag: "🍽️",
    title: "Western Cutlery & Formal Table Setting (Continental vs. American)",
    category: "etiquette",
    summary: "Understand Continental vs American eating styles, outer-to-inner utensil progression, and formal place setting navigation.",
    utensils: ["Dinner Knife & Fork", "Salad & Dessert Cutlery", "Soup Spoon", "Butter Knife", "Napkin"],
    keyRules: [
      "Work from the OUTSIDE IN: Utensils on the far outer edges are used for the first course; progression moves inward toward the plate for main courses.",
      "Continental Style: Fork remains in the LEFT hand (prongs pointed down), knife in RIGHT hand throughout the meal.",
      "American Style: Cut food with knife in right hand and fork in left, then place knife on plate edge and switch fork to RIGHT hand (prongs up) to eat.",
      "Resting Position: Place knife and fork in an inverted 'V' on the plate when taking a break.",
      "Finished Position: Lay knife and fork parallel across the plate at the 4:20 clock position with fork prongs up (or down in Continental Europe)."
    ],
    stepsOrDetails: [
      "1. Bread & Butter: Break bread with fingers into single bite-sized pieces before spreading butter using your personal butter knife.",
      "2. Soup Etiquette: Spoon soup AWAY from you towards the back of the bowl, bringing the spoon laterally to your mouth without slurping.",
      "3. Napkin Placement: Fold napkin in half and place on your lap immediately upon seating. Place on chair if stepping away temporarily."
    ],
    proTips: [
      "Keep elbows off the table during active dining courses.",
      "Blade edges always face INWARD towards your own plate when placing down cutlery."
    ],
    warningNote: "Never gesture or point with cutlery held in your hands."
  },

  // 3. SOUTH ASIA & MIDDLE EAST
  {
    id: "south-asia-hands",
    region: "South Asia & Middle East",
    flag: "✋",
    title: "Right-Hand Hand Dining Customs, Roti Folding & Banana Leaf Ettiquette",
    category: "etiquette",
    summary: "Discover traditional right-handed eating techniques, flatbread tearing, and banana leaf dining etiquette across India, Arabia, and Persia.",
    utensils: ["Right Hand (Fingertips)", "Banana Leaf", "Thali Plate", "Lota (Handwashing Vessel)"],
    keyRules: [
      "STRICT RIGHT-HAND RULE: Eat exclusively with your RIGHT hand. The left hand is reserved for holding drinking glasses or personal hygiene.",
      "Fingertip Precision: Gather rice, dal, and curry using the tips of your fingers and thumb pad—never let food touch your palm or pass your first knuckles.",
      "Roti & Naan Tearing: Pin flatbread down with your right thumb and tear off bite-sized pieces using your index and middle fingers with one hand.",
      "Banana Leaf Protocol: After eating, fold the top half of the leaf DOWN towards you to indicate deep satisfaction to your host."
    ],
    stepsOrDetails: [
      "1. Handwashing: Thoroughly wash hands before sitting at the table using warm water and soap.",
      "2. Rice Ball Technique: Gently mix rice and curry with fingertips into a compact portion, then push it into your mouth using your thumb pad.",
      "3. Communal Bowls: Take food only from the side of the platter nearest to you; do not reach across others."
    ],
    proTips: [
      "When offered 'Gursha' or communal bread, accept graciously with your right hand.",
      "Traditional brass and copper Thali plates naturally temper spice and help maintain authentic dish temperatures."
    ],
    warningNote: "Licking fingers past the second knuckle or touching communal serving spoons with dirty fingers is considered unhygienic."
  },

  // 4. SOUTHEAST ASIA
  {
    id: "southeast-asia-spoon-fork",
    region: "Southeast Asia",
    flag: "🥄",
    title: "Spoon & Fork Synergy (Thailand, Philippines, Vietnam, Indonesia)",
    category: "etiquette",
    summary: "Master the Thai Spoon-as-Primary technique and Filipino Kamayan banana leaf feast customs.",
    utensils: ["Tablespoon (Primary)", "Dinner Fork (Pusher)", "Banana Leaf", "Cobek Stone Mortar"],
    keyRules: [
      "Spoon as Primary: In Thailand, the SPOON is your main eating utensil held in the dominant hand.",
      "Fork as Pusher: The fork is held in the non-dominant hand and used ONLY to push rice and food onto the spoon.",
      "NEVER PUT THE FORK IN YOUR MOUTH in Thailand: Putting a fork directly into your mouth is considered uncouth.",
      "Filipino Kamayan: In traditional Boodle Fights, eat with clean hands directly from banana leaves without plates or utensils."
    ],
    stepsOrDetails: [
      "1. Load Spoon: Use the fork in left hand to nudge meat, curry, and fragrant jasmine rice onto the spoon.",
      "2. Eat from Spoon: Bring the loaded spoon directly to your mouth.",
      "3. Noodle Exception: Chopsticks are used primarily for noodle soups (like Pho or Boat Noodles)."
    ],
    proTips: [
      "Always cut large items on your plate using the side of your tablespoon before scooping."
    ]
  },

  // 5. AFRICA & HORN OF AFRICA
  {
    id: "africa-injera",
    region: "Africa & Horn of Africa",
    flag: "🇪🇹",
    title: "Injera Flatbread Mastery & West African Fufu Etiquette",
    category: "etiquette",
    summary: "Learn how teff sourdough Injera acts as plate, spoon, and meal, alongside West African Fufu dipping traditions.",
    utensils: ["Injera Sourdough Flatbread", "Mesob Woven Basket", "Right Hand", "Clay Pot"],
    keyRules: [
      "Injera is Utensil & Plate: Tear a piece of spongey Injera flatbread using your right hand to scoop stews (Doro Wat, Tibs).",
      "Gursha Gesture: Feeding a morsel of Injera wrapped food to a friend or elder is 'Gursha'—a high sign of honor and friendship.",
      "Fufu Dipping Rule: Pinch a ball of Fufu or Pounded Yam, press a small dimple with your thumb, scoop soup, and swallow WHOLE without chewing."
    ],
    stepsOrDetails: [
      "1. Tear Injera: Rip a palm-sized section of fresh Injera using right hand.",
      "2. Wrap & Pinch: Gently press the bread onto stews and pinch to encapsulate sauce and meat.",
      "3. Eat Cleanly: Lift to mouth without letting gravy drip onto table or clothes."
    ],
    proTips: [
      "Injera placed at the bottom of the Mesob basket absorbs rich flavors throughout the meal and is eaten last as the prized delicacy ('Yebesele')."
    ]
  },

  // 6. MODERN APPLIANCES - SOUS VIDE
  {
    id: "appliance-sous-vide",
    region: "Global Modern",
    flag: "🌡️",
    title: "Sous Vide Precision Immersion Circulator Guide",
    category: "appliances",
    summary: "Precision water-bath thermal cooking for perfect edge-to-edge doneness, pasteurization, and juiciness.",
    utensils: ["Immersion Circulator", "Vacuum Sealer / Ziploc", "Water Container / Pot", "Cast Iron Skillet"],
    keyRules: [
      "Never skip the drying phase: Bone-dry surfaces are MANDATORY before searing to achieve a Maillard crust without overcooking.",
      "Water Bath Safety: Ensure water level stays between MIN and MAX marks throughout long multi-hour cooks.",
      "Sealing: Ensure vacuum bags are 100% airtight to prevent floatation and uneven heating."
    ],
    stepsOrDetails: [
      "1. Prep & Season: Lightly season proteins with dry rub or salt/pepper.",
      "2. Bag & Seal: Vacuum seal or use water displacement method with heavy-duty freezer bags.",
      "3. Submerge & Cook: Set precision temp (e.g., Medium-Rare Steak 130°F / 54.4°C for 2 hrs; Chicken Breast 145°F / 63°C for 1.5 hrs).",
      "4. Sear & Finish: Remove from bag, pat completely dry with paper towels, and sear 45 seconds per side in smoking hot cast iron."
    ],
    proTips: [
      "Add garlic powder instead of raw garlic cloves in vacuum bags to prevent raw bitter undertones."
    ]
  },

  // 7. MODERN APPLIANCES - AIR FRYER
  {
    id: "appliance-air-fryer",
    region: "Global Modern",
    flag: "🌀",
    title: "High-Speed Convection Air Fryer Operating Standards",
    category: "appliances",
    summary: "Maximize crispness, convert traditional oven recipes, and avoid soggy basket overcrowding.",
    utensils: ["Air Fryer Basket", "Silicone Tongs", "Oil Spray Mister (Avocado/Olive)"],
    keyRules: [
      "Overcrowding Rule: Cook in single layers with space between items for optimal hot air circulation.",
      "Convert Oven Recipes: Reduce oven temperature by 25°F (15°C) and cut cooking time by 20-25%.",
      "Shake Basket: Shake or flip contents halfway through cook time for uniform golden crunch."
    ],
    stepsOrDetails: [
      "1. Pre-heat: Preheat air fryer 3 minutes at target temperature.",
      "2. Light Spray: Lightly mist food with high-smoke-point oil (avocado oil) rather than aerosol non-stick sprays.",
      "3. Arrange & Fry: Space out items; shake basket at 50% timer mark.",
      "4. Clean: Clean drawer and grill insert with warm soapy water after cooling to prevent smoke build-up."
    ],
    proTips: [
      "Place a small slice of bread or tablespoon of water in the bottom outer drawer to absorb grease drips and prevent white smoke when cooking fatty meats."
    ]
  },

  // 8. TRADITIONAL REGIONAL - MOLCAJETE & MORTAR
  {
    id: "traditional-molcajete",
    region: "Americas & Asia",
    flag: "🪨",
    title: "Molcajete, Cobek & Mortar/Pestle Culinary Chemistry",
    category: "traditional",
    summary: "Release aromatic volatile oils by crushing plant cells instead of shearing them with high-speed metal blades.",
    utensils: ["Volcanic Basalt Molcajete", "Tejolote (Pestle)", "Brass/Granite Mortar", "Bamboo Scraper"],
    keyRules: [
      "Crushing vs Cutting: Mortars rupture plant cells to release deep essential oils, whereas high-speed blender blades slice cells cleanly without maximum flavor release.",
      "Soap Prohibition: NEVER clean porous volcanic stone with detergent or dish soap! It absorbs fragrance and ruins future salsas.",
      "Curing Stone: New volcanic stone must be cured with wet rice grinds until no grey grit remains."
    ],
    stepsOrDetails: [
      "1. Coarse Salt Base: Start by grinding coarse sea salt with garlic and whole chilies into a smooth paste.",
      "2. Add Aromatics: Add herbs, roasted tomatoes, or avocados in batches.",
      "3. Shearing Motion: Use a firm circular grinding motion pressing against the abrasive stone walls.",
      "4. Cleaning: Scrub thoroughly with hot water and a stiff natural fiber brush, then air dry completely."
    ],
    proTips: [
      "Serve salsa directly in a pre-warmed Molcajete to keep guacamole cool or volcanic salsas sizzling hot at the table."
    ]
  },

  // 9. TRADITIONAL REGIONAL - CARBON STEEL WOK
  {
    id: "traditional-wok",
    region: "East & SE Asia",
    flag: "🔥",
    title: "Wok Hei ('Breath of the Wok') & Carbon Steel Maintenance",
    category: "traditional",
    summary: "Master high-BTU stir-fry sequencing, non-stick patina creation, and wok seasoning care.",
    utensils: ["Carbon Steel Wok", "Wok Hochan (Spatula)", "Wok Ring", "Bamboo Cleaning Whisk"],
    keyRules: [
      "Long Yau (Hot Wok, Cold Oil): Always heat empty wok until wisps of smoke appear BEFORE adding cold oil to create a natural non-stick surface.",
      "Sequence: Aromatics (ginger/garlic/scallion) -> Protein -> Vegetables -> Noodle/Rice -> Sauce drizzle around edge.",
      "No Soap Cleaning: Clean with hot water and a bamboo whisk (Sasara) while wok is warm."
    ],
    stepsOrDetails: [
      "1. Heat Wok: High flame until wok turns dark and smokes.",
      "2. Swirl Oil: Add 2 tbsp oil, coat sides, discard excess if needed.",
      "3. Flash Cook: Toss ingredients rapidly using spatula thrusts.",
      "4. Dry & Oil: After washing with hot water, dry over flame and rub a paper towel dipped in vegetable oil to prevent rust."
    ],
    proTips: [
      "Pour soy sauce and wine around the scorching hot top rim of the wok so it caramelizes instantly before reaching food."
    ]
  },

  // 10. MAINTENANCE & CARE - KNIFE SHARPENING
  {
    id: "maintenance-whetstone",
    region: "Global Professional",
    flag: "🔪",
    title: "Whetstone Knife Sharpening & Bevel Angles",
    category: "maintenance",
    summary: "Maintain razor-sharp edges with 1000/6000 dual grit whetstones and precise bevel angles.",
    utensils: ["Whetstone (1000/6000)", "Honing Steel", "Leather Strop", "Flattening Stone"],
    keyRules: [
      "Angle Control: 15° bevel angle for Japanese knives (Santoku/Gyuto); 20° bevel angle for Western Chef Knives.",
      "Soak Stone: Soak ceramic water stones in clean water for 10-15 minutes until bubbles stop rising.",
      "Burr Detection: Grind until a fine metal burr can be felt along the full length of the opposite blade edge before changing sides."
    ],
    stepsOrDetails: [
      "1. Coarse 1000 Grit: Place heel of blade at 15° angle, push smoothly across stone with light fingertip pressure on edge.",
      "2. Both Sides: Repeat 10-15 strokes per side maintaining consistent angle.",
      "3. Fine 6000 Grit Polish: Repeat on 6000 grit stone to polish edge to razor mirror finish.",
      "4. Leather Strop Finish: Draw blade backwards across leather strop to align microscopic teeth."
    ],
    proTips: [
      "Use two stacked pennies under the spine of a knife as a visual gauge for a 15-degree angle."
    ]
  }
];

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is considered a serious cultural taboo when dining with chopsticks in East Asia?",
    options: [
      "Using chopsticks to pick up noodles",
      "Sticking chopsticks vertically into a bowl of rice",
      "Resting chopsticks on a ceramic rest",
      "Asking for wooden chopsticks instead of metal"
    ],
    correctIndex: 1,
    explanation: "Sticking chopsticks vertically into rice resembles funerary incense burning rites ('tate-bashi') and is considered bad luck across East Asian cultures."
  },
  {
    id: 2,
    question: "In Thai dining etiquette, how should the dinner fork be used?",
    options: [
      "Put the fork directly into your mouth with meat",
      "Use the fork in your right hand to spear soup dumplings",
      "Hold the fork in your non-dominant hand ONLY to push food onto the tablespoon",
      "Never touch the fork during mealtime"
    ],
    correctIndex: 2,
    explanation: "In Thailand, the spoon is the primary eating utensil. The fork is held in the non-dominant hand and used strictly as a pusher to load the spoon."
  },
  {
    id: 3,
    question: "Why should you NEVER use dish soap or detergent on a volcanic basalt Molcajete?",
    options: [
      "Soap weakens the stone and causes it to crack",
      "Porous volcanic stone absorbs soap perfumes, ruining future salsa flavors",
      "Basalt stone turns green when exposed to liquid soap",
      "It melts the pestle head instantly"
    ],
    correctIndex: 1,
    explanation: "Volcanic basalt stone is naturally porous and will absorb soap perfumes, releasing dish soap taste into your future salsas and guac!"
  },
  {
    id: 4,
    question: "What is the correct bevel sharpening angle for Japanese knives (Santoku/Gyuto) on a whetstone?",
    options: [
      "35 degrees",
      "25 degrees",
      "15 degrees",
      "5 degrees"
    ],
    correctIndex: 2,
    explanation: "Japanese blades are crafted with harder steel allowing for a razor-sharp 15-degree bevel angle, compared to 20 degrees for Western knives."
  }
];

export const GlobalCutleryGuide: React.FC<GlobalCutleryGuideProps> = ({
  themeColors: C,
  narrationSpeed = 1.0,
  soundOn = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"default" | "title-asc" | "title-desc" | "region" | "category">("default");
  const [activeSectionId, setActiveSectionId] = useState<string>(GUIDE_SECTIONS[0].id);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Quiz state
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const activeSection = GUIDE_SECTIONS.find((s) => s.id === activeSectionId) || GUIDE_SECTIONS[0];

  const filteredSections = GUIDE_SECTIONS.filter((s) => {
    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
    const matchesQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.utensils.some((u) => u.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const sortedSections = [...filteredSections].sort((a, b) => {
    if (sortBy === "title-asc") return a.title.localeCompare(b.title);
    if (sortBy === "title-desc") return b.title.localeCompare(a.title);
    if (sortBy === "region") return a.region.localeCompare(b.region);
    if (sortBy === "category") return a.category.localeCompare(b.category);
    return 0;
  });

  // Audio narration handler
  const handleToggleNarration = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis narration is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToRead = `${activeSection.title}. ${activeSection.summary}. Key Rules: ${activeSection.keyRules.join(". ")}. Steps: ${activeSection.stepsOrDetails.join(". ")}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = narrationSpeed || 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectQuizAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === QUIZ_QUESTIONS[currentQuizIdx].correctIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* HEADER HERO CARD */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
          borderRadius: 20,
          padding: "20px 18px",
          color: "white",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.2,
                textTransform: "uppercase"
              }}
            >
              🌍 Chef Essentials & Etiquette
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontStyle: "italic" }}>
              Global Culinary Standards
            </span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 850, margin: "4px 0 8px", fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
            Global Cutlery, Dining Etiquette & Kitchen Appliance Guide
          </h2>

          <p style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.92, maxWidth: 680 }}>
            Master dining table customs, chopstick protocol, traditional stone & wok tools, and modern appliance precision across every continent.
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleToggleNarration}
              style={{
                background: isSpeaking ? "#EF4444" : "rgba(255,255,255,0.25)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.4)",
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 750,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                backdropFilter: "blur(4px)"
              }}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {isSpeaking ? "Stop Narration" : "🔊 Listen Audio Guide"}
            </button>

            <button
              type="button"
              onClick={() => setQuizActive(!quizActive)}
              style={{
                background: quizActive ? C.white : "rgba(255,255,255,0.15)",
                color: quizActive ? C.text : "white",
                border: "1px solid rgba(255,255,255,0.4)",
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 750,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Award size={14} />
              {quizActive ? "Close Etiquette Quiz" : "🎯 Test Your Etiquette IQ Quiz"}
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE QUIZ MODAL / SECTION */}
      {quizActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: C.white,
            borderRadius: 20,
            padding: 18,
            border: `2px solid ${C.accent}`,
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Award style={{ color: C.accent }} size={20} />
              <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                Global Culinary Etiquette & Tool Quiz
              </span>
            </div>
            {!quizFinished && (
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: "rgba(0,0,0,0.04)", padding: "4px 8px", borderRadius: 10 }}>
                Question {currentQuizIdx + 1} of {QUIZ_QUESTIONS.length}
              </span>
            )}
          </div>

          {!quizFinished ? (
            <div>
              <p style={{ fontSize: 13, fontWeight: 750, color: C.text, marginBottom: 12 }}>
                {QUIZ_QUESTIONS[currentQuizIdx].question}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {QUIZ_QUESTIONS[currentQuizIdx].options.map((opt, idx) => {
                  const isCorrect = idx === QUIZ_QUESTIONS[currentQuizIdx].correctIndex;
                  const isSelected = selectedAnswer === idx;

                  let bg = "#FAF8F4";
                  let border = `1px solid ${C.border}`;
                  let color = C.text;

                  if (selectedAnswer !== null) {
                    if (isCorrect) {
                      bg = "#DCFCE7";
                      border = "1px solid #16A34A";
                      color = "#15803D";
                    } else if (isSelected) {
                      bg = "#FEE2E2";
                      border = "1px solid #DC2626";
                      color = "#B91C1C";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuizAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      style={{
                        background: bg,
                        border: border,
                        color: color,
                        padding: "10px 14px",
                        borderRadius: 12,
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: isSelected ? 800 : 600,
                        cursor: selectedAnswer === null ? "pointer" : "default",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <span>{opt}</span>
                      {selectedAnswer !== null && isCorrect && <Check size={16} color="#16A34A" />}
                      {selectedAnswer !== null && isSelected && !isCorrect && <X size={16} color="#DC2626" />}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div style={{ marginTop: 12, padding: 10, background: "rgba(0,0,0,0.03)", borderRadius: 10, borderLeft: `3px solid ${C.primary}` }}>
                  <div style={{ fontSize: 11, fontWeight: 750, color: C.text, marginBottom: 2 }}>
                    💡 Explanation:
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>
                    {QUIZ_QUESTIONS[currentQuizIdx].explanation}
                  </div>
                  <button
                    type="button"
                    onClick={handleNextQuizQuestion}
                    style={{
                      marginTop: 10,
                      background: C.primary,
                      color: "white",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    {currentQuizIdx + 1 === QUIZ_QUESTIONS.length ? "Finish Quiz" : "Next Question →"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "16px 8px" }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>🏆</div>
              <h3 style={{ fontSize: 16, fontWeight: 850, color: C.text, marginBottom: 4 }}>
                Quiz Completed!
              </h3>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
                You scored <strong>{quizScore}</strong> out of <strong>{QUIZ_QUESTIONS.length}</strong>!
              </p>
              <div
                style={{
                  display: "inline-block",
                  background: C.primary + "15",
                  color: C.primary,
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 14
                }}
              >
                {quizScore === QUIZ_QUESTIONS.length
                  ? "🌟 Grand Master Chef of Global Etiquette!"
                  : quizScore >= 2
                  ? "👨‍🍳 Experienced International Chef!"
                  : "📖 Apprentice Chef - Keep Learning!"}
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  style={{
                    background: C.primary,
                    color: "white",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  <RotateCcw size={12} style={{ display: "inline", marginRight: 6 }} />
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* FILTER TABS & SEARCH BAR & SORT SELECTOR */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
            <input
              type="text"
              placeholder="Search utensils, appliances, or etiquette rules (e.g. chopsticks, sous vide, wok, fork)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: C.white,
                fontSize: 12,
                color: C.text,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* SORT BY DROPDOWN */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <ArrowUpDown size={14} style={{ position: "absolute", left: 10, color: C.muted, pointerEvents: "none" }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "10px 12px 10px 30px",
                fontSize: 11,
                fontWeight: 700,
                color: C.text,
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="default">Sort: Recommended</option>
              <option value="title-asc">Sort: Title (A – Z)</option>
              <option value="title-desc">Sort: Title (Z – A)</option>
              <option value="region">Sort: By Region</option>
              <option value="category">Sort: By Category</option>
            </select>
          </div>
        </div>

        {/* CATEGORY SELECTOR CHIPS */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }} className="scrollbar-thin">
          {[
            { id: "all", label: "🌍 All Guides" },
            { id: "etiquette", label: "🥢 Cutlery & Table Etiquette" },
            { id: "appliances", label: "⚡ Modern High-Tech Appliances" },
            { id: "traditional", label: "🏺 Traditional Regional Utensils" },
            { id: "maintenance", label: "🔪 Care & Sharpening Maintenance" }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? C.primary : "white",
                color: selectedCategory === cat.id ? "white" : C.muted,
                border: `1px solid ${selectedCategory === cat.id ? C.primary : C.border}`,
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: selectedCategory === cat.id ? 800 : 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT: LEFT SIDEBAR SELECTOR & RIGHT DETAIL PANEL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
        {/* TOP SCROLLING/LIST OF CARDS OR SELECTOR */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }} className="scrollbar-thin">
          {sortedSections.map((sec) => {
            const isSelected = sec.id === activeSectionId;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSectionId(sec.id)}
                style={{
                  background: isSelected ? C.white : "#FAF8F4",
                  border: isSelected ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                  padding: "10px 14px",
                  borderRadius: 14,
                  minWidth: 180,
                  maxWidth: 220,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
                  flexShrink: 0
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{sec.flag}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: isSelected ? C.accent : C.muted,
                      textTransform: "uppercase"
                    }}
                  >
                    {sec.region}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: isSelected ? 800 : 600,
                    color: C.text,
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "orient-vertical",
                    overflow: "hidden"
                  }}
                >
                  {sec.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTIVE SECTION DETAILED CARD */}
        {activeSection && (
          <motion.div
            key={activeSection.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: C.white,
              borderRadius: 20,
              padding: 20,
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
            }}
          >
            {/* CARD TITLE & TAGS */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 24 }}>{activeSection.flag}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, letterSpacing: 1, textTransform: "uppercase" }}>
                    {activeSection.region} · {activeSection.category}
                  </span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 850, color: C.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>
                  {activeSection.title}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 12 }}>
              {activeSection.summary}
            </p>

            {/* UTENSILS BADGES */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: "block", fontSize: 10, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                🛠️ Key Utensils & Equipment
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {activeSection.utensils.map((u, i) => (
                  <span
                    key={i}
                    style={{
                      background: C.primary + "10",
                      color: C.primary,
                      border: `1px solid ${C.primary}30`,
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 700
                    }}
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>

            {/* KEY RULES / CULTURAL LAWS */}
            <div style={{ marginBottom: 16, background: "#FAF8F4", padding: 14, borderRadius: 14, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 11, fontWeight: 800, color: C.text }}>
                <ShieldCheck size={16} color={C.primary} />
                CRITICAL ETYS & PROTOCOLS
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                {activeSection.keyRules.map((rule, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* STEP BY STEP OPERATING / EXECUTION */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                📋 Execution & Technique Steps
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeSection.stepsOrDetails.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "white",
                      border: `1px solid ${C.border}`,
                      padding: "8px 12px",
                      borderRadius: 10,
                      fontSize: 11,
                      color: C.text,
                      lineHeight: 1.4
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* PRO TIPS & WARNINGS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {activeSection.proTips && activeSection.proTips.length > 0 && (
                <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", padding: 12, borderRadius: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#047857", textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <Lightbulb size={14} /> PRO CHEF TIP
                  </div>
                  <div style={{ fontSize: 11, color: "#065F46", lineHeight: 1.4 }}>
                    {activeSection.proTips.join(" ")}
                  </div>
                </div>
              )}

              {activeSection.warningNote && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", padding: 12, borderRadius: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#B91C1C", textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <Info size={14} /> TABOO & WARNING
                  </div>
                  <div style={{ fontSize: 11, color: "#991B1B", lineHeight: 1.4 }}>
                    {activeSection.warningNote}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GlobalCutleryGuide;
