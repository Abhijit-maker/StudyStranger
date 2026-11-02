import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Eye,
  Sparkles,
  ArrowRight,
  BookOpen,
  Mic,
  ShieldCheck,
  Loader2,
  Volume2,
  VolumeX,
  Zap,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Users,
  Target,
  Brain,
  Award,
  Layers,
  Check,
  Play,
  RotateCcw,
} from "lucide-react";
import { FAQ, SYLLABUS, MENTORS, TOOLS, NOTES } from "../data.js";
import { PWAInstallButton } from "../components/PWAInstallButton";
import { DocumentPreviewModal } from "../components/DocumentPreviewModal";
import { HeroIllustrationStage } from "../components/HeroIllustrationStage";
import { Hero3DCanvas } from "../components/Hero3DCanvas";
import { AnimeMentorShowcase } from "../components/AnimeMentorShowcase";
import { voiceService } from "../services/voiceService";
import { soundEffects } from "../services/soundEffectsService";
import {
  StoredPDFRecord,
  subscribeToSharedDocuments,
  getPdfFromIndexedDB,
  isDummySeed,
  deletePdfFromIndexedDB,
} from "../services/pdfStorageService";
import { getHourlyQuestion } from "../data/questionOfTheDayBank";
import { COMMUNITY_LINKS } from "../data/communityLinks";

export default function Landing() {
  const nav = useNavigate();
  const [sharedPdfs, setSharedPdfs] = useState<StoredPDFRecord[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);
  const [loadingPdfId, setLoadingPdfId] = useState<string | null>(null);

  // Audio showcase playing state
  const [playingMentorId, setPlayingMentorId] = useState<string | null>(null);

  // Revision notes active tab (Screenshot 1)
  const [activeNoteIndex, setActiveNoteIndex] = useState<number>(0);

  // Hourly Interactive Question of the Day
  const [hourlyData, setHourlyData] = useState(() => getHourlyQuestion());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const fresh = getHourlyQuestion();
      setHourlyData((prev) => {
        if (prev.hourIndex !== fresh.hourIndex) {
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
        }
        return fresh;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSharedDocuments((docs) => {
      // Purge any dummy records encountered
      docs.forEach((d) => {
        if (isDummySeed(d)) {
          deletePdfFromIndexedDB(d.id).catch(() => {});
        }
      });
      setSharedPdfs(docs.filter((d) => !isDummySeed(d)));
    });
    return () => unsubscribe();
  }, []);

  const handleOpenSharedPdf = async (docItem: StoredPDFRecord) => {
    setLoadingPdfId(docItem.id);
    try {
      const full = await getPdfFromIndexedDB(docItem.id);
      const dataUrl =
        full?.blobUrl ||
        full?.dataUrl ||
        docItem.blobUrl ||
        docItem.dataUrl ||
        docItem.streamUrl ||
        `/api/shared-documents/${encodeURIComponent(docItem.id)}/stream`;
      setPreviewDoc({
        url: dataUrl,
        name: docItem.name,
      });
    } catch {
      setPreviewDoc({
        url:
          docItem.blobUrl ||
          docItem.dataUrl ||
          docItem.streamUrl ||
          `/api/shared-documents/${encodeURIComponent(docItem.id)}/stream`,
        name: docItem.name,
      });
    } finally {
      setLoadingPdfId(null);
    }
  };

  const handlePlayMentorVoice = (mentorId: string, voiceSampleText: string) => {
    if (playingMentorId === mentorId) {
      voiceService.stop();
      setPlayingMentorId(null);
      return;
    }
    voiceService.stop();
    setPlayingMentorId(mentorId);
    voiceService.speak(voiceSampleText, {
      character: mentorId as any,
      rate: 1.05,
      onStart: () => setPlayingMentorId(mentorId),
      onEnd: () => setPlayingMentorId(null),
      onError: () => setPlayingMentorId(null),
    });
  };

  const currentNote = NOTES[activeNoteIndex] || NOTES[0];

  return (
    <div className="pro-app-root selection:bg-orange-500 selection:text-white" style={{ background: "#FAF9F5" }}>
      {/* 1. TOPBAR / NAVIGATION */}
      <header className="topbar sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#18181b]/10">
        <div className="wrap flex items-center justify-between h-[72px] gap-4">
          <Link to="/" className="brand flex items-center gap-2.5 text-decoration-none text-[#18181b]">
            <img src="/logo.svg" alt="Study Stranger" className="w-8 h-8 rounded-lg" />
            <span className="font-serif font-black text-xl tracking-tight">Study Stranger</span>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-[10px] font-black uppercase tracking-wider">
              PRO
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-[#18181b]/80">
            <a href="#math-lab" className="hover:text-[#18181b] no-underline transition-colors text-indigo-700 font-black">
              📐 Math Lab
            </a>
            <a href="#features" className="hover:text-[#18181b] no-underline transition-colors">
              Features
            </a>
            <a href="#voice-showcase" className="hover:text-[#18181b] no-underline transition-colors">
              Voice AI
            </a>
            <a href="#3d-lab" className="hover:text-[#18181b] no-underline transition-colors">
              3D Science Lab
            </a>
            <a href="#all-tools" className="hover:text-[#18181b] no-underline transition-colors">
              24 Tools
            </a>
            <a href="#shared-pdfs" className="hover:text-[#18181b] no-underline transition-colors">
              PDFs
            </a>
            <a href="#faq" className="hover:text-[#18181b] no-underline transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={COMMUNITY_LINKS.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white font-black text-xs border border-[#18181b] shadow-[1.5px_1.5px_0px_#18181b] hover:bg-[#20ba59] transition-all no-underline"
              title="Join WBCHSE WhatsApp Group"
            >
              <span>💬 WhatsApp</span>
            </a>
            <a
              href={COMMUNITY_LINKS.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0088cc] text-white font-black text-xs border border-[#18181b] shadow-[1.5px_1.5px_0px_#18181b] hover:bg-[#0077b5] transition-all no-underline"
              title="Join Telegram Channel"
            >
              <span>✈️ Telegram</span>
            </a>
            <PWAInstallButton compact />
            <Link
              to="/login"
              className="hidden xs:inline-flex px-4 py-2 rounded-full border-2 border-[#18181b] bg-white text-[#18181b] font-bold text-xs shadow-[2px_2px_0px_#18181b] hover:bg-slate-50 transition-all no-underline"
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="px-4 sm:px-5 py-2.5 rounded-full bg-[#18181b] text-white font-bold text-xs sm:text-sm shadow-[3px_3px_0px_#FF7A30] hover:bg-slate-800 transition-all no-underline"
            >
              Enter Studio →
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN HERO SECTION (Screenshot 5: Learning that adapts to you.) */}
      <section className="hero pt-8 sm:pt-14 pb-8 text-center max-w-5xl mx-auto px-4">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
          <span className="px-3.5 py-1.5 rounded-full bg-[#FEF08A] border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] text-xs font-black inline-flex items-center gap-1.5">
            <Zap size={14} className="text-[#EA580C]" />
            <span>WBCHSE Class 12 • Semester 4 • Official Roadmap</span>
          </span>
          <a
            href="#math-lab"
            className="px-3.5 py-1.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] text-xs font-black inline-flex items-center gap-1.5 no-underline hover:bg-[#DBEAFE] transition-all"
          >
            <span>📐 Math Lab: Forward 1-2 &amp; Answer Key PDF</span>
          </a>
          <span className="px-3.5 py-1.5 rounded-full bg-[#BBF7D0] border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] text-xs font-black inline-flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#15803D]" />
            <span>1000MB PDF Library &amp; Folders</span>
          </span>
        </div>

        {/* Big Headline */}
        <h1 className="font-serif font-black text-4xl sm:text-6xl md:text-7xl text-[#18181b] tracking-tight leading-tight mb-4">
          Learning that <em className="italic">adapts</em> to you.
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#18181b]/80 font-medium leading-relaxed mb-6">
          Master Mathematics, Physics, Chemistry, Computer Science, Biology, Bengali A &amp; English B for Semester 4 with KaTeX LaTeX Math Lab, realistic 3D mentors, natural voice conversations, and 1000MB PDF vault.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-2xl bg-[#18181b] text-white text-sm font-black shadow-[3px_3px_0px_#FF7A30] hover:bg-slate-800 transition-all no-underline inline-flex items-center gap-2"
          >
            <span>Enter Study Studio →</span>
          </Link>

          <Link
            to="/login"
            className="px-5 py-3.5 rounded-2xl bg-[#EFF6FF] text-[#1D4ED8] text-sm font-black border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] hover:bg-[#DBEAFE] transition-all no-underline inline-flex items-center gap-2"
          >
            <span>📐 Open Math Lab →</span>
          </Link>

          <a
            href={COMMUNITY_LINKS.whatsappGroup}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-2xl bg-[#25D366] text-white text-sm font-black shadow-[3px_3px_0px_#18181b] hover:bg-[#20ba59] transition-all no-underline inline-flex items-center gap-2"
          >
            <span>💬 WhatsApp Group</span>
          </a>

          <a
            href={COMMUNITY_LINKS.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-2xl bg-[#0088cc] text-white text-sm font-black shadow-[3px_3px_0px_#18181b] hover:bg-[#0077b5] transition-all no-underline inline-flex items-center gap-2"
          >
            <span>✈️ Telegram Channel</span>
          </a>

          <PWAInstallButton />

          <a
            href="#3d-lab"
            className="px-5 py-3.5 rounded-2xl bg-white text-[#18181b] border-2 border-[#18181b] text-sm font-black shadow-[3px_3px_0px_#18181b] hover:bg-slate-50 transition-all no-underline"
          >
            Explore 3D Lab
          </a>
        </div>

        {/* Hero Illustration Stage (Mascot Card) */}
        <HeroIllustrationStage />
      </section>

      {/* 2.5 DEDICATED MATH LAB SHOWCASE SECTION */}
      <section id="math-lab" className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-[32px] border-3 border-[#18181b] bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 sm:p-8 shadow-[6px_6px_0px_#18181b] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-black uppercase tracking-wider mb-3 shadow-[2px_2px_0px_#18181b]">
                <span>📐 WBCHSE Sem 4 Math Lab</span>
                <span className="bg-amber-400 text-black px-1.5 py-0.2 rounded font-black text-[10px]">NEW</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#18181b] font-serif tracking-tight leading-tight">
                AI LaTeX Math Solver &amp; Multi-Question Parser
              </h2>
              <p className="text-sm sm:text-base text-slate-700 font-medium mt-3 leading-relaxed">
                উচ্চমাধ্যমিক সেমিস্টার ৪-এর ভেক্টর, ত্রিমাত্রিক জ্যামিতি (3D Geometry), নির্দিষ্ট সমাকলন ও অবকল সমীকরণ সমাধান করুন। একটি ছবিতে একাধিক প্রশ্ন থাকলে ধাপে ধাপে ফরওয়ার্ড ১-২ ফরম্যাটে সম্পূর্ণ নিখুঁত ব্যাখ্যা ও KaTeX সূত্রে বিশ্লেষণ এবং অ্যানসার কি PDF তৈরি।
              </p>

              {/* Badges / Features */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
                <div className="p-2.5 rounded-xl bg-white/90 border border-indigo-200 shadow-sm text-center">
                  <div className="text-base font-black text-indigo-700">🎁 ৫ বার ফ্রি</div>
                  <div className="text-[11px] font-bold text-slate-600 mt-0.5">ডিফল্ট অ্যাডমিন কী</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-indigo-200 shadow-sm text-center">
                  <div className="text-base font-black text-purple-700">⚡ নিজস্ব Key</div>
                  <div className="text-[11px] font-bold text-slate-600 mt-0.5">আনলিমিটেড সলভ</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-indigo-200 shadow-sm text-center">
                  <div className="text-base font-black text-amber-700">📑 ১-২ ফরম্যাট</div>
                  <div className="text-[11px] font-bold text-slate-600 mt-0.5">মাল্টি-প্রশ্ন ডিটেকশন</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-indigo-200 shadow-sm text-center">
                  <div className="text-base font-black text-emerald-700">📥 Answer PDF</div>
                  <div className="text-[11px] font-bold text-slate-600 mt-0.5">ভেক্টর প্রিন্ট এক্সপোর্ট</div>
                </div>
              </div>

              {/* Call to action */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black shadow-[3px_3px_0px_#18181b] no-underline inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  <span>📐 লঞ্চ ম্যাথ ল্যাব (Math Lab)</span>
                  <span>→</span>
                </Link>
                <a
                  href="#features"
                  className="px-5 py-3 rounded-2xl bg-white text-slate-800 border-2 border-[#18181b] text-sm font-black shadow-[3px_3px_0px_#18181b] no-underline hover:bg-slate-50 transition-colors"
                >
                  অন্যান্য ফিচারসমূহ
                </a>
              </div>
            </div>

            {/* Formula Preview Box */}
            <div className="w-full md:w-80 rounded-2xl bg-[#18181b] text-white p-5 border-2 border-indigo-400/30 shadow-[5px_5px_0px_rgba(0,0,0,0.2)] font-mono text-xs flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-indigo-400 font-bold">KaTeX Live Formula</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded">Sem 4 Math</span>
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="p-2 rounded bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-400 mb-0.5">Standard Integral:</div>
                  <div className="text-amber-300 text-sm font-bold">∫ dx/(x² + a²) = (1/a) tan⁻¹(x/a) + C</div>
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-400 mb-0.5">3D Direction Cosines:</div>
                  <div className="text-cyan-300 text-sm font-bold">l² + m² + n² = 1, cos θ = a₁a₂ + b₁b₂ + c₁c₂</div>
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-400 mb-0.5">Integrating Factor (I.F.):</div>
                  <div className="text-emerald-300 text-sm font-bold">I.F. = e^(∫ P dx)</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-white/10">
                ⚡ Step-by-step Bengali pedagogical guidance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3D SCIENCE LAB (Screenshot 5: Bohr Quantum Atomic Model) */}
      <section id="3d-lab" className="max-w-5xl mx-auto px-4 py-8">
        <Hero3DCanvas />
      </section>

      {/* 7. ALL 24 STUDIO TOOLS PREVIEW (Screenshot 4: Neo-Brutalist Tool Cards) */}
      <section id="all-tools" className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="italic font-serif text-sm text-[#18181b]/70">Curated Academic Engine</div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#18181b] font-serif tracking-tight mt-0.5">
              Explore All 24 Study Tools
            </h2>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-[#18181b] text-white text-xs font-black shadow-[2px_2px_0px_#FF7A30] no-underline"
          >
            Launch All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.slice(0, 10).map((tool) => (
            <Link
              key={tool.id}
              to="/login"
              className="group rounded-3xl border-2 border-[#18181b] bg-white p-5 shadow-[4px_4px_0px_#18181b] hover:shadow-[6px_6px_0px_#18181b] hover:-translate-y-0.5 transition-all text-decoration-none text-[#18181b] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-2xl border-2 border-[#18181b] flex items-center justify-center text-lg font-black shrink-0"
                  style={{ background: tool.color || "var(--yellow)" }}
                >
                  ✦
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#18181b]/60 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                  {tool.tag}
                </span>
              </div>

              <div>
                <h3 className="font-serif font-black text-lg text-[#18181b] group-hover:text-[#EA580C] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-[#18181b]/70 font-medium mt-1 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-black text-[#18181b]/90 group-hover:text-[#18181b]">
                <span>Open in Studio →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. MEET YOUR 3D & ANIME STUDY COMPANIONS (Screenshot 5) */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <AnimeMentorShowcase onLaunchMentor={() => nav("/login")} />

        {/* 3 Colorful Stat Cards from Screenshot 5 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mt-6">
          <div
            className="rounded-[28px] border-2 border-[#18181b] p-6 shadow-[5px_5px_0px_#18181b]"
            style={{ background: "#FCE7F3" }}
          >
            <div className="font-serif font-black text-3xl sm:text-4xl text-[#18181b] tracking-tight">
              1000 MB
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#18181b]/80 mt-2 leading-relaxed">
              High-capacity chunked PDF textbook &amp; note upload vault with instant viewer
            </p>
          </div>

          <div
            className="rounded-[28px] border-2 border-[#18181b] p-6 shadow-[5px_5px_0px_#18181b]"
            style={{ background: "#FEF08A" }}
          >
            <div className="font-serif font-black text-3xl sm:text-4xl text-[#18181b] tracking-tight">
              3D Live
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#18181b]/80 mt-2 leading-relaxed">
              Realistic 3D Girl &amp; Boy mentors that talk, nod, smile, and explain in real time
            </p>
          </div>

          <div
            className="rounded-[28px] border-2 border-[#18181b] p-6 shadow-[5px_5px_0px_#18181b]"
            style={{ background: "#CCFBF1" }}
          >
            <div className="font-serif font-black text-3xl sm:text-4xl text-[#18181b] tracking-tight">
              100% Real
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#18181b]/80 mt-2 leading-relaxed">
              Verification-gated daily streaks &amp; anti-cheat XP rewards earned by actual study
            </p>
          </div>
        </div>
      </section>

      {/* 9. REVISION NOTES SHOWCASE (Screenshot 1: Microsporogenesis & Pollination) */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="italic font-serif text-sm text-[#18181b]/70">Chapter Takeaways</div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#18181b] font-serif tracking-tight mt-0.5">
            Key Syllabus Notes &amp; Board Formulas
          </h2>
        </div>

        {/* Subject Note Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {NOTES.map((n, idx) => (
            <button
              key={n.id}
              onClick={() => setActiveNoteIndex(idx)}
              className={`px-4 py-2 rounded-full border-2 border-[#18181b] text-xs font-black transition-all cursor-pointer ${
                activeNoteIndex === idx
                  ? "bg-[#FEF08A] shadow-[2.5px_2.5px_0px_#18181b]"
                  : "bg-white text-[#18181b]/70 hover:bg-slate-50"
              }`}
            >
              {n.subject}
            </button>
          ))}
        </div>

        {/* Screenshot 1 Note Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-[32px] border-2 border-[#18181b] shadow-[6px_6px_0px_#18181b] p-6 sm:p-8">
          <div className="italic font-serif text-sm text-[#18181b]/70">{currentNote.subject}</div>
          <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#18181b] tracking-tight mt-1 mb-1">
            {currentNote.title}
          </h3>
          <div className="text-xs sm:text-sm font-bold text-[#18181b]/70 mb-6">{currentNote.bn}</div>

          <div className="space-y-3.5">
            {currentNote.points.map((pt, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-2xl border-2 border-[#18181b] flex items-start gap-3 shadow-[2.5px_2.5px_0px_#18181b]"
                style={{ background: "#FAF9F5" }}
              >
                <div className="font-serif font-black text-sm sm:text-base text-[#18181b] shrink-0 mt-0.5">
                  0{i + 1}.
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#18181b] leading-relaxed m-0">
                  {pt}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-[#18181b]/60">WBCHSE Semester 3 Standard</span>
            <Link
              to="/login"
              className="text-xs font-black text-[#EA580C] hover:underline inline-flex items-center gap-1"
            >
              <span>Explore all chapter notes in Studio →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. QUESTION OF THE DAY (Interactive Hourly MCQ) */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-[32px] border-2 border-[#18181b] shadow-[6px_6px_0px_#18181b] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#18181b] text-white text-[10px] font-black uppercase tracking-wider">
                {hourlyData.question.bilingualSubject}
              </span>
              <span className="text-xs font-bold text-[#18181b]/70">
                • {hourlyData.question.topic}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF08A] border border-[#18181b] text-[11px] font-black text-[#18181b]">
              <span>⏳ নতুন প্রশ্ন:</span>
              <span className="font-mono">
                {String(hourlyData.minutesLeft).padStart(2, "0")}:{String(hourlyData.secondsLeft).padStart(2, "0")}
              </span>
            </div>
          </div>

          <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#18181b] tracking-tight mt-1 mb-2">
            WBCHSE Class 12 Question of the Day
          </h2>
          <div className="text-xs font-semibold text-[#18181b]/60 mb-4">
            প্রতি এক ঘণ্টা পরপর সিলেবাস থেকে স্বয়ংক্রিয়ভাবে প্রশ্ন পরিবর্তন হয় (ঘণ্টা: {hourlyData.hourIndex + 1}/24)
          </div>

          <div className="p-4 rounded-2xl bg-[#FEF3C7] border-2 border-[#18181b] mb-4 shadow-[2px_2px_0px_#18181b]">
            <div className="font-serif font-bold text-base text-[#18181b] mb-1.5">
              Q: {hourlyData.question.question}
            </div>
            {hourlyData.question.questionBn && (
              <div className="text-xs font-semibold text-[#18181b]/80 border-t border-[#18181b]/15 pt-1.5">
                বাংলা: {hourlyData.question.questionBn}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {hourlyData.question.options.map((opt) => {
              const isPicked = selectedAnswer === opt.id;
              let bg = "#ffffff";
              if (answerSubmitted) {
                if (opt.isCorrect) bg = "#DCFCE7";
                else if (isPicked) bg = "#FEE2E2";
              } else if (isPicked) {
                bg = "#FEF08A";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (!answerSubmitted) {
                      soundEffects.play("click");
                      setSelectedAnswer(opt.id);
                    }
                  }}
                  className="w-full text-left p-3.5 rounded-xl border-2 border-[#18181b] font-bold text-xs sm:text-sm flex items-center justify-between cursor-pointer transition-all shadow-[2px_2px_0px_#18181b]"
                  style={{ background: bg }}
                >
                  <div>
                    <span>{opt.text}</span>
                    {opt.textBn && opt.textBn !== opt.text && (
                      <span className="block text-[11px] font-medium text-[#18181b]/70 mt-0.5">
                        {opt.textBn}
                      </span>
                    )}
                  </div>
                  {answerSubmitted && opt.isCorrect && (
                    <span className="text-emerald-700 font-black shrink-0 ml-2">✓ Correct</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {!answerSubmitted ? (
              <button
                type="button"
                disabled={selectedAnswer === null}
                onClick={() => {
                  const correct = hourlyData.question.options.find((o) => o.id === selectedAnswer)?.isCorrect;
                  soundEffects.play(correct ? "success" : "quizComplete");
                  setAnswerSubmitted(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#18181b] text-white text-xs font-black shadow-[2px_2px_0px_#FF7A30] cursor-pointer disabled:opacity-50"
              >
                Submit Answer
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="text-xs font-bold text-emerald-800">
                  {hourlyData.question.options.find((o) => o.id === selectedAnswer)?.isCorrect
                    ? `🎉 ${hourlyData.question.explanationBn}`
                    : `ভুল উত্তর! সঠিক ব্যাখ্যা: ${hourlyData.question.explanationBn}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnswer(null);
                    setAnswerSubmitted(false);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#18181b] bg-white text-xs font-bold shrink-0 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}

            <Link
              to="/login"
              className="text-xs font-black text-[#EA580C] hover:underline no-underline"
            >
              Start Full MCQ Mock Test →
            </Link>
          </div>
        </div>
      </section>

      {/* 11. SHARED STUDY PDF LIBRARY (Community PDFs synced live) */}
      <section id="shared-pdfs" className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-[32px] border-2 border-[#18181b] shadow-[6px_6px_0px_#18181b] p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FED7AA] border-2 border-[#18181b] flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_#18181b]">
                📑
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black font-serif text-[#18181b]">
                    Shared Study PDF Library
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-emerald-900 border border-[#18181b] text-[10px] font-black flex items-center gap-1 shadow-[1px_1px_0px_#18181b]">
                    <Sparkles size={11} /> Live Synced
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#18181b]/70 font-medium">
                  সকল স্টুডেন্ট ও শিক্ষকের আপলোড করা কমন নোট ও প্রশ্নপত্র সবার জন্য উপলব্ধ
                </p>
              </div>
            </div>

            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl bg-[#18181b] text-white text-xs font-black no-underline flex items-center gap-1.5 shadow-[2px_2px_0px_#FF7A30]"
            >
              <span>+ Upload / Full Library</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {(() => {
            const cleanDocs = sharedPdfs.filter((d) => !isDummySeed(d));
            if (cleanDocs.length === 0) {
              return (
                <div className="p-6 rounded-2xl bg-[#FAF9F5] border-2 border-dashed border-[#18181b]/30 text-center space-y-2">
                  <p className="text-sm font-bold text-[#18181b]">
                    স্টুডিওতে লগইন করে প্রথম পিডিএফ নোট বা স্টাডি মেটেরিয়াল আপলোড করুন।
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-black no-underline mt-1"
                  >
                    <span>Open PDF Library →</span>
                  </Link>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {cleanDocs.slice(0, 6).map((docItem) => (
                  <div
                    key={docItem.id}
                    className="p-4 rounded-2xl bg-[#FAF9F5] hover:bg-slate-50 border-2 border-[#18181b] flex flex-col justify-between gap-3 transition-all shadow-[2.5px_2.5px_0px_#18181b]"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FCE7F3] border border-[#18181b] text-rose-600 flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="text-xs sm:text-sm font-black text-[#18181b] truncate"
                          title={docItem.name}
                        >
                          {docItem.name}
                        </h3>
                        <p className="text-[11px] text-[#18181b]/60 font-semibold mt-0.5">
                          {docItem.sizeFormatted} • {docItem.uploaderName || "Admin"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenSharedPdf(docItem)}
                      disabled={loadingPdfId === docItem.id}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#18181b] hover:text-white text-[#18181b] border-2 border-[#18181b] text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#18181b]"
                    >
                      {loadingPdfId === docItem.id ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>খুলছে...</span>
                        </>
                      ) : (
                        <>
                          <Eye size={13} />
                          <span>📖 পিডিএফ পড়ুন (Read Now)</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* 12. SYLLABUS OVERVIEW */}
      <section id="syllabus" className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-[32px] border-2 border-[#18181b] shadow-[6px_6px_0px_#18181b] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="italic font-serif text-sm text-[#18181b]/70">Official Board Curriculum</div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#18181b] font-serif tracking-tight mt-0.5">
                WBCHSE Class 12 Syllabus Roadmap
              </h2>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-[#FEF08A] border-2 border-[#18181b] text-xs font-black shadow-[2px_2px_0px_#18181b] no-underline text-[#18181b]"
            >
              Track in Studio →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SYLLABUS.map((subj) => (
              <div
                key={subj.subject}
                className="p-5 rounded-2xl border-2 border-[#18181b] bg-[#FAF9F5] shadow-[3px_3px_0px_#18181b]"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif font-black text-lg text-[#18181b]">{subj.subject}</h3>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-[#18181b]"
                    style={{ background: subj.color }}
                  />
                </div>
                <div className="space-y-2">
                  {subj.chapters.slice(0, 4).map((ch, idx) => (
                    <div key={idx} className="text-xs font-semibold text-[#18181b]/80 flex items-start gap-1.5">
                      <span className="text-[#EA580C] font-black">•</span>
                      <span>{ch.name} ({ch.bn})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. FAQ ACCORDION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="italic font-serif text-sm text-[#18181b]/70">Frequently Asked Questions</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#18181b] font-serif tracking-tight mt-0.5">
            Have Questions? We've Got Answers
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border-2 border-[#18181b] bg-white p-4 shadow-[3px_3px_0px_#18181b] transition-all cursor-pointer"
            >
              <summary className="font-serif font-bold text-base text-[#18181b] list-none flex items-center justify-between">
                <span>{item.q}</span>
                <ChevronDown size={18} className="group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-[#18181b]/80 font-medium leading-relaxed border-t border-slate-100 pt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 13.5 OFFICIAL COMMUNITY SECTION */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div
          className="rounded-[32px] border-2 border-[#18181b] shadow-[6px_6px_0px_#18181b] p-6 sm:p-8"
          style={{ background: "#FEF9C3" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-[#18181b] text-white text-[11px] font-black uppercase tracking-wider inline-block">
                🌟 WBCHSE Student Community Hub
              </span>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#18181b] tracking-tight">
                যুক্ত হও আমাদের অফিশিয়াল হোয়াটসঅ্যাপ ও টেলিগ্রামে
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#18181b]/80 max-w-xl">
                প্রতিদিনের গুরুত্বপূর্ণ পরীক্ষার সাজেশন, অধ্যায়ভিত্তিক পিডিএফ হ্যান্ডবুক, লাইভ মক টেস্ট অ্যালার্ট এবং সহপাঠীদের সাথে গ্রুপ ডিসকাশনের জন্য সরাসরি যোগ দাও!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={COMMUNITY_LINKS.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-[#25D366] text-white text-sm font-black border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] hover:translate-y-[-2px] transition-all no-underline inline-flex items-center gap-2"
              >
                <span>💬 Join WhatsApp Group</span>
                <ExternalLink size={14} />
              </a>

              <a
                href={COMMUNITY_LINKS.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-[#0088cc] text-white text-sm font-black border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] hover:translate-y-[-2px] transition-all no-underline inline-flex items-center gap-2"
              >
                <span>✈️ Join Telegram Channel</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="border-t-2 border-[#18181b] bg-white py-10 mt-12">
        <div className="wrap flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Study Stranger" className="w-8 h-8 rounded-lg" />
            <div>
              <div className="font-serif font-black text-lg text-[#18181b]">Study Stranger PRO</div>
              <div className="text-xs text-[#18181b]/60">West Bengal Board Higher Secondary Academic Suite</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-[#18181b]/80">
            <a
              href={COMMUNITY_LINKS.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#15803d] hover:text-[#166534] no-underline inline-flex items-center gap-1 font-black"
            >
              <span>💬 WhatsApp Group</span>
            </a>
            <a
              href={COMMUNITY_LINKS.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0369a1] hover:text-[#075985] no-underline inline-flex items-center gap-1 font-black"
            >
              <span>✈️ Telegram Channel</span>
            </a>
            <Link to="/privacy" className="hover:text-[#18181b] no-underline">
              Privacy Policy
            </Link>
            <Link to="/login" className="hover:text-[#18181b] no-underline">
              Enter Studio
            </Link>
            <Link to="/settings" className="hover:text-[#18181b] no-underline">
              Settings & API Key
            </Link>
          </div>

          <p className="text-xs text-[#18181b]/60 font-semibold m-0">
            © 2026 Study Stranger PRO. Handcrafted for WBCHSE Class 12 candidates.
          </p>
        </div>
      </footer>

      {/* PDF Preview Modal if any shared PDF opened */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={true}
          title={previewDoc.name}
          pdfName={previewDoc.name}
          pdfUrl={previewDoc.url}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
