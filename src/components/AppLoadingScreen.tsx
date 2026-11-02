import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Bot, Sparkles } from "lucide-react";

interface AppLoadingScreenProps {
  onFinish?: () => void;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  onFinish
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    if (onFinish) onFinish();
  };

  return (
    <div 
      onClick={handleSkip}
      className="fixed inset-0 z-[9999] min-h-[100dvh] w-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans cursor-pointer transition-colors duration-700 bg-notebook-subtle"
    >
      {/* Handcrafted Noise Overlay (Inherited via body, but adding local for safety if portal) */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')]" />

      {/* Centerpiece Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-10">
        
        <div className="relative">
          {/* Elegant Square Lockup */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2.5rem] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl flex items-center justify-center overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot size={42} className="text-orange-500 stroke-[1.5]" />
          </motion.div>

          {/* Decorative Sparkle */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 180],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-2 -right-2 text-amber-500"
          >
            <Sparkles size={20} />
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl font-black tracking-[0.2em] text-stone-900 dark:text-white uppercase pl-[0.2em] stranger-text-editorial"
          >
            Study Stranger
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-px bg-orange-500 mx-auto"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 pl-[0.3em]"
          >
            Preparing your session
          </motion.p>
        </div>
      </div>

      {/* Subtle Bottom Attribution */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-600">
          Handcrafted for WBCHSE Class 12
        </p>
      </div>
    </div>
  );
};
