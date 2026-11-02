import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, CheckCircle2, BookOpen, Brain, ExternalLink } from "lucide-react";
import { MathText } from "./MathText";
import "katex/dist/katex.min.css";

interface ActionLogProps {
  logs: { id: string; text: string; details?: any }[];
  isVisible?: boolean;
  onClose?: () => void;
  onOpenDeck?: () => void;
  hasActiveDeck?: boolean;
  characterName?: string;
}

export function ActionLog({ 
  logs, 
  isVisible = true, 
  onClose,
  onOpenDeck,
  hasActiveDeck = false,
  characterName = "Mahi"
}: ActionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // When mic is turned off or not visible or logs are empty, hide immediately
  if (!isVisible || logs.length === 0) return null;

  const hasGeneratedQuestions = hasActiveDeck || logs.some(l => 
    l.text.toLowerCase().includes("question") || 
    l.text.toLowerCase().includes("deck") ||
    l.text.toLowerCase().includes("generated")
  );

  return (
    <AnimatePresence>
      <motion.div
        key="action-log-card"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed bottom-24 left-3 right-3 sm:left-6 sm:right-auto sm:w-[390px] z-50 bg-white/98 dark:bg-stone-900/98 backdrop-blur-2xl border-2 border-stone-100 dark:border-stone-800 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] overflow-hidden transition-all"
      >
        {/* Top Header - Pure Crisp White Theme */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-50/90 dark:bg-stone-800/90 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-xl bg-orange-500/10 text-[#FF7A30] flex items-center justify-center shrink-0">
              <Sparkles size={14} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  {characterName} Agent Log
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
              LIVE
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Dismiss log"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Log Stream */}
        <div 
          ref={scrollRef}
          className="p-3.5 sm:p-4 max-h-48 sm:max-h-56 overflow-y-auto font-mono text-[11px] sm:text-xs leading-relaxed space-y-2 scrollbar-hide text-stone-800 dark:text-stone-200"
        >
          <AnimatePresence mode="popLayout">
            {logs.map((log, idx) => {
              const isSuccess = log.text.includes("✨") || log.text.includes("🎯") || log.text.includes("Verified");
              const isWarning = log.text.includes("⚠️") || log.text.includes("Failed");
              
              return (
                <motion.div
                  key={`${log.id}-${idx}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-2 p-2 rounded-xl transition-colors ${
                    isSuccess 
                      ? "bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-100" 
                      : isWarning
                      ? "bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-900 dark:text-amber-100"
                      : "bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-800/40"
                  }`}
                >
                  <span className="text-orange-500 font-bold shrink-0 mt-0.5">&rsaquo;</span>
                  <div className="break-words font-medium flex-1">
                    <MathText text={log.text} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Mobile Quick Action Pill when Questions are ready */}
        {hasGeneratedQuestions && onOpenDeck && (
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/70 border-t border-stone-200/80 dark:border-stone-800">
            <button
              onClick={onOpenDeck}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF7A30] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Brain size={14} />
              <span>Open Interactive Questions Deck</span>
              <ExternalLink size={13} />
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
