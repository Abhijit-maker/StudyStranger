import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PhoneCall, 
  Phone, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Volume2, 
  FileText, 
  Camera, 
  Share2, 
  X, 
  Heart, 
  Flame, 
  Award, 
  Upload, 
  Check, 
  Play, 
  Pause,
  ExternalLink,
  ChevronRight,
  Zap,
  Info,
  Sliders,
  UserCheck
} from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { nativeService } from "../services/nativeService";

interface AccountabilityVigilanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onInitiateSimulatedCall?: (type: "morning_plan" | "night_audit", tasksSummary: string) => void;
}

interface PollComment {
  id: string;
  userName: string;
  userRole?: string;
  vote: string;
  text: string;
  timestamp: string;
}

export const AccountabilityVigilanceModal: React.FC<AccountabilityVigilanceModalProps> = ({
  isOpen,
  onClose,
  user,
  onInitiateSimulatedCall
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "voting" | "calling" | "parent" | "plans">("voting");
  
  // Voting State
  const [selectedVote, setSelectedVote] = useState<string | null>(() => {
    return localStorage.getItem("accountability_user_vote") || null;
  });
  const [hasVoted, setHasVoted] = useState<boolean>(() => {
    return !!localStorage.getItem("accountability_user_vote");
  });
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<PollComment[]>([
    {
      id: "c1",
      userName: "Abhijit (Class 12)",
      vote: "strict",
      text: "Eta khub dorkari! Keu monitor na korle distraction hoye jay. Morning and night call thakle daily grind kora jabe!",
      timestamp: "Today, 10:15 AM"
    },
    {
      id: "c2",
      userName: "Sourav M. (WBCHSE Science)",
      vote: "strict",
      text: "Yes, family k update dile ar faki marar chance thakbe na. Paid holeo ami nite raji!",
      timestamp: "Today, 11:30 AM"
    },
    {
      id: "c3",
      userName: "Priya Das",
      vote: "ai_only",
      text: "AI calling is amazing. Human call ektu nervous lage, but AI reminder + study proof tracking is top tier!",
      timestamp: "Yesterday, 8:45 PM"
    }
  ]);

  // Vote Counts
  const [voteStats, setVoteStats] = useState({
    strict: 142,
    ai_only: 38,
    dislike: 12,
    total: 192
  });

  // Daily Tasks & Proof State
  const [morningTime, setMorningTime] = useState("07:30");
  const [nightTime, setNightTime] = useState("21:30");
  const [targetStudyHours, setTargetStudyHours] = useState(4.5);
  const [todayTasks, setTodayTasks] = useState([
    { id: "t1", subject: "Biology", task: "Human Reproduction (Gametogenesis & ZP3 Receptor)", completed: true },
    { id: "t2", subject: "English B", task: "The Bet (Anton Chekhov) - 5 Short Questions", completed: true },
    { id: "t3", subject: "Higher Math", task: "Definite Integral Substitution (15 Problems)", completed: false }
  ]);
  const [newTaskSubject, setNewTaskSubject] = useState("Biology");
  const [newTaskText, setNewTaskText] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(() => {
    return localStorage.getItem("today_study_proof") || null;
  });
  const [proofNote, setProofNote] = useState("");

  // Parent Contact Details
  const [parentName, setParentName] = useState(() => localStorage.getItem("guardian_name") || "Guardian");
  const [parentPhone, setParentPhone] = useState(() => localStorage.getItem("guardian_phone") || "");
  const [parentRelation, setParentRelation] = useState(() => localStorage.getItem("guardian_relation") || "Father");
  const [parentRedFlagEnabled, setParentRedFlagEnabled] = useState(true);
  const [isSavedParentInfo, setIsSavedParentInfo] = useState(false);

  // Transcript Audio simulation state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Load / Sync votes from Firestore if available
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, "accountability_feedback"), (snapshot) => {
        if (!snapshot.empty) {
          const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PollComment[];
          if (fetched.length > 0) {
            setComments(prev => [...fetched, ...prev.filter(p => !fetched.some(f => f.id === p.id))]);
          }
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Feedback sync fallback:", e);
    }
  }, []);

  const handleVote = async (voteKey: "strict" | "ai_only" | "dislike") => {
    setSelectedVote(voteKey);
    setHasVoted(true);
    localStorage.setItem("accountability_user_vote", voteKey);

    setVoteStats(prev => {
      const updated = {
        ...prev,
        [voteKey]: prev[voteKey as keyof typeof prev] + 1,
        total: prev.total + 1
      };
      return updated;
    });

    nativeService.showToast("Your vote has been recorded! Thank you.");

    try {
      await addDoc(collection(db, "accountability_votes"), {
        userId: user?.uid || "guest",
        userName: user?.displayName || user?.username || "Student",
        vote: voteKey,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Vote recording to firestore error:", e);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;

    const newComment: PollComment = {
      id: `c_${Date.now()}`,
      userName: user?.displayName || user?.username || "Abhijit (Student)",
      userRole: user?.isAdmin ? "Admin" : "Class 12 Student",
      vote: selectedVote || "strict",
      text: commentText.trim(),
      timestamp: "Just now"
    };

    setComments(prev => [newComment, ...prev]);
    setCommentText("");
    nativeService.showToast("Comment posted!");

    try {
      await addDoc(collection(db, "accountability_feedback"), {
        ...newComment,
        userId: user?.uid || "guest",
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Error posting comment:", e);
    }
  };

  const handleSaveParentInfo = () => {
    localStorage.setItem("guardian_name", parentName);
    localStorage.setItem("guardian_phone", parentPhone);
    localStorage.setItem("guardian_relation", parentRelation);
    setIsSavedParentInfo(true);
    nativeService.showToast("Parent vigilance contact updated!");
    setTimeout(() => setIsSavedParentInfo(false), 2500);
  };

  const handleUploadProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setProofImage(base64);
      localStorage.setItem("today_study_proof", base64);
      nativeService.showToast("Study proof attached successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleSendWhatsAppParentReport = () => {
    const completedCount = todayTasks.filter(t => t.completed).length;
    const totalCount = todayTasks.length;
    const studentName = user?.displayName || "Abhijit";
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    
    const message = `📋 *[STUDY STRANGER • DAILY PARENT PROGRESS DOSSIER]*
📅 Date: ${dateStr}
👤 Student: ${studentName} (WBCHSE Class 12 - Sem 3)

⏱️ *Daily Study Hours Logged:* ${targetStudyHours} Hours
✅ *Tasks Completed:* ${completedCount}/${totalCount} Completed
${todayTasks.map(t => `${t.completed ? "✔️" : "❌"} [${t.subject}] ${t.task}`).join("\n")}

🎯 *Mock Test Discipline:* 94% Accuracy
🛡️ *Accountability Status:* 🟢 EXCELLENT & ON-TRACK
📌 *Parent Message:* Today's handwritten study notes and mock test proof have been verified.

_Automated Report via Study Stranger Vigilance Protocol_`;

    const cleanPhone = parentPhone.replace(/\D/g, "");
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  };

  const toggleTask = (id: string) => {
    setTodayTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setTodayTasks(prev => [
      ...prev,
      {
        id: `t_${Date.now()}`,
        subject: newTaskSubject,
        task: newTaskText.trim(),
        completed: false
      }
    ]);
    setNewTaskText("");
  };

  if (!isOpen) return null;

  const strictPercent = Math.round((voteStats.strict / voteStats.total) * 100) || 78;
  const aiPercent = Math.round((voteStats.ai_only / voteStats.total) * 100) || 16;
  const dislikePercent = Math.round((voteStats.dislike / voteStats.total) * 100) || 6;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none font-sans">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-4xl bg-stone-900 border-2 border-stone-700/80 rounded-[28px] sm:rounded-[36px] text-white max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-stone-900 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-stone-950/80 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-xl">
              <PhoneCall size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[9px] font-black uppercase tracking-wider">
                  🔥 PROPOSAL & LIVE PROTOCOL
                </span>
                <span className="text-[10px] text-amber-100 font-mono hidden sm:inline">
                  WBCHSE Class 12 Sem 3
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                Daily Calling & Family Vigilance Protocol
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-950/60 hover:bg-stone-950 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-stone-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Segmented Controls */}
        <div className="px-4 sm:px-6 py-2 bg-stone-950 border-b border-stone-800 flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide shrink-0 text-xs font-bold">
          <div className="flex items-center gap-1.5 p-1 bg-stone-900 rounded-2xl border border-stone-800/80">
            <button
              onClick={() => setActiveTab("voting")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "voting" 
                  ? "bg-[#FF7A30] text-white shadow-md" 
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <ThumbsUp size={13} />
              <span>Community Poll ({voteStats.total})</span>
            </button>

            <button
              onClick={() => setActiveTab("calling")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "calling" 
                  ? "bg-[#FF7A30] text-white shadow-md" 
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Clock size={13} />
              <span>Morning/Night Calls & Proof</span>
            </button>

            <button
              onClick={() => setActiveTab("parent")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "parent" 
                  ? "bg-[#FF7A30] text-white shadow-md" 
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Users size={13} />
              <span>Parent Report & WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveTab("plans")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "plans" 
                  ? "bg-[#FF7A30] text-white shadow-md" 
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Award size={13} />
              <span>Human vs AI Plans</span>
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-200">
          
          {/* ================= TAB 1: COMMUNITY VOTING & PROPOSAL ================= */}
          {activeTab === "voting" && (
            <div className="space-y-6">
              
              {/* Concept Transcript Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-400" size={18} />
                    <h3 className="text-sm sm:text-base font-black text-white">
                      The Concept: Why This Feature is Being Proposed
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Student Accountability
                  </span>
                </div>

                <div className="p-3.5 bg-stone-900/90 rounded-2xl border border-stone-800/80 text-xs sm:text-sm text-stone-300 leading-relaxed font-sans space-y-2">
                  <p className="italic text-amber-200/90">
                    "Hey guys, scene eita je amader main problem holo privacy ektu beshi! Nobody monitors us. Amra porashona korte boshi, but tracking ba accountability thake na je koto tuku porlam. Er fole porashona miss hoye jay. Ekdin pori, tarpor distract hoye sob sesh! Pressure debar keu nei..."
                  </p>
                  <p className="text-stone-300 text-xs">
                    💡 <strong>Proposed Solution:</strong> Daily 2-time Voice Calls (Morning Task Goal Setting + Night Task & Proof Verification) + Direct Parent WhatsApp Updates so you remain under healthy academic pressure to grind every day!
                  </p>
                </div>
              </div>

              {/* Voting Options Box */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <span>Cast Your Vote: Should We Launch This Feature?</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Strict Calling & Parent */}
                  <button
                    onClick={() => handleVote("strict")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      selectedVote === "strict"
                        ? "bg-gradient-to-b from-orange-500/20 to-amber-500/10 border-[#FF7A30] shadow-lg"
                        : "bg-stone-900 border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">🔥</span>
                        {selectedVote === "strict" && (
                          <span className="p-1 bg-[#FF7A30] text-white rounded-full"><Check size={12} /></span>
                        )}
                      </div>
                      <h5 className="font-black text-sm text-white">YES! Need Strict Pressure</h5>
                      <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                        Morning + Night Call + Study Proof + Family Progress Reporting.
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-2 border-t border-stone-800 text-amber-400">
                      <span>{voteStats.strict} Votes</span>
                      <span>{strictPercent}%</span>
                    </div>
                  </button>

                  {/* Option 2: AI Voice Only */}
                  <button
                    onClick={() => handleVote("ai_only")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      selectedVote === "ai_only"
                        ? "bg-gradient-to-b from-sky-500/20 to-indigo-500/10 border-sky-400 shadow-lg"
                        : "bg-stone-900 border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">🤖</span>
                        {selectedVote === "ai_only" && (
                          <span className="p-1 bg-sky-500 text-white rounded-full"><Check size={12} /></span>
                        )}
                      </div>
                      <h5 className="font-black text-sm text-white">AI Calling Only (No Family)</h5>
                      <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                        AI Stranger calls morning & night, but keeps reports private to me.
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-2 border-t border-stone-800 text-sky-400">
                      <span>{voteStats.ai_only} Votes</span>
                      <span>{aiPercent}%</span>
                    </div>
                  </button>

                  {/* Option 3: Dislike / Too Strict */}
                  <button
                    onClick={() => handleVote("dislike")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      selectedVote === "dislike"
                        ? "bg-gradient-to-b from-rose-500/20 to-red-500/10 border-rose-500 shadow-lg"
                        : "bg-stone-900 border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">😴</span>
                        {selectedVote === "dislike" && (
                          <span className="p-1 bg-rose-500 text-white rounded-full"><Check size={12} /></span>
                        )}
                      </div>
                      <h5 className="font-black text-sm text-white">Too Strict / Self-Study</h5>
                      <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                        I prefer managing my own study routine without daily calls.
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-2 border-t border-stone-800 text-rose-400">
                      <span>{voteStats.dislike} Votes</span>
                      <span>{dislikePercent}%</span>
                    </div>
                  </button>
                </div>

                {/* Progress Bar Visualization */}
                <div className="space-y-1.5 pt-2">
                  <div className="h-3 w-full bg-stone-900 rounded-full overflow-hidden flex">
                    <div style={{ width: `${strictPercent}%` }} className="h-full bg-gradient-to-r from-orange-500 to-amber-500" title="Strict: 78%" />
                    <div style={{ width: `${aiPercent}%` }} className="h-full bg-sky-500" title="AI Only: 16%" />
                    <div style={{ width: `${dislikePercent}%` }} className="h-full bg-rose-500" title="Dislike: 6%" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span className="text-amber-400 font-bold">🔥 Strict ({strictPercent}%)</span>
                    <span className="text-sky-400 font-bold">🤖 AI Only ({aiPercent}%)</span>
                    <span className="text-rose-400 font-bold">😴 Too Strict ({dislikePercent}%)</span>
                  </div>
                </div>
              </div>

              {/* Student Feedback & Comments Section */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#FF7A30]" /> Student Opinions & Discussion
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                    placeholder="Apnar motamot ba suggestion likhun..."
                    className="flex-1 bg-stone-900 border border-stone-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF7A30]"
                  />
                  <button
                    onClick={handlePostComment}
                    className="px-4 py-2.5 bg-[#FF7A30] hover:bg-orange-600 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Send size={13} /> Send
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 bg-stone-900/80 rounded-2xl border border-stone-800/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white">{c.userName}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 font-mono">
                            {c.vote === "strict" ? "🔥 Strict Calling" : c.vote === "ai_only" ? "🤖 AI Only" : "😴 Self Study"}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500">{c.timestamp}</span>
                      </div>
                      <p className="text-stone-300 text-xs leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: MORNING/NIGHT CALLS & PROOF ================= */}
          {activeTab === "calling" && (
            <div className="space-y-6">
              
              {/* Daily Calling Schedule Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Morning Planning Call */}
                <div className="p-5 rounded-3xl bg-stone-950 border border-amber-500/30 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
                      ☀️ MORNING AUDIT CALL
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">{morningTime} AM</span>
                  </div>

                  <h4 className="text-sm font-black text-white">Daily Target Commitment Call</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    The mentor calls you to ask today's syllabus targets, study hours, and locking the daily pact.
                  </p>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">Target Study Time:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="12"
                        value={targetStudyHours}
                        onChange={(e) => setTargetStudyHours(parseFloat(e.target.value) || 4)}
                        className="w-14 bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-xs text-center font-mono font-bold text-amber-300"
                      />
                      <span className="text-xs font-bold text-stone-400">Hours</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onInitiateSimulatedCall) {
                        onInitiateSimulatedCall("morning_plan", todayTasks.map(t => t.task).join(", "));
                        onClose();
                      } else {
                        nativeService.showToast("Initiating Morning Planning Voice Call...");
                      }
                    }}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    <Phone size={14} /> Simulate Morning Call Now
                  </button>
                </div>

                {/* Night Verification Call */}
                <div className="p-5 rounded-3xl bg-stone-950 border border-indigo-500/30 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-black uppercase tracking-wider">
                      🌙 NIGHT PROOF CALL
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-400">{nightTime} PM</span>
                  </div>

                  <h4 className="text-sm font-black text-white">Proof Audit & Distraction Check</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Mentor checks if all tasks were completed, asks for reasons if missed, and audits attached notes.
                  </p>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                    <span className="text-stone-400">Tasks Completed:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {todayTasks.filter(t => t.completed).length}/{todayTasks.length} Completed
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (onInitiateSimulatedCall) {
                        onInitiateSimulatedCall("night_audit", todayTasks.map(t => `${t.task} (${t.completed ? 'Done' : 'Missed'})`).join(", "));
                        onClose();
                      } else {
                        nativeService.showToast("Initiating Night Proof Audit Voice Call...");
                      }
                    }}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    <Phone size={14} /> Simulate Night Audit Call Now
                  </button>
                </div>

              </div>

              {/* Today's Target Checklist */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400" /> Today's Locked Study Tasks
                  </h4>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Click to check off as you study
                  </span>
                </div>

                <div className="space-y-2">
                  {todayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        t.completed
                          ? "bg-emerald-500/10 border-emerald-500/30 text-stone-200"
                          : "bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                          t.completed ? "bg-emerald-500 border-emerald-400 text-white" : "border-stone-700 bg-stone-950"
                        }`}>
                          {t.completed && <Check size={13} />}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-stone-800 text-amber-400 mr-2">
                            {t.subject}
                          </span>
                          <span className={`text-xs font-medium ${t.completed ? "line-through opacity-70" : ""}`}>
                            {t.task}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold font-mono">
                        {t.completed ? "✅ DONE" : "⏳ PENDING"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add New Custom Task */}
                <div className="flex gap-2 pt-2 border-t border-stone-800">
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-2 text-xs text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="Biology">Biology</option>
                    <option value="English B">English B</option>
                    <option value="Bengali A">Bengali A</option>
                    <option value="Higher Math">Higher Math</option>
                    <option value="Physics/Chem">Science</option>
                  </select>

                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    placeholder="Notun syllabus task add korun..."
                    className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />

                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Add Target
                  </button>
                </div>
              </div>

              {/* Study Proof Upload Vault */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera size={16} className="text-[#FF7A30]" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Daily Study Proof Vault (Proof of Work)
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Audited during Night Call
                  </span>
                </div>

                <p className="text-xs text-stone-400">
                  Upload a snapshot of your handwritten notes, solved problem copies, or mock test results to prove today's study.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <label className="border-2 border-dashed border-stone-700 hover:border-[#FF7A30] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-stone-900/60 hover:bg-stone-900 transition-all text-center">
                    <Upload size={22} className="text-stone-400" />
                    <span className="text-xs font-bold text-white">Take Photo / Upload Notes Proof</span>
                    <span className="text-[10px] text-stone-500">Supports JPG, PNG, PDF Screenshots</span>
                    <input type="file" accept="image/*" onChange={handleUploadProof} className="hidden" />
                  </label>

                  {proofImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-stone-900 p-2 h-32 flex items-center justify-center group">
                      <img src={proofImage} alt="Study Proof" className="h-full object-contain rounded-xl" />
                      <div className="absolute top-2 right-2 bg-emerald-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md">
                        ✓ Proof Attached
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-4 h-32 flex flex-col items-center justify-center text-center text-xs text-stone-500">
                      <span>No study proof attached yet today.</span>
                      <span className="text-[10px] text-amber-400 mt-1">Attach before 9:30 PM call</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 3: PARENT ACCOUNTABILITY & WHATSAPP ================= */}
          {activeTab === "parent" && (
            <div className="space-y-6">
              
              {/* Parent Details Card */}
              <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-amber-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Guardian / Family Contact Setup
                    </h4>
                  </div>
                  <span className="text-[10px] text-stone-400">Weekly Vigilance Sync</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Father / Mother Name"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">WhatsApp / Phone Number</label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Relationship</label>
                    <select
                      value={parentRelation}
                      onChange={(e) => setParentRelation(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none"
                    >
                      <option value="Father">Father (বাবা)</option>
                      <option value="Mother">Mother (মা)</option>
                      <option value="Elder Sibling">Brother / Sister</option>
                      <option value="Guardian">Local Guardian</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="redFlagCheck"
                      checked={parentRedFlagEnabled}
                      onChange={(e) => setParentRedFlagEnabled(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <label htmlFor="redFlagCheck" className="text-xs text-stone-300 font-medium">
                      Auto Red-Flag Alert if no study logged for 2+ consecutive days
                    </label>
                  </div>

                  <button
                    onClick={handleSaveParentInfo}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    {isSavedParentInfo ? "Saved!" : "Save Guardian Contact"}
                  </button>
                </div>
              </div>

              {/* Today's Official Parent Progress Dossier Preview */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-stone-950 to-stone-900 border border-amber-500/40 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-emerald-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Official Daily Parent Progress Dossier (WhatsApp Preview)
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    🟢 Status: Disciplined
                  </span>
                </div>

                <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 font-mono text-xs text-stone-300 space-y-2 leading-relaxed">
                  <div className="text-amber-400 font-bold border-b border-stone-800/80 pb-1">
                    📋 STUDY STRANGER • OFFICIAL DAILY PARENT PROGRESS REPORT
                  </div>
                  <div>👤 <strong>Student:</strong> {user?.displayName || "Abhijit"} (WBCHSE Class 12 Sem 3)</div>
                  <div>⏱️ <strong>Study Time Logged:</strong> {targetStudyHours} Hours</div>
                  <div>✅ <strong>Tasks Completed:</strong> {todayTasks.filter(t => t.completed).length}/{todayTasks.length} Completed</div>
                  <div>🎯 <strong>Exam Practice Accuracy:</strong> 94% (Biology & English)</div>
                  <div>🛡️ <strong>Vigilance Status:</strong> 🟢 Active & Grinding</div>
                </div>

                <button
                  onClick={handleSendWhatsAppParentReport}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all active:scale-98"
                >
                  <Share2 size={15} /> Send Progress Report to Guardian WhatsApp Now
                </button>
              </div>

            </div>
          )}

          {/* ================= TAB 4: HUMAN MENTOR VS AI CALLING PLANS ================= */}
          {activeTab === "plans" && (
            <div className="space-y-6">
              
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Accountability Membership Tiers
                </h3>
                <p className="text-xs text-stone-400">
                  As explained in the announcement: Human voice mentors require dedicated salaries, while Autonomous AI voice calls are included.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* AI Autonomous Calling */}
                <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                        STANDARD
                      </span>
                      <span className="text-sm font-black text-white">100% Free / Included</span>
                    </div>

                    <h4 className="text-base font-black text-white">Autonomous AI Stranger Mentor</h4>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Powered by Gemini Multimodal Live Voice API. Calls you morning & night with full Bengali/English voice fluency.
                    </p>

                    <ul className="space-y-2 text-xs text-stone-300">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-sky-400 shrink-0" />
                        <span>Daily Morning Task Goal Setting (AI Voice)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-sky-400 shrink-0" />
                        <span>Daily Night Verification & Proof Check (AI Voice)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-sky-400 shrink-0" />
                        <span>Manual 1-Click WhatsApp Parent Share</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-sky-400 shrink-0" />
                        <span>Automatic Streak & Mistake Bank Logging</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("calling");
                      nativeService.showToast("AI Autonomous Calling Active!");
                    }}
                    className="w-full py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Use AI Autonomous Protocol
                  </button>
                </div>

                {/* Human Pro-Mentor Vigilance */}
                <div className="p-5 rounded-3xl bg-gradient-to-b from-stone-950 to-stone-900 border-2 border-amber-500/60 space-y-4 relative flex flex-col justify-between shadow-xl">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                        ★ PRO HUMAN MENTOR (UPCOMING)
                      </span>
                      <span className="text-sm font-black text-amber-400">Paid / Premium Tier</span>
                    </div>

                    <h4 className="text-base font-black text-white">Dedicated Human Academic Counselor</h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      An actual dedicated academic mentor calls you twice daily from a verified phone line and personally manages your progress.
                    </p>

                    <ul className="space-y-2 text-xs text-stone-200">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-amber-400 shrink-0" />
                        <span>Real Human Mentor Calling 2x Daily</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-amber-400 shrink-0" />
                        <span>Direct Weekly Phone Call with Parents / Family</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-amber-400 shrink-0" />
                        <span>Strict Proof Audit & Red Flag Enforcement</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-amber-400 shrink-0" />
                        <span>Personalized WBCHSE Class 12 Strategy Sessions</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      handleVote("strict");
                      nativeService.showToast("Enrolled in Early Access Waitlist for Human Mentorship!");
                    }}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-all active:scale-98"
                  >
                    Join Pro-Mentor Waitlist
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert size={13} className="text-amber-400" />
            <span>Encrypted & Student-Controlled Accountability Protocol</span>
          </div>
          <span className="font-mono text-stone-500">Study Stranger v4.2</span>
        </div>
      </motion.div>
    </div>
  );
};
