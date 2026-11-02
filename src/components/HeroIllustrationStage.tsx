import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { voiceService } from "../services/voiceService";

export const HeroIllustrationStage: React.FC = () => {
  const navigate = useNavigate();
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [wink, setWink] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Natural periodic blinking for the mascot
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Interactive Voice speech on click
  const handleVoiceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voicePlaying) {
      voiceService.stop();
      setVoicePlaying(false);
    } else {
      setVoicePlaying(true);
      setWink(true);
      voiceService.speak("নমস্কার! আমি তোমার WBCHSE ক্লাস ১২ সেমিস্টার ৩ লাইভ স্টাডি পার্টনার।", {
        character: "stranger",
        rate: 1.0,
        onEnd: () => {
          setVoicePlaying(false);
          setWink(false);
        }
      });
    }
  };

  // Interactive 3D mouse parallax on PC
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16; // -8deg to +8deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Touch parallax for mobile devices
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((touch.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  const handleTouchEnd = () => {
    setTilt({ x: 0, y: 0 });
  };

  const toggleWink = () => {
    setWink(prev => !prev);
    setTimeout(() => setWink(false), 1200);
  };

  return (
    <div className="w-full max-w-[940px] mx-auto my-3 sm:my-5 px-2 sm:px-4">
      {/* 
        Container replicating Screenshot_20261009_152540.jpg 
        Pastel mint backdrop, brutalist shadow, 3D perspective stage 
      */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full rounded-[24px] sm:rounded-[36px] md:rounded-[44px] overflow-hidden select-none border-[2.5px] sm:border-[3px] border-[#18181b] transition-transform duration-200 ease-out"
        style={{
          background: "#edf7f0", // Authentic pastel mint
          boxShadow: isHovered 
            ? "8px 10px 0px #18181b" 
            : "5px 6px 0px #18181b",
          transform: `perspective(900px) rotateX(${tilt.y * 0.4}deg) rotateY(${tilt.x * 0.4}deg)`,
          minHeight: "340px",
        }}
      >
        {/* Subtle Background Radial Glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.85) 0%, rgba(237,247,240,0) 70%)"
          }}
        />

        {/* Ambient Twinkling Stars / Sparkles */}
        <div className="absolute top-6 left-8 pointer-events-none text-amber-400 text-sm animate-pulse opacity-70">✦</div>
        <div className="absolute top-10 right-12 pointer-events-none text-emerald-500 text-xs animate-bounce opacity-60" style={{ animationDuration: '3s' }}>★</div>
        <div className="absolute bottom-8 left-16 pointer-events-none text-purple-400 text-xs animate-pulse opacity-60">✦</div>
        <div className="absolute bottom-12 right-20 pointer-events-none text-amber-500 text-sm animate-pulse opacity-70" style={{ animationDelay: '1s' }}>✦</div>

        {/* ================= SVG BACKGROUND CURVES & PEDESTAL ================= */}
        <svg
          viewBox="0 0 860 380"
          className="w-full h-auto min-h-[300px] sm:min-h-[340px] md:min-h-[380px] pointer-events-none block overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft oval shadow blur */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" />
            </filter>

            {/* Gradient for energy travel beam */}
            <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="1" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Ground Pedestal Shadow */}
          <ellipse 
            cx="430" 
            cy="338" 
            rx="270" 
            ry="16" 
            fill="#18181b" 
            opacity="0.08" 
          />

          {/* 2. Lower Smiling Ground Arc Line Under Character */}
          <path
            d="M 330 300 Q 430 334 530 300"
            fill="none"
            stroke="#18181b"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* 3. Main Connecting Arch Line (Left To Right) */}
          <path
            d="M 180 286 Q 315 130 430 172 Q 545 214 670 282"
            fill="none"
            stroke="#18181b"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* 4. Animated Traveling Energy Pulse Line */}
          <path
            d="M 180 286 Q 315 130 430 172 Q 545 214 670 282"
            fill="none"
            stroke="url(#beamGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            className="energy-beam"
            opacity="0.9"
          />

          {/* 5. Orbit Node with Pulsing Glow on Arch */}
          <g className="orbit-node">
            <circle cx="195" cy="248" r="14" fill="#FEF08A" opacity="0.4" />
            <circle cx="195" cy="248" r="9" fill="#FFF385" stroke="#18181b" strokeWidth="2.6" />
            <circle cx="193" cy="246" r="2.5" fill="#FFFFFF" />
          </g>

          {/* 6. Secondary Right Orbit Node */}
          <g className="orbit-node-right">
            <circle cx="640" cy="272" r="7" fill="#BAE6FD" stroke="#18181b" strokeWidth="2.4" />
          </g>
        </svg>

        {/* ================= CENTRAL LILAC SMILING CHARACTER MASCOT ================= */}
        <div 
          onClick={toggleWink}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group select-none flex flex-col items-center"
          style={{
            transform: `translate(calc(-50% + ${tilt.x * 0.6}px), calc(-50% + ${tilt.y * -0.6}px))`,
          }}
          title="Click to wink and say Hi!"
        >
          {/* Subtle mascot floating layer */}
          <div className="mascot-float relative">
            {/* Sound Wave Ripple Effect when Speaking */}
            {voicePlaying && (
              <>
                <div className="absolute -inset-4 rounded-full border-2 border-emerald-500 animate-ping opacity-40 pointer-events-none" />
                <div className="absolute -inset-8 rounded-full border border-cyan-400 animate-pulse opacity-30 pointer-events-none" />
              </>
            )}

            {/* Lilac Character Face Body */}
            <div 
              className="relative w-[86px] h-[86px] sm:w-[104px] sm:h-[104px] md:w-[114px] md:h-[114px] rounded-full border-[3px] sm:border-[3.5px] border-[#18181b] flex items-center justify-center transition-transform duration-200 group-hover:scale-108 group-active:scale-95 shadow-md"
              style={{
                background: "radial-gradient(circle at 38% 34%, #FAF0FC 0%, #F0D5F8 60%, #DFC0EA 100%)",
                boxShadow: "0 6px 16px rgba(24, 24, 27, 0.12)",
              }}
            >
              {/* Highlight Gleam Top Arch */}
              <div 
                className="absolute top-2 left-4 right-4 h-5 rounded-t-full border-t-2 border-white/80 pointer-events-none"
              />

              {/* Eyes */}
              <div className="flex items-center justify-between w-[48px] sm:w-[58px] -mt-1 sm:-mt-2">
                {/* Left Eye */}
                <div className="relative">
                  {isBlinking ? (
                    <div className="w-3 sm:w-3.5 h-1 bg-[#18181b] rounded-full" />
                  ) : (
                    <div className="w-2.5 sm:w-3.5 h-3.5 sm:h-4.5 bg-[#18181b] rounded-full relative">
                      <div className="absolute top-0.5 left-0.5 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                {/* Right Eye (Winking logic) */}
                <div className="relative">
                  {wink || isBlinking ? (
                    <svg className="w-3.5 sm:w-4 h-2.5" viewBox="0 0 16 10" fill="none">
                      <path d="M 2 3 Q 8 9 14 3" stroke="#18181b" strokeWidth="2.8" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <div className="w-2.5 sm:w-3.5 h-3.5 sm:h-4.5 bg-[#18181b] rounded-full relative">
                      <div className="absolute top-0.5 left-0.5 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>

              {/* Rosy Pink Cheeks */}
              <div className="absolute top-[52px] sm:top-[64px] left-[10px] sm:left-[14px] w-2.5 sm:w-3 h-1.5 sm:h-2 bg-pink-400/60 rounded-full" />
              <div className="absolute top-[52px] sm:top-[64px] right-[10px] sm:right-[14px] w-2.5 sm:w-3 h-1.5 sm:h-2 bg-pink-400/60 rounded-full" />

              {/* Smile Mouth */}
              <div className="absolute bottom-[20px] sm:bottom-[24px]">
                {voicePlaying ? (
                  // Animated talking mouth
                  <div className="w-3.5 sm:w-4.5 h-2.5 sm:h-3 bg-[#18181b] rounded-full animate-bounce" />
                ) : (
                  <svg className="w-5 sm:w-6 h-3" viewBox="0 0 24 12" fill="none">
                    <path d="M 3 3 Q 12 13 21 3" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </div>

            {/* Click to wave / talk hint pill */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-[#18181b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
              {voicePlaying ? "Speaking... 🔊" : "Tap me! 💬"}
            </div>
          </div>
        </div>

        {/* ================= RESPONSIVE FLOATING BRUTALIST CARDS ================= */}

        {/* --- CARD 1 (Top-Left): Flashcards (ZP3 · sperm receptor) --- */}
        <div 
          onClick={() => navigate("/login")}
          className="absolute top-3 sm:top-6 md:top-8 left-3 sm:left-6 md:left-10 z-30 card-float-1 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{
            transform: `translate(${tilt.x * -0.4}px, ${tilt.y * 0.4}px)`,
          }}
        >
          <div 
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-[14px] sm:rounded-[18px] border-[2.2px] sm:border-[2.6px] border-[#18181b] flex items-center gap-2 sm:gap-2.5"
            style={{
              background: "#fff488", // Exact soft pastel yellow
              boxShadow: "3.5px 3.5px 0px #18181b",
            }}
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#18181b] text-white flex items-center justify-center text-xs font-black shrink-0">
              ⚡
            </div>
            <div>
              <div className="text-[12px] sm:text-[13.5px] font-black text-[#18181b] tracking-tight leading-tight">
                Flashcards
              </div>
              <div className="text-[9.5px] sm:text-[10.5px] font-bold text-[#18181b]/80 leading-none mt-0.5">
                ZP3 · sperm receptor
              </div>
            </div>
          </div>
        </div>

        {/* --- CARD 2 (Bottom-Left): Voice Tutor (Stranger Dada & Mahi Didi) --- */}
        <div 
          onClick={handleVoiceClick}
          className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-3 sm:left-8 md:left-14 z-30 card-float-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{
            transform: `translate(${tilt.x * -0.3}px, ${tilt.y * -0.3}px)`,
          }}
        >
          <div 
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-[14px] sm:rounded-[18px] border-[2.2px] sm:border-[2.6px] border-[#18181b] flex items-center gap-2 sm:gap-2.5"
            style={{
              background: "#ffffff",
              boxShadow: "3.5px 3.5px 0px #18181b",
            }}
          >
            {/* Live Equalizer Animation Waveform Icon */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 border border-[#18181b] flex items-end justify-center gap-0.5 p-1 shrink-0 overflow-hidden">
              <span className={`w-1 bg-[#18181b] rounded-full ${voicePlaying ? "animate-wave-1" : "h-3"}`} style={{ height: voicePlaying ? undefined : "60%" }} />
              <span className={`w-1 bg-emerald-600 rounded-full ${voicePlaying ? "animate-wave-2" : "h-4"}`} style={{ height: voicePlaying ? undefined : "90%" }} />
              <span className={`w-1 bg-[#18181b] rounded-full ${voicePlaying ? "animate-wave-3" : "h-2"}`} style={{ height: voicePlaying ? undefined : "40%" }} />
            </div>

            <div>
              <div className="text-[12px] sm:text-[13.5px] font-black text-[#18181b] tracking-tight leading-tight flex items-center gap-1">
                Voice Tutor {voicePlaying ? "🔊" : "🎙️"}
              </div>
              <div className="text-[9.5px] sm:text-[10.5px] font-bold text-[#18181b]/75 leading-none mt-0.5">
                Stranger Dada & Mahi Didi
              </div>
            </div>
          </div>
        </div>

        {/* --- CARD 3 (Top-Right): Live Board (Adarini · 4-point structure) --- */}
        <div 
          onClick={() => navigate("/login")}
          className="absolute top-3 sm:top-7 md:top-9 right-3 sm:left-auto sm:right-6 md:right-12 z-30 card-float-3 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{
            transform: `translate(${tilt.x * 0.4}px, ${tilt.y * 0.4}px)`,
          }}
        >
          <div 
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-[14px] sm:rounded-[18px] border-[2.2px] sm:border-[2.6px] border-[#18181b] flex items-center gap-2 sm:gap-2.5"
            style={{
              background: "#c1f2f5", // Exact soft cyan
              boxShadow: "3.5px 3.5px 0px #18181b",
            }}
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#18181b] text-white flex items-center justify-center text-xs font-black shrink-0">
              📋
            </div>
            <div>
              <div className="text-[12px] sm:text-[13.5px] font-black text-[#18181b] tracking-tight leading-tight">
                Live Board
              </div>
              <div className="text-[9.5px] sm:text-[10.5px] font-bold text-[#18181b]/80 leading-none mt-0.5">
                Adarini · 4-point structure
              </div>
            </div>
          </div>
        </div>

        {/* --- CARD 4 (Bottom-Right): ⭐ 4.9/5 WBCHSE Prep Badge --- */}
        <div 
          onClick={() => navigate("/login")}
          className="absolute bottom-3 sm:bottom-7 md:bottom-9 right-3 sm:right-8 md:right-16 z-30 card-float-4 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{
            transform: `translate(${tilt.x * 0.3}px, ${tilt.y * -0.3}px)`,
          }}
        >
          <div 
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-[2.2px] sm:border-[2.6px] border-[#18181b] flex items-center gap-1.5"
            style={{
              background: "#d2f987", // Exact lime green pill
              boxShadow: "3px 3px 0px #18181b",
            }}
          >
            <span className="text-amber-500 text-xs">⭐</span>
            <span className="text-[11px] sm:text-[12px] font-black text-[#18181b] tracking-tight">
              4.9/5 WBCHSE Prep
            </span>
          </div>
        </div>
      </div>

      {/* ================= HIGH-PRECISION 60FPS CSS KEYFRAME ANIMATIONS ================= */}
      <style>{`
        /* Central Mascot 60fps organic floating */
        .mascot-float {
          animation: animMascot 4.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          will-change: transform;
        }

        /* Independent organic floating physics for each card */
        .card-float-1 {
          animation: animCard1 5.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          will-change: transform;
        }
        .card-float-2 {
          animation: animCard2 5.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite 0.6s;
          will-change: transform;
        }
        .card-float-3 {
          animation: animCard3 5.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite 0.3s;
          will-change: transform;
        }
        .card-float-4 {
          animation: animCard4 6.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite 1.1s;
          will-change: transform;
        }

        /* Orbit pulsing */
        .orbit-node {
          animation: animOrbitPulse 3.2s ease-in-out infinite;
          transform-origin: 195px 248px;
        }
        .orbit-node-right {
          animation: animOrbitPulse 3.8s ease-in-out infinite 0.8s;
          transform-origin: 640px 272px;
        }

        /* Traveling energy line */
        .energy-beam {
          stroke-dasharray: 80 400;
          animation: animBeam 4.5s linear infinite;
        }

        @keyframes animBeam {
          0% { stroke-dashoffset: 480; }
          100% { stroke-dashoffset: -480; }
        }

        @keyframes animMascot {
          0%, 100% {
            transform: translate3d(0, 0px, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -9px, 0) rotate(1.2deg);
          }
        }

        @keyframes animCard1 {
          0%, 100% {
            transform: translate3d(0, 0px, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -7px, 0) rotate(-0.8deg);
          }
        }

        @keyframes animCard2 {
          0%, 100% {
            transform: translate3d(0, 0px, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -6px, 0) rotate(0.6deg);
          }
        }

        @keyframes animCard3 {
          0%, 100% {
            transform: translate3d(0, 0px, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -8px, 0) rotate(0.8deg);
          }
        }

        @keyframes animCard4 {
          0%, 100% {
            transform: translate3d(0, 0px, 0);
          }
          50% {
            transform: translate3d(0, -5px, 0);
          }
        }

        @keyframes animOrbitPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        /* Sound equalizer wave bars */
        .animate-wave-1 {
          animation: animWave 0.6s ease-in-out infinite alternate;
        }
        .animate-wave-2 {
          animation: animWave 0.8s ease-in-out infinite alternate 0.2s;
        }
        .animate-wave-3 {
          animation: animWave 0.5s ease-in-out infinite alternate 0.1s;
        }

        @keyframes animWave {
          0% { height: 25%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
};
