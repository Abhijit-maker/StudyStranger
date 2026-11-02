import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Book, FileText, PenTool, GraduationCap, ChevronRight, Sparkles, Zap } from "lucide-react";

interface SyllabusProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const syllabusData = [
  {
    category: "Bengali A (Sem 3)",
    icon: <PenTool className="text-indigo-400" size={20} />,
    items: [
      { title: "Adarini", author: "Galpo - Prabhat Kumar Mukhopadhyay" },
      { title: "Dharma", author: "Kabita - Srijato" },
      { title: "Digbijayer Rupkatha", author: "Kabita - Nabaneeta Dev Sen" },
      { title: "Bangala Bhasha", author: "Prabandha - Swami Vivekananda" },
      { title: "Potraj", author: "Bharatiya Galpo - Shankar Rao Kharat" },
      { title: "Tar Sange", author: "Antarjatik Kabita - Pablo Neruda" },
      { title: "Bhashabigyan / Dhwanitattwa", author: "Bhasha" },
    ],
  },
  {
    category: "English B (Sem 3)",
    icon: <Book className="text-emerald-400" size={20} />,
    items: [
      { title: "The Night Train at Deoli", author: "Prose - Ruskin Bond" },
      { title: "Strong Roots", author: "Prose - A.P.J. Abdul Kalam" },
      { title: "The Bet", author: "Prose - Anton Chekhov" },
      { title: "Our Casuarina Tree", author: "Verse - Toru Dutt" },
      { title: "Ulysses", author: "Verse - Alfred Lord Tennyson" },
      { title: "Riders to the Sea", author: "Drama - J.M. Synge" },
    ],
  },
  {
    category: "Physics (Sem 3)",
    icon: <Zap className="text-amber-400" size={20} />,
    items: [
      { title: "Electrostatics", author: "Unit 1 - Charges, Potential, Capacitance" },
      { title: "Current Electricity", author: "Unit 2 - Ohm's Law, Kirchhoff's, Potentiometer" },
      { title: "Magnetic Effects & Magnetism", author: "Unit 3 - Biot-Savart, Ampere, Matter" },
      { title: "EMI & Alternating Current", author: "Unit 4 - Faraday, Lenz, AC Circuits" },
      { title: "Electromagnetic Waves", author: "Unit 5 - EM Spectrum" },
    ],
  },
  {
    category: "Chemistry (Sem 3)",
    icon: <Sparkles className="text-rose-400" size={20} />,
    items: [
      { title: "Liquid State (Solutions)", author: "Unit 1 - Raoult's Law, Colligative, Colloids" },
      { title: "p-Block Elements", author: "Unit 2 - Groups 15, 16, 17, 18" },
      { title: "Haloalkanes & Haloarenes", author: "Unit 3 - Substitution, R/S, D/L" },
      { title: "Alcohols, Phenols & Ethers", author: "Unit 4 - Preparation & Properties" },
      { title: "Biomolecules", author: "Unit 5 - Carbohydrates, Proteins, DNA/RNA" },
      { title: "Polymers", author: "Unit 6 - Natural & Synthetic" },
    ],
  },
  {
    category: "Mathematics (Sem 3)",
    icon: <FileText className="text-blue-400" size={20} />,
    items: [
      { title: "Relations and Functions", author: "Unit 1 - Types, Inverse Trig" },
      { title: "Algebra (Matrices/Det)", author: "Unit 2 - Operations, Inverse, Solutions" },
      { title: "Calculus (Continuity/Diff)", author: "Unit 3 - Chain Rule, Parametric, 2nd Order" },
      { title: "Application of Derivatives", author: "Unit 3 - Maxima/Minima, Tangents" },
      { title: "Probability", author: "Unit 4 - Bayes' Theorem, Random Variable" },
    ],
  },
  {
    category: "Computer App (Sem 3)",
    icon: <GraduationCap className="text-purple-400" size={20} />,
    items: [
      { title: "Python Programming", author: "Unit 1 - Basics, Control, Strings, Lists" },
      { title: "Python Modules & Functions", author: "Unit 1 - Math, Random, Stats, Scopes" },
      { title: "E-Commerce", author: "Unit 2 - Types, Payments, Marketing" },
    ],
  },
];

export const Syllabus: React.FC<SyllabusProps> = ({ isOpen, onClose, userName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="w-full max-w-5xl max-h-[90vh] bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <Book className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">WBCHSE Class 12 (New Syllabus)</h2>
                  <p className="text-xs text-emerald-400 font-mono uppercase tracking-widest">Semester 3 • MCQ Based Exam</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {syllabusData.map((section, idx) => (
                  <motion.div
                    key={section.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-all hover:border-emerald-500/30 group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">
                        {section.icon}
                      </div>
                      <h3 className="text-base font-semibold text-white/90">{section.category}</h3>
                    </div>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div
                          key={`${section.category}-${item.title}`}
                          className="flex items-center justify-between p-2.5 bg-black/20 rounded-xl hover:bg-black/40 transition-colors cursor-pointer group/item"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white/80 group-hover/item:text-emerald-400 transition-colors truncate">
                              {item.title}
                            </p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider truncate">
                              {item.author}
                            </p>
                          </div>
                          <ChevronRight size={12} className="text-slate-600 group-hover/item:text-emerald-400 transition-colors shrink-0" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tips Section */}
              <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="text-emerald-400" size={20} />
                  <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-widest">{userName}'s Exam Strategy</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  "{userName}, Semester 3 is all about **MCQs**. Focus on minute details of the texts and clear your concepts in Science subjects. 
                  Practice speed and accuracy. I'll help you with MCQ-style quizzes for all these subjects!"
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
