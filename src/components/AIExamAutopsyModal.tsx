import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  X, 
  Sparkles, 
  Brain, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  BookOpen, 
  RotateCcw,
  Zap,
  Target
} from "lucide-react";
import confetti from "canvas-confetti";
import { MathText } from "./MathText";

interface AIExamAutopsyModalProps {
  onClose: () => void;
  userName?: string;
  onOpenTopic?: (topic: string) => void;
  onOpenSpeedBlitz?: () => void;
}

interface WeakAreaDiagnosis {
  id: string;
  subject: string;
  topic: string;
  topicBn: string;
  errorRate: number;
  severity: "high" | "medium" | "low";
  conceptGaps: string[];
  quickFix: string;
  quickFixBn: string;
  recoveryFormula?: string;
}

const DEFAULT_DIAGNOSES: WeakAreaDiagnosis[] = [
  {
    id: "diag-1",
    subject: "Biology",
    topic: "Human Reproduction & Fertilization",
    topicBn: "মানব জনন ও শুক্রাণুর এক্রোসোম বিক্রিয়া",
    errorRate: 42,
    severity: "high",
    conceptGaps: [
      "Acrosome ZP3 receptor interaction during sperm-egg penetration",
      "LH Surge timing (Day 14) triggering Graafian follicle ovulation",
      "Ectopic implantation site in Fallopian tubes"
    ],
    quickFix: "Remember: Acrosome releases hyaluronidase enzyme specifically targeting ZP3 on Zona Pellucida.",
    quickFixBn: "মনে রাখুন: শুক্রাণুর এক্রোসোম থেকে হায়ালুরোনিডেজ নিঃসৃত হয়ে জোনা পেলুসিডার ZP3 রিসেপ্টরে আবদ্ধ হয়।",
    recoveryFormula: "\\text{Sperm Head} \\xrightarrow{\\text{Hyaluronidase}} \\text{ZP3 Receptor Binding} \\rightarrow \\text{Fertilization}"
  },
  {
    id: "diag-2",
    subject: "Biology",
    topic: "Molecular Genetics & DNA Replication",
    topicBn: "আণবিক বংশগতিবিজ্ঞান ও ডিএনএ অনুলিপন",
    errorRate: 35,
    severity: "medium",
    conceptGaps: [
      "SSB (Single Strand Binding) Protein prevents re-annealing of DNA strands",
      "Hydrogen bonds: A=T (2 bonds) vs G≡C (3 bonds)",
      "Transcription initiation at TATA box promoter"
    ],
    quickFix: "SSB proteins stabilize unwound single strands behind helicase during replication fork opening.",
    quickFixBn: "SSB প্রোটিন ডিএনএ রেপ্লিকেশনের সময় একতন্ত্রী ডিএনএকে পুনরায় জোড়া লাগতে বাধা দেয়।",
    recoveryFormula: "A=T\\text{ (2 H-Bonds)},\\quad G\\equiv C\\text{ (3 H-Bonds)}"
  },
  {
    id: "diag-3",
    subject: "Bengali A",
    topic: "গল্প: আদরিনী (প্রভাত কুমার মুখোপাধ্যায়)",
    topicBn: "জয়রাম মোক্তার ও আদরিনী হাতির চরিত্র বিশ্লেষণ",
    errorRate: 28,
    severity: "medium",
    conceptGaps: [
      "আদরিনী হাতির ক্রয়মূল্য: ২০০০ টাকা",
      "জয়রাম মোক্তারের সামাজিক অবক্ষয় ও বাৎসল্য ট্র্যাজেডি",
      "অন্তিম মুহূর্তে হাতির করুণ আর্তনাদ ও বিদায়"
    ],
    quickFix: "জয়রাম ২০০০ টাকায় আদরিনীকে ক্রয় করেছিলেন এবং নিজের কন্যারূপে পালন করেছিলেন।",
    quickFixBn: "আদিরিনীর ক্রয়মূল্য ২০০০ টাকা এবং জয়রাম মোক্তারের নিঃস্বার্থ আত্মিক স্নেহ এই গল্পের মূল উপজীব্য।"
  },
  {
    id: "diag-4",
    subject: "English B",
    topic: "Verse: Ulysses (Lord Tennyson)",
    topicBn: "টেনিসনের ইউলিসিস কবিতার মূল ভাবার্থ",
    errorRate: 30,
    severity: "medium",
    conceptGaps: [
      "Key high-yield quote: 'To strive, to seek, to find, and not to yield'",
      "Victorian spirit of restless inquiry and indomitable courage",
      "Telemachus represents prudent domestic governance vs. Ulysses' oceanic exploration"
    ],
    quickFix: "Ulysses symbolises Victorian quest for boundless knowledge beyond the sunset of life.",
    quickFixBn: "'To strive, to seek, to find, and not to yield' — মানুষের অফুরন্ত সংগ্রাম ও জয়ের প্রতীক।"
  }
];

export const AIExamAutopsyModal: React.FC<AIExamAutopsyModalProps> = ({
  onClose,
  userName = "Abhijit",
  onOpenTopic,
  onOpenSpeedBlitz
}) => {
  const [diagnoses, setDiagnoses] = useState<WeakAreaDiagnosis[]>(DEFAULT_DIAGNOSES);
  const [selectedDiag, setSelectedDiag] = useState<WeakAreaDiagnosis>(DEFAULT_DIAGNOSES[0]);
  const [completedDrills, setCompletedDrills] = useState<string[]>([]);

  const handleCompleteFix = (id: string) => {
    if (!completedDrills.includes(id)) {
      setCompletedDrills(prev => [...prev, id]);
      confetti({ particleCount: 30, spread: 55, origin: { y: 0.7 } });
    }
  };

  const overallMasteryScore = Math.round(100 - (diagnoses.reduce((acc, d) => acc + d.errorRate, 0) / diagnoses.length));

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-rose-950 via-stone-900 to-amber-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full">
                  AI Weak Area Autopsy
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-white">
                মক টেস্ট ডায়াগনস্টিক ও দুর্বল বিষয়ের অটো-অটপসি
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Metric Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                <span>Top Critical Gap</span>
                <AlertTriangle size={15} />
              </div>
              <p className="text-sm sm:text-base font-black text-stone-900 dark:text-white">
                Fertilization ZP3 Receptor
              </p>
              <p className="text-[11px] text-stone-500">Highest error rate across tests (42%)</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Estimated Recovery</span>
                <Zap size={15} />
              </div>
              <p className="text-sm sm:text-base font-black text-stone-900 dark:text-white">
                +14 Marks Booster
              </p>
              <p className="text-[11px] text-stone-500">By solving 4 quick recovery drills</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Current Readiness</span>
                <CheckCircle2 size={15} />
              </div>
              <p className="text-sm sm:text-base font-black text-stone-900 dark:text-white">
                {overallMasteryScore}% Prepared
              </p>
              <p className="text-[11px] text-stone-500">Based on WBCHSE Sem 3 weighting</p>
            </div>
          </div>

          {/* Master Two-Column Diagnostic Board */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Diagnosis List (5 Cols) */}
            <div className="lg:col-span-5 space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Detected Syllabus Gaps ({diagnoses.length})
              </h3>
              {diagnoses.map((d) => {
                const isSelected = selectedDiag.id === d.id;
                const isFixed = completedDrills.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDiag(d)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? "bg-stone-100 dark:bg-stone-800 border-[#FF7A30] shadow-sm"
                        : "bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF7A30]/10 text-[#FF7A30]">
                        {d.subject}
                      </span>
                      {isFixed ? (
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Fixed
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono font-bold text-rose-500">
                          {d.errorRate}% Errors
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white leading-snug">
                      {d.topic}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                      {d.topicBn}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Active Deep Dive & 5-Min Fix Plan (7 Cols) */}
            <div className="lg:col-span-7 p-4 sm:p-5 rounded-3xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-700">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7A30]">
                    5-Minute Power Fix Plan
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white">
                    {selectedDiag.topic}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  {selectedDiag.errorRate}% Mistakes
                </span>
              </div>

              {/* What You Missed */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-amber-500" />
                  <span>যেসব বিষয়ে বিভ্রান্তি তৈরি হচ্ছে (Concept Gaps):</span>
                </p>
                <ul className="space-y-1 pl-4 list-disc text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {selectedDiag.conceptGaps.map((cg, i) => (
                    <li key={i}>{cg}</li>
                  ))}
                </ul>
              </div>

              {/* Instant Concept Clarification */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-1.5">
                <p className="text-xs font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <Sparkles size={13} />
                  <span>AI Fast Takeaway & Rule:</span>
                </p>
                <p className="text-xs font-medium leading-relaxed">
                  {selectedDiag.quickFix}
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold leading-relaxed bangla-text">
                  {selectedDiag.quickFixBn}
                </p>
                {selectedDiag.recoveryFormula && (
                  <div className="pt-1">
                    <MathText text={selectedDiag.recoveryFormula} block={true} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => handleCompleteFix(selectedDiag.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    completedDrills.includes(selectedDiag.id)
                      ? "bg-emerald-500 text-white"
                      : "bg-[#FF7A30] hover:bg-orange-600 text-white shadow-md"
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>
                    {completedDrills.includes(selectedDiag.id) ? "Concept Mastered ✅" : "Mark as Revised (+20 XP)"}
                  </span>
                </button>

                {onOpenSpeedBlitz && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSpeedBlitz();
                    }}
                    className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Flame size={13} className="text-rose-500" />
                    <span>Launch Blitz Drill</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
