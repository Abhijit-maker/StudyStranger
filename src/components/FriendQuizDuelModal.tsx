import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Swords, Trophy, Zap, CheckCircle2, AlertCircle, Share2, RefreshCw, User, Bot, Flame, Copy, LogIn as JoinIcon, Plus } from "lucide-react";
import { soundEffects } from "../services/soundEffectsService";
import { db, auth } from "../firebase";
import { collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, doc, setDoc, Timestamp, limit } from "firebase/firestore";
import { nativeService } from "../services/nativeService";

interface FriendQuizDuelModalProps {
  onClose: () => void;
  userName?: string;
  userId?: string;
}

interface Question {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const DUEL_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "Biology",
    question: "Which receptor protein on the zona pellucida of mammalian oocytes binds to sperm?",
    options: ["ZP1", "ZP2", "ZP3", "ZP4"],
    correct: 2,
    explanation: "ZP3 is the sperm receptor protein on the zona pellucida responsible for species-specific sperm binding and acrosome reaction."
  },
  {
    id: 2,
    subject: "Biology",
    question: "On which day of a standard 28-day human menstrual cycle does the LH surge typically occur?",
    options: ["Day 5", "Day 10", "Day 14", "Day 21"],
    correct: 2,
    explanation: "The luteinizing hormone (LH) surge occurs around Day 14, triggering ovulation."
  },
  {
    id: 3,
    subject: "Bengali A",
    question: "প্রভাকুমার মুখোপাধ্যায়ের 'আদিরিনী' গল্পে জয়রাম মোক্তার হাতিটির দাম কত ঠিক করেছিলেন?",
    options: ["১০০০ টাকা", "১৫০০ টাকা", "২০০০ টাকা", "২৫০০ টাকা"],
    correct: 2,
    explanation: "'আদিরিনী' গল্পে জয়রাম মোক্তার হাতিটির দাম দুই হাজার (২০০০) টাকা নির্ধারণ করেছিলেন।"
  },
  {
    id: 4,
    subject: "English B",
    question: "In Anton Chekhov's story 'The Bet', what was the total wager agreed upon by the banker and the lawyer?",
    options: ["1 million rubles", "2 million rubles", "5 million rubles", "10 million rubles"],
    correct: 1,
    explanation: "The wager was 2 million rubles for 15 years of voluntary confinement."
  },
  {
    id: 5,
    subject: "Biology",
    question: "What is the causative pathogen of Syphilis?",
    options: ["Neisseria gonorrhoeae", "Treponema pallidum", "HIV", "Chlamydia trachomatis"],
    correct: 1,
    explanation: "Syphilis is a sexually transmitted infection caused by the spirochete bacterium Treponema pallidum."
  }
];

export const FriendQuizDuelModal: React.FC<FriendQuizDuelModalProps> = ({
  onClose,
  userName = "Abhijit",
  userId = auth.currentUser?.uid || "anonymous"
}) => {
  const [gameState, setGameState] = useState<"lobby" | "waiting_room" | "playing" | "result">("lobby");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [duelLinkCopied, setDuelLinkCopied] = useState(false);
  
  // 1v1 Room States
  const [roomCode, setRoomCode] = useState<string>("");
  const [roomDocId, setRoomDocId] = useState<string>("");
  const [roomData, setRoomData] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isDuelMode, setIsDuelMode] = useState<"ai" | "friend">("ai");

  const filteredQuestions = selectedSubject === "All" 
    ? DUEL_QUESTIONS 
    : DUEL_QUESTIONS.filter(q => q.subject === selectedSubject);

  const currentQ = filteredQuestions[currentQuestionIndex] || filteredQuestions[0];

  // PERSISTENCE: Check if there's an active room for the user (within 15 mins)
  useEffect(() => {
    const checkActiveRoom = async () => {
      const savedRoom = localStorage.getItem(`active_duel_room_${userId}`);
      if (savedRoom) {
        const { code, docId, expiry } = JSON.parse(savedRoom);
        if (Date.now() < expiry) {
          setRoomCode(code);
          setRoomDocId(docId);
          setGameState("waiting_room");
          setIsHost(true);
          setIsDuelMode("friend");
        } else {
          localStorage.removeItem(`active_duel_room_${userId}`);
        }
      }
    };
    checkActiveRoom();
  }, [userId]);

  // Real-time listener for the room
  useEffect(() => {
    if (!roomDocId) return;

    const unsub = onSnapshot(doc(db, "challenges", roomDocId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRoomData(data);
        
        // If guest joined and status is waiting, start the game
        if (data.status === "playing" && gameState === "waiting_room") {
          setGameState("playing");
          setCurrentQuestionIndex(data.currentQuestionIndex || 0);
          setUserScore(isHost ? (data.hostScore || 0) : (data.guestScore || 0));
          setOpponentScore(isHost ? (data.guestScore || 0) : (data.hostScore || 0));
        }

        // Sync scores
        if (gameState === "playing") {
          setUserScore(isHost ? (data.hostScore || 0) : (data.guestScore || 0));
          setOpponentScore(isHost ? (data.guestScore || 0) : (data.hostScore || 0));
          setCurrentQuestionIndex(data.currentQuestionIndex || 0);
        }

        if (data.status === "completed" && gameState !== "result") {
          setGameState("result");
        }
      }
    });

    return () => unsub();
  }, [roomDocId, gameState, isHost]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && !isAnswered && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === "playing" && !isAnswered && timeLeft === 0) {
      handleAnswerSelect(-1); // Time out
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, isAnswered]);

  const handleStartAIDuel = () => {
    soundEffects.playClick();
    setIsDuelMode("ai");
    setGameState("playing");
    setCurrentQuestionIndex(0);
    setUserScore(0);
    setOpponentScore(0);
    setTimeLeft(15);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const createFriendRoom = async () => {
    soundEffects.playClick();
    setIsJoining(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 15 * 60 * 1000;
      
      const newRoom = {
        roomCode: code,
        hostId: userId,
        hostName: userName,
        status: "waiting",
        subject: selectedSubject,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(expiry).toISOString(),
        hostScore: 0,
        guestScore: 0,
        currentQuestionIndex: 0
      };

      const docRef = await addDoc(collection(db, "challenges"), newRoom);
      setRoomDocId(docRef.id);
      setRoomCode(code);
      setIsHost(true);
      setIsDuelMode("friend");
      setGameState("waiting_room");
      
      localStorage.setItem(`active_duel_room_${userId}`, JSON.stringify({
        code,
        docId: docRef.id,
        expiry
      }));

      nativeService.showToast("Room created! Share the code with your friend.");
    } catch (err) {
      console.error("Error creating room:", err);
      nativeService.showToast("Failed to create room. Try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const joinFriendRoom = async () => {
    if (!joinCodeInput || joinCodeInput.length !== 6) {
      nativeService.showToast("Enter a valid 6-digit code");
      return;
    }

    soundEffects.playClick();
    setIsJoining(true);
    try {
      const q = query(
        collection(db, "challenges"), 
        where("roomCode", "==", joinCodeInput),
        where("status", "==", "waiting")
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        nativeService.showToast("Room not found or already active");
        setIsJoining(false);
        return;
      }

      const roomDoc = snap.docs[0];
      const data = roomDoc.data();

      if (new Date() > new Date(data.expiresAt)) {
        nativeService.showToast("This room code has expired (15 mins limit)");
        setIsJoining(false);
        return;
      }

      if (data.hostId === userId) {
        // User is joining their own room (maybe after refresh)
        setRoomDocId(roomDoc.id);
        setRoomCode(data.roomCode);
        setIsHost(true);
        setIsDuelMode("friend");
        setGameState("waiting_room");
      } else {
        // Join as guest
        await updateDoc(doc(db, "challenges", roomDoc.id), {
          guestId: userId,
          guestName: userName,
          status: "playing"
        });

        setRoomDocId(roomDoc.id);
        setRoomCode(data.roomCode);
        setIsHost(false);
        setIsDuelMode("friend");
        setGameState("playing");
      }
      
      nativeService.showToast("Joined the duel! Get ready!");
    } catch (err) {
      console.error("Error joining room:", err);
      nativeService.showToast("Failed to join room. Try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleAnswerSelect = async (optionIndex: number) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentQ.correct;
    let newScore = userScore;
    if (isCorrect) {
      newScore = userScore + 1;
      setUserScore(newScore);
      soundEffects.playCorrectSound();
    } else {
      soundEffects.playWrongSound();
    }

    if (isDuelMode === "ai") {
      // Simulate bot intelligence
      const botCorrect = Math.random() > 0.35;
      if (botCorrect) {
        setOpponentScore(prev => prev + 1);
      }
    } else if (isDuelMode === "friend" && roomDocId) {
      // Sync score to Firestore
      try {
        await updateDoc(doc(db, "challenges", roomDocId), {
          [isHost ? "hostScore" : "guestScore"]: newScore
        });
      } catch (err) {
        console.error("Score sync error:", err);
      }
    }

    setTimeout(async () => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < filteredQuestions.length) {
        if (isDuelMode === "friend" && isHost && roomDocId) {
          // Host updates the question index for both
          await updateDoc(doc(db, "challenges", roomDocId), {
            currentQuestionIndex: nextIndex
          });
        }
        setCurrentQuestionIndex(nextIndex);
        setSelectedOption(null);
        setIsAnswered(false);
        setTimeLeft(15);
      } else {
        if (isDuelMode === "friend" && isHost && roomDocId) {
          await updateDoc(doc(db, "challenges", roomDocId), {
            status: "completed"
          });
        }
        setGameState("result");
        soundEffects.playSuccess();
        if (isDuelMode === "friend") {
          localStorage.removeItem(`active_duel_room_${userId}`);
        }
      }
    }, 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setDuelLinkCopied(true);
    soundEffects.playClick();
    setTimeout(() => setDuelLinkCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="stranger-modal w-full max-w-xl flex flex-col overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/50 dark:bg-stone-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Swords size={24} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">1v1 Quiz Duel</h2>
              <p className="text-xs text-orange-500 font-bold uppercase tracking-wider">WBCHSE Semester 3 Battle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-h-[75vh] custom-scrollbar">
          {gameState === "lobby" && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-[32px] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                  <Flame size={48} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-stone-900 dark:text-white">Challenge Your Knowledge</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                    Test your mastery in Biology, Bengali, and English against your classmates or AI challenger in real-time MCQ duels!
                  </p>
                </div>
              </div>

              {/* Join Room Section - MOVED UP FOR PROMINENCE */}
              <div className="p-6 stranger-card bg-stone-100 dark:bg-stone-800/50 border-orange-500/30 space-y-4 shadow-lg shadow-orange-500/5">
                <div className="flex items-center gap-2">
                  <JoinIcon size={18} className="text-orange-500" />
                  <h4 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.2em]">Join Private Arena (কোড দিয়ে যুক্ত হন)</h4>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-Digit Code"
                    className="flex-1 stranger-input font-mono text-center text-xl tracking-[0.3em] py-3.5 bg-white dark:bg-stone-900"
                  />
                  <button
                    onClick={joinFriendRoom}
                    disabled={isJoining || joinCodeInput.length !== 6}
                    className="px-8 stranger-btn-primary disabled:opacity-50 flex items-center gap-2"
                  >
                    {isJoining ? <RefreshCw size={18} className="animate-spin" /> : <JoinIcon size={18} />}
                    <span className="hidden sm:inline">Join</span>
                  </button>
                </div>
              </div>

              {/* Create Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleStartAIDuel}
                  className="p-6 stranger-card stranger-card-hover border-purple-500/20 hover:border-purple-500/50 text-center space-y-3 group cursor-pointer bg-purple-500/5"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <Bot size={28} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-stone-900 dark:text-white">Duel with AI</h4>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Instant Practise</p>
                  </div>
                </button>

                <button
                  onClick={createFriendRoom}
                  disabled={isJoining}
                  className="p-6 stranger-card stranger-card-hover border-orange-500/20 hover:border-orange-500/50 text-center space-y-3 group cursor-pointer bg-orange-500/5"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <Plus size={28} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-stone-900 dark:text-white">Create Room</h4>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Start a Challenge</p>
                  </div>
                </button>
              </div>

              {/* Subject selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Select Duel Subject</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["All", "Biology", "Bengali A", "English B"].map((subj) => (
                    <button
                      key={subj}
                      onClick={() => setSelectedSubject(subj)}
                      className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                        selectedSubject === subj
                          ? "bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700"
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameState === "waiting_room" && (
            <div className="text-center py-10 space-y-8">
              <div className="w-28 h-24 mx-auto relative">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 mx-auto rounded-[32px] stranger-card flex items-center justify-center text-orange-500">
                  <User size={48} />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-stone-900 dark:text-white">Waiting for Opponent</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">Share this code with your friend to start</p>
              </div>

              <div className="p-8 stranger-card bg-stone-50 dark:bg-stone-900/50 space-y-5">
                <div className="text-5xl font-black text-orange-500 tracking-[0.3em] font-mono pl-4">
                  {roomCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 mx-auto px-6 py-3 stranger-btn-secondary text-sm"
                >
                  <Copy size={18} />
                  <span>{duelLinkCopied ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              <p className="text-xs text-stone-400 font-medium">
                Active for 15 minutes. Session persists after refresh.
              </p>
              
              <button
                onClick={() => {
                  localStorage.removeItem(`active_duel_room_${userId}`);
                  setGameState("lobby");
                }}
                className="text-sm font-black text-stone-400 hover:text-orange-500 transition-colors cursor-pointer uppercase tracking-widest"
              >
                Cancel and return
              </button>
            </div>
          )}

          {gameState === "playing" && (
            <div className="space-y-6">
              {/* Scoreboard & Timer */}
              <div className="flex items-center justify-between p-5 stranger-card bg-stone-50 dark:bg-stone-900/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shadow-inner">
                    <User size={24} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-black uppercase tracking-wider truncate">{userName}</span>
                    <span className="text-xl font-black text-stone-900 dark:text-white">{userScore} Pts</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white rounded-full font-black text-xs shadow-sm">
                    {timeLeft}s
                  </div>
                  <div className="w-12 h-1 bg-stone-300 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(timeLeft/15)*100}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-black uppercase tracking-wider truncate">
                      {isDuelMode === "ai" ? "AI Rival" : (isHost ? (roomData?.guestName || "Opponent") : (roomData?.hostName || "Host"))}
                    </span>
                    <span className="text-xl font-black text-stone-900 dark:text-white">{opponentScore} Pts</span>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isDuelMode === "ai" ? "bg-purple-500/10 text-purple-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                    {isDuelMode === "ai" ? <Bot size={24} /> : <User size={24} />}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  <span>Question {currentQuestionIndex + 1} of {filteredQuestions.length}</span>
                  <span className="text-orange-500">{currentQ.subject}</span>
                </div>
                <div className="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden p-1 shadow-inner">
                  <motion.div
                    className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(255,122,48,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="stranger-card bg-white dark:bg-stone-900 p-6 sm:p-8 space-y-6">
                <h4 className="text-base sm:text-lg font-black text-stone-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options.map((opt, idx) => {
                    let btnStyle = "bg-stone-50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800";
                    if (isAnswered) {
                      if (idx === currentQ.correct) {
                        btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10";
                      } else if (idx === selectedOption) {
                        btnStyle = "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400";
                      } else {
                        btnStyle = "bg-stone-50/50 dark:bg-stone-800/20 border-transparent text-stone-400 dark:text-stone-600 opacity-50";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={isAnswered}
                        className={`w-full text-left p-5 rounded-2xl border text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && idx === currentQ.correct && (
                          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-100 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-300 italic leading-relaxed"
                    >
                      <span className="font-black text-orange-500 block mb-1 not-italic uppercase text-[10px] tracking-widest">Explanation</span>
                      {currentQ.explanation}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {gameState === "result" && (
            <div className="text-center space-y-8 py-6">
              <div className="w-28 h-28 mx-auto rounded-[40px] stranger-card bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
                <Trophy size={56} />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black text-stone-900 dark:text-white">Duel Complete!</h3>
                <p className="text-lg font-bold text-orange-500">
                  {userScore > opponentScore ? "🎉 You Won the Duel!" : userScore === opponentScore ? "🤝 It's a Tie!" : (isDuelMode === "ai" ? "🤖 AI Rival Won!" : "🤝 Opponent Won!")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 stranger-card bg-stone-50 dark:bg-stone-900/50">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-black uppercase tracking-widest block mb-1 truncate">{userName}</span>
                  <span className="text-3xl font-black text-orange-500">{userScore}</span>
                  <span className="text-xs text-stone-400 block font-bold mt-1">Points</span>
                </div>
                <div className="p-6 stranger-card bg-stone-50 dark:bg-stone-900/50">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-black uppercase tracking-widest block mb-1 truncate">
                    {isDuelMode === "ai" ? "AI Rival" : (isHost ? (roomData?.guestName || "Opponent") : (roomData?.hostName || "Host"))}
                  </span>
                  <span className="text-3xl font-black text-purple-500">{opponentScore}</span>
                  <span className="text-xs text-stone-400 block font-bold mt-1">Points</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => setGameState("lobby")}
                  className="flex-1 stranger-btn-primary py-4 text-base"
                >
                  <RefreshCw size={20} className="inline-block mr-2" />
                  Duel Lobby
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 stranger-btn-secondary py-4 text-base"
                >
                  Close Arena
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
