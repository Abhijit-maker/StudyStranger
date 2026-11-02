import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Medal, Award, Crown, Flame, Zap, Star, ShieldCheck, 
  TrendingUp, Share2, Sparkles, ChevronRight, CheckCircle2, 
  BarChart3, RefreshCw, Users, BookOpen, Target, ArrowUpRight,
  Loader2, Radio
} from "lucide-react";
import { USER } from "../data.js";
import { soundEffects } from "../services/soundEffectsService";
import { nativeService } from "../services/nativeService";
import { db, auth, collection, query, orderBy, limit, onSnapshot } from "../firebase";

export interface Class12Performer {
  id: string;
  rank: number;
  name: string;
  district: string;
  subject: string;
  score: number;
  total: number;
  accuracy: number;
  points: number;
  avatarSeed: string;
  badge: string;
  badgeColor: string;
  isCurrentUser?: boolean;
}

interface Class12LeaderboardProps {
  currentScore?: number;
  totalQuestions?: number;
  subject?: string;
  topic?: string;
  userName?: string;
  onTryAnotherTest?: () => void;
  onClose?: () => void;
}

export const Class12Leaderboard: React.FC<Class12LeaderboardProps> = ({
  currentScore = 0,
  totalQuestions = 20,
  subject = "Biology",
  topic = "Full Syllabus",
  userName,
  onTryAnotherTest,
  onClose
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeTab, setActiveTab] = useState<"podium" | "ranklist">("podium");
  const [firestorePerformers, setFirestorePerformers] = useState<Class12Performer[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(true);

  const effectiveUserName = userName || USER.name || "Abhijit (You)";
  const accuracyPct = totalQuestions > 0 ? Math.round((currentScore / totalQuestions) * 100) : 0;
  const currentTestPoints = currentScore * 15;

  // Real-time Firestore Live Subscription: Listen to real student submissions only
  useEffect(() => {
    try {
      const q = query(collection(db, "mock_test_results"), orderBy("points", "desc"), limit(40));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const results: Class12Performer[] = snapshot.docs.map((d, index) => {
            const data = d.data();
            const acc = data.total > 0 ? Math.round((data.score / data.total) * 100) : (data.accuracy || 0);
            const isMe = data.userId === auth.currentUser?.uid || data.displayName === effectiveUserName;

            let badgeName = "Rising Star";
            let badgeStyle = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
            if (acc === 100) {
              badgeName = "Centurion Elite";
              badgeStyle = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
            } else if (acc >= 90) {
              badgeName = "Top 5% Ace";
              badgeStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            } else if (acc >= 75) {
              badgeName = "Distinction";
              badgeStyle = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
            }

            return {
              id: d.id,
              rank: index + 1,
              name: data.displayName || "WBCHSE Student",
              district: data.district || "West Bengal",
              subject: data.subject || "WBCHSE",
              score: data.score || 0,
              total: data.total || 20,
              accuracy: acc,
              points: data.points || (data.score * 15),
              avatarSeed: (data.displayName || "Student").replace(/\s+/g, ""),
              badge: badgeName,
              badgeColor: badgeStyle,
              isCurrentUser: isMe
            };
          });

          setFirestorePerformers(results);
          setIsLoadingRealData(false);
        },
        (err) => {
          console.warn("Real-time leaderboard subscription notice:", err);
          setIsLoadingRealData(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn("Leaderboard setup notice:", e);
      setIsLoadingRealData(false);
    }
  }, [effectiveUserName]);

  // Combine real-time Firestore results with current test attempt if not yet saved
  const allPerformers: Class12Performer[] = useMemo(() => {
    let pool = [...firestorePerformers];

    // If current user has points and is not in pool yet, merge them
    const alreadyInPool = pool.some(p => p.isCurrentUser);
    if (!alreadyInPool && currentScore > 0) {
      pool.push({
        id: "current-live-attempt",
        rank: 0,
        name: effectiveUserName.includes("You") ? effectiveUserName : `${effectiveUserName} (You)`,
        district: localStorage.getItem("userDistrict") || "West Bengal",
        subject: subject,
        score: currentScore,
        total: totalQuestions,
        accuracy: accuracyPct,
        points: currentTestPoints,
        avatarSeed: "Abhijit",
        badge: accuracyPct >= 90 ? "Top 5% Elite" : "Active Aspirant",
        badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        isCurrentUser: true
      });
    }

    // Filter by subject if selected
    if (selectedSubject !== "All") {
      pool = pool.filter(p => p.subject.toLowerCase() === selectedSubject.toLowerCase());
    }

    // Sort strictly by points and accuracy desc
    pool.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.accuracy - a.accuracy;
    });

    return pool.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [firestorePerformers, currentScore, effectiveUserName, subject, totalQuestions, accuracyPct, currentTestPoints, selectedSubject]);

  const currentUserData = useMemo(() => {
    return allPerformers.find(p => p.isCurrentUser);
  }, [allPerformers]);

  const topThree = useMemo(() => {
    return allPerformers.slice(0, 3);
  }, [allPerformers]);

  // Gamification milestone badges earned in this session
  const earnedBadges = useMemo(() => {
    const badges = [];
    if (accuracyPct === 100) {
      badges.push({ title: "Centurion 100%", desc: "Perfect Mock Score", icon: "💯", color: "from-amber-500 to-yellow-400" });
    } else if (accuracyPct >= 85) {
      badges.push({ title: "High Accuracy", desc: "Above 85% Precision", icon: "🎯", color: "from-emerald-500 to-teal-400" });
    }
    if (currentScore >= 15) {
      badges.push({ title: "Speed Finisher", desc: "15+ Right Answers", icon: "⚡", color: "from-blue-500 to-cyan-400" });
    }
    if (subject === "Biology") {
      badges.push({ title: "Bio Whiz", desc: "WBCHSE Unit Master", icon: "🧬", color: "from-rose-500 to-pink-400" });
    } else if (subject === "Bengali") {
      badges.push({ title: "সাহিত্যিক", desc: "Bangla Literature Ace", icon: "📖", color: "from-amber-600 to-yellow-500" });
    } else if (subject === "English") {
      badges.push({ title: "Grammar Master", desc: "English B Ace", icon: "✒️", color: "from-purple-600 to-indigo-500" });
    }
    badges.push({ title: "Rank Climber", desc: "+15 PTS Per MCQ", icon: "🚀", color: "from-orange-500 to-red-400" });
    return badges;
  }, [accuracyPct, currentScore, subject]);

  const handleShare = () => {
    const shareText = `🏆 WBCHSE Class 12 Leaderboard Update!\nআমি Study Stranger মক টেস্টে ${currentScore}/${totalQuestions} স্কোর পেয়েছি (${accuracyPct}% নির্ভুলতা)! বর্তমান র‍্যাঙ্ক: #${currentUserData?.rank || 4}।\nhttps://studystranger.ai.studio/`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      soundEffects.playClick();
      nativeService.showToast("লিডারবোর্ড স্কোর সফলভাবে কপি হয়েছে!");
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[2rem] bg-white dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-700 shadow-2xl overflow-hidden transition-all my-6 text-left">
      
      {/* Top Banner / Header with Gamified Identity */}
      <div className="p-5 sm:p-7 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white relative overflow-hidden border-b-2 border-stone-800">
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 pointer-events-none">
          <Trophy size={140} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-[11px] uppercase tracking-wider">
                <Crown size={14} className="fill-stone-950" />
                Class 12 Leaderboard
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-stone-200 text-[11px] font-bold">
                <Flame size={13} className="text-orange-400" />
                WBCHSE Semester 3
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                <TrendingUp size={13} />
                Live State Ranking
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              দ্বাদশ শ্রেণি সেরা মেধাতালিকা
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl font-medium">
              মক টেস্টের ফলাফল অনুযায়ী শীর্ষ শিক্ষার্থীদের তালিকা ও আপনার অবস্থান। প্রতিদিন মক টেস্ট দিয়ে পয়েন্ট বাড়ান ও র‍্যাঙ্ক আপগ্রেড করুন!
            </p>
          </div>

          {/* Share / Challenge Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Share2 size={15} />
              <span>{copiedShare ? "কপি হয়েছে!" : "র‍্যাঙ্ক শেয়ার"}</span>
            </button>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", "Biology", "Bengali", "English"].map(subj => {
            const label = subj === "All" ? "সব বিষয় (All Subjects)" : subj === "Biology" ? "Biology (জীববিদ্যা)" : subj === "Bengali" ? "Bengali A (বাংলা এ)" : "English B";
            const isSelected = selectedSubject === subj;
            return (
              <button
                key={subj}
                type="button"
                onClick={() => {
                  setSelectedSubject(subj);
                  soundEffects.playClick();
                }}
                className={`py-1.5 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected 
                    ? "bg-white text-stone-950 border-white shadow-sm" 
                    : "bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Student's Immediate Gamified Standing Card */}
      {currentUserData && (
        <div className="p-4 sm:p-5 bg-amber-50/60 dark:bg-amber-950/20 border-b-2 border-stone-900 dark:border-stone-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 border-2 border-stone-900 flex items-center justify-center font-black text-stone-900 text-xl shadow-[3px_3px_0px_#191919]">
                  #{currentUserData.rank}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center text-[10px] font-black border border-white">
                  ★
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-black text-base sm:text-lg text-stone-900 dark:text-stone-100">
                    {currentUserData.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-amber-400">
                    YOU
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  এই টেস্টে স্কোর: <strong className="text-stone-900 dark:text-stone-100">{currentScore}/{totalQuestions} ({accuracyPct}%)</strong> · মোট অর্জিত XP: <strong className="text-amber-600 dark:text-amber-400">{currentUserData.points} PTS</strong>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles size={11} />
                    Top {Math.max(1, Math.round((currentUserData.rank / allPerformers.length) * 100))}% WBCHSE Aspirant
                  </span>
                </div>
              </div>
            </div>

            {/* Micro badges earned this session */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {earnedBadges.map((b, i) => (
                <div 
                  key={i} 
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 shadow-xs flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200"
                  title={b.desc}
                >
                  <span>{b.icon}</span>
                  <span className="text-[11px]">{b.title}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Main Content Area: Podium vs Full Table Toggle */}
      <div className="p-4 sm:p-6 bg-stone-50 dark:bg-stone-950/40">
        
        {/* View Switcher */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-1 p-1 bg-stone-200 dark:bg-stone-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("podium")}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "podium" 
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs" 
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
              }`}
            >
              🏆 শীর্ষ ৩ স্থানাধিকারী (Top 3 Podium)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ranklist")}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ranklist" 
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs" 
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
              }`}
            >
              📋 সম্পূর্ণ তালিকা (Full Ranks)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
              <Radio size={12} className="animate-pulse text-emerald-500" />
              রিয়েল-টাইম ফায়ারবেস লাইভ
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono hidden sm:inline">
              আসল সাবমিশন: {allPerformers.length} টি
            </span>
          </div>
        </div>

        {/* Empty state when no submissions exist yet */}
        {allPerformers.length === 0 && (
          <div className="p-10 text-center bg-white dark:bg-stone-900 rounded-3xl border-2 border-dashed border-stone-300 dark:border-stone-800 space-y-3 my-4">
            <Trophy size={48} className="mx-auto text-amber-400" />
            <h3 className="text-base font-black text-stone-900 dark:text-white">এখনো কোনো মক টেস্ট রেকর্ড নেই</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              এখানে কোনো ডামি বা ফেক ডেটা নেই। আপনি মক টেস্টটি সম্পন্ন করার সাথে সাথে আপনার আসল স্কোর ও র‍্যাঙ্ক সবার উপরে লাইভ যুক্ত হবে!
            </p>
          </div>
        )}

        {/* Podium View */}
        {activeTab === "podium" && allPerformers.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4 pb-2">
              
              {/* 2nd Place (Silver) */}
              {topThree[1] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`order-2 md:order-1 p-4 rounded-2xl bg-white dark:bg-stone-900 border-2 ${
                    topThree[1].isCurrentUser ? "border-amber-400 ring-2 ring-amber-400/30" : "border-stone-300 dark:border-stone-800"
                  } shadow-md flex flex-col items-center text-center relative`}
                >
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-black flex items-center justify-center text-sm mb-2 shadow-xs border border-slate-300">
                    🥈 #2
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 border-2 border-slate-400 flex items-center justify-center font-bold text-slate-800 text-lg mb-2 shadow-inner">
                    {topThree[1].name.slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white truncate max-w-[160px]">
                    {topThree[1].name}
                  </h4>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                    {topThree[1].district}
                  </span>
                  <div className="mt-3 w-full pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center text-xs">
                    <span className="text-stone-500">নির্ভুলতা: <strong>{topThree[1].accuracy}%</strong></span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{topThree[1].points} XP</span>
                  </div>
                </motion.div>
              )}

              {/* 1st Place (Gold) - Elevated in center */}
              {topThree[0] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`order-1 md:order-2 p-5 rounded-3xl bg-gradient-to-b from-amber-50 to-white dark:from-stone-800 dark:to-stone-900 border-3 ${
                    topThree[0].isCurrentUser ? "border-amber-400 ring-4 ring-amber-400/30" : "border-amber-400"
                  } shadow-xl flex flex-col items-center text-center relative md:-translate-y-2`}
                >
                  <div className="absolute -top-3.5 bg-amber-400 text-stone-950 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Crown size={12} className="fill-stone-950" /> State Rank #1
                  </div>
                  <div className="w-11 h-11 rounded-full bg-amber-400 text-stone-950 font-black flex items-center justify-center text-base mt-2 mb-2 shadow-md border-2 border-stone-950">
                    🥇
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-100 border-2 border-amber-500 flex items-center justify-center font-black text-amber-950 text-xl mb-2 shadow-inner">
                    {topThree[0].name.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-black text-base text-stone-900 dark:text-white truncate max-w-[180px]">
                    {topThree[0].name}
                  </h3>
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                    {topThree[0].district}
                  </span>
                  <div className="mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-500/20">
                    {topThree[0].badge} · {topThree[0].subject}
                  </div>
                  <div className="mt-3 w-full pt-3 border-t border-amber-200 dark:border-stone-700 flex justify-between items-center text-xs">
                    <span className="text-stone-600 dark:text-stone-300">নির্ভুলতা: <strong className="text-emerald-600 font-bold">{topThree[0].accuracy}%</strong></span>
                    <span className="font-black text-amber-600 dark:text-amber-400 font-mono text-sm">{topThree[0].points} XP</span>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place (Bronze) */}
              {topThree[2] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`order-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border-2 ${
                    topThree[2].isCurrentUser ? "border-amber-400 ring-2 ring-amber-400/30" : "border-stone-300 dark:border-stone-800"
                  } shadow-md flex flex-col items-center text-center relative`}
                >
                  <div className="w-9 h-9 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-300 font-black flex items-center justify-center text-sm mb-2 shadow-xs border border-amber-700/30">
                    🥉 #3
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-200 to-orange-100 border-2 border-amber-600 flex items-center justify-center font-bold text-amber-900 text-lg mb-2 shadow-inner">
                    {topThree[2].name.slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white truncate max-w-[160px]">
                    {topThree[2].name}
                  </h4>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                    {topThree[2].district}
                  </span>
                  <div className="mt-3 w-full pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center text-xs">
                    <span className="text-stone-500">নির্ভুলতা: <strong>{topThree[2].accuracy}%</strong></span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{topThree[2].points} XP</span>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        )}

        {/* Detailed Full Rank Table */}
        <div className="space-y-2 mt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-3 flex justify-between">
            <span>র‍্যাঙ্ক ও শিক্ষার্থী</span>
            <span className="text-right">নির্ভুলতা / পয়েন্ট</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {allPerformers.map((p) => {
              const isUser = p.isCurrentUser;
              return (
                <div
                  key={p.id}
                  className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isUser
                      ? "bg-amber-100/70 dark:bg-amber-950/40 border-amber-500 dark:border-amber-600 ring-2 ring-amber-400/20"
                      : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      p.rank === 1 ? "bg-amber-400 text-stone-950" :
                      p.rank === 2 ? "bg-slate-300 text-stone-900" :
                      p.rank === 3 ? "bg-amber-700 text-white" :
                      isUser ? "bg-stone-900 text-amber-400" :
                      "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    }`}>
                      #{p.rank}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs sm:text-sm font-bold truncate ${isUser ? "text-stone-950 dark:text-white" : "text-stone-800 dark:text-stone-200"}`}>
                          {p.name}
                        </span>
                        {isUser && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-stone-950">
                            YOU
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border hidden sm:inline-block ${p.badgeColor}`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {p.district} · {p.subject}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-black font-mono text-stone-900 dark:text-stone-100">
                      {p.accuracy}%
                    </div>
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {p.points} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Gamification Tip */}
      <div className="p-3.5 bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Target size={14} className="text-amber-500" />
          <span>পরবর্তী র‍্যাঙ্ক আনলক করতে আরও মক টেস্ট দিন এবং ১০০% অ্যাকুরেসি অর্জন করুন!</span>
        </div>
        
        {onTryAnotherTest && (
          <button
            type="button"
            onClick={onTryAnotherTest}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>নতুন মক টেস্ট দিন</span>
            <ArrowUpRight size={13} />
          </button>
        )}
      </div>

    </div>
  );
};
export default Class12Leaderboard;
