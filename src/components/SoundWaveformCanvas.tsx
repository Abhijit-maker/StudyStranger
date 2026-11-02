import React, { useEffect, useRef } from "react";

interface SoundWaveformCanvasProps {
  appState: "idle" | "listening" | "processing" | "speaking";
  className?: string;
  height?: number;
  showStatusLabel?: boolean;
}

export const SoundWaveformCanvas: React.FC<SoundWaveformCanvasProps> = ({
  appState,
  className = "",
  height = 90,
  showStatusLabel = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    let baseTime = 0;

    const render = () => {
      baseTime += 0.025;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== h * dpr) {
        canvas.width = width * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, h);

      // Background subtle gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      bgGrad.addColorStop(1, "rgba(247, 245, 238, 0.95)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, h);

      // Grid/ruler subtle ambient lines
      ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
      ctx.lineWidth = 1;
      const centerY = h / 2;

      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Configure waveform parameters based on appState
      let primaryColor = "rgba(20, 20, 20, 0.35)";
      let secondaryColor = "rgba(20, 20, 20, 0.15)";
      let glowColor = "rgba(0, 0, 0, 0.05)";
      let speed = 0.03;
      let amp1 = 4;
      let amp2 = 2;
      let freq1 = 0.015;
      let freq2 = 0.03;

      if (appState === "listening") {
        primaryColor = "rgba(22, 163, 74, 0.95)"; // Vibrant Green
        secondaryColor = "rgba(34, 197, 94, 0.5)";
        glowColor = "rgba(34, 197, 94, 0.3)";
        speed = 0.08;
        amp1 = 26 + Math.sin(baseTime * 5) * 8;
        amp2 = 18 + Math.cos(baseTime * 4) * 6;
        freq1 = 0.022;
        freq2 = 0.045;
      } else if (appState === "processing") {
        primaryColor = "rgba(14, 165, 233, 0.95)"; // Vibrant Cyan/Blue
        secondaryColor = "rgba(168, 85, 247, 0.6)";
        glowColor = "rgba(56, 189, 248, 0.3)";
        speed = 0.05;
        amp1 = 16 + Math.sin(baseTime * 3) * 5;
        amp2 = 12 + Math.cos(baseTime * 3.5) * 4;
        freq1 = 0.03;
        freq2 = 0.055;
      } else if (appState === "speaking") {
        primaryColor = "rgba(234, 88, 12, 0.95)"; // Warm Amber/Orange
        secondaryColor = "rgba(245, 158, 11, 0.6)";
        glowColor = "rgba(251, 146, 60, 0.3)";
        speed = 0.07;
        amp1 = 28 + Math.sin(baseTime * 4.5) * 10;
        amp2 = 20 + Math.cos(baseTime * 3.8) * 7;
        freq1 = 0.02;
        freq2 = 0.04;
      }

      phase += speed;

      // Draw secondary filled fluid wave (back layer)
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let x = 0; x <= width; x += 3) {
        // Windowing envelope to taper edges smoothly
        const envelope = Math.sin((x / width) * Math.PI);
        const y = centerY + Math.sin(x * freq2 + phase * 1.3) * amp2 * envelope +
                  Math.cos(x * freq1 * 0.8 - phase) * (amp2 * 0.4) * envelope;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = secondaryColor;
      ctx.fill();

      // Draw primary glowing stroke line (front layer)
      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const envelope = Math.sin((x / width) * Math.PI);
        const y = centerY + Math.sin(x * freq1 + phase) * amp1 * envelope +
                  Math.sin(x * freq2 * 1.5 + phase * 1.5) * (amp1 * 0.4) * envelope;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.shadowColor = glowColor;
      ctx.shadowBlur = appState === "idle" ? 0 : 12;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = appState === "idle" ? 1.5 : 3;
      ctx.stroke();

      // Draw active dancing frequency particle dots when listening or speaking
      if (appState === "listening" || appState === "speaking") {
        const numDots = 8;
        for (let i = 1; i <= numDots; i++) {
          const dotX = (width / (numDots + 1)) * i;
          const envelope = Math.sin((dotX / width) * Math.PI);
          const dotY = centerY + Math.sin(dotX * freq1 + phase) * amp1 * envelope;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = primaryColor;
          ctx.fill();
        }
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [appState]);

  const getStatusText = () => {
    switch (appState) {
      case "listening":
        return {
          icon: "🎙️",
          label: "LIVE VOICE STREAMING • AI LISTENING",
          bn: "সরাসরি শুনছি—কোনো টেক্সট ছাড়াই কথা বলুন",
          color: "#16a34a",
          bg: "#dcfce7"
        };
      case "processing":
        return {
          icon: "🧠",
          label: "NEURAL REASONING • PROCESSING ANSWER",
          bn: "প্রশ্ন প্রসেস করা হচ্ছে...",
          color: "#0284c7",
          bg: "#e0f2fe"
        };
      case "speaking":
        return {
          icon: "🔊",
          label: "MENTOR SPEAKING • STREAMING AUDIO",
          bn: "মেন্টর সরাসরি কথা বলছেন",
          color: "#ea580c",
          bg: "#ffedd5"
        };
      case "idle":
      default:
        return {
          icon: "✨",
          label: "STANDBY • READY FOR LIVE VOICE",
          bn: "মাইক চাপলেই সরাসরি কথা শুরু হবে (No text intermediary)",
          color: "var(--ink)",
          bg: "var(--bg)"
        };
    }
  };

  const status = getStatusText();

  return (
    <div className={`w-full overflow-hidden rounded-[18px] border-2 border-[var(--ink)] shadow-[3px_3px_0px_var(--ink)] bg-white ${className}`}>
      {showStatusLabel && (
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--ink)] bg-[#FAFAF7] text-xs">
          <div className="flex items-center gap-2 font-bold" style={{ color: status.color }}>
            <span className="text-sm">{status.icon}</span>
            <span className="tracking-wide uppercase text-[11px] font-extrabold">{status.label}</span>
          </div>
          <span className="text-[11px] font-medium text-[var(--muted)] hidden sm:inline-block">
            {status.bn}
          </span>
        </div>
      )}
      <div className="relative w-full" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: "100%", height: "100%" }}
        />
        {/* Real-time pulsation indicator pill */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/90 border border-[var(--ink)] text-[10px] font-bold shadow-sm">
          <span
            className="w-2 h-2 rounded-full inline-block animate-pulse"
            style={{ backgroundColor: status.color }}
          />
          <span style={{ color: status.color }}>
            {appState === "idle" ? "IDLE" : appState.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SoundWaveformCanvas;
