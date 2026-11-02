import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Zap, Timer, Trophy, Star, ChevronRight, Brain, AlertCircle, CheckCircle2 } from "lucide-react";
import { generateMockTestQuestions } from "../services/geminiService";
import { MCQQuestion } from "../types";
import { MathText } from "./MathText";
import "katex/dist/katex.min.css";

export const SpeedBlitz: React.FC<{ onClose: () => void; userName?: string; apiKey?: string }> = ({ onClose, userName = "Abhijit", apiKey }) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "result">("ready");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds blitz
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState<number | null>(null);

  const startBlitz = async () => {
    setIsLoading(true);
    try {
      const q = await generateMockTestQuestions({
        subject: "Mixed",
        topic: "General Class 12 Syllabus",
        difficulty: "medium",
        scope: "syllabus",
        isPYQ: false
      }, apiKey);
      setQuestions(q);
      setGameState("playing");
      setTimeLeft(60);
      setScore(0);
      setCurrentIndex(0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("result");
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleAnswer = (index: number) => {
    if (showAnswer !== null) return;
    
    setShowAnswer(index);
    const correct = index === questions[currentIndex].correctIndex;
    
    if (correct) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      setShowAnswer(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setGameState("result");
      }
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
    >
      <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col min-h-[600px] border border-white/20">
        <AnimatePresence mode="wait">
          {gameState === "ready" && (
            <motion.div 
              key="ready"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="p-12 text-center space-y-10 flex-1 flex flex-col justify-center items-center"
            >
              <div className="relative">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-32 h-32 rounded-[2.5rem] bg-amber-400 text-white flex items-center justify-center shadow-2xl shadow-amber-400/40"
                >
                  <Zap size={64} fill="currentColor" />
                </motion.div>
                <div className="absolute -bottom-4 -right-4 bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-white shadow-lg">
                  60 SECS
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">
                  Speed <span className="text-amber-500">Blitz</span>
                </h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Syncretic Reasoning Challenge</p>
              </div>

              <div className="grid grid-cols-2 gap-6 w-full">
                 <div className="p-6 bg-slate-50 rounded-3xl border border-dotted border-slate-200">
                    <p className="text-2xl font-black text-slate-800 tracking-tighter">MIXED</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syllabus</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl border border-dotted border-slate-200">
                    <p className="text-2xl font-black text-slate-800 tracking-tighter">10 Qs</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</p>
                 </div>
              </div>

              <button 
                onClick={startBlitz}
                disabled={isLoading}
                className="w-full group relative overflow-hidden py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-slate-900/30 active:scale-95 transition-all disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10">{isLoading ? "SYNCING DATA..." : "BEGIN CHALLENGE"}</span>
              </button>
            </motion.div>
          )}

          {gameState === "playing" && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <div className="px-8 pt-10 pb-6 flex items-center justify-between relative">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-100"
                      />
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={176}
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: 176 * (1 - timeLeft / 60) }}
                        className={timeLeft < 10 ? "text-rose-500" : "text-amber-500"}
                      />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center font-black text-lg transition-colors ${timeLeft < 10 ? "text-rose-600 animate-pulse" : "text-slate-800"}`}>
                      {timeLeft}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Timer</h4>
                    <p className="text-xl font-black text-slate-800 tracking-tighter italic">Hurry Up!</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Points</span>
                    <span className="text-lg font-black text-emerald-700 font-mono tracking-tighter">{score}</span>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="absolute bottom-0 left-8 right-8 flex gap-1 h-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        i < currentIndex ? "bg-indigo-500" : i === currentIndex ? "bg-amber-400 scale-y-150" : "bg-slate-100"
                      }`} 
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-500 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-100">
                      Level 12
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Module {currentIndex + 1}/10</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-[1.2] tracking-tight">
                    <MathText text={questions[currentIndex].questionEn} />
                  </h3>
                  {questions[currentIndex].questionBn && (
                    <p className="text-xs sm:text-sm text-slate-500 font-medium italic mt-1">
                      <MathText text={questions[currentIndex].questionBn} />
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  {questions[currentIndex].optionsEn.map((opt, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ x: 8 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={showAnswer !== null}
                      onClick={() => handleAnswer(i)}
                      className={`p-5 sm:p-6 rounded-[2rem] border-2 text-left font-black text-sm transition-all flex items-center justify-between group shadow-sm ${
                        showAnswer === i 
                          ? i === questions[currentIndex].correctIndex ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-emerald-500/10" : "bg-rose-50 border-rose-500 text-rose-700 shadow-rose-500/10"
                          : showAnswer !== null && i === questions[currentIndex].correctIndex ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                         <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                            showAnswer === i ? "bg-white border-transparent" : "bg-slate-50 border-slate-100 group-hover:bg-white group-hover:border-indigo-100"
                         }`}>
                           {String.fromCharCode(65 + i)}
                         </span>
                         <span className="flex-1 break-words">
                           <MathText text={opt} />
                         </span>
                      </div>
                      <AnimatePresence>
                        {showAnswer === i && i === questions[currentIndex].correctIndex && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 size={22} className="text-emerald-500" /></motion.div>
                        )}
                        {showAnswer === i && i !== questions[currentIndex].correctIndex && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><AlertCircle size={22} className="text-rose-500" /></motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === "result" && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 text-center space-y-10 flex-1 flex flex-col justify-center"
            >
              <div className="relative mx-auto">
                <motion.div 
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ duration: 1, repeat: Infinity }}
                   className="w-32 h-32 rounded-[3.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10"
                >
                  <Trophy size={64} fill="currentColor" />
                </motion.div>
                <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400 rounded-full border-4 border-white animate-bounce" />
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Blitz Summary</h2>
                
                <div className="flex items-center justify-center gap-6">
                   <div className="px-8 py-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                      <p className="text-4xl font-black text-indigo-600 font-mono">{score}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Blitz Pts</p>
                   </div>
                   <div className="px-8 py-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                      <p className="text-4xl font-black text-emerald-600 font-mono">{Math.round((score/10)*100)}%</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Accuracy</p>
                   </div>
                </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Brain size={48} /></div>
                 <p className="text-sm font-bold text-slate-300 italic leading-relaxed relative z-10">
                    "Darun performance, ${userName}! Tomar speed khub bhalo. Keep it up!"
                 </p>
              </div>

              <div className="flex flex-col gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startBlitz}
                  className="w-full py-6 bg-amber-400 text-slate-900 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-amber-400/20 flex items-center justify-center gap-3"
                >
                  <Zap size={18} fill="currentColor" />
                  Try Again
                </motion.button>
                <button 
                  onClick={onClose}
                  className="w-full py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
                >
                  Exit Blitz
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
