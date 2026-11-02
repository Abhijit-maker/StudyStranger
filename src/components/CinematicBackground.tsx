import React from "react";
import { CharacterType } from "../services/liveService";

interface CinematicBackgroundProps {
  character?: CharacterType;
  state: "idle" | "listening" | "processing" | "speaking";
  isDarkMode?: boolean;
}

export const CinematicBackground: React.FC<CinematicBackgroundProps> = ({ state, isDarkMode = false }) => {
  if (!isDarkMode) {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#FAF9F6] contain-strict transition-colors duration-500">
        {/* Crisp Light Ivory Base with Warm Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#FFFFFF_0%,_#F8FAFC_55%,_#EEF2F6_100%)]" />

        {/* Soft Warm Ambient Pastel Glows for daytime focus */}
        <div 
          className={`absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none transform-gpu transition-all duration-700 ${
            state === "listening" ? "scale-110 opacity-40 bg-sky-300" : "scale-100 opacity-25 bg-orange-200"
          }`} 
        />

        <div 
          className={`absolute top-[20%] -right-20 w-[480px] h-[480px] rounded-full blur-[110px] pointer-events-none transform-gpu transition-all duration-700 ${
            state === "speaking" ? "scale-115 opacity-35 bg-indigo-300" : "scale-100 opacity-20 bg-amber-200"
          }`} 
        />

        <div 
          className="absolute bottom-[-10%] left-[25%] w-[520px] h-[520px] rounded-full blur-[120px] pointer-events-none transform-gpu opacity-20 bg-rose-200" 
        />

        {/* Clean Subtle Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[length:32px_32px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#090d16] contain-strict transition-colors duration-500">
      {/* Deep Obsidian / Slate Base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#090d16_60%,_#030712_100%)]" />

      {/* Dynamic Hardware-Accelerated Ambient Glows */}
      <div 
        className={`absolute -top-24 -left-24 w-[450px] h-[450px] rounded-full blur-[80px] pointer-events-none transform-gpu transition-all duration-700 ${
          state === "listening" ? "scale-110 opacity-30 bg-sky-600" : "scale-100 opacity-15 bg-sky-600"
        }`} 
      />

      <div 
        className={`absolute top-[20%] -right-20 w-[450px] h-[450px] rounded-full blur-[85px] pointer-events-none transform-gpu transition-all duration-700 ${
          state === "speaking" ? "scale-115 opacity-30 bg-indigo-600" : "scale-100 opacity-15 bg-indigo-600"
        }`} 
      />

      <div 
        className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[90px] pointer-events-none transform-gpu opacity-10 bg-amber-600" 
      />

      {state === "listening" && (
        <div 
          className="absolute top-1/3 left-1/3 w-[360px] h-[360px] rounded-full blur-[75px] pointer-events-none transform-gpu animate-pulse opacity-25 bg-emerald-500" 
        />
      )}

      {/* Lightweight Contour Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-5 text-sky-400" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <path d="M-200,100 C150,-100 400,200 900,50 C1400,-100 1600,300 2100,200" />
          <path d="M-200,200 C200,0 450,300 1000,150 C1500,0 1700,450 2100,350" />
          <path d="M-200,350 C250,150 500,450 1100,300 C1600,150 1800,600 2100,500" />
        </g>
      </svg>
    </div>
  );
};
