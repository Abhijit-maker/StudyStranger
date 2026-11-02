import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Bookmark, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  AlertCircle,
  HelpCircle,
  Share2,
  Brain,
  Lightbulb,
  Award
} from "lucide-react";
import { MathText } from "./MathText";
import { soundEffects } from "../services/soundEffectsService";

export interface QuestionBankItem {
  id: string;
  subject: "Biology" | "Bengali" | "English" | "Physics" | "Chemistry" | "Mathematics";
  chapter: string;
  unit: string;
  year?: string;
  difficulty: "Easy" | "Medium" | "Board Standard";
  questionBn: string;
  questionEn: string;
  options: string[];
  correctIndex: number;
  modelAnswerBn: string;
  modelAnswerEn: string;
  examinerTipBn: string;
  commonTrapBn: string;
}

const QUESTION_BANK_DATA: QuestionBankItem[] = [
  // BIOLOGY UNIT I
  {
    id: "qb-bio-1",
    subject: "Biology",
    chapter: "Human Reproduction",
    unit: "Unit I: Reproduction",
    year: "WBCHSE 2024 Pattern",
    difficulty: "Board Standard",
    questionBn: "মানুষের শুক্রাণুর কোন অংশ ডিম্বাণুর জোনা পেলুসিডাকে বিদীর্ণ করতে প্রয়োজনীয় উৎসেচক ধারণ করে?",
    questionEn: "Which part of human sperm contains the enzymes essential to penetrate the zona pellucida?",
    options: [
      "অ্যাক্রোজম (Acrosome)",
      "মধ্যখণ্ড বা মাইটোকন্ড্রিয়া (Midpiece)",
      "পুচ্ছ বা টেল (Tail)",
      "সেন্ট্রিওল (Centriole)"
    ],
    correctIndex: 0,
    modelAnswerBn: "সঠিক উত্তর হলো (A) অ্যাক্রোজম। শুক্রাণুর মস্তকের অগ্রভাগে অবস্থিত পরিবর্তিত গলগি বডি হলো অ্যাক্রোজম, যাতে হায়ালুরোনিডেজ এবং জোনা লাইসিন (অ্যাক্রোসিন) উৎসেচক থাকে। এটি জোনা পেলুসিডার ZP3 রিসেপ্টরে যুক্ত হয়ে পথ সুগম করে।",
    modelAnswerEn: "Correct answer is (A) Acrosome. Acrosome is a cap-like organelle derived from the Golgi apparatus covering the anterior half of the head, carrying hyaluronidase and acrosin.",
    examinerTipBn: "পরীক্ষায় শুক্রাণুর তিনটি মূল অংশের কাজ আলাদা করে মনে রাখবেন: হেড (ডিএনএ + অ্যাক্রোজম), মিডপিস (মাইটোকন্ড্রিয়া - শক্তি), টেল (চলন)।",
    commonTrapBn: "অনেকে মাইটোকন্ড্রিয়া বা মিডপিস দাগিয়ে ফেলে, যা শুধু সাঁতার কাটার শক্তি (ATP) যোগায়।"
  },
  {
    id: "qb-bio-2",
    subject: "Biology",
    chapter: "Human Reproduction",
    unit: "Unit I: Reproduction",
    year: "WBCHSE 2023",
    difficulty: "Medium",
    questionBn: "২৮ দিনের স্বাভাবিক মানব ঋতুচক্রে ওভিউলেশন (ডিম্বপাত) সাধারণত কততম দিনে সম্পন্ন হয়?",
    questionEn: "In a standard 28-day human menstrual cycle, on which day does ovulation typically occur?",
    options: [
      "৫ম দিনে (Day 5)",
      "১০ম দিনে (Day 10)",
      "১৪তম দিনে (Day 14)",
      "২৮তম দিনে (Day 28)"
    ],
    correctIndex: 2,
    modelAnswerBn: "সঠিক উত্তর (C) ১৪তম দিনে। চক্রের মধ্যভাগে রক্তে LH-এর তীব্র বৃদ্ধির (LH Surge) ফলে গ্রাফিয়ান ফলিকল বিদীর্ণ হয়ে সেকেন্ডারি ওওসাইট মুক্ত হয়।",
    modelAnswerEn: "Correct answer is (C) Day 14. Mid-cycle LH surge triggers ovulation from the mature Graafian follicle.",
    examinerTipBn: "LH Surge ওভিউলেশনের প্রায় ২৪-৩৬ ঘণ্টা পূর্বে ঘটে।",
    commonTrapBn: "অনেকে রক্তক্ষরণ পর্বের শেষ দিনকে ওভিউলেশনের দিন ভেবে ভুল করে।"
  },
  {
    id: "qb-bio-3",
    subject: "Biology",
    chapter: "Reproductive Health",
    unit: "Unit I: Reproduction",
    year: "WBCHSE Model Paper",
    difficulty: "Easy",
    questionBn: "একটোপিক ইমপ্লান্টেশন (Ectopic Implantation) বলতে কী বোঝায়?",
    questionEn: "What is meant by Ectopic Implantation in human embryology?",
    options: [
      "জরায়ুর অভ্যন্তরে স্বাভাবিক রোপণ",
      "জরায়ু বহির্ভূত স্থানে (যেমন ফ্যালোপিয়ান নালী) ভ্রূণের রোপণ",
      "ডিম্বাশয়ে ডিম্বাণুর ধ্বংস",
      "যমজ ভ্রূণের সৃষ্টি"
    ],
    correctIndex: 1,
    modelAnswerBn: "সঠিক উত্তর (B)। ভ্রূণ যখন জরায়ু গহ্বরের এন্ডোমেট্রিয়ামের বাইরে (অধিকাংশ ক্ষেত্রে ফ্যালোপিয়ান টিউবের অ্যাম্পুলা বা ইস্থমাসে) রোপিত হয়, তখন তাকে একটোপিক প্রেগন্যান্সি বা একটোপিক ইমপ্লান্টেশন বলে।",
    modelAnswerEn: "Correct answer is (B). Implantation of the fertilized ovum outside the uterine cavity, most commonly within the fallopian tubes.",
    examinerTipBn: "এটি একটি বিপজ্জনক অবস্থা এবং তাৎক্ষণিক চিকিৎসার প্রয়োজন হয়।",
    commonTrapBn: "জরায়ুর যেকোনো অস্বাভাবিক অবস্থাকে একটোপিক মনে করা।"
  },
  // BIOLOGY UNIT II: GENETICS
  {
    id: "qb-bio-4",
    subject: "Biology",
    chapter: "Molecular Basis of Inheritance",
    unit: "Unit II: Genetics",
    year: "WBCHSE 2024",
    difficulty: "Board Standard",
    questionBn: "DNA দ্বিসূত্রকের গুয়ানিন (G) ও সাইটোসিন (C)-এর মধ্যে কয়টি হাইড্রোজেন বন্ধন থাকে?",
    questionEn: "How many hydrogen bonds connect Guanine and Cytosine in a double-stranded DNA molecule?",
    options: [
      "১টি",
      "২টি",
      "৩টি",
      "৪টি"
    ],
    correctIndex: 2,
    modelAnswerBn: "সঠিক উত্তর (C) ৩টি হাইড্রোজেন বন্ধন (G ≡ C)। অন্যদিকে অ্যাডেনিন ও থাইমিনের মধ্যে ২টি হাইড্রোজেন বন্ধন থাকে (A = T)।",
    modelAnswerEn: "Correct answer is (C) 3 hydrogen bonds. Guanine and cytosine form three hydrogen bonds, while adenine and thymine form two.",
    examinerTipBn: "যে ডিএনএ-তে G-C অনুপাত বেশি থাকে, তার মেল্টিং টেম্পারেচার (Tm) বেশি হয়।",
    commonTrapBn: "A-T এর সাথে G-C গুলিয়ে ফেলে ২ দাগানো।"
  },
  // BENGALI A
  {
    id: "qb-ben-1",
    subject: "Bengali",
    chapter: "গল্প: আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)",
    unit: "সাহিত্য সংকলন • গল্প",
    year: "WBCHSE 2024",
    difficulty: "Easy",
    questionBn: "জয়রাম মোক্তার আদিরিনী হাতিটিকে কত টাকায় কিনেছিলেন?",
    questionEn: "What was the purchase price of Adarini the elephant by Jayram Mokhtar?",
    options: [
      "১০০০ টাকা",
      "১৫০০ টাকা",
      "২০০০ টাকা",
      "৩০০০ টাকা"
    ],
    correctIndex: 2,
    modelAnswerBn: "সঠিক উত্তর (C) ২০০০ টাকা। প্রভাত কুমার মুখোপাধ্যায়ের বিখ্যাত গল্পে জয়রাম মোক্তার কন্যাস্নেহে ২০০০ টাকায় আদিরিনীকে ক্রয় করেছিলেন।",
    modelAnswerEn: "Correct answer is (C) 2000 rupees.",
    examinerTipBn: "আদিরিনীর ক্রয়মূল্য ২০০০ টাকা — এই প্রশ্নটি শর্ট অ্যানসার ও MCQ উভয় ক্ষেত্রেই বারংবার আসে।",
    commonTrapBn: "অন্যান্য সংখ্যার সাথে তালগোল পাকিয়ে ১০০০ বা ১৫০০ মনে করা।"
  },
  {
    id: "qb-ben-2",
    subject: "Bengali",
    chapter: "প্রবন্ধ: বাঙ্গালা ভাষা (স্বামী বিবেকানন্দ)",
    unit: "সাহিত্য সংকলন • প্রবন্ধ",
    year: "WBCHSE 2023",
    difficulty: "Medium",
    questionBn: "স্বামী বিবেকানন্দ 'বাঙ্গালা ভাষা' প্রবন্ধে কোন ধরনের ভাষার বিকাশ চেয়েছিলেন?",
    questionEn: "What was Swami Vivekananda's perspective on the Bengali vernacular in his essay?",
    options: [
      "অতিরিক্ত সংস্কৃতবহুল কঠিন সাধু ভাষা",
      "সাধারণ জনগণের মুখের সতেজ চলিত ভাষা",
      "শুধু ইংরেজি শব্দের মিশ্রণ",
      "শুধুমাত্র প্রাচীন কাব্যিক ভাষা"
    ],
    correctIndex: 1,
    modelAnswerBn: "সঠিক উত্তর (B)। স্বামী বিবেকানন্দ স্পষ্ট ভাষায় বলেছিলেন, ভাষাকে সাধারণ মানুষের মুখের ভাষার কাছে নিয়ে আসতে হবে, যা হবে প্রাণবন্ত, তেজস্বী ও সহজবোধ্য।",
    modelAnswerEn: "Correct answer is (B). Vivekananda strongly advocated for simple, expressive spoken colloquial Bengali.",
    examinerTipBn: "'ভাব থাকলেই ভাষা আপনি আসে' — বিবেকানন্দের এই বক্তব্যটি মনে রাখবেন।",
    commonTrapBn: "সাধু ভাষার পক্ষে বিবেকানন্দ ছিলেন বলে অনেকে ভুল ধারণা পোষণ করেন।"
  },
  // ENGLISH B
  {
    id: "qb-eng-1",
    subject: "English",
    chapter: "The Bet (Anton Chekhov)",
    unit: "English Prose",
    year: "WBCHSE 2024",
    difficulty: "Easy",
    questionBn: "'The Bet' গল্পে ব্যাংকার ও তরুণ উকিলের বাজির অর্থের পরিমাণ কত ছিল?",
    questionEn: "What was the sum of money staked in the bet between the banker and the lawyer?",
    options: [
      "1 million rubles",
      "2 million rubles",
      "5 million rubles",
      "10 million rubles"
    ],
    correctIndex: 1,
    modelAnswerBn: "সঠিক উত্তর (B) ২ মিলিয়ন রুবেল। ১৫ বছরের নির্জন কারাবাসের বিনিময়ে এই বাজি ধরা হয়েছিল।",
    modelAnswerEn: "Correct answer is (B) 2 million rubles for 15 years of solitary confinement.",
    examinerTipBn: "Critical Data: 2 million rubles, 15 years solitary confinement in the banker's garden house.",
    commonTrapBn: "Confusion with other currency or numbers like 1 million."
  },
  {
    id: "qb-eng-2",
    subject: "English",
    chapter: "The Night Train at Deoli (Ruskin Bond)",
    unit: "English Prose",
    year: "WBCHSE 2023",
    difficulty: "Easy",
    questionBn: "দেওলি স্টেশনের প্ল্যাটফর্মে দেখা যুবতী মেয়েটি কী বিক্রি করছিল?",
    questionEn: "What was the girl selling on the platform of Deoli railway station?",
    options: [
      "Clay toys",
      "Cane baskets (বেতের ঝুড়ি)",
      "Tea and snacks",
      "Magazines"
    ],
    correctIndex: 1,
    modelAnswerBn: "সঠিক উত্তর (B) Cane baskets। মেয়েটি তার হাতে বোনা বেতের ঝুড়ি বিক্রি করছিল।",
    modelAnswerEn: "Correct answer is (B) Cane baskets.",
    examinerTipBn: "The basket girl is the central symbol of romantic longing and unreachable beauty in the story.",
    commonTrapBn: "Guessing tea or books on railway platforms."
  }
];

export const QuestionBank: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(() => {
    try {
      const s = localStorage.getItem("ss_bookmarked_questions");
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });

  const filteredQuestions = useMemo(() => {
    return QUESTION_BANK_DATA.filter((q) => {
      const matchSub = selectedSubject === "All" || q.subject === selectedSubject;
      const matchDiff = difficultyFilter === "All" || q.difficulty === difficultyFilter;
      const qText = (q.questionBn + q.questionEn + q.chapter + q.modelAnswerBn).toLowerCase();
      const matchSearch = !searchQuery.trim() || qText.includes(searchQuery.toLowerCase());
      return matchSub && matchDiff && matchSearch;
    });
  }, [selectedSubject, difficultyFilter, searchQuery]);

  const handleToggleBookmark = (id: string) => {
    soundEffects.play("click");
    setBookmarkedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("ss_bookmarked_questions", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_#0f172a] overflow-hidden text-left">
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
              <BookOpen size={14} /> WBCHSE Question Repository
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              চ্যাপ্টারভিত্তিক মডেল প্রশ্নব্যাংক
            </h2>
            <p className="text-xs md:text-sm text-white/90">
              Class 12 Semester 3 • পূর্ণাঙ্গ মডেল উত্তর ও পরীক্ষকের টিপস
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-black/20 p-2.5 rounded-2xl border border-white/20">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-white/70 block uppercase">উপলব্ধ প্রশ্ন</span>
              <span className="text-xl font-black text-amber-300">{QUESTION_BANK_DATA.length}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-white/70 block uppercase">সংরক্ষিত</span>
              <span className="text-xl font-black text-emerald-300">{Object.keys(bookmarkedIds).length}</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="প্রশ্ন বা বিষয় খুঁজুন (যেমন: ZP3, আদিরিনী, The Bet, ওভিউলেশন)..."
            className="w-full pl-11 pr-4 py-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pt-4 pb-1">
          {["All", "Biology", "Bengali", "English"].map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
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

      {/* Main Question List */}
      <div className="p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span>মোট পাওয়া গেছে: {filteredQuestions.length} টি প্রশ্ন</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">কঠিনতা:</span>
            {["All", "Easy", "Medium", "Board Standard"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficultyFilter(d)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                  difficultyFilter === d ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <BookOpen size={40} className="mx-auto text-slate-400 mb-2" />
            <h4 className="text-base font-black text-slate-800 dark:text-white">কোনো প্রশ্ন মেলেনি</h4>
            <p className="text-xs text-slate-500 mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            const isBookmarked = !!bookmarkedIds[q.id];

            return (
              <div
                key={q.id}
                className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:border-indigo-400/50 transition-all"
              >
                {/* Question Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-5 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {q.subject}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {q.chapter}
                      </span>
                      {q.year && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          {q.year}
                        </span>
                      )}
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {q.difficulty}
                      </span>
                    </div>

                    <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      <MathText text={q.questionBn} />
                    </h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      <MathText text={q.questionEn} />
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark(q.id);
                      }}
                      className={`p-2 rounded-xl transition-all ${
                        isBookmarked 
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300" 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                      title="Bookmark Question"
                    >
                      <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Model Answer & Hints */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-4"
                    >
                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = optIdx === q.correctIndex;
                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
                                isCorrect
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold"
                                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                                  isCorrect ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span><MathText text={opt} /></span>
                              </div>
                              {isCorrect && (
                                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                                  সঠিক উত্তর ✓
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Model Answer Box */}
                      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase">
                          <CheckCircle2 size={16} />
                          <span>পূর্ণাঙ্গ মডেল সমাধান (Model Solution)</span>
                        </div>
                        <div className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          <MathText text={q.modelAnswerBn} />
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-sans border-t border-indigo-100 dark:border-indigo-900/50 pt-2">
                          <MathText text={q.modelAnswerEn} />
                        </div>
                      </div>

                      {/* Examiner Tip & Trap Warning */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 space-y-1">
                          <span className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-[11px] uppercase">
                            <Sparkles size={14} /> পরীক্ষকের টিপস:
                          </span>
                          <p>{q.examinerTipBn}</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 space-y-1">
                          <span className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-[11px] uppercase">
                            <AlertCircle size={14} /> সাধারণ বিভ্রান্তি (Common Trap):
                          </span>
                          <p>{q.commonTrapBn}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
