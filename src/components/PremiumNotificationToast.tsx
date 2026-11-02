import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ExternalLink, Sparkles, Volume2, BookOpen, Flame, Mic, Dna } from 'lucide-react';
import { notificationService, StudyNotification, NotificationCategory } from '../services/notificationService';

interface PremiumNotificationToastProps {
  onActionClick?: (notification: StudyNotification) => void;
}

export const PremiumNotificationToast: React.FC<PremiumNotificationToastProps> = ({ onActionClick }) => {
  const [activeNotification, setActiveNotification] = useState<StudyNotification | null>(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Subscribe to incoming notifications
    const unsubscribe = notificationService.subscribe((notif) => {
      setActiveNotification(notif);
      setProgress(100);
    });

    return () => unsubscribe();
  }, []);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!activeNotification) return;

    const DURATION = 8000; // 8 seconds display
    const INTERVAL = 100;
    const step = (INTERVAL / DURATION) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          setActiveNotification(null);
          return 0;
        }
        return prev - step;
      });
    }, INTERVAL);

    return () => clearInterval(interval);
  }, [activeNotification]);

  const handleAction = () => {
    if (!activeNotification) return;
    if (onActionClick) {
      onActionClick(activeNotification);
    } else if (activeNotification.actionUrl) {
      // Default URL navigation
      const url = new URL(activeNotification.actionUrl, window.location.origin);
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setActiveNotification(null);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'biology':
        return <Dna size={18} className="text-emerald-400" />;
      case 'bengali':
        return <BookOpen size={18} className="text-amber-400" />;
      case 'english':
        return <Sparkles size={18} className="text-sky-400" />;
      case 'study_streak':
        return <Flame size={18} className="text-orange-500 animate-pulse" />;
      case 'mentor':
        return <Mic size={18} className="text-purple-400" />;
      default:
        return <Bell size={18} className="text-[#FF7A30]" />;
    }
  };

  const getCategoryBadge = (category: NotificationCategory) => {
    switch (category) {
      case 'biology':
        return { label: 'Biology Boost', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'bengali':
        return { label: 'বাংলা এ', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'english':
        return { label: 'English B', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' };
      case 'study_streak':
        return { label: 'Study Streak', color: 'bg-orange-500/15 text-orange-300 border-orange-500/30' };
      case 'mentor':
        return { label: 'AI Voice Mentor', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'WBCHSE Sem 3', color: 'bg-[#FF7A30]/15 text-[#FF7A30] border-[#FF7A30]/30' };
    }
  };

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] pointer-events-none max-w-sm sm:max-w-md w-full px-3 sm:px-0">
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            key={activeNotification.id}
            initial={{ opacity: 0, y: -25, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="pointer-events-auto relative overflow-hidden rounded-2xl bg-[#141210]/95 backdrop-blur-2xl border border-orange-500/30 shadow-[0_20px_50px_rgba(239,109,47,0.28)] p-4 sm:p-5 text-white"
          >
            {/* Top ambient glow */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />
            
            <div className="flex items-start gap-3.5">
              {/* Category Icon with glow */}
              <div className="relative shrink-0 p-2.5 rounded-xl bg-white/[0.06] border border-white/10 shadow-inner">
                {getCategoryIcon(activeNotification.category)}
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-[#141210]" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${getCategoryBadge(activeNotification.category).color}`}>
                    {getCategoryBadge(activeNotification.category).label}
                  </span>
                  <span className="text-[10px] text-zinc-400">এখনই</span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                  {activeNotification.title}
                </h4>

                <p className="text-xs text-zinc-300 mt-1 leading-relaxed line-clamp-3">
                  {activeNotification.body}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 mt-3 pt-2 border-t border-white/[0.08]">
                  <button
                    onClick={handleAction}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF7A30] to-[#EF6D2F] hover:from-[#FF8A45] hover:to-[#F4783B] text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    <span>{activeNotification.actionLabel || 'ওপেন করো'}</span>
                    <ExternalLink size={12} />
                  </button>

                  <button
                    onClick={() => setActiveNotification(null)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
                  >
                    পরে
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveNotification(null)}
                aria-label="Dismiss notification"
                className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Bottom animated progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
