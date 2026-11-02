import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw, 
  Sparkles, 
  Brain, 
  Award, 
  X, 
  BookOpen, 
  Flame, 
  Clock,
  Filter,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";
import { MathText } from "./MathText";
import "katex/dist/katex.min.css";

interface QuestionBankQuizProps {
  onClose: () => void;
  userName?: string;
  onPointsAwarded?: (earned: number) => void;
  onLogMistake?: (question: string, wrongAnswer: string, correctAnswer: string, subject: string) => void;
}

interface Question {
  id: string;
  subject: "Biology" | "Bengali" | "English";
  unit: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const WBCHSE_SEM3_QUESTIONS: Question[] = [
  // Biology - Unit I & II
  {
    id: "bio-1",
    subject: "Biology",
    unit: "Human Reproduction",
    question: "Which receptor on the Zona Pellucida of human ovum binds specifically to the sperm head?",
    options: ["ZP1", "ZP2", "ZP3", "ZP4"],
    correctIndex: 2,
    explanation: "ZP3 (Zona Pellucida glycoprotein 3) acts as the primary sperm receptor and induces the acrosome reaction during human fertilization.",
    difficulty: "Medium"
  },
  {
    id: "bio-2",
    subject: "Biology",
    unit: "Reproductive Health",
    question: "Which pathogen is responsible for causing the Sexually Transmitted Disease (STD) Syphilis?",
    options: ["Treponema pallidum", "Chlamydia trachomatis", "Neisseria gonorrhoeae", "Human Papilloma Virus"],
    correctIndex: 0,
    explanation: "Syphilis is caused by the spirochete bacterium Treponema pallidum.",
    difficulty: "Easy"
  },
  {
    id: "bio-3",
    subject: "Biology",
    unit: "Human Reproduction",
    question: "On which day of a standard 28-day human menstrual cycle does the Luteinizing Hormone (LH) surge typically occur?",
    options: ["Day 1", "Day 7", "Day 14", "Day 21"],
    correctIndex: 2,
    explanation: "The LH surge triggers ovulation on approximately Day 14 of a 28-day ovarian cycle.",
    difficulty: "Easy"
  },
  {
    id: "bio-4",
    subject: "Biology",
    unit: "Molecular Basis of Inheritance",
    question: "During DNA replication, which protein binds to single-stranded DNA to prevent re-annealing and degradation?",
    options: ["DNA Topoisomerase", "Single-Stranded Binding (SSB) Protein", "DNA Ligase", "RNA Primase"],
    correctIndex: 1,
    explanation: "Single-Stranded Binding (SSB) proteins stabilize single-stranded DNA replication forks and prevent secondary hairpin formation.",
    difficulty: "Medium"
  },
  {
    id: "bio-5",
    subject: "Biology",
    unit: "Flowering Plants",
    question: "Pollination of a flower by pollen from another flower on the same plant is known as:",
    options: ["Autogamy", "Geitonogamy", "Xenogamy", "Cleistogamy"],
    correctIndex: 1,
    explanation: "Geitonogamy is functionally cross-pollination (involving a pollinator) but genetically similar to autogamy because pollen comes from the same plant.",
    difficulty: "Medium"
  },
  {
    id: "bio-6",
    subject: "Biology",
    unit: "Genetics & Evolution",
    question: "According to the Oparin-Haldane theory of the origin of life, the Earth's primitive atmosphere was:",
    options: ["Oxidizing and rich in O2", "Reducing with no free molecular oxygen", "Inert and rich in Neon", "Purely aqueous without gases"],
    correctIndex: 1,
    explanation: "The primitive atmosphere was reducing, containing methane (CH4), ammonia (NH3), hydrogen (H2), and water vapor without free O2.",
    difficulty: "Easy"
  },

  // Bengali A
  {
    id: "ben-1",
    subject: "Bengali",
    unit: "গল্প: আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)",
    question: "জয়রাম মোক্তার কত টাকা দিয়ে হাতি 'আদিরিনী'-কে কিনেছিলেন?",
    options: ["১০০০ টাকা", "১৫০০ টাকা", "২০০০ টাকা", "২৫০০ টাকা"],
    correctIndex: 2,
    explanation: "প্রভাত কুমার মুখোপাধ্যায়ের 'আদিরিনী' গল্পে জয়রাম মোক্তার ২০০০ টাকা দিয়ে আদিরিনীকে ক্রয় করেছিলেন।",
    difficulty: "Easy"
  },
  {
    id: "ben-2",
    subject: "Bengali",
    unit: "প্রবন্ধ: বাঙ্গালা ভাষা (স্বামী বিবেকানন্দ)",
    question: "স্বামী বিবেকানন্দের মতে বাংলা ভাষার প্রকৃত রূপ কোনটি হওয়া উচিত?",
    options: ["কঠিন সংস্কৃতবহুল শব্দসমৃদ্ধ", "সর্বসাধারণের ব্যবহৃত জীবন্ত মুখের ভাষা", "শুধুমাত্র সাধু ক্রিয়াপদযুক্ত ভাষা", "ইংরেজি সংমিশ্রণে গঠিত ভাষা"],
    correctIndex: 1,
    explanation: "বিবেকানন্দ জীবন্ত মুখের কথ্য ভাষাকে সাহিত্যের মাধ্যম করার পক্ষে যুক্তি দিয়েছেন যাতে জ্ঞান সাধারণ মানুষের কাছে পৌঁছায়।",
    difficulty: "Medium"
  },
  {
    id: "ben-3",
    subject: "Bengali",
    unit: "কবিতা: ধর্ম (শ্রীজাত)",
    question: "শ্রীজাত-র 'ধর্ম' কবিতার মূল সুর কোনটি?",
    options: ["সংকীর্ণ প্রাতিষ্ঠানিক ধর্মাচার", "মানুষের অন্তর্নিহিত মানবধর্ম ও সহমর্মিতা", "বৈদিক যাগযজ্ঞের মহিমা", "অর্থনৈতিক সমৃদ্ধি"],
    correctIndex: 1,
    explanation: "কবিতায় প্রাতিষ্ঠানিক ধর্মের কৃত্রিম বিভেদের চেয়ে মানুষের স্বাভাবিক মানবধর্ম ও ভালোবাসাকে সর্বোচ্চে স্থান দেওয়া হয়েছে।",
    difficulty: "Medium"
  },
  {
    id: "ben-4",
    subject: "Bengali",
    unit: "ভাষাবিজ্ঞান (Linguistics)",
    question: "ভাষার ক্ষুদ্রতম অর্থপূর্ণ একককে কী বলা হয়?",
    options: ["ধ্বনি (Phone)", "রূপমূল বা রূপিম (Morpheme)", "বাক্য (Sentence)", "উপভাষা (Dialect)"],
    correctIndex: 1,
    explanation: "ধ্বনি হলো ক্ষুদ্রতম অর্থহীন একক, কিন্তু 'রূপমূল' বা রূপিম (Morpheme) হলো ভাষার ক্ষুদ্রতম অর্থপূর্ণ একক।",
    difficulty: "Hard"
  },

  // English B
  {
    id: "eng-1",
    subject: "English",
    unit: "Prose: The Bet (Anton Chekhov)",
    question: "In Anton Chekhov's 'The Bet', what was the amount of money wagered by the banker for 15 years of solitary confinement?",
    options: ["1 Million Rubles", "2 Million Rubles", "5 Million Rubles", "10 Million Rubles"],
    correctIndex: 1,
    explanation: "The banker wagered 2 million rubles against the lawyer's 15 years of voluntary solitary imprisonment.",
    difficulty: "Easy"
  },
  {
    id: "eng-2",
    subject: "English",
    unit: "Prose: Strong Roots (APJ Abdul Kalam)",
    question: "According to APJ Abdul Kalam in 'Strong Roots', what was his father Jainulabdeen's daily routine after the dawn prayer?",
    options: ["Reading religious scriptures", "Visiting the Shiva temple", "Walking four miles to their coconut grove", "Meeting town leaders"],
    correctIndex: 2,
    explanation: "Kalam recounts that his father would walk 4 miles to their small coconut grove and return carrying about a dozen coconuts tied together.",
    difficulty: "Medium"
  },
  {
    id: "eng-3",
    subject: "English",
    unit: "Verse: Ulysses (Lord Tennyson)",
    question: "Complete the iconic concluding line of Tennyson's poem 'Ulysses': 'To strive, to seek, to find, and ______.'",
    options: ["to never look back", "not to yield", "to rest forever", "to gain all glory"],
    correctIndex: 1,
    explanation: "The famous motto of unrelenting resolve is: 'To strive, to seek, to find, and not to yield.'",
    difficulty: "Easy"
  },
  {
    id: "eng-4",
    subject: "English",
    unit: "Verse: Our Casuarina Tree (Toru Dutt)",
    question: "In Toru Dutt's 'Our Casuarina Tree', why is the tree dear to the poet's soul?",
    options: ["Because of its grand medicinal values", "Because she played beneath it with her beloved departed siblings", "Because it shaded the garden from storms", "Because it was planted by royal ancestors"],
    correctIndex: 1,
    explanation: "The tree is immortalized not merely for its grandeur, but because of nostalgic memories of childhood companionship with her deceased siblings (Aru and Abju).",
    difficulty: "Medium"
  }
];

export const QuestionBankQuiz: React.FC<QuestionBankQuizProps> = ({
  onClose,
  userName = "Abhijit",
  onPointsAwarded,
  onLogMistake
}) => {
  const [selectedSubject, setSelectedSubject] = useState<"All" | "Biology" | "Bengali" | "English">("All");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);

  const filteredQuestions = WBCHSE_SEM3_QUESTIONS.filter((q) => 
    selectedSubject === "All" ? true : q.subject === selectedSubject
  );

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    } else {
      if (onLogMistake) {
        onLogMistake(
          currentQ.question,
          currentQ.options[idx],
          currentQ.options[currentQ.correctIndex],
          currentQ.subject
        );
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      if (onPointsAwarded && score > 0) {
        onPointsAwarded(score * 5);
      }
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-gradient-to-b from-[#1c1917] to-[#0c0a09] text-stone-100 rounded-[2.5rem] border border-stone-800 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Brain size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                WBCHSE Sem-3 MCQ Exam Bank
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold uppercase tracking-wider">
                  Verified
                </span>
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                High-yield questions with instant detailed Bengali/English explanations
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Subject Filter */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(["All", "Biology", "Bengali", "English"] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                  handleReset();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSubject === sub
                    ? "bg-[#EF6D2F] text-white shadow-md shadow-[#EF6D2F]/20"
                    : "bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800"
                }`}
              >
                {sub === "All" ? "All Subjects" : sub}
              </button>
            ))}
          </div>

          {!showResults ? (
            <div className="space-y-6">
              {/* Question Meta & Progress */}
              <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800/60 pb-3">
                <span className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-bold">
                    {currentQ.subject}
                  </span>
                  <span>{currentQ.unit}</span>
                </span>
                <span className="font-bold text-[#EF6D2F]">
                  Question {currentIndex + 1} / {filteredQuestions.length}
                </span>
              </div>

              {/* Question Text */}
              <div className="bg-stone-900/60 p-5 rounded-3xl border border-stone-800/80">
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {currentQ.options.map((opt, idx) => {
                  let optStyle = "bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800/80 hover:text-white";
                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      optStyle = "bg-emerald-950/70 border-emerald-500/80 text-emerald-200 font-bold shadow-lg shadow-emerald-950/40";
                    } else if (selectedOption === idx) {
                      optStyle = "bg-rose-950/70 border-rose-500/80 text-rose-200 font-bold";
                    } else {
                      optStyle = "bg-stone-900/40 border-stone-800/40 text-stone-600 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={`wb-opt-${currentQ.id || currentIndex}-${idx}`}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 ${optStyle}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-stone-800 flex items-center justify-center text-[10px] font-black text-stone-400">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && selectedOption === idx && idx !== currentQ.correctIndex && (
                        <XCircle size={18} className="text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Detailed Academic Explanation</span>
                  </div>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="w-full py-4 rounded-2xl bg-[#EF6D2F] hover:bg-[#ff7a3b] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#EF6D2F]/25 transition-all"
                >
                  <span>{currentIndex + 1 < filteredQuestions.length ? "Next Question" : "Complete & View Score"}</span>
                  <ChevronRight size={16} />
                </motion.button>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#EF6D2F]/20 text-[#EF6D2F] flex items-center justify-center">
                <Award size={40} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Quiz Completed!</h3>
                <p className="text-xs text-stone-400 mt-1">
                  Great revision, {userName}! You scored:
                </p>
                <div className="text-4xl font-black text-white font-mono mt-3">
                  {score} <span className="text-stone-500 text-2xl">/ {filteredQuestions.length}</span>
                </div>
                <p className="text-xs font-bold text-emerald-400 mt-2">
                  Accuracy: {Math.round((score / filteredQuestions.length) * 100)}%
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-[#EF6D2F] hover:bg-[#ff7a3b] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-[#EF6D2F]/25"
                >
                  <RotateCcw size={16} />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
