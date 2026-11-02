import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Award,
  CheckCircle2,
  Target,
  Sparkles,
  AlertCircle,
  ChevronRight,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { soundEffects } from "../services/soundEffectsService";
import { db, auth, doc, getDoc, setDoc } from "../firebase";
import {
  DEFAULT_VERIFIED_DAILY_GOALS,
  VerifiedDailyGoal,
  DailyActivityMetrics,
  evaluateGoalClaimEligibility,
  calculateStudentLevelInfo,
} from "../utils/studyCoreLogic";
import {
  getTodayVerifiedActivityMetrics,
  recordVerifiedStudyActivity,
} from "../utils/studyActivityTracker";

interface Badge {
  id: string;
  title: string;
  titleBn: string;
  desc: string;
  descBn: string;
  icon: string;
  category: "streak" | "accuracy" | "subject" | "speed";
  reqPoints: number;
  unlocked: boolean;
}

const QUICK_VERIFICATION_QUESTIONS: Record<
  string,
  {
    questionBn: string;
    options: string[];
    correctIndex: number;
    metricKey: keyof Omit<DailyActivityMetrics, "date">;
    incrementAmount: number;
    toolPath: string;
    toolLabel: string;
  }
> = {
  "g-1": {
    questionBn:
      "WBCHSE বায়োলজি প্রশ্ন: মানুষের ডিম্বাণুর Zona Pellucida-তে কোন প্রোটিনটি প্রাথমিক শুক্রাণু গ্রাহক (Primary Sperm Receptor) হিসেবে কাজ করে?",
    options: ["ZP1 প্রোটিন", "ZP2 প্রোটিন", "ZP3 গ্লাইকোপ্রোটিন", "Acrosin এনজাইম"],
    correctIndex: 2,
    metricKey: "mockTestsCompleted",
    incrementAmount: 1,
    toolPath: "/app/mock",
    toolLabel: "Open Full Mock Test",
  },
  "g-2": {
    questionBn:
      "বাংলা ও জীববিদ্যা ফ্ল্যাশকার্ড যাচাই: প্রভাতকুমার মুখোপাধ্যায়ের 'আদিরিনী' গল্পে হাতিটির মালিক কে ছিলেন?",
    options: ["জয়রাম মোক্তার", "বীরবল", "মহেশ", "গফুর"],
    correctIndex: 0,
    metricKey: "flashcardsReviewed",
    incrementAmount: 5,
    toolPath: "/app/flashcards",
    toolLabel: "Open Flashcard Deck",
  },
  "g-3": {
    questionBn:
      "ইংরেজি ও মিসটেক অ্যানালাইসিস: Anton Chekhov-এর 'The Bet' গল্পে তরুণ আইনজীবী কত বছরের জন্য নির্জন কারাবাসের বাজি ধরেছিলেন?",
    options: ["5 Years", "10 Years", "15 Years", "20 Years"],
    correctIndex: 2,
    metricKey: "mistakesReviewed",
    incrementAmount: 1,
    toolPath: "/app/mistakes",
    toolLabel: "Open Mistake Analyzer",
  },
  "g-4": {
    questionBn:
      "ডিএনএ রেপ্লিকেশন যাচাই: DNA তন্ত্রের দুটি স্ট্র্যান্ড আলাদা করার সময় কোন উত্সেচকটি হাইড্রোজেন বন্ধনী ভেঙে দেয়?",
    options: ["DNA Ligase", "DNA Helicase", "RNA Primase", "Topoisomerase"],
    correctIndex: 1,
    metricKey: "voiceMentorInteractions",
    incrementAmount: 2,
    toolPath: "/app/focus",
    toolLabel: "Open Focus Room",
  },
};

export const StudyStreakTracker: React.FC<{ userName?: string; onExplore?: () => void }> = ({
  userName = "Abhiyaan963",
}) => {
  const nav = useNavigate();

  const [streakDays, setStreakDays] = useState<number>(() => {
    const s = localStorage.getItem("ss_study_streak");
    return s ? parseInt(s, 10) : 0;
  });

  const [totalXp, setTotalXp] = useState<number>(() => {
    const s = localStorage.getItem("ss_student_xp") || localStorage.getItem("user_points");
    return s ? parseInt(s, 10) : 0;
  });

  const [activityMetrics, setActivityMetrics] = useState<DailyActivityMetrics>(() =>
    getTodayVerifiedActivityMetrics()
  );

  const [dailyGoals, setDailyGoals] = useState<VerifiedDailyGoal[]>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem("ss_verified_goals_date");
    const saved = localStorage.getItem("ss_verified_daily_goals");
    if (saved && savedDate === today) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].metricKey) {
          return parsed;
        }
      } catch {
        // fallback to default
      }
    }
    return DEFAULT_VERIFIED_DAILY_GOALS;
  });

  const [statusBanner, setStatusBanner] = useState<{
    type: "warning" | "success";
    message: string;
  } | null>(null);

  const [activeChallengeGoal, setActiveChallengeGoal] = useState<VerifiedDailyGoal | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [challengeError, setChallengeError] = useState<string>("");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const handleActivityUpdate = () => {
      setActivityMetrics(getTodayVerifiedActivityMetrics());
    };
    window.addEventListener("ss-study-activity-updated", handleActivityUpdate);
    return () => window.removeEventListener("ss-study-activity-updated", handleActivityUpdate);
  }, []);

  useEffect(() => {
    if (auth.currentUser?.uid) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      getDoc(userRef)
        .then((snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (typeof data.points === "number") {
              setTotalXp(data.points);
              localStorage.setItem("ss_student_xp", data.points.toString());
            }
            if (typeof data.streak === "number") {
              setStreakDays(data.streak);
              localStorage.setItem("ss_study_streak", data.streak.toString());
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const levelInfo = React.useMemo(() => calculateStudentLevelInfo(totalXp), [totalXp]);

  const badges: Badge[] = [
    {
      id: "b-1",
      title: "Bio Prodigy",
      titleBn: "জীববিদ্যা বিশারদ",
      desc: "Completed Biology Reproduction & Genetics verification",
      descBn: "জনন বা বংশগতিতে সঠিক উত্তর প্রদান",
      icon: "🧬",
      category: "subject",
      reqPoints: 0,
      unlocked: true,
    },
    {
      id: "b-2",
      title: "Sahitya Ratna",
      titleBn: "সাহিত্য রত্ন",
      desc: "Mastered Adarini and Vivekananda's prose",
      descBn: "আদিরিনী ও বিবেকানন্দের প্রবন্ধ নিখুঁত সমাধান",
      icon: "📚",
      category: "subject",
      reqPoints: 0,
      unlocked: true,
    },
    {
      id: "b-3",
      title: "Streak Master",
      titleBn: "৭-দিনের বহ্নিশিখা",
      desc: "Maintained a 7-day continuous study streak",
      descBn: "টানা ৭ দিন নিয়মিত পড়াশোনা ও পরীক্ষা সম্পন্ন",
      icon: "🔥",
      category: "streak",
      reqPoints: 300,
      unlocked: streakDays >= 7 || totalXp >= 300,
    },
    {
      id: "b-4",
      title: "Speed Blitz Maestro",
      titleBn: "তড়িৎ গতি পরীক্ষক",
      desc: "Reached 400+ XP in verified study sessions",
      descBn: "৪০০+ ভেরিফাইড স্টাডি পয়েন্ট অর্জন",
      icon: "⚡",
      category: "speed",
      reqPoints: 400,
      unlocked: totalXp >= 400,
    },
    {
      id: "b-5",
      title: "Chekhov Scholar",
      titleBn: "ইংরেজি বিশেষজ্ঞ",
      desc: "Perfect score in 'The Bet' & 'Deoli'",
      descBn: "The Bet এবং Ruskin Bond-এর প্রশ্নে পূর্ণমান",
      icon: "📜",
      category: "subject",
      reqPoints: 600,
      unlocked: totalXp >= 600,
    },
    {
      id: "b-6",
      title: "Board Topper Shield",
      titleBn: "WBCHSE শ্রেষ্ঠ শিল্ড",
      desc: "Reached Level 5 and top 1% state leaderboard",
      descBn: "বোর্ড লেডারবোর্ডের শীর্ষ ১% তে স্থান অর্জন",
      icon: "👑",
      category: "accuracy",
      reqPoints: 1200,
      unlocked: totalXp >= 1200,
    },
  ];

  const handleGoalAttemptClaim = (goal: VerifiedDailyGoal) => {
    const currentMetrics = getTodayVerifiedActivityMetrics();
    setActivityMetrics(currentMetrics);

    const eligibility = evaluateGoalClaimEligibility(goal, currentMetrics);

    if (!eligibility.canClaim) {
      soundEffects.play("click");
      if (!goal.claimed) {
        setActiveChallengeGoal(goal);
        setSelectedOption(null);
        setChallengeError("");
      }
      return;
    }

    soundEffects.play("correct");
    const today = new Date().toISOString().slice(0, 10);
    const lastStreakDate = localStorage.getItem("ss_last_streak_claim_date");

    let nextStreak = streakDays;
    if (lastStreakDate !== today) {
      nextStreak = streakDays + 1;
      setStreakDays(nextStreak);
      localStorage.setItem("ss_study_streak", nextStreak.toString());
      localStorage.setItem("ss_last_streak_claim_date", today);
    }

    const nextXp = totalXp + goal.xp;
    setTotalXp(nextXp);
    localStorage.setItem("ss_student_xp", nextXp.toString());

    const updatedGoals = dailyGoals.map((g) =>
      g.id === goal.id ? { ...g, claimed: true } : g
    );
    setDailyGoals(updatedGoals);
    localStorage.setItem("ss_verified_daily_goals", JSON.stringify(updatedGoals));
    localStorage.setItem("ss_verified_goals_date", today);

    setStatusBanner({
      type: "success",
      message: eligibility.messageBn,
    });

    confetti({ particleCount: 45, spread: 65, origin: { y: 0.75 } });

    if (auth.currentUser?.uid) {
      setDoc(
        doc(db, "users", auth.currentUser.uid),
        { points: nextXp, streak: nextStreak, lastActive: new Date().toISOString() },
        { merge: true }
      ).catch(() => {});
    }
  };

  const handleCompleteQuickVerification = () => {
    if (!activeChallengeGoal) return;
    const challenge = QUICK_VERIFICATION_QUESTIONS[activeChallengeGoal.id];
    if (!challenge) return;

    if (selectedOption === null) {
      setChallengeError("অনুগ্রহ করে একটি উত্তর নির্বাচন করো।");
      return;
    }

    if (selectedOption !== challenge.correctIndex) {
      soundEffects.play("incorrect");
      setChallengeError("উত্তরটি সঠিক হয়নি! আবার মনোযোগ দিয়ে চেষ্টা করো।");
      return;
    }

    soundEffects.play("correct");
    const updatedMetrics = recordVerifiedStudyActivity(
      challenge.metricKey,
      challenge.incrementAmount
    );
    setActivityMetrics(updatedMetrics);
    setChallengeError("");
    const completedGoal = activeChallengeGoal;
    setActiveChallengeGoal(null);

    // Automatically award XP upon verification
    const today = new Date().toISOString().slice(0, 10);
    const lastStreakDate = localStorage.getItem("ss_last_streak_claim_date");
    let nextStreak = streakDays;
    if (lastStreakDate !== today) {
      nextStreak = streakDays + 1;
      setStreakDays(nextStreak);
      localStorage.setItem("ss_study_streak", nextStreak.toString());
      localStorage.setItem("ss_last_streak_claim_date", today);
    }
    const nextXp = totalXp + completedGoal.xp;
    setTotalXp(nextXp);
    localStorage.setItem("ss_student_xp", nextXp.toString());

    const updatedGoals = dailyGoals.map((g) =>
      g.id === completedGoal.id ? { ...g, claimed: true } : g
    );
    setDailyGoals(updatedGoals);
    localStorage.setItem("ss_verified_daily_goals", JSON.stringify(updatedGoals));
    localStorage.setItem("ss_verified_goals_date", today);

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.75 } });

    setStatusBanner({
      type: "success",
      message: `দারুণ! "${completedGoal.titleBn}" সম্পন্ন হয়েছে এবং +${completedGoal.xp} XP যুক্ত হয়েছে!`,
    });
  };

  return (
    <div className="w-full bg-white rounded-[32px] border-2 border-[#18181b] shadow-[0_6px_0_#18181b] overflow-hidden text-left">
      {/* Vibrant Orange-Red Gradient Header matching Screenshot */}
      <div className="p-5 sm:p-7 bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#E11D48] text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-[11px] font-black uppercase tracking-wider text-white">
              <span>🔥</span> DAILY STUDY STREAK &amp; REWARDS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              দৈনিক স্ট্রিক ও লেভেল সিস্টেম
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 font-medium">
              {userName} • WBCHSE Class 12 Semester 4 প্রিপারেশন
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/25 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/15 self-start sm:self-auto">
            <div className="text-center px-1">
              <span className="text-[10px] font-bold text-orange-200 block uppercase">স্ট্রিক</span>
              <div className="flex items-center gap-1 justify-center mt-0.5">
                <span className="text-base">🔥</span>
                <span className="text-lg sm:text-xl font-black text-white leading-tight">
                  {streakDays} <span className="block sm:inline text-sm sm:text-lg">দিন</span>
                </span>
              </div>
            </div>
            <div className="w-[1px] h-9 bg-white/20" />
            <div className="text-center px-1">
              <span className="text-[10px] font-bold text-orange-200 block uppercase">
                মোট পয়েন্ট (XP)
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-300 block mt-0.5 leading-tight">
                +{totalXp} <span className="block sm:inline text-sm sm:text-lg">XP</span>
              </span>
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-black/20 border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase shrink-0">
                LEVEL {levelInfo.level}
              </span>
              <span className="font-bold text-white truncate">{levelInfo.title}</span>
            </div>
            <span className="text-orange-100 font-mono text-xs font-bold shrink-0">
              {totalXp} / {levelInfo.nextReq} XP
            </span>
          </div>
          <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(8, levelInfo.progress))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-6 bg-white">
        {/* Status Banner */}
        <AnimatePresence>
          {statusBanner && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs sm:text-sm font-bold ${
                statusBanner.type === "warning"
                  ? "bg-amber-50 border-amber-300 text-amber-950"
                  : "bg-emerald-50 border-emerald-300 text-emerald-950"
              }`}
            >
              <div className="flex items-start gap-2">
                {statusBanner.type === "warning" ? (
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                )}
                <span>{statusBanner.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="text-xs font-black underline shrink-0 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DAILY GOALS GRID matching Screenshot */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-orange-600 shrink-0" />
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                আজকের লক্ষ্যমাত্রা (Daily Focus Goals)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 shrink-0">
              সম্পন্ন: {dailyGoals.filter((g) => g.claimed).length}/{dailyGoals.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dailyGoals.map((goal) => {
              const isClaimed = goal.claimed;

              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => handleGoalAttemptClaim(goal)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isClaimed
                      ? "bg-emerald-50/60 border-emerald-300 text-slate-900"
                      : "bg-[#F8FAFC] hover:bg-slate-100/80 border-slate-200/90 text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                        isClaimed
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white border-slate-300 text-transparent"
                      }`}
                    >
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`text-xs sm:text-sm font-bold block leading-snug ${
                          isClaimed ? "line-through text-slate-400" : "text-slate-800"
                        }`}
                      >
                        {goal.titleBn}
                      </span>
                      <span className="text-[11px] font-bold text-orange-600 block mt-0.5">
                        +{goal.xp} XP বোনাস
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* IN-PLACE TASK VERIFICATION MODAL */}
        <AnimatePresence>
          {activeChallengeGoal && QUICK_VERIFICATION_QUESTIONS[activeChallengeGoal.id] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="p-4 sm:p-5 rounded-2xl bg-[#FFFBEB] border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200 border border-[#18181b] text-[10px] font-black uppercase">
                    <Sparkles size={11} /> কুইক টাস্ক যাচাই (+{activeChallengeGoal.xp} XP)
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                    {activeChallengeGoal.titleBn}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveChallengeGoal(null)}
                  className="p-1.5 rounded-full bg-white border border-slate-300 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                {QUICK_VERIFICATION_QUESTIONS[activeChallengeGoal.id].questionBn}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_VERIFICATION_QUESTIONS[activeChallengeGoal.id].options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedOption(idx);
                      setChallengeError("");
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold cursor-pointer transition-all ${
                      selectedOption === idx
                        ? "bg-[#18181b] text-white border-[#18181b]"
                        : "bg-white text-slate-800 border-slate-300 hover:border-[#18181b]"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </button>
                ))}
              </div>

              {challengeError && (
                <div className="text-xs font-black text-rose-600">{challengeError}</div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => nav(QUICK_VERIFICATION_QUESTIONS[activeChallengeGoal.id].toolPath)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  {QUICK_VERIFICATION_QUESTIONS[activeChallengeGoal.id].toolLabel} →
                </button>

                <button
                  type="button"
                  onClick={handleCompleteQuickVerification}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer"
                >
                  ✓ উত্তর যাচাই ও +{activeChallengeGoal.xp} XP নিন
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACHIEVEMENT BADGES GRID matching Screenshot */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-500 shrink-0" />
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                অর্জন ও মেডেলসমূহ (Achievement Badges)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              আনলকড: {badges.filter((b) => b.unlocked).length}/{badges.length}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {badges.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBadge(b)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2 select-none ${
                  b.unlocked
                    ? "bg-[#FFFBEB] border-amber-300 shadow-xs hover:scale-[1.02]"
                    : "bg-slate-50/70 border-slate-200/80 opacity-55"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-xl border border-slate-100">
                  {b.icon}
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 leading-tight">{b.titleBn}</h4>
                  <span className="text-[9px] text-slate-500 font-semibold block mt-0.5 leading-tight">
                    {b.title}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    b.unlocked
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {b.unlocked ? "আনলকড ✓" : "লকড"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Badge Detail Drawer */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedBadge.icon}</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    {selectedBadge.titleBn} ({selectedBadge.title})
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{selectedBadge.descBn}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold shrink-0 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
