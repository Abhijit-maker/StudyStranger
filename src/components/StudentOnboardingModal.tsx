import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  BookOpen,
  Target,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Compass,
  Award,
  ShieldCheck,
  Building,
  Check,
  Key,
  X,
  Zap,
  Globe
} from "lucide-react";
import { BoardId, ClassLevel, StreamType, MediumType } from "../types/education";
import { educationProfileService } from "../services/educationProfileService";
import { db, doc, setDoc } from "../firebase";

interface StudentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  currentProfile?: any;
  onProfileCompleted: (updatedProfile: any) => void;
}

const CLASS_OPTIONS: { level: ClassLevel; label: string; sub: string; badge?: string }[] = [
  { level: 12, label: "Class 12 (দ্বাদশ শ্রেণী)", sub: "WBCHSE Semester 3 & 4 Finals", badge: "Recommended" },
  { level: 11, label: "Class 11 (একাদশ শ্রেণী)", sub: "Higher Secondary Foundation Semester" },
  { level: 10, label: "Class 10 (দশম শ্রেণী)", sub: "Madhyamik / Secondary Board Exam Prep" },
];

const BOARD_OPTIONS: { id: BoardId; label: string; sub: string }[] = [
  { id: "WBCHSE", label: "WBCHSE (উচ্চ মাধ্যমিক)", sub: "West Bengal Council of Higher Secondary Education" },
  { id: "WBBSE", label: "WBBSE (মাধ্যমিক)", sub: "West Bengal Board of Secondary Education" },
  { id: "CBSE", label: "CBSE", sub: "Central Board of Secondary Education" },
  { id: "ICSE_ISC", label: "CISCE / ISC", sub: "Council for the Indian School Certificate Examinations" },
];

const STREAM_OPTIONS: { id: StreamType; label: string; sub: string; icon: string }[] = [
  { id: "science", label: "Science (বিজ্ঞান বিভাগ)", sub: "Biology, Physics, Chemistry, Mathematics", icon: "🧬" },
  { id: "arts", label: "Arts / Humanities (কলা বিভাগ)", sub: "History, Political Science, Geography, Bengali", icon: "🎨" },
  { id: "commerce", label: "Commerce (বাণিজ্য বিভাগ)", sub: "Accountancy, Business Studies, Economics", icon: "📊" },
];

const MEDIUM_OPTIONS: { id: MediumType; label: string }[] = [
  { id: "bengali", label: "বাংলা (Bengali Medium)" },
  { id: "english", label: "English Medium" },
  { id: "hindi", label: "हिंदी (Hindi Medium)" },
];

const SUBJECT_OPTIONS = [
  { id: "hs-biology", name: "Biology (জীববিদ্যা)", icon: "🧬", defaultFor: "science" },
  { id: "hs-bengali-a", name: "Bengali A (বাংলা এ)", icon: "📖", defaultFor: "all" },
  { id: "hs-english-b", name: "English B (ইংরেজি বি)", icon: "✍️", defaultFor: "all" },
  { id: "hs-physics", name: "Physics (পদার্থবিদ্যা)", icon: "⚡", defaultFor: "science" },
  { id: "hs-chemistry", name: "Chemistry (রসায়ন)", icon: "🧪", defaultFor: "science" },
  { id: "hs-math", name: "Mathematics (গণিত)", icon: "📐", defaultFor: "science" },
  { id: "hs-history", name: "History (ইতিহাস)", icon: "🏛️", defaultFor: "arts" },
  { id: "hs-geography", name: "Geography (ভূগোল)", icon: "🌍", defaultFor: "arts" },
  { id: "hs-polscience", name: "Political Science (রাষ্ট্রবিজ্ঞান)", icon: "⚖️", defaultFor: "arts" },
  { id: "hs-accountancy", name: "Accountancy (হিসাবশাস্ত্র)", icon: "📈", defaultFor: "commerce" },
  { id: "hs-economics", name: "Economics (অর্থনীতি)", icon: "💰", defaultFor: "commerce" },
];

const TARGET_EXAM_PRESETS = [
  "WBCHSE Semester 3 & 4 Finals (উচ্চ মাধ্যমিক)",
  "WBCHSE Board Topper (95%+ Target)",
  "NEET 2026 / Medical Entrance Prep",
  "JEE Main & WBJEE Engineering",
  "Madhyamik 2025-26 Board Examination",
];

const DAILY_HOUR_OPTIONS = [
  { hours: 2, label: "2 Hours / Day", sub: "Casual Doubt Solving" },
  { hours: 4, label: "4 Hours / Day", sub: "Balanced Exam Prep" },
  { hours: 6, label: "6 Hours / Day", sub: "Intensive Board Mastery" },
  { hours: 8, label: "8+ Hours / Day", sub: "Top Rank Aspirant" },
];

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName = "Student",
  currentProfile,
  onProfileCompleted
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  const [studentName, setStudentName] = useState<string>(
    currentProfile?.displayName || userName || "Abhijit"
  );
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(currentProfile?.classLevel || 12);
  const [selectedBoard, setSelectedBoard] = useState<BoardId>(currentProfile?.board || "WBCHSE");
  const [selectedStream, setSelectedStream] = useState<StreamType>(currentProfile?.stream || "science");
  const [selectedMedium, setSelectedMedium] = useState<MediumType>(currentProfile?.medium || "bengali");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    currentProfile?.selectedSubjects || ["hs-biology", "hs-bengali-a", "hs-english-b", "hs-physics", "hs-chemistry", "hs-math"]
  );
  const [targetExam, setTargetExam] = useState<string>(
    currentProfile?.targetExam || "WBCHSE Semester 3 & 4 Finals (উচ্চ মাধ্যমিক)"
  );
  const [targetScore, setTargetScore] = useState<number>(currentProfile?.targetScorePercent || 95);
  const [dailyHours, setDailyHours] = useState<number>(
    currentProfile?.dailyStudyGoalMinutes ? Math.round(currentProfile.dailyStudyGoalMinutes / 60) : 6
  );
  const [schoolName, setSchoolName] = useState<string>(currentProfile?.school || "");
  const [district, setDistrict] = useState<string>(currentProfile?.district || "Kolkata, West Bengal");
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState<string>(
    currentProfile?.geminiApiKey || localStorage.getItem("gemini_api_key") || ""
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(s => s !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const cleanKey = geminiApiKeyInput.trim();
      const updatedData: any = {
        displayName: studentName.trim() || userName || "Student",
        classLevel: selectedClass,
        className: `Class ${selectedClass}`,
        board: selectedBoard,
        stream: (selectedClass === 11 || selectedClass === 12) ? selectedStream : undefined,
        medium: selectedMedium,
        selectedSubjects,
        targetExam,
        targetScorePercent: targetScore,
        dailyStudyGoalMinutes: dailyHours * 60,
        dailyHours,
        school: schoolName.trim() || "West Bengal Secondary School",
        district: district.trim() || "West Bengal",
        hasCompletedOnboarding: true,
        lastProfileUpdate: new Date().toISOString()
      };

      if (cleanKey) {
        updatedData.geminiApiKey = cleanKey;
        localStorage.setItem("gemini_api_key", cleanKey);
      }

      // 1. Save in EducationProfileService
      educationProfileService.saveProfile(updatedData, userId);

      // 2. Save in Firestore if user is logged in
      if (userId && userId !== "default") {
        try {
          await setDoc(doc(db, "users", userId), {
            educationProfile: updatedData,
            ...updatedData
          }, { merge: true });
        } catch (dbErr) {
          console.warn("Firestore onboarding save warning:", dbErr);
        }
      }

      // 3. Mark in localStorage
      if (userId) {
        localStorage.setItem(`onboarded_${userId}`, "true");
      }
      localStorage.setItem("study_stranger_onboarding_done", "true");

      onProfileCompleted(updatedData);
      onClose();
    } catch (err) {
      console.error("Onboarding error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[140] flex items-center justify-center p-3.5 sm:p-5 bg-slate-900/40 backdrop-blur-md select-none"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="stranger-modal w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Clean Light Header */}
          <div className="p-6 border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900/50 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20 flex items-center justify-center text-white">
                <GraduationCap size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-stone-900 dark:text-white tracking-tight">
                    Profile Setup
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                    Step {step}/{totalSteps}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  Personalize your WBCHSE Class 12 AI Mentor
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors flex items-center justify-center cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 flex">
            <div 
              className="bg-orange-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(255,122,48,0.5)]"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8 bg-stone-50/30 dark:bg-stone-900/20">
            {/* STEP 1: NAME, CLASS & BOARD */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <Sparkles size={14} className="text-orange-500" />
                    তোমার নাম / ডাকনাম (Full Name)
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Abhijit (অভিজিৎ)"
                    className="stranger-input w-full text-base font-black"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <Compass size={16} className="text-orange-500" />
                    কোন ক্লাসে পড়ো? (Select Class)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {CLASS_OPTIONS.map((c) => {
                      const isSelected = selectedClass === c.level;
                      return (
                        <button
                          key={c.level}
                          type="button"
                          onClick={() => setSelectedClass(c.level)}
                          className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between text-left group ${
                            isSelected
                              ? "bg-orange-500 text-white border-orange-400 shadow-xl shadow-orange-500/20 scale-[1.02]"
                              : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-orange-500/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className={`text-2xl font-black font-mono ${isSelected ? "text-white" : "text-stone-300 dark:text-stone-600"}`}>
                              #{c.level}
                            </span>
                            {isSelected && <CheckCircle2 size={20} className="text-white" />}
                          </div>
                          <div>
                            <h5 className="text-sm font-black">{c.label}</h5>
                            <p className={`text-[10px] mt-1 font-bold ${isSelected ? "text-white/80" : "text-stone-400"}`}>{c.sub}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <Building size={16} className="text-orange-500" />
                    শিক্ষা বোর্ড (Education Board)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BOARD_OPTIONS.map((b) => {
                      const isSelected = selectedBoard === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBoard(b.id)}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 text-left ${
                            isSelected
                              ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 font-black shadow-inner"
                              : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-black block">{b.label}</span>
                            <span className="text-[10px] text-stone-400 block mt-0.5 font-medium">{b.sub}</span>
                          </div>
                          {isSelected && <Check size={18} className="text-orange-500 shrink-0" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: STREAM & MEDIUM */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                {(selectedClass === 11 || selectedClass === 12) && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={16} className="text-orange-500" />
                      তোমার বিভাগ (Study Stream)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {STREAM_OPTIONS.map((s) => {
                        const isSelected = selectedStream === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedStream(s.id)}
                            className={`p-6 rounded-[32px] border transition-all duration-300 flex flex-col items-center text-center gap-4 group ${
                              isSelected
                                ? "bg-orange-500 text-white border-orange-400 shadow-xl shadow-orange-500/20 scale-[1.02]"
                                : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-orange-500/30"
                            }`}
                          >
                            <span className="text-4xl group-hover:scale-110 transition-transform">{s.icon}</span>
                            <div>
                              <h5 className="text-sm font-black">{s.label}</h5>
                              <p className={`text-[9px] mt-1 font-bold ${isSelected ? "text-white/80" : "text-stone-400"}`}>{s.sub}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={16} className="text-orange-500" />
                    পঠনপাঠনের ভাষা (Medium)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {MEDIUM_OPTIONS.map((m) => {
                      const isSelected = selectedMedium === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMedium(m.id)}
                          className={`p-4 rounded-2xl border transition-all text-sm font-black ${
                            isSelected
                              ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 shadow-inner"
                              : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5 stranger-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">WBCHSE Semester 3 Focused</h5>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                      সিলেবাস অনুযায়ী জীববিদ্যা (Reproduction), বাংলা এ (আদিরিনী, ধর্ম, ভাষা) এবং ইংরেজি বি (Strong Roots, The Bet) সম্পূর্ণ আপডেট রয়েছে।
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SUBJECTS SELECTION */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <Target size={16} className="text-orange-500" />
                    যে বিষয়গুলো প্রস্তুত করতে চাও (Subjects)
                  </h4>
                  <p className="text-xs text-stone-500 font-medium italic">এআই মেন্টর এই বিষয়গুলির উপর MCQ টেস্ট ও ডাউট ক্লিয়ারিং করাবে</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUBJECT_OPTIONS.map((subj) => {
                    const isSelected = selectedSubjects.includes(subj.id);
                    return (
                      <button
                        key={subj.id}
                        type="button"
                        onClick={() => toggleSubject(subj.id)}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
                          isSelected
                            ? "bg-orange-500/10 border-orange-500 text-stone-900 dark:text-white font-black shadow-inner"
                            : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-orange-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{subj.icon}</span>
                          <span className="text-xs font-black">{subj.name}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-all ${
                          isSelected ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30" : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                        }`}>
                          {isSelected && <Check size={14} strokeWidth={4} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: TARGETS & API KEY */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <Award size={16} className="text-orange-500" />
                    টার্গেট পরীক্ষা ও লক্ষ্য (Target Aim)
                  </h4>
                  <div className="space-y-2">
                    {TARGET_EXAM_PRESETS.map((exam) => (
                      <button
                        key={exam}
                        type="button"
                        onClick={() => setTargetExam(exam)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-center justify-between group ${
                          targetExam === exam
                            ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 font-black shadow-inner"
                            : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700"
                        }`}
                      >
                        <span className="font-bold">{exam}</span>
                        {targetExam === exam && <Check size={16} className="text-orange-500" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Study Target */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={16} className="text-orange-500" />
                    প্রতিদিনের পড়াশোনার সময় (Study Target)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DAILY_HOUR_OPTIONS.map((h) => (
                      <button
                        key={h.hours}
                        type="button"
                        onClick={() => setDailyHours(h.hours)}
                        className={`p-3 rounded-2xl border transition-all text-center group ${
                          dailyHours === h.hours
                            ? "bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20 scale-[1.05]"
                            : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-orange-500/30"
                        }`}
                      >
                        <span className="text-xs font-black block">{h.label}</span>
                        <span className={`text-[8px] mt-1 block font-bold ${dailyHours === h.hours ? "text-white/70" : "text-stone-400"}`}>{h.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">School Name</label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Hindu School"
                      className="stranger-input w-full text-xs font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">District / City</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Kolkata"
                      className="stranger-input w-full text-xs font-black"
                    />
                  </div>
                </div>

                {/* Gemini API Key */}
                <div className="p-6 stranger-card bg-orange-500/5 border-orange-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                      <Key size={16} />
                      Gemini API Key (Optional)
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase border border-emerald-500/20">
                      100% Free
                    </span>
                  </div>
                  <input
                    type="password"
                    value={geminiApiKeyInput}
                    onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                    placeholder="AIzaSy... (Unlocks Pro Features)"
                    className="stranger-input w-full text-xs font-mono tracking-wider"
                  />
                  <p className="text-[9px] text-stone-400 font-bold italic leading-relaxed">
                    Unlocks unlimited real-time voice discussions, math solver, and high-speed mock test generation.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="stranger-btn-secondary px-6 py-3 text-xs uppercase tracking-widest flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-[10px] font-black text-stone-400 hover:text-stone-900 dark:hover:text-white uppercase tracking-widest transition-colors mr-2 cursor-pointer"
              >
                Skip
              </button>

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev + 1)}
                  className="stranger-btn-primary px-8 py-3.5 text-xs uppercase tracking-widest flex items-center gap-2 shadow-orange-500/30"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="stranger-btn-primary px-10 py-3.5 text-xs uppercase tracking-[0.2em] shadow-emerald-500/20 bg-emerald-600 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Syncing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check size={18} strokeWidth={4} />
                      Complete Sync
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
