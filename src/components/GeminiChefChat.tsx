import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Globe, 
  RotateCcw, 
  X, 
  Zap, 
  FlaskConical, 
  ChefHat, 
  Leaf, 
  ExternalLink,
  MessageSquare,
  ChevronDown,
  Loader2
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  modelUsed?: string;
  groundingSources?: Array<{ title?: string; uri?: string }>;
}

export type ChefRole = "sous-chef" | "speed-assistant" | "culinary-chemist" | "pantry-saver";

interface GeminiChefChatProps {
  isOpen: boolean;
  onClose: () => void;
  themeColors: any;
  initialQuery?: string;
  currentPantryItems?: string[];
}

export const GeminiChefChat: React.FC<GeminiChefChatProps> = ({
  isOpen,
  onClose,
  themeColors: C,
  initialQuery,
  currentPantryItems = []
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "Hello! I am your **AI Executive Sous-Chef**. Ask me anything about cooking techniques, ingredient substitutions, seasoning fixes, or what to make with ingredients in your fridge.\n\nToggle **Google Search Grounding** anytime for real-time supermarket prices, seasonal produce availability, and up-to-date food trends!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "gemini-3.5-flash"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [role, setRole] = useState<ChefRole>("sous-chef");
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Handle initial query if provided
  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, isOpen]);

  // Determine model preference for the API call
  // Rule: gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general tasks & search grounding, gemini-3.1-flash-lite for fast tasks
  const getModelPreference = (activeRole: ChefRole, searchEnabled: boolean): string => {
    if (searchEnabled) return "gemini-3.5-flash";
    if (activeRole === "culinary-chemist") return "gemini-3.1-pro-preview";
    if (activeRole === "speed-assistant") return "gemini-3.1-flash-lite";
    return "gemini-3.5-flash";
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage("");
    setLoading(true);

    const modelToUse = getModelPreference(role, useSearchGrounding);

    try {
      // Include current pantry context if available to assist the chef
      const conversationPayload = newHistory.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Enrich first prompt with current pantry items context if relevant
      if (currentPantryItems.length > 0 && conversationPayload.length === 2) {
        conversationPayload[0].content = `[Context: User's pantry contains: ${currentPantryItems.slice(0, 15).join(", ")}]\n\n${conversationPayload[0].content}`;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationPayload,
          role,
          modelPreference: modelToUse,
          useSearch: useSearchGrounding
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        content: data.text || "I apologize, but I couldn't generate a culinary response right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed || modelToUse,
        groundingSources: data.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter(Boolean) || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn("Chat submission error:", err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: "model",
        content: "I'm having a brief connection hitch with the kitchen line! Here is a general rule of thumb: always balance fat with acid, and salt gently in layers throughout cooking.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "fallback"
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "model",
        content: "Chat cleared! How can I help in the kitchen today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: getModelPreference(role, useSearchGrounding)
      }
    ]);
  };

  const quickPrompts = [
    { label: "Buttermilk Substitute", query: "What can I substitute for 1 cup of buttermilk in a recipe?" },
    { label: "Fix Salty Stew", query: "My stew is way too salty! How can I rescue it without ruining the texture?" },
    { label: "Current Peak Produce", query: "What fruits and vegetables are in peak harvest right now this week?" },
    { label: "Maillard Reaction", query: "Explain how the Maillard reaction creates flavor and how I can maximize it on a steak." }
  ];

  if (!isOpen) return null;

  return (
    <div 
      id="gemini-chef-chat-backdrop" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity duration-200"
      onClick={onClose}
    >
      <div 
        id="gemini-chef-chat-drawer"
        className="w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900 dark:text-white">Gemini Sous-Chef</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by Gemini • {getModelPreference(role, useSearchGrounding)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              id="clear-chat-btn"
              onClick={handleClearHistory}
              title="Reset conversation"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="close-chat-btn"
              onClick={onClose}
              title="Close chat"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chef Role Selector & Search Grounding Toggle */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          {/* Role selector */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setRole("sous-chef")}
              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                role === "sous-chef"
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 ring-1 ring-amber-400/50 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Sous-Chef</span>
              <span className="text-[9px] opacity-70">3.5-flash</span>
            </button>

            <button
              onClick={() => setRole("speed-assistant")}
              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                role === "speed-assistant"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 ring-1 ring-blue-400/50 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Speedy</span>
              <span className="text-[9px] opacity-70">3.1-flash-lite</span>
            </button>

            <button
              onClick={() => setRole("culinary-chemist")}
              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                role === "culinary-chemist"
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 ring-1 ring-purple-400/50 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
              <span>Food Chemist</span>
              <span className="text-[9px] opacity-70">3.1-pro</span>
            </button>

            <button
              onClick={() => setRole("pantry-saver")}
              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                role === "pantry-saver"
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-400/50 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero-Waste</span>
              <span className="text-[9px] opacity-70">3.5-flash</span>
            </button>
          </div>

          {/* Google Search Grounding Banner */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50">
            <div className="flex items-center gap-2 text-xs">
              <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
              <span className="font-semibold text-indigo-950 dark:text-indigo-200">Google Search Grounding</span>
              <span className="hidden sm:inline text-[11px] text-indigo-600/80 dark:text-indigo-300/80">
                • Real-time web info
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="search-grounding-toggle"
                checked={useSearchGrounding}
                onChange={(e) => setUseSearchGrounding(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <ChefHat className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? "bg-amber-600 text-white rounded-br-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/60"
                  }`}
                >
                  {/* Message body with formatted markdown-like paragraphs */}
                  <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                    {m.content.split("\n\n").map((para, idx) => (
                      <p key={idx} className="break-words">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Grounding Citations / Search Sources */}
                  {m.groundingSources && m.groundingSources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5">
                        <Globe className="w-3 h-3" />
                        <span>Google Search Grounding Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.groundingSources.slice(0, 3).map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <span className="truncate max-w-[140px]">{src.title || "Web Reference"}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer info: timestamp and model */}
                  <div
                    className={`mt-1.5 flex items-center justify-end gap-2 text-[10px] ${
                      isUser ? "text-amber-100/80" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {!isUser && m.modelUsed && (
                      <span className="font-mono">{m.modelUsed}</span>
                    )}
                    <span>{m.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-start animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0">
                <ChefHat className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Consulting culinary knowledge...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.query)}
              disabled={loading}
              className="px-2.5 py-1 rounded-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/40 whitespace-nowrap transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Message Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            id="chef-chat-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask the ${role.replace("-", " ")} a question...`}
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
          />
          <button
            type="submit"
            id="send-chef-chat-btn"
            disabled={!inputMessage.trim() || loading}
            className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl shadow-sm transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
