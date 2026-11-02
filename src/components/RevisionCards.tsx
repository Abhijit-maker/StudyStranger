import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, ChevronLeft, Zap, Sparkles, BookOpen, Quote } from "lucide-react";

interface KeyPoint {
  title: string;
  points: string[];
  quote?: string;
  subject: string;
}

const revisionData: KeyPoint[] = [
  {
    subject: "Bengali A",
    title: "Adarini (প্রভাত কুমার মুখোপাধ্যায়)",
    points: [
      "Jayram Mokhtar and his elephant Adarini.",
      "Price of Adarini: 2000 rupees.",
      "Symbol of pride transformed into a burden of affection.",
      "The tragic end of the elephant and the emotional void."
    ],
    quote: "হাতি কেনা সহজ, হাতি পোষা কঠিন (Buying an elephant is easy, keeping one is hard)."
  },
  {
    subject: "Bengali A",
    title: "Bangala Bhasha (স্বামী বিবেকানন্দ)",
    points: [
      "Difference between spoken and written language.",
      "Importance of simplified language for general education.",
      "Relation between language and national progress.",
      "The role of the elite in shaping the language."
    ]
  },
  {
    subject: "English B",
    title: "The Bet (Anton Chekhov)",
    points: [
      "Wager: 2 million rubles for 15 years of solitary confinement.",
      "Life imprisonment vs. Death penalty debate.",
      "The transformation of the lawyer through books and isolation.",
      "Final realization: Material wealth is worthless."
    ],
    quote: "To strive, to seek, to find, and not to yield."
  },
  {
    subject: "Biology",
    title: "Human Reproduction (Gametogenesis)",
    points: [
      "Spermatogenesis: Formation of sperm in seminiferous tubules.",
      "Oogenesis: Formation of ovum (arrested in Prophase I until puberty).",
      "LH Surge: Occurs on the 14th day, triggers ovulation.",
      "Acrosome Reaction: Role of ZP3 receptor in fertilization."
    ]
  }
];

export const RevisionCards: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % revisionData.length);
  const prev = () => setIndex((i) => (i - 1 + revisionData.length) % revisionData.length);

  const current = revisionData[index];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[70vh]">
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-100 flex">
          {revisionData.map((_, i) => (
            <div key={i} className={`flex-1 transition-all ${i <= index ? "bg-indigo-500" : "bg-transparent"}`} />
          ))}
        </div>

        {/* Header */}
        <div className="p-8 flex items-center justify-between">
           <div>
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">{current.subject}</span>
             <h2 className="text-xl font-black text-slate-800 leading-tight mt-1">{current.title}</h2>
           </div>
           <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
          <div className="grid gap-4">
             {current.points.map((point, i) => (
               <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start group"
               >
                 <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Sparkles size={12} />
                 </div>
                 <p className="text-sm font-bold text-slate-600 leading-relaxed">{point}</p>
               </motion.div>
             ))}
          </div>

          {current.quote && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Quote size={48} />
              </div>
              <p className="text-xs font-black uppercase text-indigo-400 tracking-widest mb-2 flex items-center gap-2">
                <Zap size={10} /> Key Note
              </p>
              <p className="text-sm font-bold italic leading-relaxed relative z-10">
                "{current.quote}"
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
          <button 
            onClick={prev}
            className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-all"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          
          <button 
            onClick={next}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-3"
          >
            Next Card <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
