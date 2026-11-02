import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, Trash2, ArrowRight, Brain, AlertCircle, BookOpen, CheckCircle2, Target } from "lucide-react";
import { MCQQuestion } from "../types";
import { MathText } from "./MathText";

interface SavedMistake extends MCQQuestion {
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const MistakeBank: React.FC<{ onClose: () => void; userId?: string }> = ({ onClose, userId }) => {
  const [mistakes, setMistakes] = useState<SavedMistake[]>([]);
  const [selectedMistake, setSelectedMistake] = useState<SavedMistake | null>(null);

  const mistakeBankKey = userId ? `mistake_bank_${userId}` : "mistake_bank";

  useEffect(() => {
    const saved = localStorage.getItem(mistakeBankKey);
    if (saved) {
      setMistakes(JSON.parse(saved));
    }
  }, [mistakeBankKey]);

  const clearMistakes = () => {
    if (confirm("Are you sure you want to clear your mistake bank?")) {
      setMistakes([]);
      localStorage.removeItem(mistakeBankKey);
    }
  };

  const removeMistake = (id: string) => {
    const updated = mistakes.filter(m => m.id !== id);
    setMistakes(updated);
    localStorage.setItem(mistakeBankKey, JSON.stringify(updated));
    if (selectedMistake?.id === id) setSelectedMistake(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl"
    >
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl border border-white/20 flex flex-col overflow-hidden relative">
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
              <Clock size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Mistake Bank</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{mistakes.length} Questions Saved</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mistakes.length > 0 && (
              <button 
                onClick={clearMistakes}
                className="flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all hover:bg-rose-50 shadow-sm"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* List */}
          <div className="w-1/3 border-r border-slate-50 overflow-y-auto p-6 space-y-4">
            {mistakes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                  <BookOpen size={32} />
                </div>
                <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No mistakes yet!</p>
                <p className="text-[10px] text-slate-300 mt-1 uppercase font-bold">Try a mock test first.</p>
              </div>
            ) : (
              mistakes.map((m, i) => (
                <motion.div
                  key={`mistake-${m.id || i}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedMistake(m)}
                  className={`p-5 rounded-[2rem] cursor-pointer transition-all border ${
                    selectedMistake?.id === m.id 
                      ? "bg-orange-50 border-orange-200 shadow-lg shadow-orange-100" 
                      : "bg-white border-slate-100 hover:border-orange-100 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">{m.subject || "Subject"}</p>
                  <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-tight">{m.question}</p>
                </motion.div>
              ))
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 p-8 overflow-y-auto bg-slate-50/30">
            <AnimatePresence mode="wait">
              {selectedMistake ? (
                <motion.div
                  key={selectedMistake.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-orange-200">Revision Needed</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: {selectedMistake.id.slice(-6)}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 leading-tight">
                      <MathText text={selectedMistake.question} />
                    </h3>
                  </div>

                  <div className="grid gap-3">
                    {selectedMistake.options.map((opt, idx) => (
                      <div 
                        key={idx}
                        className={`p-5 rounded-[1.8rem] border flex items-center justify-between font-bold text-sm ${
                          idx === selectedMistake.correctAnswer 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                            : "bg-white border-slate-100 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                           <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                             idx === selectedMistake.correctAnswer ? "bg-emerald-100 border-emerald-300" : "bg-slate-50 border-slate-200"
                           }`}>
                             {String.fromCharCode(65 + idx)}
                           </span>
                           <MathText text={opt} />
                        </div>
                        {idx === selectedMistake.correctAnswer && <CheckCircle2 size={18} className="text-emerald-500" />}
                      </div>
                    ))}
                  </div>

                  {selectedMistake.explanation && (
                    <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle size={16} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Analysis</span>
                      </div>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                        <MathText text={selectedMistake.explanation} />
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      onClick={() => removeMistake(selectedMistake.id)}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Brain size={16} /> Mark as Mastered
                    </button>
                    <button 
                      className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Target size={48} className="text-slate-200" />
                  </div>
                  <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Select a question to review</h3>
                  <p className="text-xs font-bold text-slate-300 mt-2">Pachon koro, sikhon hobe! (Review and learn!)</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
