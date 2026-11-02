import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HelpCircle, 
  X, 
  Zap, 
  Send, 
  PhoneCall, 
  Camera, 
  Mic, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  HeartHandshake,
  Bot,
  User,
  Radio,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";

interface HelpAndSupportModalProps {
  onClose: () => void;
  userTelegramUsername?: string;
  onOpenLiveVoice?: () => void;
}

export const HelpAndSupportModal: React.FC<HelpAndSupportModalProps> = ({
  onClose,
  userTelegramUsername = "Studystranger_bot",
  onOpenLiveVoice
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [copiedSupport, setCopiedSupport] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"commands" | "voice_live" | "photos" | "support">("commands");

  const supportTelegramHandle = "@Studystranger_bot";
  const directSupportLink = "https://t.me/Studystranger_bot";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    if (id === "support") {
      setCopiedSupport(true);
      setTimeout(() => setCopiedSupport(false), 2000);
    } else {
      setCopiedCmd(id);
      setTimeout(() => setCopiedCmd(null), 2000);
    }
    confetti({ particleCount: 15, spread: 40, origin: { y: 0.8 } });
  };

  const telegramCommands = [
    {
      cmd: "/live & /call",
      name: "🎙️ AI Live Voice (সরাসরি কথা বলুন)",
      desc: "সরাসরি মুখে বাংলায় কথা বলে ডাউট জিজ্ঞাসা করুন ও রিয়েল-টাইম ভয়েসে সমাধান শুনুন (লগইন ছাড়াও প্রযোজ্য)।",
      example: "/live"
    },
    {
      cmd: "📸 Send Photo",
      name: "ছবি দেখে অঙ্ক ও ডাউট সমাধান",
      desc: "যেকোনো অঙ্কের ছবি, বইয়ের পাতা বা ডায়াগ্রাম পাঠালেই ধাপে ধাপে ইউনিকোড ম্যাথ ফর্মুলা সহ ব্যাখ্যা পাবেন।",
      example: "ছবি পাঠিয়ে ক্যাপশনে লিখুন: 'এই অঙ্কটির সমাধান দাও'"
    },
    {
      cmd: "🎙️ Voice Message",
      name: "ভয়েস অডিও নোটস",
      desc: "মুখে বাংলায় রেকর্ড করে প্রশ্ন পাঠালে এআই ভয়েস শুনে নির্ভুল উত্তর দেবে।",
      example: "ভয়েস মেসেজে যেকোনো সিলেবাস ডাউট বলুন"
    },
    {
      cmd: "/connect",
      name: "🔑 Web App Connect PIN",
      desc: "৬-ডিজিটের ওয়ান-টাইম পিন তৈরি করে যা ১০ মিনিটের মধ্যে Web App-এ বসালে অ্যাকাউন্ট সিঙ্ক হয়ে যায়।",
      example: "/connect"
    },
    {
      cmd: "/quiz",
      name: "🧠 WBCHSE MCQ কুইজ",
      desc: "জীববিদ্যা, বাংলা ও ইংরেজি সিলেবাস ভিত্তিক ৪-অপশনের ইন্টারঅ্যাক্টিভ কুইজ প্র্যাকটিস।",
      example: "/quiz"
    },
    {
      cmd: "/chapter",
      name: "🎯 অধ্যায় ভিত্তিক প্রশ্ন জেনারেটর",
      desc: "নির্দিষ্ট কোনো অধ্যায়ের উপর পরীক্ষা মানের প্রশ্ন ও উত্তর তৈরি করুন।",
      example: "/chapter Biology Reproduction"
    },
    {
      cmd: "/materials & /notes",
      name: "📚 রিভিশন নোটস ও ফর্মুলা",
      desc: "ক্লাস ১২ সেমিস্টার ৩ এর সম্পূর্ণ বায়োলজি, বাংলা এ ও ইংরেজি বি এর রিভিশন শিট।",
      example: "/materials"
    },
    {
      cmd: "/progress",
      name: "📊 লাইভ প্রগ্রেস ও স্ট্রিক",
      desc: "আপনার পড়াশোনার স্ট্রিক, অর্জিত XP, লেভেল এবং দুর্বল অধ্যায়গুলির তালিকা।",
      example: "/progress"
    },
    {
      cmd: "/key [API_KEY]",
      name: "🔐 কাস্টম Gemini Key সেট",
      desc: "নিজের গুগল জেমিনাই কী সরাসরি বটে সেট করে আনলিমিটেড স্পিডে ব্যবহার করুন।",
      example: "/key AIzaSyB123..."
    },
    {
      cmd: "/start",
      name: "🏠 মেইন মেনু ও ড্যাশবোর্ড",
      desc: "বটের প্রধান স্বাগতম স্ক্রিন এবং সমস্ত ফিচার বাটন একসাথে দেখুন।",
      example: "/start"
    },
    {
      cmd: "/unlink",
      name: "❌ অ্যাকাউন্ট ডিসকানেক্ট",
      desc: "টেলিগ্রাম অ্যাকাউন্ট থেকে Web App-এর সংযোগ বিচ্ছিন্ন করুন।",
      example: "/unlink"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-stone-800 dark:text-stone-200 text-left"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <HelpCircle size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                <span>সাহায্য ও সাপোর্ট সেন্টার (Help &amp; Commands)</span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                টেলিগ্রাম বট কমান্ড গাইড, লাইভ ভয়েস টক ও অফিশিয়াল সাপোর্ট
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-stone-50/50 dark:bg-stone-950/80 border-b border-stone-100 dark:border-stone-800/80 overflow-x-auto scrollbar-hide shrink-0">
          {[
            { id: "commands", label: "⚡ টেলিগ্রাম কমান্ডস", icon: Zap },
            { id: "voice_live", label: "🎙️ লাইভ ভয়েস (Live Voice)", icon: PhoneCall },
            { id: "photos", label: "📸 ফটো সমাধান", icon: Camera },
            { id: "support", label: "👤 অফিসিয়াল সাপোর্ট", icon: HeartHandshake },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? "bg-[#FF7A30] text-white shadow-md shadow-orange-500/20"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {/* TAB 1: ALL TELEGRAM COMMANDS */}
          {activeCategory === "commands" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 text-xs text-orange-700 dark:text-orange-200 flex items-start gap-2.5">
                <Sparkles size={16} className="text-[#FF7A30] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 dark:text-white block font-bold mb-0.5">টেলিগ্রামে সহজে ব্যবহার করুন:</strong>
                  টেলিগ্রাম বটে যেকোনো কমান্ড ব্যবহার করতে পাশের <b>Copy</b> বাটনে ক্লিক করে বটে পেস্ট করুন অথবা সরাসরি টাইপ করুন।
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {telegramCommands.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950/70 border border-stone-100 dark:border-stone-800/80 hover:border-stone-200 dark:hover:border-stone-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black text-[#FF7A30] bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/10">
                          {item.cmd}
                        </span>
                        <span className="text-xs font-bold text-stone-900 dark:text-white">{item.name}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                        {item.desc}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        উদাহরণ: <code className="text-stone-600 dark:text-stone-300">{item.example}</code>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.example, `cmd_${idx}`)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 self-start sm:self-center shadow-sm"
                    >
                      {copiedCmd === `cmd_${idx}` ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE VOICE CALL */}
          {activeCategory === "voice_live" && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-tr from-sky-50 dark:from-sky-950/80 via-white dark:via-stone-950 to-indigo-50 dark:to-indigo-950/80 border border-sky-100 dark:border-sky-500/30 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-400/40 text-sky-600 dark:text-sky-300 flex items-center justify-center shadow-sm">
                    <PhoneCall size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900 dark:text-white">লগইন ছাড়াই সরাসরি এআই এর সাথে লাইভ কথা বলুন</h4>
                    <p className="text-xs text-stone-500 dark:text-sky-200">
                      কোনো পাসওয়ার্ড বা সাইন-ইন ছাড়াই সাথে সাথে রিয়েল-টাইম লাইভ ভয়েস সেশন শুরু করুন!
                    </p>
                  </div>
                </div>

                {/* Animated Voice Equalizer Wave */}
                <div className="bg-black/5 dark:bg-black/50 p-4 rounded-2xl border border-sky-100 dark:border-sky-500/20 flex items-center justify-center gap-1.5 py-4">
                  {[40, 70, 25, 90, 50, 100, 30, 80, 60, 95, 45, 85, 30, 75, 40].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${Math.max(15, h * 0.3)}px`, `${h * 0.4}px`, `${Math.max(15, h * 0.3)}px`] }}
                      transition={{ duration: 0.8 + (i % 5) * 0.15, repeat: Infinity, ease: "easeInOut" }}
                      className="w-1.5 bg-gradient-to-t from-sky-500 via-blue-400 to-indigo-400 rounded-full"
                    />
                  ))}
                </div>

                <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-white/40 dark:bg-black/40 p-4 rounded-2xl border border-sky-100/50 dark:border-white/5">
                  <p className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span><strong>কোনো টাইপিং প্রয়োজন নেই:</strong> মুখে বাংলায় প্রশ্ন করলেই এআই রিয়েল-টাইমে ভয়েস রিপ্লাই দেবে।</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span><strong>গাণিতিক ও ডায়াগ্রাম ভিউ:</strong> কথা বলার সময় লাইভ হোয়াইটবোর্ডে সমীকরণ ও ডায়াগ্রাম ফুটে ওঠে।</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span><strong>টেলিগ্রামেও সচল:</strong> টেলিগ্রামে <code className="text-sky-500 font-bold">/live</code> টাইপ করলেই সরাসরি লাইভ কল বাটন পাওয়া যাবে।</span>
                  </p>
                </div>

                {onOpenLiveVoice && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLiveVoice();
                    }}
                    className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    <Radio size={16} className="animate-pulse" />
                    <span>🎙️ এখনই লাইভ ভয়েস রুম চালু করুন (Start Live Voice)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PHOTO QUESTION SOLVER */}
          {activeCategory === "photos" && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shadow-sm">
                    <Camera size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900 dark:text-white">ছবি তুলে পাঠানো ও সমাধান নেওয়ার নিয়ম</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      টেলিগ্রাম বট বা ওয়েব অ্যাপে অঙ্কের ছবি পাঠালেই এআই সমাধান করে দেবে।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 space-y-1 shadow-sm">
                    <span className="text-base font-black text-[#FF7A30]">১. ছবি তুলুন</span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">খাতার অংক, বইয়ের প্রশ্ন বা ডায়াগ্রামের পরিষ্কার ছবি তুলুন।</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 space-y-1 shadow-sm">
                    <span className="text-base font-black text-[#FF7A30]">২. টেলিগ্রামে পাঠান</span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">টেলিগ্রাম বট (<code className="text-sky-500">@Studystranger_bot</code>)-এ ছবিটি পাঠিয়ে দিন।</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 space-y-1 shadow-sm">
                    <span className="text-base font-black text-[#FF7A30]">৩. পূর্ণ সমাধান পান</span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">নিখুঁত ইউনিকোড ম্যাথ ফর্মুলা ও ধাপে ধাপে বাংলা ব্যাখ্যা পেয়ে যান।</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL SUPPORT & USER TELEGRAM CONTACT */}
          {activeCategory === "support" && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                      <span>অফিসিয়াল টেলিগ্রাম সাপোর্ট ও হেল্পডেস্ক</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Online 24/7</span>
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      কোনো সমস্যা, প্রশ্ন বা ফিডব্যাকের জন্য টেলিগ্রামে সরাসরি যোগাযোগ করুন।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Official Telegram Bot</span>
                      <ShieldCheck size={14} className="text-sky-500" />
                    </div>
                    <div className="font-mono text-sm font-black text-sky-500">{supportTelegramHandle}</div>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={directSupportLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-sky-500 text-white hover:bg-sky-400 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <ExternalLink size={12} />
                        <span>Chat</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(supportTelegramHandle, "support")}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                      >
                        {copiedSupport ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span>{copiedSupport ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Student Profile / User</span>
                      <User size={14} className="text-[#FF7A30]" />
                    </div>
                    <div className="font-mono text-sm font-black text-[#FF7A30]">
                      {userTelegramUsername.startsWith("@") ? userTelegramUsername : `@${userTelegramUsername}`}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      আপনার স্টুডেন্ট প্রোফাইল ও ডাটা Study Stranger ক্লাউডের সাথে সুরক্ষিত রয়েছে।
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 dark:text-white">জরুরি প্রশ্ন বা স্টাডি ম্যাটেরিয়াল প্রয়োজন?</h5>
                    <p className="text-[11px] text-stone-500 dark:text-orange-200">টেলিগ্রাম বটে মেসেজ দিলে সাথে সাথে AI উত্তর প্রদান করবে।</p>
                  </div>
                  <a
                    href={directSupportLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#FF7A30] hover:bg-orange-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/10 transition-all shrink-0 active:scale-95"
                  >
                    <Send size={14} />
                    <span>টেলিগ্রাম সাপোর্ট খুলুন</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px]">Support Active @{userTelegramUsername.replace(/^@/, '')}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
          >
            Close (বন্ধ করুন)
          </button>
        </div>
      </motion.div>
    </div>
  );
};
