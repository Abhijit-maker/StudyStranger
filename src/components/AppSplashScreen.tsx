import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Volume2, VolumeX, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import { soundEffects } from "../services/soundEffectsService";

interface AppSplashScreenProps {
  onComplete?: () => void;
  statusText?: string;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onComplete,
  statusText = "Loading WBCHSE Sem 3 Engine..."
}) => {
  const [progress, setProgress] = useState(15);
  const [currentStage, setCurrentStage] = useState(0);
  const [isMuted, setIsMuted] = useState(() => soundEffects.isMuted());
  const [hasInteracted, setHasInteracted] = useState(false);

  const stages = [
    { title: "🚀 সিকিউর কোর ইনিশিয়ালাইজেশন...", desc: "Initializing High-Speed Quantum Engine" },
    { title: "🧬 WBCHSE ক্লাস ১২ সিলেবাস লোড হচ্ছে...", desc: "Loading Biology, Bengali A & English B" },
    { title: "🤖 AI মেন্টর ও ডাউট সলভার সিঙ্ক হচ্ছে...", desc: "Syncing Gemini AI & Realtime Knowledge Base" },
    { title: "✨ Study Stranger প্রস্তুত!", desc: "Welcome to Study Stranger: Learn • Ask • Grow" },
  ];

  useEffect(() => {
    // Attempt to play startup chime
    soundEffects.playStartupChime();

    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 14) + 6;
        return next > 98 ? 98 : next;
      });
    }, 280);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    return () => {
      clearInterval(interval);
      clearInterval(stageInterval);
    };
  }, []);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    setHasInteracted(true);
    if (!muted) {
      soundEffects.playStartupChime();
    }
  };

  const handleScreenClick = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      if (!isMuted) {
        soundEffects.playStartupChime();
      }
    }
  };

  return (
    <div 
      onClick={handleScreenClick}
      className="fixed inset-0 z-[999] min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden font-sans bg-notebook-subtle transition-colors duration-700"
    >
      {/* Handcrafted Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')]" />

      {/* Atmospheric Background Glows (Subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-20 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span className="text-[10px] font-black tracking-[0.2em] text-stone-600 dark:text-orange-300 uppercase pl-[0.2em]">
            WBCHSE Sem 3 Engine
          </span>
        </div>

        <button
          onClick={handleToggleSound}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/50 dark:bg-stone-900/50 hover:bg-white dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-[10px] font-black uppercase tracking-widest text-stone-600 dark:text-stone-300 transition-all active:scale-95 cursor-pointer"
        >
          {isMuted ? (
            <>
              <VolumeX size={14} className="text-rose-500" />
              <span>Muted</span>
            </>
          ) : (
            <>
              <Volume2 size={14} className="text-orange-500" />
              <span>Sound On</span>
            </>
          )}
        </button>
      </div>

      {/* Center Logo & Branding */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full max-w-sm">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          {/* Subtle Decorative Borders */}
          <div className="absolute inset-0 rounded-[3rem] border border-stone-200 dark:border-stone-800 rotate-6 scale-105" />
          <div className="absolute inset-0 rounded-[3rem] border border-orange-500/20 -rotate-3" />
          
          {/* Main Logo Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-40 h-40 sm:w-44 sm:h-44 rounded-[2.8rem] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-1 shadow-2xl flex items-center justify-center group"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-cover rounded-[2.5rem]"
              onError={(e) => (e.target as HTMLElement).setAttribute("src", "/app-logo.png")}
            />
          </motion.div>

          {/* Floating Accents */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-2 z-20 px-3 py-1.5 rounded-xl bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/30"
          >
            AI Mentor
          </motion.div>
        </div>

        {/* Brand Title */}
        <div className="mt-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-stone-950 dark:text-white stranger-text-editorial">
            Study Stranger
          </h1>
          <div className="h-px w-12 bg-orange-500 mx-auto opacity-50" />
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-500 dark:text-stone-500 pl-[0.4em]">
            Learn • Ask • Grow
          </p>
        </div>

        {/* Dynamic Multi-Stage Status */}
        <div className="mt-12 w-full max-w-[280px] space-y-4">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] px-1">
            <span className="text-orange-500 flex items-center gap-2">
              <Zap size={12} className="animate-pulse" />
              {stages[currentStage].title}
            </span>
            <span className="text-stone-400 font-mono">{progress}%</span>
          </div>

          <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-orange-500"
              style={{ width: `${progress}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>

          <p className="text-[10px] text-center text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">
            {stages[currentStage].desc}
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-20 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-400">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>WBCHSE SEM 3 SECURE</span>
        </div>

        {onComplete && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(); }}
            className="px-5 py-2.5 rounded-2xl stranger-btn-human text-[10px] flex items-center gap-2"
          >
            <span>Proceed to Lab</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
