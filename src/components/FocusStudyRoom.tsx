import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Coffee,
  Brain,
  Headphones,
  Flame,
  BookOpen,
  Users,
} from "lucide-react";
import confetti from "canvas-confetti";
import { db, auth, collection, doc, setDoc, onSnapshot, query, limit } from "../firebase";

interface FocusStudyRoomProps {
  onClose: () => void;
  userName?: string;
  onVoiceSync?: () => void;
}

type SoundType = "rain" | "cafe" | "lofi" | "whitenoise" | "forest" | "none";

export const FocusStudyRoom: React.FC<FocusStudyRoomProps> = ({
  onClose,
  userName = "Abhijit",
  onVoiceSync,
}) => {
  const [timerMode, setTimerMode] = useState<"focus" | "shortBreak" | "longBreak" | "deepStudy">(
    "focus"
  );
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [activeSound, setActiveSound] = useState<SoundType>("lofi");
  const [soundVolume, setSoundVolume] = useState<number>(0.6);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [focusSubject, setFocusSubject] = useState<string>("Biology (Unit I: Reproduction)");
  const [realPeers, setRealPeers] = useState<any[]>([]);

  // Real-time Firestore sync: Subscribe to active peer study sessions
  useEffect(() => {
    try {
      const q = query(collection(db, "focus_sessions"), limit(25));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const peers = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setRealPeers(peers);
        },
        (err) => {
          console.warn("Focus sessions sync notice:", err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn("Focus room error:", e);
    }
  }, []);

  // Broadcast current user's session when timer starts/stops
  useEffect(() => {
    const studentName = auth.currentUser?.displayName || userName || "Abhijit";
    const studentUid = auth.currentUser?.uid || `peer-${studentName.replace(/\s+/g, "")}`;
    const sessionRef = doc(db, "focus_sessions", studentUid);

    if (isRunning) {
      setDoc(
        sessionRef,
        {
          userId: studentUid,
          userName: studentName,
          subject: focusSubject,
          status: timerMode.includes("Break") ? "On Break" : "Deep Focus",
          lastPing: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    } else {
      setDoc(
        sessionRef,
        {
          status: "Ready",
          lastPing: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    }
  }, [isRunning, focusSubject, timerMode, userName]);

  // Web Audio Synthesizer for Ambient Focus Sounds
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<any[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lofiChordTimerRef = useRef<any>(null);

  const ensureAudioContext = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  };

  const stopAllAudioNodes = () => {
    if (lofiChordTimerRef.current) {
      clearInterval(lofiChordTimerRef.current);
      lofiChordTimerRef.current = null;
    }
    activeNodesRef.current.forEach((node) => {
      try {
        node.stop?.();
        node.disconnect();
      } catch {}
    });
    activeNodesRef.current = [];
  };

  useEffect(() => {
    stopAllAudioNodes();

    if (activeSound === "none" || isAudioMuted) {
      if (gainNodeRef.current && audioContextRef.current) {
        try {
          gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.05);
        } catch {}
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.value = soundVolume * 0.18;
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (activeSound === "rain") {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0,
          b1 = 0,
          b2 = 0,
          b3 = 0,
          b4 = 0,
          b5 = 0,
          b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 850;
        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        activeNodesRef.current.push(noise, filter, masterGain);
      } else if (activeSound === "lofi") {
        const subOsc = ctx.createOscillator();
        subOsc.type = "sine";
        subOsc.frequency.value = 108;
        const subGain = ctx.createGain();
        subGain.gain.value = 0.08;
        subOsc.connect(subGain);
        subGain.connect(masterGain);
        subOsc.start();
        activeNodesRef.current.push(subOsc, subGain);

        const chords = [
          [261.63, 329.63, 392.0, 493.88],
          [220.0, 261.63, 329.63, 392.0],
          [174.61, 220.0, 261.63, 329.63],
          [196.0, 246.94, 293.66, 349.23],
        ];
        let chordIdx = 0;

        const playChord = () => {
          if (!audioContextRef.current || isAudioMuted) return;
          const currentChord = chords[chordIdx % chords.length];
          chordIdx++;
          currentChord.forEach((freq) => {
            try {
              const osc = ctx.createOscillator();
              const oscGain = ctx.createGain();
              osc.type = "triangle";
              osc.frequency.setValueAtTime(freq, ctx.currentTime);
              oscGain.gain.setValueAtTime(0.001, ctx.currentTime);
              oscGain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.6);
              oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8);

              const filter = ctx.createBiquadFilter();
              filter.type = "lowpass";
              filter.frequency.value = 600;

              osc.connect(filter);
              filter.connect(oscGain);
              oscGain.connect(masterGain);

              osc.start();
              osc.stop(ctx.currentTime + 4.0);
            } catch {}
          });
        };

        playChord();
        lofiChordTimerRef.current = setInterval(playChord, 4200);
      } else if (activeSound === "whitenoise") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "triangle";
        osc1.frequency.value = 216;
        osc2.frequency.value = 224;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 350;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);

        osc1.start();
        osc2.start();
        activeNodesRef.current.push(osc1, osc2, filter, masterGain);
      } else if (activeSound === "forest" || activeSound === "cafe") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 528;
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.05;
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        activeNodesRef.current.push(osc, oscGain, masterGain);
      }
    } catch (e) {
      console.warn("Ambient sound error:", e);
    }

    return () => {
      stopAllAudioNodes();
    };
  }, [activeSound, isAudioMuted, soundVolume]);

  const handleSelectSound = (sound: SoundType) => {
    ensureAudioContext();
    if (activeSound === sound && !isAudioMuted) {
      setIsAudioMuted(true);
    } else {
      setIsAudioMuted(false);
      setActiveSound(sound);
    }
  };

  const handleToggleMute = () => {
    ensureAudioContext();
    setIsAudioMuted(!isAudioMuted);
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      if (timerMode === "focus" || timerMode === "deepStudy") {
        setCompletedSessions((prev) => prev + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  const setMode = (mode: "focus" | "shortBreak" | "longBreak" | "deepStudy") => {
    setTimerMode(mode);
    setIsRunning(false);
    if (mode === "focus") setTimeLeft(25 * 60);
    else if (mode === "shortBreak") setTimeLeft(5 * 60);
    else if (mode === "longBreak") setTimeLeft(15 * 60);
    else if (mode === "deepStudy") setTimeLeft(45 * 60);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalModeDuration =
    timerMode === "focus"
      ? 25 * 60
      : timerMode === "shortBreak"
      ? 5 * 60
      : timerMode === "longBreak"
      ? 15 * 60
      : 45 * 60;

  const progressPercent = ((totalModeDuration - timeLeft) / totalModeDuration) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-stone-900 rounded-[28px] border-2 border-[#18181b] shadow-[6px_6px_0px_#18181b] overflow-hidden flex flex-col font-sans">
      {/* Clean Minimalist Header */}
      <div className="px-5 sm:px-7 py-5 border-b-2 border-[#18181b] flex items-center justify-between bg-[#FAF8F5]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FEF08A] border-[1.5px] border-[#18181b] text-[#18181b] flex items-center justify-center shadow-[2px_2px_0px_#18181b] shrink-0">
            <Flame size={20} className="text-orange-600" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
              POMODORO &amp; BINAURAL STUDIO · WBCHSE SEM 3
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight font-serif">
              Focus Study Room
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border-[1.5px] border-[#18181b] flex items-center justify-center transition-colors cursor-pointer"
          title="Close Focus Room"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Segmented Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#FAF8F5] rounded-2xl border-[1.5px] border-[#18181b]">
          {[
            { id: "focus", label: "25m Focus", icon: <Brain size={14} /> },
            { id: "deepStudy", label: "45m Deep Study", icon: <BookOpen size={14} /> },
            { id: "shortBreak", label: "5m Short Break", icon: <Coffee size={14} /> },
            { id: "longBreak", label: "15m Recharge", icon: <Sparkles size={14} /> },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id as any)}
              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                timerMode === m.id
                  ? "bg-[#18181b] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-950 hover:bg-white"
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Two-Column Timer & Controls Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Architectural Circular Timer (6 Columns) */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-[#FAF8F5] border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex flex-col items-center justify-center">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-stone-200"
                  strokeWidth="5"
                  stroke="currentColor"
                  fill="transparent"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-[#FF7A30]"
                  strokeWidth="5.5"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  initial={false}
                  transition={{ duration: 0.4, ease: "linear" }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-4xl sm:text-5xl font-black text-stone-950 tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 mt-1">
                  {isRunning
                    ? timerMode.includes("Break")
                      ? "Recharging..."
                      : "Deep Focus Active"
                    : "Ready to Start"}
                </span>
                <span className="text-[11px] text-stone-500 mt-1 font-medium">
                  {completedSessions} {completedSessions === 1 ? "session" : "sessions"} completed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  ensureAudioContext();
                  setIsRunning(!isRunning);
                }}
                className={`px-7 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-2 border-[#18181b] ${
                  isRunning
                    ? "bg-[#FEF08A] text-stone-950 shadow-[3px_3px_0px_#18181b]"
                    : "bg-[#18181b] text-white shadow-[3px_3px_0px_#FF7A30]"
                }`}
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                <span>{isRunning ? "Pause Timer" : "Start Focus Session"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  setMode(timerMode);
                }}
                title="Reset Timer"
                className="w-12 h-12 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-colors border-2 border-[#18181b] cursor-pointer"
              >
                <RotateCcw size={17} />
              </button>
            </div>
          </div>

          {/* Right: Subject Selection, Soundscapes & Live Peers (6 Columns) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Target Exam Subject Selector */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border-[1.5px] border-[#18181b] space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500">
                Active Study Chapter (WBCHSE Class 12 Sem 3)
              </label>
              <select
                value={focusSubject}
                onChange={(e) => setFocusSubject(e.target.value)}
                className="w-full bg-white text-stone-900 text-xs font-extrabold px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#18181b] focus:outline-none cursor-pointer"
              >
                <option value="Biology (Unit I: Reproduction)">
                  Biology: Unit I (Reproduction &amp; Flowering Plants)
                </option>
                <option value="Biology (Unit II: Genetics & Evolution)">
                  Biology: Unit II (DNA, Transcription &amp; Mendel)
                </option>
                <option value="Bengali A (আদিরিনী & বাঙ্গালা ভাষা)">
                  Bengali A: আদিরিনী &amp; বাঙ্গালা ভাষা
                </option>
                <option value="Bengali A (ধর্ম & দিগ্বিজয়ের রূপকথা)">
                  Bengali A: ধর্ম &amp; দিগ্বিজয়ের রূপকথা
                </option>
                <option value="English B (The Night Train at Deoli)">
                  English B: The Night Train at Deoli (Ruskin Bond)
                </option>
                <option value="English B (Strong Roots & The Bet)">
                  English B: Strong Roots &amp; The Bet (Chekhov)
                </option>
                <option value="English B (Ulysses & Our Casuarina Tree)">
                  English B: Ulysses &amp; Our Casuarina Tree
                </option>
                <option value="English B (Riders to the Sea)">
                  English B: Riders to the Sea (J.M. Synge)
                </option>
              </select>
            </div>

            {/* Ambient Focus Soundscapes */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border-[1.5px] border-[#18181b] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-stone-900">
                  <Headphones size={16} className="text-orange-600" />
                  <span className="text-xs font-black">
                    Ambient Focus Audio (Lo-Fi &amp; 8Hz Alpha Waves)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => {
                      ensureAudioContext();
                      setSoundVolume(parseFloat(e.target.value));
                    }}
                    className="w-16 h-1.5 accent-[#18181b] cursor-pointer"
                    aria-label="Sound volume"
                  />
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-[#18181b] text-stone-800 text-[11px] flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    <span>{isAudioMuted ? "Unmute" : "Mute"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: "lofi", label: "Lo-Fi Beats", icon: "🎵" },
                  { id: "rain", label: "Monsoon Rain", icon: "🌧️" },
                  { id: "forest", label: "Zen Forest", icon: "🍃" },
                  { id: "whitenoise", label: "8Hz Alpha", icon: "🧠" },
                  { id: "none", label: "Silent", icon: "🔇" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSound(s.id as any)}
                    className={`p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                      activeSound === s.id && !isAudioMuted
                        ? "bg-[#FEF08A] border-[#18181b] text-stone-950 font-black shadow-[2px_2px_0px_#18181b]"
                        : "bg-white border-stone-200 text-stone-600 hover:border-stone-400 font-bold"
                    }`}
                  >
                    <span className="text-base">{s.icon}</span>
                    <span className="text-[10px] leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Peer Presence */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border-[1.5px] border-[#18181b] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-black text-stone-900">
                  <Users size={15} className="text-emerald-600" />
                  <span>Live Study Room Peers ({realPeers.length || 1} Active)</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">● Cloud Synced</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <div className="px-3 py-1.5 rounded-xl bg-white border border-[#18181b] shrink-0 text-left">
                  <span className="text-xs font-extrabold text-stone-900 block">
                    🎓 {userName || "Abhijit"} (You)
                  </span>
                  <span className="text-[10px] text-stone-500 font-semibold block">
                    {isRunning ? "Deep Focus" : "Ready"} · {focusSubject.split("(")[0]}
                  </span>
                </div>

                {realPeers
                  .filter(
                    (p) => p.userName !== userName && p.userId !== auth.currentUser?.uid
                  )
                  .map((peer, pIdx) => (
                    <div
                      key={peer.id || pIdx}
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 shrink-0 text-left"
                    >
                      <span className="text-xs font-bold text-stone-900 block">
                        ⚡ {peer.userName || "Student"}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        {peer.subject || peer.status || "Studying"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Mentor Voice Assistance Bar */}
        {onVoiceSync && (
          <div className="p-4 rounded-2xl bg-[#FEF08A]/45 border-[1.5px] border-[#18181b] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#18181b] text-stone-900 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-xs font-black text-stone-900">
                  Need a 1-Minute Concept Breakdown?
                </p>
                <p className="text-[11px] text-stone-600">
                  Ask your 3D AI Mentor to explain {focusSubject} aloud in Bengali &amp; English.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onVoiceSync();
              }}
              className="px-4 py-2 bg-[#18181b] hover:bg-stone-800 text-white rounded-xl text-xs font-extrabold cursor-pointer"
            >
              Talk to 3D Mentor →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
