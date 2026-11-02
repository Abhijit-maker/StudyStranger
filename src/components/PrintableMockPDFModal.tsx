import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { 
  Printer, 
  Download, 
  X, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Layers,
  HelpCircle,
  Clock,
  ShieldCheck
} from "lucide-react";
import { MathText } from "./MathText";
import { FALLBACK_WBCHSE_QUESTIONS } from "../data/wbchseFallbackQuestions";
import { exportRichDocumentToPdf, RichDocumentSection } from "../utils/richPdfExporter";

interface PrintableMockPDFModalProps {
  onClose: () => void;
  userName?: string;
}

export const PrintableMockPDFModal: React.FC<PrintableMockPDFModalProps> = ({
  onClose,
  userName = "Abhijit"
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("Biology");
  const [includeOMR, setIncludeOMR] = useState<boolean>(true);
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  const questions = FALLBACK_WBCHSE_QUESTIONS[selectedSubject] || FALLBACK_WBCHSE_QUESTIONS["Biology"] || [];

  const handlePrint = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const sections: RichDocumentSection[] = questions.map((q, idx) => {
        const opts = q.optionsBn && q.optionsBn.length > 0 ? q.optionsBn : q.optionsEn || [];
        const optsText = opts
          .map((opt: string, oIdx: number) => `(${String.fromCharCode(65 + oIdx)}) ${opt}`)
          .join("\n");
        const correctIdx = q.correctIndex || 0;
        const explanationText = q.explanationBn || q.explanationEn || "";
        const solText = includeSolutions
          ? `সঠিক উত্তর: (${String.fromCharCode(65 + correctIdx)}) ${
              opts[correctIdx] || ""
            }\nব্যাখ্যা: ${explanationText}`
          : undefined;
        const qText = q.questionBn
          ? `${q.questionEn}\n${q.questionBn}`
          : q.questionEn;
        return {
          badge: `প্রশ্ন #${idx + 1}`,
          heading: `${selectedSubject} • [১ নম্বর]`,
          body: `${qText}\n\n${optsText}`,
          highlightBox: solText,
          accentColor: "amber" as const,
        };
      });

      if (includeOMR) {
        sections.push({
          badge: "OMR SHEET",
          heading: "OMR উত্তরপত্র নির্দেশিকা (WBCHSE Semester OMR Bubble Sheet)",
          body: questions
            .map((_, idx) => `Q${String(idx + 1).padStart(2, "0")}:  (A)   (B)   (C)   (D)`)
            .join("      |      "),
          highlightBox: undefined,
          accentColor: "emerald" as const,
        });
      }

      const safeSub = selectedSubject.replace(/[^a-zA-Z0-9_-]/g, "_");
      await exportRichDocumentToPdf(
        {
          title: `${selectedSubject} — প্রিন্টযোগ্য মক টেস্ট প্রশ্নপত্র`,
          subtitle: `পরীক্ষার্থী: ${userName}  •  পূর্ণমান: ${questions.length}  •  তারিখ: ${new Date().toLocaleDateString("bn-IN")}`,
          subject: selectedSubject,
          userName,
          sections,
          fileName: `WBCHSE_${safeSub}_Mock_Paper.pdf`,
        },
        true
      );
    } catch (err) {
      console.error("Failed to download mock PDF:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#FF7A30] flex items-center justify-center text-white shadow-md shadow-[#FF7A30]/30">
              <Printer size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#FF7A30]">
                  WBCHSE Model Paper Engine
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight text-white">
                প্রিন্টযোগ্য মক টেস্ট প্রশ্নপত্র ও OMR শীট জেনারেটর
              </h2>
            </div>
          </div>

          {/* Quick Subject Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isDownloadingPdf}
              className="px-4 py-2 rounded-xl bg-[#FF7A30] hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>{isDownloadingPdf ? "তৈরি হচ্ছে..." : "Download PDF"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Options Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
            {["Biology", "Bengali A", "English B", "Physics", "Chemistry", "Mathematics"].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedSubject === sub
                    ? "bg-[#FF7A30] text-white shadow-xs"
                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400 font-medium">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOMR}
                onChange={(e) => setIncludeOMR(e.target.checked)}
                className="accent-[#FF7A30]"
              />
              <span>Include OMR Bubble Sheet</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSolutions}
                onChange={(e) => setIncludeSolutions(e.target.checked)}
                className="accent-[#FF7A30]"
              />
              <span>Include Answer Key</span>
            </label>
          </div>
        </div>

        {/* Printable Sheet Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100 dark:bg-stone-950/70">
          <div 
            ref={printRef}
            className="max-w-3xl mx-auto bg-white text-stone-900 p-6 sm:p-10 rounded-2xl shadow-lg border border-stone-200 space-y-6 font-sans print:p-0 print:shadow-none print:border-none"
          >
            {/* Exam Board Formal Header */}
            <div className="text-center pb-4 border-b-2 border-stone-900 space-y-1">
              <p className="text-xs font-black uppercase tracking-widest text-stone-600">
                WEST BENGAL COUNCIL OF HIGHER SECONDARY EDUCATION
              </p>
              <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-stone-950">
                CLASS 12 • SEMESTER 3 MODEL QUESTION PAPER
              </h1>
              <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-stone-300">
                <span>Subject: <strong>{selectedSubject}</strong></span>
                <span>Full Marks: <strong>35</strong></span>
                <span>Time Allowed: <strong>45 Minutes</strong></span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span>Candidate Name: __________________________</span>
                <span>Roll No: ______________</span>
                <span>Date: ________________</span>
              </div>
            </div>

            {/* General Instructions */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
              <p className="font-bold uppercase text-[10px] text-stone-500">General Instructions:</p>
              <ul className="list-decimal pl-4 space-y-0.5 text-[11px]">
                <li>All questions are compulsory. Each MCQ carries 1 mark.</li>
                <li>Darken only one circle completely on the OMR sheet for each question.</li>
                <li>Negative marking of 0.25 marks applies for incorrect attempts.</li>
              </ul>
            </div>

            {/* Questions List */}
            <div className="space-y-5 pt-2">
              {questions.map((q, idx) => (
                <div key={q.id || idx} className="space-y-2 text-xs leading-relaxed break-inside-avoid">
                  <div className="flex items-start gap-2">
                    <span className="font-black text-stone-950">{idx + 1}.</span>
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-stone-900">
                        <MathText text={q.questionEn} />
                      </p>
                      {q.questionBn && (
                        <p className="text-stone-600 font-medium bangla-text text-[11px]">
                          <MathText text={q.questionBn} />
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5 pt-1">
                    {(q.optionsEn || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 p-1.5 rounded-lg border border-stone-200 text-[11px]">
                        <span className="w-5 h-5 rounded-full border border-stone-400 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-stone-800">
                          <MathText text={opt} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* OMR Sheet Mockup */}
            {includeOMR && (
              <div className="pt-6 border-t-2 border-stone-900 space-y-3 break-before-page">
                <div className="text-center">
                  <h3 className="text-sm font-black uppercase tracking-wider text-stone-900">
                    Official OMR Answer Response Sheet
                  </h3>
                  <p className="text-[10px] text-stone-500">Darken the circle completely using black/blue ballpoint pen</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {questions.map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 border border-stone-200 rounded-md font-mono text-[11px]">
                      <span className="font-bold text-stone-700 w-5">#{i + 1}</span>
                      <div className="flex items-center gap-1.5">
                        {["A", "B", "C", "D"].map((letter) => (
                          <span 
                            key={letter}
                            className="w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center text-[9px] font-bold text-stone-600"
                          >
                            {letter}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Scheme & Explanations */}
            {includeSolutions && (
              <div className="pt-6 border-t-2 border-dashed border-stone-400 space-y-3 break-before-page">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Official Answer Scheme & Key
                  </h3>
                  <span className="text-[10px] font-mono text-stone-500">Confidential Key Scheme</span>
                </div>

                <div className="space-y-2 text-[11px]">
                  {questions.map((q, i) => (
                    <div key={i} className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-start gap-2">
                      <span className="font-black text-stone-900 font-mono">Q{i + 1}:</span>
                      <span className="font-bold text-[#FF7A30] font-mono">
                        ({String.fromCharCode(65 + (q.correctIndex || 0))})
                      </span>
                      <span className="text-stone-700 flex-1">
                        <MathText text={q.explanationEn} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
