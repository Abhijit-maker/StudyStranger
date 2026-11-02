import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  RotateCw, 
  Volume2, 
  Check, 
  X, 
  Sparkles, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Award, 
  Filter, 
  Brain,
  Zap,
  Bookmark,
  Share2,
  RefreshCw,
  Search,
  Eye,
  EyeOff
} from "lucide-react";
import confetti from "canvas-confetti";
import { MathText } from "./MathText";
import { soundEffects } from "../services/soundEffectsService";
import { voiceService } from "../services/voiceService";

export interface FlashcardItem {
  id: string;
  subject: "Biology" | "Bengali" | "English" | "Physics" | "Chemistry" | "Mathematics";
  chapter: string;
  unit?: string;
  frontBn: string;
  frontEn: string;
  backBn: string;
  backEn: string;
  highYieldTip: string;
  formula?: string;
  difficulty: "easy" | "medium" | "hard";
}

const COMPREHENSIVE_FLASHCARDS: FlashcardItem[] = [
  // BIOLOGY UNIT I: REPRODUCTION
  {
    id: "bio-1",
    subject: "Biology",
    chapter: "Human Reproduction",
    unit: "Unit I: Reproduction",
    frontBn: "মানুষের শুক্রাণুর অ্যাক্রোজম (Acrosome) এবং ZP3 রিসেপ্টরের ভূমিকা কী?",
    frontEn: "What is the critical role of Acrosome and ZP3 receptor in fertilization?",
    backBn: "অ্যাক্রোজমে হায়ালুরোনিডেজ ও অ্যাক্রোসিন উৎসেচক থাকে যা ডিম্বাণুর জোনা পেলুসিডার ZP3 রিসেপ্টরে আবদ্ধ হয়ে নিষেক সম্পন্ন করে।",
    backEn: "The Acrosome contains hydrolytic enzymes (hyaluronidase & acrosin) binding to ZP3 receptors on the zona pellucida to trigger sperm penetration.",
    highYieldTip: "WBCHSE প্রশ্ন: ZP3 রিসেপ্টর জোনা পেলুসিডাতে অবস্থান করে।",
    formula: "\\text{Acrosome Enzymes} + \\text{ZP3 Receptor} \\rightarrow \\text{Fertilization}",
    difficulty: "hard"
  },
  {
    id: "bio-2",
    subject: "Biology",
    chapter: "Human Reproduction",
    unit: "Unit I: Reproduction",
    frontBn: "স্ত্রী জননতন্ত্রে এল.এইচ. সার্জ (LH Surge) চক্রের কততম দিনে ঘটে এবং এর ফল কী?",
    frontEn: "On which day of the menstrual cycle does LH Surge occur and what does it induce?",
    backBn: "ঋতুচক্রের ১৪তম দিনে পিটুইটারি থেকে LH ক্ষরণ সর্বোচ্চ হয় (LH Surge), যার প্রভাবে গ্রাফিয়ান ফলিকল বিদীর্ণ হয়ে ডিম্বাণু নির্গত হয় (ডিম্বপাত / Ovulation)।",
    backEn: "LH Surge occurs on Day 14 of the 28-day cycle, causing rupture of mature Graafian follicle and releasing secondary oocyte (Ovulation).",
    highYieldTip: "Day 14 = LH Surge = Ovulation. প্রোজেস্টেরন কর্পাস লিউটিয়াম দ্বারা ক্ষরিত হয়।",
    formula: "\\text{Day 14} \\xrightarrow{\\text{LH Peak}} \\text{Graafian Follicle Rupture} \\rightarrow \\text{Ovulation}",
    difficulty: "medium"
  },
  {
    id: "bio-3",
    subject: "Biology",
    chapter: "Flowering Plants Reproduction",
    unit: "Unit I: Reproduction",
    frontBn: "গেইটোনোগ্যামি (Geitonogamy) এবং জেনোগ্যামি (Xenogamy)-র মধ্যে পার্থক্য কী?",
    frontEn: "Distinguish between Geitonogamy and Xenogamy pollination.",
    backBn: "গেইটোনোগ্যামি: একই উদ্ভিদের দুটি ভিন্ন ফুলের মধ্যে পরাগযোগ (কার্যত স্ব-পরাগযোগ)। জেনোগ্যামি: একই প্রজাতির দুটি পৃথক উদ্ভিদের ফুলের পরাগযোগ (প্রকৃত ইতোর-পরাগযোগ)।",
    backEn: "Geitonogamy: transfer of pollen between two flowers on the same plant (genetically self-pollination). Xenogamy: transfer between different plants (true cross-pollination).",
    highYieldTip: "গেইটোনোগ্যামি জিনগতভাবে অটোগ্যামি, কিন্তু ইকোলজিক্যালি জেনোগ্যামির মতো বাহক নির্ভর।",
    difficulty: "easy"
  },
  {
    id: "bio-4",
    subject: "Biology",
    chapter: "Reproductive Health",
    unit: "Unit I: Reproduction",
    frontBn: "সিফিলিস (Syphilis) রোগের রোগজীবাণুর নাম কী?",
    frontEn: "What is the causative pathogen of Syphilis STD?",
    backBn: "সিফিলিসের প্যাথোজেন হল স্পাইরোকিট ব্যাকটেরিয়া 'ট্রিপোনেমা প্যালিডাম' (Treponema pallidum)।",
    backEn: "The causative agent is the spirochete bacterium Treponema pallidum.",
    highYieldTip: "WBCHSE Sem 3 অতি পরিচিত প্রশ্ন: Treponema pallidum (Spirillum bacterium).",
    difficulty: "medium"
  },
  // BIOLOGY UNIT II: GENETICS & EVOLUTION
  {
    id: "bio-5",
    subject: "Biology",
    chapter: "Molecular Basis of Inheritance",
    unit: "Unit II: Genetics",
    frontBn: "DNA রেপ্লিকেশনে SSB প্রোটিন এবং ওয়াটসন-ক্রিক বেস পেয়ারিং-এর বন্ধন সংখ্যা কত?",
    frontEn: "State Hydrogen bond counts in base pairs and role of SSB protein.",
    backBn: "A = T (২টি হাইড্রোজেন বন্ধন), G ≡ C (৩টি হাইড্রোজেন বন্ধন)। SSB (Single Strand Binding) প্রোটিন ডিএনএ-র উন্মুক্ত একতন্ত্রী অংশকে পুনরায় জোড়া লাগা থেকে রোধ করে।",
    backEn: "Adenine pairs with Thymine via 2 H-bonds; Guanine with Cytosine via 3 H-bonds. SSB stabilizes single-stranded DNA during replication.",
    highYieldTip: "G-C বন্ধন ৩টি হওয়ায় তা ভাঙতে বেশি তাপ ও শক্তির প্রয়োজন হয় (Higher Tm).",
    formula: "A = T\\text{ (2 H-bonds)},\\quad G \\equiv C\\text{ (3 H-bonds)}",
    difficulty: "medium"
  },
  {
    id: "bio-6",
    subject: "Biology",
    chapter: "Evolution",
    unit: "Unit II: Evolution",
    frontBn: "অপারিন-হ্যালডেন তত্ত্ব (Oparin-Haldane) এবং আদিম বায়ুমণ্ডলের প্রকৃতি কী ছিল?",
    frontEn: "What was the nature of the primitive Earth atmosphere according to Oparin-Haldane?",
    backBn: "আদিম বায়ুমণ্ডল ছিল বিজারক (Reducing), যাতে মুক্ত অক্সিজেন ছিল না। এতে মিথেন (CH4), অ্যামোনিয়া (NH3), হাইড্রোজেন (H2) এবং জলীয় বাষ্প ছিল।",
    backEn: "Primitive atmosphere was reducing, lacking free oxygen, dominated by methane, ammonia, hydrogen, and water vapor in hot dilute soup.",
    highYieldTip: "মিলারের পরীক্ষায় ব্যবহৃত গ্যাসের অনুপাত ছিল CH4 : NH3 : H2 = 2 : 1 : 2।",
    difficulty: "hard"
  },
  // BENGALI A
  {
    id: "ben-1",
    subject: "Bengali",
    chapter: "গল্প: আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)",
    frontBn: "জয়রাম মোক্তার আদিরিনী হাতিটিকে কত টাকায় কিনেছিলেন এবং গল্পের কেন্দ্রীয় দ্বন্দ্ব কী?",
    frontEn: "At what price did Jayram Mokhtar purchase Adarini and what is the central tragedy?",
    backBn: "জয়রাম মোক্তার ২০০০ টাকায় আদিরিনীকে কিনেছিলেন। নিজের কন্যাস্নেহে লালন করার পরও আর্থিক দেনায় হাতিটিকে নিলামে তোলার ট্র্যাজেডি গল্পের মূল সুর।",
    backEn: "Jayram Mokhtar bought Adarini for 2,000 rupees. The unbearable grief of seeing his beloved pet auctioned off due to debt forms the core tragedy.",
    highYieldTip: "গুরুত্বপূর্ণ ডেটা: আদিরিনীর দাম ২০০০ টাকা। লেখক: প্রভাত কুমার মুখোপাধ্যায়।",
    difficulty: "easy"
  },
  {
    id: "ben-2",
    subject: "Bengali",
    chapter: "প্রবন্ধ: বাঙ্গালা ভাষা (স্বামী বিবেকানন্দ)",
    frontBn: "বাঙ্গালা ভাষা প্রবন্ধে স্বামী বিবেকানন্দ কোন ধরনের ভাষার পক্ষে সওয়াল করেছেন?",
    frontEn: "What style of Bengali language did Swami Vivekananda advocate for?",
    backBn: "বিবেকানন্দ পণ্ডিতি ও গুরুচণ্ডালী ভাষার বদলে সাধারণ মানুষের মুখের জীবন্ত ও তেজস্বী চলিত ভাষার পক্ষে বলিষ্ঠ যুক্তি তুলে ধরেছেন।",
    backEn: "Vivekananda strongly advocated for living, conversational vernacular Bengali instead of Sanskritized pedantic prose.",
    highYieldTip: "উক্তি: 'যে ভাষায় ঘরে কথা কও, সেই ভাষায় সমস্ত কাজের জন্য ব্যবহার কর।'",
    difficulty: "medium"
  },
  {
    id: "ben-3",
    subject: "Bengali",
    chapter: "কবিতা: ধর্ম (শ্রীজাত)",
    frontBn: "শ্রীজাতের 'ধর্ম' কবিতায় ধর্মীয় গোঁড়ামির বিপরীতে কোন ধর্মের কথা বলা হয়েছে?",
    frontEn: "What true essence of religion is highlighted in Srijato's poem 'Dharma'?",
    backBn: "বাহ্যিক আচার-অনুষ্ঠান ও ভেদাভেদের ঊর্ধ্বে উঠে মানুষের প্রতি ভালোবাসা ও মানবিকতাই হলো শ্রেষ্ঠ ধর্ম।",
    backEn: "Humanity, love, and compassion above institutionalized religious dogmatism and social divisions.",
    highYieldTip: "কবিতাটিতে আধুনিক সময়ের ধর্মান্ধতার বিরুদ্ধে সোচ্চার মানবতাবোধ প্রকাশিত।",
    difficulty: "easy"
  },
  // ENGLISH B
  {
    id: "eng-1",
    subject: "English",
    chapter: "The Bet (Anton Chekhov)",
    frontBn: "'The Bet' গল্পে ব্যাংকার ও উকিলের মধ্যে বাজির শর্ত ও টাকার অঙ্ক কত ছিল?",
    frontEn: "What was the wager amount and duration of imprisonment in Anton Chekhov's 'The Bet'?",
    backBn: "২ মিলিয়ন (২০ লক্ষ) রুবেলের বাজি ধরা হয়েছিল ১৫ বছরের জন্য নির্জন কারাবাসের শর্তে।",
    backEn: "The wager was 2 million rubles for 15 years of solitary confinement in the banker's garden lodge.",
    highYieldTip: "Data point: 2 million rubles, 15 years. The lawyer leaves 5 minutes before time.",
    formula: "\\text{Wager: } 2,000,000\\text{ Rubles} \\longleftrightarrow 15\\text{ Years}",
    difficulty: "easy"
  },
  {
    id: "eng-2",
    subject: "English",
    chapter: "The Night Train at Deoli (Ruskin Bond)",
    frontBn: "'The Night Train at Deoli' গল্পে দেওলির স্টেশনে লেখকের দেখা মেয়েটির পরিচয় কী ছিল?",
    frontEn: "What was the young girl selling at the lonely Deoli station platform?",
    backBn: "মেয়েটি বেতের তৈরি ঝুড়ি (cane baskets) বিক্রি করছিল। তার চোখদুটি ছিল অন্ধকার ও উজ্জ্বল।",
    backEn: "The girl was selling handmade cane baskets. Her dark, expressive eyes fascinated the author.",
    highYieldTip: "Keywords: cane baskets, lonely platform, romantic longing, eternal mystery.",
    difficulty: "easy"
  },
  {
    id: "eng-3",
    subject: "English",
    chapter: "Ulysses (Alfred Lord Tennyson)",
    frontBn: "টেনিসনের 'Ulysses' কবিতার বিখ্যাত শেষ পঙক্তিটির অর্থ কী?",
    frontEn: "What is the famous concluding line and theme of Tennyson's 'Ulysses'?",
    backBn: "'To strive, to seek, to find, and not to yield' — কখনো হার না মেনে জীবনের শেষ মুহূর্ত পর্যন্ত অজানার সন্ধানে নিরন্তর এগিয়ে চলা।",
    backEn: "'To strive, to seek, to find, and not to yield' — an undying spirit of courage and intellectual conquest till death.",
    highYieldTip: "Meter: Blank Verse (Iambic Pentameter). Heroic Victorian optimism.",
    difficulty: "medium"
  }
];

export const ChapterFlashcards: React.FC<{ onClose?: () => void; userName?: string }> = ({
  onClose,
  userName = "Abhijit"
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [languageMode, setLanguageMode] = useState<"bilingual" | "bengali" | "english">("bilingual");
  const [masteredIds, setMasteredIds] = useState<Record<string, boolean>>(() => {
    try {
      const s = localStorage.getItem("mastered_flashcards");
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });
  const [stats, setStats] = useState({ reviewed: 0, streak: 0 });

  // Filter cards
  const filteredCards = useMemo(() => {
    return COMPREHENSIVE_FLASHCARDS.filter((c) => {
      const matchSub = selectedSubject === "All" || c.subject === selectedSubject;
      const matchDiff = filterDifficulty === "all" || c.difficulty === filterDifficulty;
      return matchSub && matchDiff;
    });
  }, [selectedSubject, filterDifficulty]);

  const activeCard = filteredCards[currentIndex] || COMPREHENSIVE_FLASHCARDS[0];

  const handleFlip = () => {
    soundEffects.play("click");
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleRate = (rating: "again" | "hard" | "good" | "easy") => {
    soundEffects.play("correct");
    setStats((prev) => ({ reviewed: prev.reviewed + 1, streak: prev.streak + 1 }));

    if (rating === "good" || rating === "easy") {
      const nextMastered = { ...masteredIds, [activeCard.id]: true };
      setMasteredIds(nextMastered);
      try {
        localStorage.setItem("mastered_flashcards", JSON.stringify(nextMastered));
      } catch (e) {}

      if (rating === "easy") {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      }
    }
    handleNext();
  };

  const handleSpeak = (text: string) => {
    voiceService.speak(text, { character: "stranger" as any });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_#0f172a] overflow-hidden text-left">
      {/* Top Header */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
              <Brain size={14} /> Spaced Repetition Flashcards
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              স্মার্ট চ্যাপ্টার ফ্ল্যাশকার্ড (Rapid Revision)
            </h2>
            <p className="text-xs md:text-sm text-white/90">
              WBCHSE Class 12 Sem 3 • Biology, Bengali A & English B
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-black/20 p-2.5 rounded-2xl border border-white/20">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-white/70 block uppercase">কার্ড সংখ্যা</span>
              <span className="text-xl font-black text-amber-300">{filteredCards.length}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-white/70 block uppercase">আয়ত্তে এসেছে</span>
              <span className="text-xl font-black text-emerald-300">{Object.keys(masteredIds).length}</span>
            </div>
          </div>
        </div>

        {/* Subjects Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pt-5 pb-1">
          {["All", "Biology", "Bengali", "English"].map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => {
                setSelectedSubject(sub);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedSubject === sub
                  ? "bg-white text-indigo-900 shadow-md scale-105"
                  : "bg-white/15 text-white hover:bg-white/30"
              }`}
            >
              {sub === "All" ? "সব বিষয় (All)" : sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div className="p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
        {/* Progress & Language Switcher */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>কার্ড {currentIndex + 1} / {filteredCards.length}</span>
            {activeCard && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                {activeCard.chapter}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLanguageMode("bilingual")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                languageMode === "bilingual" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : ""
              }`}
            >
              উভয় ভাষা
            </button>
            <button
              type="button"
              onClick={() => setLanguageMode("bengali")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                languageMode === "bengali" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : ""
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLanguageMode("english")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                languageMode === "english" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : ""
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* 3D Tactile Card */}
        <div 
          onClick={handleFlip}
          className="relative min-h-[320px] sm:min-h-[360px] w-full rounded-[2rem] border-2 border-slate-900 dark:border-slate-700 bg-amber-50/30 dark:bg-slate-800/80 p-6 md:p-8 flex flex-col justify-between shadow-[6px_6px_0px_#0f172a] hover:shadow-[8px_8px_0px_#0f172a] transition-all cursor-pointer select-none"
        >
          {/* Card Top Pill */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase">
              {isFlipped ? "💡 সমাধান ও উত্তর (Back)" : "❓ প্রশ্ন ও ধারণা (Front)"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(isFlipped ? activeCard.backBn : activeCard.frontBn);
                }}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 shadow-xs"
                title="ভয়েসে শুনুন"
              >
                <Volume2 size={16} />
              </button>
              <div className="text-xs text-slate-400 font-bold flex items-center gap-1">
                <RotateCw size={14} /> ফ্লিপ করতে ক্লিক করুন
              </div>
            </div>
          </div>

          {/* Card Center Content */}
          <div className="my-auto py-4 space-y-4">
            {!isFlipped ? (
              // FRONT
              <div className="space-y-3">
                {(languageMode === "bilingual" || languageMode === "bengali") && (
                  <h3 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    <MathText text={activeCard.frontBn} />
                  </h3>
                )}
                {(languageMode === "bilingual" || languageMode === "english") && (
                  <p className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300">
                    <MathText text={activeCard.frontEn} />
                  </p>
                )}
              </div>
            ) : (
              // BACK
              <div className="space-y-4">
                {(languageMode === "bilingual" || languageMode === "bengali") && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200">
                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block mb-1">
                      বাংলা উত্তর:
                    </span>
                    <p className="text-sm md:text-base font-bold leading-relaxed">
                      <MathText text={activeCard.backBn} />
                    </p>
                  </div>
                )}

                {(languageMode === "bilingual" || languageMode === "english") && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block mb-1">
                      English Concept:
                    </span>
                    <p className="text-xs md:text-sm font-semibold leading-relaxed">
                      <MathText text={activeCard.backEn} />
                    </p>
                  </div>
                )}

                {activeCard.formula && (
                  <div className="p-3 bg-slate-900 text-amber-300 rounded-xl font-mono text-xs text-center border border-slate-800">
                    <MathText text={activeCard.formula} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Footer High-Yield Hook */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5 truncate pr-2">
              <Sparkles size={14} className="shrink-0" />
              <span className="truncate">{activeCard.highYieldTip}</span>
            </span>

            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
              {activeCard.difficulty}
            </span>
          </div>
        </div>

        {/* Navigation & Spaced Repetition Rating Buttons */}
        <div className="space-y-4">
          {/* Spaced Repetition Rating Bar (when flipped) */}
          {isFlipped ? (
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden sm:inline">
                রেটিং দিন:
              </span>

              <div className="grid grid-cols-4 gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => handleRate("again")}
                  className="py-2.5 px-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition-all active:scale-95 text-center cursor-pointer"
                >
                  আবার দেখাও (Again)
                </button>
                <button
                  type="button"
                  onClick={() => handleRate("hard")}
                  className="py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-all active:scale-95 text-center cursor-pointer"
                >
                  কঠিন (Hard)
                </button>
                <button
                  type="button"
                  onClick={() => handleRate("good")}
                  className="py-2.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all active:scale-95 text-center cursor-pointer"
                >
                  মোটামুটি (Good)
                </button>
                <button
                  type="button"
                  onClick={() => handleRate("easy")}
                  className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all active:scale-95 text-center cursor-pointer"
                >
                  সহজ (Easy)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrev}
                className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ChevronLeft size={16} /> পূর্ববর্তী
              </button>

              <button
                type="button"
                onClick={handleFlip}
                className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                উত্তর দেখুন (Flip Card)
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                পরবর্তী <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
