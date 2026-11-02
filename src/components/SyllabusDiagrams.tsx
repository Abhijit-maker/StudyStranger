import React, { useState } from "react";
import { motion } from "motion/react";
import { Info, Sparkles, CheckCircle, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface SyllabusDiagramProps {
  conceptKey: string;
  className?: string;
}

export const SyllabusDiagram: React.FC<SyllabusDiagramProps> = ({ conceptKey, className = "" }) => {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const lower = conceptKey.toLowerCase();

  // 1. Human Sperm Cell Structure (জীববিদ্যা - মানব জনন)
  if (lower.includes("sperm") || lower.includes("শুক্রাণু") || lower.includes("spermatozoon")) {
    return (
      <div className={`relative bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-4 flex flex-col items-center justify-between select-none ${className}`}>
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-indigo-500/20 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-sm font-bold text-indigo-200">মানব শুক্রাণুর গঠন (Human Sperm Cell)</h4>
            <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full font-mono">WBCHSE Sem-3</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.min(z + 0.15, 1.5))} className="p-1 text-slate-400 hover:text-white rounded bg-slate-800/60" title="Zoom In"><ZoomIn size={14}/></button>
            <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.8))} className="p-1 text-slate-400 hover:text-white rounded bg-slate-800/60" title="Zoom Out"><ZoomOut size={14}/></button>
            <button onClick={() => setZoom(1)} className="p-1 text-slate-400 hover:text-white rounded bg-slate-800/60" title="Reset Zoom"><RotateCcw size={14}/></button>
          </div>
        </div>

        {/* SVG Diagram Canvas */}
        <div className="w-full h-64 md:h-72 overflow-hidden flex items-center justify-center relative">
          <svg 
            viewBox="0 0 650 260" 
            className="w-full h-full max-h-72 transition-transform duration-300"
            style={{ transform: `scale(${zoom})` }}
          >
            <defs>
              <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <linearGradient id="acrosomeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
              <linearGradient id="midpieceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Grid Backdrop */}
            <pattern id="spermGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            <rect width="650" height="260" fill="url(#spermGrid)" />

            {/* Sperm Flagellum Tail (Sinusoidal wave) */}
            <path 
              d="M 290,130 C 340,110 390,150 440,130 C 490,110 540,150 610,130" 
              fill="none" 
              stroke="#60a5fa" 
              strokeWidth="4" 
              strokeLinecap="round"
              className="transition-all duration-300 hover:stroke-cyan-300 cursor-pointer"
              onClick={() => setActiveLabel("tail")}
            />
            {/* End piece */}
            <path d="M 610,130 Q 630,126 640,130" fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="2 2" />

            {/* Middle Piece (Mitochondrial Spiral Sheath) */}
            <rect 
              x="205" y="112" width="85" height="36" rx="10" 
              fill="url(#midpieceGrad)" 
              stroke="#fbbf24" 
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-90"
              filter="url(#glow)"
              onClick={() => setActiveLabel("midpiece")}
            />
            {/* Spiral Mitochondrial Rings */}
            {[215, 227, 239, 251, 263, 275].map((x, i) => (
              <line key={i} x1={x} y1="114" x2={x+4} y2="146" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            ))}

            {/* Neck (Centriole Region) */}
            <rect 
              x="185" y="118" width="20" height="24" rx="4" 
              fill="#94a3b8" 
              stroke="#e2e8f0" 
              strokeWidth="1.5"
              className="cursor-pointer hover:fill-slate-300"
              onClick={() => setActiveLabel("neck")}
            />
            <circle cx="195" cy="125" r="3" fill="#ef4444" />
            <circle cx="195" cy="135" r="3" fill="#3b82f6" />

            {/* Sperm Head (Nucleus + Membrane) */}
            <ellipse 
              cx="110" cy="130" rx="75" ry="42" 
              fill="url(#headGrad)" 
              stroke="#a855f7" 
              strokeWidth="2.5"
              className="cursor-pointer hover:opacity-95"
              filter="url(#glow)"
              onClick={() => setActiveLabel("head")}
            />
            {/* Haploid Chromatin Nucleus */}
            <ellipse cx="120" cy="130" rx="45" ry="28" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" opacity="0.85" />
            <text x="120" y="134" fill="#c7d2fe" fontSize="11" textAnchor="middle" fontWeight="bold">n (23 Chr)</text>

            {/* Acrosome Cap (Anterior 2/3) */}
            <path 
              d="M 35,130 C 35,95 65,88 115,88 C 90,105 90,155 115,172 C 65,172 35,165 35,130 Z" 
              fill="url(#acrosomeGrad)" 
              stroke="#fb7185" 
              strokeWidth="2"
              className="cursor-pointer hover:opacity-95"
              onClick={() => setActiveLabel("acrosome")}
            />
            <text x="65" y="134" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">ZP3</text>

            {/* Interactive Annotation Pointer Lines */}
            {/* Acrosome Pointer */}
            <line x1="60" y1="90" x2="60" y2="40" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="60" cy="40" r="4" fill="#f43f5e" />
            <text x="60" y="30" fill="#fca5a5" fontSize="12" fontWeight="bold" textAnchor="middle" className="cursor-pointer hover:underline" onClick={() => setActiveLabel("acrosome")}>
              ১. এক্রোজোম (Acrosome)
            </text>

            {/* Nucleus / Head Pointer */}
            <line x1="130" y1="88" x2="150" y2="40" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="150" cy="40" r="4" fill="#a855f7" />
            <text x="150" y="30" fill="#d8b4fe" fontSize="12" fontWeight="bold" textAnchor="middle" className="cursor-pointer hover:underline" onClick={() => setActiveLabel("head")}>
              ২. মস্তক ও নিউক্লিয়াস (Head)
            </text>

            {/* Neck Pointer */}
            <line x1="195" y1="142" x2="195" y2="215" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="195" cy="215" r="4" fill="#94a3b8" />
            <text x="195" y="230" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle" className="cursor-pointer hover:underline" onClick={() => setActiveLabel("neck")}>
              গ্রীবা ও সেন্ট্রিওল (Neck)
            </text>

            {/* Midpiece / Mitochondria Pointer */}
            <line x1="247" y1="112" x2="270" y2="40" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="270" cy="40" r="4" fill="#eab308" />
            <text x="270" y="30" fill="#fde047" fontSize="12" fontWeight="bold" textAnchor="middle" className="cursor-pointer hover:underline" onClick={() => setActiveLabel("midpiece")}>
              ৩. মধ্যখণ্ড (Mitochondria Spiral)
            </text>

            {/* Tail Pointer */}
            <line x1="440" y1="130" x2="470" y2="215" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="470" cy="215" r="4" fill="#38bdf8" />
            <text x="470" y="230" fill="#7dd3fc" fontSize="12" fontWeight="bold" textAnchor="middle" className="cursor-pointer hover:underline" onClick={() => setActiveLabel("tail")}>
              ৪. পুচ্ছ (Tail Flagellum - 9+2 Axoneme)
            </text>
          </svg>
        </div>

        {/* Dynamic Detail Card Based on Click */}
        <div className="w-full mt-2 p-3 bg-slate-900/80 rounded-xl border border-white/10 text-xs flex items-start gap-2">
          <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            {(!activeLabel || activeLabel === "acrosome") && (
              <div>
                <span className="font-bold text-rose-400">এক্রোজোম (Acrosome):</span> গলগি বস্তু রূপান্তরিত হয়ে তৈরি হয়। এতে <b>Hyaluronidase</b> ও <b>Zona Lysin</b> উৎসেচক থাকে যা ডিম্বাণুর <b>ZP3 রিসেপ্টরে</b> আবদ্ধ হয়ে জোনা পেলুসিডা ভেদ করে।
              </div>
            )}
            {activeLabel === "head" && (
              <div>
                <span className="font-bold text-purple-400">মস্তক (Head):</span> এতে হ্যাপ্লয়েড ($n=23$) ক্রোমোজোম বিশিষ্ট ঘনীভূত DNA থাকে যা পিতার জিনগত বৈশিষ্ট্য সন্তানকে দেয়।
              </div>
            )}
            {activeLabel === "neck" && (
              <div>
                <span className="font-bold text-slate-300">গ্রীবা (Neck):</span> দুটি সেন্ট্রিওল থাকে—নিকটবর্তী (Proximal) যা নিষিক্তকরণের পর জাইগোটের প্রথম মাইটোসিস বিভাজনে সাহায্য করে এবং দূরবর্তী (Distal) যা অ্যাক্সোনিম তৈরি করে।
              </div>
            )}
            {activeLabel === "midpiece" && (
              <div>
                <span className="font-bold text-yellow-400">মধ্যখণ্ড (Middle Piece):</span> সর্পিলভাবে সজ্জিত মাইটোকনড্রিয়া (Nebenkern) থাকে, যা ATP শক্তি উৎপন্ন করে শুক্রাণুর সাঁতার কাটার গতিশক্তি যোগায়।
              </div>
            )}
            {activeLabel === "tail" && (
              <div>
                <span className="font-bold text-sky-400">পুচ্ছ (Tail):</span> $9+2$ সজ্জার মাইক্রোটিউবিউল যুক্ত ফ্ল্যাজেলাম। তরল মাধ্যমে শুক্রাণুকে দ্রুত জরায়ু হয়ে ফ্যালোপিয়ান নালীতে পৌঁছাতে সাহায্য করে।
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. DNA Double Helix & Replication Fork (জীববিদ্যা - বংশগতির আণবিক ভিত্তি)
  if (lower.includes("dna") || lower.includes("replication") || lower.includes("প্রতিলিপিকরণ") || lower.includes("molecular")) {
    return (
      <div className={`relative bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-4 flex flex-col items-center justify-between select-none ${className}`}>
        <div className="w-full flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h4 className="text-sm font-bold text-cyan-200">DNA প্রতিলিপিকরণ ফর্ক (DNA Replication Fork)</h4>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full font-mono">Sem-3 Unit II</span>
          </div>
        </div>

        <div className="w-full h-64 md:h-72 overflow-hidden flex items-center justify-center relative">
          <svg viewBox="0 0 650 260" className="w-full h-full max-h-72">
            <defs>
              <linearGradient id="dnaStrand1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="dnaStrand2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            {/* Unwound Parental DNA (Left) */}
            <path d="M 30,80 Q 120,80 200,80" stroke="url(#dnaStrand1)" strokeWidth="5" fill="none" />
            <path d="M 30,180 Q 120,180 200,180" stroke="url(#dnaStrand2)" strokeWidth="5" fill="none" />

            {/* Hydrogen Base Pairs (A=T, G≡C) in double helix */}
            {[50, 80, 110, 140, 170].map((x, idx) => (
              <g key={idx}>
                <line x1={x} y1="80" x2={x} y2="180" stroke={idx % 2 === 0 ? "#10b981" : "#f59e0b"} strokeWidth="3" strokeDasharray={idx % 2 === 0 ? "4 2" : "2 2"} />
                <text x={x-8} y="70" fill="#67e8f9" fontSize="10" fontWeight="bold">{idx % 2 === 0 ? "A" : "G"}</text>
                <text x={x-8} y="198" fill="#f472b6" fontSize="10" fontWeight="bold">{idx % 2 === 0 ? "T" : "C"}</text>
              </g>
            ))}

            {/* Helicase Enzyme (Unwinding wedge) */}
            <polygon points="200,60 260,130 200,200" fill="#f97316" stroke="#ffedd5" strokeWidth="2" className="cursor-pointer" onClick={() => setActiveLabel("helicase")} />
            <text x="215" y="134" fill="#ffffff" fontSize="11" fontWeight="bold">Helicase</text>

            {/* SSB Proteins (Single-Stranded Binding Proteins) */}
            <circle cx="280" cy="55" r="10" fill="#a855f7" stroke="#fff" strokeWidth="1" onClick={() => setActiveLabel("ssb")} className="cursor-pointer" />
            <circle cx="310" cy="45" r="10" fill="#a855f7" stroke="#fff" strokeWidth="1" onClick={() => setActiveLabel("ssb")} className="cursor-pointer" />
            <circle cx="280" cy="205" r="10" fill="#a855f7" stroke="#fff" strokeWidth="1" onClick={() => setActiveLabel("ssb")} className="cursor-pointer" />
            <circle cx="310" cy="215" r="10" fill="#a855f7" stroke="#fff" strokeWidth="1" onClick={() => setActiveLabel("ssb")} className="cursor-pointer" />

            {/* Fork Strands branching out */}
            <path d="M 260,110 Q 360,60 580,30" stroke="#06b6d4" strokeWidth="4" fill="none" />
            <path d="M 260,150 Q 360,200 580,230" stroke="#ec4899" strokeWidth="4" fill="none" />

            {/* Leading Strand Synthesis (Continuous 5'->3') */}
            <path d="M 330,65 L 540,35" stroke="#22c55e" strokeWidth="4" strokeDasharray="0" fill="none" />
            {/* DNA Polymerase III */}
            <rect x="420" y="35" width="45" height="24" rx="6" fill="#10b981" stroke="#fff" strokeWidth="1.5" className="cursor-pointer" onClick={() => setActiveLabel("polymerase")} />
            <text x="442" y="51" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">Pol III</text>
            <text x="560" y="48" fill="#4ade80" fontSize="11" fontWeight="bold">Leading (5'→3')</text>

            {/* Lagging Strand Synthesis (Okazaki fragments) */}
            <path d="M 340,195 L 400,208" stroke="#eab308" strokeWidth="4" fill="none" />
            <path d="M 430,214 L 490,225" stroke="#eab308" strokeWidth="4" fill="none" />
            <text x="460" y="245" fill="#fde047" fontSize="11" fontWeight="bold" onClick={() => setActiveLabel("okazaki")} className="cursor-pointer">Okazaki Fragment</text>

            {/* 5' and 3' Labels */}
            <text x="10" y="85" fill="#38bdf8" fontSize="12" fontWeight="bold">3'</text>
            <text x="10" y="185" fill="#f472b6" fontSize="12" fontWeight="bold">5'</text>
            <text x="600" y="32" fill="#38bdf8" fontSize="12" fontWeight="bold">5'</text>
            <text x="600" y="235" fill="#f472b6" fontSize="12" fontWeight="bold">3'</text>
          </svg>
        </div>

        <div className="w-full mt-2 p-3 bg-slate-900/80 rounded-xl border border-white/10 text-xs flex items-start gap-2">
          <Sparkles size={16} className="text-cyan-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            {(!activeLabel || activeLabel === "ssb") && (
              <div>
                <span className="font-bold text-purple-400">SSB Protein:</span> Single-Stranded Binding প্রোটিন খুলে যাওয়া একক DNA সূত্রকে পুনরায় জোড়া লাগা থেকে আটকায় ও স্থিতিশীল রাখে।
              </div>
            )}
            {activeLabel === "helicase" && (
              <div>
                <span className="font-bold text-orange-400">DNA Helicase:</span> হাইড্রোজেন বন্ধন ভেঙে DNA ডাবল হেলিক্সকে প্রতিলিপিকরণ ফর্কে রূপান্তর করে।
              </div>
            )}
            {activeLabel === "polymerase" && (
              <div>
                <span className="font-bold text-emerald-400">DNA Polymerase III:</span> প্রধান প্রতিলিপিকরণ উৎসেচক যা সর্বদা $5' \to 3'$ অভিমুখে নতুন ডিঅক্সিরাইবোনিউক্লিওটাইড পলিমার গঠন করে।
              </div>
            )}
            {activeLabel === "okazaki" && (
              <div>
                <span className="font-bold text-yellow-400">ওকাজাকি খণ্ডক (Okazaki Fragments):</span> ল্যাগিং স্ট্র্যান্ডে গঠিত ছোট ছোট DNA খণ্ড যা পরে <b>DNA Ligase</b> দ্বারা যুক্ত হয়।
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Menstrual Cycle Hormonal Chart (জীববিদ্যা - রজঃচক্র)
  if (lower.includes("menstrual") || lower.includes("রজঃচক্র") || lower.includes("lh surge") || lower.includes("ovulation")) {
    return (
      <div className={`relative bg-slate-950/90 border border-rose-500/30 rounded-2xl p-4 flex flex-col items-center justify-between select-none ${className}`}>
        <div className="w-full flex items-center justify-between border-b border-rose-500/20 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <h4 className="text-sm font-bold text-rose-200">রজঃচক্রের হরমোন ও ডিম্বপাত (Menstrual Cycle & LH Surge)</h4>
            <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full font-mono">14th Day LH Peak</span>
          </div>
        </div>

        <div className="w-full h-64 md:h-72 overflow-hidden flex items-center justify-center relative">
          <svg viewBox="0 0 650 260" className="w-full h-full max-h-72">
            {/* Background Days Grid */}
            <line x1="80" y1="200" x2="600" y2="200" stroke="#475569" strokeWidth="2" />
            <line x1="80" y1="30" x2="80" y2="200" stroke="#475569" strokeWidth="2" />

            {/* Day Markers */}
            {[1, 5, 14, 21, 28].map((day, idx) => {
              const x = 80 + (day / 28) * 500;
              return (
                <g key={idx}>
                  <line x1={x} y1="30" x2={x} y2="205" stroke={day === 14 ? "#ef4444" : "#334155"} strokeWidth={day === 14 ? 2 : 1} strokeDasharray={day === 14 ? "4 4" : "2 2"} />
                  <text x={x} y="222" fill={day === 14 ? "#f87171" : "#94a3b8"} fontSize="11" fontWeight="bold" textAnchor="middle">
                    Day {day}
                  </text>
                </g>
              );
            })}

            {/* 14th Day LH Surge Curve (Huge Spike) */}
            <path 
              d="M 80,170 Q 200,165 290,140 Q 330,40 340,35 Q 350,50 380,160 Q 480,175 580,180" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="4" 
              className="cursor-pointer"
            />
            {/* FSH Curve */}
            <path 
              d="M 80,150 Q 200,145 280,130 Q 330,85 340,80 Q 360,110 400,165 Q 500,170 580,175" 
              fill="none" 
              stroke="#38bdf8" 
              strokeWidth="2.5" 
            />
            {/* Estrogen Curve (Peaks around Day 12-13) */}
            <path 
              d="M 80,180 Q 200,160 310,60 Q 340,90 380,130 Q 450,110 580,190" 
              fill="none" 
              stroke="#a855f7" 
              strokeWidth="3" 
            />
            {/* Progesterone Curve (High in Luteal Phase Day 15-28) */}
            <path 
              d="M 80,195 L 330,195 Q 400,190 460,70 Q 520,70 580,195" 
              fill="none" 
              stroke="#22c55e" 
              strokeWidth="3.5" 
            />

            {/* Callout on 14th Day LH Peak */}
            <circle cx="340" cy="35" r="6" fill="#ef4444" stroke="#fff" strokeWidth="2" className="animate-ping" />
            <circle cx="340" cy="35" r="5" fill="#ef4444" />
            <text x="340" y="22" fill="#fca5a5" fontSize="11" fontWeight="bold" textAnchor="middle">LH Surge (ডিম্বপাত / Ovulation)</text>

            {/* Legend Keys */}
            <g transform="translate(90, 40)">
              <line x1="0" y1="0" x2="16" y2="0" stroke="#ef4444" strokeWidth="3" /><text x="22" y="4" fill="#fca5a5" fontSize="10" fontWeight="bold">LH (Luteinizing Hormone)</text>
              <line x1="0" y1="18" x2="16" y2="18" stroke="#38bdf8" strokeWidth="2" /><text x="22" y="22" fill="#7dd3fc" fontSize="10" fontWeight="bold">FSH (Follicle Stimulating)</text>
              <line x1="0" y1="36" x2="16" y2="36" stroke="#a855f7" strokeWidth="2" /><text x="22" y="40" fill="#d8b4fe" fontSize="10" fontWeight="bold">Estrogen (ইস্ট্রোজেন)</text>
              <line x1="0" y1="54" x2="16" y2="54" stroke="#22c55e" strokeWidth="2" /><text x="22" y="58" fill="#86efac" fontSize="10" fontWeight="bold">Progesterone (প্রোজেস্টেরন)</text>
            </g>
          </svg>
        </div>

        <div className="w-full mt-2 p-3 bg-slate-900/80 rounded-xl border border-white/10 text-xs flex items-start gap-2">
          <CheckCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-rose-400">পরীক্ষার কমন প্রশ্ন:</span> ১৪তম দিনে পিটুইটারি নিঃসৃত <b>LH হরমোনের তীব্র বৃদ্ধি (LH Surge)</b> ঘটে, যার ফলে গ্রাফিয়ান ফলিকল বিদীর্ণ হয়ে সেকেন্ডারি ওওসাইট মুক্ত হয় (ডিম্বপাত বা Ovulation)।
          </div>
        </div>
      </div>
    );
  }

  // 4. Angiosperm Flower Anatomy & Pollination (সপুষ্পক উদ্ভিদের যৌন জনন ও পরাগযোগ)
  if (lower.includes("flower") || lower.includes("ফুল") || lower.includes("pollination") || lower.includes("পরাগযোগ") || lower.includes("geitonogamy") || lower.includes("xenogamy")) {
    return (
      <div className={`relative bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center justify-between select-none ${className}`}>
        <div className="w-full flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-sm font-bold text-emerald-200">সপুষ্পক উদ্ভিদের ফুলের গঠন ও পরাগযোগ (Flower & Pollination)</h4>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-mono">Sem-3 Unit I</span>
          </div>
        </div>

        <div className="w-full h-64 md:h-72 overflow-hidden flex items-center justify-center relative">
          <svg viewBox="0 0 650 260" className="w-full h-full max-h-72">
            <defs>
              <linearGradient id="petalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
              <linearGradient id="carpelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>

            {/* Petals (Corolla) */}
            <path d="M 240,190 C 180,120 170,50 250,50 C 300,50 300,120 325,190 Z" fill="url(#petalGrad)" opacity="0.85" />
            <path d="M 410,190 C 470,120 480,50 400,50 C 350,50 350,120 325,190 Z" fill="url(#petalGrad)" opacity="0.85" />

            {/* Thalamus Receptacle (Base) */}
            <ellipse cx="325" cy="205" rx="55" ry="18" fill="#15803d" stroke="#86efac" strokeWidth="2" />
            <rect x="318" y="215" width="14" height="40" rx="4" fill="#166534" />

            {/* Female Carpel / Pistil (Center) */}
            {/* Ovary */}
            <ellipse cx="325" cy="175" rx="30" ry="24" fill="url(#carpelGrad)" stroke="#bbf7d0" strokeWidth="2" className="cursor-pointer" onClick={() => setActiveLabel("ovary")} />
            {/* Ovule inside */}
            <circle cx="325" cy="175" r="9" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            <text x="325" y="179" fill="#854d0e" fontSize="9" fontWeight="bold" textAnchor="middle">ডি 不过 (n)</text>
            {/* Style */}
            <rect x="321" y="85" width="8" height="70" rx="3" fill="#4ade80" />
            {/* Stigma */}
            <ellipse cx="325" cy="80" rx="16" ry="10" fill="#22c55e" stroke="#fff" strokeWidth="1.5" className="cursor-pointer" onClick={() => setActiveLabel("stigma")} />
            <text x="325" y="83" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">গর্ভমুণ্ড</text>

            {/* Male Stamen (Left & Right) */}
            {/* Left Filament & Anther */}
            <path d="M 310,190 Q 230,140 210,80" stroke="#facc15" strokeWidth="3" fill="none" />
            <ellipse cx="206" cy="74" rx="12" ry="7" fill="#eab308" stroke="#fef08a" strokeWidth="1.5" transform="rotate(-30 206 74)" className="cursor-pointer" onClick={() => setActiveLabel("anther")} />
            
            {/* Right Filament & Anther */}
            <path d="M 340,190 Q 420,140 440,80" stroke="#facc15" strokeWidth="3" fill="none" />
            <ellipse cx="444" cy="74" rx="12" ry="7" fill="#eab308" stroke="#fef08a" strokeWidth="1.5" transform="rotate(30 444 74)" className="cursor-pointer" onClick={() => setActiveLabel("anther")} />

            {/* Pollen Grains flying towards stigma */}
            {[230, 260, 290].map((px, i) => (
              <circle key={i} cx={px} cy={76 - (i % 2) * 8} r="3" fill="#facc15" className="animate-pulse" />
            ))}

            {/* Pointers & Labels */}
            <line x1="200" y1="65" x2="130" y2="45" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="130" cy="45" r="3" fill="#facc15" />
            <text x="125" y="42" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="end" onClick={() => setActiveLabel("anther")} className="cursor-pointer">
              পরাগধানী (Anther - Microsporogenesis)
            </text>

            <line x1="335" y1="75" x2="480" y2="40" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="480" cy="40" r="3" fill="#4ade80" />
            <text x="490" y="44" fill="#86efac" fontSize="11" fontWeight="bold" onClick={() => setActiveLabel("stigma")} className="cursor-pointer">
              গর্ভমুণ্ড ও পরাগযোগ (Stigma)
            </text>

            <line x1="345" y1="175" x2="480" y2="175" stroke="#86efac" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="480" cy="175" r="3" fill="#86efac" />
            <text x="490" y="179" fill="#bbf7d0" fontSize="11" fontWeight="bold" onClick={() => setActiveLabel("ovary")} className="cursor-pointer">
              ডিম্বাশয় ও ডিম্বক (Ovary & Megaspore)
            </text>

            {/* Bottom info badge */}
            <rect x="50" y="220" width="240" height="26" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
            <text x="170" y="237" fill="#6ee7b7" fontSize="10" fontWeight="bold" textAnchor="middle">
              গেইটোনোগ্যামি: একই উদ্ভিদের অন্য ফুলে পরাগযোগ
            </text>
            <rect x="360" y="220" width="240" height="26" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
            <text x="480" y="237" fill="#6ee7b7" fontSize="10" fontWeight="bold" textAnchor="middle">
              জেনোগ্যামি: ভিন্ন উদ্ভিদের ফুলে পরাগযোগ
            </text>
          </svg>
        </div>

        <div className="w-full mt-2 p-3 bg-slate-900/80 rounded-xl border border-white/10 text-xs flex items-start gap-2">
          <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            {(!activeLabel || activeLabel === "stigma") && (
              <div>
                <span className="font-bold text-emerald-400">পরাগযোগ (Pollination):</span> পরাগধানী থেকে পরাগরেণু গর্ভমুণ্ডে স্থানান্তর। <b>Geitonogamy</b> কার্যত স্ব-পরাগযোগ কিন্তু জিনগতভাবে এক উদ্ভিদে ঘটে; আর <b>Xenogamy</b> ভিন্ন উদ্ভিদের মধ্যে ঘটে তাই প্রকরণ সৃষ্টি করে।
              </div>
            )}
            {activeLabel === "anther" && (
              <div>
                <span className="font-bold text-amber-400">মাইক্রোস্পোরোজেনেসিস:</span> পরাগধানীর রেনু মাতৃকোষ ($2n$) মায়োসিস বিভাজনে ৪টি হ্যাপ্লয়েড ($n$) পরাগরেণু তৈরি করে।
              </div>
            )}
            {activeLabel === "ovary" && (
              <div>
                <span className="font-bold text-green-400">মেগাস্পোরোজেনেসিস ও দ্বিনিষেক:</span> ডিম্বকের ভেতর ৮-নিউক্লিয়াস যুক্ত ভ্রূণথলী গঠিত হয়। ১টি পুংজনন নিউক্লিয়াস ডিম্বাণুকে ($2n$ জাইগোট) এবং অন্যটি নির্ণীত নিউক্লিয়াসকে ($3n$ শস্য/Endosperm) নিষিক্ত করে (দ্বিনিষেক বা Double Fertilization)।
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 5. Mendel's Monohybrid Cross (মেন্ডেলের একসংকর জনন)
  if (lower.includes("mendel") || lower.includes("মেন্ডেল") || lower.includes("punnett") || lower.includes("বংশগতি") || lower.includes("monohybrid")) {
    return (
      <div className={`relative bg-slate-950/90 border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center justify-between select-none ${className}`}>
        <div className="w-full flex items-center justify-between border-b border-purple-500/20 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <h4 className="text-sm font-bold text-purple-200">মেন্ডেলের একসংকর জনন ও পানেট স্কয়ার (Mendel's Monohybrid Cross)</h4>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full font-mono">Sem-3 Unit II</span>
          </div>
        </div>

        <div className="w-full h-64 md:h-72 overflow-hidden flex items-center justify-center relative">
          <svg viewBox="0 0 650 260" className="w-full h-full max-h-72">
            {/* P Generation (Left) */}
            <rect x="25" y="40" width="180" height="90" rx="10" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
            <text x="115" y="60" fill="#a5b4fc" fontSize="11" fontWeight="bold" textAnchor="middle">P জনু (Parental Generation)</text>
            <text x="65" y="85" fill="#4ade80" fontSize="13" fontWeight="900" textAnchor="middle">TT (লম্বা)</text>
            <text x="115" y="85" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">&times;</text>
            <text x="165" y="85" fill="#f472b6" fontSize="13" fontWeight="900" textAnchor="middle">tt (বেঁটে)</text>
            <text x="115" y="112" fill="#c7d2fe" fontSize="10" textAnchor="middle">গ্যামেট: T এবং t &rarr; F₁: Tt (সংকর লম্বা)</text>

            {/* F2 Generation Punnett Square (Center-Right) */}
            <rect x="260" y="30" width="220" height="150" rx="12" fill="#0f172a" stroke="#8b5cf6" strokeWidth="2" />
            <text x="370" y="52" fill="#c084fc" fontSize="12" fontWeight="bold" textAnchor="middle">F₂ জনু পানেট স্কয়ার (Tt &times; Tt)</text>
            
            {/* Grid Lines */}
            <line x1="330" y1="65" x2="460" y2="65" stroke="#475569" strokeWidth="1.5" />
            <line x1="330" y1="115" x2="460" y2="115" stroke="#475569" strokeWidth="1.5" />
            <line x1="330" y1="165" x2="460" y2="165" stroke="#475569" strokeWidth="1.5" />
            <line x1="330" y1="65" x2="330" y2="165" stroke="#475569" strokeWidth="1.5" />
            <line x1="395" y1="65" x2="395" y2="165" stroke="#475569" strokeWidth="1.5" />
            <line x1="460" y1="65" x2="460" y2="165" stroke="#475569" strokeWidth="1.5" />

            {/* Gamete Headers */}
            <text x="362" y="80" fill="#fde047" fontSize="13" fontWeight="bold" textAnchor="middle">T</text>
            <text x="427" y="80" fill="#fde047" fontSize="13" fontWeight="bold" textAnchor="middle">t</text>
            <text x="315" y="100" fill="#fde047" fontSize="13" fontWeight="bold" textAnchor="middle">T</text>
            <text x="315" y="148" fill="#fde047" fontSize="13" fontWeight="bold" textAnchor="middle">t</text>

            {/* Cells */}
            <rect x="331" y="83" width="63" height="31" fill="#14532d" opacity="0.6" />
            <text x="362" y="103" fill="#86efac" fontSize="12" fontWeight="900" textAnchor="middle">TT (লম্বা)</text>

            <rect x="396" y="83" width="63" height="31" fill="#14532d" opacity="0.4" />
            <text x="427" y="103" fill="#86efac" fontSize="12" fontWeight="900" textAnchor="middle">Tt (লম্বা)</text>

            <rect x="331" y="116" width="63" height="48" fill="#14532d" opacity="0.4" />
            <text x="362" y="145" fill="#86efac" fontSize="12" fontWeight="900" textAnchor="middle">Tt (লম্বা)</text>

            <rect x="396" y="116" width="63" height="48" fill="#701a75" opacity="0.6" />
            <text x="427" y="145" fill="#f472b6" fontSize="12" fontWeight="900" textAnchor="middle">tt (বেঁটে)</text>

            {/* Summary Ratios (Right) */}
            <rect x="500" y="40" width="130" height="135" rx="10" fill="#18181b" stroke="#eab308" strokeWidth="1.5" />
            <text x="565" y="62" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle">অনুপাত (Ratios)</text>
            
            <text x="565" y="88" fill="#93c5fd" fontSize="10" textAnchor="middle">ফিনোটাইপ অনুপাত:</text>
            <text x="565" y="108" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle">৩ : ১</text>
            <text x="565" y="122" fill="#86efac" fontSize="9" textAnchor="middle">(লম্বা : বেঁটে)</text>

            <text x="565" y="142" fill="#d8b4fe" fontSize="10" textAnchor="middle">জিনোটাইপ অনুপাত:</text>
            <text x="565" y="160" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">১ : ২ : ১</text>
            <text x="565" y="172" fill="#c084fc" fontSize="9" textAnchor="middle">(TT : Tt : tt)</text>
          </svg>
        </div>

        <div className="w-full mt-2 p-3 bg-slate-900/80 rounded-xl border border-white/10 text-xs flex items-start gap-2">
          <Sparkles size={16} className="text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-purple-400">পৃথকীকরণ সূত্র (Law of Segregation):</span> জননকোষ বা গ্যামেট সৃষ্টির সময় জোড়বদ্ধ বিপরীতধর্মী ফ্যাক্টর বা অ্যালিলগুলো মিশ্রিত না হয়ে পরস্পর থেকে সম্পূর্ণ পৃথক হয়ে ভিন্ন ভিন্ন গ্যামেটে প্রবেশ করে।
          </div>
        </div>
      </div>
    );
  }

  return null;
};
