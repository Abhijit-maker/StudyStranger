import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User as UserIcon,
  Camera,
  Upload,
  Check,
  Sparkles,
  BookOpen,
  GraduationCap,
  Target,
  Clock,
  Phone,
  FileText,
  LogOut,
  Palette,
  ShieldCheck,
  Flame,
  Coins,
  Award,
  AlertCircle
} from 'lucide-react';
import { nativeService } from '../services/nativeService';
import { EducationProfileCard } from './EducationProfileCard';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSaveProfile: (updatedData: {
    displayName: string;
    photoURL: string;
    school?: string;
    stream?: string;
    board?: string;
    targetAim?: string;
    bio?: string;
    dailyHours?: number;
    phone?: string;
  }) => Promise<void> | void;
  onLogout?: () => void;
  onOpenThemes?: () => void;
}

// Preset avatars for students to choose from
const AVATAR_PRESETS = [
  { id: "avatar-1", label: "Science Scholar", url: "https://api.dicebear.com/7.x/bottts/svg?seed=AbhijitScience&backgroundColor=ffdfbf" },
  { id: "avatar-2", label: "Biology Pro", url: "https://api.dicebear.com/7.x/bottts/svg?seed=WBCHSEBio&backgroundColor=c0aede" },
  { id: "avatar-3", label: "Tech Genius", url: "https://api.dicebear.com/7.x/bottts/svg?seed=StrangerTech&backgroundColor=b6e3f4" },
  { id: "avatar-4", label: "Exam Achiever", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Sem3Topper&backgroundColor=d1d4f9" },
  { id: "avatar-5", label: "Bookworm", url: "https://api.dicebear.com/7.x/bottts/svg?seed=BengaliLiterature&backgroundColor=ffd5dc" },
  { id: "avatar-6", label: "Zen Scholar", url: "https://api.dicebear.com/7.x/bottts/svg?seed=ZenStudent&backgroundColor=ffdfbf" },
  { id: "avatar-7", label: "Math Wizard", url: "https://api.dicebear.com/7.x/bottts/svg?seed=MathSolver&backgroundColor=c0aede" },
  { id: "avatar-8", label: "Cyber Master", url: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberStranger&backgroundColor=b6e3f4" },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  onLogout,
  onOpenThemes
}) => {
  const [displayName, setDisplayName] = useState(user?.displayName || "Abhijit");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [school, setSchool] = useState(user?.school || "West Bengal Higher Secondary School");
  const [stream, setStream] = useState(user?.stream || "Science (বিজ্ঞান বিভাগ)");
  const [board, setBoard] = useState(user?.board || "WBCHSE Class 12 - Semester 3");
  const [targetAim, setTargetAim] = useState(user?.targetAim || "WBCHSE 95%+ & Higher Education");
  const [bio, setBio] = useState(user?.bio || "Class 12 Semester 3 পরীক্ষার্থী। জীববিদ্যা, বাংলা ও ইংরেজি বিষয়গুলো ভালোবেসে প্রস্তুত হচ্ছি। লক্ষ্য উচ্চতর ফলাফল।");
  const [dailyHours, setDailyHours] = useState<number>(user?.dailyHours || 6);
  const [phone, setPhone] = useState(user?.phone || "");
  const [activeTab, setActiveTab] = useState<"basic" | "education" | "bio" | "target">("education");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle custom image upload and convert to base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      nativeService.showToast("⚠️ ছবির সাইজ ২ MB এর নিচে হওয়া প্রয়োজন!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoURL(reader.result);
        setShowAvatarPicker(false);
        nativeService.showToast("📸 নতুন প্রোফাইল ছবি যুক্ত হয়েছে!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      nativeService.showToast("অনুগ্রহ করে আপনার নাম লিখুন");
      return;
    }

    setIsSaving(true);
    try {
      await onSaveProfile({
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
        school: school.trim(),
        stream: stream.trim(),
        board: board.trim(),
        targetAim: targetAim.trim(),
        bio: bio.trim(),
        dailyHours,
        phone: phone.trim()
      });
      nativeService.triggerHaptic('success');
      nativeService.showToast("✅ প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
      onClose();
    } catch (err) {
      console.error("Profile save error:", err);
      nativeService.showToast("সংরক্ষণ করতে সমস্যা হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      id="user-profile-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-2.5 sm:p-4 bg-black/40 backdrop-blur-md select-none"
      onClick={onClose}
    >
      <motion.div
        id="user-profile-modal"
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 26, stiffness: 360 }}
        className="w-full max-w-2xl stranger-modal p-3.5 sm:p-6 text-stone-800 dark:text-stone-100 max-h-[88dvh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 dark:border-stone-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <UserIcon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight text-stone-900 dark:text-white">
                    শিক্ষার্থী প্রোফাইল (Student Profile)
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    WBCHSE
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  নিজের নাম, ছবি, বিবরণ এবং পড়ার লক্ষ্য সেট করুন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenThemes && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenThemes();
                  }}
                  className="stranger-btn-secondary p-2 flex items-center gap-1.5 text-xs"
                  title="ডিজাইন ও থিম পরিবর্তন করুন"
                >
                  <Palette size={15} className="text-orange-500" />
                  <span className="hidden sm:inline">থিম</span>
                </button>
              )}

              <button
                id="close-profile-modal-btn"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors flex items-center justify-center cursor-pointer border border-stone-200 dark:border-stone-700"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Profile Hero Section */}
          <div className="mt-4 p-4 rounded-3xl bg-stone-50/50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-4 shrink-0 shadow-sm backdrop-blur-xl">
            {/* Avatar & Edit Overlay */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-orange-500 bg-stone-100 dark:bg-stone-800 shadow-sm relative p-0.5">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt={displayName} 
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500/10 to-sky-500/10 flex items-center justify-center text-2xl font-black text-stone-850 dark:text-stone-100">
                    {displayName ? displayName.charAt(0).toUpperCase() : "A"}
                  </div>
                )}
                
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity rounded-xl cursor-pointer"
                  title="ছবি বা অবতার পরিবর্তন করুন"
                >
                  <Camera size={18} />
                  <span className="text-[9px] font-bold mt-1">বদলান</span>
                </button>
              </div>

              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-orange-500 text-white shadow-md hover:scale-110 transition-transform cursor-pointer"
                title="ছবি বা অবতার বেছে নিন"
              >
                <Camera size={12} />
              </button>
            </div>

            {/* Student Quick Bio & Stats */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                  {displayName || "Abhijit"}
                </h4>
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  {board}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                {school}
              </p>
              
              {/* Badges / Metrics bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] text-stone-600 dark:text-stone-400">
                <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-500">
                  <Coins size={13} /> {user?.points || 0} PTS
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="flex items-center gap-1 font-bold text-rose-500 dark:text-rose-400">
                  <Flame size={13} /> {user?.streak || 12} দিন স্ট্রিক
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="flex items-center gap-1 font-bold text-orange-500 dark:text-orange-400">
                  <Target size={13} /> {dailyHours} ঘন্টা/দিন লক্ষ্য
                </span>
              </div>
            </div>

            {/* Quick Change Avatar / Upload Buttons */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="stranger-btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-[11px]"
              >
                <Sparkles size={13} className="text-orange-500" />
                <span>অবতার পিক</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload size={13} />
                <span>ছবি আপলোড</span>
              </button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageFileChange} 
              />
            </div>
          </div>

          {/* Avatar Selector Dropdown Tray */}
          {showAvatarPicker && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 p-3.5 rounded-3xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800 space-y-2.5 shrink-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-orange-500" /> সুন্দর শিক্ষার্থী অবতার বেছে নিন:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  বন্ধ করুন
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_PRESETS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setPhotoURL(av.url);
                      setShowAvatarPicker(false);
                      nativeService.triggerHaptic('success');
                      nativeService.showToast(`অবতার নির্বাচিত: ${av.label}`);
                    }}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      photoURL === av.url
                        ? "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20"
                        : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-orange-500/50"
                    }`}
                    title={av.label}
                  >
                    <img src={av.url} alt={av.label} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="text-[8px] text-stone-500 dark:text-stone-400 font-bold truncate max-w-[48px]">
                      {av.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-3 pb-2 border-b border-stone-100 dark:border-stone-800 shrink-0 overflow-x-auto scrollbar-hide py-1">
            {[
              { id: "education", label: "শিক্ষা ও বোর্ড (Education)", icon: GraduationCap },
              { id: "basic", label: "মৌলিক তথ্য", icon: UserIcon },
              { id: "bio", label: "নিজের সম্পর্কে", icon: FileText },
              { id: "target", label: "টার্গেট ও অভ্যাস", icon: Target },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    isActive
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 bg-stone-50/20 dark:bg-stone-900/10">
            {activeTab === "education" && (
              <div className="space-y-4">
                <EducationProfileCard userId={user?.uid} />
              </div>
            )}

            {activeTab === "basic" && (
              <div className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <UserIcon size={13} className="text-orange-500" /> আপনার পূর্ণ নাম (Full Name):
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="যেমন: অভিজিৎ মণ্ডল"
                    className="stranger-input w-full"
                  />
                </div>

                {/* School / College */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-orange-500" /> স্কুল / কলেজের নাম (School / Institute):
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="যেমন: হিন্দু স্কুল / কলকাতা মডেল একাডেমি"
                    className="stranger-input w-full"
                  />
                </div>

                {/* Grid for Board & Stream */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <BookOpen size={13} className="text-orange-500" /> বোর্ড ও ক্লাস (Board & Class):
                    </label>
                    <input
                      type="text"
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      placeholder="WBCHSE Class 12 - Semester 3"
                      className="stranger-input w-full"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-orange-500" /> বিভাগ (Stream):
                    </label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value)}
                      className="stranger-input w-full"
                    >
                      <option value="Science (বিজ্ঞান বিভাগ)">Science (বিজ্ঞান বিভাগ - Biology, Chem, Phys)</option>
                      <option value="Arts / Humanities (কলা বিভাগ)">Arts / Humanities (কলা বিভাগ - History, Pol Science)</option>
                      <option value="Commerce (বাণিজ্য বিভাগ)">Commerce (বাণিজ্য বিভাগ - Accountancy, BST)</option>
                      <option value="General Academic">General Academic</option>
                    </select>
                  </div>
                </div>

                {/* Phone / Contact */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Phone size={13} className="text-emerald-500" /> ফোন নম্বর বা স্টুডেন্ট আইডি (Phone / Roll ID):
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="stranger-input w-full"
                  />
                  <p className="text-[10px] text-stone-400 dark:text-stone-500">
                    * অ্যান্ড্রয়েড সরাসরি কলিং ও ডায়ালারে ব্যবহারের জন্য সুবিধাজনক।
                  </p>
                </div>
              </div>
            )}

            {activeTab === "bio" && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <FileText size={13} className="text-orange-500" /> নিজের সম্পর্কে কিছু লিখুন (About You / Bio):
                    </label>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                      {bio.length}/300 বর্ণ
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={bio}
                    maxLength={300}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="আপনার পছন্দের বিষয়, পড়ার ধরন, স্বপ্ন এবং নিজের ব্যাপারে কিছু লিখুন..."
                    className="stranger-input w-full resize-none leading-relaxed"
                  />
                </div>

                {/* Suggestions Pills */}
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800 space-y-2">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">
                    💡 বায়োアイデア (ক্লিক করে যুক্ত করুন):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "WBCHSE Class 12 Sem 3 পরীক্ষার্থী 🎯",
                      "জীববিদ্যা ও জেনেটিক্স আমার প্রিয় বিষয় 🧬",
                      "দৈনিক ৬ ঘন্টা ফোকাস স্টাডি আমার লক্ষ্য ⏱️",
                      "উচ্ছে মাধ্যমিকে ৯৫%+ স্কোর অর্জন করতে চাই 🏆",
                      "The Bet & Adarini গল্পের রিভিশন সম্পূর্ণ করব 📖"
                    ].map((snippet, idx) => (
                      <button
                        key={`bio-snippet-${idx}`}
                        type="button"
                        onClick={() => {
                          setBio((prev: string) => prev ? `${prev} ${snippet}` : snippet);
                          nativeService.triggerHaptic('success');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-orange-500 text-[10px] text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                      >
                        + {snippet}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "target" && (
              <div className="space-y-4">
                {/* Target Aim */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Target size={13} className="text-orange-500" /> আপনার চূড়ান্ত পরীক্ষার লক্ষ্য (Exam Target & Aim):
                  </label>
                  <input
                    type="text"
                    value={targetAim}
                    onChange={(e) => setTargetAim(e.target.value)}
                    placeholder="WBCHSE 95%+ & Medical / Engineering Entrance"
                    className="stranger-input w-full"
                  />
                </div>

                {/* Daily Study Hours */}
                <div className="space-y-2 p-4 rounded-3xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-500" /> প্রতিদিনের স্টাডি লক্ষ্য (Daily Study Hours):
                    </label>
                    <span className="text-base font-black text-orange-500 font-mono">
                      {dailyHours} ঘন্টা/দিন
                    </span>
                  </div>

                  <input
                    type="range"
                    min={2}
                    max={14}
                    step={1}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                    <span>২ ঘন্টা</span>
                    <span>৬ ঘন্টা (আদর্শ)</span>
                    <span>১০ ঘন্টা</span>
                    <span>১৪ ঘন্টা (ম্যারাথন)</span>
                  </div>
                </div>

                {/* Study Streak & Motivation card */}
                <div className="p-4 rounded-3xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                    <Award size={22} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-stone-900 dark:text-white">
                      WBCHSE Semester 3 বিশেষ প্রস্তুতি
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      আপনার প্রোফাইল তথ্যের ভিত্তিতে স্টাডি বুস্টার ও এআই মেন্টর কাস্টমাইজড প্রশ্ন প্রস্তুত করবে।
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
            {onLogout ? (
              <div>
                {!showLogoutConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="stranger-btn-secondary px-3.5 py-2 flex items-center gap-1.5 text-xs"
                  >
                    <LogOut size={14} />
                    <span>লগআউট (Logout)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 animate-fade-in">
                    <span className="text-xs text-rose-500 font-bold">লগআউট নিশ্চিত?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer hover:bg-rose-500"
                    >
                      হ্যাঁ
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold cursor-pointer hover:bg-stone-300 dark:hover:bg-stone-600"
                    >
                      না
                    </button>
                  </div>
                )}
              </div>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="stranger-btn-secondary px-4 py-2 text-xs"
              >
                বাতিল (Cancel)
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="stranger-btn-primary px-6 py-2.5 flex items-center gap-1.5 text-xs disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>প্রোফাইল সেভ করুন (Save)</span>
                  </>
                )}
              </button>
            </div>
          </div>
      </motion.div>
    </motion.div>
  );
};
