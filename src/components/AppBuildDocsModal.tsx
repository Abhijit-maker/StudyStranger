import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Code, ShieldCheck, X, Check, Copy, ExternalLink, RefreshCw, Cpu, Layers } from 'lucide-react';

interface AppBuildDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  isAdmin?: boolean;
}

export const AppBuildDocsModal: React.FC<AppBuildDocsModalProps> = ({
  isOpen,
  onClose,
  userName = "Abhijit (Admin)",
  isAdmin = true
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'txt' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadHtml = () => {
    const link = document.createElement('a');
    link.href = '/app-documentation.html';
    link.download = 'Study_Stranger_Build_Documentation.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTxt = () => {
    const link = document.createElement('a');
    link.href = '/app-documentation.txt';
    link.download = 'Study_Stranger_Build_Details.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTxt = async () => {
    try {
      const res = await fetch('/app-documentation.txt');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-2">
                    App Build & Architecture Documentation
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={11} /> Admin Only
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Full step-by-step app creation specifications, WBCHSE syllabus map, & Firebase architecture.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Action & Tab Bar */}
          <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ExternalLink size={13} /> Live HTML Preview
              </button>
              <button
                onClick={() => setActiveTab('txt')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'txt'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText size={13} /> Text Format (.txt)
              </button>
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'html'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Code size={13} /> HTML Source (.html)
              </button>
            </div>

            {/* Downloads */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTxt}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy Details"}
              </button>

              <button
                onClick={handleDownloadTxt}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-500/30"
              >
                <Download size={13} /> Download .TXT
              </button>

              <button
                onClick={handleDownloadHtml}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-black tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Download size={13} /> Save Full HTML
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-slate-950 overflow-hidden relative">
            {activeTab === 'preview' && (
              <iframe
                src="/app-documentation.html"
                title="Build Architecture Documentation"
                className="w-full h-full border-none bg-slate-900"
              />
            )}

            {activeTab === 'txt' && (
              <div className="w-full h-full p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950">
                {`================================================================================
STUDY STRANGER (অভিজিৎ) - FULL APP ARCHITECTURE & BUILD SPECIFICATION REPORT
================================================================================
Generated for Admin: ${userName}
Target Platform: WBCHSE Class 12 - Semester 3 (MCQ Exam Focus)
Date: August 4, 2026

--------------------------------------------------------------------------------
1. PROJECT OVERVIEW & STUDENT PROFILE
--------------------------------------------------------------------------------
• Student Name: Abhijit (অভিজিৎ)
• Board: WBCHSE (West Bengal Council of Higher Secondary Education)
• Level: Class 12 - Semester 3
• Target: MCQ-based Exam Preparation, Quick Revision, AI Voice Mentorship
• Primary Language: Bengali & English (Bilingual Support)

--------------------------------------------------------------------------------
2. COMPLETE WBCHSE SEMESTER 3 SYLLABUS SPECIFICATION
--------------------------------------------------------------------------------

[SUBJECT 1: BIOLOGY (জীববিদ্যা)]
• Unit I: Reproduction
  - Sexual Reproduction in Flowering Plants: Microsporogenesis, Megasporogenesis,
    Pollination mechanisms (Geitonogamy, Xenogamy).
  - Human Reproduction: Gametogenesis (Acrosome sperm head, Mitochondria midpiece),
    Menstrual Cycle (Day 14 LH Surge), Fertilization (ZP3 receptor binding),
    Ectopic Implantation (e.g., Fallopian tubes).
  - Reproductive Health: Sexually Transmitted Diseases (Syphilis pathogen: Treponema pallidum,
    HIV, Chlamydia).
• Unit II: Genetics and Evolution
  - Heredity and Variation: Mendel's Laws, Linkage, Crossing Over.
  - Molecular Basis of Inheritance: DNA/RNA structure (A=T 2 bonds, G≡C 3 bonds),
    Replication (SSB protein stabilization), Transcription (TATA Box), Translation.
  - Evolution: Origin of Life (Oparin-Haldane hypothesis), Homologous vs Analogous Organs,
    Human Evolution (Australopithecus, Homo erectus).

[SUBJECT 2: BENGALI A (বাংলা এ)]
• Prose (গল্প/প্রবন্ধ):
  - আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়): Jayram Mokhtar and Adarini the elephant (purchased for 2000 rupees).
  - বাঙ্গালা ভাষা (স্বামী বিবেকানন্দ): Vernacular language, simplicity, and authentic education.
• Poetry (কবিতা):
  - ধর্ম (শ্রীজাত): Manush-er Dharma vs Institutionalized religion.
  - দিগ্বিজয়ের রূপকথা (নবনীতা দেবসেন): Internal courage and self-realization.
• International / Indian Translations:
  - পোটরাজ (শঙ্কর রাও খারাট): Marathi translated narrative.
  - তার সঙ্গে (পাবলো নেরুদা): Translated into Bengali by Shakti Chattopadhyay.
• Linguistics (ভাষাবিজ্ঞান):
  - Phonemics (ধ্বনিতত্ত্ব), Semantics (শব্দার্থতত্ত্ব), Structural Linguistics.

[SUBJECT 3: ENGLISH B]
• Prose:
  - 'The Night Train at Deoli' (Ruskin Bond): Longing, nostalgia, and the unknown girl at Deoli platform.
  - 'Strong Roots' (APJ Abdul Kalam): Spiritual upbringing and harmony in Rameswaram.
  - 'The Bet' (Anton Chekhov): Capital punishment vs life imprisonment; wager of 2 million rubles for 15 years.
• Verse:
  - 'Ulysses' (Alfred Lord Tennyson): "To strive, to seek, to find, and not to yield."
  - 'Our Casuarina Tree' (Toru Dutt): Childhood memories and immortality of nature.
• Play:
  - 'Riders to the Sea' (J.M. Synge): Irish tragedy portraying the sea as an antagonist.

--------------------------------------------------------------------------------
3. TECHNICAL ARCHITECTURE & STACK
--------------------------------------------------------------------------------
• Frontend Framework: React 18, TypeScript, Vite
• Styling & Animation: Tailwind CSS, Motion (framer-motion)
• Icons: Lucide React
• Database & Auth: Firebase Firestore & Firebase Authentication
• Server-Side AI SDK: @google/genai (Gemini 2.5 Flash / Gemini 2.5 Pro)
• Live Voice AI Engine: WebSockets Multimodal Live Stream Manager (liveService.ts)

--------------------------------------------------------------------------------
4. KEY APP COMPONENTS
--------------------------------------------------------------------------------
• src/App.tsx: Main application layout, Auth state, Live Session manager, Admin controls
• src/firebase.ts: Firebase configuration and Firestore/Auth initializers
• src/services/geminiService.ts: Server-side Gemini API calls, Memory Vault management
• src/services/liveService.ts: WebSockets real-time Bengali/English voice AI mentor session
• src/components/Dashboard.tsx: Student dashboard with live Date & Weather, 7-day interactive schedule
• src/components/AppBuildDocsModal.tsx: Admin-only Build Documentation & Exporter (HTML & TXT)
• src/components/LiveBoard.tsx: Interactive drawing & visual teaching whiteboard
• src/components/AIMemoryVault.tsx: Permanent Firestore memory vault
• src/components/Syllabus.tsx: Interactive WBCHSE Class 12 Semester 3 progress checklist

--------------------------------------------------------------------------------
5. ADMIN CREDENTIALS & PERMISSIONS
--------------------------------------------------------------------------------
• Admin Username: abhiyaan963
• Admin Display Name: Abhijit (Admin)
• Primary Admin Email: jhhh47943@gmail.com
• Admin Privileges: Full access to User Moderation, Firestore Memory Vault, System Logs,
  and App Build Documentation Exporter.

================================================================================
END OF BUILD SPECIFICATION REPORT
================================================================================`}
              </div>
            )}

            {activeTab === 'html' && (
              <div className="w-full h-full p-6 overflow-y-auto font-mono text-xs text-amber-200/90 leading-relaxed bg-slate-950">
                <pre>{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Study Stranger - Full App Architecture & Build Documentation</title>
  ... (Full HTML file available for download via the button above)
</head>
<body>
  ...
</body>
</html>`}</pre>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Layers size={13} className="text-amber-500" />
              Build File Location: <code className="text-amber-300 bg-slate-800 px-2 py-0.5 rounded">/public/app-documentation.html</code> & <code className="text-amber-300 bg-slate-800 px-2 py-0.5 rounded">/public/app-documentation.txt</code>
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Only accessible by authorized admin users
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
