import React from "react";
import { Bot, Sparkles, Zap, Brain } from "lucide-react";
import { motion } from "motion/react";

export interface AIMascotProps {
  state?: "idle" | "thinking" | "happy" | "speaking";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AIMascot: React.FC<AIMascotProps> = ({
  state = "idle",
  size = "md",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base"
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer pulsing ring */}
      <motion.div
        animate={{
          scale: state === "thinking" ? [1, 1.25, 1] : [1, 1.1, 1],
          opacity: state === "thinking" ? [0.6, 0.9, 0.6] : [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: state === "thinking" ? 1.2 : 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 blur-sm`}
      />

      {/* Mascot core container */}
      <div className={`relative z-10 rounded-2xl bg-slate-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 ${sizeClasses[size]}`}>
        {state === "thinking" ? (
          <Brain size={iconSizes[size]} className="animate-pulse text-pink-400" />
        ) : state === "happy" ? (
          <Sparkles size={iconSizes[size]} className="animate-spin text-amber-400" />
        ) : (
          <Bot size={iconSizes[size]} className="text-cyan-400" />
        )}
      </div>

      {/* Active status indicator dot */}
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 z-20 animate-pulse" />
    </div>
  );
};
