import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Phone,
  PhoneCall,
  Bell,
  BookOpen,
  Shield,
  Send,
  Brain,
  User as UserIcon,
  Settings,
  Download,
  Baby,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Sun,
  Moon,
  Coins,
  Palette,
  Music
} from 'lucide-react';
import { AndroidPermissionService } from '../services/androidPermissionService';
import { notificationService } from '../services/notificationService';

interface MobileQuickActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isKidsMode: boolean;
  onToggleKidsMode: () => void;
  onOpenPhoneDialer: () => void;
  onOpenNotifications: () => void;
  onOpenNotices: () => void;
  onOpenAdmin: () => void;
  onOpenTelegram: () => void;
  onOpenMemory: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAdsCenter: () => void;
  onOpenAccountability?: () => void;
  onOpenThemes?: () => void;
  onOpenMusic?: () => void;
  onInstallPWA?: () => void;
  isAppInstalled?: boolean;
  prefMode: string;
  onSetPrefMode: (mode: "auto" | "desktop" | "tablet" | "android") => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  unreadNotificationsCount?: number;
}

export const MobileQuickActionsSheet: React.FC<MobileQuickActionsSheetProps> = ({
  isOpen,
  onClose,
  user,
  isKidsMode,
  onToggleKidsMode,
  onOpenPhoneDialer,
  onOpenNotifications,
  onOpenNotices,
  onOpenAdmin,
  onOpenTelegram,
  onOpenMemory,
  onOpenProfile,
  onOpenSettings,
  onOpenAdsCenter,
  onOpenAccountability,
  onOpenThemes,
  onOpenMusic,
  onInstallPWA,
  isAppInstalled,
  prefMode,
  onSetPrefMode,
  isDarkMode,
  onToggleTheme,
  unreadNotificationsCount = 0
}) => {
  if (!isOpen) return null;

  const handleAction = (cb?: () => void) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    onClose();
    if (cb) {
      setTimeout(() => {
        cb();
      }, 50);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="mobile-quick-actions-backdrop"
        className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md select-none"
        onClick={onClose}
      >
        <motion.div
          id="mobile-quick-actions-sheet"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="w-full max-w-lg bg-stone-900 border-t sm:border border-stone-800 rounded-t-[32px] sm:rounded-[32px] p-5 pb-8 sm:p-6 text-white max-h-[85vh] overflow-y-auto shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Pull handle for mobile swipe indicator */}
          <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto mb-4 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7A30] to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  <span>সব ফিচার ও অপশন</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-orange-400 font-bold">
                    MOBILE HUB
                  </span>
                </h3>
                <p className="text-[11px] text-stone-400">
                  Study Stranger-এর সব টুলস মোবাইলে এক স্পর্শে
                </p>
              </div>
            </div>
            <button
              id="close-mobile-sheet-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Points & Pro Banner */}
          {user && (
            <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Coins size={18} className="animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-400 font-mono flex items-center gap-1.5">
                    <span>{user.points || 0} POINTS</span>
                    {user.premiumUnlocked && (
                      <span className="text-[8px] bg-indigo-600 text-white rounded px-1.5 py-0.2 font-black">PRO</span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400">WBCHSE Study Rewards</div>
                </div>
              </div>
              <button
                onClick={() => handleAction(onOpenAdsCenter)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
              >
                পয়েন্ট হাব
              </button>
            </div>
          )}

          {/* Grid of Main Features */}
          <div className="grid grid-cols-2 gap-2.5 mt-3.5">
            {/* 0. Daily Calling & Parent Vigilance */}
            <button
              id="mobile-action-accountability"
              onClick={() => {
                if (onOpenAccountability) handleAction(onOpenAccountability);
              }}
              className="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-stone-800 hover:from-orange-500/30 border-2 border-[#FF7A30]/60 flex items-center justify-between gap-3 transition-all active:scale-98 text-left cursor-pointer group shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FF7A30] text-white shadow-md shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <PhoneCall size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white block">সকাল/রাতের কলিং ও অভিভাবক রিপোর্ট</span>
                    <span className="text-[8px] font-mono px-1.5 py-0.2 rounded font-black bg-amber-400 text-stone-950">HOT</span>
                  </div>
                  <span className="text-[10px] text-amber-200/90 font-medium">Daily Task Calling, Proof & Parent Report</span>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-bold">&rarr;</span>
            </button>

            {/* 0. Student Profile */}
            <button
              id="mobile-action-profile"
              onClick={() => handleAction(onOpenProfile)}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/40 flex flex-col items-start gap-2 transition-all active:scale-95 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-xl bg-[#FF7A30] text-white shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <UserIcon size={18} />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-[#FF7A30]/20 text-[#FF7A30]">
                  PROFILE
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-white block">আমার প্রোফাইল</span>
                <span className="text-[10px] text-stone-300">নাম, ছবি, বায়ো ও স্টাডি লক্ষ্য</span>
              </div>
            </button>

            {/* 0.5. App Design & Themes */}
            <button
              id="mobile-action-themes"
              onClick={() => {
                if (onOpenThemes) handleAction(onOpenThemes);
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/40 flex flex-col items-start gap-2 transition-all active:scale-95 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-xl bg-purple-500 text-white shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <Palette size={18} />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300">
                  6 THEMES
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-white block">ডিজাইন ও থিম</span>
                <span className="text-[10px] text-stone-300">নান্দনিক কালার ও স্টাইল</span>
              </div>
            </button>

            {/* 1. Direct Call & Contacts — Strictly ADMIN ONLY */}
            {(user?.isAdmin || user?.role === 'admin') && (
              <button
                id="mobile-action-phone"
                onClick={() => handleAction(onOpenPhoneDialer)}
                className="p-3.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 flex flex-col items-start gap-2 transition-all active:scale-95 text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    AndroidPermissionService.areAllPhonePermissionsGranted()
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {AndroidPermissionService.areAllPhonePermissionsGranted() ? 'ADMIN' : 'SETUP'}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">সরাসরি ফোন কল (Admin)</span>
                  <span className="text-[10px] text-stone-400">ডায়াল প্যাড ও কন্টাক্ট টেস্ট</span>
                </div>
              </button>
            )}

            {/* 2. Notification Hub */}
            <button
              id="mobile-action-notifications"
              onClick={() => handleAction(onOpenNotifications)}
              className="p-3.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 flex flex-col items-start gap-2 transition-all active:scale-95 text-left cursor-pointer group relative"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
                  <Bell size={18} />
                </div>
                {unreadNotificationsCount > 0 && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-500 text-white font-bold animate-pulse">
                    {unreadNotificationsCount} NEW
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">নোটিফিকেশন হাব</span>
                <span className="text-[10px] text-stone-400">
                  {notificationService.isPermissionGranted() ? 'সক্রিয় ও অ্যালার্ট অন' : 'অনুমতি দিন'}
                </span>
              </div>
            </button>

            {/* 3. Kids Learning Mode */}
            <button
              id="mobile-action-kids"
              onClick={() => handleAction(onToggleKidsMode)}
              className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 transition-all active:scale-95 text-left cursor-pointer group ${
                isKidsMode
                  ? 'bg-gradient-to-br from-amber-500/20 to-pink-500/20 border-orange-500/50'
                  : 'bg-stone-800/80 hover:bg-stone-800 border-stone-700/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
                  <Baby size={18} />
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  isKidsMode ? 'bg-orange-500 text-white' : 'bg-stone-700 text-stone-300'
                }`}>
                  {isKidsMode ? 'ON' : 'OFF'}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Kids Mode</span>
                <span className="text-[10px] text-stone-400">শিশু কর্নার (৪-১২ বছর)</span>
              </div>
            </button>

            {/* 4. Official Notice Board */}
            <button
              id="mobile-action-notices"
              onClick={() => handleAction(onOpenNotices)}
              className="p-3.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 flex flex-col items-start gap-2 transition-all active:scale-95 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                  <BookOpen size={18} />
                </div>
                <span className="text-[9px] font-mono text-stone-400">WBCHSE</span>
              </div>
              <div>
                <span className="text-xs font-bold text-white block">নোটিশ বোর্ড ও PDF</span>
                <span className="text-[10px] text-stone-400">অফিসিয়াল সার্কুলার</span>
              </div>
            </button>

            {/* 5. Telegram Hub */}
            <button
              id="mobile-action-telegram"
              onClick={() => handleAction(onOpenTelegram)}
              className="p-3.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 flex flex-col items-start gap-2 transition-all active:scale-95 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
                  <Send size={18} />
                </div>
                <span className="text-[9px] font-mono text-sky-400 font-bold">BOT</span>
              </div>
              <div>
                <span className="text-xs font-bold text-white block">টেলিগ্রাম পোর্টাল</span>
                <span className="text-[10px] text-stone-400">বট ও স্টাডি গ্রুপ</span>
              </div>
            </button>

            {/* 6. AI Memory Vault */}
            <button
              id="mobile-action-memory"
              onClick={() => handleAction(onOpenMemory)}
              className="p-3.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 flex flex-col items-start gap-2 transition-all active:scale-95 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Brain size={18} />
                </div>
                <span className="text-[9px] font-mono text-indigo-400 font-bold">AI</span>
              </div>
              <div>
                <span className="text-xs font-bold text-white block">এআই মেমোরি ব্যাংক</span>
                <span className="text-[10px] text-stone-400">ব্যক্তিগত লার্নিং নোট</span>
              </div>
            </button>

            {/* 7. Admin Panel - STRICTLY ADMIN ONLY */}
            {(user?.isAdmin || user?.role === 'admin' || (user?.email && user.email.toLowerCase() === 'jhhh47943@gmail.com')) && (
              <button
                id="mobile-action-admin"
                onClick={() => handleAction(onOpenAdmin)}
                className="p-3.5 rounded-2xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 flex flex-col items-start gap-2 transition-all active:scale-95 text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400 group-hover:scale-110 transition-transform">
                    <Shield size={18} />
                  </div>
                  <span className="text-[9px] font-mono bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">অ্যাডমিন কন্ট্রোল</span>
                  <span className="text-[10px] text-stone-400">এআই কো-পাইলট ও সিস্টেম</span>
                </div>
              </button>
            )}

            {/* 8. App Settings */}
            <button
              id="mobile-action-settings"
              onClick={() => handleAction(onOpenSettings)}
              className="p-3.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 flex flex-col items-start gap-2 transition-all active:scale-95 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-xl bg-stone-700 text-stone-300 group-hover:rotate-45 transition-transform">
                  <Settings size={18} />
                </div>
                <span className="text-[9px] font-mono text-stone-400">CONFIG</span>
              </div>
              <div>
                <span className="text-xs font-bold text-white block">অ্যাপ সেটিংস</span>
                <span className="text-[10px] text-stone-400">সাউন্ড, থিম ও প্রোফাইল</span>
              </div>
            </button>
          </div>

          {/* Quick Install PWA button if not installed */}
          {!isAppInstalled && onInstallPWA && (
            <div className="mt-3.5">
              <button
                id="mobile-action-install"
                onClick={() => handleAction(onInstallPWA)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF7A30] to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Download size={16} className="animate-bounce" />
                <span>অ্যান্ড্রয়েড অ্যাপ ইনস্টল করুন (Install App)</span>
              </button>
            </div>
          )}

          {/* Device Frame / Responsive Switcher on Mobile */}
          <div className="mt-4 p-3 rounded-2xl bg-stone-800/50 border border-stone-800">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-2 font-bold">
              🖥️ ডিসপ্লে লেআউট ও ভিউ মোড:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'auto', label: 'Auto', icon: Sparkles },
                { id: 'android', label: 'Mobile', icon: Smartphone },
                { id: 'tablet', label: 'Tablet', icon: Tablet },
                { id: 'desktop', label: 'PC', icon: Monitor },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                      navigator.vibrate(10);
                    }
                    onSetPrefMode(item.id as any);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    prefMode === item.id
                      ? 'bg-[#FF7A30] text-white shadow-md'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <item.icon size={13} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
