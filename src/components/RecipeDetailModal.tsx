import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Clock,
  Gauge,
  Globe,
  Users,
  Check,
  ShoppingCart,
  Bookmark,
  ChevronRight,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Share2,
  Youtube,
  Sparkles,
  DollarSign,
  Star
} from "lucide-react";
import { AIRecipe } from "../types";
import { t } from "../data/languages";

interface RecipeDetailModalProps {
  recipe: AIRecipe;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onAddMissingToCart: (items: string[]) => void;
  onStartTimer?: (seconds: number) => void;
  userRating: number;
  onRateRecipe: (rating: number) => void;
  onLogCooked: () => void;
  cookCount: number;
  onAddToTasks?: (title: string, notes: string) => Promise<any>;
  currentLanguage: string;
}

export default function RecipeDetailModal({
  recipe,
  onClose,
  isSaved,
  onToggleSave,
  onAddMissingToCart,
  onStartTimer,
  userRating,
  onRateRecipe,
  onLogCooked,
  cookCount,
  onAddToTasks,
  currentLanguage,
}: RecipeDetailModalProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [exportingTasks, setExportingTasks] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  const tr = (key: string, fallback?: string): string => {
    return t(key, currentLanguage, fallback);
  };

  const handleExportToTasks = async () => {
    if (!onAddToTasks) return;
    setExportingTasks(true);
    try {
      const title = `Prepare ${recipe.emoji} ${recipe.name}`;
      const notes = `Cuisine: ${recipe.cuisine}\nPrep/Cook Time: ${recipe.time} mins\nDifficulty: ${recipe.difficulty}\n\nIngredients required:\n${recipe.allIngs.map(i => '- ' + i).join('\n')}\n\nCooking Steps:\n${recipe.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}`;
      await onAddToTasks(title, notes);
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setExportingTasks(false);
    }
  };

  const toggleIngredientCheck = (ing: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [ing]: !prev[ing] }));
  };

  const toggleStepCheck = (index: number) => {
    setCompletedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleShare = () => {
    try {
      const shareText = `Cooking ${recipe.emoji} ${recipe.name}! Check out this amazing recipe: ${recipe.desc}`;
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const progressPercentage = Math.round(
    (Object.values(completedSteps).filter(Boolean).length / recipe.steps.length) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      {/* Backdrop Closers */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-[#FAF8F4] text-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 border border-amber-100"
      >
        {/* Playfair & Forest Color Themed Banner */}
        <div className="relative bg-[#1E3D2F] text-[#FAF8F4] p-6 sm:p-8 shrink-0 overflow-hidden border-b border-amber-900/10">
          {/* Graphic Background Elements */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

          {/* Action Header Button Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              id="share-recipe-btn"
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[#FAF8F4] transition-all border border-white/10"
              title="Copy recipe details to clipboard"
            >
              {copiedLink ? <span className="text-xs font-bold text-amber-300 font-mono">{tr("copied", "Copied!")}</span> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              id={`detail-fav-btn-${recipe.id}`}
              onClick={onToggleSave}
              className={`p-2.5 rounded-xl transition-all border shrink-0 active:scale-95 ${
                isSaved
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "bg-white/10 border-white/10 hover:bg-white/20 text-[#FAF8F4]"
              }`}
              title={isSaved ? "Remove from Saved Recipes" : "Save to Favorites"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
            <button
              id="close-recipe-btn"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:text-white shrink-0 active:scale-95 transition-all"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category & Title */}
          <div className="space-y-2 max-w-[85%]">
            <div className="text-[52px] leading-none mb-1 select-none">{recipe.emoji}</div>
            <h2 className="text-xl sm:text-2xl font-serif font-black leading-tight text-white tracking-normal font-bold">
              {tr(recipe.name, recipe.name)}
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF8F4]/80 italic max-w-lg font-medium">
              "{tr(recipe.desc, recipe.desc)}"
            </p>
          </div>

          {/* Recipe Metadata badges */}
          <div className="flex flex-wrap gap-1.5 mt-5 max-w-[95%]">
            {onStartTimer ? (
              <button
                type="button"
                id="modal-trigger-timer-badge"
                onClick={() => onStartTimer(recipe.time * 60)}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 border border-amber-400 text-[#FAF8F4] rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                title={`Start ${recipe.time} min kitchen timer!`}
              >
                <Clock className="w-3.5 h-3.5 text-white animate-bounce" />
                <span>⏱️ {tr("timer", "Timer")} ({recipe.time}{tr("minutes", "m")})</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>⏱ {recipe.time} {tr("minutes", "Min")}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-semibold">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>👨‍🍳 {tr(recipe.difficulty, recipe.difficulty)}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>🌍 {tr(recipe.cuisine, recipe.cuisine)}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span>👥 {recipe.servings} {tr("servings", "Servings")}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 scrollbar-thin">
          
          {/* Interactive Star Rating Component */}
          <div className="bg-white border border-amber-150/60 rounded-2xl p-4 sm:p-4.5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4 shadow-xs border-dashed">
            <div className="space-y-1">
              <h4 className="text-sm font-serif font-black text-slate-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>{tr("rating", "My Culinary Rating")}</span>
              </h4>
              <p className="text-xs text-slate-500 font-medium font-sans">
                {userRating > 0 ? (
                  <>
                    {tr("youScored", "You scored this:")}{" "}
                    <span className="font-bold text-[#D95F2B]">
                      {userRating === 1 && tr("meh", "⭐ Meh")}
                      {userRating === 2 && tr("okay", "⭐⭐ Okay")}
                      {userRating === 3 && tr("delicious", "⭐⭐⭐ Delicious")}
                      {userRating === 4 && tr("highlyRecommend", "⭐⭐⭐⭐ Highly Recommend!")}
                      {userRating === 5 && tr("masterpiece", "⭐⭐⭐⭐⭐ Outstanding Masterpiece!")}
                    </span>
                  </>
                ) : (
                  tr("ratingPrompt", "How did this turn out? Give your kitchen result a rating!")
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 border-r pr-4 border-slate-150/50">
              <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(null)}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = hoveredRating !== null ? star <= hoveredRating : star <= userRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      id={`star-${star}-btn`}
                      onClick={() => onRateRecipe(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      className="p-1 text-amber-400 hover:scale-120 active:scale-90 transition-transform outline-hidden cursor-pointer"
                      title={`Rate ${star} Star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`w-5.5 h-5.5 transition-colors ${
                          isFilled ? "fill-amber-400 text-amber-500" : "text-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              
              {userRating > 0 && (
                <button
                  type="button"
                  id="star-clear-btn"
                  onClick={() => onRateRecipe(0)}
                  className="text-xs font-bold text-slate-400 hover:text-orange-500 underline cursor-pointer duration-150 transition-colors ml-2"
                  title="Clear my rating"
                >
                  {tr("clearAll", "Clear")}
                </button>
              )}
            </div>
          </div>

          {/* Interactive Cooking Journal log segment */}
          <div className="bg-white border border-amber-150/60 rounded-2xl p-4 sm:p-4.5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4 shadow-xs border-dashed">
            <div className="space-y-1">
              <h4 className="text-sm font-serif font-black text-slate-900 flex items-center gap-1.5">
                <span className="text-sm">🍳</span>
                <span>{tr("myCookingLog", "My Cooking Log")}</span>
              </h4>
              <p className="text-xs text-slate-500 font-medium font-sans">
                {cookCount > 0 ? (
                  <>
                    {tr("youPrepared", "You prepared this dish")}{" "}
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {cookCount} {cookCount === 1 ? tr("time", "time") : tr("times", "times")}
                    </span>
                  </>
                ) : (
                  tr("notPreparedYet", "Not prepared yet. Mark as cooked to record your kitchen log history!")
                )}
              </p>
            </div>

            <button
              type="button"
              id="log-cooked-btn"
              onClick={onLogCooked}
              className="px-4 py-2 bg-[#2B6B44] hover:bg-[#1E4A2E] text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
              title="Add a culinary entry for this recipe to your history journal!"
            >
              <span>🍳 {tr("cookedThis", "Cooked this!")}</span>
            </button>
          </div>
          
          {/* Chef's Culinary Overview, Price, & video link */}
          <div className="bg-[#FFF9F2] border border-amber-200/60 rounded-2xl p-4.5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-[#D95F2B] font-serif font-black text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{tr("recipeOverview", "Chef's Recipe Overview")}</span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              {tr(recipe.overview || recipe.desc || "A beautifully curated gourmet dish centered on flavor balance and peak execution guidelines crafted by our virtual Chef Gemini.")}
            </p>

            <div className="h-px bg-amber-100" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              {/* Est Price */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#2B6B44] flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{tr("estPrice", "Est. Market Price")}</div>
                  <div className="text-sm font-serif font-black text-[#2B6B44]">
                    {recipe.marketPrice || "$4.50 - $6.50"}
                  </div>
                </div>
              </div>

              {/* YouTube & Google Tasks Links */}
              <div className="flex flex-wrap gap-2 justify-end">
                {onAddToTasks && (
                  <button
                    type="button"
                    onClick={handleExportToTasks}
                    disabled={exportingTasks}
                    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm cursor-pointer ${
                      exportedSuccess 
                        ? "bg-emerald-600 hover:bg-emerald-700" 
                        : "bg-[#4285F4] hover:bg-[#357AE8]"
                    }`}
                  >
                    <span>🗓️</span>
                    <span>
                      {exportingTasks ? tr("exporting", "Exporting...") : exportedSuccess ? tr("exported", "✓ Exported!") : tr("exportTasks", "Export to Tasks")}
                    </span>
                  </button>
                )}
                
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.youtubeQuery || `how to cook ${recipe.name} tutorial`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FF0000] hover:bg-[#CC0000] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
                >
                  <Youtube className="w-4 h-4 stroke-[2.5]" />
                  <span>{tr("watchYoutube", "Watch YouTube Cooking Guide")}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Nutritional Info Estimation Card */}
          {recipe.nutritional && (
            <div className="bg-white border border-amber-100 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  🥗 {tr("nutFacts", "Nutritional Facts")} <span className="text-[10px] text-slate-400 normal-case font-normal font-sans">({tr("perServing", "estimated per serving")})</span>
                </span>
                <span className="text-[11px] text-[#D95F2B] font-bold">{tr("geminiVerified", "Chef Gemini Verified")}</span>
              </div>
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="bg-[#FAF8F4] p-2.5 rounded-xl border border-amber-100/50">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">{tr("calories", "Calories")}</div>
                  <div className="text-sm sm:text-base font-serif font-black text-slate-900">{recipe.nutritional.calories}</div>
                  <div className="text-[9px] text-slate-400 font-mono">kcal</div>
                </div>
                <div className="bg-[#FAF8F4] p-2.5 rounded-xl border border-amber-100/50">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">{tr("protein", "Protein")}</div>
                  <div className="text-sm sm:text-base font-serif font-black text-[#2B6B44]">{recipe.nutritional.protein}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{tr("grams", "grams")}</div>
                </div>
                <div className="bg-[#FAF8F4] p-2.5 rounded-xl border border-amber-100/50">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">{tr("carbs", "Carbs")}</div>
                  <div className="text-sm sm:text-base font-serif font-black text-[#D95F2B]">{recipe.nutritional.carbs}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{tr("grams", "grams")}</div>
                </div>
                <div className="bg-[#FAF8F4] p-2.5 rounded-xl border border-amber-100/50">
                  <div className="text-[10px] text-slate-400 font-bold mb-0.5">{tr("fat", "Fat")}</div>
                  <div className="text-sm sm:text-base font-serif font-black text-amber-800">{recipe.nutritional.fat}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{tr("grams", "grams")}</div>
                </div>
              </div>
            </div>
          )}

          {/* Missing Checklist Promo Card */}
          {recipe.missing && recipe.missing.length > 0 && (
            <div className="bg-[#FFF1EA] border border-orange-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 bg-orange-500/10 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">{tr("needIngredients", "Need ingredients?")}</h4>
                  <p className="text-[11px] text-slate-500">
                    {tr("youAreMissing", "You are missing")} <span className="font-bold text-orange-600">{recipe.missing.length} {tr("ingredients", "ingredients")}</span> {tr("forThisDish", "for this dish. Add them straight to your shopping cart!")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="add-missing-bag-btn"
                onClick={() => {
                  onAddMissingToCart(recipe.missing);
                }}
                className="w-full sm:w-auto bg-[#D95F2B] hover:bg-[#b04a1f] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {tr("addToCart", "Add to Cart")}
              </button>
            </div>
          )}

          {/* Stock comparison split grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* You Have group */}
            <div className="bg-[#E6F4EC] border border-emerald-100 rounded-2xl p-4 space-y-3">
              <span className="text-[11px] bg-[#2B6B44]/10 text-[#2B6B44] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider font-mono">
                ✅ {tr("inStock", "In Stock")}
              </span>
              <div className="space-y-1.5">
                {recipe.used && recipe.used.length > 0 ? (
                  recipe.used.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[#2B6B44]">
                      <Check className="w-4 h-4 shrink-0 stroke-[3]" />
                      <span className="truncate capitalize">{tr(item, item)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic pr-3">{tr("noMatched", "No matched items.")}</p>
                )}
              </div>
            </div>

            {/* You Need group */}
            <div className="bg-[#FFF1EA] border border-orange-100 rounded-2xl p-4 space-y-3">
              <span className="text-[11px] bg-[#D95F2B]/10 text-[#D95F2B] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider font-mono">
                🛒 {tr("outOfStock", "Missing / Need to Get")}
              </span>
              <div className="space-y-1.5">
                {recipe.missing && recipe.missing.length > 0 ? (
                  recipe.missing.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[#D95F2B]">
                      <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate capitalize">{tr(item, item)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">{tr("allInStock", "You have everything in stock!")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Checklist Ingredients Segment */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 border-b pb-2 border-slate-200/60 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1E3D2F]" />
              {tr("completeChecklist", "Complete Ingredients Checklist")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.allIngs.map((ing) => {
                const isSelected = !!checkedIngredients[ing];
                return (
                  <button
                    key={ing}
                    type="button"
                    onClick={() => toggleIngredientCheck(ing)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition-all outline-hidden cursor-pointer ${
                      isSelected
                        ? "bg-[#E6F4EC] border-emerald-100 text-[#2B6B44]/70"
                        : "bg-white border-slate-200/60 hover:bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1.5">
                      <span className={`w-4 h-4 rounded-md border shrink-0 flex items-center justify-center transition-all ${
                        isSelected ? "bg-[#2B6B44] border-[#2B6B44] text-white" : "border-slate-300 bg-white"
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                      </span>
                      <span className={`font-semibold capitalize truncate ${isSelected ? "line-through opacity-60" : ""}`}>
                        {tr(ing, ing)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper directions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2 border-slate-200/60">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#1E3D2F]" />
                {tr("howToCook", "How to Cook Interactive Steps")}
              </h3>
              {progressPercentage > 0 && (
                <span className="text-xs font-mono font-bold bg-[#E6F4EC] text-[#2B6B44] px-2.5 py-1 rounded-full">
                  {progressPercentage}% {tr("completed", "Completed")}
                </span>
              )}
            </div>

            {/* Cooking Progress Bar */}
            <div className="h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-[#2B6B44] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="space-y-3 pt-1">
              {recipe.steps.map((step, index) => {
                const isStepDone = !!completedSteps[index];
                return (
                  <div
                    key={index}
                    onClick={() => toggleStepCheck(index)}
                    className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                      isStepDone
                        ? "bg-emerald-50/40 border-emerald-100 text-slate-400"
                        : "bg-white border-slate-200/60 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all shrink-0 border ${
                        isStepDone
                          ? "bg-[#2B6B44] border-[#2B6B44] text-white"
                          : "bg-[#1E3D2F]/5 border-[#1E3D2F]/10 text-[#1E3D2F]"
                      }`}
                    >
                      {isStepDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : index + 1}
                    </button>
                    <p className={`text-sm leading-relaxed ${isStepDone ? "line-through opacity-75" : ""}`}>
                      {tr(step, step)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="shrink-0 p-4 bg-[#EDE8DE] border-t border-amber-100/55 flex justify-between items-center text-xs font-bold">
          <span className="text-slate-500 font-serif italic">
            {tr("chefHelper", "Chef Gemini AI Curated Kitchen helper")}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2 bg-[#1E3D2F] hover:bg-[#152c22] text-[#FAF8F4] rounded-lg transition-colors active:scale-95"
          >
            {tr("finishedCooking", "Finished Cooking")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
