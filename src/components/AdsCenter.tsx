import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Tv, 
  Sparkles, 
  Gift, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Coins, 
  Volume2, 
  VolumeX, 
  X,
  Play,
  Lock,
  Compass,
  Trophy,
  ExternalLink
} from "lucide-react";

interface AdsCenterProps {
  isOpen: boolean;
  onClose: () => void;
  userPoints: number;
  premiumUnlocked: boolean;
  onUpdatePoints: (earned: number) => Promise<void>;
  onUnlockPremium: () => Promise<void>;
  userName: string;
}

interface SponsorAd {
  id: string;
  sponsor: string;
  title: string;
  reward: number;
  duration: number; // in seconds
  description: string;
  image: string;
  question: string;
  options: string[];
  correctIndex: number;
  successMessage: string;
}

const SPONSORS_ADS: SponsorAd[] = [
  {
    id: "chhaya_biology",
    sponsor: "Chhaya Prakashani (ছায়া প্রকাশনী)",
    title: "Class 12 Semester 3 Biology Master Guide",
    reward: 50,
    duration: 10,
    description: "Prepare effortlessly with our MCQ Blueprint. Clear biological graphics for Reproduction & Genetics.",
    image: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=300",
    question: "Which pathogen causes Syphilis?",
    options: ["Treponema pallidum", "HIV", "Chlamydia trachomatis", "Plasmodium falciparum"],
    correctIndex: 0,
    successMessage: "Correct! Treponema pallidum causes Syphilis. You've earned +50 points!"
  },
  {
    id: "ray_martin_english",
    sponsor: "Ray & Martin Co.",
    title: "English B Questionnaire Companion",
    reward: 50,
    duration: 10,
    description: "Master 'The Bet' by Anton Chekhov and Tennyson's 'Ulysses' with 1000+ interactive practice MCQs.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=300",
    question: "What was the wager in Chekhov's story 'The Bet'?",
    options: ["1 million rubles for 10 years", "2 million rubles for 15 years", "500,000 rubles for 5 years", "10 million rubles for 20 years"],
    correctIndex: 1,
    successMessage: "Correct! The lawyer bet 15 years of imprisonment for 2 million rubles. +50 points!"
  },
  {
    id: "santi_bengali_eleph",
    sponsor: "Santi Publishers (শান্তি পাবলিশার্স)",
    title: "Bengali 'Adarini' Prose Guide",
    reward: 50,
    duration: 10,
    description: "Read 'Adarini' by Prabhat Kumar Mukhopadhyay with precise wordbook definitions and deep annotations.",
    image: "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&q=80&w=300",
    question: "What was the purchase price of the elephant Adarini in the story?",
    options: ["1000 rupees", "1500 rupees", "2000 rupees", "3000 rupees"],
    correctIndex: 2,
    successMessage: "Correct! Jayram Mokhtar paid 2000 rupees for the elephant Adarini. +50 points!"
  },
  {
    id: "board_mcq_genius",
    sponsor: "WBCHSE Mock Prep Board",
    title: "Speed Blitz Online MCQ Series",
    reward: 50,
    duration: 10,
    description: "Get immediate insights. Track your topic accuracy and view comparative mock exams dashboards.",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=300",
    question: "On which day of the menstrual cycle does LH Surge typically occur?",
    options: ["1st day", "7th day", "14th day", "28th day"],
    correctIndex: 2,
    successMessage: "Correct! LH Surge occurs on the 14th day of the cycle. +50 points!"
  }
];

// Adsterra Dynamic Banner A (Container-based)
const AdsterraBannerA: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const adContainer = document.createElement("div");
    adContainer.id = "container-81400440586e371af5392dbbaadf2875";
    containerRef.current.appendChild(adContainer);

    const script = document.createElement("script");
    script.src = "https://pl29660586.effectivecpmnetwork.com/81400440586e371af5392dbbaadf2875/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="p-3 bg-white border border-[#CBD5E1]/30 rounded-2xl shadow-inner flex flex-col items-center justify-center min-h-[90px] w-full overflow-hidden">
      <span className="text-[8px] font-mono font-bold text-[#EF6D2F] mb-1 tracking-wider uppercase bg-orange-50 px-2 py-0.5 rounded">ADSTERRA NATIVE BANNER (CONTAINER)</span>
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
};

// Adsterra Dynamic Banner B (atOptions iframe-based)
const AdsterraBannerB: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    // Configure the options required by Adsterra's invoke.js
    (window as any).atOptions = {
      'key' : '33e25dc1ccfefb623f67d1f7b59114d9',
      'format' : 'iframe',
      'height' : 60,
      'width' : 468,
      'params' : {}
    };

    const script = document.createElement("script");
    script.src = "https://www.highperformanceformat.com/33e25dc1ccfefb623f67d1f7b59114d9/invoke.js";
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="p-3 bg-white border border-[#CBD5E1]/30 rounded-2xl shadow-inner flex flex-col items-center justify-center min-h-[90px] w-full overflow-hidden">
      <span className="text-[8px] font-mono font-bold text-[#EF6D2F] mb-1 tracking-wider uppercase bg-orange-50 px-2 py-0.5 rounded">ADSTERRA STANDARD 468X60 BANNER</span>
      <div ref={containerRef} className="w-full flex justify-center overflow-x-auto" />
    </div>
  );
};

export const AdsCenter: React.FC<AdsCenterProps> = ({
  isOpen,
  onClose,
  userPoints,
  premiumUnlocked,
  onUpdatePoints,
  onUnlockPremium,
  userName
}) => {
  const [activeAd, setActiveAd] = useState<SponsorAd | null>(null);
  const [adSecondsRemaining, setAdSecondsRemaining] = useState(0);
  const [adCompleting, setAdCompleting] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Daily Reward state
  const [dailyClaimedToday, setDailyClaimedToday] = useState(false);
  const [timeUntilNextDaily, setTimeUntilNextDaily] = useState("");

  const countdownIntervalRef = useRef<any>(null);

  // Load background Adsterra social & utility scripts when Open
  useEffect(() => {
    if (!isOpen) return;

    const backgroundUrls = [
      "https://pl29660585.effectivecpmnetwork.com/42/85/ff/4285ff9aea78589126ca9578d8dd8654.js",
      "https://pl29660587.effectivecpmnetwork.com/58/5a/7e/585a7ec1cd7b434bcdfb8aa28f1dbddc.js"
    ];

    const elements: HTMLScriptElement[] = [];

    backgroundUrls.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
        elements.push(script);
      }
    });

    return () => {
      elements.forEach(script => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      });
    };
  }, [isOpen]);

  useEffect(() => {
    // Check local storage for daily reward timing
    const lastDailyStr = localStorage.getItem(`lastDailyClaim_${userName}`);
    if (lastDailyStr) {
      const lastDaily = parseInt(lastDailyStr, 10);
      const now = Date.now();
      const difference = now - lastDaily;
      const hours24 = 24 * 60 * 60 * 1000;
      if (difference < hours24) {
        setDailyClaimedToday(true);
        // compute remaining time
        const updateTimer = () => {
          const currentNow = Date.now();
          const rem = hours24 - (currentNow - lastDaily);
          if (rem <= 0) {
            setDailyClaimedToday(false);
            setTimeUntilNextDaily("");
          } else {
            const h = Math.floor(rem / (1000 * 60 * 60));
            const m = Math.floor((rem % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((rem % (1000 * 60)) / 1000);
            setTimeUntilNextDaily(`${h}h ${m}m ${s}s`);
          }
        };
        updateTimer();
        const dailyInterval = setInterval(updateTimer, 1000);
        return () => clearInterval(dailyInterval);
      } else {
        setDailyClaimedToday(false);
      }
    }
  }, [dailyClaimedToday, isOpen, userName]);

  // Audio helper context
  const playSound = (type: "tick" | "success" | "error" | "daily") => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (type === "tick") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          gain.gain.setValueAtTime(0.02, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } else if (type === "success") {
          // Play ascending chord
          const notes = [261.63, 329.63, 392.00, 523.25];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
            gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + idx * 0.08 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.08);
            osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
          });
        } else if (type === "daily") {
          // Play a joyful ring
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          const gain2 = ctx.createGain();
          osc1.frequency.setValueAtTime(440, ctx.currentTime);
          osc2.frequency.setValueAtTime(554.37, ctx.currentTime);
          gain1.gain.setValueAtTime(0.1, ctx.currentTime);
          gain2.gain.setValueAtTime(0.1, ctx.currentTime);
          gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc1.connect(gain1);
          osc2.connect(gain2);
          gain1.connect(ctx.destination);
          gain2.connect(ctx.destination);
          osc1.start();
          osc2.start();
          osc1.stop(ctx.currentTime + 0.82);
          osc2.stop(ctx.currentTime + 0.82);
        } else if (type === "error") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.32);
        }
      }
    } catch (e) {
      console.warn("Audio Context init warning in Ad player", e);
    }
  };

  const handleClaimDailyReward = async () => {
    if (dailyClaimedToday) return;
    playSound("daily");
    await onUpdatePoints(100);
    localStorage.setItem(`lastDailyClaim_${userName}`, Date.now().toString());
    setDailyClaimedToday(true);
  };

  const handleStartAd = (ad: SponsorAd) => {
    setActiveAd(ad);
    setAdSecondsRemaining(ad.duration);
    setAdCompleting(false);
    setShowQuestion(false);
    setSelectedOptionIndex(null);
    setQuizPassed(null);

    // Track active ticks
    countdownIntervalRef.current = setInterval(() => {
      setAdSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          playSound("success");
          setShowQuestion(true);
          return 0;
        }
        playSound("tick");
        return prev - 1;
      });
    }, 1000);
  };

  const handleSelectOption = (idx: number) => {
    if (!activeAd) return;
    setSelectedOptionIndex(idx);
    const passed = idx === activeAd.correctIndex;
    setQuizPassed(passed);
    if (passed) {
      playSound("success");
      onUpdatePoints(activeAd.reward);
    } else {
      playSound("error");
    }
  };

  const handleCloseAdPlayer = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setActiveAd(null);
  };

  const handleUnlockPremiumStudyPass = async () => {
    if (userPoints < 500) return;
    playSound("daily");
    await onUnlockPremium();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[140] bg-zinc-950/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-[#FCFAF7] border border-[#CBD5E1]/30 rounded-[2.5rem] overflow-hidden p-6 md:p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Tv size={20} className="text-[#EF6D2F]" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#EF6D2F] uppercase">SPONSORS & FREE REWARDS</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Study Ad-vantage Station <Sparkles size={18} className="text-amber-500 fill-amber-500" />
              </h2>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200/50 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto pr-1">
            
            {/* Left Column: Account, Daily Rewards and Unlock Premium */}
            <div className="md:col-span-5 flex flex-col gap-4">
              
              {/* Account Card */}
              <div className="p-4 bg-white border border-[#CBD5E1]/40 rounded-3xl shadow-sm flex flex-col gap-2.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#EF6D2F]/5 blur-xl rounded-full" />
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Your Account Wallet</span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Accrued Points</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Coins size={16} className="text-amber-500" />
                      <span className="text-2xl font-black text-[#2E2520] tracking-tight">{userPoints}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Status</span>
                    {premiumUnlocked ? (
                      <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold tracking-wide px-2.5 py-0.5 rounded-full mt-1 inline-block animate-pulse">
                        ⭐ PREMIUM
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
                        Free Tier
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Daily Reward claim */}
              <button
                onClick={handleClaimDailyReward}
                disabled={dailyClaimedToday}
                className={`w-full text-left p-4 rounded-3xl border transition-all flex items-center justify-between group relative overflow-hidden ${
                  dailyClaimedToday 
                    ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed" 
                    : "bg-white border-[#F2DAC9] hover:border-[#EF6D2F] cursor-pointer shadow-sm hover:shadow-md"
                }`}
              >
                {!dailyClaimedToday && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#EF6D2F]/5 blur-lg rounded-full group-hover:scale-125 transition-transform" />
                )}
                
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                    dailyClaimedToday ? "bg-slate-100 text-slate-400" : "bg-[#FFF6F0] text-[#EF6D2F] group-hover:bg-[#EF6D2F] group-hover:text-white"
                  }`}>
                    <Gift size={20} className={dailyClaimedToday ? "" : "animate-bounce"} />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-800">Daily Class Bonus</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {dailyClaimedToday ? `Come back in ${timeUntilNextDaily}` : "Immediate +100 points reward"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {dailyClaimedToday ? (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      Claimed <CheckCircle2 size={12} className="text-emerald-500" />
                    </span>
                  ) : (
                    <span className="text-xs font-black text-[#EF6D2F] uppercase bg-[#FFF6F0] px-2.5 py-1 rounded-lg tracking-widest group-hover:bg-[#EF6D2F] group-hover:text-white transition-all">
                      CLAIM
                    </span>
                  )}
                </div>
              </button>

              {/* Unlock Premium */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col gap-3 text-white relative overflow-hidden">
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-black text-indigo-400 uppercase tracking-widest">EXCLUSIVE ACCESS</span>
                    <h3 className="text-sm font-black mt-0.5">Premium Study Pass</h3>
                  </div>
                  <Lock size={14} className="text-indigo-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Unlock double-speed analytical phone connections, direct doubt solver questions, and Advanced Concept charts.
                </p>
                
                <button
                  disabled={premiumUnlocked || userPoints < 500}
                  onClick={handleUnlockPremiumStudyPass}
                  className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    premiumUnlocked 
                      ? "bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/30"
                      : userPoints >= 500 
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hover:shadow-lg shadow-indigo-600/30"
                        : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                  }`}
                >
                  {premiumUnlocked ? (
                    <>UNLOCKED FOR FOREVER! ✨</>
                  ) : (
                    <>
                      Unlock for 500 PTS 
                      <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">
                        {userPoints}/500
                      </span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Right Column: Sponsored MCQ Practice Ads cards */}
            <div className="md:col-span-7 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Select an Ad from WBCHSE Sponsors to Earn Points:
              </span>
              
              <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                {SPONSORS_ADS.map((ad) => (
                  <div
                    key={ad.id}
                    className="p-3 bg-white border border-[#CBD5E1]/30 hover:border-[#EF6D2F]/40 rounded-2xl flex items-center gap-3 transition-colors shadow-sm group"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 border border-slate-100 bg-slate-50">
                      <img src={ad.image} alt={ad.sponsor} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute bottom-1 right-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                        +{ad.reward}p
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[9px] font-mono tracking-wide text-[#EF6D2F] font-bold truncate">
                          {ad.sponsor}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 font-semibold flex items-center gap-0.5 shrink-0">
                          <Clock size={8} /> {ad.duration}s ad
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                        {ad.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate leading-relaxed">
                        {ad.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartAd(ad)}
                      className="p-2.5 bg-[#FFF6F0] text-[#EF6D2F] hover:bg-[#EF6D2F] hover:text-white rounded-xl transition-all flex items-center justify-center shrink-0 border border-transparent cursor-pointer"
                    >
                      <Play size={14} className="fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Adsterra Dynamic Integration Testbed */}
            <div className="col-span-12 border-t border-dashed border-[#CBD5E1]/60 pt-5 mt-2 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">ADSTERRA HIGH-CPM LIVE STATIONS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* 1. Direct Booster Link Card */}
                <div className="md:col-span-12 p-4 bg-amber-50/60 border border-amber-200/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left space-y-1">
                    <span className="text-[9px] font-mono font-black text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded uppercase tracking-wider">High CPM Booster</span>
                    <h4 className="text-xs font-black text-slate-800">Direct Sponsor Ad Booster (স্পন্সর ডিরেক্ট লিংক)</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Click to unlock and support the high speed servers. Earn immediate +100 points on load.</p>
                  </div>
                  <a
                    href="https://www.effectivecpmnetwork.com/geiqexyer?key=e1f4a1e571d2f0b707e81f91f3903f70"
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    onClick={() => {
                      onUpdatePoints(100);
                      playSound("daily");
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#EF6D2F] to-amber-500 hover:from-[#e05e20] hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 text-center shrink-0 cursor-pointer shadow-sm active:scale-95 hover:shadow"
                  >
                    Load Sponsored Link <ExternalLink size={12} />
                  </a>
                </div>

                {/* 2. Banner Containers side-by-side */}
                <div className="md:col-span-6">
                  <AdsterraBannerA />
                </div>
                <div className="md:col-span-6">
                  <AdsterraBannerB />
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#E2E8F0] text-[10px] text-slate-400">
            <span className="font-medium">WBCHSE Board Partnered Ads Network</span>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center gap-1 text-[#EF6D2F] font-bold"
            >
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              {isMuted ? "Muted" : "Sound ON"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Ads Player Overlay (Starts when user presses play) */}
      <AnimatePresence>
        {activeAd && (
          <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden p-6 text-white flex flex-col gap-6 shadow-2xl relative"
            >
              {/* Force watch alert check */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#EF6D2F] font-bold">
                    Partner Sponsor Ad Stream
                  </span>
                </div>
                {!showQuestion && (
                  <span className="text-xs bg-white/5 px-2.5 py-1 rounded-xl text-zinc-400 text-[10px] font-mono">
                    Must watch to end call
                  </span>
                )}
                {showQuestion && (
                  <button 
                    onClick={handleCloseAdPlayer}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Ad Viewport / Video Simulation */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/5 flex items-center justify-center">
                <img 
                  src={activeAd.image} 
                  alt={activeAd.title} 
                  className={`absolute inset-0 w-full h-full object-cover opacity-35 filter ${!showQuestion ? 'blur-sm brightness-75 scale-102 transition-all' : ''}`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent" />

                {/* Left Side: Countdown Circle */}
                {!showQuestion ? (
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 border-t-orange-500 flex items-center justify-center animate-spin" />
                    <div className="absolute inset-0 top-0 left-0 flex items-center justify-center mb-6">
                      <span className="text-xl font-mono font-black">{adSecondsRemaining}s</span>
                    </div>
                    <span className="text-xs font-bold tracking-wider text-center max-w-[280px]">
                      Loading "{activeAd.sponsor}" syllabus preview...
                    </span>
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 z-10 bg-emerald-500 text-zinc-950 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <CheckCircle2 size={10} /> Ad Finished! Complete questions below
                  </div>
                )}

                {/* Bottom sponsor label */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className="text-[10px] bg-[#EF6D2F] text-white px-2 py-0.5 rounded font-mono font-black uppercase">AD SPONSOR</span>
                  <p className="text-xs font-black tracking-wide mt-1 drop-shadow">{activeAd.sponsor}</p>
                </div>
              </div>

              {/* Descriptions & sponsor detail info */}
              <div className="space-y-2">
                <h3 className="text-sm font-black text-white">{activeAd.title}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  {activeAd.description}
                </p>
              </div>

              {/* Sponsor Validation MCQ Question Zone */}
              {showQuestion && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-zinc-950 rounded-2xl border border-white/5 space-y-3"
                >
                  <div className="flex items-center gap-1 text-[#EF6D2F] text-[9px] font-mono uppercase tracking-widest font-black">
                    <Compass size={12} /> sponsor check-question / স্পন্সর প্রশ্ন
                  </div>
                  <h4 className="text-xs font-extrabold text-white">
                    {activeAd.question}
                  </h4>

                  <div className="flex flex-col gap-2">
                    {activeAd.options.map((option, idx) => {
                      const isSelected = selectedOptionIndex === idx;
                      const isCorrect = idx === activeAd.correctIndex;
                      
                      let optionBg = "bg-white/5 hover:bg-white/10 border-white/5";
                      if (selectedOptionIndex !== null) {
                        if (idx === activeAd.correctIndex) {
                          optionBg = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                        } else if (isSelected && !isCorrect) {
                          optionBg = "bg-rose-500/20 border-rose-500 text-rose-400 font-bold";
                        } else {
                          optionBg = "bg-white/5 border-white/5 text-zinc-500 pointer-events-none";
                        }
                      }

                      return (
                        <button
                          key={`ad-opt-${activeAd.id}-${idx}`}
                          disabled={selectedOptionIndex !== null}
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer flex items-center justify-between ${optionBg}`}
                        >
                          <span>{option}</span>
                          {selectedOptionIndex !== null && idx === activeAd.correctIndex && (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Message Alert after answering */}
                  {quizPassed === true && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 font-bold flex items-center gap-2">
                      <CheckCircle2 size={14} className="shrink-0" />
                      <div>
                        <span>{activeAd.successMessage}</span>
                        <button 
                          onClick={handleCloseAdPlayer} 
                          className="block text-[#EF6D2F] font-black underline mt-2 uppercase tracking-wide cursor-pointer"
                        >
                          Awesome, back to station
                        </button>
                      </div>
                    </div>
                  )}

                  {quizPassed === false && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-bold flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0 animate-bounce" />
                      <div>
                        <span>Oops, that's incorrect! Watch again to learn and get points.</span>
                        <button 
                          onClick={() => handleStartAd(activeAd)} 
                          className="block text-[#EF6D2F] font-black underline mt-2 uppercase tracking-wide cursor-pointer text-left"
                        >
                          Retry Watching Ad
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
