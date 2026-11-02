import React, { useState } from "react";
import { 
  Bot, 
  Sparkles, 
  BookOpen, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  Brain, 
  BarChart3, 
  Zap, 
  Award, 
  HelpCircle, 
  Users, 
  Volume2, 
  VolumeX, 
  Check, 
  ChevronRight, 
  Activity,
  FileText,
  Clock,
  Flame,
  Search,
  Atom,
  Radio
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { soundEffects } from "../services/soundEffectsService";
import { Hero3DCanvas } from "./Hero3DCanvas";

interface LandingPageProps {
  onStartLogin: () => void;
  onOpenPrivacy: () => void;
  onStartGuestLive?: () => void;
  onOpenHelp?: () => void;
}

type FeatureTab = 
  | "mastery" 
  | "simplifier" 
  | "tutor" 
  | "group" 
  | "quiz" 
  | "feynman" 
  | "autopsy";

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartLogin, 
  onOpenPrivacy,
  onStartGuestLive,
  onOpenHelp
}) => {
  const [isMuted, setIsMuted] = useState(() => soundEffects.isMuted());
  const [activeTab, setActiveTab] = useState<FeatureTab>("mastery");
  const [is3DLabActive, setIs3DLabActive] = useState(false);

  const handleToggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    if (!muted) soundEffects.playClick();
  };

  const handleTabChange = (tab: FeatureTab) => {
    soundEffects.playTabSwitch();
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden pt-3 sm:pt-4 transition-colors duration-300 bg-notebook-subtle">
      {/* Soft warm luminous background glows */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none opacity-50 dark:opacity-20" 
        style={{
          backgroundImage: "radial-gradient(circle, rgba(251, 146, 60, 0.12) 0%, rgba(253, 186, 116, 0.06) 40%, transparent 70%)"
        }}
      />
      
      {/* Subtle modern dot matrix */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* 1. Sleek Floating Glass Island Navigation Header */}
      <header className="sticky top-3 sm:top-4 z-50 max-w-5xl mx-auto px-3 sm:px-4">
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-2xl border border-stone-200/80 dark:border-stone-800/80 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xl shadow-stone-200/20 dark:shadow-black/40 transition-all">
          {/* Brand */}
          <div 
            onClick={() => soundEffects.playClick()}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl overflow-hidden border border-orange-400/40 p-0.5 bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform flex items-center justify-center text-white">
              <Bot size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black tracking-tight text-stone-900 dark:text-white block leading-none">
                Study Stranger
              </span>
              <span className="hidden xs:inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                WBCHSE Sem 3
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100/80 dark:bg-stone-800/50 p-1 rounded-full border border-stone-200/60 dark:border-stone-700/50">
            {[
              { id: "mastery", label: "Mastery" },
              { id: "simplifier", label: "Simplifier" },
              { id: "tutor", label: "AI Tutor" },
              { id: "quiz", label: "Quizzes" },
              { id: "feynman", label: "Feynman" },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id as FeatureTab)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm border border-stone-200/70 dark:border-stone-600" 
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-white dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all shadow-sm cursor-pointer"
              title={isMuted ? "Sound Off" : "Sound On"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-orange-500" />}
            </button>

            {onOpenHelp && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenHelp();
                }}
                className="hidden xs:flex p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50 text-orange-700 dark:text-orange-400 transition-all shadow-sm cursor-pointer items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
              >
                <HelpCircle size={14} />
                <span className="hidden sm:inline">Help</span>
              </button>
            )}

            <button
              onClick={() => {
                soundEffects.playStartupChime();
                onStartLogin();
              }}
              className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer stranger-btn-human"
            >
              Enter Lab
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-20 pb-16 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[10px] font-black text-stone-800 dark:text-stone-300 shadow-sm backdrop-blur-md uppercase tracking-widest"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            WBCHSE Sem 3 AI Prep
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-8xl font-black text-stone-950 dark:text-white tracking-tighter leading-[0.95] max-w-4xl mx-auto stranger-text-editorial"
        >
          Study less, <br />
          <span className="stranger-gradient-text font-black italic">
            master more.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Your smart AI companion for Class 12 exams. Simplify notes, generate high-yield quizzes, track topic mastery, and ace Semester 3.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6"
        >
          <button
            onClick={() => {
              soundEffects.playStartupChime();
              onStartLogin();
            }}
            className="w-full sm:w-auto px-10 py-5 stranger-btn-human text-sm flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Begin Your Session</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {onStartGuestLive && (
            <button
              onClick={() => {
                soundEffects.playStartupChime();
                onStartGuestLive();
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
            >
              <Radio size={18} className="text-orange-500 animate-pulse" />
              <span>1:1 Live Voice</span>
            </button>
          )}
        </motion.div>

        {/* Feature Navigation Strip - SCROLLABLE */}
        <div className="pt-12 w-full">
          <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar touch-pan-x px-2 -mx-2 custom-scrollbar">
            {[
              { id: "mastery", label: "Mastery", icon: <BarChart3 size={18} /> },
              { id: "simplifier", label: "Simplifier", icon: <FileText size={18} /> },
              { id: "tutor", label: "AI Tutor", icon: <Bot size={18} /> },
              { id: "group", label: "Group Chat", icon: <Users size={18} /> },
              { id: "quiz", label: "Quizzes", icon: <Target size={18} /> },
              { id: "feynman", label: "Feynman", icon: <Brain size={18} /> },
              { id: "autopsy", label: "Autopsy", icon: <Award size={18} /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as FeatureTab)}
                  className={`flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-stone-800 border-orange-500 shadow-lg shadow-orange-500/10 text-stone-900 dark:text-white"
                      : "bg-stone-100 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:bg-white dark:hover:bg-stone-800"
                  }`}
                >
                  <div className={`${isActive ? "text-orange-500" : "text-stone-400"}`}>
                    {tab.icon}
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Feature Showcase Card */}
      <section className="max-w-5xl mx-auto px-4 pb-20 relative">
        {/* Handwriting annotation */}
        <div className="absolute -top-6 -right-4 hidden lg:block rotate-12 pointer-events-none">
          <div className="flex flex-col items-center">
            <span className="text-orange-500 font-display font-bold text-sm tracking-tight border-b-2 border-orange-500/30 pb-1 px-2 italic">Handcrafted for WBCHSE</span>
            <Sparkles size={16} className="text-orange-400 mt-1 animate-pulse" />
          </div>
        </div>

        <div className="stranger-card-premium p-6 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {activeTab === "mastery" && (
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Advanced Learning</span>
                      <h2 className="text-3xl font-black text-stone-900 dark:text-white mt-2 leading-tight">Master Every Topic with Scientific Precision</h2>
                      <p className="text-stone-600 dark:text-stone-400 font-medium mt-4">Our AI tracks your retention curve and helps you focus on what you're most likely to forget. No more guessing what to study.</p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Biology: Reproduction", value: 94 },
                        { label: "English B: The Bet", value: 78 },
                        { label: "Genetics & Evolution", value: 65 },
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                            <span>{item.label}</span>
                            <span>{item.value}% Mastery</span>
                          </div>
                          <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              className="h-full bg-orange-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-[2rem] border border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                        <Activity size={20} />
                      </div>
                      <h3 className="font-black text-stone-900 dark:text-white uppercase tracking-wider text-sm">Real-time Insights</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
                        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Weak Spot Detected</p>
                        <p className="text-sm font-black text-stone-900 dark:text-white mt-1">"Linkage vs Crossing Over" concepts are fading. Review recommended today.</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
                        <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Mastery Achievement</p>
                        <p className="text-sm font-black text-stone-900 dark:text-white mt-1">You've mastered 100% of "Reproduction in Flowering Plants"!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== "mastery" && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-orange-500">
                    {activeTab === "simplifier" && <FileText size={32} />}
                    {activeTab === "tutor" && <Bot size={32} />}
                    {activeTab === "group" && <Users size={32} />}
                    {activeTab === "quiz" && <Target size={32} />}
                    {activeTab === "feynman" && <Brain size={32} />}
                    {activeTab === "autopsy" && <Award size={32} />}
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 dark:text-white capitalize">{activeTab} Mode</h3>
                  <p className="text-stone-600 dark:text-stone-400 max-w-md font-medium">This feature is optimized for the WBCHSE Semester 3 syllabus. Sign in to explore the full interactive experience.</p>
                  <button 
                    onClick={onStartLogin}
                    className="mt-4 px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold text-sm active:scale-95 transition-all cursor-pointer"
                  >
                    Unlock with Google
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-stone-200 dark:border-stone-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 flex items-center justify-center font-black">S</div>
            <span className="font-black tracking-tight text-stone-900 dark:text-white">Study Stranger</span>
          </div>
          <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-500">
            <button onClick={onOpenPrivacy} className="hover:text-orange-500 cursor-pointer">Privacy Policy</button>
            <button onClick={onOpenHelp} className="hover:text-orange-500 cursor-pointer border-none bg-transparent">Help & Documentation</button>
          </div>
          <p className="text-[10px] font-bold text-stone-400">© 2024 Study Stranger AI System. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};
