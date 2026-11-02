import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Palette,
  Check,
  Sparkles,
  RotateCcw,
  Eye,
  Zap,
  Moon,
  Sun,
  Clock
} from 'lucide-react';
import { APP_THEMES, AppTheme, themeService } from '../services/themeService';
import { nativeService } from '../services/nativeService';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChanged?: (theme: AppTheme) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  themeMode?: "auto" | "light" | "dark";
  onSetThemeMode?: (mode: "auto" | "light" | "dark") => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  onThemeChanged,
  isDarkMode,
  onToggleTheme,
  themeMode = "auto",
  onSetThemeMode
}) => {
  const [activeThemeId, setActiveThemeId] = useState<string>(themeService.getThemeId());
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    setActiveThemeId(themeService.getThemeId());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTheme = (theme: AppTheme) => {
    themeService.setTheme(theme.id);
    setActiveThemeId(theme.id);
    nativeService.triggerHaptic('success');
    nativeService.showToast(`✨ থিম সক্রিয়: ${theme.banglaName}`);
    if (onThemeChanged) onThemeChanged(theme);
  };

  const filteredThemes = filterCategory === "all"
    ? APP_THEMES
    : APP_THEMES.filter(t => t.category === filterCategory);

  return (
    <motion.div 
      id="theme-selector-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-2.5 sm:p-4 bg-black/40 backdrop-blur-md select-none"
      onClick={onClose}
    >
      <motion.div
        id="theme-selector-modal"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="w-full max-w-2xl bg-white border border-stone-200/80 rounded-3xl p-4 sm:p-6 text-stone-800 max-h-[90dvh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF7A30] to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Palette size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight text-stone-900">
                    অ্যাপ ডিজাইন ও থিম স্টুডিও
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-[#FF7A30] border border-orange-500/20">
                    NEW UI
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  আপনার পছন্দের রঙ ও নান্দনিক স্টাইলে Study Stranger-কে সাজিয়ে নিন
                </p>
              </div>
            </div>
            
            <button
              id="close-theme-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Category Filters & Light/Dark Switch */}
          <div className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-stone-200/60 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
              {[
                { id: "all", label: "সব ডিজাইন (All)" },
                { id: "classic", label: "ক্লাসিক্যাল" },
                { id: "modern", label: "মডার্ন ও সাইবার" },
                { id: "zen", label: "চোখের আরাম / জেন" },
                { id: "luxury", label: "রয়্যাল লাক্সারি" },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    filterCategory === cat.id
                      ? "bg-[#FF7A30] text-white shadow-sm"
                      : "bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 3-Way Mode Switcher: Light (দিন) / Dark (রাত) / Auto (স্বয়ংক্রিয়) */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl ml-auto border border-stone-200/80">
              <button
                onClick={() => onSetThemeMode ? onSetThemeMode("light") : onToggleTheme?.()}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  themeMode === "light"
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-600 hover:text-stone-950"
                }`}
                title="Light Mode: সবসময় সাদা"
              >
                <Sun size={12} />
                <span>দিন (Light)</span>
              </button>
              <button
                onClick={() => onSetThemeMode ? onSetThemeMode("dark") : onToggleTheme?.()}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  themeMode === "dark"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-950"
                }`}
                title="Dark Mode: সবসময় ডার্ক"
              >
                <Moon size={12} />
                <span>রাত (Dark)</span>
              </button>
              <button
                onClick={() => onSetThemeMode ? onSetThemeMode("auto") : onToggleTheme?.()}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  themeMode === "auto"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-950"
                }`}
                title="Auto Schedule: দিনে সাদা, রাতে স্বয়ংক্রিয় ডার্ক"
              >
                <Clock size={12} />
                <span>অটো (Auto)</span>
              </button>
            </div>
          </div>

          {/* Themes Grid */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredThemes.map((theme) => {
                const isSelected = activeThemeId === theme.id;
                return (
                  <motion.div
                    key={theme.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTheme(theme)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                      isSelected
                        ? "border-2 shadow-md bg-stone-50/20"
                        : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 text-stone-700"
                    }`}
                    style={{
                      borderColor: isSelected ? theme.accentColor : undefined,
                      boxShadow: isSelected ? `0 10px 30px -10px ${theme.glowColor}` : undefined
                    }}
                  >
                    {/* Background Preview Glow */}
                    <div 
                      className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"
                      style={{ background: theme.accentColor }}
                    />

                    <div>
                      {/* Top Bar inside card */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3.5 h-3.5 rounded-full ring-2 ring-stone-900/10 shadow-xs"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                            {theme.badge}
                          </span>
                        </div>

                        {isSelected && (
                          <span 
                            className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white shadow-xs"
                            style={{ backgroundColor: theme.accentColor }}
                          >
                            <Check size={11} /> সক্রিয় (Active)
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-sm font-extrabold text-stone-900 group-hover:text-[#FF7A30] transition-colors">
                        {theme.banglaName}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed line-clamp-2">
                        {theme.description}
                      </p>
                    </div>

                    {/* Color Swatches Palette Preview */}
                    <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-5 h-5 rounded-lg border border-stone-200/60 shadow-xs" 
                          style={{ backgroundColor: theme.accentColor }}
                          title="Accent Color"
                        />
                        <div 
                          className="w-5 h-5 rounded-lg border border-stone-200/60 shadow-xs" 
                          style={{ backgroundColor: theme.secondaryColor }}
                          title="Secondary Accent"
                        />
                        <div 
                          className="w-5 h-5 rounded-lg border border-stone-200/60 shadow-xs" 
                          style={{ backgroundColor: theme.previewCard }}
                          title="Card Background"
                        />
                      </div>

                      <span className="text-[10px] font-mono text-stone-400 group-hover:text-stone-700 transition-colors flex items-center gap-1">
                        <span>ব্যবহার করুন</span>
                        <Sparkles size={11} style={{ color: theme.accentColor }} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                const classic = APP_THEMES[0];
                handleSelectTheme(classic);
              }}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>ডিফল্ট থিমে ফিরুন (Default Classic)</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#FF7A30] text-white font-black text-xs hover:bg-orange-600 transition-all shadow-md cursor-pointer"
            >
              সম্পন্ন (Done)
            </button>
          </div>
      </motion.div>
    </motion.div>
  );
};
