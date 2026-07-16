import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Youtube, ExternalLink, Bookmark, HelpCircle, List, ChefHat, Sparkles } from "lucide-react";
import { MealDetail, IngredientMeasure } from "../types";
import CookModePanel from "./CookModePanel";
import { getRecipeAllergens } from "../utils/allergenHelper";

function IngredientsChecklist({ list }: { list: IngredientMeasure[] }) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  // Reset checked state if the recipe ingredients list changes (e.g., loaded another recipe)
  useEffect(() => {
    setCheckedItems({});
  }, [list]);

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {list.map((item, index) => {
        const isChecked = !!checkedItems[index];
        return (
          <button
            key={index}
            type="button"
            onClick={() => toggleCheck(index)}
            className={`flex items-center justify-between p-2.5 rounded-xl text-left text-sm transition-all border outline-hidden select-none cursor-pointer ${
              isChecked
                ? "bg-emerald-50/40 border-emerald-100 text-slate-400"
                : "bg-slate-50 hover:bg-slate-100/80 border-slate-100 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 pr-1.5">
              <span className={`w-4 h-4 rounded-md border shrink-0 flex items-center justify-center transition-all ${
                isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"
              }`}>
                {isChecked && (
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
              </span>
              <span className={`font-semibold capitalize truncate ${isChecked ? "line-through opacity-70" : ""}`}>
                {item.ingredient}
              </span>
            </div>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-lg shrink-0 transition-all ${
              isChecked ? "bg-slate-100 text-slate-300 border border-slate-200/20" : "bg-white border border-slate-200/50 text-slate-500"
            }`}>
              {item.measure}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface MealDetailModalProps {
  mealId: string;
  mealName: string;
  onClose: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  currentLanguage?: string;
}

export default function MealDetailModal({
  mealId,
  mealName,
  onClose,
  isFavorited,
  onToggleFavorite,
  currentLanguage = "en",
}: MealDetailModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<MealDetail | null>(null);
  const [isCookModeActive, setIsCookModeActive] = useState(false);

  useEffect(() => {
    async function fetchMealDetail() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
        );
        const data = await response.json();
        if (data.meals && data.meals[0]) {
          setDetail(data.meals[0]);
        } else {
          setError("Could not retrieve detailed steps for this recipe.");
        }
      } catch (err) {
        console.error("Error fetching meal detail:", err);
        setError("Network error occurred while fetching details.");
      } finally {
        setLoading(false);
      }
    }

    fetchMealDetail();
  }, [mealId]);

  // Extract ingredients and measures dynamically
  const getIngredients = (meal: MealDetail): IngredientMeasure[] => {
    const list: IngredientMeasure[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        list.push({
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : "",
        });
      }
    }
    return list;
  };

  const ingredientsList = detail ? getIngredients(detail) : [];

  // Parse instructions into steps if possible
  const getInstructionsList = (text: string): string[] => {
    return text
      .split(/\r?\n|\r/)
      .map((step) => step.trim())
      .filter((step) => step.length > 3 && !step.toLowerCase().startsWith("step"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Backdrop Closer */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10"
      >
        {/* Header Image banner if preloaded/detail loaded */}
        <div className="relative h-48 sm:h-64 bg-slate-100 flex-shrink-0">
          <img
            src={detail?.strMealThumb || `https://www.themealdb.com/images/media/meals/58o8hx1511451513.jpg`} // backup or preloaded
            alt={mealName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {/* Top buttons inside image */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              id={`fav-btn-${mealId}`}
              onClick={onToggleFavorite}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all border ${
                isFavorited
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "bg-black/50 border-white/20 text-white hover:bg-black/70"
              }`}
              title={isFavorited ? "Remove from Cooklist" : "Save to Cooklist"}
            >
              <Bookmark className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
            </button>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/50 border border-white/20 text-white hover:bg-black/70 backdrop-blur-md transition-all"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            {detail && (
              <div className="flex flex-wrap gap-2 mb-2">
                {detail.strCategory && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-500 rounded-full">
                    {detail.strCategory}
                  </span>
                )}
                {detail.strArea && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-700/80 rounded-full">
                    {detail.strArea}
                  </span>
                )}
                {getRecipeAllergens({ name: mealName, allIngs: ingredientsList.map(i => i.ingredient) }).map(allg => (
                  <span key={allg} className="px-2.5 py-0.5 text-xs font-semibold bg-rose-600/90 text-white rounded-full flex items-center gap-1 border border-rose-500/30 shadow-sm">
                    <span>⚠️</span>
                    <span>Contains {allg}</span>
                  </span>
                ))}
              </div>
            )}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight line-clamp-2">
              {mealName}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 font-medium">Fetching recipe secret steps...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-semibold">{error}</p>
              <p className="text-sm text-slate-400 mt-1">Please try again or view external links below.</p>
            </div>
          ) : (
            detail && (
              <div className="space-y-6">
                {/* Ingredients and Measure */}
                <div>
                  <div className="flex justify-between items-center mb-3 border-b pb-1.5 border-slate-100">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <List className="w-4.5 h-4.5 text-teal-600" />
                      Ingredients & Pantry Check
                    </h3>
                    <span className="text-xs text-slate-400 font-medium font-mono">
                      Tap items you have in stock
                    </span>
                  </div>
                  <IngredientsChecklist list={ingredientsList} />
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-3 border-b pb-1.5 border-slate-100">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <ChefHat className="w-4.5 h-4.5 text-teal-600" />
                      How to Prepare
                    </h3>
                    <button
                      type="button"
                      id="start-meal-cook-mode-btn"
                      onClick={() => setIsCookModeActive(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
                      title="Enter immersive full screen step-by-step cooking mode"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>Start Cook Mode 🍳</span>
                    </button>
                  </div>
                  <div className="space-y-3.5 text-slate-600 text-sm leading-relaxed">
                    {getInstructionsList(detail.strInstructions).length > 0 ? (
                      getInstructionsList(detail.strInstructions).map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-teal-50 text-teal-600 font-mono text-xs font-bold border border-teal-100">
                            {idx + 1}
                          </span>
                          <p className="pt-0.5">{item}</p>
                        </div>
                      ))
                    ) : (
                      <p className="whitespace-pre-line">{detail.strInstructions}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 bg-slate-50 border-t border-slate-100 p-4 flex flex-wrap gap-2 justify-between items-center text-xs">
          <div className="flex gap-2">
            {detail?.strYoutube && (
              <a
                id="watch-yt-btn"
                href={detail.strYoutube}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-all border border-rose-100"
              >
                <Youtube className="w-4 h-4" />
                Watch Video Instruction
              </a>
            )}
            {detail?.strSource && (
              <a
                id="view-source-btn"
                href={detail.strSource}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold transition-all border border-teal-100"
              >
                <ExternalLink className="w-4 h-4" />
                Original Source
              </a>
            )}
          </div>

          <a
            id="google-search-btn"
            href={`https://www.google.com/search?q=${encodeURIComponent(mealName)}+recipe`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-800 font-medium transition-all hover:bg-slate-100"
          >
            Google search recipe details ➔
          </a>
        </div>
      </motion.div>

      <AnimatePresence>
        {isCookModeActive && detail && (
          <CookModePanel
            steps={getInstructionsList(detail.strInstructions)}
            recipeName={mealName}
            ingredients={ingredientsList.map(item => `${item.measure} ${item.ingredient}`)}
            currentLanguage={currentLanguage}
            onClose={() => setIsCookModeActive(false)}
            onComplete={() => {
              setIsCookModeActive(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
