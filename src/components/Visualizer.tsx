import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Box, Image as ImageIcon } from "lucide-react";
import mahiAvatar from "../assets/images/mahi_avatar_1780353082547.png";
import { Anjali3DViewer, AnjaliAnimationState } from "./Anjali3DViewer";

type VisualizerState = "idle" | "listening" | "processing" | "speaking";

interface VisualizerProps {
  state: VisualizerState;
  characterName: string;
  currentVisual?: string;
  expression?: string;
  onSelectExpression?: (expr: string) => void;
  anjali3DAnimation?: AnjaliAnimationState;
  onAnjaliAnimationChange?: (anim: AnjaliAnimationState) => void;
  userName?: string;
  userId?: string;
}

const MAHI_EXPRESSION_MAP: Record<string, string> = {
  greeting: "https://i.ibb.co/WWHh1m2V/hay.jpg",
  thinking: "https://i.ibb.co/Mx8HBnh3/thinking.jpg",
  studying: "https://i.ibb.co/Mx8HBnh3/thinking.jpg",
  wink: "https://i.ibb.co/fzg90pKT/wink.jpg",
  teasing: "https://i.ibb.co/fzg90pKT/wink.jpg",
  blush: "https://i.ibb.co/k6zJ0Rby/blush.jpg",
  shy: "https://i.ibb.co/k6zJ0Rby/blush.jpg",
  caring: "https://i.ibb.co/rK9HRgg5/nervous2.jpg",
  sad: "https://i.ibb.co/rK9HRgg5/nervous2.jpg",
  pout: "https://i.ibb.co/rBPqMhQ/pout.jpg",
  smirk: "https://i.ibb.co/VWnmW51k/smirk.jpg",
  heart_eyes: "https://i.ibb.co/mVMvKSpt/heart-eyes.jpg",
  starry_eyes: "https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg",
  nervous: "https://i.ibb.co/LX29jXmW/nervous1.jpg",
  angry: "https://i.ibb.co/23v3Jh0y/angry.jpg",
  hair_swirl: "https://i.ibb.co/BVSHQHBB/hair-swirl.jpg",
  default: "https://i.ibb.co/WWHh1m2V/hay.jpg",
};

export default function Visualizer({
  state,
  characterName,
  currentVisual,
  expression,
  anjali3DAnimation = "idle",
  onAnjaliAnimationChange,
  userName = "Student",
}: VisualizerProps) {
  // Default to Interactive 3D Mentor Mode for all mentors so user always gets realistic 3D interaction
  const [use3DMode, setUse3DMode] = useState<boolean>(true);
  const [displayedSrc, setDisplayedSrc] = useState<string>(() => currentVisual || mahiAvatar);

  const getTargetAvatar = () => {
    const char = characterName.toLowerCase();
    if (char === "mahi") {
      if (expression && MAHI_EXPRESSION_MAP[expression.toLowerCase()]) {
        return MAHI_EXPRESSION_MAP[expression.toLowerCase()];
      }
      return mahiAvatar;
    }
    return currentVisual || mahiAvatar;
  };

  const targetAvatar = getTargetAvatar();

  useEffect(() => {
    if (targetAvatar === displayedSrc) return;
    const img = new Image();
    img.src = targetAvatar;
    img.onload = () => setDisplayedSrc(targetAvatar);
    img.onerror = () => setDisplayedSrc(mahiAvatar);
  }, [targetAvatar, displayedSrc]);

  const formattedCharName =
    characterName.charAt(0).toUpperCase() + characterName.slice(1);

  if (use3DMode) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div className="absolute bottom-14 right-3 z-30">
          <button
            type="button"
            onClick={() => setUse3DMode(false)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border-[1.5px] border-[#18181b] text-[10px] font-black text-slate-900 shadow-[2px_2px_0px_#18181b] cursor-pointer"
            title="Switch to 2D Anime Portrait"
          >
            <ImageIcon size={11} className="text-orange-600" />
            <span>2D Anime View</span>
          </button>
        </div>

        <div className="w-full h-full">
          <Anjali3DViewer
            state={state}
            animationState={anjali3DAnimation}
            onAnimationChange={onAnjaliAnimationChange}
            characterName={formattedCharName}
            isAudioPlaying={state === "speaking"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
      <div className="absolute top-3 right-3 z-30">
        <button
          type="button"
          onClick={() => setUse3DMode(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF08A] hover:bg-amber-200 border-[1.5px] border-[#18181b] text-slate-900 text-xs font-black shadow-[2px_2px_0px_#18181b] cursor-pointer"
        >
          <Box size={13} />
          <span>Switch to Live 3D Model</span>
        </button>
      </div>

      <div className="relative w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] rounded-[32px] overflow-hidden border-2 border-[#18181b] bg-white shadow-[5px_5px_0px_#18181b] flex items-center justify-center">
        <img
          src={displayedSrc}
          alt={`${formattedCharName} Mentor`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center select-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src = mahiAvatar;
          }}
        />

        <div className="absolute bottom-3 inset-x-4 flex flex-col items-center justify-center gap-1 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border-[1.5px] border-[#18181b] shadow-xs">
            {[0.4, 0.9, 0.6, 1.0, 0.7, 0.5].map((h, i) => (
              <motion.span
                key={i}
                animate={
                  state === "speaking"
                    ? { height: [4, 14 * h, 5, 16 * h, 4] }
                    : { height: 4 }
                }
                transition={{ duration: 0.45, repeat: Infinity }}
                className="w-1 rounded-full bg-emerald-600"
              />
            ))}
            <span className="text-[10px] font-black text-slate-900 ml-1">
              {state === "speaking"
                ? `${formattedCharName} Speaking...`
                : state === "listening"
                ? `Listening to ${userName}...`
                : `${formattedCharName} Ready`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
