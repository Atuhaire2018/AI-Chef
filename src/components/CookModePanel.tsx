import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Check,
  Sparkles,
  Timer,
  List,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";
import { t } from "../data/languages";
import { alarmSoundEngine } from "../utils/audio";

interface CookModePanelProps {
  steps: string[];
  recipeName: string;
  ingredients: string[];
  onClose: () => void;
  onComplete?: () => void;
  currentLanguage: string;
}

export default function CookModePanel({
  steps,
  recipeName,
  ingredients,
  onClose,
  onComplete,
  currentLanguage,
}: CookModePanelProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showIngredientsPeek, setShowIngredientsPeek] = useState(false);

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerMax, setTimerMax] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  const tr = (key: string, fallback?: string): string => {
    return t(key, currentLanguage, fallback);
  };

  // Safe Speech Synthesis references
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Parse step duration dynamically from instruction text
  const parseStepDuration = (text: string): number => {
    const minMatch = text.match(/(\d+)\s*(?:minutes|minute|mins|min)\b/i);
    if (minMatch && minMatch[1]) {
      return parseInt(minMatch[1], 10) * 60;
    }
    const secMatch = text.match(/(\d+)\s*(?:seconds|second|secs|sec)\b/i);
    if (secMatch && secMatch[1]) {
      return parseInt(secMatch[1], 10);
    }
    return 0;
  };

  // Reset/configure step timer and speech on step change
  useEffect(() => {
    // 1. Stop any current speech
    cancelSpeech();

    // 2. Parse step duration
    const duration = parseStepDuration(steps[currentStepIdx] || "");
    if (duration > 0) {
      setTimerSeconds(duration);
      setTimerMax(duration);
      setTimerRunning(false);
    } else {
      setTimerSeconds(null);
      setTimerMax(0);
      setTimerRunning(false);
    }

    // 3. Auto-speak if enabled
    if (autoSpeak) {
      // Small timeout to let transitions finish
      const tId = setTimeout(() => {
        speakCurrentStep();
      }, 350);
      return () => clearTimeout(tId);
    }
  }, [currentStepIdx]);

  // Clean up timer and speech on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      cancelSpeech();
    };
  }, []);

  // Countdown logic
  useEffect(() => {
    if (timerRunning && timerSeconds !== null && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev !== null && prev <= 1) {
            // Timer finished!
            setTimerRunning(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            // Trigger alarm sound
            alarmSoundEngine.play();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning, timerSeconds]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        // Toggle play/pause of timer or speak
        if (timerSeconds !== null) {
          setTimerRunning((prev) => !prev);
        } else {
          toggleSpeech();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStepIdx, timerSeconds]);

  // Speech Helper functions
  const speakCurrentStep = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // clear queue

    const rawText = steps[currentStepIdx];
    if (!rawText) return;

    // Clean text for nicer reading
    const textToSpeak = tr(rawText, rawText);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    // Find a nice voice for the active language if possible
    const voices = window.speechSynthesis.getVoices();
    const langCode = currentLanguage === "es" ? "es" : currentLanguage === "fr" ? "fr" : currentLanguage === "de" ? "de" : "en";
    
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    
    utterance.lang = langCode;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const cancelSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      cancelSpeech();
    } else {
      speakCurrentStep();
    }
  };

  const handleNext = () => {
    alarmSoundEngine.stop(); // Safe guard
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      // Completed last step!
      alarmSoundEngine.play();
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handlePrev = () => {
    alarmSoundEngine.stop(); // Safe guard
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercentage = Math.round(((currentStepIdx + 1) / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1E3D2F] text-[#FAF8F4] overflow-hidden font-sans select-none">
      {/* Background Graphic Watermark */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-800/10 pointer-events-none" />
      <div className="absolute -bottom-48 -right-32 w-[600px] h-[600px] rounded-full bg-amber-500/5 pointer-events-none" />

      {/* Header controls bar */}
      <header className="shrink-0 px-6 py-4 border-b border-white/10 flex items-center justify-between z-10 backdrop-blur-md bg-[#1E3D2F]/80">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <UtensilsCrossed className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400/80 font-mono">
              {tr("cookModeActive", "Cook Mode Session")}
            </span>
            <h1 className="text-sm sm:text-base font-serif font-black tracking-wide text-white line-clamp-1">
              {tr(recipeName, recipeName)}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Auto-Speak Toggle */}
          <button
            type="button"
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (!autoSpeak) {
                speakCurrentStep();
              } else {
                cancelSpeech();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              autoSpeak
                ? "bg-amber-500 border-amber-400 text-white shadow-md shadow-amber-950/20"
                : "bg-white/5 border-white/10 text-[#FAF8F4]/80 hover:bg-white/10"
            }`}
            title="Automatically read step aloud when navigating"
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {autoSpeak ? tr("voiceOn", "Voice: Autoread") : tr("voiceOff", "Voice: Off")}
            </span>
          </button>

          {/* View Ingredients Panel Trigger */}
          <button
            type="button"
            onClick={() => setShowIngredientsPeek(!showIngredientsPeek)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
            title="Peek Ingredients checklist"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Close Panel */}
          <button
            type="button"
            onClick={() => {
              alarmSoundEngine.stop();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
            title="Exit Cook Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Master Progression Progress Indicator */}
      <div className="shrink-0 h-1.5 bg-emerald-950/40 relative">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 shadow-sm"
          style={{ width: `${progressPercentage}%` }}
        />
        <span className="absolute top-2.5 right-6 text-[10px] font-mono font-bold text-emerald-400">
          {tr("step", "Step")} {currentStepIdx + 1} / {steps.length} ({progressPercentage}%)
        </span>
      </div>

      {/* Main Slide Workspace */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 sm:p-12 gap-8 z-10 max-w-6xl mx-auto w-full overflow-y-auto">
        {/* Step detail card */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl w-full py-4 text-center md:text-left min-h-[300px]">
          <span className="text-amber-400 font-mono text-sm font-black uppercase tracking-widest mb-2 block select-none">
            ⭐ {tr("step", "Step")} {currentStepIdx + 1}
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6"
            >
              <h2 className="text-2xl sm:text-4xl font-serif font-black leading-snug text-white tracking-normal drop-shadow-sm">
                {tr(steps[currentStepIdx], steps[currentStepIdx])}
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* Text to Speech controller box */}
          <div className="pt-6 flex flex-wrap gap-3 items-center justify-center md:justify-start">
            <button
              type="button"
              onClick={toggleSpeech}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                isSpeaking
                  ? "bg-amber-500 text-white shadow-md border border-amber-400"
                  : "bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-100 border border-emerald-800/40"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 animate-bounce" />
                  <span>{tr("stopListening", "Mute Audio Narration")}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{tr("listenStep", "Listen to Voice Assistant")}</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-emerald-300/60 font-mono hidden sm:inline">
              💡 {tr("keyboardTips", "Tip: Use Left/Right keys on your keyboard")}
            </span>
          </div>
        </div>

        {/* Floating Side Panel: Interactive countdown timer */}
        {timerSeconds !== null && (
          <div className="shrink-0 w-full max-w-[280px] bg-emerald-950/30 border border-emerald-800/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-xl backdrop-blur-xs">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              <Timer className="w-4 h-4" />
              <span>{tr("stepTimer", "Step Timer")}</span>
            </div>

            {/* Circular display layout */}
            <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-4 border-emerald-800/30">
              <svg className="absolute inset-0 w-full h-full rotate-270">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray={402}
                  strokeDashoffset={402 - (402 * (timerSeconds || 0)) / (timerMax || 1)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="z-10 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold tracking-tight text-white drop-shadow-md">
                  {formatTime(timerSeconds)}
                </span>
                <span className="text-[9px] font-bold text-emerald-300/60 uppercase tracking-wider font-mono">
                  {timerRunning ? tr("running", "Running") : tr("paused", "Paused")}
                </span>
              </div>
            </div>

            {/* Timer Controllers */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className={`p-3 rounded-full transition-all active:scale-95 ${
                  timerRunning
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
                title={timerRunning ? "Pause Timer" : "Start Timer"}
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTimerSeconds(timerMax);
                  setTimerRunning(false);
                  alarmSoundEngine.stop();
                }}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Actions Bar */}
      <footer className="shrink-0 p-5 border-t border-white/10 bg-[#152a20]/90 backdrop-blur-md flex justify-between items-center z-10">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStepIdx === 0}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 select-none ${
            currentStepIdx === 0
              ? "opacity-35 cursor-not-allowed bg-white/5 text-white/40"
              : "bg-white/10 hover:bg-white/20 active:scale-95 text-white cursor-pointer"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{tr("previousStep", "Prev Step")}</span>
        </button>

        {/* Staggered progress dot tracker */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto px-4 max-w-sm">
          {steps.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentStepIdx(idx)}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 shrink-0 ${
                idx === currentStepIdx
                  ? "w-8 bg-amber-400"
                  : idx < currentStepIdx
                  ? "w-2 bg-emerald-500"
                  : "w-2 bg-white/25 hover:bg-white/45"
              }`}
              title={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-[#1E3D2F] font-extrabold text-xs transition-all shadow-md shadow-amber-950/20 select-none cursor-pointer"
        >
          {currentStepIdx === steps.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4 animate-pulse text-[#1E3D2F]" />
              <span>{tr("doneCooked", "I'm Done! 🍳")}</span>
            </>
          ) : (
            <>
              <span>{tr("nextStep", "Next Step")}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </footer>

      {/* Floating Ingredients List Drawer Overlay */}
      <AnimatePresence>
        {showIngredientsPeek && (
          <div className="fixed inset-0 z-40 flex justify-end">
            {/* Backdrop Closer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIngredientsPeek(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Drawer Body panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm bg-[#FAF8F4] text-slate-800 shadow-2xl flex flex-col h-full z-10 border-l border-amber-100"
            >
              <div className="p-5 border-b border-amber-100 bg-[#EFECE6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="w-4.5 h-4.5 text-emerald-800" />
                  <h3 className="font-serif font-black text-slate-900 text-sm">
                    {tr("ingredientsCheck", "Recipe Ingredients")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIngredientsPeek(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-2">
                {ingredients.map((ing) => (
                  <div
                    key={ing}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-100/50 text-xs font-semibold text-slate-700"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{tr(ing, ing)}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#EFECE6] text-[10px] text-slate-500 text-center font-mono font-medium">
                {tr("scrollHint", "Quick list of necessary parts")}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
