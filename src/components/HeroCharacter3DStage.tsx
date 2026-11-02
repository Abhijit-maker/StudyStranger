import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { voiceService } from "../services/voiceService";

interface HeroCharacter3DStageProps {
  onPlayVoiceSample?: () => void;
}

export const HeroCharacter3DStage: React.FC<HeroCharacter3DStageProps> = ({ onPlayVoiceSample }) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [faceEmotion, setFaceEmotion] = useState<"happy" | "wink" | "talking">("happy");

  // Mouse & Touch 3D tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -9; // Max 9 deg
    const rotY = ((x - centerX) / centerX) * 11; // Max 11 deg

    setRotate({ x: rotX, y: rotY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || !e.touches[0]) return;
    const rect = cardRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -6;
    const rotY = ((x - centerX) / centerX) * 8;

    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setFaceEmotion("happy");
  };

  const handleVoiceBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voicePlaying) {
      voiceService.stop();
      setVoicePlaying(false);
      setFaceEmotion("happy");
    } else {
      setVoicePlaying(true);
      setFaceEmotion("talking");
      voiceService.speak("নমস্কার! আমি তোমার WBCHSE ক্লাস ১২ সেমিস্টার ৩ স্টাডি পার্টনার। যেকোনো প্রশ্ন করতে পারো!", {
        character: "stranger",
        rate: 1.0,
        onEnd: () => {
          setVoicePlaying(false);
          setFaceEmotion("happy");
        }
      });
      if (onPlayVoiceSample) onPlayVoiceSample();
    }
  };

  return (
    <div 
      className="w-full max-w-[940px] mx-auto my-6 px-2 select-none"
      style={{ perspective: "1200px" }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseEnter={() => { setIsHovered(true); setFaceEmotion("wink"); }}
        onMouseLeave={handleMouseLeave}
        className="relative w-full rounded-[28px] md:rounded-[36px] overflow-hidden border-[2.5px] border-[#18181b] transition-transform duration-200 ease-out cursor-default"
        style={{
          background: "linear-gradient(180deg, #edf8f2 0%, #e3f2e9 100%)",
          boxShadow: isHovered 
            ? "8px 12px 0px #18181b, 0 20px 40px -15px rgba(0,0,0,0.15)" 
            : "5px 6px 0px #18181b",
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${isHovered ? "scale(1.01)" : "scale(1)"}`,
          transformStyle: "preserve-3d",
          minHeight: "360px",
          height: "auto",
        }}
      >
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#18181b 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        {/* 3D Arc illustration & Ground SVG Layer */}
        <div 
          className="w-full h-full min-h-[360px] md:min-h-[400px] flex items-center justify-center relative p-4 md:p-8"
          style={{ transform: "translateZ(10px)" }}
        >
          <svg
            viewBox="0 0 900 380"
            className="w-full h-auto max-h-[380px] pointer-events-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="50%" stopColor="#27272a" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
              <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* Soft oval ground pedestal */}
            <ellipse 
              cx="450" 
              cy="345" 
              rx="320" 
              ry="18" 
              fill="#000000" 
              opacity="0.06" 
            />

            {/* Lower smiling ground arc curve */}
            <path
              d="M 330 305 Q 450 338 570 305"
              fill="none"
              stroke="#18181b"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Main connecting arch line (connecting badges & character) */}
            <path
              d="M 190 280 Q 320 125 450 170 Q 580 215 710 270"
              fill="none"
              stroke="url(#arcGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Secondary subtle guide curve */}
            <path
              d="M 230 295 Q 450 200 670 285"
              fill="none"
              stroke="#18181b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.3"
            />

            {/* Orbit node circle (Yellow) */}
            <circle
              cx="205"
              cy="235"
              r="10"
              fill="#fff275"
              stroke="#18181b"
              strokeWidth="2.5"
            />

            {/* Floating particle dots */}
            <circle cx="680" cy="180" r="4" fill="#18181b" opacity="0.4" />
            <circle cx="280" cy="140" r="3" fill="#18181b" opacity="0.3" />
            <circle cx="620" cy="120" r="5" fill="#a7f3d0" stroke="#18181b" strokeWidth="1.5" />
          </svg>

          {/* Central Smiling Lilac 3D Character */}
          <div 
            className="absolute top-[42%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto"
            style={{ 
              transform: `translate(-50%, -50%) translateZ(${isHovered ? "45px" : "30px"})`,
              transition: "transform 0.25s ease-out"
            }}
          >
            {/* Lilac Circle Face */}
            <div 
              onClick={() => setFaceEmotion(prev => prev === "wink" ? "talking" : prev === "talking" ? "happy" : "wink")}
              title="Click to interact with Study Stranger mascot!"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-[2.8px] border-[#18181b] flex flex-col items-center justify-center relative cursor-pointer group transition-all duration-300"
              style={{
                background: "radial-gradient(circle at 35% 35%, #fae8ff 0%, #f0abfc 100%)",
                boxShadow: isHovered 
                  ? "5px 6px 0px #18181b, 0 10px 20px rgba(217, 70, 239, 0.25)" 
                  : "3.5px 4.5px 0px #18181b",
              }}
            >
              {/* Highlight gleam */}
              <div className="absolute top-2 left-4 w-4 h-2 rounded-full bg-white/70 rotate-[-25deg]" />

              {/* Eyes */}
              <div className="flex items-center gap-5 md:gap-7 mb-2">
                {faceEmotion === "wink" ? (
                  <>
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#18181b]" />
                    <div className="w-3 md:w-3.5 h-1 border-b-2 border-[#18181b] rounded-full" />
                  </>
                ) : faceEmotion === "talking" ? (
                  <>
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#18181b] animate-bounce" />
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#18181b] animate-bounce" style={{ animationDelay: "0.15s" }} />
                  </>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#18181b]" />
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#18181b]" />
                  </>
                )}
              </div>

              {/* Smiling Mouth */}
              {faceEmotion === "talking" ? (
                <div className="w-4 h-3 rounded-full bg-[#18181b] animate-pulse" />
              ) : (
                <div 
                  className="w-5 h-2.5 md:w-7 md:h-3.5 border-b-[2.6px] border-[#18181b] rounded-b-full transition-transform group-hover:scale-125" 
                />
              )}

              {/* Subtle Cheeks */}
              <div className="absolute top-[58%] left-3 w-2.5 h-1.5 md:w-3 md:h-2 rounded-full bg-pink-400/50" />
              <div className="absolute top-[58%] right-3 w-2.5 h-1.5 md:w-3 md:h-2 rounded-full bg-pink-400/50" />
            </div>
          </div>

          {/* FLOATING CARD 1: Top-Left (Flashcards) */}
          <div 
            className="absolute top-[12%] left-[4%] md:left-[9%] pointer-events-auto"
            style={{ 
              transform: `translateZ(${isHovered ? "55px" : "35px"})`,
              transition: "transform 0.25s ease-out"
            }}
          >
            <div
              onClick={() => navigate("/login")}
              className="px-3.5 py-2 md:px-4 md:py-2.5 rounded-[14px] md:rounded-[16px] border-[2px] border-[#18181b] bg-[#fff59d] cursor-pointer hover:-translate-y-1 transition-all"
              style={{
                boxShadow: isHovered ? "4px 5px 0px #18181b" : "3px 3px 0px #18181b"
              }}
            >
              <div className="text-[12px] md:text-[13px] font-black text-[#18181b] leading-tight">
                Flashcards
              </div>
              <div className="text-[10px] md:text-[11px] font-semibold text-[#18181b]/80 mt-0.5">
                ZP3 · sperm receptor
              </div>
            </div>
          </div>

          {/* FLOATING CARD 2: Bottom-Left (Voice Tutor) */}
          <div 
            className="absolute bottom-[16%] left-[6%] md:left-[14%] pointer-events-auto"
            style={{ 
              transform: `translateZ(${isHovered ? "60px" : "40px"})`,
              transition: "transform 0.25s ease-out"
            }}
          >
            <div
              onClick={handleVoiceBadgeClick}
              title="Click to hear AI Voice Mentor sample!"
              className={`px-3.5 py-2.5 md:px-5 md:py-3 rounded-[14px] md:rounded-[18px] border-[2px] border-[#18181b] bg-white cursor-pointer hover:-translate-y-1 transition-all ${
                voicePlaying ? "ring-2 ring-emerald-500 animate-pulse" : ""
              }`}
              style={{
                boxShadow: isHovered ? "4px 5px 0px #18181b" : "3px 3px 0px #18181b"
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{voicePlaying ? "🔊" : "🎙️"}</span>
                <span className="text-[12px] md:text-[13px] font-black text-[#18181b] leading-tight">
                  Voice Tutor
                </span>
                {voicePlaying && (
                  <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                    Live
                  </span>
                )}
              </div>
              <div className="text-[10px] md:text-[11px] font-semibold text-[#18181b]/70 mt-0.5">
                Stranger Dada & Mahi Didi
              </div>
            </div>
          </div>

          {/* FLOATING CARD 3: Top-Right (Live Board) */}
          <div 
            className="absolute top-[16%] right-[4%] md:right-[10%] pointer-events-auto"
            style={{ 
              transform: `translateZ(${isHovered ? "50px" : "32px"})`,
              transition: "transform 0.25s ease-out"
            }}
          >
            <div
              onClick={() => navigate("/login")}
              className="px-3.5 py-2 md:px-4 md:py-2.5 rounded-[14px] md:rounded-[16px] border-[2px] border-[#18181b] bg-[#c7f4f6] cursor-pointer hover:-translate-y-1 transition-all"
              style={{
                boxShadow: isHovered ? "4px 5px 0px #18181b" : "3px 3px 0px #18181b"
              }}
            >
              <div className="text-[12px] md:text-[13px] font-black text-[#18181b] leading-tight">
                Live Board
              </div>
              <div className="text-[10px] md:text-[11px] font-semibold text-[#18181b]/80 mt-0.5">
                Adarini · 4-point structure
              </div>
            </div>
          </div>

          {/* FLOATING CARD 4: Bottom-Right (⭐ 4.9/5 WBCHSE Prep) */}
          <div 
            className="absolute bottom-[20%] right-[6%] md:right-[15%] pointer-events-auto"
            style={{ 
              transform: `translateZ(${isHovered ? "55px" : "36px"})`,
              transition: "transform 0.25s ease-out"
            }}
          >
            <div
              onClick={() => navigate("/login")}
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-full border-[2px] border-[#18181b] bg-[#d6fa8f] cursor-pointer hover:-translate-y-1 transition-all flex items-center gap-1.5"
              style={{
                boxShadow: isHovered ? "3.5px 4px 0px #18181b" : "2.5px 2.5px 0px #18181b"
              }}
            >
              <span className="text-[11px] md:text-[12px] font-black text-[#18181b]">
                ⭐ 4.9/5 WBCHSE Prep
              </span>
            </div>
          </div>
        </div>

        {/* Footer status bar in card */}
        <div className="w-full px-5 py-2.5 bg-black/5 border-t border-[#18181b]/10 flex items-center justify-between text-[11px] font-bold text-[#18181b]/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Interactive 3D Stage • Tilt & Tap Cards</span>
          </div>
          <span className="hidden sm:inline">WBCHSE Class 12 Sem 3 • Syllabus Verified</span>
        </div>
      </div>
    </div>
  );
};
