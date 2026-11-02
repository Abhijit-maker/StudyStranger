import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  X,
  Send,
  Sparkles,
  User,
  Brain,
  Zap,
  Volume2,
  Square,
  FileDown,
  FolderPlus,
  Settings as SettingsIcon,
  CheckCircle2,
} from "lucide-react";
import { getStrangerResponse } from "../services/geminiService";
import { AIMemoryVault } from "./AIMemoryVault";
import { TypewriterText } from "./TypewriterText";
import { voiceService } from "../services/voiceService";
import { savePdfDataUrlToIndexedDB } from "../services/pdfStorageService";
import { exportRichDocumentToPdf } from "../utils/richPdfExporter";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

interface DoubtSolverProps {
  onClose: () => void;
  initialSubject?: string;
  apiKey?: string;
  userName?: string;
  userId?: string;
}

export const DoubtSolver: React.FC<DoubtSolverProps> = ({
  onClose,
  initialSubject = "Biology",
  apiKey,
  userName = "Abhijit",
  userId = "default",
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: `Hello ${userName}! I am your AI Doubt Solver for WBCHSE Class 12 Semester 3.\n\nযেকোনো অধ্যায়ের প্রশ্ন ইংরেজি বা বাংলায় জিজ্ঞেস করো—আমি ধাপে ধাপে বাংলায় ও ইংরেজিতে বুঝিয়ে দেব এবং চাইলে উত্তরটি সরাসরি PDF আকারে তোমার PDF Library-তে সেভ করে নিতে পারবে!`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState(() => localStorage.getItem("draft_doubt_input") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showMemoryVault, setShowMemoryVault] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [savedPdfToast, setSavedPdfToast] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Explain ZP3 receptor & Acrosome reaction in Bengali",
    "DNA Replication Fork & Okazaki fragments summary",
    "আদিরিনী গল্পের জয়রাম মোক্তারের চরিত্র বিশ্লেষণ করো",
    "The Bet: Why did the lawyer renounce the 2 million rubles?",
    "Kirchhoff's Voltage & Current Laws formula sheet",
  ];

  // Stop voice automatically if user closes or leaves Doubt Solver
  useEffect(() => {
    return () => {
      voiceService.stop();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggleSpeak = (msg: Message) => {
    if (speakingMsgId === msg.id) {
      voiceService.stop();
      setSpeakingMsgId(null);
      return;
    }
    voiceService.stop();
    setSpeakingMsgId(msg.id);
    voiceService.speak(msg.text, {
      character: "anjali",
      rate: 1.05,
      onStart: () => setSpeakingMsgId(msg.id),
      onEnd: () => setSpeakingMsgId(null),
      onError: () => setSpeakingMsgId(null),
    });
  };

  const handleExportDoubtToPdf = async (msgText: string, saveToVaultOnly = false) => {
    try {
      const fileName = `AI_Doubt_Solution_${selectedSubject.replace(/\s+/g, "_")}_${Date.now()
        .toString()
        .slice(-4)}.pdf`;

      const { dataUrl } = await exportRichDocumentToPdf(
        {
          title: `${selectedSubject} — Step-by-Step AI Doubt Solution`,
          subject: `Student: ${userName} • ${selectedSubject}`,
          userName,
          fileName,
          sections: [
            {
              badge: selectedSubject,
              heading: "বিস্তারিত সমাধান ও ব্যাখ্যা (Verified Solution)",
              body: msgText,
              accentColor: "indigo",
            },
          ],
        },
        !saveToVaultOnly
      );

      await savePdfDataUrlToIndexedDB(dataUrl, fileName, undefined, "folder_mock_vault");
      setSavedPdfToast(
        saveToVaultOnly
          ? `Saved "${fileName}" to your PDF Library!`
          : `Downloaded & saved "${fileName}"!`
      );
      setTimeout(() => setSavedPdfToast(""), 3500);
    } catch (e) {
      console.error("Export doubt PDF error:", e);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      time: nowStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    localStorage.removeItem("draft_doubt_input");
    setIsLoading(true);

    const langPref = localStorage.getItem("pref_app_language") || "bilingual";
    const langInstruction =
      langPref === "english"
        ? "Explain clearly in crisp English."
        : "Explain clearly in natural Bengali (বাংলায় সহজ করে) with key English technical terms in brackets.";

    try {
      const effectiveKey =
        apiKey ||
        localStorage.getItem("gemini_api_key") ||
        localStorage.getItem("custom_gemini_api_key") ||
        localStorage.getItem("ss-gemini-key") ||
        undefined;

      const response = await getStrangerResponse(
        `Answer as an expert WBCHSE Class 12 Semester 3 tutor. Subject: ${selectedSubject}. Question: ${textToSend}. ${langInstruction} Provide structured bullet points and an Exam Tip at the end.`,
        messages.map((m) => ({
          id: m.id,
          sender: m.sender === "bot" ? "stranger" : "user",
          text: m.text,
        })),
        "stranger",
        effectiveKey,
        userName,
        userId
      );

      const botMsg: Message = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        text: response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Doubt Solver Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: "Could not reach the AI server right now. You can also configure your personal Gemini API Key in Settings.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AIMemoryVault
        isOpen={showMemoryVault}
        onClose={() => setShowMemoryVault(false)}
        userId={userId}
        userName={userName}
      />

      <div className="w-full max-w-4xl mx-auto bg-white rounded-[28px] border-2 border-[#18181b] shadow-[6px_6px_0px_#18181b] flex flex-col overflow-hidden font-sans text-stone-900 min-h-[76vh]">
        {/* Clean Light Studio Header */}
        <div className="px-5 sm:px-6 py-4 border-b-2 border-[#18181b] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FEF08A] border-[1.5px] border-[#18181b] text-[#18181b] flex items-center justify-center shadow-[2px_2px_0px_#18181b] shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                BILINGUAL AI TUTOR · BENGALI &amp; ENGLISH
              </div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight font-serif">
                AI Doubt Solver Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Subject Picker */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border-[1.5px] border-[#18181b] text-xs font-extrabold text-stone-900 cursor-pointer"
            >
              <option value="Biology">Biology (Sem 3)</option>
              <option value="Bengali A">Bengali A</option>
              <option value="English B">English B</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>

            <button
              type="button"
              onClick={() => setShowMemoryVault(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border-[1.5px] border-[#18181b] text-xs font-bold text-stone-800 flex items-center gap-1.5 cursor-pointer"
              title="AI Memory Vault"
            >
              <Brain size={14} className="text-orange-600" />
              <span className="hidden sm:inline">Memory</span>
            </button>

            <a
              href="/app/settings"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border-[1.5px] border-[#18181b] text-xs font-bold text-stone-800 flex items-center gap-1.5 no-underline"
              title="Configure API Key & Language in Settings"
            >
              <SettingsIcon size={14} className="text-stone-700" />
              <span className="hidden sm:inline">API Key &amp; Settings</span>
            </a>

            <button
              type="button"
              onClick={() => {
                voiceService.stop();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border-[1.5px] border-[#18181b] flex items-center justify-center cursor-pointer"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Toast Notification when saved to PDF Library */}
        {savedPdfToast && (
          <div className="px-5 py-2.5 bg-emerald-100 border-b border-[#18181b] text-emerald-950 text-xs font-extrabold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-700" />
              {savedPdfToast}
            </span>
            <a href="/app/notes" className="underline font-black text-emerald-950">
              Open PDF Library →
            </a>
          </div>
        )}

        {/* Quick Prompts Strip */}
        <div className="px-4 sm:px-6 py-2.5 bg-white border-b border-stone-200 flex gap-2 overflow-x-auto">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FEF08A] border border-[#18181b] text-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Zap size={12} className="text-orange-600" />
              <span>{q}</span>
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF8F5] max-h-[54vh]">
          {messages.map((msg, idx) => {
            const isSpeakingThis = speakingMsgId === msg.id;
            return (
              <motion.div
                key={`doubt-${msg.id}-${idx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-[1.5px] border-[#18181b] ${
                    msg.sender === "user"
                      ? "bg-[#18181b] text-white"
                      : "bg-[#FEF08A] text-stone-900"
                  }`}
                >
                  {msg.sender === "user" ? <User size={15} /> : <Sparkles size={15} />}
                </div>

                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border-[1.5px] border-[#18181b] ${
                    msg.sender === "user"
                      ? "bg-[#18181b] text-white font-semibold"
                      : "bg-white text-stone-900 shadow-[3px_3px_0px_#18181b]"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <div className="whitespace-pre-line">{msg.text}</div>
                  ) : (
                    <>
                      <TypewriterText
                        text={msg.text}
                        enabled={idx === messages.length - 1}
                        speed={10}
                        chunkSize={4}
                        onComplete={scrollToBottom}
                        cursorClassName="inline-block w-1.5 h-3.5 bg-orange-500 ml-0.5 align-middle animate-pulse"
                      />

                      {/* Action Footer inside AI Solution Bubble: Voice Readout + Save to PDF Library + Download PDF */}
                      <div className="mt-3 pt-2.5 border-t border-stone-200 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSpeak(msg)}
                          className={`px-2.5 py-1 rounded-lg border border-[#18181b] text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer ${
                            isSpeakingThis
                              ? "bg-rose-600 text-white"
                              : "bg-[#FAF8F5] hover:bg-[#FEF08A] text-stone-900"
                          }`}
                        >
                          {isSpeakingThis ? <Square size={11} /> : <Volume2 size={12} />}
                          <span>{isSpeakingThis ? "Stop Voice" : "Listen Aloud"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportDoubtToPdf(msg.text, true)}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-emerald-100 border border-[#18181b] text-stone-900 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FolderPlus size={12} className="text-emerald-700" />
                          <span>Save to PDF Library</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportDoubtToPdf(msg.text, false)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-[#18181b] text-stone-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileDown size={12} />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FEF08A] text-stone-900 border-[1.5px] border-[#18181b] flex items-center justify-center">
                <Brain size={15} className="animate-pulse" />
              </div>
              <div className="bg-white text-stone-700 p-4 rounded-2xl border-[1.5px] border-[#18181b] text-xs font-bold flex items-center gap-2">
                <Sparkles size={14} className="animate-spin text-orange-600" />
                <span>Preparing step-by-step bilingual solution...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-t-2 border-[#18181b]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                localStorage.setItem("draft_doubt_input", e.target.value);
              }}
              placeholder={`Ask any ${selectedSubject} doubt in English or বাংলা...`}
              disabled={isLoading}
              className="flex-1 bg-[#FAF8F5] border-[1.5px] border-[#18181b] rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-stone-900 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 rounded-2xl bg-[#18181b] hover:bg-stone-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-[3px_3px_0px_#FF7A30]"
            >
              <span>Solve Doubt</span>
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
