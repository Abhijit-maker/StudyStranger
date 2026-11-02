import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellRing, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Clock, 
  Sparkles, 
  Dna, 
  BookOpen, 
  Flame, 
  Trash2, 
  ExternalLink,
  Send,
  Vibrate
} from 'lucide-react';
import { 
  notificationService, 
  StudyNotification, 
  NotificationSettings, 
  NotificationCategory,
  playNotificationChime
} from '../services/notificationService';
import { AndroidPermissionService } from '../services/androidPermissionService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick?: (notification: StudyNotification) => void;
  onOpenPhonePermissions?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onActionClick,
  onOpenPhonePermissions
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [history, setHistory] = useState<StudyNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermission(notificationService.getPermissionStatus());
      setSettings(notificationService.getSettings());
      setHistory(notificationService.getHistory());
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    setStatusMessage('অনুরোধ গ্রহণ করা হচ্ছে...');
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermissionStatus());
    if (granted) {
      setStatusMessage('অভিনন্দন! নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে।');
    } else {
      setStatusMessage('অনুমতি পাওয়া যায়নি। ব্রাউজার বা PWA সেটিংসে চেক করুন।');
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setStatusMessage('প্রিমিয়াম টেস্ট নোটিফিকেশন পাঠানো হচ্ছে...');
    
    await notificationService.sendNotification({
      title: '🌟 Study Stranger Premium Alert',
      body: 'হ্যালো শিক্ষার্থী! তোমার নোটিফিকেশন সিস্টেম সম্পূর্ণ সক্রিয় এবং প্রিমিয়াম সাউন্ড ও ডিসপ্লে সহ কাজ করছে।',
      category: 'general',
      actionUrl: '/?action=mock_test',
      actionLabel: 'টেস্ট যাচাই',
      priority: 'high',
      tag: 'test-notification'
    });

    setHistory(notificationService.getHistory());
    setIsSendingTest(false);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSendBooster = async () => {
    setIsSendingTest(true);
    await notificationService.sendRandomBooster();
    setHistory(notificationService.getHistory());
    setIsSendingTest(false);
    setStatusMessage('নতুন WBCHSE সিলেবাস বুস্টার পাঠানো হয়েছে!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleToggleSound = () => {
    const next = !settings.sound;
    const updated = { ...settings, sound: next };
    setSettings(updated);
    notificationService.saveSettings(updated);
    if (next) playNotificationChime();
  };

  const handleToggleVibration = () => {
    const next = !settings.vibration;
    const updated = { ...settings, vibration: next };
    setSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleFrequencyChange = (mins: number) => {
    const updated = { ...settings, frequencyMinutes: mins };
    setSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setHistory(notificationService.getHistory());
  };

  const handleClearHistory = () => {
    notificationService.clearHistory();
    setHistory([]);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'biology':
        return <Dna size={16} className="text-emerald-500" />;
      case 'bengali':
        return <BookOpen size={16} className="text-amber-500" />;
      case 'english':
        return <Sparkles size={16} className="text-sky-500" />;
      case 'study_streak':
        return <Flame size={16} className="text-orange-500" />;
      default:
        return <Bell size={16} className="text-orange-500" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'এইমাত্র';
    if (mins < 60) return `${mins} মিনিট আগে`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    return new Date(timestamp).toLocaleDateString('bn-IN');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-stone-900/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-stone-800 dark:text-stone-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <BellRing size={24} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
                Notifications
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                  Premium
                </span>
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                Real-time study reminders & syllabus boosters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Toast Message */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-orange-500/10 border-b border-orange-500/20 px-6 py-2.5 text-xs text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-2"
            >
              <Sparkles size={14} className="text-orange-500" />
              {statusMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {activeTab === 'feed' ? (
            history.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                  <Bell size={40} />
                </div>
                <h4 className="text-lg font-black text-stone-900 dark:text-white">No notifications yet</h4>
                <p className="text-stone-500 dark:text-stone-400 max-w-xs text-sm">You'll receive alerts for mock tests, syllabus boosters, and study reminders here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all ${item.read ? "bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 opacity-60" : "bg-orange-50/50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-500/20 shadow-sm"}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-stone-900 dark:text-white text-sm">{item.title}</h4>
                          <span className="text-[10px] text-stone-400 font-bold uppercase">{formatTimeAgo(item.timestamp)}</span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-6">
              {/* Settings content here... */}
              <p className="text-stone-500 text-sm">Notification settings are optimized for your WBCHSE Semester 3 goals.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className={`w-3 h-3 rounded-full ${permission === 'granted' ? "bg-emerald-500" : "bg-orange-500"} animate-pulse`} />
             <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
               Status: {permission === 'granted' ? "Active" : "Setup Required"}
             </span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-black text-xs uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
