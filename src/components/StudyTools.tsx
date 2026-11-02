import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Sparkles, Trophy, Brain, Bot, RotateCw } from "lucide-react";
import { Flashcard, QuizQuestion } from "../services/geminiService";
import { MathText } from "./MathText";
import "katex/dist/katex.min.css";

interface StudyToolsProps {
  type: "flashcards" | "quiz";
  data: any[];
  onClose: () => void;
  topic: string;
  characterName?: string;
  onAskMahi?: (questionText: string) => void;
}

export const StudyTools: React.FC<StudyToolsProps> = ({ 
  type, 
  data, 
  onClose, 
  topic, 
  characterName = "Mahi",
  onAskMahi 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const safeData = Array.isArray(data) && data.length > 0 ? data : [];
  const currentItem = safeData[currentIndex];

  const handleNext = () => {
    if (currentIndex < safeData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const handleQuizSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowExplanation(true);
    const correctIdx = (currentItem as QuizQuestion)?.correctAnswer ?? 0;
    if (index === correctIdx) {
      setScore(score + 1);
    }
  };

  const progressPercent = safeData.length > 0 ? ((currentIndex + 1) / safeData.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xl overflow-y-auto bg-notebook-subtle"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="stranger-card-premium w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto transition-all duration-500"
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 stranger-scribble-border">
              <Brain size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-2xl bg-orange-500 text-white shadow-sm">
                  {type === "quiz" ? "Assessment" : "Revision"}
                </span>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-1">
                  {currentIndex + 1} / {safeData.length}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-white truncate mt-1 stranger-text-editorial">
                {topic}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-all text-stone-500 dark:text-stone-300 cursor-pointer shrink-0 ml-2 shadow-sm"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1 bg-stone-100 dark:bg-stone-800">
          <div 
            className="h-full bg-gradient-to-r from-[#FF7A30] to-amber-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col justify-center min-h-[380px] bg-white dark:bg-stone-900">
          {safeData.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <AlertCircle size={40} className="text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                Generating questions with {characterName}...
              </p>
            </div>
          ) : isFinished ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 px-4 space-y-5"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <Trophy size={42} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-stone-900 dark:text-white">
                  {type === "quiz" && score >= Math.ceil(safeData.length * 0.7) ? "দারুণ পারফরম্যান্স!" : "অনুশীলন সম্পন্ন!"}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {characterName} আপনার পুরো প্রশ্ন সেটের ফলাফল রেকর্ড করে নিয়েছে।
                </p>
              </div>

              {type === "quiz" && (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 max-w-xs mx-auto">
                  <span className="text-[11px] font-mono text-stone-400 font-bold uppercase tracking-wider block mb-1">
                    Your Score
                  </span>
                  <div className="text-3xl font-black text-[#FF7A30]">
                    {score} <span className="text-stone-400 text-lg font-bold">/ {safeData.length}</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">
                    +{score * 20} XP Earned
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button 
                  onClick={onClose}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#FF7A30] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Back to {characterName}
                </button>
                <button 
                  onClick={() => {
                    setCurrentIndex(0);
                    setScore(0);
                    setSelectedOption(null);
                    setShowExplanation(false);
                    setIsFinished(false);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCw size={14} />
                  <span>Practice Again</span>
                </button>
              </div>
            </motion.div>
          ) : type === "flashcards" ? (
            <div className="w-full max-w-md mx-auto perspective-1000">
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 220, damping: 20 }}
                className="relative w-full aspect-[4/3] cursor-pointer preserve-3d"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front (Question) - Crisp White Card */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-3xl p-7 flex flex-col items-center justify-between text-center shadow-lg">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 border border-orange-500/30 px-3 py-1 rounded-2xl bg-orange-500/5">
                      Prompt
                    </span>
                    <span className="text-[9px] text-stone-400 font-black uppercase tracking-widest">
                      Physical Flip Mode
                    </span>
                  </div>
                  <div className="text-base sm:text-lg text-stone-900 dark:text-white font-bold leading-relaxed my-auto">
                    <MathText text={(currentItem as Flashcard)?.question || (currentItem as any)?.front || ""} />
                  </div>
                  <p className="text-[11px] font-bold text-[#FF7A30] flex items-center gap-1">
                    <Sparkles size={13} />
                    <span>উত্তর দেখতে কার্ডে ট্যাপ করুন</span>
                  </p>
                </div>

                {/* Back (Answer) - Soft Emerald Tinted Card */}
                <div 
                  className="absolute inset-0 backface-hidden bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-400 dark:border-emerald-600 rounded-3xl p-7 flex flex-col items-center justify-between text-center shadow-lg"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Verified Answer
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">
                      WBCHSE Syllabus
                    </span>
                  </div>
                  <div className="text-base sm:text-lg text-emerald-950 dark:text-emerald-50 font-bold leading-relaxed my-auto">
                    <MathText text={(currentItem as Flashcard)?.answer || (currentItem as any)?.back || ""} />
                  </div>
                  <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    Tap to flip back
                  </p>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              {/* Question Banner */}
              <div className="p-6 rounded-[2rem] bg-stone-100/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] block mb-2">
                  Question Unit
                </span>
                <div className="text-base sm:text-xl font-black leading-tight stranger-text-editorial">
                  <MathText text={(currentItem as QuizQuestion)?.question || (currentItem as any)?.questionEn || ""} />
                </div>
              </div>

              {/* 4 Crisp Options */}
              <div className="grid gap-3">
                {((currentItem as QuizQuestion)?.options || []).map((option, idx) => {
                  const correctIdx = (currentItem as QuizQuestion)?.correctAnswer ?? (currentItem as any)?.correctIndex ?? 0;
                  const isCorrect = idx === correctIdx;
                  const isSelected = selectedOption === idx;
                  
                  let optionClass = "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 hover:border-orange-500/50 hover:shadow-lg hover:-translate-y-0.5";

                  if (showExplanation) {
                    if (isCorrect) {
                      optionClass = "bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-black shadow-lg shadow-emerald-500/10";
                    } else if (isSelected) {
                      optionClass = "bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-100 font-black shadow-lg shadow-rose-500/10";
                    } else {
                      optionClass = "opacity-30 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-500 grayscale";
                    }
                  } else if (isSelected) {
                    optionClass = "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black ring-4 ring-orange-500/5 shadow-xl";
                  }

                  return (
                    <button
                      key={`study-opt-${currentIndex}-${idx}`}
                      onClick={() => handleQuizSelect(idx)}
                      disabled={showExplanation}
                      className={`w-full p-4.5 sm:p-5 rounded-2xl border-2 text-left transition-all duration-500 flex items-center justify-between cursor-pointer ${optionClass}`}
                    >
                      <div className="flex items-center gap-4 min-w-0 pr-2">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-500 ${
                          isSelected ? "bg-orange-500 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div className="text-sm sm:text-base font-bold truncate tracking-tight">
                          <MathText text={option} />
                        </div>
                      </div>

                      {showExplanation && isCorrect && (
                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                      )}
                      {showExplanation && isSelected && !isCorrect && (
                        <AlertCircle size={20} className="text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                        💡 ব্যাখা ও সমাধান (Explanation)
                      </span>
                      {onAskMahi && (
                        <button
                          type="button"
                          onClick={() => {
                            const qText = (currentItem as QuizQuestion)?.question || "";
                            onAskMahi(qText);
                          }}
                          className="text-[10px] font-black text-[#FF7A30] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Bot size={12} />
                          <span>Ask {characterName} to explain</span>
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                      <MathText text={(currentItem as QuizQuestion)?.explanation || (currentItem as any)?.explanationBn || (currentItem as any)?.explanationEn || ""} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        {!isFinished && safeData.length > 0 && (
          <div className="px-5 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/90 flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={type === "quiz" && selectedOption === null}
              className="px-5 py-2.5 rounded-xl bg-[#FF7A30] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 shadow-sm shadow-orange-500/20 cursor-pointer active:scale-95"
            >
              <span>{currentIndex === safeData.length - 1 ? "Finish" : "Next"}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}} />
    </motion.div>
  );
};
