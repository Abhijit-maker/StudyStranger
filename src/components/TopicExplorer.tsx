import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, BookOpen, Brain, Sparkles, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { generateStudyMaterial } from "../services/geminiService";
import { MathText } from "./MathText";

interface TopicExplorerProps {
  topic: string;
  onClose: () => void;
  apiKey?: string;
  onStartQuiz: (topic: string, data: any[]) => void;
}

export const TopicExplorer: React.FC<TopicExplorerProps> = ({ topic, onClose, apiKey, onStartQuiz }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [quizData, setQuizData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sumRes, ptsRes, qzRes] = await Promise.all([
          generateStudyMaterial(topic, "summary", "Board", apiKey),
          generateStudyMaterial(topic, "keypoints", "Board", apiKey),
          generateStudyMaterial(topic, "quiz", "Board", apiKey)
        ]);

        setSummary(sumRes?.text || "");
        setKeyPoints(ptsRes?.points || []);
        setQuizData(qzRes || []);
      } catch (err) {
        console.error("Failed to fetch topic data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topic, apiKey]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
    >
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative border border-white/20">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-20 p-3 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all shadow-sm"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12">
             <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Bot size={32} className="text-indigo-500 animate-pulse" />
                </div>
             </div>
             <div className="text-center">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Syncing Knowledge Map...</h3>
                <p className="text-slate-400 font-medium mt-2">Our AI is drafting a custom guide for <span className="text-indigo-600">"{topic}"</span></p>
             </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-8 md:p-12 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 shrink-0">
               <div className="flex items-center gap-3 mb-3">
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} /> AI Study Guide
                  </div>
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase font-serif">
                 {topic}
               </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 scrollbar-hide">
               {/* Summary Section */}
               <section className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                        <BookOpen size={20} />
                     </div>
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Cinematic Summary</h4>
                  </div>
                  <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-inner relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5"><Quote size={60} /></div>
                     <p className="text-lg md:text-xl text-slate-700 font-serif leading-relaxed italic relative z-10">
                        <MathText text={summary} />
                     </p>
                  </div>
               </section>

               {/* Key Points Section */}
               <section className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                        <Brain size={20} />
                     </div>
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Mastery Points</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {keyPoints.map((point, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={i} 
                          className="p-5 bg-white border border-slate-100 rounded-2xl flex gap-4 shadow-sm group hover:border-emerald-200 transition-all hover:bg-emerald-50/30"
                        >
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black">
                              {i + 1}
                           </div>
                           <p className="text-sm text-slate-600 font-medium leading-relaxed group-hover:text-emerald-900 transition-colors">
                              <MathText text={point} />
                           </p>
                        </motion.div>
                     ))}
                  </div>
               </section>

               {/* Action Section */}
               <section className="pt-8 border-t border-slate-100">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-500/20 to-transparent"></div>
                     <div className="relative z-10 space-y-2">
                        <h4 className="text-2xl font-black tracking-tight">Ready to test your skill?</h4>
                        <p className="text-slate-400 text-sm font-medium">We've prepared 10 custom MCQs from this topic.</p>
                     </div>
                     <button 
                        onClick={() => onStartQuiz(topic, quizData)}
                        className="relative z-10 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-50 transition-all flex items-center gap-3 group active:scale-95 shadow-xl"
                      >
                        Start Topic Quiz <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </section>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

const Quote = ({ size, className }: { size: number; className?: string }) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.32zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.32z" />
   </svg>
)

const Bot = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
)
