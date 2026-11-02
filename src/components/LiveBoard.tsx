import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PenTool as BoardIcon, 
  Eraser, 
  Image as ImageIcon, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  FileDown, 
  RotateCcw, 
  X, 
  Layers, 
  RefreshCw, 
  Cpu, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Eye,
  Volume2,
  VolumeX,
  Palette,
  Type,
  Highlighter,
  BookOpen,
  CheckCircle2,
  Flame,
  Link as LinkIcon,
  Search,
  Sun,
  Moon,
  Zap,
  Play,
  Check,
  StickyNote,
  Globe,
  Contrast,
  FileImage,
  ArrowUp,
  ArrowDown,
  Bot,
  Calculator,
  Camera
} from "lucide-react";
import jsPDF from "jspdf";
import { domToPng } from 'modern-screenshot';
import { SyllabusDiagram } from "./SyllabusDiagrams";
import { MathText } from "./MathText";
import { soundEffects } from "../services/soundEffectsService";
import "katex/dist/katex.min.css";

export interface BoardElement {
  id: string;
  type: "text" | "image";
  content: string;
  timestamp: number;
}

export type BoardThemeId = "whiteboard" | "cyber" | "chalkboard" | "sunset" | "studio";

interface BoardThemeConfig {
  id: BoardThemeId;
  name: string;
  nameBn: string;
  icon: string;
  bgGradient: string;
  surfaceBg: string;
  cardBg: string;
  cardBorder: string;
  headerBorder: string;
  accentText: string;
  accentGlow: string;
  badgeBg: string;
  bulletColor: string;
  chalkGlow: string;
  textColor: string;
  isLight?: boolean;
}

const BOARD_THEMES: Record<BoardThemeId, BoardThemeConfig> = {
  whiteboard: {
    id: "whiteboard",
    name: "Minimal",
    nameBn: "সিম্পল",
    icon: "📋",
    bgGradient: "bg-white",
    surfaceBg: "bg-white text-slate-900 border-neutral-200",
    cardBg: "bg-white text-slate-900",
    cardBorder: "border-neutral-200",
    headerBorder: "border-neutral-200",
    accentText: "text-neutral-900",
    accentGlow: "transparent",
    badgeBg: "bg-neutral-100 text-neutral-800",
    bulletColor: "bg-neutral-800",
    chalkGlow: "shadow-none",
    textColor: "text-neutral-900",
    isLight: true
  },
  cyber: {
    id: "cyber",
    name: "Cyber Aurora",
    nameBn: "সাইবার নিয়ন",
    icon: "🌌",
    bgGradient: "bg-gradient-to-br from-[#020617] via-[#0a0f29] to-[#030712]",
    surfaceBg: "bg-slate-950/90 text-white border-cyan-500/20",
    cardBg: "bg-gradient-to-br from-[#0a1128]/95 to-[#070b1c]/95 text-slate-100",
    cardBorder: "border-cyan-500/30",
    headerBorder: "border-cyan-500/20",
    accentText: "text-cyan-400",
    accentGlow: "rgba(6, 182, 212, 0.25)",
    badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
    bulletColor: "bg-cyan-400",
    chalkGlow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]",
    textColor: "text-slate-100",
    isLight: false
  },
  chalkboard: {
    id: "chalkboard",
    name: "Chalkboard Classic",
    nameBn: "সবুজ ব্ল্যাকবোর্ড",
    icon: "🌲",
    bgGradient: "bg-gradient-to-br from-[#06241b] via-[#041a13] to-[#02130e]",
    surfaceBg: "bg-[#06241b]/95 text-white border-emerald-500/25",
    cardBg: "bg-gradient-to-br from-[#093528]/95 to-[#041d15]/95 text-emerald-50",
    cardBorder: "border-emerald-400/35",
    headerBorder: "border-emerald-500/25",
    accentText: "text-amber-200",
    accentGlow: "rgba(251, 191, 36, 0.2)",
    badgeBg: "bg-amber-400/15 text-amber-200 border-amber-400/40",
    bulletColor: "bg-amber-300",
    chalkGlow: "shadow-[0_0_20px_rgba(52,211,153,0.18)]",
    textColor: "text-emerald-50",
    isLight: false
  },
  sunset: {
    id: "sunset",
    name: "Sunset Focus",
    nameBn: "উষ্ণ সানসেট",
    icon: "🌅",
    bgGradient: "bg-gradient-to-br from-[#1a0826] via-[#240c2a] to-[#12051c]",
    surfaceBg: "bg-[#1a0826]/95 text-white border-rose-500/20",
    cardBg: "bg-gradient-to-br from-[#2a0e38]/95 to-[#1c0828]/95 text-rose-50",
    cardBorder: "border-rose-400/30",
    headerBorder: "border-rose-500/20",
    accentText: "text-amber-300",
    accentGlow: "rgba(244, 63, 94, 0.25)",
    badgeBg: "bg-rose-500/15 text-rose-200 border-rose-400/40",
    bulletColor: "bg-rose-400",
    chalkGlow: "shadow-[0_0_20px_rgba(244,63,94,0.2)]",
    textColor: "text-rose-50",
    isLight: false
  },
  studio: {
    id: "studio",
    name: "Modern Studio",
    nameBn: "স্টুডিও ব্লু",
    icon: "📄",
    bgGradient: "bg-gradient-to-br from-[#091024] via-[#0f1d3d] to-[#070b18]",
    surfaceBg: "bg-[#091024]/95 text-white border-sky-500/20",
    cardBg: "bg-gradient-to-br from-[#13234a]/95 to-[#0b152d]/95 text-sky-50",
    cardBorder: "border-sky-400/35",
    headerBorder: "border-sky-500/20",
    accentText: "text-sky-300",
    accentGlow: "rgba(56, 189, 248, 0.25)",
    badgeBg: "bg-sky-500/15 text-sky-200 border-sky-400/40",
    bulletColor: "bg-sky-400",
    chalkGlow: "shadow-[0_0_20px_rgba(56,189,248,0.2)]",
    textColor: "text-sky-50",
    isLight: false
  }
};

const ACADEMIC_DICTIONARY: Record<string, string> = {
  // Biology Reproduction & Genetics
  "sperm": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "শুক্রাণু": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "acrosome": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "egg": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "fertilization": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
  "নিষেক": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
  "ovum": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "ডিম্বাণু": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "reproduction": "https://images.unsplash.com/photo-1516321405-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  "জনন": "https://images.unsplash.com/photo-1516321405-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  "menstrual": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
  "রজঃচক্র": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
  "ovulation": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
  "dna": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "ডিএনএ": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "rna": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "replication": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "প্রতিলিপিকরণ": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "gene": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "flower": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
  "ফুল": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
  "pollination": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
  "পরাগযোগ": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
  "mendel": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "মেন্ডেল": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",

  // Mathematics
  "math": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  "গণিত": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  "calculus": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  "কলনবিদ্যা": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  "integral": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  "সমাকলন": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  "matrix": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop",
  "ম্যাট্রিক্স": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop",
  "vector": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop",
  "ভেক্টর": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop",

  // Bengali A & English B
  "adarini": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
  "আদিরিনী": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
  "elephant": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
  "হাতি": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
  "deoli": "https://images.unsplash.com/photo-1532103054090-334e6e60ae29?q=80&w=1200&auto=format&fit=crop",
  "দেওলি": "https://images.unsplash.com/photo-1532103054090-334e6e60ae29?q=80&w=1200&auto=format&fit=crop",
  "train": "https://images.unsplash.com/photo-1532103054090-334e6e60ae29?q=80&w=1200&auto=format&fit=crop",
  "roots": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
  "kalam": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
  "কালাম": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
  "rameswaram": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
  "bet": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
  "বাজি": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
  "chekhov": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
  "ulysses": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
  "ইউলিসিস": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop"
};

const DEFAULT_ACADEMIC_IMAGES = {
  math: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1280&auto=format&fit=crop",
  biology: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1280&auto=format&fit=crop",
  physics: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1280&auto=format&fit=crop",
  bengali: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1280&auto=format&fit=crop",
  english: "https://images.unsplash.com/photo-1532103054090-334e6e60ae29?q=80&w=1280&auto=format&fit=crop",
  general: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1280&auto=format&fit=crop"
};

function buildAccurateImagePrompt(raw: string): string {
  const p = raw.toLowerCase().trim();

  // 1. Biology Concepts
  if (p.includes("sperm") || p.includes("শুক্রাণু") || p.includes("acrosome") || p.includes("zp3")) {
    return "Detailed labeled medical illustration of human sperm cell anatomy, showing acrosome cap, nucleus, mitochondria midpiece spiral, and axial filament tail on scientific dark background, textbook quality";
  }
  if (p.includes("dna") || p.includes("ডিএনএ") || p.includes("replication") || p.includes("প্রতিলিপিকরণ") || p.includes("helicase") || p.includes("ssb")) {
    return "3D scientific molecular diagram of DNA double helix replication fork, showing helicase separating strands, leading and lagging strands with Okazaki fragments and single-stranded binding proteins, textbook illustration";
  }
  if (p.includes("flower") || p.includes("ফুল") || p.includes("pollination") || p.includes("পরাগযোগ") || p.includes("stigma") || p.includes("anther") || p.includes("geitonogamy") || p.includes("xenogamy")) {
    return "Botanical cross-section diagram of an angiosperm flower showing stamen anther filament, pistil stigma style ovary with ovules, and pollination biology textbook illustration";
  }
  if (p.includes("menstrual") || p.includes("রজঃচক্র") || p.includes("lh surge") || p.includes("ovulation") || p.includes("ডিম্বপাত")) {
    return "Medical endocrine chart of human menstrual cycle 28 days, showing LH surge graph on day 14, follicle maturation, estrogen progesterone levels, high contrast textbook diagram";
  }
  if (p.includes("mendel") || p.includes("মেন্ডেল") || p.includes("punnett") || p.includes("monohybrid") || p.includes("মনোহাইব্রিড") || p.includes("জিনোটাইপ")) {
    return "Genetics textbook diagram of Gregor Mendel monohybrid cross, Punnett square with homozygous and heterozygous tall dwarf pea plants, 3 to 1 phenotypic ratio chart";
  }
  if (p.includes("fertilization") || p.includes("নিষেক") || p.includes("ovum") || p.includes("ডিম্বাণু") || p.includes("egg") || p.includes("zona pellucida")) {
    return "Human fertilization microscopic scientific illustration, sperm cell binding to zona pellucida ZP3 receptor of mature ovum, high-definition embryology";
  }

  // 2. Mathematics Concepts
  if (p.includes("calculus") || p.includes("কলনবিদ্যা") || p.includes("integral") || p.includes("সমাকলন") || p.includes("derivative") || p.includes("অবকলন") || p.includes("math") || p.includes("গণিত")) {
    return "High-definition mathematical calculus diagram showing integration area under smooth curve, definite integral shaded region on Cartesian coordinate plane, crisp geometrical equations";
  }
  if (p.includes("vector") || p.includes("ভেক্টর") || p.includes("cross product") || p.includes("dot product") || p.includes("3d")) {
    return "3D vector mathematics coordinate axes X Y Z with unit vectors, vector cross product right-hand rule diagram and dot product angle, scientific physics textbook";
  }
  if (p.includes("matrix") || p.includes("ম্যাট্রিক্স") || p.includes("determinant") || p.includes("নির্ণায়ক")) {
    return "Linear algebra matrix transformation grid diagram in 3D coordinate space with eigenvalues and determinants, clean scientific illustration";
  }

  // 3. Literature Concepts (Bengali A & English B)
  if (p.includes("adarini") || p.includes("আদিরিনী") || p.includes("elephant") || p.includes("হাতি") || p.includes("জয়রাম")) {
    return "Classic realistic historical painting of an Indian domestic elephant Adarini standing near an old rural Bengal zamindar courtyard in late 19th century, warm atmospheric tones";
  }
  if (p.includes("deoli") || p.includes("দেওলি") || p.includes("ruskin bond") || p.includes("train") || p.includes("ট্রেন")) {
    return "Atmospheric vintage Indian railway station platform at night in Deoli with steam train lights in mist and a young girl holding woven cane baskets, cinematic nostalgic painting";
  }
  if (p.includes("roots") || p.includes("kalam") || p.includes("কালাম") || p.includes("rameswaram") || p.includes("রামেশ্বরম")) {
    return "Historic coastal heritage town of Rameswaram Tamil Nadu with traditional temple architecture and quiet seashore morning, tribute to APJ Abdul Kalam, serene painting";
  }
  if (p.includes("bet") || p.includes("বাজি") || p.includes("chekhov") || p.includes("চেখভ") || p.includes("solitary")) {
    return "19th century vintage private library lodge with candle light, tall bookshelves packed with manuscripts, and a solitary scholar reading at a wooden desk, atmospheric oil painting";
  }
  if (p.includes("ulysses") || p.includes("ইউলিসিস") || p.includes("tennyson") || p.includes("odysseus")) {
    return "Heroic epic painting of Greek hero Ulysses standing on high rocky sea cliffs overlooking a stormy ocean horizon, determination and courage in nature";
  }

  // Clean fallback prompt
  const clean = raw.replace(/[\$#\*_`>]/g, "").slice(0, 100);
  return `High-definition, textbook-quality scientific educational illustration for WBCHSE Class 12: ${clean}. Clear labeled parts, high contrast, clean presentation, scientifically accurate`;
}

function getFallbackImage(prompt: string): string {
  const p = prompt.toLowerCase();
  for (const key of Object.keys(ACADEMIC_DICTIONARY)) {
    if (p.includes(key)) return ACADEMIC_DICTIONARY[key];
  }
  if (p.includes("math") || p.includes("গণিত") || p.includes("calculus") || p.includes("সমাকলন") || p.includes("কলনবিদ্যা") || p.includes("vector") || p.includes("matrix")) {
    return DEFAULT_ACADEMIC_IMAGES.math;
  }
  if (p.includes("sperm") || p.includes("শুক্রাণু") || p.includes("dna") || p.includes("ডিএনএ") || p.includes("bio") || p.includes("জীববিদ্যা") || p.includes("flower") || p.includes("ফুল") || p.includes("পরাগযোগ")) {
    return DEFAULT_ACADEMIC_IMAGES.biology;
  }
  if (p.includes("physics") || p.includes("পদার্থবিদ্যা") || p.includes("force") || p.includes("wave")) {
    return DEFAULT_ACADEMIC_IMAGES.physics;
  }
  if (p.includes("adarini") || p.includes("আদিরিনী") || p.includes("bengali") || p.includes("বাংলা")) {
    return DEFAULT_ACADEMIC_IMAGES.bengali;
  }
  if (p.includes("roots") || p.includes("কালাম") || p.includes("train") || p.includes("দেওলি") || p.includes("bet") || p.includes("english") || p.includes("ইংরেজি")) {
    return DEFAULT_ACADEMIC_IMAGES.english;
  }
  return DEFAULT_ACADEMIC_IMAGES.general;
}

interface SyllabusPreset {
  id: string;
  subject: "Mathematics" | "Biology" | "Bengali A" | "English B" | "Genetics";
  title: string;
  badge: string;
  elements: { type: "text" | "image"; content: string }[];
}

const SYLLABUS_PRESETS: SyllabusPreset[] = [
  {
    id: "math-calculus",
    subject: "Mathematics",
    title: "উচ্চতর গণিত: কলনবিদ্যা ও ইন্টিগ্রেশন (Calculus & Integration)",
    badge: "7 Days Exam Focus • High Yield",
    elements: [
      {
        type: "text",
        content: `# 📐 উচ্চতর গণিত: কলনবিদ্যা ও সমাকলন (Calculus Formulas)
**WBCHSE Class 12 Sem 3 • Mathematics Exam (৭ দিনের প্রস্তুতি)**

### ১. গুরুত্বপূর্ণ সমাকলন সূত্রাবলী (Standard Integrals):
- $$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$
- $$\\int \\frac{1}{x} dx = \\ln|x| + C$$
- $$\\int e^{ax} dx = \\frac{e^{ax}}{a} + C$$
- $$\\int \\sin(ax) dx = -\\frac{\\cos(ax)}{a} + C$$
- $$\\int \\sec^2(x) dx = \\tan(x) + C$$

### ২. আংশিক সমাকলন পদ্ধতি (Integration by Parts - ILATE Rule):
$$\\int u \\cdot v \\, dx = u \\int v \\, dx - \\int \\left( \\frac{du}{dx} \\int v \\, dx \\right) dx$$

> 📌 **ILATE ক্রম:** Inverse Trig $\\to$ Logarithmic $\\to$ Algebraic $\\to$ Trigonometric $\\to$ Exponential`
      },
      {
        type: "image",
        content: "calculus integration derivatives graph formula textbook mathematics"
      },
      {
        type: "text",
        content: `### ৩. ভেক্টর ও ত্রিমাত্রিক জ্যামিতি (Vectors & 3D Geometry):
- **ডট প্রোডাক্ট (Dot Product):** $$\\vec{a} \\cdot \\vec{b} = |\\vec{a}| |\\vec{b}| \\cos\\theta$$
- **ক্রস প্রোডাক্ট (Cross Product):** $$\\vec{a} \\times \\vec{b} = |\\vec{a}| |\\vec{b}| \\sin\\theta \\, \\hat{n}$$
- **লম্ব হওয়ার শর্ত:** $$\\vec{a} \\cdot \\vec{b} = 0$$ ($$a_1 a_2 + b_1 b_2 + c_1 c_2 = 0$$)
- **সমান্তরাল হওয়ার শর্ত:** $$\\vec{a} \\times \\vec{b} = \\vec{0}$$

⚠️ **মনে রাখুন:** দুটি সমতলের মধ্যবর্তী কোণ এবং সরলরেখার প্রতিসম আকার থেকে প্রতি বছর ৪ নম্বরের নিশ্চিত প্রশ্ন আসে!`
      }
    ]
  },
  {
    id: "bio-reproduction",
    subject: "Biology",
    title: "মানব শুক্রাণু ও ফার্টিলাইজেশন (Human Reproduction)",
    badge: "Unit I • High Yield",
    elements: [
      {
        type: "text",
        content: `# 🧬 মানব শুক্রাণুর গঠন ও ZP3 রিসেপ্টর
**WBCHSE Class 12 • সেমিস্টার ৩ জীববিদ্যা**

### ১. শুক্রাণুর প্রধান তিনটি অংশ (Sperm Anatomy):
- **মস্তক (Head):** অ্যাক্রোজোম ক্যাপ ও ঘনীভূত হ্যাপ্লয়েড ($n=23$) নিউক্লিয়াস দ্বারা গঠিত।
- **মধ্যভাগ (Midpiece):** সর্পিলাকার মাইটোকন্ড্রিয়া (নেবেনকার্ন) উপস্থিত, যা গমনে ATP শক্তি যোগায়।
- **পুচ্ছ (Tail):** অ্যাক্সোনিম ($9+2$ মাইক্রোটিউবিউল বিন্যাস) যা শুক্রাণুর সাঁতারে সহায়তা করে।

> 📌 **পরীক্ষার জন্য গুরুত্বপূর্ণ পয়েন্ট (Exam High-Yield):**
> ডিম্বাণুর জোনা পেলুসিডার **ZP3 গ্লাইকোপ্রোটিন** শুক্রাণুর বিশেষ রিসেপ্টর হিসেবে কাজ করে এবং পলিস্পার্মি প্রতিরোধে মুখ্য ভূমিকা নেয়।`
      },
      {
        type: "image",
        content: "sperm cell structure acrosome nucleus midpiece mitochondria"
      },
      {
        type: "text",
        content: `### ২. রজঃচক্র ও LH Surge (Menstrual Cycle Key Phases):
- **Proliferative Phase (প্রলিফারেটিভ পর্যায়):** ইস্ট্রোজেন ক্ষরণে এন্ডোমেট্রিয়াম স্তরের পুরুত্ব বৃদ্ধি পায়।
- **Ovulation (ডিম্বপাত):** সাধারণত ২৮ দিনের চক্রের **১৪তম দিনে LH Surge** ঘটে এবং গ্রাফিয়ান ফলিকল বিদীর্ণ হয়ে সেকেন্ডারি ওওসাইট মুক্ত হয়।
- **Luteal Phase:** করপাস লুটিয়াম থেকে প্রজেস্টেরন হরমোন ক্ষরিত হয়।

⚠️ **সংজ্ঞা মনে রাখুন:** জরায়ুর বাইরে (যেমন ফ্যালোপিয়ান নালীতে) ভ্রূণ রোপিত হলে তাকে **একটোপিক ইমপ্ল্যান্টেশন (Ectopic Pregnancy)** বলে।`
      }
    ]
  },
  {
    id: "genetics-dna",
    subject: "Genetics",
    title: "DNA রেপ্লিকেশন ও SSB প্রোটিন (Molecular Genetics)",
    badge: "Unit II • High Yield",
    elements: [
      {
        type: "text",
        content: `# 🔬 DNA রেপ্লিকেশন ফর্ক ও আণবিক প্রক্রিয়া
**আণবিক জীববিজ্ঞান • Molecular Basis of Inheritance**

### ১. মূল উপাদান ও বন্ধনী (Base Pairing Rules):
- **ওয়াটসন-ক্রিক মডেল:** $A = T$ (২টি হাইড্রোজেন বন্ধনী), $G \\equiv C$ (৩টি হাইড্রোজেন বন্ধনী)।
- **হেলিকেজ (Helicase):** ডাবল হেলিক্সের হাইড্রোজেন বন্ড ভেঙে দুটি স্ট্র্যান্ড আলাদা করে।
- **SSB প্রোটিন (Single-Stranded Binding Protein):** উন্মুক্ত স্ট্র্যান্ডগুলিকে পুনরায় জোড়া লাগা বা পেঁচানো থেকে রক্ষা করে।
- **DNA পলিমারেজ III:** সর্বদা $5' \\to 3'$ অভিমুখে নতুন স্ট্র্যান্ড গঠন করে।

$$A + G = T + C \\quad \\text{(Chargaff's Equivalence Rule)}$$`
      },
      {
        type: "image",
        content: "dna replication fork helicase ssb protein leading lagging strand"
      }
    ]
  },
  {
    id: "bio-flower",
    subject: "Biology",
    title: "সপুষ্পক উদ্ভিদের পরাগযোগ ও জনন (Flower Pollination)",
    badge: "Unit I • High Yield",
    elements: [
      {
        type: "text",
        content: `# 🌸 সপুষ্পক উদ্ভিদের যৌন জনন ও পরাগযোগ
**WBCHSE Class 12 • Biology Semester 3**

### ১. পরাগযোগের প্রকারভেদ (Types of Pollination):
- **গেইটোনোগ্যামি (Geitonogamy):** একই উদ্ভিদের দুটি ভিন্ন ফুলের মধ্যে পরাগযোগ। জিনগতভাবে এটি স্ব-পরাগযোগের সমতুল্য।
- **জেনোগ্যামি (Xenogamy):** একই প্রজাতির দুটি পৃথক উদ্ভিদের ফুলের মধ্যে পরাগযোগ। এতে প্রকরণ (Variation) তৈরি হয়।

### ২. দ্বিনিষেক প্রক্রিয়া (Double Fertilization):
- ডিম্বাণু ($n$) + পুংজনন কোষ ($n$) $\\to$ জাইগোট ($2n$)
- নির্ণীত নিউক্লিয়াস ($2n$) + ২য় পুংজনন কোষ ($n$) $\\to$ শস্য ($3n$ - Endosperm)`
      },
      {
        type: "image",
        content: "angiosperm flower anatomy pollination stigma anther ovary"
      }
    ]
  },
  {
    id: "bengali-adarini",
    subject: "Bengali A",
    title: "প্রভাতকুমার মুখোপাধ্যায়ের 'আদিরিনী' (Bengali Prose)",
    badge: "বাংলা এ • প্রথম গল্প",
    elements: [
      {
        type: "text",
        content: `# 📚 প্রভাত কুমার মুখোপাধ্যায়ের 'আদিরিনী'
**উচ্চ মাধ্যমিক বাংলা এ • বিষয়সংক্ষেপ ও চরিত্র বিশ্লেষণ**

### ১. গল্প পরিচিতি ও পটভূমি:
- **লেখক:** প্রভাত কুমার মুখোপাধ্যায় (বাস্তববাদী বাংলা ছোটগল্পের অন্যতম শ্রেষ্ঠ রূপকার)।
- **মূল চরিত্র:** জয়রাম মোক্তার ও তার স্নেহের পোষ্য হস্তিনী 'আদিরিনী'।
- **ক্রয়মূল্য:** জয়রাম মোক্তার আদিরিনীকে **দুই হাজার (২০০০) টাকায়** ক্রয় করেছিলেন।

> "আদিরিনী কেবল একটা পশু নহে, সে যেন জয়রামের সন্তানের অধিক স্নেহের পাত্রী হইয়া উঠিয়াছিল।"

### ২. পরীক্ষার গুরুত্বপূর্ণ প্রশ্ন ও পয়েন্ট:
- জয়রাম মোক্তারের শেষ বয়সে আর্থিক অনটন ও মহাজনের ঋণ।
- আদিরিনীকে নিলামে তোলার মর্মান্তিক পরিস্থিতি এবং অবলা পশুর গভীর নিঃস্বার্থ ভালোবাসা।`
      },
      {
        type: "image",
        content: "adarini elephant bengal vintage village old mokhtar"
      }
    ]
  },
  {
    id: "english-the-bet",
    subject: "English B",
    title: "The Bet by Anton Chekhov (English Literature)",
    badge: "English B • Class 12",
    elements: [
      {
        type: "text",
        content: `# ✒️ 'The Bet' by Anton Chekhov
**WBCHSE Class 12 English B • Key Literary Analysis**

### 1. The Core Conflict & Wager:
- **Debate:** Capital punishment (death penalty) versus Life imprisonment.
- **The Wager:** The banker bet **2 million rubles** that the lawyer could not stay in solitary confinement for **15 years**.
- **Location:** The lodge in the banker's garden from 1870 to 1885.

### 2. The Lawyer's Transformation:
- **First 5 Years:** Played piano, read light fiction, experienced profound loneliness.
- **Middle Years:** Deep study of languages, philosophy, history, and the New Testament.
- **Final Years:** Disillusionment with worldly vanity, riches, and earthly wisdom.

> *"To prove to you in action how I despise all that you live by, I renounce the two millions..."*`
      },
      {
        type: "image",
        content: "the bet chekhov vintage library lawyer reading books candle"
      }
    ]
  }
];

export type TypingSpeed = "1x" | "2x" | "4x" | "instant";

// Rich Slide Text Formatter with Speech-Synchronized Typewriter and Speed Controls
const FormattedSlideText: React.FC<{ 
  content: string; 
  theme: BoardThemeConfig;
  fontSizeClass: string;
  enableTypewriter?: boolean;
  typingSpeed?: TypingSpeed;
  speechCharIndex?: number;
  isSpeaking?: boolean;
  onTextProgress?: (charsCount: number) => void;
  onTextComplete?: () => void;
}> = ({ 
  content, 
  theme, 
  fontSizeClass, 
  enableTypewriter = true,
  typingSpeed = "2x",
  speechCharIndex = -1,
  isSpeaking = false,
  onTextProgress,
  onTextComplete
}) => {
  const [displayedChars, setDisplayedChars] = useState<number>(() => {
    return (!enableTypewriter || typingSpeed === "instant") ? content.length : 0;
  });
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(!enableTypewriter || typingSpeed === "instant");

  const stepMap: Record<TypingSpeed, { step: number; intervalMs: number }> = {
    "1x": { step: 3, intervalMs: 25 },
    "2x": { step: 8, intervalMs: 16 },
    "4x": { step: 24, intervalMs: 10 },
    "instant": { step: 99999, intervalMs: 1 }
  };

  useEffect(() => {
    if (!enableTypewriter || typingSpeed === "instant") {
      setDisplayedChars(content.length);
      setIsTypingComplete(true);
      if (onTextProgress) onTextProgress(content.length);
      if (onTextComplete) onTextComplete();
      return;
    }

    setDisplayedChars(0);
    setIsTypingComplete(false);

    if (isSpeaking && speechCharIndex > 0) {
      const nextVal = Math.min(content.length, Math.max(displayedChars, speechCharIndex + 15));
      setDisplayedChars(nextVal);
      if (onTextProgress) onTextProgress(nextVal);
      return;
    }

    const { step, intervalMs } = stepMap[typingSpeed];
    let current = 0;

    const interval = setInterval(() => {
      current += step;
      if (current >= content.length) {
        setDisplayedChars(content.length);
        setIsTypingComplete(true);
        if (onTextProgress) onTextProgress(content.length);
        if (onTextComplete) onTextComplete();
        clearInterval(interval);
      } else {
        setDisplayedChars(current);
        if (onTextProgress) onTextProgress(current);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [content, enableTypewriter, typingSpeed]);

  useEffect(() => {
    if (isSpeaking && speechCharIndex >= 0) {
      setDisplayedChars(prev => {
        const nextVal = Math.max(prev, Math.min(content.length, speechCharIndex + 20));
        if (onTextProgress) onTextProgress(nextVal);
        return nextVal;
      });
      if (speechCharIndex >= content.length - 20) {
        setIsTypingComplete(true);
      }
    }
  }, [speechCharIndex, isSpeaking, content.length]);

  const activeContent = content.slice(0, displayedChars);
  const lines = activeContent.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentBullets: string[] = [];

  const flushBullets = (keyIdx: number) => {
    if (currentBullets.length > 0) {
      renderedElements.push(
        <div key={`bullets-${keyIdx}`} className="w-full space-y-4 my-4 text-left border-l-2 border-slate-500/20 pl-4">
          {currentBullets.map((b, bIdx) => (
            <div key={bIdx} className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full ${theme.bulletColor} mt-2 shrink-0 shadow-sm`} />
              <div className={`${theme.isLight ? 'text-slate-800' : 'text-slate-100'} ${fontSizeClass} leading-relaxed bangla-text font-normal break-words`}>
                <MathText text={b} />
              </div>
            </div>
          ))}
        </div>
      );
      currentBullets = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBullets(idx);
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushBullets(idx);
      const title = trimmed.replace('# ', '');
      renderedElements.push(
        <div key={`h1-${idx}`} className={`w-full pb-2 mb-2 border-b ${theme.isLight ? 'border-slate-200' : 'border-white/10'} text-left`}>
          <h1 className={`text-lg sm:text-2xl md:text-3xl font-black ${theme.accentText} tracking-tight bangla-text leading-snug flex items-center gap-2`}>
            <span>{title}</span>
          </h1>
        </div>
      );
    } else if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      flushBullets(idx);
      const subTitle = trimmed.replace(/^###?\s+/, '');
      renderedElements.push(
        <div key={`h2-${idx}`} className="w-full mt-3 sm:mt-4 mb-2 text-left">
          <h2 className={`text-sm sm:text-lg md:text-xl font-bold ${theme.isLight ? 'text-slate-900' : 'text-white'} tracking-wide bangla-text flex items-center gap-2`}>
            <span className={`w-1.5 h-3.5 sm:h-4 rounded-full ${theme.bulletColor}`} />
            <span>{subTitle}</span>
          </h2>
        </div>
      );
    } else if (trimmed.startsWith('>')) {
      flushBullets(idx);
      const quote = trimmed.replace(/^>\s*/, '');
      renderedElements.push(
        <div 
          key={`quote-${idx}`} 
          className={`w-full p-3 sm:p-4 my-2.5 rounded-2xl ${
            theme.isLight ? 'bg-amber-50/90 border-l-4 border-amber-500 text-amber-950 shadow-sm' : 'bg-white/[0.04] border-l-4 border-amber-400 text-amber-200/90'
          } text-left backdrop-blur-md`}
        >
          <div className="text-xs sm:text-base font-serif italic bangla-text leading-relaxed">
            <MathText text={quote} />
          </div>
        </div>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentBullets.push(trimmed.replace(/^[-*]\s+/, ''));
    } else {
      flushBullets(idx);
      renderedElements.push(
        <div key={`p-${idx}`} className={`w-full my-1.5 sm:my-2 text-left ${fontSizeClass} ${theme.isLight ? 'text-slate-800' : 'text-slate-200'} bangla-text leading-relaxed font-normal break-words`}>
          <MathText text={trimmed} />
        </div>
      );
    }
  });

  flushBullets(lines.length + 100);

  return (
    <div 
      className="w-full flex flex-col justify-start items-start relative select-text cursor-pointer"
      onClick={() => {
        setDisplayedChars(content.length);
        setIsTypingComplete(true);
        if (onTextProgress) onTextProgress(content.length);
        if (onTextComplete) onTextComplete();
      }}
      title="Click to reveal full text immediately"
    >
      {renderedElements}
      {!isTypingComplete && (
        <span className={`inline-block w-2.5 h-3.5 sm:h-5 ${theme.bulletColor} ml-1.5 animate-pulse align-middle rounded-sm shadow-md`} />
      )}
    </div>
  );
};

// High-Res Image / Diagram Viewer
const BoardImage: React.FC<{ 
  content: string; 
  theme: BoardThemeConfig;
  onRefresh?: () => void;
}> = ({ content, theme }) => {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [provider, setProvider] = useState<string>("Multi-Engine AI");
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"diagram" | "ai_image">("diagram");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showLightbox, setShowLightbox] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [invertColors, setInvertColors] = useState<boolean>(false);

  const isDirectUrl = content.startsWith("http://") || content.startsWith("https://") || content.startsWith("data:image");

  const isKnownSyllabusConcept = 
    !isDirectUrl && (
      content.toLowerCase().includes("sperm") || 
      content.toLowerCase().includes("শুক্রাণু") ||
      content.toLowerCase().includes("dna") || 
      content.toLowerCase().includes("replication") ||
      content.toLowerCase().includes("menstrual") ||
      content.toLowerCase().includes("রজঃচক্র") ||
      content.toLowerCase().includes("ovulation") ||
      content.toLowerCase().includes("lh surge") ||
      content.toLowerCase().includes("flower") ||
      content.toLowerCase().includes("ফুল") ||
      content.toLowerCase().includes("pollination") ||
      content.toLowerCase().includes("পরাগযোগ") ||
      content.toLowerCase().includes("mendel") ||
      content.toLowerCase().includes("মেন্ডেল") ||
      content.toLowerCase().includes("punnett")
    );

  const fetchVisual = async (forceNew = false) => {
    if (isDirectUrl) {
      setImgUrl(content);
      setViewMode("ai_image");
      setProvider("Web Image / Custom Visual");
      setLoading(false);
      return;
    }

    if (isKnownSyllabusConcept && !forceNew) {
      setViewMode("diagram");
      setProvider("Interactive SVG (WBCHSE)");
    } else {
      setViewMode("ai_image");
    }

    const cacheKey = `study_img_${content.toLowerCase().trim()}`;
    if (!forceNew) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.url) {
            setImgUrl(parsed.url);
            setProvider(parsed.provider || "Cached Visual");
            return;
          }
        } catch (_) {}
      }
    }

    setLoading(true);
    try {
      const accuratePrompt = buildAccurateImagePrompt(content);
      const rawCf = (localStorage.getItem("cf_api_token") || "").trim();
      const rawGemini = (localStorage.getItem("gemini_api_key") || "").trim();

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: accuratePrompt,
          cloudflareToken: rawCf.length > 8 ? rawCf : undefined,
          geminiApiKey: rawGemini.length > 8 ? rawGemini : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setImgUrl(data.url);
          setProvider(data.provider || "Multi-Engine AI");
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ url: data.url, provider: data.provider }));
          } catch (_) {}
        } else {
          setImgUrl(getFallbackImage(content));
        }
      } else {
        setImgUrl(getFallbackImage(content));
      }
    } catch (err) {
      setImgUrl(getFallbackImage(content));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisual();
  }, [content, isDirectUrl]);

  const activeSrc = imgUrl || getFallbackImage(content);

  const handleDownload = () => {
    try {
      const a = document.createElement("a");
      a.href = activeSrc;
      a.download = `WBCHSE_${content.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_) {
      window.open(activeSrc, "_blank");
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[160px] sm:min-h-[260px] md:min-h-[380px]">
      {/* Top Floating Control Bar */}
      <div className={`absolute top-2 right-2 md:top-3 md:right-4 z-20 flex flex-wrap items-center gap-1 sm:gap-1.5 ${
        theme.isLight ? 'bg-white/95 text-slate-800 border-slate-300' : 'bg-black/85 text-white border-white/15'
      } backdrop-blur-xl px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border text-[10px] sm:text-xs shadow-2xl`}>
        <div className={`flex items-center gap-1 font-mono font-bold text-[10px] sm:text-[11px] ${theme.accentText}`}>
          <Cpu size={12} className="text-amber-400 animate-pulse" />
          <span className="truncate max-w-[100px] sm:max-w-[180px]">{provider}</span>
        </div>

        {isKnownSyllabusConcept && (
          <button
            onClick={() => setViewMode(m => m === "diagram" ? "ai_image" : "diagram")}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Layers size={11} />
            <span>{viewMode === "diagram" ? "AI Image" : "SVG"}</span>
          </button>
        )}

        <div className="flex items-center gap-1 border-l border-white/20 pl-1">
          <button
            onClick={() => setHighContrast(c => !c)}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              highContrast ? "bg-amber-400 text-slate-950 font-bold" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title="High Contrast Mode"
          >
            <Contrast size={12} />
          </button>
          <button
            onClick={() => setZoomLevel(z => Math.min(z + 0.25, 2.5))}
            className="p-1 rounded-md bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={() => setZoomLevel(z => Math.max(z - 0.25, 0.75))}
            className="p-1 rounded-md bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={() => fetchVisual(true)}
            className="p-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-all cursor-pointer"
            title="Regenerate Visual"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowLightbox(true)}
            className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1 text-[10px] font-bold px-1.5 cursor-pointer shadow-md"
          >
            <Eye size={12} /> Zoom
          </button>
          <button
            onClick={handleDownload}
            className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md"
            title="Download HD Image"
          >
            <Download size={12} />
          </button>
        </div>
      </div>

      {viewMode === "diagram" && isKnownSyllabusConcept ? (
        <div className="w-full h-full flex items-center justify-center p-1 sm:p-2">
          <SyllabusDiagram conceptKey={content} className="w-full max-w-4xl" />
        </div>
      ) : loading ? (
        <div className={`flex flex-col items-center justify-center p-6 sm:p-8 ${
          theme.isLight ? 'bg-slate-100/90 border-slate-300' : 'bg-slate-950/80 border-cyan-500/20'
        } rounded-3xl border w-full h-[220px] sm:h-[320px] md:h-[420px] shadow-2xl`}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="mb-3 text-cyan-400">
            <Sparkles size={36} className="animate-pulse" />
          </motion.div>
          <p className="text-xs sm:text-sm font-black uppercase text-cyan-600 dark:text-cyan-200 tracking-wider animate-pulse">Generating High-Definition Diagram...</p>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono mt-1.5 max-w-md text-center font-bold truncate">{content.toUpperCase()}</p>
        </div>
      ) : (
        <div 
          className={`w-full h-full flex items-center justify-center p-1 sm:p-3 ${
            theme.isLight ? 'bg-slate-50/95 border-slate-200' : 'bg-black/40 border-white/10'
          } rounded-2xl sm:rounded-3xl border shadow-xl overflow-hidden cursor-zoom-in`}
          onClick={() => setShowLightbox(true)}
        >
          <img
            src={activeSrc}
            alt="Board visual"
            className={`w-auto h-auto max-w-full max-h-[38vh] sm:max-h-[50vh] md:max-h-[68vh] object-contain rounded-xl shadow-md transition-all duration-300 hover:brightness-105 ${
              highContrast ? "contrast-150 saturate-125" : ""
            } ${invertColors ? "invert" : ""}`}
            style={{ transform: `scale(${zoomLevel})` }}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fb = getFallbackImage(content);
              if (target.src !== fb) target.src = fb;
            }}
          />
        </div>
      )}

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-3 sm:p-6"
            onClick={() => setShowLightbox(false)}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 z-50" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleDownload}
                className="p-2 sm:p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
              >
                <Download size={15} /> Save 4K Image
              </button>
              <button
                onClick={() => setShowLightbox(false)}
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative max-w-6xl max-h-[88vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={activeSrc}
                alt={content}
                className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
              />
              <p className="text-white/90 text-[11px] sm:text-xs font-mono font-bold mt-2.5 bg-black/75 px-4 py-1.5 rounded-full border border-white/15">
                {content} • {provider}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface LiveBoardProps {
  elements: BoardElement[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClearBoard?: () => void;
  onAddElement?: (element: { type: "text" | "image"; content: string }) => void;
}

export const LiveBoard: React.FC<LiveBoardProps> = ({ 
  elements, 
  isExpanded, 
  onToggleExpand, 
  onClearBoard,
  onAddElement 
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showOverview, setShowOverview] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showWebImageModal, setShowWebImageModal] = useState(false);
  const [webImageTab, setWebImageTab] = useState<"url" | "search" | "presets">("url");
  const [webImageUrl, setWebImageUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ title: string; url: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Typewriter Mode & Speed
  const [isTypewriterEnabled, setIsTypewriterEnabled] = useState(true);
  const [typingSpeed, setTypingSpeed] = useState<TypingSpeed>(() => {
    return (localStorage.getItem("study_board_typing_speed") as TypingSpeed) || "2x";
  });

  // AI Auto-Scroll & Navigation Controls
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(true);
  const [autoAdvanceOnSpeech, setAutoAdvanceOnSpeech] = useState<boolean>(false);

  // Sticky notes per slide
  const [stickyNotes, setStickyNotes] = useState<Array<{ id: string; text: string; page: number }>>([]);
  const [newStickyText, setNewStickyText] = useState("");
  const [showStickyPrompt, setShowStickyPrompt] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printPlateRef = useRef<HTMLDivElement>(null);
  const prevElementsLengthRef = useRef<number>(elements.length);
  const [exportingSlideIndex, setExportingSlideIndex] = useState<number | null>(null);
  
  // Theme state: DEFAULT TO WHITEBOARD (উজ্জ্বল হোয়াইটবোর্ড)
  const [currentThemeId, setCurrentThemeId] = useState<BoardThemeId>(() => {
    const saved = localStorage.getItem("study_board_theme") as BoardThemeId;
    if (saved && ["whiteboard", "cyber", "chalkboard", "sunset", "studio"].includes(saved)) {
      return saved;
    }
    return "whiteboard";
  });
  const theme = BOARD_THEMES[currentThemeId] || BOARD_THEMES.whiteboard;

  // Font Size state
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">(() => {
    return (localStorage.getItem("study_board_font_size") as any) || "base";
  });

  // Drawing Annotation Mode
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [drawTool, setDrawTool] = useState<"pen" | "highlighter" | "eraser">("pen");
  const [drawColor, setDrawColor] = useState<string>("#4f46e5");
  const [isDrawing, setIsDrawing] = useState(false);

  // Audio Speech Reader State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechCharIndex, setSpeechCharIndex] = useState<number>(-1);

  // Snapshot & PDF Export State
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const changeTheme = (newTheme: BoardThemeId) => {
    setCurrentThemeId(newTheme);
    localStorage.setItem("study_board_theme", newTheme);
    setShowThemePicker(false);
    soundEffects.playClick();
  };

  const toggleDayNightBoard = () => {
    if (currentThemeId === "whiteboard") {
      changeTheme("cyber");
    } else {
      changeTheme("whiteboard");
    }
  };

  const changeTypingSpeed = (newSpeed: TypingSpeed) => {
    setTypingSpeed(newSpeed);
    localStorage.setItem("study_board_typing_speed", newSpeed);
    soundEffects.playClick();
  };

  const changeFontSize = (newSize: "sm" | "base" | "lg" | "xl") => {
    setFontSize(newSize);
    localStorage.setItem("study_board_font_size", newSize);
    soundEffects.playClick();
  };

  const fontSizeClassMap = {
    sm: "text-xs sm:text-sm",
    base: "text-sm sm:text-base md:text-lg",
    lg: "text-base sm:text-lg md:text-xl",
    xl: "text-lg sm:text-xl md:text-2xl"
  };

  // Smart Grouping: Group elements into slides
  const slides = useMemo(() => {
    const pages: BoardElement[][] = [];
    let currentPageElements: BoardElement[] = [];
    let currentWeight = 0;
    const MAX_WEIGHT = 1400;

    elements.forEach((el) => {
      const weight = el.type === "image" ? 800 : el.content.length;
      if (el.type === "image" || currentWeight + weight > MAX_WEIGHT) {
        if (currentPageElements.length > 0) pages.push(currentPageElements);
        if (el.type === "image") {
          pages.push([el]);
          currentPageElements = [];
          currentWeight = 0;
        } else {
          currentPageElements = [el];
          currentWeight = weight;
        }
      } else {
        currentPageElements.push(el);
        currentWeight += weight;
      }
    });

    if (currentPageElements.length > 0) pages.push(currentPageElements);
    return pages.length > 0 ? pages : [[]];
  }, [elements]);

  useEffect(() => {
    if (slides.length > 0 && currentPage >= slides.length) {
      setCurrentPage(slides.length - 1);
    } else if (slides.length > 0 && currentPage < 0) {
      setCurrentPage(0);
    }
  }, [slides.length, currentPage]);

  // Dedicated function to smoothly scroll the LiveBoard container to the latest content
  const scrollToLatestContent = useCallback((smooth = true) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? "smooth" : "auto"
      });
    }
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    }
  }, []);

  // Smoothly scroll to top whenever the user switches slides manually
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  // Automatically scroll LiveBoard container when new content or elements are added by AI
  useEffect(() => {
    if (elements.length > prevElementsLengthRef.current) {
      if (isAutoScrollEnabled) {
        // If a new slide was created by AI, automatically switch to the newest slide
        if (slides.length > 0 && currentPage !== slides.length - 1) {
          setCurrentPage(slides.length - 1);
        }

        // Multi-stage auto-scroll to ensure newly rendered KaTeX formulas & images are fully visible
        const rAF = requestAnimationFrame(() => scrollToLatestContent(true));
        const t1 = setTimeout(() => scrollToLatestContent(true), 80);
        const t2 = setTimeout(() => scrollToLatestContent(true), 250);
        const t3 = setTimeout(() => scrollToLatestContent(true), 600);

        return () => {
          cancelAnimationFrame(rAF);
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      }
    }
    prevElementsLengthRef.current = elements.length;
  }, [elements.length, slides.length, currentPage, isAutoScrollEnabled, scrollToLatestContent]);

  // AI Auto-Scroll Functionality: smoothly scroll down as AI explains, streams or types
  const handleTextProgress = (charsCount: number) => {
    if (isAutoScrollEnabled && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollTarget = container.scrollHeight - container.clientHeight;
      if (scrollTarget > 0) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      soundEffects.playClick();
    }
  };

  const scrollToBottom = () => {
    scrollToLatestContent(true);
    soundEffects.playClick();
  };

  // Audio Speech Reader function - with Speech boundary tracking for typewriter sync
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeechCharIndex(-1);
      return;
    }

    const currentSlide = slides[currentPage];
    if (!currentSlide || currentSlide.length === 0) return;

    const textToRead = currentSlide
      .filter(el => el.type === "text")
      .map(el => el.content)
      .join(". ")
      .replace(/[\$#\*_`>]/g, '')
      .replace(/https?:\/\/\S+/g, '');

    if (!textToRead.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    const isBengali = /[\u0980-\u09FF]/.test(textToRead);
    utterance.lang = isBengali ? 'bn-IN' : 'en-US';
    utterance.rate = 1.0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeechCharIndex(0);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' || typeof event.charIndex === 'number') {
        setSpeechCharIndex(event.charIndex);
        if (isAutoScrollEnabled && scrollContainerRef.current) {
          scrollContainerRef.current.scrollBy({ top: 28, behavior: "smooth" });
        }
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeechCharIndex(-1);
      // Auto advance to next slide if enabled!
      if (autoAdvanceOnSpeech && currentPage < slides.length - 1) {
        setTimeout(() => {
          setCurrentPage(p => p + 1);
        }, 1200);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechCharIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
    soundEffects.playClick();
  };

  // Drawing Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const updateCanvasSize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isDrawMode, currentPage]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawTool === "eraser") {
      ctx.clearRect(x - 16, y - 16, 32, 32);
    } else {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (drawTool === "highlighter") {
        ctx.strokeStyle = drawColor + "66";
        ctx.lineWidth = 22;
      } else {
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = 3.5;
      }
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => { setIsDrawing(false); };

  const handleLoadPreset = (preset: SyllabusPreset) => {
    preset.elements.forEach((el) => {
      if (onAddElement) onAddElement(el);
    });
    setShowPresets(false);
    setCurrentPage(slides.length);
    soundEffects.playClick();
  };

  // Add Custom Web Image
  const handleAddWebImage = () => {
    if (!webImageUrl.trim() || !onAddElement) return;
    onAddElement({
      type: "image",
      content: webImageUrl.trim()
    });
    setWebImageUrl("");
    setShowWebImageModal(false);
    setCurrentPage(slides.length);
    soundEffects.playClick();
  };

  // Search Online Images
  const handleSearchImages = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    soundEffects.playClick();

    try {
      const query = encodeURIComponent(searchQuery.trim());
      const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrlimit=8&prop=imageinfo&iiprop=url|mime&format=json&origin=*`);
      if (res.ok) {
        const data = await res.json();
        const pages = data?.query?.pages || {};
        const results: Array<{ title: string; url: string }> = [];
        
        Object.values(pages).forEach((p: any) => {
          const info = p?.imageinfo?.[0];
          if (info?.url && (info.url.endsWith(".jpg") || info.url.endsWith(".png") || info.url.endsWith(".jpeg") || info.url.endsWith(".svg"))) {
            results.push({
              title: p.title?.replace("File:", "").replace(/\.[^/.]+$/, ""),
              url: info.url
            });
          }
        });

        if (results.length > 0) {
          setSearchResults(results);
        } else {
          setSearchResults([
            { title: searchQuery, url: `https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop` },
            { title: `${searchQuery} Diagram`, url: `https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop` }
          ]);
        }
      }
    } catch (_) {
      setSearchResults([
        { title: searchQuery, url: getFallbackImage(searchQuery) }
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add Sticky Note
  const handleAddStickyNote = () => {
    if (!newStickyText.trim()) return;
    setStickyNotes(prev => [
      ...prev, 
      { id: Date.now().toString(), text: newStickyText.trim(), page: currentPage }
    ]);
    setNewStickyText("");
    setShowStickyPrompt(false);
    soundEffects.playClick();
  };

  // Instant LiveBoard Snapshot (Captures current board as HD PNG & triggers browser download)
  const takeBoardSnapshot = async () => {
    if (!boardRef.current || isCapturingSnapshot) return;
    setIsCapturingSnapshot(true);
    soundEffects.playClick();
    try {
      const dataUrl = await domToPng(boardRef.current, {
        scale: 2.5,
        backgroundColor: theme.isLight ? "#ffffff" : "#020617",
        font: false,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (node.getAttribute("data-html2canvas-ignore") === "true") return false;
          }
          return true;
        }
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.download = `StudyStranger_Board_Slide_${currentPage + 1}_${timestamp}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Board snapshot export error:", e);
    } finally {
      setIsCapturingSnapshot(false);
    }
  };

  // Luxury Textbook Master PDF Export - 3-Tier Official WBCHSE Revision Dossier
  const exportToPDF = async () => {
    if (elements.length === 0) return;
    setIsExporting(true);
    setExportProgress(0);
    soundEffects.playClick();
    
    try {
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const originalPage = currentPage;

      // -------------------------------------------------------------
      // 1. PAGE 1: Royal WBCHSE Official Archival Cover
      // -------------------------------------------------------------
      pdf.setFillColor(10, 17, 40); // Deep Royal Navy (#0A1128)
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      // Top Gold Foiled Ribbon
      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 0, pdfWidth, 6, "F");

      // WBCHSE Council Insignia Card
      pdf.setFillColor(26, 38, 70);
      pdf.roundedRect(pdfWidth - 85, 15, 70, 20, 3, 3, "F");
      pdf.setTextColor(245, 158, 11);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.text("WBCHSE RECOGNISED", pdfWidth - 50, 23, { align: "center" });
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(7);
      pdf.text("CLASS 12 • SEMESTER 3 • 2026", pdfWidth - 50, 30, { align: "center" });

      // Main Headers
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text("WBCHSE Class 12 Semester 3 Master Revision Dossier", 18, 42);

      pdf.setTextColor(245, 158, 11);
      pdf.setFontSize(13);
      pdf.text("Official Master Lecture Notes & Whiteboard Deck (৭ দিনের চূড়ান্ত প্রস্তুতি)", 18, 52);

      // Student Dossier Badge
      pdf.setFillColor(19, 31, 60);
      pdf.roundedRect(18, 60, pdfWidth - 36, 32, 3, 3, "F");

      pdf.setTextColor(245, 158, 11);
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "bold");
      pdf.text("STUDENT PROFILE & EXAM TARGET", 24, 69);

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text("Student: Abhijit (অভিজিৎ)  |  Target: Higher Mathematics Exam in 7 Days (উচ্চতর গণিত লক্ষ্য: ৯৫%+)", 24, 77);

      pdf.setTextColor(203, 213, 225);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.text("Curriculum: West Bengal Council of Higher Secondary Education (WBCHSE) • Sem 3 (MCQ & Descriptive)", 24, 85);

      // Gold Divider Line
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(0.6);
      pdf.line(18, 98, pdfWidth - 18, 98);

      // Table of Contents Card
      pdf.setFillColor(19, 31, 60);
      pdf.roundedRect(18, 104, pdfWidth - 36, 82, 4, 4, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.text("CHAPTER MODULES & HIGH-YIELD TOPICS INCLUDED:", 26, 116);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(226, 232, 240);
      slides.slice(0, 7).forEach((s, idx) => {
        const preview = s[0]?.type === "image" 
          ? `[Visual Plate]: ${s[0]?.content.slice(0, 60)}` 
          : s[0]?.content.replace(/[\$#\*_`>]/g, '').slice(0, 80) + '...';
        pdf.text(`• Module ${idx + 1}: ${preview}`, 30, 126 + (idx * 8));
      });

      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(8);
      pdf.text("Verified Academic Content • Engineered with Study Stranger AI Architecture • Kolkata, WB", 18, pdfHeight - 10);

      // -------------------------------------------------------------
      // 2. PAGE 2: WBCHSE Class 12 Sem 3 High-Yield Formula & Concept Matrix
      // -------------------------------------------------------------
      pdf.addPage();
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      // Header Band
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pdfWidth, 14, "F");
      pdf.setTextColor(245, 158, 11);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("WBCHSE SEMESTER 3 HIGH-YIELD REVISION CAPSULE", 15, 9.5);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text("Higher Mathematics (7 Days Left) • Biology • Bengali A • English B", pdfWidth - 115, 9.5);

      // 3 High-Yield Columns on Page 2
      const colWidth = (pdfWidth - 36) / 3;

      // Col 1: Mathematics
      pdf.setFillColor(238, 242, 255); // Indigo
      pdf.roundedRect(12, 18, colWidth, pdfHeight - 32, 3, 3, "F");
      pdf.setDrawColor(99, 102, 241);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(12, 18, colWidth, pdfHeight - 32, 3, 3, "S");

      pdf.setTextColor(67, 56, 202);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.text("HIGHER MATHEMATICS", 16, 26);
      pdf.setTextColor(239, 68, 68);
      pdf.setFontSize(7.5);
      pdf.text("7 DAYS COUNTDOWN • TARGET 95%+", 16, 32);

      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.2);
      const mathPoints = [
        "• Integration by Parts: int u*v dx = u int v dx - int (u' int v dx) dx",
        "• Standard: int dx/(x^2 + a^2) = (1/a) arctan(x/a)",
        "• Standard: int dx/(x^2 - a^2) = (1/2a) ln|(x-a)/(x+a)|",
        "• Definite Integral: int_0^a f(x)dx = int_0^a f(a-x)dx",
        "• Vector Dot Product: a . b = |a||b| cos(theta)",
        "• Vector Cross Product: a x b = |a||b| sin(theta) n_hat",
        "• Area of Triangle: (1/2) |a x b|",
        "• Matrices: (AB)^-1 = B^-1 * A^-1",
        "• Determinants: det(kA) = k^n det(A)",
        "• Probability: P(A|B) = P(A cap B) / P(B)",
        "• High Yield: Solve Linear Equations via Matrix Method",
        "• Calculus Revision: Maxima & Minima second derivative test"
      ];
      mathPoints.forEach((pt, pIdx) => {
        pdf.text(pt, 16, 42 + (pIdx * 6.5));
      });

      // Col 2: Biology
      pdf.setFillColor(236, 253, 245); // Emerald
      pdf.roundedRect(16 + colWidth, 18, colWidth, pdfHeight - 32, 3, 3, "F");
      pdf.setDrawColor(16, 185, 129);
      pdf.roundedRect(16 + colWidth, 18, colWidth, pdfHeight - 32, 3, 3, "S");

      pdf.setTextColor(5, 150, 105);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.text("BIOLOGY (UNIT I & II)", 20 + colWidth, 26);
      pdf.setTextColor(16, 185, 129);
      pdf.setFontSize(7.5);
      pdf.text("REPRODUCTION, GENETICS & EVOLUTION", 20 + colWidth, 32);

      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.2);
      const bioPoints = [
        "• Sperm Anatomy: Head (Acrosome + DNA), Midpiece (Mitochondria), Tail",
        "• Fertilization Receptor: ZP3 receptor on Zona Pellucida",
        "• Menstrual Cycle: LH Surge triggers ovulation on Day 14",
        "• Implantation Site: Normal in Uterus endometrium; Ectopic outside uterus",
        "• Flowering Plants: Microsporogenesis & Megasporogenesis",
        "• Pollination: Geitonogamy (same plant, diff flower) vs Xenogamy (cross)",
        "• DNA Replication: Leading & Lagging strands; SSB stabilizes ssDNA",
        "• Transcription: RNA Pol binds TATA Box in promoter",
        "• Base Pairing: A = T (2 hydrogen bonds), G = C (3 hydrogen bonds)",
        "• Evolution: Oparin-Haldane chemical origin theory",
        "• STDs: Syphilis (Treponema pallidum), HIV, Chlamydia",
        "• Genetics: Mendel's Monohybrid (3:1 phenotype, 1:2:1 genotype)"
      ];
      bioPoints.forEach((pt, pIdx) => {
        pdf.text(pt, 20 + colWidth, 42 + (pIdx * 6.5));
      });

      // Col 3: Bengali A & English B
      pdf.setFillColor(254, 243, 199); // Amber
      pdf.roundedRect(20 + colWidth * 2, 18, colWidth, pdfHeight - 32, 3, 3, "F");
      pdf.setDrawColor(245, 158, 11);
      pdf.roundedRect(20 + colWidth * 2, 18, colWidth, pdfHeight - 32, 3, 3, "S");

      pdf.setTextColor(180, 83, 9);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.text("BENGALI A & ENGLISH B", 24 + colWidth * 2, 26);
      pdf.setTextColor(217, 119, 6);
      pdf.setFontSize(7.5);
      pdf.text("LITERATURE & CRITICAL DATA POINTS", 24 + colWidth * 2, 32);

      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.2);
      const litPoints = [
        "• Adarini (আদিরিনী): Prabhat Kumar Mukhopadhyay",
        "• Adarini Critical Fact: Elephant purchase price was 2000 rupees",
        "• The Bet (Anton Chekhov): Wager was 2 million rubles for 15 years",
        "• Strong Roots (APJ Kalam): Spiritual upbringing in Rameswaram",
        "• The Night Train at Deoli (Ruskin Bond): Basket seller girl narrative",
        "• Ulysses (Tennyson): 'To strive, to seek, to find, and not to yield'",
        "• Riders to the Sea (J.M. Synge): Maurya's tragedy; Sea as antagonist",
        "• Our Casuarina Tree (Toru Dutt): Nostalgia & immortality of nature",
        "• Bangla Bhasha (Swami Vivekananda): Thoughts on language & education",
        "• Dharmma (Srijato): Manush-er dharma vs Institutional religion",
        "• Potraj (Shankar Rao Kharat): Marathi translation of Dalit struggle",
        "• Linguistics: Phonemics (ধ্বনিতত্ত্ব), Semantics (শব্দার্থতত্ত্ব)"
      ];
      litPoints.forEach((pt, pIdx) => {
        pdf.text(pt, 24 + colWidth * 2, 42 + (pIdx * 6.5));
      });

      // Footer for Page 2
      pdf.setFillColor(241, 245, 249);
      pdf.rect(0, pdfHeight - 8, pdfWidth, 8, "F");
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(7.5);
      pdf.text("Page 2 of " + (slides.length + 2) + " • High-Yield Revision Matrix • Prepared for Abhijit", 15, pdfHeight - 3);

      // -------------------------------------------------------------
      // 3. PAGES 3+: High-Resolution Master Lecture Slide Plates
      // -------------------------------------------------------------
      for (let i = 0; i < slides.length; i++) {
        setExportProgress(Math.round(((i + 1) / slides.length) * 100));
        setExportingSlideIndex(i);
        
        // Wait for offscreen high-res container to render formulas & images
        await new Promise(resolve => setTimeout(resolve, 450));

        let dataUrl: string | null = null;
        if (printPlateRef.current) {
          try {
            dataUrl = await domToPng(printPlateRef.current, {
              scale: 1.6,
              backgroundColor: "#ffffff",
              font: false,
              style: { opacity: '1' }
            });
          } catch (_) {
            dataUrl = null;
          }
        }

        // Fallback to active board screen if print engine was not captured
        if (!dataUrl && boardRef.current) {
          setCurrentPage(i);
          await new Promise(resolve => setTimeout(resolve, 300));
          dataUrl = await domToPng(boardRef.current, {
            scale: 2.0,
            backgroundColor: "#ffffff",
            font: false
          });
        }

        if (dataUrl) {
          pdf.addPage();
          
          // Header Bar
          pdf.setFillColor(15, 23, 42);
          pdf.rect(0, 0, pdfWidth, 12, "F");
          pdf.setTextColor(245, 158, 11);
          pdf.setFontSize(8.5);
          pdf.setFont("helvetica", "bold");
          pdf.text(`WBCHSE Class 12 Sem 3 • Lecture Module ${i + 1} of ${slides.length}`, 15, 8);
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(7.5);
          pdf.text("7 Days to Mathematics Exam • Study Stranger AI Master Notes", pdfWidth - 85, 8);

          // Full-page High-Resolution Slide Plate
          pdf.addImage(dataUrl, "PNG", 0, 12, pdfWidth, pdfHeight - 20, undefined, 'FAST');

          // Footer Bar
          pdf.setFillColor(248, 250, 252);
          pdf.rect(0, pdfHeight - 8, pdfWidth, 8, "F");
          pdf.setTextColor(148, 163, 184);
          pdf.setFontSize(7.5);
          pdf.text(`Page ${i + 3} of ${slides.length + 2} • Prepared for Abhijit (অভিজিৎ) • Official WBCHSE Study Dossier`, 15, pdfHeight - 3);
        }
      }

      setExportingSlideIndex(null);
      setCurrentPage(originalPage);
      pdf.save(`WBCHSE_Class12_Sem3_Master_Revision_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export failed", error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportingSlideIndex(null);
    }
  };

  const currentStickyNotes = stickyNotes.filter(n => n.page === currentPage);

  return (
    <motion.div
      layout
      className={`relative ${theme.bgGradient} flex flex-col transition-all duration-700 overflow-hidden ${
        isExpanded 
          ? "fixed inset-0 z-[1000] rounded-none shadow-none w-screen h-[100dvh]" 
          : "h-full w-full rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200/80 dark:border-white/10"
      }`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[65%] h-[80%] blur-[160px] rounded-full rotate-45 transition-colors duration-1000" 
          style={{ backgroundColor: theme.accentGlow }}
        />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[65%] h-[80%] blur-[160px] rounded-full -rotate-12 transition-colors duration-1000" 
          style={{ backgroundColor: theme.accentGlow }}
        />
        <div className={`absolute inset-0 ${
          theme.isLight ? 'bg-[radial-gradient(rgba(15,23,42,0.04)_1px,transparent_1px)]' : 'bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)]'
        } bg-[length:32px_32px]`} />
      </div>

      {/* Header Toolbar - Compact and Mobile-Friendly */}
      <div 
        className={`px-2.5 sm:px-6 md:px-8 py-2 sm:py-3 flex justify-between items-center z-40 transition-all ${
          isExpanded ? (theme.isLight ? 'bg-white/95' : 'bg-black/90') : theme.surfaceBg
        } backdrop-blur-2xl border-b ${theme.headerBorder} shadow-lg relative shrink-0`} 
        data-html2canvas-ignore="true"
      >
        {isExporting && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${exportProgress}%` }}
            className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-500 shadow-lg z-[60]"
          />
        )}

        {/* Brand & Badge */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <div className="relative shrink-0">
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl sm:rounded-2xl shadow-md text-white">
              <BoardIcon size={isMobile ? 15 : 18} />
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className={`text-xs sm:text-base font-black ${theme.isLight ? 'text-slate-900' : 'text-white'} uppercase tracking-wider truncate`}>
                Whiteboard
              </h2>
              <span className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black rounded-md ${theme.badgeBg} shrink-0`}>
                7 DAYS TO MATH
              </span>
            </div>
            <p className={`hidden md:block text-[10px] ${theme.isLight ? 'text-slate-500' : 'text-white/50'} font-bold tracking-widest uppercase truncate font-mono`}>
              {theme.name} • {slides.length} Slides • Speed: {typingSpeed}
            </p>
          </div>
        </div>

        {/* Action Controls - Scrollable Row on Small Mobile */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto scrollbar-hide py-0.5">
          {/* AI Auto-Scroll Toggle Button */}
          <button
            onClick={() => {
              setIsAutoScrollEnabled(!isAutoScrollEnabled);
              soundEffects.playClick();
            }}
            className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              isAutoScrollEnabled 
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20" 
                : "bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-white/10"
            }`}
            title={isAutoScrollEnabled ? "AI অটো-স্ক্রল চালু (AI Auto-Scroll Active)" : "AI অটো-স্ক্রল বন্ধ"}
          >
            <Bot size={13} className={isAutoScrollEnabled ? "animate-pulse" : ""} />
            <span className="hidden sm:inline">AI Scroll</span>
          </button>

          {/* Quick Day / Night Board Flip Button */}
          <button
            onClick={toggleDayNightBoard}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              theme.isLight 
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' 
                : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
            }`}
            title={theme.isLight ? "ডার্ক বোর্ডে সুইচ করুন" : "হোয়াইটবোর্ডে সুইচ করুন"}
          >
            {theme.isLight ? <Moon size={14} className="text-indigo-600" /> : <Sun size={14} className="text-amber-400" />}
            <span className="hidden lg:inline">{theme.isLight ? "Dark" : "White"}</span>
          </button>

          {/* Add Web Image Button */}
          {onAddElement && (
            <button
              onClick={() => setShowWebImageModal(true)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Add web image or search visual diagrams"
            >
              <Globe size={13} />
              <span className="hidden sm:inline">+ Visual</span>
            </button>
          )}

          {/* Syllabus Presets Menu */}
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-600 dark:text-amber-200 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Load WBCHSE Semester 3 Topics"
          >
            <BookOpen size={13} className="text-amber-500" />
            <span className="hidden sm:inline">Topics</span>
          </button>

          {/* Typing Speed Selector */}
          <div className="hidden sm:flex items-center rounded-xl bg-black/5 dark:bg-white/10 border border-slate-300 dark:border-white/15 p-0.5">
            {(["1x", "2x", "4x", "instant"] as TypingSpeed[]).map((sp) => (
              <button
                key={sp}
                onClick={() => changeTypingSpeed(sp)}
                className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                  typingSpeed === sp 
                    ? "bg-amber-500 text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white"
                }`}
                title={`Speed: ${sp}`}
              >
                {sp === "instant" ? "⚡All" : sp}
              </button>
            ))}
          </div>

          {/* Drawing Annotation Mode Toggle */}
          <button
            onClick={() => setIsDrawMode(!isDrawMode)}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              isDrawMode 
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md" 
                : "bg-black/5 dark:bg-white/10 text-slate-700 dark:text-white border-slate-300 dark:border-white/15"
            }`}
            title="Pen / Marker"
          >
            <Highlighter size={13} />
            <span className="hidden lg:inline">{isDrawMode ? "Pen ON" : "Draw"}</span>
          </button>

          {/* Audio Speech Read Aloud (Sync with Typewriter) */}
          <button
            onClick={toggleSpeech}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isSpeaking 
                ? "bg-pink-500 text-white border-pink-400 animate-pulse shadow-md" 
                : "bg-black/5 dark:bg-white/10 text-slate-700 dark:text-white border-slate-300 dark:border-white/15"
            }`}
            title={isSpeaking ? "Stop AI Voice" : "AI কথা বলা ও টাইপিং"}
          >
            {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Instant Board Snapshot Button */}
          <button
            onClick={takeBoardSnapshot}
            disabled={isCapturingSnapshot || elements.length === 0}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 hover:from-sky-600 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 active:scale-95 shrink-0"
            title="Take Board Snapshot (HD PNG Download)"
          >
            {isCapturingSnapshot ? <RefreshCw size={13} className="animate-spin text-white" /> : <Camera size={13} />}
            <span className="text-[10px] sm:text-xs font-black">Snapshot</span>
          </button>

          {/* Luxury PDF Export */}
          <button
            onClick={exportToPDF}
            disabled={isExporting || elements.length === 0}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-600 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 active:scale-95 shrink-0"
            title="Export WBCHSE Master Revision PDF"
          >
            {isExporting ? <RefreshCw size={13} className="animate-spin text-white" /> : <FileDown size={13} />}
            <span className="text-[10px] sm:text-xs font-black">PDF</span>
          </button>

          {/* Expand Fullscreen */}
          <button
            onClick={onToggleExpand}
            className="p-1.5 sm:p-2 rounded-xl bg-black/5 dark:bg-white/10 text-slate-700 dark:text-white border border-slate-300 dark:border-white/15 cursor-pointer"
            title={isExpanded ? "Exit Fullscreen" : "Fullscreen Board"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Preset Topics Drawer */}
      <AnimatePresence>
        {showPresets && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-14 left-2 right-2 sm:left-4 sm:right-4 max-w-4xl mx-auto z-50 ${
              theme.isLight ? 'bg-white/98 text-slate-900 border-amber-300' : 'bg-slate-950/98 text-white border-amber-400/40'
            } border rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl max-h-[85vh] overflow-hidden flex flex-col`}
            data-html2canvas-ignore="true"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/15 shrink-0">
              <div className="flex items-center gap-2">
                <Flame className="text-amber-500" size={18} />
                <h3 className="text-sm sm:text-base font-black">
                  WBCHSE Semester 3 Topics (Math, Bio, Bengali, English)
                </h3>
              </div>
              <button
                onClick={() => setShowPresets(false)}
                className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-slate-700 dark:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1">
              {SYLLABUS_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className={`p-3.5 rounded-2xl ${
                    theme.isLight ? 'bg-slate-50 hover:bg-amber-50/50 border-slate-200' : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/10'
                  } border hover:border-amber-400/50 transition-all cursor-pointer flex flex-col justify-between group`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                        {preset.subject}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{preset.badge}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors bangla-text">
                      {preset.title}
                    </h4>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    <span>{preset.elements.length} Slides</span>
                    <span className="flex items-center gap-1">Load Topic &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web Image Modal */}
      <AnimatePresence>
        {showWebImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1500] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
            data-html2canvas-ignore="true"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl text-slate-900 dark:text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-cyan-600" />
                  <h3 className="text-sm sm:text-base font-bold">Add Web Visual to Board</h3>
                </div>
                <button onClick={() => setShowWebImageModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                <button
                  onClick={() => setWebImageTab("url")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    webImageTab === "url" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🔗 Image URL
                </button>
                <button
                  onClick={() => setWebImageTab("search")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    webImageTab === "search" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🔍 Web Search
                </button>
                <button
                  onClick={() => setWebImageTab("presets")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    webImageTab === "presets" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  📚 Gallery
                </button>
              </div>

              {webImageTab === "url" && (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={webImageUrl}
                    onChange={(e) => setWebImageUrl(e.target.value)}
                    placeholder="https://... (image URL)"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-white/15 outline-none focus:border-cyan-500"
                  />
                  {webImageUrl.trim() && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black/10 flex items-center justify-center">
                      <img src={webImageUrl} alt="Preview" className="w-full h-full object-contain" onError={() => {}} />
                    </div>
                  )}
                </div>
              )}

              {webImageTab === "search" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. calculus, integration, sperm cell, pollination..."
                      className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-white/15 outline-none focus:border-cyan-500"
                      onKeyDown={(e) => e.key === "Enter" && handleSearchImages()}
                    />
                    <button
                      onClick={handleSearchImages}
                      disabled={isSearching || !searchQuery.trim()}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Search size={13} />
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {searchResults.map((r, i) => (
                        <div
                          key={i}
                          onClick={() => setWebImageUrl(r.url)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            webImageUrl === r.url ? "border-cyan-500 bg-cyan-500/10" : "border-slate-200 dark:border-white/10"
                          }`}
                        >
                          <img src={r.url} alt={r.title} className="w-full h-16 object-cover rounded-lg mb-1" />
                          <p className="text-[10px] font-bold truncate">{r.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {webImageTab === "presets" && (
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {[
                    { label: "📐 Calculus Integrals", url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop" },
                    { label: "🧬 DNA Replication", url: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop" },
                    { label: "🌸 Flower Pollination", url: "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop" },
                    { label: "🐘 Adarini Elephant", url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop" },
                    { label: "🚂 Night Train Deoli", url: "https://images.unsplash.com/photo-1532103054090-334e6e60ae29?q=80&w=1200&auto=format&fit=crop" },
                    { label: "🔬 Cell Biology", url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop" }
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => setWebImageUrl(p.url)}
                      className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                        webImageUrl === p.url ? "border-cyan-500 bg-cyan-500/10" : "border-slate-200 dark:border-white/10"
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-14 object-cover rounded-lg mb-1" />
                      <span className="text-[10px] font-bold block truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setShowWebImageModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWebImage}
                  disabled={!webImageUrl.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-40 cursor-pointer"
                >
                  Add to Board
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN BOARD STAGE - Mobile Optimized & Completely Scrollable */}
      <div 
        ref={boardRef}
        className={`flex-1 overflow-hidden relative flex flex-col items-center justify-start ${
          isExpanded ? 'p-1.5 sm:p-5 md:p-8' : 'p-1.5 sm:p-4'
        }`}
      >
        {/* Drawing Canvas Overlay */}
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className={`absolute inset-0 z-20 ${
            isDrawMode ? "pointer-events-auto cursor-crosshair touch-none" : "pointer-events-none"
          }`}
        />

        {/* Floating AI Board Control Toolbar (Full Control: Auto-Scroll, Top, Bottom, Prev, Next, Voice) */}
        <div 
          className="absolute right-2 sm:right-5 top-2 sm:top-3 z-30 flex flex-col items-center gap-1 sm:gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1 sm:p-1.5 rounded-2xl border border-slate-300 dark:border-white/20 shadow-xl"
          data-html2canvas-ignore="true"
        >
          {/* AI Auto-Scroll Mode Button */}
          <button
            onClick={() => {
              setIsAutoScrollEnabled(!isAutoScrollEnabled);
              soundEffects.playClick();
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
              isAutoScrollEnabled 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/40" 
                : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
            }`}
            title={isAutoScrollEnabled ? "AI অটো-স্ক্রল চালু (AI Auto-Scroll Active)" : "AI অটো-স্ক্রল বন্ধ"}
          >
            <Bot size={isMobile ? 13 : 15} className={isAutoScrollEnabled ? "animate-pulse" : ""} />
          </button>

          {/* Quick Voice Read Aloud Button */}
          <button
            onClick={toggleSpeech}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
              isSpeaking 
                ? "bg-rose-500 text-white animate-pulse shadow-md" 
                : "bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200"
            }`}
            title={isSpeaking ? "ভয়েস বন্ধ করুন" : "AI কথা বলা শুনুন"}
          >
            {isSpeaking ? <VolumeX size={isMobile ? 12 : 14} /> : <Volume2 size={isMobile ? 12 : 14} />}
          </button>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            title="Scroll to Top (উপরে স্ক্রল)"
          >
            <ArrowUp size={isMobile ? 12 : 14} />
          </button>

          {/* Scroll to Bottom */}
          <button
            onClick={scrollToBottom}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            title="Scroll to Bottom (নিচে স্ক্রল)"
          >
            <ArrowDown size={isMobile ? 12 : 14} />
          </button>

          <div className="w-4 h-[1px] bg-slate-200 dark:bg-white/10 my-0.5" />

          {/* Previous Slide */}
          <button
            onClick={() => {
              if (currentPage > 0) {
                setCurrentPage(p => p - 1);
                soundEffects.playClick();
              }
            }}
            disabled={currentPage === 0}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-all cursor-pointer disabled:opacity-20"
            title="Previous Slide (পূর্ববর্তী স্লাইড)"
          >
            <ChevronLeft size={isMobile ? 12 : 14} />
          </button>

          {/* Next Slide */}
          <button
            onClick={() => {
              if (currentPage < slides.length - 1) {
                setCurrentPage(p => p + 1);
                soundEffects.playClick();
              }
            }}
            disabled={currentPage >= slides.length - 1}
            className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 transition-all cursor-pointer disabled:opacity-20"
            title="Next Slide (পরবর্তী স্লাইড)"
          >
            <ChevronRight size={isMobile ? 12 : 14} />
          </button>

          {/* Slide indicator */}
          <span className="text-[8px] font-mono font-black text-slate-500 dark:text-slate-400 py-0.5">
            {currentPage + 1}/{slides.length}
          </span>
        </div>

        {/* Pinned Sticky Notes */}
        {currentStickyNotes.map(n => (
          <motion.div
            key={n.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-4 left-4 z-30 p-2.5 sm:p-3 bg-amber-200 text-amber-950 rounded-2xl shadow-xl border border-amber-300 max-w-[240px] sm:max-w-xs font-sans text-xs font-medium rotate-[-2deg]"
          >
            <div className="flex items-center justify-between gap-2 mb-1 border-b border-amber-300 pb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <StickyNote size={11} /> Note
              </span>
              <button
                onClick={() => setStickyNotes(prev => prev.filter(x => x.id !== n.id))}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
            <p className="bangla-text text-[11px] sm:text-xs">{n.text}</p>
          </motion.div>
        ))}

        <AnimatePresence mode="wait">
          {!elements || elements.length === 0 ? (
            <motion.div
              key="empty-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4 max-w-lg z-10 my-auto"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-sky-500/20 to-emerald-500/20 border-2 border-dashed border-indigo-400/40 flex items-center justify-center shadow-xl">
                <Sparkles size={isMobile ? 28 : 38} className="animate-pulse text-indigo-600" />
              </div>
              <div className="space-y-1.5">
                <h3 className={`text-base sm:text-2xl font-black ${theme.isLight ? 'text-slate-900' : 'text-white'}`}>
                  Interactive WBCHSE Study Board
                </h3>
                <p className={`text-[11px] sm:text-sm ${theme.isLight ? 'text-slate-600' : 'text-slate-300'} max-w-md bangla-text`}>
                  গণিত পরীক্ষা ও সেমিস্টার ৩ এর জন্য যেকোনো বিষয় বেছে নিন:
                </p>
              </div>

              {/* Quick Launch Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-1">
                <button
                  onClick={() => handleLoadPreset(SYLLABUS_PRESETS[0])}
                  className={`p-3 rounded-2xl ${
                    theme.isLight ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950' : 'bg-cyan-500/10 border-cyan-500/30 text-white'
                  } border text-left transition-all cursor-pointer flex items-center gap-2.5 shadow-sm`}
                >
                  <span className="text-xl">📐</span>
                  <div>
                    <h5 className="text-xs font-bold">Mathematics (গণিত)</h5>
                    <p className="text-[10px] opacity-75">Calculus, Vectors & Formulas</p>
                  </div>
                </button>
                <button
                  onClick={() => handleLoadPreset(SYLLABUS_PRESETS[1])}
                  className={`p-3 rounded-2xl ${
                    theme.isLight ? 'bg-purple-50/90 border-purple-200 text-purple-950' : 'bg-indigo-500/10 border-indigo-500/30 text-white'
                  } border text-left transition-all cursor-pointer flex items-center gap-2.5 shadow-sm`}
                >
                  <span className="text-xl">🧬</span>
                  <div>
                    <h5 className="text-xs font-bold">Biology Reproduction</h5>
                    <p className="text-[10px] opacity-75">ZP3, Acrosome & LH Surge</p>
                  </div>
                </button>
                <button
                  onClick={() => handleLoadPreset(SYLLABUS_PRESETS[2])}
                  className={`p-3 rounded-2xl ${
                    theme.isLight ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950' : 'bg-emerald-500/10 border-emerald-500/30 text-white'
                  } border text-left transition-all cursor-pointer flex items-center gap-2.5 shadow-sm`}
                >
                  <span className="text-xl">🔬</span>
                  <div>
                    <h5 className="text-xs font-bold">Genetics & DNA</h5>
                    <p className="text-[10px] opacity-75">Replication Fork & SSB Protein</p>
                  </div>
                </button>
                <button
                  onClick={() => handleLoadPreset(SYLLABUS_PRESETS[4])}
                  className={`p-3 rounded-2xl ${
                    theme.isLight ? 'bg-amber-50/90 border-amber-200 text-amber-950' : 'bg-amber-500/10 border-amber-500/30 text-white'
                  } border text-left transition-all cursor-pointer flex items-center gap-2.5 shadow-sm`}
                >
                  <span className="text-xl">📚</span>
                  <div>
                    <h5 className="text-xs font-bold">বাংলা এ: আদিরিনী</h5>
                    <p className="text-[10px] opacity-75">প্রভাত কুমার মুখোপাধ্যায়</p>
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`slide-${currentPage}`}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full flex flex-col items-center justify-start overflow-hidden z-10"
            >
              {/* Scrollable Container with NO justify-center so Mobile content never gets clipped at the top */}
              <div 
                ref={scrollContainerRef}
                className="w-full max-w-5xl h-full flex flex-col gap-3 sm:gap-4 p-1 sm:p-3 overflow-y-auto scroll-smooth overscroll-contain pb-32 sm:pb-24 touch-pan-y"
              >
                {slides[currentPage]?.map((el, elIdx) => (
                  <motion.div 
                    key={`el-${el.id || elIdx}-${elIdx}`} 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full shrink-0"
                  >
                    {el.type === "text" ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.35 }}
                        className={`relative w-full rounded-2xl sm:rounded-3xl p-[1px] md:p-[2px] ${
                          theme.isLight 
                            ? 'bg-gradient-to-br from-indigo-100 via-slate-200 to-transparent shadow-lg' 
                            : 'bg-gradient-to-br from-white/20 via-white/5 to-transparent'
                        } ${theme.chalkGlow} overflow-hidden`}
                      >
                        <div className={`w-full ${theme.cardBg} border ${theme.cardBorder} rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-10 shadow-xl backdrop-blur-3xl flex flex-col justify-start items-start`}>
                          <FormattedSlideText 
                            content={el.content} 
                            theme={theme}
                            fontSizeClass={fontSizeClassMap[fontSize]}
                            enableTypewriter={isTypewriterEnabled}
                            typingSpeed={typingSpeed}
                            speechCharIndex={speechCharIndex}
                            isSpeaking={isSpeaking}
                            onTextProgress={handleTextProgress}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="relative w-full aspect-auto flex items-center justify-center my-1.5 sm:my-2"
                      >
                        <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-white/15 shadow-xl bg-white dark:bg-black/50 p-1 sm:p-2 flex items-center justify-center">
                          <BoardImage content={el.content} theme={theme} />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {/* Bottom Scroll Anchor ensuring newest AI content is in view */}
                <div ref={bottomAnchorRef} className="h-6 shrink-0 pointer-events-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overview Drawer */}
        <AnimatePresence>
          {showOverview && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 z-50 bg-black/85 p-4 sm:p-10 flex flex-col text-white"
              data-html2canvas-ignore="true"
            >
              <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider">
                      Slide Overview
                    </h3>
                    <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                      {slides.length} Slides
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowOverview(false)} 
                    className="p-2.5 bg-white/10 hover:bg-rose-500 rounded-full transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1">
                  {slides.map((slide, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrentPage(idx);
                        setShowOverview(false);
                        soundEffects.playClick();
                      }}
                      className={`relative aspect-[1.35/1] rounded-2xl overflow-hidden border-2 transition-all p-2.5 flex flex-col items-center justify-between bg-slate-950/80 cursor-pointer ${
                        currentPage === idx 
                          ? 'border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                          : 'border-white/15 hover:border-white/40'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between text-[8px] font-black uppercase text-slate-400">
                        <span>Slide {idx + 1}</span>
                        {currentPage === idx && <span className="text-indigo-400">ACTIVE</span>}
                      </div>
                      <div className="text-[10px] text-slate-200 text-center line-clamp-3 font-medium px-1 bangla-text">
                        {slide[0]?.type === 'image' 
                          ? `🖼️ Visual: ${slide[0]?.content.slice(0, 30)}` 
                          : slide[0]?.content.slice(0, 60) + '...'}
                      </div>
                      <div className="w-full text-right text-[8px] font-mono text-slate-400">
                        {slide.length} element{slide.length > 1 ? 's' : ''}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation Bar - Clean, Compact & Accessible on Mobile */}
      <div 
        className={`relative px-3 sm:px-6 md:px-8 py-2 sm:py-3 ${
          theme.isLight ? 'bg-white/95 border-t border-slate-200 text-slate-800' : 'bg-black/80 border-t border-white/10 text-white'
        } backdrop-blur-2xl flex items-center justify-between z-30 shrink-0 shadow-lg`} 
        data-html2canvas-ignore="true"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`text-[11px] sm:text-xs font-black ${theme.accentText} tracking-wider font-mono`}>
            {currentPage + 1} / {slides.length}
          </span>
          <div className="hidden sm:flex items-center gap-1.5 max-w-[200px] overflow-hidden">
            {slides.slice(0, 10).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentPage(i); soundEffects.playClick(); }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentPage === i 
                    ? `w-5 ${theme.bulletColor}` 
                    : theme.isLight ? "w-1.5 bg-slate-300 hover:bg-slate-500" : "w-1.5 bg-white/20 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile Slide Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setCurrentPage(p => Math.max(0, p - 1)); soundEffects.playClick(); }}
            disabled={currentPage === 0}
            className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-white rounded-xl disabled:opacity-30 cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft size={15} />
            <span className="hidden sm:inline">Prev</span>
          </button>
          
          <button
            onClick={() => setShowOverview(!showOverview)}
            className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold cursor-pointer"
          >
            Slides
          </button>

          <button
            onClick={() => { setCurrentPage(p => Math.min(slides.length - 1, p + 1)); soundEffects.playClick(); }}
            disabled={currentPage === slides.length - 1}
            className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-white rounded-xl disabled:opacity-30 cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold">
          {/* Quick Font Size Controls */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-0.5 rounded-lg border border-slate-300 dark:border-white/10">
            {(["sm", "base", "lg", "xl"] as const).map(sz => (
              <button
                key={sz}
                onClick={() => changeFontSize(sz)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer ${
                  fontSize === sz ? "bg-indigo-600 text-white font-black" : "opacity-60 hover:opacity-100"
                }`}
              >
                {sz.toUpperCase()}
              </button>
            ))}
          </div>

          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Sync
          </span>
        </div>
      </div>

      {/* Offscreen Dedicated High-Resolution Desktop Print Engine */}
      <div 
        ref={printPlateRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: '1200px',
          minHeight: '680px',
          zIndex: -100,
          background: '#ffffff',
          color: '#0f172a',
          pointerEvents: 'none'
        }}
        className="p-8 font-sans"
        data-html2canvas-ignore="true"
      >
        {exportingSlideIndex !== null && slides[exportingSlideIndex] && (
          <div className="w-full flex flex-col gap-5">
            {/* Top Plate Header Banner */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-indigo-600">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl text-white font-black text-sm">
                  WBCHSE
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                    Class 12 Semester 3 • Lecture Module {exportingSlideIndex + 1} of {slides.length}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Master Academic Deck • 7 Days to Higher Mathematics Exam
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-300">
                  Target: 95%+ Exam Readiness
                </span>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Student: Abhijit (অভিজিৎ)</p>
              </div>
            </div>

            {/* Slide Elements Rendered in Crisp Desktop Cards */}
            <div className="w-full flex flex-col gap-4">
              {slides[exportingSlideIndex].map((el, elIdx) => (
                <div key={`print-plate-el-${elIdx}`} className="w-full">
                  {el.type === "text" ? (
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                      <FormattedSlideText 
                        content={el.content} 
                        theme={BOARD_THEMES.whiteboard}
                        fontSizeClass="text-base"
                        enableTypewriter={false}
                        typingSpeed="instant"
                      />
                    </div>
                  ) : (
                    <div className="w-full border-2 border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col items-center">
                      <img 
                        src={getFallbackImage(el.content)} 
                        alt={el.content} 
                        className="max-h-[380px] object-contain rounded-xl shadow-md"
                        crossOrigin="anonymous"
                      />
                      <p className="text-xs font-black text-slate-700 mt-3 uppercase tracking-wider">
                        Visual Plate: {el.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Exam Callout Note on Plate */}
            <div className="mt-2 p-3.5 rounded-xl bg-amber-50/90 border-l-4 border-amber-500 flex items-start gap-3">
              <span className="text-lg">💡</span>
              <div>
                <h4 className="text-xs font-black text-amber-900 uppercase">WBCHSE High-Yield Revision Note</h4>
                <p className="text-xs text-amber-800">
                  পরীক্ষার জন্য এই অধ্যায়ের প্রতিটি সংজ্ঞার্থ, চিত্র এবং সূত্র বারবার রিভিশন দিন। বিশেষত গণিত ও জীববিদ্যার প্রশ্নাবলীতে সরাসরি ডায়াগ্রাম ও সূত্র উল্লেখ করুন।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
