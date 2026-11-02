import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Bot,
  Volume2,
  VolumeX,
  Shield,
  Key,
  Sparkles,
  Brain,
  Smartphone,
  Phone,
  BellRing,
  ExternalLink,
  ChevronRight,
  LogOut,
  Sliders,
  Settings,
  HelpCircle,
  Clock,
  User,
  GraduationCap,
  Heart,
  Smile,
  Zap,
  BookOpen
} from "lucide-react";
import { voiceService } from "../services/voiceService";
import { AndroidPermissionService } from "../services/androidPermissionService";
import { EducationProfileCard } from "./EducationProfileCard";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isKidsMode: boolean;
  setIsKidsMode: (val: boolean) => void;
  selectedCharacter: "stranger" | "anjali" | "zoya" | "khud" | "rohan" | "ishani" | "mahi";
  setSelectedCharacter: (char: any) => void;
  characterAvatars: Record<string, string>;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
  quizMathApiKey: string;
  setQuizMathApiKey: (key: string) => void;
  preferredQuizModel: string;
  setPreferredQuizModel: (model: string) => void;
  preferredMathModel: string;
  setPreferredMathModel: (model: string) => void;
  cloudflareApiToken: string;
  setCloudflareApiToken: (token: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  voiceStyle: "default" | "fast" | "slow" | "emotional";
  setVoiceStyle: (style: any) => void;
  syncUserProfile: (updatedFields: any) => void;
  onOpenNotifications: () => void;
  onOpenMemoryVault: () => void;
  onOpenAndroidPermissionModal: () => void;
  onOpenDialer: () => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  isKidsMode,
  setIsKidsMode,
  selectedCharacter,
  setSelectedCharacter,
  characterAvatars,
  customApiKey,
  setCustomApiKey,
  quizMathApiKey,
  setQuizMathApiKey,
  preferredQuizModel,
  setPreferredQuizModel,
  preferredMathModel,
  setPreferredMathModel,
  cloudflareApiToken,
  setCloudflareApiToken,
  isMuted,
  setIsMuted,
  voiceStyle,
  setVoiceStyle,
  syncUserProfile,
  onOpenNotifications,
  onOpenMemoryVault,
  onOpenAndroidPermissionModal,
  onOpenDialer,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<"mentor" | "api" | "system" | "android">("mentor");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isPersonaEnabled, setIsPersonaEnabled] = useState(voiceService.isVoicePersonaActive());

  if (!isOpen) return null;

  const isAdmin = user?.isAdmin || user?.role === "admin";

  const tabItems = [
    { id: "mentor", label: "এআই মেন্টর সেটিংস", subtitle: "AI Mentor Profile", icon: Bot },
    { id: "api", label: "এপিআই ও মডেল হাব", subtitle: "API & LLM Core", icon: Key },
    { id: "system", label: "সিস্টেম ও মেমোরি ব্যাংক", subtitle: "Memory & System", icon: Sliders },
    ...(isAdmin ? [{ id: "android", label: "অ্যান্ড্রয়েড সিকিউরিটি", subtitle: "Android Admin", icon: Smartphone }] : [])
  ];

  // Newly implemented 24/7 Human Emotion Spectrum
  const emotionList = [
    { emoji: "😭", name: "কান্নামিশ্রিত / হৃদয়ভাঙা", desc: "Heartbroken / Crying", color: "border-blue-100 text-blue-600 bg-blue-50/10" },
    { emoji: "🥰", name: "উচ্ছ্বসিত / অত্যন্ত আনন্দিত", desc: "Ecstatic / Excited", color: "border-pink-100 text-pink-600 bg-pink-50/10" },
    { emoji: "🤗", name: "সহানুভূতিশীল / যত্নশীল", desc: "Deeply Caring / Empathetic", color: "border-teal-100 text-teal-600 bg-teal-50/10" },
    { emoji: "😳", name: "লজ্জিত / মিষ্টি অভিমান", desc: "Shy / Blushing", color: "border-rose-100 text-rose-500 bg-rose-50/10" },
    { emoji: "😤", name: "মিষ্টি রাগ / অভিমানী", desc: "Mildly Annoyed / Tsundere", color: "border-orange-100 text-orange-600 bg-orange-50/10" },
    { emoji: "😜", name: "দুষ্টুমিষ্টি / ঠাট্টা", desc: "Playful / Teasing", color: "border-yellow-100 text-amber-600 bg-yellow-50/10" },
    { emoji: "🤩", name: "বিস্ময়াবিষ্ট / কৌতূহলী", desc: "Wonder-filled / Curious", color: "border-indigo-100 text-indigo-600 bg-indigo-50/10" },
    { emoji: "🧘", name: "শান্ত / ধ্যানমগ্ন", desc: "Calm / Meditative", color: "border-emerald-100 text-emerald-600 bg-emerald-50/10" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-900/30 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.97, y: 8, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 360 }}
        className="w-full max-w-4xl stranger-modal text-slate-800 dark:text-slate-100 flex flex-col md:flex-row shadow-2xl overflow-hidden max-h-[92vh] md:h-[650px] relative font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-100 dark:border-stone-700 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-all cursor-pointer z-10"
          title="বন্ধ করুন"
        >
          <X size={16} />
        </button>

        {/* Left Sidebar (Desktop Tab Selector & Profile Summary) */}
        <div className="w-full md:w-72 bg-stone-50/40 dark:bg-stone-900/40 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-100 dark:border-stone-800 shrink-0 select-none">
          <div>
            {/* Logo/Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center text-orange-500 shadow-sm">
                <Settings size={20} className="text-orange-500 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight text-stone-900 dark:text-white uppercase font-sans leading-none">
                  সেটিংস হাব
                </h3>
                <p className="text-[9px] text-orange-500 font-black uppercase tracking-widest mt-1">
                  Control Center
                </p>
              </div>
            </div>

            {/* Profile Brief Card */}
            <div className="p-3.5 mb-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-900 shrink-0 border border-stone-100 dark:border-stone-700">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-orange-900/20 dark:to-indigo-900/20 flex items-center justify-center text-sm font-black text-stone-600 dark:text-stone-400">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "S"}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-stone-800 dark:text-stone-100 truncate leading-tight">
                  {user?.displayName || "Abhijit"}
                </h4>
                <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 truncate mt-0.5">
                  {user?.email || "student@studystranger.com"}
                </p>
              </div>
            </div>

            {/* Tab Navigation Menu */}
            <nav className="space-y-1">
              {tabItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setShowLogoutConfirm(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer border ${
                      isActive
                        ? "bg-white dark:bg-stone-800 border-orange-500/20 text-orange-500 shadow-lg shadow-orange-500/5"
                        : "bg-transparent border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-white/60 dark:hover:bg-stone-800/60 hover:border-stone-100 dark:hover:border-stone-700"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isActive ? "bg-orange-500/10 text-orange-500" : "bg-transparent text-stone-400"}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-black leading-tight">{tab.label}</span>
                      <span className={`block text-[8px] mt-0.5 tracking-wider uppercase font-bold font-mono ${isActive ? "text-orange-500/80" : "text-stone-400 dark:text-stone-500"}`}>{tab.subtitle}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Logout Trigger */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 hidden md:block">
            {!showLogoutConfirm ? (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full px-3.5 py-3 rounded-2xl bg-white dark:bg-stone-800 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 hover:text-rose-600 hover:border-rose-100 dark:hover:border-rose-900 text-stone-500 dark:text-stone-400 text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer border border-stone-100 dark:border-stone-700 shadow-sm"
              >
                <LogOut size={13} className="text-stone-400 dark:text-stone-500 group-hover:text-rose-500" />
                <span>লগআউট (Sign Out)</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-100/60 dark:border-rose-900/60 text-center space-y-2.5 animate-fade-in">
                <p className="text-[10px] font-black text-rose-600 dark:text-rose-400">লগআউট করতে চান?</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-[10px] font-black cursor-pointer hover:bg-rose-500 transition-all active:scale-95 shadow-sm shadow-rose-600/10"
                  >
                    হ্যাঁ (Yes)
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-[10px] font-black cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 transition-all"
                  >
                    না
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Scrollable Panel Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6.5 flex flex-col justify-between max-h-[64vh] md:max-h-none bg-white dark:bg-stone-900">
          <div className="space-y-6">
            
            {/* Active Tab Component Render */}
            <AnimatePresence mode="wait">
              {activeTab === "mentor" && (
                <motion.div
                  key="tab-mentor"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-5 text-left"
                >
                  {/* Tab Title */}
                  <div>
                    <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <Bot size={15} className="text-orange-500" /> এআই মেন্টর কাস্টমাইজেশন
                    </h3>
                    <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mt-1">
                      ভয়েস মেন্টর চরিত্র, আবেগ-অনুভূতি এবং অডিও লেভেল নিয়ন্ত্রণ করুন
                    </p>
                  </div>

                  {/* Character Selector Grid */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                      পছন্দের ভার্চুয়াল মেন্টর (Virtual Companion):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {(["stranger", "anjali", "zoya", "khud", "rohan", "ishani", "mahi"] as const).map((id) => {
                        const isSelected = selectedCharacter === id;
                        return (
                          <button
                            key={id}
                            onClick={() => {
                              setSelectedCharacter(id);
                              syncUserProfile({ selectedCharacter: id });
                            }}
                            className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-stone-800 text-left ${
                              isSelected
                                ? "border-orange-500 text-orange-500 shadow-lg shadow-orange-500/5 scale-[1.02]"
                                : "border-stone-100 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-200 dark:hover:border-stone-600 hover:bg-stone-50/40 dark:hover:bg-stone-700/40"
                            }`}
                          >
                            <div className="relative shrink-0">
                              <img
                                src={characterAvatars[id]}
                                alt={id}
                                className={`w-9.5 h-9.5 rounded-full border ${
                                  isSelected ? "border-orange-500" : "border-stone-100 dark:border-stone-700"
                                }`}
                              />
                              {isSelected && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-stone-800 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-wide block truncate">
                                {id === "stranger" ? "The Stranger" : id}
                              </span>
                              <span className={`text-[8px] font-bold block mt-0.5 ${isSelected ? "text-orange-500" : "text-stone-400 dark:text-stone-500"}`}>
                                {isSelected ? "Active মেন্টর" : "বাছুন"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Speech Rate & Mute */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${isMuted ? "bg-stone-50 dark:bg-stone-900 border-stone-100 dark:border-stone-700 text-stone-400 dark:text-stone-500" : "bg-orange-50/10 border-orange-100/50 text-orange-500"}`}>
                          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                        </div>
                        <div>
                          <span className="text-xs font-black text-stone-800 dark:text-stone-100 block leading-none">অডিও মিউট</span>
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 block mt-1">ভয়েস সাউন্ড অন/অফ</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const next = !isMuted;
                          setIsMuted(next);
                          syncUserProfile({ isMuted: next });
                        }}
                        className={`w-11 h-6 rounded-full transition-all relative flex items-center px-1 shrink-0 cursor-pointer ${
                          isMuted ? "bg-orange-500" : "bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transition-all ${
                            isMuted ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 space-y-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Sliders size={13} className="text-orange-500" />
                        <span className="text-xs font-black text-stone-800 dark:text-stone-100">ভয়েস স্পিড মুড (Tempo)</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {(["default", "fast", "slow", "emotional"] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => {
                              setVoiceStyle(style);
                              syncUserProfile({ voiceStyle: style });
                            }}
                            className={`py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border cursor-pointer ${
                              voiceStyle === style
                                ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-400 text-amber-700 dark:text-amber-400"
                                : "bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-400 hover:border-stone-200 dark:hover:border-stone-600 hover:text-stone-600 dark:hover:text-stone-200"
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 24/7 Human Emotion Spectrum Display */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-1.5 justify-between">
                      <div className="flex items-center gap-1.5">
                        <Heart size={13} className="text-rose-500 animate-pulse" />
                        <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                          সক্রিয় এআই আবেগ ইঞ্জিন (Emotion Spectrum):
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500">Voice Persona</span>
                        <button
                          onClick={() => {
                            const next = !isPersonaEnabled;
                            setIsPersonaEnabled(next);
                            voiceService.setVoicePersonaEnabled(next);
                          }}
                          className={`w-9 h-5 rounded-full transition-all relative flex items-center px-1 shrink-0 cursor-pointer ${
                            isPersonaEnabled ? "bg-orange-500" : "bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transition-all ${
                              isPersonaEnabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {emotionList.map((emo, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2.5 p-2 px-3 bg-white dark:bg-stone-800 border rounded-xl text-[10px] font-bold ${emo.color} dark:bg-opacity-5 dark:border-opacity-20`}
                        >
                          <span className="text-sm">{emo.emoji}</span>
                          <div className="min-w-0">
                            <span className="block text-stone-700 dark:text-stone-200 leading-tight font-black truncate">{emo.name}</span>
                            <span className="block text-[8px] text-stone-400 dark:text-stone-500 font-mono mt-0.5 truncate">{emo.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "api" && (
                <motion.div
                  key="tab-api"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4 text-left"
                >
                  {/* Tab Title */}
                  <div>
                    <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <Key size={15} className="text-orange-500" /> এপিআই ও এআই মডেল হাব
                    </h3>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                      ব্যক্তিগত গুগল এআই স্টুডিও কি এবং কাস্টমাইজড স্পিড মডেলগুলি কনফিগার করুন
                    </p>
                  </div>

                  {/* API Key Guide Link */}
                  <div className="p-4 bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 text-[10px] text-stone-500 dark:text-stone-400 flex items-start justify-between gap-4 leading-relaxed shadow-sm">
                    <div>
                      <strong className="text-amber-600 dark:text-amber-500 block mb-1 font-black">💡 কিভাবে ফ্রিতে এপিআই কি পাবেন?</strong>
                      গুগল এআই স্টুডিও থেকে ১০০% ফ্রিতে পার্সোনাল এপিআই কি পাওয়া যায়। পাশের লিংকে গিয়ে সাইন ইন করে "Create API key" বাটনে ক্লিক করে কিটি কপি করে নিচে পেস্ট করুন।
                    </div>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-orange-500 font-black hover:bg-orange-50/30 dark:hover:bg-orange-500/10 shrink-0 flex items-center gap-1 bg-white dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-100 dark:border-stone-700 shadow-sm transition-all active:scale-95"
                    >
                      গেট ফ্রি কি <ExternalLink size={9} />
                    </a>
                  </div>

                  {/* Inputs and Dropdowns */}
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                        ১. মেন্টর এপিআই কি (Personal Gemini Key):
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3.5 flex items-center text-stone-400 dark:text-stone-500">
                          <Shield size={14} />
                        </div>
                        <input
                          type="password"
                          value={customApiKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomApiKey(val);
                            syncUserProfile({ geminiApiKey: val });
                          }}
                          placeholder="Paste your API key here (starts with AIzaSy)..."
                          className="stranger-input w-full pl-10 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                        ২. কুইজ ও ম্যাথ এপিআই কি (Quiz & Math Key):
                      </label>
                      <input
                        type="password"
                        value={quizMathApiKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuizMathApiKey(val);
                          syncUserProfile({ quizMathApiKey: val });
                        }}
                        placeholder="ফাঁকা রাখলে মেন্টর কি-টি ব্যবহার হবে (Optional/Leave blank)..."
                        className="stranger-input w-full font-mono"
                      />
                    </div>

                    {/* Grid for Preferred Models */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block">🟢 কুইজ ও স্পিড ব্লিটজ মডেল:</span>
                        <select
                          value={preferredQuizModel}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreferredQuizModel(val);
                            localStorage.setItem("pref_quiz_model", val);
                            syncUserProfile({ preferredQuizModel: val });
                          }}
                          className="w-full bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl p-3 text-xs text-stone-700 dark:text-stone-200 outline-none focus:border-orange-500 cursor-pointer shadow-sm"
                        >
                          <option value="gemini-3.1-flash-lite">gpt-6-astra-lite (lite-recommended)</option>
                          <option value="gemini-3.6-flash">gpt-6-astra-fast (high-speed)</option>
                          <option value="gemini-3.1-pro-preview">gpt-6-astra-pro (pro-reasoning)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block">🔵 সায়েন্স ও ম্যাথ সলভার মডেল:</span>
                        <select
                          value={preferredMathModel}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreferredMathModel(val);
                            localStorage.setItem("pref_math_model", val);
                            syncUserProfile({ preferredMathModel: val });
                          }}
                          className="w-full bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl p-3 text-xs text-stone-700 dark:text-stone-200 outline-none focus:border-orange-500 cursor-pointer shadow-sm"
                        >
                          <option value="gemini-3.1-flash-lite">gpt-6-astra-lite (lite-recommended)</option>
                          <option value="gemini-3.6-flash">gpt-6-astra-fast (high-speed)</option>
                          <option value="gemini-3.1-pro-preview">gpt-6-astra-pro (pro-reasoning)</option>
                        </select>
                      </div>
                    </div>

                    {/* Cloudflare Token Input */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block flex items-center justify-between">
                        <span>৩. ক্লাউডফ্লেয়ার ইমেজ টোকেন:</span>
                        <a
                          href="https://dash.cloudflare.com/api-tokens"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-orange-500 font-bold hover:underline"
                        >
                          টোকেন ড্যাশবোর্ড &rarr;
                        </a>
                      </label>
                      <input
                        type="password"
                        value={cloudflareApiToken}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCloudflareApiToken(val);
                          localStorage.setItem("cf_api_token", val);
                          syncUserProfile({ cloudflareApiToken: val });
                        }}
                        placeholder="Paste your Cloudflare API Token for premium ultra-fast images..."
                        className="stranger-input w-full font-mono"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "system" && (
                <motion.div
                  key="tab-system"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4.5 text-left"
                >
                  {/* Tab Title */}
                  <div>
                    <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <Sliders size={15} className="text-orange-500" /> সিস্টেম মোড ও মেমোরি ব্যালেন্স
                    </h3>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                      কিডস মোড কাস্টমাইজেশন, নোটিফিকেশন সেন্টার এবং এআই মেমোরি কন্ট্রোল করুন
                    </p>
                  </div>

                  {/* Kids Mode Toggle */}
                  <div
                    className={`p-4.5 rounded-2xl border transition-all space-y-2 bg-white dark:bg-stone-800 shadow-sm ${
                      isKidsMode
                        ? "border-orange-500 shadow-lg shadow-orange-500/5"
                        : "border-stone-100 dark:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-400 flex items-center justify-center text-sm shadow-sm">
                          👶
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-stone-800 dark:text-stone-100">কিডস মোড (Kids Mode Corner)</h4>
                            <span className="text-[8px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded uppercase">
                              ৪-১২ বছর
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                            সহজ ব্যাখ্যা, রূপকথার গল্প ও ম্যাজিক সায়েন্স হাব
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const next = !isKidsMode;
                          setIsKidsMode(next);
                          localStorage.setItem("pref_kids_mode", next ? "true" : "false");
                          syncUserProfile({ isKidsMode: next });
                        }}
                        className={`w-11 h-6 rounded-full transition-all relative flex items-center px-1 shrink-0 cursor-pointer ${
                          isKidsMode ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transition-all ${
                            isKidsMode ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Brain/Memory Sync Section */}
                  <div className="p-4.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-between gap-4 shadow-sm hover:border-stone-200 dark:hover:border-stone-600 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-50/20 dark:bg-indigo-500/10 text-indigo-500 border border-indigo-100/50 dark:border-indigo-500/20 shrink-0">
                        <Brain size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-stone-850 dark:text-stone-100">এআই মেমোরি ব্যাংক (Memory Vault)</h4>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 leading-relaxed">
                          মেন্টর ও ম্যাথ সলভারের মনে রাখা বিষয়গুলি পরীক্ষা করুন এবং কাস্টমাইজ করুন
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenMemoryVault();
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Brain size={11} /> মেমোরি
                    </button>
                  </div>

                  {/* Notification Center Trigger */}
                  <div className="p-4.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-between gap-4 shadow-sm hover:border-stone-200 dark:hover:border-stone-600 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-orange-50/20 dark:bg-orange-500/10 text-orange-500 border border-orange-100/50 dark:border-orange-500/20 shrink-0">
                        <BellRing size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-stone-850 dark:text-stone-100">নোটিফিকেশন হাব (Notification Hub)</h4>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 leading-relaxed">
                          সিস্টেম নোটিফিকেশন, ক্রিস্টাল রিংটোন এবং স্টাডি পুশ এলার্ট পরিচালনা করুন
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenNotifications();
                      }}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <BellRing size={11} /> নোটিফিকেশন
                    </button>
                  </div>

                  {/* External Tab link for easy access */}
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-orange-500 text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer active:scale-98 shadow-sm"
                  >
                    <ExternalLink size={14} />
                    <span>Open in New Tab (নতুন ট্যাবে খোলো)</span>
                  </a>
                </motion.div>
              )}

              {activeTab === "android" && isAdmin && (
                <motion.div
                  key="tab-android"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4 text-left"
                >
                  {/* Tab Title */}
                  <div>
                    <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <Smartphone size={15} className="text-emerald-600" /> অ্যান্ড্রয়েড রানটাইম পারমিশন (Admin)
                    </h3>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                      মোবাইল কল এবং কন্টাক্ট অ্যাক্সেস কন্ট্রোল ও জিরো-নলেজ সিকিউরিটি সেটিংস
                    </p>
                  </div>

                  {/* Permission Status Grid */}
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex flex-col gap-1.5 shadow-sm">
                      <span className="text-stone-400 dark:text-stone-500 font-bold">CALL_PHONE_PERMISSION:</span>
                      <span className={AndroidPermissionService.isCallPhoneGranted() ? "text-emerald-600 font-black" : "text-amber-600 font-black"}>
                        {AndroidPermissionService.isCallPhoneGranted() ? "✓ Granted (অনুমোদিত)" : "✕ Not Granted"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex flex-col gap-1.5 shadow-sm">
                      <span className="text-stone-400 dark:text-stone-500 font-bold">READ_CONTACTS_PERMISSION:</span>
                      <span className={AndroidPermissionService.isReadContactsGranted() ? "text-emerald-600 font-black" : "text-amber-600 font-black"}>
                        {AndroidPermissionService.isReadContactsGranted() ? "✓ Granted (অনুমোদিত)" : "✕ Not Granted"}
                      </span>
                    </div>
                  </div>

                  {/* Privacy Guarantee Guard */}
                  <div className="p-4 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl flex items-start gap-3 text-[10px] text-emerald-800 dark:text-emerald-400 shadow-sm leading-relaxed">
                    <Shield size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-1 font-black">🔒 জিরো-নলেজ প্রাইভেসি সিকিউরিটি গ্যারান্টি</strong>
                      আপনার কন্টাক্ট লিস্ট বা কল ডায়াল হিস্ট্রি কোনো সার্ভার বা ডেভেলপারের কাছে পাঠানো হয় না। এটি সম্পূর্ণ ক্লায়েন্ট-সাইড মেমোরি আইসোলেটেড।
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAndroidPermissionModal();
                      }}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 shadow-emerald-600/10"
                    >
                      <Shield size={13} />
                      <span>পারমিশন পরিবর্তন করুন</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenDialer();
                      }}
                      className="py-3 px-4 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-stone-100 dark:border-stone-700 shadow-sm"
                    >
                      <Phone size={13} />
                      <span>ডায়াল প্যাড</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Bottom Footer Details (Version & Metadata) */}
          <div className="pt-4 mt-6 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[9px] text-stone-400 dark:text-stone-500 font-mono">
            <span>STUDY STRANGER V4.5 // PREMIUM</span>
            <span>SECURED BY FIREBASE AUTH</span>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};
