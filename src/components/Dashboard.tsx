import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { nativeService } from "../services/nativeService";
import { 
  BookOpen, 
  Brain, 
  Calculator, 
  Sparkles, 
  Clock, 
  Target, 
  BarChart3, 
  Camera, 
  Trophy, 
  Activity, 
  Zap, 
  Bot, 
  Users, 
  Search, 
  ShieldAlert, 
  Megaphone, 
  CheckCircle2, 
  FileText, 
  Flame, 
  Headphones, 
  Award, 
  Check, 
  Mic, 
  Layers, 
  Play, 
  Pause,
  X, 
  ArrowRight, 
  Palette, 
  Atom, 
  FlaskConical, 
  Maximize2, 
  Radio, 
  Share2, 
  ChevronRight,
  TrendingUp,
  Bookmark,
  Volume2,
  VolumeX,
  RotateCcw,
  FastForward,
  HelpCircle,
  Lightbulb,
  Compass,
  GraduationCap,
  Printer,
  Swords,
  PhoneCall,
  Phone
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area 
} from "recharts";
import { db } from "../firebase";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { AIStudyDashboardCard } from "./AIStudyDashboardCard";
import { ScienceLab3D } from "./ScienceLab3D";
import { TiltContainer } from "./TiltContainer";
import { FALLBACK_WBCHSE_QUESTIONS } from "../data/wbchseFallbackQuestions";
import { DEFAULT_WBCHSE_NOTICES } from "../data/wbchseNoticesData";
import { MathText } from "./MathText";

interface DashboardProps {
  onAction: (type: string) => void;
  userName: string;
  userPhoto?: string;
  userUid?: string;
  onLogin?: () => void;
  onLogout?: () => void;
  dailyGoals?: { id: string; text: string; completed: boolean }[];
  toggleGoal?: (id: string) => void;
  globalActions?: { id: string; userName: string; text: string; timestamp: string; userId?: string }[];
  isAdmin?: boolean;
  onOpenBuildDocs?: () => void;
  onOpenProfile?: () => void;
  onOpenThemes?: () => void;
  currentThemeId?: string;
  isDarkMode?: boolean;
  themeMode?: "auto" | "light" | "dark" | string;
  onToggleThemeMode?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onAction, 
  userName, 
  userPhoto, 
  userUid,
  onLogin, 
  onLogout, 
  dailyGoals = [], 
  toggleGoal,
  globalActions = [],
  isAdmin = false,
  onOpenBuildDocs,
  onOpenProfile,
  onOpenThemes,
  currentThemeId,
  isDarkMode: propIsDarkMode,
  themeMode,
  onToggleThemeMode
}) => {
  // Theme state
  const isDarkMode = typeof propIsDarkMode === "boolean" ? propIsDarkMode : document.documentElement.classList.contains("dark");

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState<string>("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Category Filter
  const [homeCategory, setHomeCategory] = useState<"all" | "3d_lab" | "practice" | "tools" | "modules" | "analytics">("all");

  // Active Subject Selector
  const [activeSubject, setActiveSubject] = useState<"Biology" | "Bengali A" | "English B" | "Physics" | "Chemistry" | "Mathematics">("Biology");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Firestore Live State & Official Notices
  const [liveNotices, setLiveNotices] = useState<any[]>(DEFAULT_WBCHSE_NOTICES);
  const [activeNoticeIdx, setActiveNoticeIdx] = useState<number>(0);
  const [onlineStudents, setOnlineStudents] = useState<any[]>([]);
  const [userCoins] = useState<number>(120);
  const [userXP] = useState<number>(850);
  const [userStreak] = useState<number>(7);

  // In-Dashboard Quick MCQ Sprint State
  const [activeSprintIndex, setActiveSprintIndex] = useState(0);
  const [sprintSelectedOption, setSprintSelectedOption] = useState<number | null>(null);
  const [sprintAnswered, setSprintAnswered] = useState(false);
  const [sprintScore, setSprintScore] = useState(0);

  // Modals state
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  // Subject syllabus spotlight & color themes
  const subjectThemes: Record<string, {
    gradient: string;
    badgeBg: string;
    accentColor: string;
    glowColor: string;
    unit: string;
    chapter: string;
    topicBn: string;
    summary: string;
    keyPoints: string[];
    actionCode: string;
    audioTitle: string;
    audioDuration: string;
    masteryPercent: number;
  }> = {
    Biology: {
      gradient: "from-emerald-600 via-teal-600 to-cyan-600",
      badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      accentColor: "#10B981",
      glowColor: "rgba(16, 185, 129, 0.25)",
      unit: "Unit I: Reproduction & Genetics",
      chapter: "Sexual Reproduction in Flowering Plants",
      topicBn: "সপুষ্পক উদ্ভিদের যৌন জনন ও মাইক্রোস্পোরোজেনেসিস",
      summary: "Microsporogenesis, Megasporogenesis, Pollination mechanisms (Geitonogamy & Xenogamy), and ZP3 human sperm receptor.",
      keyPoints: ["ZP3 Primary Sperm Receptor", "LH Surge on Day 14 Triggers Ovulation", "DNA Base Pairing: A=T (2 bonds), G≡C (3 bonds)"],
      actionCode: "show_speedblitz",
      audioTitle: "Biology Podcast: Microsporogenesis & Pollination",
      audioDuration: "14:20 mins",
      masteryPercent: 86
    },
    "Bengali A": {
      gradient: "from-rose-600 via-red-600 to-amber-600",
      badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      accentColor: "#E11D48",
      glowColor: "rgba(225, 29, 72, 0.25)",
      unit: "উচ্চমাধ্যমিক সাহিত্য সঞ্চয়ন",
      chapter: "আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)",
      topicBn: "জয়রাম মোক্তার ও আদিরিনী হাতির বাৎসল্য সম্পর্ক",
      summary: "জয়রাম মোক্তারের পারিবারিক হাতি আদিরিনীর করুণ পরিণতি, ক্রয়মূল্য ২০০০ টাকা এবং নিঃস্বার্থ ভালোবাসার উপাখ্যান।",
      keyPoints: ["আদিরিনীর ক্রয়মূল্য: ২০০০ টাকা", "স্বামী বিবেকানন্দের 'বাঙ্গালা ভাষা'", "শ্রীজাতর 'ধর্ম' কবিতা ও মনুষ্যত্বের জয়"],
      actionCode: "show_exam_booster",
      audioTitle: "সাহিত্য পডকাস্ট: আদিরিনী ও স্বামী বিবেকানন্দের প্রবন্ধ",
      audioDuration: "18:45 mins",
      masteryPercent: 92
    },
    "English B": {
      gradient: "from-indigo-600 via-blue-600 to-sky-600",
      badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      accentColor: "#4F46E5",
      glowColor: "rgba(79, 70, 229, 0.25)",
      unit: "Class 12 Prose & Verse",
      chapter: "Strong Roots (APJ Abdul Kalam)",
      topicBn: "রামেশ্বরমে আধ্যাত্মিক লালন-পালন ও আত্মশুদ্ধি",
      summary: "Spiritual upbringing in Rameswaram, communion of souls through prayer, and Anton Chekhov's 'The Bet' (2M rubles for 15 yrs).",
      keyPoints: ["Ruskin Bond: The Night Train at Deoli", "Alfred Lord Tennyson: Ulysses", "J.M. Synge: Riders to the Sea tragedy"],
      actionCode: "show_exam_booster",
      audioTitle: "English Audio: Strong Roots & The Bet Analysis",
      audioDuration: "16:10 mins",
      masteryPercent: 88
    },
    Physics: {
      gradient: "from-cyan-600 via-blue-600 to-indigo-700",
      badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      accentColor: "#06B6D4",
      glowColor: "rgba(6, 182, 212, 0.25)",
      unit: "Unit III & IV: Electrodynamics",
      chapter: "Electromagnetic Waves & Lorentz Force",
      topicBn: "তড়িৎচুম্বকীয় তরঙ্গ ও লরেঞ্জ বলের সমীকরণ",
      summary: "Oscillating E and B vectors, speed of light in vacuum c = 1/√(μ0ε0), and magnetic force F = q(v × B).",
      keyPoints: ["Lorentz Force F = q(E + v × B)", "Bohr Levels En = -13.6/n² eV", "Wave Propagation in 3D Space"],
      actionCode: "show_math",
      audioTitle: "Physics Pod: EM Wave Propagation & Lorentz Equations",
      audioDuration: "20:00 mins",
      masteryPercent: 74
    },
    Chemistry: {
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      badgeBg: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      accentColor: "#FF7A30",
      glowColor: "rgba(255, 122, 48, 0.25)",
      unit: "Physical & Organic Chemistry",
      chapter: "Molecular Geometry & Resonance",
      topicBn: "বেনজিন বলয়ের ডিলোকালাইজড পাই-ইলেকট্রন ও স্ফটিক জালক",
      summary: "Benzene planar sp² hybrid ring, water dipoles (104.5°), and NaCl FCC face-centered cubic lattice.",
      keyPoints: ["Benzene C6H6 Planar Resonance", "Water Bent Geometry & H-Bonds", "NaCl Unit Cell Ionic Binding"],
      actionCode: "show_math",
      audioTitle: "Chemistry Pod: Organic Resonance & Benzene Aromaticity",
      audioDuration: "15:30 mins",
      masteryPercent: 78
    },
    Mathematics: {
      gradient: "from-purple-600 via-fuchsia-600 to-pink-600",
      badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      accentColor: "#A855F7",
      glowColor: "rgba(168, 85, 247, 0.25)",
      unit: "Calculus & 3D Geometry",
      chapter: "3D Surfaces & Functions",
      topicBn: "ত্রিমাত্রিক সমতল, প্যারাবোলয়েড ও ক্যালকুলাস",
      summary: "Hyperbolic paraboloid saddle z = (x²/a² - y²/b²), 3D torus topology, and multivariable differentiation.",
      keyPoints: ["z = (x²/a² - y²/b²) Saddle Point", "Torus Parametric Equation", "Sinc 2D Wave Interference"],
      actionCode: "show_math",
      audioTitle: "Math Pod: 3D Coordinate Geometry & Vectors",
      audioDuration: "22:15 mins",
      masteryPercent: 82
    }
  };

  // Sync announcements from Firestore & fallback to official default notices
  useEffect(() => {
    try {
      const q = query(collection(db, "announcements"), limit(12));
      const unsub = onSnapshot(q, (snapshot) => {
        const firestoreList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const merged = [...firestoreList];
        DEFAULT_WBCHSE_NOTICES.forEach(def => {
          if (!merged.some((m: any) => m.id === def.id || (m.title && m.title === def.title))) {
            merged.push(def);
          }
        });
        merged.sort((a: any, b: any) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
        });
        setLiveNotices(merged);
      }, (err) => {
        console.warn("Announcements Firestore sync note, using default WBCHSE notices:", err);
        setLiveNotices(DEFAULT_WBCHSE_NOTICES);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Announcements sync error:", e);
      setLiveNotices(DEFAULT_WBCHSE_NOTICES);
    }
  }, []);

  // Auto-cycle notice bulletin every 6 seconds
  useEffect(() => {
    if (liveNotices.length <= 1) return;
    const interval = setInterval(() => {
      setActiveNoticeIdx(prev => (prev + 1) % liveNotices.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [liveNotices.length]);

  // Sync users
  useEffect(() => {
    try {
      const q = query(collection(db, "users"), limit(15));
      const unsub = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setOnlineStudents(list);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Users sync warn:", e);
    }
  }, []);

  // 18 Supercharged AI Study Tools
  const aiToolsCatalog = [
    { id: "accountability", title: "Daily Calls & Parent Vigilance", desc: "Morning/Night accountability calls, study proof & parent WhatsApp report", icon: <PhoneCall className="w-5 h-5 text-amber-400" />, action: "show_accountability", tag: "Vigilance", gradient: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/30" },
    { id: "ai_autopsy", title: "AI Weak Area Autopsy", desc: "Diagnostic mistake analysis & 5-min fix", icon: <ShieldAlert className="w-5 h-5 text-rose-400" />, action: "show_autopsy", tag: "Diagnostic", gradient: "from-rose-500/20 to-orange-500/10", border: "border-rose-500/30" },
    { id: "voice_quiz", title: "Voice MCQ Challenge", desc: "Speak answers aloud to AI mentor", icon: <Mic className="w-5 h-5 text-indigo-400" />, action: "show_voice_quiz", tag: "Voice AI", gradient: "from-indigo-500/20 to-purple-500/10", border: "border-indigo-500/30" },
    { id: "quiz_duel", title: "1v1 Friend Quiz Duel", desc: "Battle classmates on WhatsApp & Telegram", icon: <Swords className="w-5 h-5 text-orange-400" />, action: "show_quiz_duel", tag: "1v1 Arena", gradient: "from-orange-500/20 to-red-500/10", border: "border-orange-500/30" },
    { id: "printable_pdf", title: "Model Paper & OMR PDF", desc: "1-click printable question & OMR sheet", icon: <Printer className="w-5 h-5 text-amber-400" />, action: "show_printable_pdf", tag: "Printable", gradient: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/30" },
    { id: "formula_diary", title: "Formula & Quote Diary", desc: "Personal sticky equations & literary quotes", icon: <Bookmark className="w-5 h-5 text-teal-400" />, action: "show_formula_diary", tag: "Bookmarks", gradient: "from-teal-500/20 to-emerald-500/10", border: "border-teal-500/30" },
    { id: "3d_science_lab", title: "3D Science Lab", desc: "Interactive Chemistry, Physics, Math in 3D", icon: <Atom className="w-5 h-5 text-cyan-400" />, action: "show_3d_lab", tag: "3D Studio", gradient: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/30" },
    { id: "mcq_bank", title: "WBCHSE MCQ Bank", desc: "Sem 3 MCQs with Bengali explanations", icon: <Brain className="w-5 h-5 text-indigo-400" />, action: "show_mcq_bank", tag: "MCQ Bank", gradient: "from-indigo-500/20 to-purple-500/10", border: "border-indigo-500/30" },
    { id: "speedblitz", title: "Speed Blitz", desc: "60-second rapid fire MCQ sprints", icon: <Flame className="w-5 h-5 text-rose-400" />, action: "show_speedblitz", tag: "Fast Quiz", gradient: "from-rose-500/20 to-orange-500/10", border: "border-rose-500/30" },
    { id: "chapter_notes", title: "Revision Notes", desc: "Bengali & English chapter notes for Sem 3", icon: <BookOpen className="w-5 h-5 text-amber-400" />, action: "show_resources", tag: "Notes Hub", gradient: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/30" },
    { id: "doubt_solver", title: "AI Doubt Solver", desc: "Instant step-by-step solutions", icon: <Bot className="w-5 h-5 text-sky-400" />, action: "show_doubt", tag: "AI Mentor", gradient: "from-sky-500/20 to-blue-500/10", border: "border-sky-500/30" },
    { id: "voice_tutor", title: "Voice Tutor", desc: "Real-time voice discussions for Class 12", icon: <Mic className="w-5 h-5 text-emerald-400" />, action: "begin_sync", tag: "Voice AI", gradient: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/30" },
    { id: "flashcard_deck", title: "3D Flashcards", desc: "Spaced-repetition concept cards", icon: <Layers className="w-5 h-5 text-purple-400" />, action: "show_flashcards", tag: "Flashcards", gradient: "from-purple-500/20 to-pink-500/10", border: "border-purple-500/30" },
    { id: "focus_room", title: "Focus Study Room", desc: "Pomodoro timer + binaural alpha audio", icon: <Clock className="w-5 h-5 text-orange-400" />, action: "show_focus_room", tag: "Focus", gradient: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/30" },
    { id: "notice_board", title: "Notice Board & PDFs", desc: "WBCHSE official notices & routine PDFs", icon: <BookOpen className="w-5 h-5 text-teal-400" />, action: "show_notices", tag: "PDF Board", gradient: "from-teal-500/20 to-emerald-500/10", border: "border-teal-500/30" },
    { id: "telegram_portal", title: "Telegram AI Bot", desc: "Study reminders & quizzes on Telegram", icon: <Radio className="w-5 h-5 text-blue-400" />, action: "show_telegram", tag: "Bot Hub", gradient: "from-blue-500/20 to-indigo-500/10", border: "border-blue-500/30" },
    { id: "question_scanner", title: "Question Scanner", desc: "Scan textbook pages & photos instantly", icon: <Camera className="w-5 h-5 text-pink-400" />, action: "show_scanner", tag: "OCR AI", gradient: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/30" },
    { id: "math_solver", title: "Formula Cheat Sheet", desc: "Maths, Physics & Chemistry equation solver", icon: <Calculator className="w-5 h-5 text-emerald-400" />, action: "show_math", tag: "Formulas", gradient: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/30" },
    { id: "mindmap", title: "Concept Mind Maps", desc: "Interactive visual knowledge trees", icon: <Sparkles className="w-5 h-5 text-violet-400" />, action: "show_mindmap", tag: "Visualizer", gradient: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/30" },
    { id: "mock_test", title: "Mock Test AI", desc: "Full-length timed exam simulation", icon: <Trophy className="w-5 h-5 text-amber-400" />, action: "show_mock", tag: "Exam Sim", gradient: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/30" },
    { id: "mistake_bank", title: "Mistake Bank", desc: "Review incorrect answers & fix errors", icon: <ShieldAlert className="w-5 h-5 text-rose-400" />, action: "show_mistakes", tag: "Fix Errors", gradient: "from-rose-500/20 to-red-500/10", border: "border-rose-500/30" },
    { id: "syllabus", title: "Class 12 Roadmap", desc: "Semester 3 syllabus tracker & checklist", icon: <Target className="w-5 h-5 text-teal-400" />, action: "show_syllabus", tag: "Syllabus", gradient: "from-teal-500/20 to-cyan-500/10", border: "border-teal-500/30" },
    { id: "memory_vault", title: "AI Memory Vault", desc: "Persistent account-synced study memory", icon: <Brain className="w-5 h-5 text-indigo-400" />, action: "show_memory", tag: "Vault", gradient: "from-indigo-500/20 to-blue-500/10", border: "border-indigo-500/30" },
    { id: "pdf_summary", title: "PDF Chapter Summary", desc: "Instant chapter notes & key takeaway extractor", icon: <FileText className="w-5 h-5 text-sky-400" />, action: "show_resources", tag: "PDF AI", gradient: "from-sky-500/20 to-indigo-500/10", border: "border-sky-500/30" },
  ];

  // Filter tools
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return aiToolsCatalog;
    const q = searchQuery.toLowerCase();
    return aiToolsCatalog.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.desc.toLowerCase().includes(q) || 
      t.tag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Current Subject Questions for In-Dashboard Sprint
  const currentSubjectQuestions = FALLBACK_WBCHSE_QUESTIONS[activeSubject] || FALLBACK_WBCHSE_QUESTIONS["Biology"] || [];
  const activeQuestion = currentSubjectQuestions[activeSprintIndex % currentSubjectQuestions.length];

  const handleSprintSubmit = (optionIndex: number) => {
    if (sprintAnswered) return;
    setSprintSelectedOption(optionIndex);
    setSprintAnswered(true);
    if (optionIndex === activeQuestion.correctIndex) {
      setSprintScore(prev => prev + 10);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.85 } });
      nativeService.showToast("Correct Answer! +10 XP awarded");
    } else {
      nativeService.showToast("Check the explanation below!");
    }
  };

  const handleNextSprintQuestion = () => {
    setSprintSelectedOption(null);
    setSprintAnswered(false);
    setActiveSprintIndex(prev => (prev + 1) % currentSubjectQuestions.length);
  };

  const currentTheme = subjectThemes[activeSubject] || subjectThemes["Biology"];

  // Weekly study data for Recharts
  const weeklyData = [
    { day: "Mon", hours: 2.8, questions: 25 },
    { day: "Tue", hours: 3.4, questions: 40 },
    { day: "Wed", hours: 4.0, questions: 55 },
    { day: "Thu", hours: 3.1, questions: 30 },
    { day: "Fri", hours: 4.5, questions: 60 },
    { day: "Sat", hours: 5.2, questions: 75 },
    { day: "Sun", hours: 3.8, questions: 45 },
  ];

  return (
    <div className="w-full min-h-full pb-32 px-2.5 sm:px-4 md:px-6 space-y-6 max-w-7xl mx-auto bg-notebook-subtle transition-colors duration-500">
      
      {/* ================= 1. MASTER COCKPIT HEADER WITH LIVE STATS ================= */}
      <header className="space-y-5 pt-2">
        <div className="p-7 stranger-card-premium relative overflow-hidden group">
          {/* Ambient Glow */}
          <div 
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20 dark:opacity-30"
            style={{ backgroundColor: currentTheme.accentColor }}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 relative z-10">
            {/* User Details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500 dark:text-stone-400 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-stone-800 dark:text-white font-bold">WBCHSE Class 12 Sem 3</span>
                <span aria-hidden="true">·</span>
                <span>{currentTime || "12:00 PM"}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-500 dark:text-amber-400 font-bold">🔥 {userStreak} Days Streak</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#FF7A30] font-bold">🪙 {userCoins} Coins</span>
                {onToggleThemeMode && (
                  <>
                    <span aria-hidden="true">·</span>
                    <button
                      onClick={onToggleThemeMode}
                      className="px-2 py-0.5 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-[10px] font-bold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-all flex items-center gap-1 cursor-pointer"
                      title="Toggle Day / Night / Auto mode"
                    >
                      {themeMode === "light" ? "☀️ দিন (Light)" : themeMode === "dark" ? "🌙 রাত (Dark)" : "⏰ অটো (Day/Night)"}
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl text-white shrink-0 stranger-scribble-border"
                  style={{ background: `linear-gradient(135deg, ${currentTheme.accentColor}, #FF7A30)` }}
                >
                  {userName ? userName.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tighter stranger-text-editorial">
                    Welcome, {userName || "Student"}!
                  </h1>
                  <p className="text-xs text-stone-600 dark:text-stone-300 font-medium flex items-center gap-2">
                    <span>Active Topic:</span>
                    <strong style={{ color: currentTheme.accentColor }}>{activeSubject}</strong>
                    <span className="text-[10px] bg-stone-100 dark:bg-white/10 px-1.5 py-0.2 rounded font-mono text-stone-700 dark:text-stone-200">
                      Mastery: {currentTheme.masteryPercent}%
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 sm:flex items-center gap-4 pt-2 sm:pt-0">
              <button
                onClick={() => onAction("show_3d_lab")}
                className="stranger-btn-secondary px-5 py-3 text-[10px] sm:text-xs uppercase tracking-[0.15em] flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer min-h-[48px] rounded-2xl border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm"
              >
                <Atom size={16} className="text-[#FF7A30]" />
                <span>3D Lab</span>
              </button>

              <button
                onClick={() => onAction("show_speedblitz")}
                className="stranger-btn-human px-5 py-3 text-[10px] sm:text-xs uppercase tracking-[0.15em] flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <Flame size={16} />
                <span>Blitz</span>
              </button>

              <button
                onClick={() => onAction("begin_sync")}
                className="stranger-btn-human bg-emerald-600 shadow-emerald-500/20 px-5 py-3 text-[10px] sm:text-xs uppercase tracking-[0.15em] flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <Mic size={16} />
                <span>Voice AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Search & Subject Swipeable Switcher Strip */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-x-auto touch-pan-x w-full sm:w-auto py-1 custom-scrollbar">
            {(["Biology", "Bengali A", "English B", "Physics", "Chemistry", "Mathematics"] as const).map((sub) => {
              const isSelected = activeSubject === sub;
              const subTheme = subjectThemes[sub];
              return (
                <button
                  key={sub}
                  onClick={() => setActiveSubject(sub)}
                  className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer min-h-[36px] ${
                    isSelected
                      ? "text-white shadow-md scale-[1.02]"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  }`}
                  style={isSelected ? { backgroundColor: subTheme.accentColor } : {}}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 18 tools, MCQs, formulas..."
              className="stranger-input w-full pl-10 pr-4 py-2.5 text-xs"
            />
          </div>
        </div>

        {/* ================= OFFICIAL BULLETIN & ANNOUNCEMENTS BANNER ================= */}
        {(() => {
          const currentNotice = liveNotices[activeNoticeIdx % (liveNotices.length || 1)] || DEFAULT_WBCHSE_NOTICES[0];
          return (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-stone-50 dark:from-stone-900/90 dark:via-stone-900/90 dark:to-stone-950 border border-orange-500/30 dark:border-stone-800 shadow-xs relative overflow-hidden transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                {/* Left: Icon & Title with active badge */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7A30] to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                    <Megaphone size={18} className="animate-pulse" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7A30] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A30] animate-ping" />
                        OFFICIAL BULLETIN
                      </span>
                      {currentNotice?.badge && (
                        <span className="px-2 py-0.2 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 text-[9px] font-mono font-black border border-red-500/30">
                          {currentNotice.badge}
                        </span>
                      )}
                      {currentNotice?.category && (
                        <span className="px-2 py-0.2 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[9px] font-bold">
                          {currentNotice.category}
                        </span>
                      )}
                      <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
                        Notice {(activeNoticeIdx % (liveNotices.length || 1)) + 1} of {liveNotices.length || 1}
                      </span>
                    </div>

                    {/* Notice Title & Snippet */}
                    <div 
                      onClick={() => onAction("show_notices")}
                      className="cursor-pointer group"
                    >
                      <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-[#FF7A30] transition-colors line-clamp-1 leading-snug">
                        {currentNotice?.title || "WBCHSE Class 12 Semester 3 Updates"}
                      </h4>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 font-medium line-clamp-1">
                        {currentNotice?.text || "সকল পরীক্ষার নির্ঘন্ট ও সিলেবাস নির্দেশিকা লাইভ চেক করুন।"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Prev / Next notice switcher */}
                  <div className="flex items-center gap-0.5 bg-white/80 dark:bg-stone-800/80 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700">
                    <button
                      onClick={() => setActiveNoticeIdx(prev => (prev - 1 + liveNotices.length) % (liveNotices.length || 1))}
                      className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                      title="Previous Notice"
                    >
                      <ChevronRight size={13} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => setActiveNoticeIdx(prev => (prev + 1) % (liveNotices.length || 1))}
                      className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                      title="Next Notice"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  {/* View Board Primary CTA */}
                  <button
                    onClick={() => onAction("show_notices")}
                    className="px-3 py-1.5 rounded-xl bg-[#FF7A30] hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <BookOpen size={12} />
                    <span>View Board &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Category Navigation Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-2xl border border-stone-200/80 dark:border-stone-800/80 overflow-x-auto touch-pan-x py-1 custom-scrollbar">
          {[
            { id: "all", label: "🌟 All (সব অপশন)" },
            { id: "3d_lab", label: "🔬 3D Science Lab" },
            { id: "practice", label: "⚡ MCQs & Blitz" },
            { id: "tools", label: "🛠️ 18 AI Tools" },
            { id: "modules", label: "📚 Syllabus & Notes" },
            { id: "analytics", label: "📊 Heatmap & Stats" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setHomeCategory(tab.id as any)}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer min-h-[36px] ${
                homeCategory === tab.id
                  ? "bg-[#FF7A30] text-white shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ================= WBCHSE SEM 3 EXAM COUNTDOWN & READINESS COMMAND STRIP ================= */}
      <div className="p-6 stranger-card bg-gradient-to-r from-orange-50/50 via-white to-amber-50/50 dark:from-stone-900/50 dark:via-stone-900/50 dark:to-stone-950/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative overflow-hidden transition-colors duration-300">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#FF7A30]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left: Countdown & Target */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF7A30] to-rose-500 text-white flex flex-col items-center justify-center font-black shadow-lg shadow-orange-500/20 shrink-0">
            <span className="text-base leading-none">7</span>
            <span className="text-[8px] uppercase tracking-wider opacity-90">Days</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF7A30]">
              <span>WBCHSE Sem 3 Mathematics Exam</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white">
              7 Days Left • Higher Mathematics (উচ্চতর গণিত)
            </h3>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              Calculus • Vectors • Matrices • Probability • Target: 95%+
            </p>
          </div>
        </div>

        {/* Center: Readiness Score Bar */}
        <div className="flex-1 max-w-xs space-y-1.5 relative z-10">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-stone-700 dark:text-stone-300 font-bold flex items-center gap-1">
              <Award size={13} className="text-amber-500 dark:text-amber-400" />
              <span>Exam Readiness Score</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">88% Ready</span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden p-0.5">
            <div className="h-full rounded-full bg-gradient-to-r from-[#FF7A30] via-amber-400 to-emerald-400 w-[88%]" />
          </div>
        </div>

        {/* Right: Quick Launch Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x py-1 relative z-10 custom-scrollbar">
          <button
            onClick={() => onAction("show_autopsy")}
            className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <ShieldAlert size={14} className="text-rose-400" />
            <span>AI Autopsy</span>
          </button>

          <button
            onClick={() => onAction("show_voice_quiz")}
            className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Mic size={14} className="text-indigo-400" />
            <span>Voice Quiz</span>
          </button>

          <button
            onClick={() => onAction("show_quiz_duel")}
            className="px-3 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Swords size={14} className="text-[#FF7A30]" />
            <span>1v1 Duel</span>
          </button>

          <button
            onClick={() => onAction("show_printable_pdf")}
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Printer size={14} className="text-amber-400" />
            <span>OMR PDF</span>
          </button>

          <button
            onClick={() => onAction("show_formula_diary")}
            className="px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Bookmark size={14} className="text-teal-400" />
            <span>Diary</span>
          </button>
        </div>
      </div>

      {/* ================= 1.5. DAILY CALLING & FAMILY VIGILANCE PROPOSAL BANNER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-orange-950/80 via-stone-900 to-amber-950/80 border-2 border-[#FF7A30]/50 text-white shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative overflow-hidden group cursor-pointer"
        onClick={() => onAction("show_accountability")}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF7A30] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 shrink-0 group-hover:scale-105 transition-transform">
            <PhoneCall size={24} className="animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase tracking-wider">
                🔥 NEW FEATURE PROPOSAL • COMMUNITY POLL
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                190+ Votes Cast
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
              Daily Morning & Night Calling + Family Progress Vigilance
            </h3>
            <p className="text-xs text-stone-300 leading-snug">
              "Lack of tracking leads to missed goals..." Get morning task calls, night proof audit, and automated WhatsApp parent progress updates!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 relative z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction("show_accountability");
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-[#FF7A30] to-amber-500 hover:from-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-600/30 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
          >
            <span>Vote & View Protocol &rarr;</span>
          </button>
        </div>
      </motion.div>

      {/* ================= 2. SMART MULTI-BOARD AI DASHBOARD CARD ================= */}
      <TiltContainer maxTilt={3} scale={1.015}>
        <AIStudyDashboardCard
          userId={userUid}
          onOpenExamPreparation={(subject) => onAction("show_exam_prep")}
          onOpenProfile={() => {
            if (onOpenProfile) onOpenProfile();
            else onAction("show_profile");
          }}
          onOpenDoubtSolver={(subject) => onAction("show_doubt")}
          onOpenAskAI={() => onAction("begin_sync")}
          onOpenMockTest={(subject) => onAction("show_mock")}
          onOpenStudyPlan={() => onAction("show_accountability")}
          onOpenPracticeQuestions={(subject) => onAction("show_mcq_bank")}
          onOpenRevision={(subject) => onAction("show_revision")}
          onOpenNotes={(subject) => onAction("show_resources")}
          onOpenStudyMaterials={(subject) => onAction("show_resources")}
        />
      </TiltContainer>

      {/* ================= 3. ACTIVE CHAPTER SPOTLIGHT BENTO ================= */}
      <TiltContainer maxTilt={4} scale={1.01}>
        <motion.section 
          key={`spotlight-${activeSubject}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-r ${currentTheme.gradient} text-white shadow-xl relative overflow-hidden`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/90 flex-wrap">
                <span className="bg-black/25 px-2 py-0.5 rounded-md backdrop-blur-xs font-mono">
                  {activeSubject} Spotlight
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentTheme.unit}</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
                {currentTheme.chapter}
              </h2>

              <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                {currentTheme.topicBn}
              </p>

              <div className="pt-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {currentTheme.keyPoints.map((pt, i) => (
                  <span key={i} className="text-[10px] sm:text-[11px] font-medium bg-black/25 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                    ✓ {pt}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => onAction("show_3d_lab")}
                className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
              >
                <Atom size={16} />
                <span>3D Model</span>
              </button>

              <button
                onClick={() => onAction(currentTheme.actionCode)}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-white text-[#2D2623] hover:bg-amber-50 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer min-h-[44px]"
              >
                <Play size={16} fill="currentColor" />
                <span>Start MCQs</span>
              </button>
            </div>
          </div>
        </motion.section>
      </TiltContainer>

      {/* ================= 4. 3D SCIENCE & MATH LAB VIEWPORT ================= */}
      {(homeCategory === "3d_lab" || homeCategory === "all") && (
        <motion.section 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-3 sm:space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF7A30]">
                <span>3D Virtual Science Studio</span>
                <span aria-hidden="true">·</span>
                <span>Chemistry, Physics, Math, Biology</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Hands-on 3D Lab Simulation
              </h2>
            </div>

            <button
              onClick={() => onAction("show_3d_lab")}
              className="px-3.5 py-2 rounded-2xl bg-[#FF7A30] hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-colors self-start sm:self-center min-h-[38px]"
            >
              <Maximize2 size={13} />
              <span>Full Screen</span>
            </button>
          </div>

          <ScienceLab3D 
            onExploreTopic={(t) => onAction(`search_topic:${t}`)}
          />
        </motion.section>
      )}

      {/* ================= 6. THE INTERACTIVE BENTO DECK ================= */}
      {(homeCategory === "all" || homeCategory === "practice") && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* BENTO CARD 1: IN-DASHBOARD WBCHSE MCQ SPRINT (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-500">
                  <Brain size={16} />
                  <span>WBCHSE Instant MCQ Sprint</span>
                </div>
                <span className="text-[11px] font-mono text-stone-400 font-bold">
                  Q#{activeSprintIndex + 1} of {currentSubjectQuestions.length}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm md:text-base font-bold text-stone-900 dark:text-white leading-snug">
                <MathText text={activeQuestion?.questionEn} />
              </h3>

              {activeQuestion?.questionBn && (
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium leading-relaxed bangla-text">
                  <MathText text={activeQuestion.questionBn} />
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2">
              {(activeQuestion?.optionsEn || []).map((opt: string, optIdx: number) => {
                const isSelected = sprintSelectedOption === optIdx;
                const isCorrect = optIdx === activeQuestion.correctIndex;
                let btnStyle = "bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-[#FF7A30]";
                if (sprintAnswered) {
                  if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                  else if (isSelected) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSprintSubmit(optIdx)}
                    disabled={sprintAnswered}
                    className={`w-full p-2.5 sm:p-3 rounded-2xl border text-xs text-left flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${btnStyle}`}
                  >
                    <span className="flex-1">
                      <strong className="mr-1.5 font-mono">{String.fromCharCode(65 + optIdx)}.</strong>
                      <MathText text={opt} />
                    </span>
                    {sprintAnswered && isCorrect && <Check size={14} className="text-emerald-500 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation Drawer */}
            {sprintAnswered && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs space-y-2">
                <div className="text-stone-800 dark:text-stone-200">
                  <strong className="text-[#FF7A30] mr-1">ব্যাখ্যা (Explanation):</strong> 
                  <MathText text={activeQuestion?.explanationEn} />
                </div>
                {activeQuestion?.explanationBn && (
                  <div className="text-stone-600 dark:text-stone-400 text-[11px] bangla-text">
                    <MathText text={activeQuestion.explanationBn} />
                  </div>
                )}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleNextSprintQuestion}
                    className="px-4 py-2 bg-[#FF7A30] hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 min-h-[38px]"
                  >
                    <span>Next MCQ</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BENTO CARD 2: DAILY QUESTS & STUDY STREAKS (5 Cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                  <Target size={16} /> Daily Study Quests
                </span>
                <span className="text-[11px] font-mono text-stone-400 font-bold">
                  {dailyGoals.filter(g => g.completed).length} / {dailyGoals.length || 3} Done
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white">
                Today's Objectives
              </h3>
            </div>

            <div className="space-y-2">
              {(dailyGoals.length > 0 ? dailyGoals : [
                { id: "g1", text: "Complete Microsporogenesis MCQs", completed: true },
                { id: "g2", text: "Review 'The Bet' Prose Notes", completed: false },
                { id: "g3", text: "Inspect Benzene 3D Structure in Lab", completed: false }
              ]).map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal && toggleGoal(goal.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer min-h-[44px] ${
                    goal.completed
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                      : "bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-amber-500"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      goal.completed ? "bg-emerald-500 text-white" : "border border-stone-400"
                    }`}>
                      {goal.completed && <Check size={12} />}
                    </div>
                    <span className={`text-xs font-medium truncate ${goal.completed ? "line-through opacity-70" : ""}`}>
                      {goal.text}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500 font-bold shrink-0">+50 XP</span>
                </div>
              ))}
            </div>

            {/* Streak Indicator */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-500 dark:text-stone-400 font-mono">🔥 {userStreak} Days Streak</span>
              <button
                onClick={() => onAction("show_exam_booster")}
                className="text-[#FF7A30] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Syllabus Checklist</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================= 7. 18 SUPERCHARGED AI TOOLS GRID ================= */}
      {(homeCategory === "all" || homeCategory === "tools") && (
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF7A30]">
                <span>Autonomous AI Suite</span>
                <span aria-hidden="true">·</span>
                <span>18 Dedicated Learning Tools</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                AI Tools & Modules
              </h2>
            </div>
            <span className="text-xs text-stone-400 font-mono">
              {filteredTools.length} tools active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAction(tool.action)}
                className={`p-3.5 sm:p-4.5 rounded-3xl bg-white dark:bg-stone-900 border ${tool.border} hover:border-[#FF7A30] dark:hover:border-[#FF7A30] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-2.5 min-h-[140px]`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className={`p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br ${tool.gradient} group-hover:scale-110 transition-transform`}>
                    {tool.icon}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-stone-400 group-hover:text-[#FF7A30] transition-colors">
                    {tool.tag}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white group-hover:text-[#FF7A30] transition-colors leading-tight line-clamp-1">
                    {tool.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold text-[#FF7A30]">
                  <span>Launch</span>
                  <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ================= 8. STUDY ANALYTICS & RECHARTS ================= */}
      {(homeCategory === "all" || homeCategory === "analytics") && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          <div className="lg:col-span-8 p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <BarChart3 size={15} /> Weekly Study Velocity
                </span>
                <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white">
                  Study Hours & Solved Questions
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-400">Total: 27.6h</span>
            </div>

            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentTheme.accentColor} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={currentTheme.accentColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1c1917", borderRadius: "1rem", border: "1px solid #444", fontSize: "12px", color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="hours" stroke={currentTheme.accentColor} strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-orange-500 flex items-center gap-1.5">
                <Flame size={15} /> 30-Day Activity Heatmap
              </span>
              <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white mt-1">
                Daily Study Consistency
              </h3>
            </div>

            {/* 30 Day Heatmap Grid */}
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {Array.from({ length: 30 }).map((_, i) => {
                const active = i < 24;
                const high = i % 3 === 0;
                return (
                  <div
                    key={i}
                    title={`Day ${i + 1}: ${active ? "Active session" : "Rest"}`}
                    className={`h-6 sm:h-7 rounded-lg transition-all ${
                      !active 
                        ? "bg-stone-100 dark:bg-stone-800" 
                        : high 
                        ? "bg-[#FF7A30]" 
                        : "bg-[#FF7A30]/60"
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span>Less</span>
              <div className="flex gap-1">
                <span className="w-3 h-3 rounded bg-stone-200 dark:bg-stone-800" />
                <span className="w-3 h-3 rounded bg-[#FF7A30]/50" />
                <span className="w-3 h-3 rounded bg-[#FF7A30]" />
              </div>
              <span>More</span>
            </div>
          </div>
        </section>
      )}

      {/* ================= 9. ADMIN COMMAND DECK (STRICTLY ADMIN ONLY) ================= */}
      {isAdmin && (
        <motion.section 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-800 shadow-xl space-y-3.5 transition-colors duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF7A30]/20 text-[#FF7A30] flex items-center justify-center border border-[#FF7A30]/30 shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#FF7A30]">
                    Admin Command Hub v4.0
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Full Authority
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5 flex-wrap">
                  <span>PDF Broadcasts</span>
                  <span aria-hidden="true">·</span>
                  <span>Students ({onlineStudents.length})</span>
                  <span aria-hidden="true">·</span>
                  <span>Question Bank</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAction("show_admin")}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#FF7A30] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer transition-all min-h-[44px]"
            >
              <Bot size={15} />
              <span>Open Admin Deck</span>
            </button>
          </div>

          {/* 4 Operations Quick Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onAction("show_admin")}
              className="p-3 bg-stone-950/70 hover:bg-stone-950 border border-stone-800 rounded-2xl text-left transition-all cursor-pointer group min-h-[56px]"
            >
              <div className="flex items-center justify-between text-stone-400 group-hover:text-[#FF7A30] mb-0.5">
                <span className="text-[10px] font-mono uppercase font-bold">Notices</span>
                <Megaphone size={13} />
              </div>
              <p className="text-xs font-bold text-white">Broadcast PDF</p>
            </button>

            <button
              type="button"
              onClick={() => onAction("show_admin")}
              className="p-3 bg-stone-950/70 hover:bg-stone-950 border border-stone-800 rounded-2xl text-left transition-all cursor-pointer group min-h-[56px]"
            >
              <div className="flex items-center justify-between text-stone-400 group-hover:text-emerald-400 mb-0.5">
                <span className="text-[10px] font-mono uppercase font-bold">Students</span>
                <Users size={13} />
              </div>
              <p className="text-xs font-bold text-white">Manage Accounts</p>
            </button>

            <button
              type="button"
              onClick={() => onAction("show_admin")}
              className="p-3 bg-stone-950/70 hover:bg-stone-950 border border-stone-800 rounded-2xl text-left transition-all cursor-pointer group min-h-[56px]"
            >
              <div className="flex items-center justify-between text-stone-400 group-hover:text-amber-400 mb-0.5">
                <span className="text-[10px] font-mono uppercase font-bold">Questions</span>
                <BookOpen size={13} />
              </div>
              <p className="text-xs font-bold text-white">Question Bank</p>
            </button>

            <button
              type="button"
              onClick={() => onAction("show_admin")}
              className="p-3 bg-stone-950/70 hover:bg-stone-950 border border-stone-800 rounded-2xl text-left transition-all cursor-pointer group min-h-[56px]"
            >
              <div className="flex items-center justify-between text-stone-400 group-hover:text-[#FF7A30] mb-0.5">
                <span className="text-[10px] font-mono uppercase font-bold">AI Pilot</span>
                <Sparkles size={13} />
              </div>
              <p className="text-xs font-bold text-white">AI Co-Pilot</p>
            </button>
          </div>
        </motion.section>
      )}

      {/* ================= 10. FLOATING DYNAMIC BOTTOM QUICK-DOCK (ACCESSIBLE EVERYWHERE) ================= */}
      <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-max">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-full bg-stone-950/90 dark:bg-stone-900/90 backdrop-blur-2xl border border-stone-700/70 shadow-2xl text-white overflow-x-auto scrollbar-hide"
        >
          <button
            onClick={() => setHomeCategory("all")}
            className={`p-2.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              homeCategory === "all" ? "bg-[#FF7A30] text-white shadow-md" : "hover:bg-stone-800 text-stone-400 hover:text-white"
            }`}
            title="Overview"
          >
            <Zap size={15} />
            <span className="hidden sm:inline">Overview</span>
          </button>

          <button
            onClick={() => onAction("show_3d_lab")}
            className="p-2.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-stone-800 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer"
            title="3D Science Lab"
          >
            <Atom size={15} />
            <span className="hidden sm:inline">3D Lab</span>
          </button>

          <button
            onClick={() => onAction("show_speedblitz")}
            className="p-2.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-stone-800 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
            title="Speed Blitz MCQs"
          >
            <Flame size={15} />
            <span className="hidden sm:inline">Blitz</span>
          </button>

          <button
            onClick={() => onAction("show_formula_diary")}
            className="p-2.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-stone-800 text-teal-400 hover:text-teal-300 transition-all cursor-pointer"
            title="Formula & Diary"
          >
            <Bookmark size={15} />
            <span className="hidden sm:inline">Formula</span>
          </button>

          <button
            onClick={() => onAction("begin_sync")}
            className="p-2.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-stone-800 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
            title="Voice AI Mentor"
          >
            <Mic size={15} />
            <span className="hidden sm:inline">Voice</span>
          </button>

          <button
            onClick={() => onAction("show_notices")}
            className="p-2.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-stone-800 text-sky-400 hover:text-sky-300 transition-all cursor-pointer"
            title="Notice Board & PDFs"
          >
            <BookOpen size={15} />
            <span className="hidden sm:inline">Notices</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onAction("show_admin")}
              className="p-2.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-stone-800 text-red-400 hover:text-red-300 transition-all cursor-pointer"
              title="Admin Command Deck"
            >
              <ShieldAlert size={15} />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};
