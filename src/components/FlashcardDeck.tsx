import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { 
  Layers, 
  RotateCw, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  Flame, 
  Award,
  RefreshCw,
  Volume2,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import confetti from "canvas-confetti";
import { MathText } from "./MathText";
import { soundEffects } from "../services/soundEffectsService";

interface FlashcardDeckProps {
  onClose: () => void;
  userName?: string;
}

interface Flashcard {
  id: string;
  subject: "Biology" | "Bengali" | "English" | "Physics" | "Chemistry" | "Mathematics";
  topic: string;
  front: string;
  back: string;
  hint: string;
  latex?: string;
}

const FLASHCARDS_DATA: Flashcard[] = [
  {
    id: "fc-1",
    subject: "Biology",
    topic: "Human Reproduction (Unit I)",
    front: "What is the primary role of the Acrosome and ZP3 receptor in human sperm?",
    back: "The Acrosome contains hyaluronidase and acrosin enzymes that bind to the ZP3 receptor on the zona pellucida of the ovum, enabling penetration and fertilization.",
    hint: "Think about sperm head cap & egg penetration.",
    latex: "\\text{Acrosome} + \\text{ZP3 Receptor} \\rightarrow \\text{Fertilization}"
  },
  {
    id: "fc-2",
    subject: "Biology",
    topic: "Genetics & DNA Replication (Unit II)",
    front: "What are the Hydrogen Bond counts in Watson-Crick Base Pairing and role of SSB protein?",
    back: "Adenine pairs with Thymine (A = T) via 2 Hydrogen bonds.\nGuanine pairs with Cytosine (G ≡ C) via 3 Hydrogen bonds.\nSSB (Single Strand Binding) protein stabilizes unwound single DNA strands.",
    hint: "A-T has 2, G-C has 3 bonds.",
    latex: "A = T\\text{ (2 H-Bonds)},\\quad G \\equiv C\\text{ (3 H-Bonds)}"
  },
  {
    id: "fc-3",
    subject: "Biology",
    topic: "Reproduction & Menstrual Cycle",
    front: "On which day does the LH Surge occur and what is its physiological effect?",
    back: "The Luteinizing Hormone (LH) surge occurs on Day 14 of the 28-day cycle, causing rapid rupture of the mature Graafian follicle and releasing the ovum (Ovulation).",
    hint: "Mid-cycle ovulation trigger.",
    latex: "\\text{Day 14} \\rightarrow \\text{LH Surge} \\rightarrow \\text{Ovulation}"
  },
  {
    id: "fc-4",
    subject: "Physics",
    topic: "Modern Physics • Bohr Atom",
    front: "State Bohr's Quantized Energy Formula and the Balmer Series transition.",
    back: "Energy levels: En = -13.6/n² eV. When electron jumps from n=3 to n=2, visible Balmer series photon is emitted.",
    hint: "Inversely proportional to n².",
    latex: "E_n = -\\frac{13.6}{n^2}\\text{ eV},\\quad \\Delta E = h\\nu"
  },
  {
    id: "fc-5",
    subject: "Chemistry",
    topic: "Organic Chemistry • Benzene",
    front: "What is Hückel's Rule of Aromaticity and benzene resonance energy?",
    back: "Aromatic compounds must be cyclic, planar, fully conjugated, and have (4n+2) delocalized π-electrons. Benzene (n=1) has 6 π-electrons and resonance energy of 150.6 kJ/mol.",
    hint: "4n+2 pi electrons.",
    latex: "4n + 2\\text{ delocalized }\\pi\\text{-electrons}"
  },
  {
    id: "fc-6",
    subject: "Mathematics",
    topic: "3D Geometry & Vectors",
    front: "What is the formula for the Vector Cross Product magnitude and direction?",
    back: "The cross product of vectors A and B produces a perpendicular orthogonal vector with magnitude |A||B|sinθ.",
    hint: "Right-hand rule perpendicular vector.",
    latex: "\\vec{A} \\times \\vec{B} = |\\vec{A}||\\vec{B}|\\sin\\theta\\;\\hat{n}"
  },
  {
    id: "fc-7",
    subject: "Bengali",
    topic: "গল্প: আদরিনী (প্রভাত কুমার মুখোপাধ্যায়)",
    front: "জয়রাম মোক্তারের আদরিনী হাতির ক্রয়মূল্য কত ছিল এবং গল্পের মূল ট্র্যাজেডি কী?",
    back: "জয়রাম ২০০০ টাকায় আদরিনীকে কিনেছিলেন। আর্থিক সংকটের মধ্যেও মেয়ের মতো ভালোবেসেছিলেন, যার বিয়োগান্তক পরিণতি গল্পের মূল প্রতিপাদ্য।",
    hint: "আদিরিনীর ক্রয়মূল্য ২০০০ টাকা।"
  },
  {
    id: "fc-8",
    subject: "English",
    topic: "Prose: The Bet (Anton Chekhov)",
    front: "What was the wager in 'The Bet' and why did the lawyer forfeit it?",
    back: "The wager was 2 million rubles for 15 years voluntary confinement. The lawyer renounced the money 5 hours before completion to demonstrate his contempt for fleeting material wealth.",
    hint: "2M rubles for 15 years, walked out 5 hrs early."
  },
  {
    id: "fc-9",
    subject: "English",
    topic: "Verse: Ulysses (Lord Tennyson)",
    front: "Recite the iconic culminating line of Tennyson's 'Ulysses' and its theme.",
    back: "'To strive, to seek, to find, and not to yield.' Represents indomitable human spirit, Victorian optimism, and relentless pursuit of knowledge.",
    hint: "To strive, to seek, to find..."
  }
];

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  onClose,
  userName = "Abhijit"
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);

  const filteredCards = FLASHCARDS_DATA.filter((c) =>
    selectedSubject === "All" ? true : c.subject === selectedSubject
  );

  const currentCard = filteredCards[currentIndex % filteredCards.length];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleSwipeRight = () => {
    // Mastered
    if (currentCard && !masteredIds.includes(currentCard.id)) {
      setMasteredIds((prev) => [...prev, currentCard.id]);
      setReviewIds((prev) => prev.filter((id) => id !== currentCard.id));
      soundEffects.playCorrectSound();
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    }
    handleNext();
  };

  const handleSwipeLeft = () => {
    // Need Review
    if (currentCard && !reviewIds.includes(currentCard.id)) {
      setReviewIds((prev) => [...prev, currentCard.id]);
    }
    handleNext();
  };

  const speakCard = () => {
    if (!("speechSynthesis" in window) || !currentCard) return;
    window.speechSynthesis.cancel();
    const textToSpeak = isFlipped ? currentCard.back : currentCard.front;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-stone-900 to-pink-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                  Swipe Flashcards
                </span>
                <span className="text-xs text-amber-400 font-bold">
                  {masteredIds.length}/{filteredCards.length} Mastered
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                সোয়াইপ মেমোরি ফ্ল্যাশকার্ড ও অ্যাক্টিভ রিকল
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

        {/* Subject Filter Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 overflow-x-auto scrollbar-hide text-xs">
          {["All", "Biology", "Physics", "Chemistry", "Mathematics", "Bengali", "English"].map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setSelectedSubject(sub);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSubject === sub
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Flashcard Viewport */}
        <div className="p-4 sm:p-8 flex flex-col items-center justify-center space-y-6">
          
          {/* Card Container */}
          <div className="w-full max-w-lg min-h-[300px] sm:min-h-[340px] relative perspective-1000">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard ? currentCard.id : "empty"}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 80) handleSwipeRight();
                  else if (info.offset.x < -80) handleSwipeLeft();
                }}
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-full min-h-[300px] sm:min-h-[340px] p-6 sm:p-8 rounded-3xl border shadow-xl flex flex-col justify-between cursor-pointer transition-all ${
                  isFlipped
                    ? "bg-gradient-to-br from-indigo-950 via-purple-950 to-stone-950 text-white border-purple-500/50"
                    : "bg-white dark:bg-stone-900 text-stone-900 dark:text-white border-stone-200 dark:border-stone-800 hover:border-purple-400"
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isFlipped ? "bg-purple-500/30 text-purple-300" : "bg-[#FF7A30]/10 text-[#FF7A30]"
                  }`}>
                    {currentCard?.subject} · {currentCard?.topic}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakCard();
                    }}
                    className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-[#FF7A30]"
                    title="Pronounce card"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                {/* Question / Answer Content */}
                <div className="space-y-3 my-auto text-center py-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    {isFlipped ? "💡 DETAILED ANSWER & CONCEPT" : "❓ ACTIVE RECALL QUESTION"}
                  </span>
                  
                  <div className="text-sm sm:text-base font-bold leading-relaxed">
                    <MathText text={isFlipped ? currentCard?.back : currentCard?.front} />
                  </div>

                  {currentCard?.latex && isFlipped && (
                    <div className="pt-2">
                      <MathText text={currentCard.latex} block={true} />
                    </div>
                  )}

                  {!isFlipped && currentCard?.hint && (
                    <p className="text-[11px] text-stone-400 italic pt-1">
                      💡 Hint: {currentCard.hint}
                    </p>
                  )}
                </div>

                {/* Flip Guide */}
                <div className="text-center pt-2 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 flex items-center justify-center gap-1">
                  <RotateCw size={12} className="animate-spin-slow" />
                  <span>Tap to flip · Swipe Left (Review) · Swipe Right (Mastered)</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Swipe Buttons Controls */}
          <div className="flex items-center justify-center gap-6 w-full max-w-sm">
            <button
              onClick={handleSwipeLeft}
              className="flex-1 py-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
            >
              <ThumbsDown size={15} />
              <span>Review Later</span>
            </button>

            <button
              onClick={handleSwipeRight}
              className="flex-1 py-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
            >
              <ThumbsUp size={15} />
              <span>Mastered (+10 XP)</span>
            </button>
          </div>

          {/* Bottom Pagination */}
          <div className="flex items-center justify-between w-full max-w-lg text-xs text-stone-500 font-mono">
            <button onClick={handlePrev} className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-white cursor-pointer">
              <ChevronLeft size={16} /> Prev
            </button>
            <span>{currentIndex + 1} of {filteredCards.length}</span>
            <button onClick={handleNext} className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-white cursor-pointer">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
