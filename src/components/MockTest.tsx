import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, Target, History, ChevronRight, ChevronLeft, CheckCircle2, XCircle, Clock, Trophy, 
  AlertCircle, Layout, Globe, BookOpen, Filter, X, Zap, ArrowRight, RotateCcw, 
  Sparkles, Award, Play, Check, Flame, Shield, HelpCircle, Layers, BarChart2,
  Plus, Trash2, CheckCircle, Upload, FileQuestion, BookOpenCheck
} from "lucide-react";
import { MCQQuestion, QuizDifficulty, MockTestConfig } from "../types";
import { generateMockTestQuestions } from "../services/geminiService";
import { 
  DefaultMockTest, 
  getAllAvailableMockTests, 
  saveAdminCustomMockTest, 
  deleteAdminCustomMockTest 
} from "../data/defaultMockTests";
import "katex/dist/katex.min.css";
import { MathText } from "./MathText";
import { nativeService } from "../services/nativeService";
import { soundEffects } from "../services/soundEffectsService";
import { Class12Leaderboard } from "./Class12Leaderboard";
import { MistakeAnalyzer } from "./MistakeAnalyzer";
import { DescriptiveMockTest } from "./DescriptiveMockTest";
import { DescriptiveAdminReviewModal } from "./DescriptiveAdminReviewModal";
import { db, auth, collection, addDoc, doc, setDoc, getDoc, updateDoc } from "../firebase";

interface MockTestProps {
  onClose: () => void;
  character: string;
  onPointsAwarded?: (points: number) => void;
  onCompleted?: (subject: string, score: number) => void;
  apiKey?: string;
  userName?: string;
  userId?: string;
}

const PRESET_TOPICS: Record<string, { name: string; bnName: string; tags: string[] }[]> = {
  "Biology": [
    { name: "Sexual Reproduction in Flowering Plants", bnName: "সসপুষ্পক উদ্ভিদের যৌন জনন", tags: ["Microsporogenesis", "Megasporogenesis", "Geitonogamy"] },
    { name: "Human Reproduction", bnName: "মানুষের জনন", tags: ["Gametogenesis", "Menstrual Cycle", "Fertilization & ZP3"] },
    { name: "Reproductive Health", bnName: "জননগত স্বাস্থ্য", tags: ["STDs", "Syphilis & Treponema", "Contraception"] },
    { name: "Genetics and Evolution", bnName: "বংশগতি ও বিবর্তন", tags: ["Mendel's Laws", "Linkage", "DNA Structure", "Oparin-Haldane"] }
  ],
  "Bengali": [
    { name: "আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)", bnName: "আদিরিনী গল্প", tags: ["জয়রাম মুখোপাধ্যায়", "হস্তিনী আদিরিনী", "উপন্যাস/গল্প"] },
    { name: "বাঙ্গালা ভাষা (স্বামী বিবেকানন্দ)", bnName: "বাঙ্গালা ভাষা প্রবন্ধ", tags: ["জনসাধারণের ভাষা", "শিক্ষা ও ভাষা"] },
    { name: "ধর্ম (শ্রীজাত)", bnName: "ধর্ম কবিতা", tags: ["মানুষের ধর্ম", "মানবতা"] },
    { name: "ধ্বনিতত্ত্ব ও ভাষাবিজ্ঞান", bnName: "ভাষাবিজ্ঞান", tags: ["ধ্বনিতত্ত্ব", "শব্দার্থতত্ত্ব", "বাক্যতত্ত্ব"] }
  ],
  "English": [
    { name: "The Night Train at Deoli (Ruskin Bond)", bnName: "The Night Train at Deoli", tags: ["Deoli Station", "The Basket Girl", "Longing"] },
    { name: "Strong Roots (APJ Abdul Kalam)", bnName: "Strong Roots", tags: ["Rameswaram", "Jainulabdeen", "Spiritual Roots"] },
    { name: "The Bet (Anton Chekhov)", bnName: "The Bet", tags: ["2 Million Rubles", "15 Years", "Banker & Lawyer"] },
    { name: "Ulysses (Alfred Lord Tennyson)", bnName: "Ulysses", tags: ["To strive to seek", "Ithaca", "Heroic Verse"] },
    { name: "Our Casuarina Tree (Toru Dutt)", bnName: "Our Casuarina Tree", tags: ["Nostalgia", "Immortality of Nature"] }
  ],
  "Math": [
    { name: "Relations and Functions", bnName: "সম্পর্ক ও চিত্রণ", tags: ["Equivalence Relation", "Bijective"] },
    { name: "Matrices and Determinants", bnName: "ম্যাট্রিক্স ও নির্ণায়ক", tags: ["Cramer's Rule", "Inverse"] },
    { name: "Differential Calculus", bnName: "অবকলন", tags: ["Derivatives", "Continuity"] },
    { name: "Integral Calculus", bnName: "সমাকলন", tags: ["Definite Integral", "Area"] }
  ],
  "Physics": [
    { name: "Electrostatics & Capacitors", bnName: "স্থির তড়িৎ", tags: ["Coulomb's Law", "Gauss Theorem"] },
    { name: "Current Electricity", bnName: "প্রবাহী তড়িৎ", tags: ["Kirchhoff's Laws", "Potentiometer"] },
    { name: "Magnetism & EMI", bnName: "তড়িৎ চুম্বকত্ব", tags: ["Biot-Savart", "Faraday's Law"] }
  ],
  "Chemistry": [
    { name: "Solid State & Solutions", bnName: "কঠিন অবস্থা ও দ্রবণ", tags: ["Unit Cells", "Raoult's Law"] },
    { name: "Electrochemistry & Kinetics", bnName: "তড়িৎ রসায়ন", tags: ["Nernst Equation", "Rate Constant"] },
    { name: "Organic Chemistry", bnName: "জৈব রসায়ন", tags: ["Haloalkanes", "Aldehydes & Ketones"] }
  ],
  "Computer App": [
    { name: "Logic Gates & Combinational Circuits", bnName: "লজিক গেট", tags: ["Multiplexer", "Decoder", "Adder"] },
    { name: "Networking & HTML", bnName: "নেটওয়ার্কিং ও এইচটিএমএল", tags: ["TCP/IP", "Topology", "Forms"] },
    { name: "Database Management (DBMS)", bnName: "ডিবিএমএস", tags: ["SQL", "Relational Model", "Keys"] }
  ]
};

export const MockTest: React.FC<MockTestProps> = ({ 
  onClose, 
  character, 
  onPointsAwarded, 
  onCompleted, 
  apiKey, 
  userName = "শিক্ষার্থী (Student)", 
  userId 
}) => {
  // Primary Exam Type: "mcq" (Objective) or "descriptive" (Subjective Long Answer)
  const [examFormatType, setExamFormatType] = useState<"mcq" | "descriptive">("mcq");
  const [showAdminDeskModal, setShowAdminDeskModal] = useState(false);

  const [step, setStep] = useState<"config" | "loading" | "quiz" | "result">("config");
  const [config, setConfig] = useState<MockTestConfig>({
    topic: "Unit I: Reproduction (Sexual Reproduction in Flowering Plants)",
    subject: "Biology",
    difficulty: "medium",
    scope: "topic",
    isPYQ: false,
    yearRange: [2019, 2024]
  });

  const [questionCount, setQuestionCount] = useState<number>(40);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(40);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [testMode, setTestMode] = useState<"exam" | "practice">("exam");
  const [langMode, setLangMode] = useState<"bilingual" | "english" | "bengali">("bilingual");
  
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [flaggedIndexes, setFlaggedIndexes] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMistakeAnalyzer, setShowMistakeAnalyzer] = useState(false);

  // New Tab Switcher: "official" | "ai" | "admin"
  const [activeModeTab, setActiveModeTab] = useState<"official" | "ai" | "admin">("official");
  const [officialTestsList, setOfficialTestsList] = useState<DefaultMockTest[]>(getAllAvailableMockTests());

  // Admin Custom Test Builder State
  const [adminTitle, setAdminTitle] = useState("");
  const [adminSubject, setAdminSubject] = useState("Biology");
  const [adminTopic, setAdminTopic] = useState("");
  const [adminDuration, setAdminDuration] = useState(20);
  const [adminDraftQuestions, setAdminDraftQuestions] = useState<MCQQuestion[]>([]);
  
  // Single question draft
  const [draftQEn, setDraftQEn] = useState("");
  const [draftQBn, setDraftQBn] = useState("");
  const [draftOptA, setDraftOptA] = useState("");
  const [draftOptB, setDraftOptB] = useState("");
  const [draftOptC, setDraftOptC] = useState("");
  const [draftOptD, setDraftOptD] = useState("");
  const [draftCorrect, setDraftCorrect] = useState(0);
  const [draftExpl, setDraftExpl] = useState("");

  const refreshOfficialTests = () => {
    setOfficialTestsList(getAllAvailableMockTests());
  };

  const startPredefinedTest = (test: DefaultMockTest) => {
    if (!test.questions || test.questions.length === 0) {
      alert("This test paper has no questions yet.");
      return;
    }
    setQuestions(test.questions);
    setQuestionCount(test.questions.length);
    setCurrentIndex(0);
    setUserAnswers(new Array(test.questions.length).fill(-1));
    setFlaggedIndexes([]);
    setScore(0);
    setShowExplanation(false);
    setReviewMode(false);
    setShowPalette(false);
    setShowSubmitModal(false);
    setTimeLimitMinutes(test.durationMinutes);
    if (test.durationMinutes > 0) {
      setTimeLeftSeconds(test.durationMinutes * 60);
    } else {
      setTimeLeftSeconds(0);
    }
    setConfig({
      topic: test.title,
      subject: test.subject,
      difficulty: "medium",
      scope: "unit",
      isPYQ: test.isOfficial
    });
    setStep("quiz");
    nativeService.triggerHaptic('success');
  };

  const handleAddDraftQuestion = () => {
    if (!draftQEn.trim() && !draftQBn.trim()) {
      alert("Please enter question statement in English or Bengali.");
      return;
    }
    if (!draftOptA.trim() || !draftOptB.trim()) {
      alert("Please provide at least Option A and Option B.");
      return;
    }

    const optsEn = [draftOptA, draftOptB, draftOptC || "None", draftOptD || "None"];
    const newQ: MCQQuestion = {
      id: `custom-q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      questionEn: draftQEn.trim() || draftQBn.trim(),
      questionBn: draftQBn.trim() || draftQEn.trim(),
      optionsEn: optsEn,
      optionsBn: optsEn,
      correctIndex: draftCorrect,
      explanationEn: draftExpl.trim() || "Official answer verified by council.",
      explanationBn: draftExpl.trim() || "কাউন্সিল দ্বারা যাচাইকৃত সঠিক উত্তর।",
      difficulty: "medium"
    };

    setAdminDraftQuestions(prev => [...prev, newQ]);
    // Reset draft question form
    setDraftQEn("");
    setDraftQBn("");
    setDraftOptA("");
    setDraftOptB("");
    setDraftOptC("");
    setDraftOptD("");
    setDraftCorrect(0);
    setDraftExpl("");
    nativeService.triggerHaptic('success');
  };

  const handlePublishAdminTest = () => {
    if (!adminTitle.trim()) {
      alert("Please provide a title for this test paper.");
      return;
    }
    if (adminDraftQuestions.length === 0) {
      alert("Please add at least 1 question before publishing.");
      return;
    }

    const newTestPaper: DefaultMockTest = {
      id: `admin-mock-${Date.now()}`,
      title: adminTitle.trim(),
      subject: adminSubject,
      topic: adminTopic.trim() || `${adminSubject} Semester 3`,
      durationMinutes: adminDuration,
      description: `Uploaded by Admin/Teacher on ${new Date().toLocaleDateString()}. WBCHSE Sem 3 standard.`,
      isOfficial: false,
      isAdminUploaded: true,
      uploadedAt: new Date().toISOString(),
      questions: adminDraftQuestions
    };

    saveAdminCustomMockTest(newTestPaper);
    refreshOfficialTests();
    // Reset form
    setAdminTitle("");
    setAdminTopic("");
    setAdminDraftQuestions([]);
    setActiveModeTab("official");
    nativeService.showToast("Test published to Default Mock Tests!");
    alert("🎉 আপনার টেস্ট পেপার সফলভাবে পাবলিশ হয়েছে! এটি এখন Default Mock Tests তালিকায় যুক্ত হয়েছে।");
  };

  const handleDeleteAdminTest = (id: string) => {
    if (window.confirm("Are you sure you want to delete this test paper?")) {
      deleteAdminCustomMockTest(id);
      refreshOfficialTests();
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load test history from localStorage
  useEffect(() => {
    const testHistoryKey = userId ? `mock_test_history_${userId}` : "mock_test_history";
    const saved = localStorage.getItem(testHistoryKey);
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [userId]);

  // Scroll to top on index/step change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex, step]);

  // Timer effect during quiz
  useEffect(() => {
    if (step === "quiz" && timeLimitMinutes > 0) {
      if (timeLeftSeconds > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeftSeconds(prev => prev - 1);
        }, 1000);
      } else if (timeLeftSeconds === 0 && questions.length > 0) {
        // Auto finish quiz on timeout
        finishQuiz();
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, timeLeftSeconds]);

  const startQuiz = async () => {
    if (!config.topic && config.scope !== "syllabus") return;
    setStep("loading");
    try {
      const generatedQuestions = await generateMockTestQuestions(
        {
          ...config,
          topic: config.topic || `${config.subject} WBCHSE Class 12 Syllabus`
        }, 
        apiKey || (typeof window !== "undefined" ? (localStorage.getItem("gemini_api_key") || localStorage.getItem("custom_gemini_api_key") || localStorage.getItem("ss-gemini-key") || "") : "")
      );

      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("No questions could be generated for this topic.");
      }

      const slicedQuestions = generatedQuestions.slice(0, questionCount);
      setQuestions(slicedQuestions);
      setCurrentIndex(0);
      setUserAnswers(new Array(slicedQuestions.length).fill(-1));
      setFlaggedIndexes([]);
      setScore(0);
      setShowExplanation(false);
      setReviewMode(false);
      setShowPalette(false);
      setShowSubmitModal(false);
      
      if (timeLimitMinutes > 0) {
        setTimeLeftSeconds(timeLimitMinutes * 60);
      } else {
        setTimeLeftSeconds(0);
      }

      setStep("quiz");
      nativeService.triggerHaptic('success');
    } catch (error: any) {
      console.error("Failed to generate questions:", error);
      alert(`Dukkhoito ${userName}, ${error.message || "Test question generate korte problem holo"}. Re-trying...`);
      setStep("config");
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    
    if (testMode === "practice") {
      if (showExplanation) return;
      newAnswers[currentIndex] = optionIndex;
      setUserAnswers(newAnswers);
      setShowExplanation(true);

      if (optionIndex === questions[currentIndex].correctIndex) {
        setScore(s => s + 1);
        soundEffects.playSuccess();
        nativeService.triggerHaptic('success');
      } else {
        soundEffects.playClick();
        nativeService.triggerHaptic('failure');
        nativeService.showToast("Saved to Mistake Bank!");
        saveToMistakeBank(questions[currentIndex]);
      }
    } else {
      // Real Exam Mode: Allow changing selected option until submit
      newAnswers[currentIndex] = optionIndex;
      setUserAnswers(newAnswers);
      soundEffects.playClick();
      nativeService.triggerHaptic('success');
    }
  };

  const toggleFlagQuestion = (index: number) => {
    setFlaggedIndexes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
    nativeService.triggerHaptic('success');
  };

  const saveToMistakeBank = (q: MCQQuestion) => {
    const mistakeBankKey = userId ? `mistake_bank_${userId}` : "mistake_bank";
    const currentMistakes = JSON.parse(localStorage.getItem(mistakeBankKey) || "[]");
    const alreadySaved = currentMistakes.find((m: any) => m.id === q.id);
    if (!alreadySaved) {
      const newMistake = {
        ...q,
        subject: config.subject,
        question: q.questionEn,
        options: q.optionsEn,
        correctAnswer: q.correctIndex,
        explanation: q.explanationEn
      };
      localStorage.setItem(mistakeBankKey, JSON.stringify([...currentMistakes, newMistake]));
    }
  };

  const finishQuiz = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Calculate final score
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        calculatedScore += 1;
      } else if (userAnswers[idx] !== -1) {
        saveToMistakeBank(q);
      }
    });
    
    setScore(calculatedScore);
    const totalQuestions = questions.length;
    const scorePercentage = Math.round((calculatedScore / totalQuestions) * 100);
    
    // Save test result to history
    const testHistoryKey = userId ? `mock_test_history_${userId}` : "mock_test_history";
    const testHistory = JSON.parse(localStorage.getItem(testHistoryKey) || "[]");
    const newResult = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      subject: config.subject,
      topic: config.topic || "Full Syllabus",
      score: calculatedScore,
      total: totalQuestions,
      percentage: scorePercentage,
      date: new Date().toISOString(),
      difficulty: config.difficulty,
      mode: testMode
    };
    
    const updatedHistory = [newResult, ...testHistory].slice(0, 50);
    localStorage.setItem(testHistoryKey, JSON.stringify(updatedHistory));
    setHistoryList(updatedHistory);

    setShowSubmitModal(false);
    setStep("result");
    soundEffects.playSuccess();
    nativeService.triggerHaptic('celebrate');
    nativeService.showToast(`Exam complete! Score: ${calculatedScore}/${totalQuestions}`);
    if (onPointsAwarded) {
      onPointsAwarded(calculatedScore * 15); // 15 PTS per correct answer
    }
    if (onCompleted) {
      onCompleted(config.subject, calculatedScore);
    }

    // Award Student XP and update daily streak
    try {
      const earnedXp = calculatedScore * 15 + 25;
      const currentXp = parseInt(localStorage.getItem("ss_student_xp") || "480", 10);
      localStorage.setItem("ss_student_xp", (currentXp + earnedXp).toString());
      
      const lastActive = localStorage.getItem("ss_last_active_date");
      const today = new Date().toDateString();
      if (lastActive !== today) {
        const currStreak = parseInt(localStorage.getItem("ss_study_streak") || "0", 10);
        localStorage.setItem("ss_study_streak", (currStreak + 1).toString());
        localStorage.setItem("ss_last_active_date", today);
      }
    } catch (e) {
      console.warn("Streak/XP update:", e);
    }

    // Real-time Firestore sync (no fake default data)
    (async () => {
      try {
        const studentName = auth.currentUser?.displayName || userName || "Abhijit";
        const studentUid = auth.currentUser?.uid || userId || "student-guest";
        const district = localStorage.getItem("userDistrict") || "West Bengal";

        await addDoc(collection(db, "mock_test_results"), {
          userId: studentUid,
          displayName: studentName,
          district: district,
          subject: config.subject,
          topic: config.topic || "Full Syllabus",
          score: calculatedScore,
          total: totalQuestions,
          accuracy: scorePercentage,
          points: calculatedScore * 15,
          timestamp: new Date().toISOString(),
          board: "WBCHSE"
        });

        if (auth.currentUser?.uid) {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const curPts = userSnap.data().points || 0;
            await updateDoc(userRef, {
              points: curPts + (calculatedScore * 15),
              lastActive: new Date().toISOString(),
              questionsSolved: (userSnap.data().questionsSolved || 0) + totalQuestions
            });
          } else {
            await setDoc(userRef, {
              uid: auth.currentUser.uid,
              username: studentName,
              displayName: studentName,
              points: calculatedScore * 15,
              questionsSolved: totalQuestions,
              lastActive: new Date().toISOString()
            }, { merge: true });
          }
        }
      } catch (err) {
        console.warn("Real-time Firestore sync note:", err);
      }
    })();
  };

  const handlePrintScorecard = () => {
    window.print();
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(userAnswers[currentIndex + 1] !== -1);
    } else {
      finishQuiz();
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#090d16]/95 backdrop-blur-2xl flex items-center justify-center p-0 md:p-6 overflow-hidden text-slate-800 dark:text-slate-100 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-full md:max-w-6xl md:h-[92vh] bg-white dark:bg-[#0d1322] md:rounded-[40px] border border-slate-200 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col relative"
      >
        {/* Dynamic Glow Accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Top Header */}
        <header className="px-5 py-4 md:px-8 md:py-5 bg-slate-50/90 dark:bg-[#080c16]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between relative z-20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Trophy size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                  Mock Test <span className="text-indigo-600 dark:text-indigo-400">Dashboard</span>
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  WBCHSE Sem 3
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                Student Portal • {userName || "শিক্ষার্থী"} (Class 12)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {step === "quiz" && timeLimitMinutes > 0 && (
              <div className={`px-4 py-2 rounded-2xl border font-mono font-black text-xs md:text-sm flex items-center gap-2 shadow-sm transition-colors ${
                timeLeftSeconds < 60 
                  ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-400 animate-pulse" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400"
              }`}>
                <Clock size={16} />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            )}

            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-300 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all active:scale-95 border border-slate-200 dark:border-slate-700/50"
              title="Close Mock Test"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Primary Exam Format Selector: MCQ vs Long Answer vs Admin Evaluation Desk */}
        <div className="px-5 py-3 md:px-8 bg-white dark:bg-stone-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setExamFormatType("mcq");
                setStep("config");
              }}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                examFormatType === "mcq"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Target size={15} />
              <span>MCQ মক টেস্ট (Objective)</span>
            </button>

            <button
              onClick={() => setExamFormatType("descriptive")}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                examFormatType === "descriptive"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <span>✍️</span>
              <span>লং আনসার টাইপ মক টেস্ট (Descriptive)</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">
                নতুন
              </span>
            </button>
          </div>

          <button
            onClick={() => setShowAdminDeskModal(true)}
            className="px-3.5 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Shield size={14} className="text-amber-500" />
            <span>অ্যাডমিন খাতা মূল্যায়ন ডেক্স</span>
          </button>
        </div>

        {/* Content Body */}
        <div ref={containerRef} className="flex-1 overflow-y-auto relative z-10 touch-pan-y overscroll-contain">
          {examFormatType === "descriptive" ? (
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
              <DescriptiveMockTest
                userName={userName}
                userId={userId}
                isAdmin={true}
                onClose={onClose}
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">

            {/* STEP 1: CONFIGURATION & LAUNCHER */}
            {step === "config" && (
              <motion.div 
                key="config"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-4 md:p-8 max-w-5xl mx-auto space-y-8"
              >
                {/* Tab Navigation: Official Exams vs AI Generator vs Admin Uploader */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setActiveModeTab("official")}
                    className={`flex-1 py-3 px-3 md:px-4 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                      activeModeTab === "official"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200 dark:border-slate-700"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <BookOpenCheck size={16} />
                    <span>Official Board Mock Tests (বোর্ড প্রশ্নপত্র)</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                      {officialTestsList.length} Sets
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveModeTab("ai")}
                    className={`flex-1 py-3 px-3 md:px-4 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                      activeModeTab === "ai"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200 dark:border-slate-700"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Sparkles size={16} />
                    <span>AI Mock Test Generator (কাস্টম পরীক্ষা)</span>
                  </button>

                  <button
                    onClick={() => setActiveModeTab("admin")}
                    className={`py-3 px-3 md:px-4 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                      activeModeTab === "admin"
                        ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-md border border-slate-200 dark:border-slate-700"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Plus size={16} />
                    <span>Admin Upload (নতুন পেপার)</span>
                  </button>
                </div>

                {/* VIEW 1: OFFICIAL & DEFAULT MOCK TESTS */}
                {activeModeTab === "official" && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <BookOpen size={18} className="text-indigo-600" /> WBCHSE Class 12 Sem 3 Verified Question Papers
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Curated by council mentors & teachers. Direct simulation with official time limits and complete answer keys.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveModeTab("admin")}
                        className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-md shadow-indigo-600/20 active:scale-95"
                      >
                        <Plus size={14} />
                        <span>Upload New Question Paper</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {officialTestsList.map((test) => (
                        <div
                          key={test.id}
                          className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                test.subject === "Biology" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                                test.subject === "Bengali" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" :
                                test.subject === "English" ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300" :
                                "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                              }`}>
                                {test.subject}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {test.isAdminUploaded ? (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                    Admin Upload
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                                    <CheckCircle size={10} /> Verified Board Paper
                                  </span>
                                )}

                                {test.isAdminUploaded && (
                                  <button
                                    onClick={() => handleDeleteAdminTest(test.id)}
                                    title="Delete this uploaded test"
                                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>

                            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                              {test.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {test.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <FileQuestion size={13} className="text-indigo-500" />
                                {test.questions.length} Questions
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={13} className="text-indigo-500" />
                                {test.durationMinutes} Mins
                              </span>
                            </div>

                            <button
                              onClick={() => startPredefinedTest(test)}
                              className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                            >
                              <Play size={12} className="fill-white" />
                              <span>Start Exam</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW 2: ADMIN TEST BUILDER & UPLOADER */}
                {activeModeTab === "admin" && (
                  <div className="p-6 md:p-8 rounded-[2rem] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-6">
                    <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Upload size={18} className="text-amber-500" /> Admin Question Paper Creator
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Create default mock tests for all students. Add questions with Bengali & English statements, options, and explanations.
                        </p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {adminDraftQuestions.length} Questions Drafted
                      </span>
                    </div>

                    {/* Paper Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Paper Title *
                        </label>
                        <input
                          value={adminTitle}
                          onChange={(e) => setAdminTitle(e.target.value)}
                          placeholder="e.g. Biology Unit 2 Genetics Final Mock"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Subject *
                        </label>
                        <select
                          value={adminSubject}
                          onChange={(e) => setAdminSubject(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        >
                          {["Biology", "Bengali", "English", "Math", "Physics", "Chemistry"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          min={5}
                          max={180}
                          value={adminDuration}
                          onChange={(e) => setAdminDuration(parseInt(e.target.value) || 20)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Question Builder Box */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        + Add Question #{adminDraftQuestions.length + 1}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                            Question (English)
                          </label>
                          <textarea
                            rows={2}
                            value={draftQEn}
                            onChange={(e) => setDraftQEn(e.target.value)}
                            placeholder="e.g. Which hormone triggers ovulation on day 14?"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                            Question (Bengali)
                          </label>
                          <textarea
                            rows={2}
                            value={draftQBn}
                            onChange={(e) => setDraftQBn(e.target.value)}
                            placeholder="e.g. ১৪তম দিনে ডিম্বাণু নির্গমন কোন হরমোন দ্বারা নিয়ন্ত্রিত হয়?"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Option A</label>
                          <input
                            value={draftOptA}
                            onChange={(e) => setDraftOptA(e.target.value)}
                            placeholder="Option A"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Option B</label>
                          <input
                            value={draftOptB}
                            onChange={(e) => setDraftOptB(e.target.value)}
                            placeholder="Option B"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Option C</label>
                          <input
                            value={draftOptC}
                            onChange={(e) => setDraftOptC(e.target.value)}
                            placeholder="Option C"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Option D</label>
                          <input
                            value={draftOptD}
                            onChange={(e) => setDraftOptD(e.target.value)}
                            placeholder="Option D"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>
                      </div>

                      {/* Correct answer & explanation */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Correct Answer *</label>
                          <select
                            value={draftCorrect}
                            onChange={(e) => setDraftCorrect(parseInt(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-indigo-600"
                          >
                            <option value={0}>Option A</option>
                            <option value={1}>Option B</option>
                            <option value={2}>Option C</option>
                            <option value={3}>Option D</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Explanation (ব্যাখ্যা)</label>
                          <input
                            value={draftExpl}
                            onChange={(e) => setDraftExpl(e.target.value)}
                            placeholder="Explain why this option is correct..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddDraftQuestion}
                        className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 active:scale-95 shadow-md shadow-indigo-600/20"
                      >
                        <Plus size={14} />
                        <span>Add Question to Test Paper</span>
                      </button>
                    </div>

                    {/* Draft Questions List */}
                    {adminDraftQuestions.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                          Draft Questions ({adminDraftQuestions.length})
                        </label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {adminDraftQuestions.map((q, idx) => (
                            <div key={q.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                              <div className="flex-1 pr-3">
                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                  {idx + 1}. {q.questionBn || q.questionEn}
                                </p>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  Correct: Option {String.fromCharCode(65 + q.correctIndex)}
                                </span>
                              </div>
                              <button
                                onClick={() => setAdminDraftQuestions(prev => prev.filter((_, i) => i !== idx))}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Publish Action */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveModeTab("official")}
                        className="py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handlePublishAdminTest}
                        disabled={!adminTitle.trim() || adminDraftQuestions.length === 0}
                        className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <CheckCircle size={15} />
                        <span>Publish Test Paper (পাবলিশ করুন)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* VIEW 3: AI DYNAMIC GENERATOR (Shown when activeModeTab === "ai") */}
                {activeModeTab === "ai" && (
                <>
                {/* Hero Banner */}
                <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-indigo-100">
                      <Sparkles size={12} /> Class 12 WBCHSE AI Mock Test Generator
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight italic">
                      Prepare with Precision. Master Your WBCHSE Sem 3 Exams.
                    </h1>
                    <p className="text-xs md:text-sm font-medium text-indigo-100/90 max-w-2xl">
                      Select your subject and topic below to generate instant bilingual MCQs with step-by-step Bengali & English explanations!
                    </p>
                  </div>
                </div>

                {/* Configuration Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column (Subject & Topic Selection) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Subject Selector Pills */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>01. Select Subject</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{config.subject} Selected</span>
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Biology", "Bengali", "English", "Math", "Physics", "Chemistry", "Computer App"].map(s => {
                          const isSelected = config.subject === s;
                          return (
                            <button
                              key={s}
                              onClick={() => {
                                const defaultTopic = PRESET_TOPICS[s]?.[0]?.name || "";
                                setConfig({ ...config, subject: s, topic: defaultTopic });
                              }}
                              className={`p-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center text-center ${
                                isSelected 
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]" 
                                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Preset Topics */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>02. WBCHSE Sem 3 Topic Shortcuts</span>
                        <span className="text-[10px] text-slate-400 font-bold">One-Tap Load</span>
                      </label>

                      <div className="grid grid-cols-1 gap-2.5">
                        {(PRESET_TOPICS[config.subject] || []).map((t, idx) => {
                          const isSelected = config.topic === t.name;
                          return (
                            <div
                              key={`topic-opt-${t.name}-${idx}`}
                              onClick={() => setConfig({ ...config, topic: t.name })}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                isSelected 
                                  ? "bg-indigo-50/80 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800 shadow-sm" 
                                  : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                              }`}
                            >
                              <div className="space-y-1">
                                <h4 className={`text-xs font-extrabold ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"}`}>
                                  {t.name}
                                </h4>
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic">
                                  {t.bnName}
                                </p>
                              </div>

                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-700"
                              }`}>
                                {isSelected && <Check size={12} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Topic Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Or Type Custom Topic / Chapter Name:
                      </label>
                      <input 
                        type="text"
                        value={config.topic}
                        onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                        placeholder="e.g. Microsporogenesis or Oparin-Haldane Theory"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Right Column (Exam Parameters & History) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="p-5 md:p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-5">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Target size={18} className="text-indigo-600 dark:text-indigo-400" /> Exam Parameters
                      </h3>

                      {/* Test Mode */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Mode & Environment</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setTestMode("exam")}
                            className={`py-2 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
                              testMode === "exam" 
                                ? "bg-amber-500 text-slate-950 font-black shadow-md" 
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <Shield size={14} /> Full Exam Mode
                          </button>
                          <button
                            type="button"
                            onClick={() => setTestMode("practice")}
                            className={`py-2 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
                              testMode === "practice" 
                                ? "bg-indigo-600 text-white font-black shadow-md" 
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <Zap size={14} /> Practice Mode
                          </button>
                        </div>
                      </div>

                      {/* Question Count */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Question Count / Marks</label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[5, 10, 15, 20, 40].map(cnt => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => {
                                setQuestionCount(cnt);
                                if (cnt === 40) setTimeLimitMinutes(40);
                              }}
                              className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                                questionCount === cnt 
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md ring-2 ring-indigo-500" 
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {cnt === 40 ? "40 (Full)" : `${cnt} Qs`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time Limit */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Time Limit</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { m: 0, label: "Untimed" },
                            { m: 10, label: "10 Mins" },
                            { m: 20, label: "20 Mins" },
                            { m: 40, label: "40 Mins" }
                          ].map(t => (
                            <button
                              key={t.m}
                              type="button"
                              onClick={() => setTimeLimitMinutes(t.m)}
                              className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                timeLimitMinutes === t.m 
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" 
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty Selector */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Difficulty Standard</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "easy", label: "Board Standard" },
                            { id: "medium", label: "WBCHSE Sem 3" },
                            { id: "hard", label: "Advanced Level" }
                          ].map(d => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => setConfig({ ...config, difficulty: d.id as QuizDifficulty })}
                              className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                config.difficulty === d.id 
                                  ? "bg-indigo-600 text-white shadow-md" 
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Launch Button */}
                      <button
                        type="button"
                        onClick={startQuiz}
                        disabled={!config.topic && config.scope !== "syllabus"}
                        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                      >
                        <Play size={16} className="fill-white" />
                        <span>START MOCK TEST NOW</span>
                      </button>
                    </div>

                    {/* Past Test History */}
                    {historyList.length > 0 && (
                      <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <History size={16} className="text-amber-500" /> Recent Attempt History
                        </h4>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {historyList.slice(0, 4).map((h, i) => (
                            <div key={`test-hist-${h.id || i}-${i}`} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-slate-200">{h.subject} - {h.topic}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{new Date(h.date).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-indigo-600 dark:text-indigo-400">{h.score}/{h.total}</span>
                                <span className="text-[10px] text-emerald-500 font-bold block">{h.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                </>
                )}
              </motion.div>
            )}

            {/* STEP 2: LOADING STATE */}
            {step === "loading" && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[500px]"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-indigo-200 dark:border-indigo-950 border-t-indigo-600 animate-spin" />
                  <Brain size={36} className="absolute inset-0 m-auto text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>

                <div className="space-y-3 max-w-md">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Generating Questions...
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Synthesizing WBCHSE Class 12 exam questions for <span className="font-bold text-indigo-600 dark:text-indigo-400">{config.subject}</span> ({config.topic}).
                  </p>
                  <div className="inline-block px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold mt-4">
                    💡 Tip: Read the Bengali translations carefully for maximum conceptual clarity!
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ACTIVE QUIZ */}
            {step === "quiz" && questions.length > 0 && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 md:p-8 max-w-4xl mx-auto space-y-6"
              >
                {/* Question Progress & Timer Header */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                      {currentIndex + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {currentIndex + 1} / {questions.length}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                        {testMode === "exam" ? "Full Exam Mode" : "Practice Mode"}
                      </span>
                    </div>
                  </div>

                  {/* Timer & Controls */}
                  <div className="flex items-center gap-2">
                    {timeLimitMinutes > 0 && (
                      <div className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 border ${
                        timeLeftSeconds < 180 
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                      }`}>
                        <Clock size={14} />
                        <span>
                          {Math.floor(timeLeftSeconds / 60).toString().padStart(2, '0')}:
                          {(timeLeftSeconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleFlagQuestion(currentIndex)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                        flaggedIndexes.includes(currentIndex)
                          ? "bg-amber-500 text-slate-950 font-black border-amber-500"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-amber-500"
                      }`}
                    >
                      <Flame size={14} />
                      <span>{flaggedIndexes.includes(currentIndex) ? "Flagged" : "Flag"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPalette(!showPalette)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
                    >
                      <Layout size={14} />
                      <span>Q Palette ({userAnswers.filter(a => a !== -1).length}/{questions.length})</span>
                    </button>
                  </div>
                </div>

                {/* Question Palette Drawer Grid */}
                <AnimatePresence>
                  {showPalette && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4 overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
                        <span>Question Palette (Q1 to Q{questions.length})</span>
                        <div className="flex gap-3 text-[10px]">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/> Answered</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/> Flagged</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"/> Pending</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
                        {questions.map((_, qIdx) => {
                          const isAnswered = userAnswers[qIdx] !== -1;
                          const isFlagged = flaggedIndexes.includes(qIdx);
                          const isActive = qIdx === currentIndex;

                          let bgStyle = "bg-slate-800 text-slate-400";
                          if (isAnswered) bgStyle = "bg-emerald-600 text-white font-black";
                          if (isFlagged) bgStyle = "bg-amber-500 text-slate-950 font-black";
                          if (isActive) bgStyle += " ring-2 ring-white scale-105";

                          return (
                            <button
                              key={qIdx}
                              onClick={() => {
                                setCurrentIndex(qIdx);
                                setShowExplanation(testMode === "practice" && userAnswers[qIdx] !== -1);
                              }}
                              className={`h-9 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer ${bgStyle}`}
                            >
                              {qIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                {/* Question Box */}
                <div className="p-6 md:p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-6">
                  
                  {/* English Question */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">English</span>
                    <MathText 
                      text={questions[currentIndex].questionEn} 
                      className="text-base md:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed block" 
                    />
                  </div>

                  {/* Bengali Translation */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                    <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest block">বাংলা অনুবাদ</span>
                    <MathText 
                      text={questions[currentIndex].questionBn} 
                      className="text-sm md:text-base font-bold text-indigo-900 dark:text-indigo-200 leading-relaxed italic block" 
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {questions[currentIndex].optionsEn.map((opt, idx) => {
                      const isSelected = userAnswers[currentIndex] === idx;
                      const isCorrect = questions[currentIndex].correctIndex === idx;

                      let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-300";

                      if (testMode === "practice" && showExplanation) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold shadow-sm";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-200 font-bold";
                        } else {
                          btnStyle = "opacity-40 border-slate-200 dark:border-slate-800";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-100 font-bold shadow-md ring-2 ring-indigo-500/30";
                      }

                      return (
                        <button
                          key={`q-${currentIndex}-opt-${idx}`}
                          type="button"
                          onClick={() => handleAnswerSelect(idx)}
                          disabled={testMode === "practice" && showExplanation}
                          className={`w-full p-4 md:p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${btnStyle}`}
                        >
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected 
                              ? "bg-indigo-600 text-white" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>

                          <div className="flex-1 space-y-1">
                            <MathText text={opt} className="text-xs md:text-sm font-bold block" />
                            {questions[currentIndex].optionsBn[idx] && (
                              <MathText text={questions[currentIndex].optionsBn[idx]} className="text-[11px] text-slate-500 dark:text-slate-400 italic block" />
                            )}
                          </div>

                          {testMode === "practice" && showExplanation && isCorrect && (
                            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                          )}
                          {testMode === "practice" && showExplanation && isSelected && !isCorrect && (
                            <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 gap-2">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => {
                        setCurrentIndex(c => Math.max(0, c - 1));
                        setShowExplanation(testMode === "practice" && userAnswers[currentIndex - 1] !== -1);
                      }}
                      className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>

                    {testMode === "exam" ? (
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(true)}
                        className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Shield size={15} /> Submit Exam
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={nextQuestion}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{currentIndex < questions.length - 1 ? "Next" : "Finish"}</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Explanation Section (Practice Mode Only) */}
                  <AnimatePresence>
                    {testMode === "practice" && showExplanation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-3"
                      >
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                          <AlertCircle size={16} /> Explanation & Solution Details
                        </div>

                        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <MathText text={questions[currentIndex].explanationEn} className="block leading-relaxed" />
                          {questions[currentIndex].explanationBn && (
                            <MathText text={questions[currentIndex].explanationBn} className="block leading-relaxed text-slate-500 dark:text-slate-400 italic" />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Submit Confirmation Overlay */}
            {showSubmitModal && (
              <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                    <Shield size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Submit WBCHSE Exam?</h3>
                    <p className="text-xs text-slate-500 font-medium">Are you sure you want to finish and submit your exam paper?</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 grid grid-cols-3 gap-2 text-xs font-bold">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Answered</span>
                      <span className="text-emerald-500 font-black text-base">{userAnswers.filter(a => a !== -1).length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Unanswered</span>
                      <span className="text-rose-500 font-black text-base">{userAnswers.filter(a => a === -1).length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Flagged</span>
                      <span className="text-amber-500 font-black text-base">{flaggedIndexes.length}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSubmitModal(false)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase"
                    >
                      Continue Test
                    </button>
                    <button
                      onClick={finishQuiz}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase shadow-lg shadow-amber-500/20"
                    >
                      Yes, Submit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: FINAL RESULTS */}
            {step === "result" && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
                  <Trophy size={44} />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Mock Test Complete!
                  </h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Subject: {config.subject} • {config.topic}
                  </p>
                </div>

                {/* Score Summary Box */}
                <div className="p-5 sm:p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Score</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{score}/{questions.length}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Accuracy</span>
                    <span className="text-2xl font-black text-emerald-500">{Math.round((score / questions.length) * 100)}%</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Points</span>
                    <span className="text-2xl font-black text-amber-500">+{score * 15} PTS</span>
                  </div>
                </div>

                {/* AI Mistake Analyzer & Chapter Weakness Diagnostic */}
                {showMistakeAnalyzer ? (
                  <div className="pt-2 text-left">
                    <MistakeAnalyzer
                      questions={questions.map((q, idx) => ({
                        id: q.id || idx,
                        question: langMode === "bengali" && q.questionBn ? q.questionBn : (q.questionEn || q.questionBn || `Question ${idx + 1}`),
                        options: (langMode === "bengali" && q.optionsBn && q.optionsBn.length > 0) ? q.optionsBn : (q.optionsEn || q.optionsBn || []),
                        correctIndex: q.correctIndex,
                        userAnswerIndex: userAnswers[idx] !== undefined ? userAnswers[idx] : -1,
                        chapter: config.topic || "Class 12 Semester 3",
                        subject: config.subject,
                        explanation: q.explanationBn || q.explanationEn,
                        bilingualExplanation: {
                          bn: q.explanationBn || "সঠিক উত্তরটি WBCHSE সিলেবাস অনুযায়ী নির্ধারিত হয়েছে।",
                          en: q.explanationEn || "Verified standard answer according to WBCHSE Semester 3 curriculum.",
                          keyPoint: `${config.subject} • ${config.topic || "Class 12 Exam Pattern"}`
                        }
                      }))}
                      subject={config.subject}
                      topic={config.topic}
                      onClose={() => setShowMistakeAnalyzer(false)}
                      onRetest={() => {
                        setShowMistakeAnalyzer(false);
                        setStep("config");
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-2 border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-left max-w-xl mx-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                        🧠
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          AI ভুল ও দুর্বলতা বিশ্লেষণ (Analyze Mistakes)
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {questions.length - score > 0 
                            ? `আপনার ${questions.length - score}টি ভুল উত্তরের বিশদ বাংলা ও ইংরেজি ব্যাখ্যা দেখুন।`
                            : "চমৎকার! আপনার সম্পূর্ণ টেস্টের চ্যাপ্টারভিত্তিক বিশ্লেষণ দেখুন।"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMistakeAnalyzer(true)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      বিশ্লেষণ দেখুন ({questions.length - score} ভুল) →
                    </button>
                  </div>
                )}

                {/* Class 12 Leaderboard Component to Gamify Mock Test Results */}
                <Class12Leaderboard
                  currentScore={score}
                  totalQuestions={questions.length}
                  subject={config.subject}
                  topic={config.topic}
                  userName={userName}
                  onTryAnotherTest={() => setStep("config")}
                  onClose={onClose}
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl mx-auto">
                  <button
                    type="button"
                    onClick={handlePrintScorecard}
                    className="flex-1 py-3.5 px-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Award size={16} />
                    <span>Print Scorecard & Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("config")}
                    className="flex-1 py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    <span>Try Another Test</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Back to Dashboard</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
          )}
        </div>

        {/* Descriptive Long Answer Admin Review Desk Modal */}
        <DescriptiveAdminReviewModal
          isOpen={showAdminDeskModal}
          onClose={() => setShowAdminDeskModal(false)}
          adminName={`${userName} (Admin)`}
        />
      </motion.div>
    </div>
  );
};
