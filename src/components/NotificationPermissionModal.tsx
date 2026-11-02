import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, ShieldCheck, X, Sparkles, BookOpen } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted?: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(20);
      }
      const granted = await notificationService.requestPermission();
      if (granted && onPermissionGranted) {
        onPermissionGranted();
      }
      onClose();
    } catch (err) {
      console.error('Permission request error:', err);
      onClose();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeny = () => {
    notificationService.dismissPermissionPrompt();
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="notification-permission-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none"
      >
        <motion.div
          id="notification-permission-card"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="w-full max-w-sm rounded-[28px] bg-gradient-to-b from-stone-900 via-stone-900 to-black text-white p-5 sm:p-6 shadow-2xl border border-stone-800 relative overflow-hidden"
        >
          {/* Subtle glowing ambient behind icon */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close / Dismiss cross button */}
          <button
            id="close-notif-perm-dialog-btn"
            onClick={handleDeny}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {/* Android Style Header Icon */}
          <div className="flex flex-col items-center text-center pt-1 pb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF7A30] to-amber-500 p-0.5 shadow-lg shadow-orange-500/20 mb-3 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-stone-900 flex items-center justify-center">
                <Bell size={26} className="text-[#FF7A30] animate-bounce" />
              </div>
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF7A30] font-bold">
              Study Stranger • WBCHSE Sem 3
            </span>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
              নোটিফিকেশন অনুমতি দিন?
            </h3>
            <p className="text-xs text-stone-300 mt-1.5 leading-relaxed max-w-[280px]">
              পরীক্ষার প্রস্তুতি ও রিভিশনের গুরুত্বপূর্ণ আপডেট পেতে নোটিফিকেশন চালু করুন।
            </p>
          </div>

          {/* Benefit list */}
          <div className="space-y-2 py-3 border-y border-stone-800/80 my-2 text-xs">
            <div className="flex items-start gap-2.5 text-stone-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Biology, বাংলা ও English গুরুত্বপূর্ণ MCQ বুস্টার</span>
            </div>
            <div className="flex items-start gap-2.5 text-stone-300">
              <BookOpen size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span>WBCHSE সেমিস্টার ৩ মক টেস্ট ও রুটিন রিমাইন্ডার</span>
            </div>
            <div className="flex items-start gap-2.5 text-stone-300">
              <ShieldCheck size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>১০০% স্প্যাম-মুক্ত, যে কোনো সময় বন্ধ করার সুবিধা</span>
            </div>
          </div>

          {/* Action buttons - Android native style */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              id="allow-notification-perm-btn"
              onClick={handleAllow}
              disabled={isRequesting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF7A30] to-orange-500 hover:from-orange-600 hover:to-[#FF7A30] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={16} />
              <span>{isRequesting ? 'অনুরোধ হচ্ছে...' : 'অনুমতি দিন (Allow)'}</span>
            </button>

            <button
              id="deny-notification-perm-btn"
              onClick={handleDeny}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white font-bold text-xs transition-colors cursor-pointer text-center"
            >
              <span>এখন নয় (Don't Allow)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
