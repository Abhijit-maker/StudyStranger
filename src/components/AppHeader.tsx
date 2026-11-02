import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  Coins,
  Bell,
  Settings,
  Menu,
  Sparkles,
  Download,
  BookOpen,
  Shield,
  Send,
  Brain,
  User as UserIcon,
  Palette,
  Phone,
  PhoneCall,
  Monitor,
  Tablet,
  Smartphone,
  ChevronRight,
  Flame,
  Zap,
  GraduationCap,
  HelpCircle,
  Sun,
  Moon,
  Clock,
  X
} from "lucide-react";
import { AndroidPermissionService } from "../services/androidPermissionService";
import { CharacterType } from "../services/liveService";

interface AppHeaderProps {
  currentView: "dashboard" | "active";
  setCurrentView: (view: "dashboard" | "active") => void;
  selectedCharacter: CharacterType;
  isSessionActive: boolean;
  appState: string;
  user: any;
  isKidsMode: boolean;
  onToggleKidsMode: () => void;
  isAppInstalled: boolean;
  onInstallPWA: () => void;
  onOpenAdsCenter: () => void;
  onOpenNoticeBoard: () => void;
  onOpenAdminPanel: () => void;
  onOpenTelegram: () => void;
  onOpenMemoryVault: () => void;
  onOpenThemes: () => void;
  onOpenAccountability?: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenMobileMenu: () => void;
  onOpenDialer: () => void;
  prefMode: string;
  onSetPrefMode: (mode: "auto" | "desktop" | "tablet" | "android") => void;
  detectedType: string;
  unreadNotificationsCount: number;
  onOpenHelp?: () => void;
  themeMode?: "auto" | "light" | "dark";
  isDarkMode?: boolean;
  onToggleThemeMode?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  setCurrentView,
  selectedCharacter,
  isSessionActive,
  appState,
  user,
  isKidsMode,
  onToggleKidsMode,
  isAppInstalled,
  onInstallPWA,
  onOpenAdsCenter,
  onOpenNoticeBoard,
  onOpenAdminPanel,
  onOpenTelegram,
  onOpenMemoryVault,
  onOpenThemes,
  onOpenAccountability,
  onOpenProfile,
  onOpenNotifications,
  onOpenSettings,
  onOpenMobileMenu,
  onOpenDialer,
  prefMode,
  onSetPrefMode,
  detectedType,
  unreadNotificationsCount,
  onOpenHelp,
  themeMode = "auto",
  isDarkMode = false,
  onToggleThemeMode
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollPos > 18);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = user?.isAdmin || user?.role === "admin";

  return (
    <header
      id="main-app-header"
      className={`sticky top-0 z-50 w-full transition-all duration-500 backdrop-blur-3xl border-b bg-notebook-subtle ${
        isScrolled
          ? "py-1 bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-white border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/5 dark:shadow-black/20"
          : "py-3 bg-white/70 dark:bg-stone-900/70 text-stone-900 dark:text-white border-stone-100 dark:border-stone-800/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 overflow-hidden">
        
        {/* ================= LEFT: BRAND LOCKUP ================= */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <motion.div
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => setCurrentView("dashboard")}
            className="relative cursor-pointer shrink-0 group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl blur-xs opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-white flex items-center justify-center p-0.5 border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden transition-transform duration-200 group-hover:scale-105">
              <img
                src="/logo.svg"
                alt="Study Stranger Logo"
                className="w-full h-full object-contain rounded-lg drop-shadow-xs"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute("src", "/icon.svg");
                }}
              />
            </div>
          </motion.div>

          <div className="min-w-0 flex items-center gap-2">
            <span
              onClick={() => setCurrentView("dashboard")}
              className="font-black text-xs sm:text-sm tracking-[0.1em] text-stone-900 dark:text-white cursor-pointer hover:text-orange-500 dark:hover:text-orange-400 transition-colors truncate font-sans uppercase stranger-text-editorial"
            >
              Study Stranger
            </span>

            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSessionActive ? "bg-cyan-500" : "bg-emerald-500"}`} />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSessionActive ? "bg-cyan-500" : "bg-emerald-500"
                }`}
              />
            </span>

            {isAdmin && (
              <span className="px-1.5 py-0.2 rounded bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 text-[8px] font-black uppercase tracking-wider shrink-0">
                ADMIN
              </span>
            )}
          </div>
        </div>

        {/* ================= RIGHT: ACTIONS & CONTROLS ================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {user && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onOpenAdsCenter}
              className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] sm:text-xs transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Coins size={11} className="text-amber-500 dark:text-amber-400 stroke-[2.5]" />
              <span className="font-mono text-[10px] sm:text-[11px] font-black">
                {user.points || 0}
              </span>
              {user.premiumUnlocked && (
                <span className="hidden sm:inline-block px-1 py-0.2 rounded bg-indigo-600 text-white text-[8px] font-black tracking-wide">
                  PRO
                </span>
              )}
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onOpenNotifications}
            className="relative p-1.5 sm:p-2 rounded-full bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-200 transition-all cursor-pointer group shrink-0"
          >
            <Bell size={14} className="group-hover:rotate-12 transition-transform" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-0.5 text-[8px] font-black text-white shadow-sm ring-1 ring-white dark:ring-stone-950 animate-pulse">
                {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
              </span>
            )}
          </motion.button>

          {onToggleThemeMode && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onToggleThemeMode}
              className="hidden sm:flex p-2 rounded-full bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700/80 transition-all cursor-pointer text-stone-500 dark:text-amber-400 shrink-0"
            >
              {themeMode === "light" ? <Sun size={14} /> : <Moon size={14} />}
            </motion.button>
          )}

          <div className="hidden lg:flex items-center gap-1.5">
            {onOpenAccountability && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onOpenAccountability}
                className="p-2 rounded-full bg-orange-50 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/40 text-orange-600 dark:text-amber-400 hover:bg-orange-100 dark:hover:bg-orange-500/25 transition-all cursor-pointer"
              >
                <PhoneCall size={14} className="animate-pulse" />
              </motion.button>
            )}

            {user && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onOpenNoticeBoard}
                className="p-2 rounded-full bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-orange-400 transition-all cursor-pointer"
              >
                <BookOpen size={14} />
              </motion.button>
            )}

            {onOpenHelp && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onOpenHelp}
                className="p-2 rounded-full bg-stone-50 dark:bg-orange-500/10 border border-stone-200 dark:border-orange-500/30 text-stone-500 dark:text-[#FF7A30] transition-all cursor-pointer"
              >
                <HelpCircle size={14} />
              </motion.button>
            )}

            {user && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onOpenProfile}
                className="p-2 rounded-full bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-200 transition-all cursor-pointer"
              >
                <UserIcon size={14} />
              </motion.button>
            )}

            {isAdmin && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onOpenAdminPanel}
                className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md hover:bg-rose-500 transition-all cursor-pointer animate-pulse"
              >
                <Shield size={12} />
                <span>Admin Hub</span>
              </motion.button>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onOpenMobileMenu}
            className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl stranger-btn-human text-[10px] sm:text-xs transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
          >
            <Menu size={14} />
            <span className="font-sans font-black whitespace-nowrap hidden xs:inline tracking-widest uppercase">Explore</span>
          </motion.button>

        </div>

      </div>
    </header>
  );
};
