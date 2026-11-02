import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Check, 
  ChevronDown, 
  Globe, 
  Languages, 
  Atom, 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  Sliders,
  X,
  Target,
  Clock,
  ShieldCheck,
  Award
} from 'lucide-react';
import { EducationProfile, BoardId, ClassLevel, StreamType, MediumType, Subject } from '../types/education';
import { INDIAN_BOARDS, MEDIUMS, STREAMS, getSubjectsForProfile } from '../data/educationData';
import { educationProfileService } from '../services/educationProfileService';
import { nativeService } from '../services/nativeService';

interface EducationProfileCardProps {
  userId?: string;
  onProfileChanged?: (profile: EducationProfile) => void;
  compact?: boolean;
  className?: string;
}

export const EducationProfileCard: React.FC<EducationProfileCardProps> = ({
  userId,
  onProfileChanged,
  compact = false,
  className = ''
}) => {
  const [profile, setProfile] = useState<EducationProfile>(() => educationProfileService.getProfile(userId));
  const [isEditing, setIsEditing] = useState(false);
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form draft state
  const [selectedBoard, setSelectedBoard] = useState<BoardId>(profile.board);
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(profile.classLevel);
  const [selectedStream, setSelectedStream] = useState<StreamType | undefined>(profile.stream);
  const [selectedMedium, setSelectedMedium] = useState<MediumType>(profile.medium);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(profile.selectedSubjects);
  const [targetAim, setTargetAim] = useState(profile.targetExam || '');
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyStudyGoalMinutes || 120);

  useEffect(() => {
    const unsub = educationProfileService.subscribe((updated) => {
      setProfile(updated);
      setSelectedBoard(updated.board);
      setSelectedClass(updated.classLevel);
      setSelectedStream(updated.stream);
      setSelectedMedium(updated.medium);
      setSelectedSubjects(updated.selectedSubjects);
      setTargetAim(updated.targetExam || '');
      setDailyMinutes(updated.dailyStudyGoalMinutes || 120);
    });
    return () => unsub();
  }, []);

  // When class changes, apply the STREAM RULE!
  const handleClassChange = (newClass: ClassLevel) => {
    setSelectedClass(newClass);
    // STRICT RULE: Stream only for Class 11 and 12
    if (newClass === 11 || newClass === 12) {
      if (!selectedStream) {
        setSelectedStream('science');
      }
    } else {
      setSelectedStream(undefined); // NEVER for Class 1-10
    }

    // Refresh subjects for new class
    const newStream = (newClass === 11 || newClass === 12) ? (selectedStream || 'science') : undefined;
    const available = getSubjectsForProfile(selectedBoard, newClass, newStream);
    setSelectedSubjects(available.map(s => s.id));
  };

  const handleStreamChange = (newStream: StreamType) => {
    // Only allow if Class 11 or 12
    if (selectedClass === 11 || selectedClass === 12) {
      setSelectedStream(newStream);
      const available = getSubjectsForProfile(selectedBoard, selectedClass, newStream);
      setSelectedSubjects(available.map(s => s.id));
    }
  };

  const handleBoardChange = (newBoard: BoardId) => {
    setSelectedBoard(newBoard);
    const available = getSubjectsForProfile(newBoard, selectedClass, selectedStream);
    setSelectedSubjects(available.map(s => s.id));
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        if (prev.length <= 1) {
          nativeService.showToast('কমপক্ষে ১টি বিষয় নির্বাচন করা আবশ্যক');
          return prev;
        }
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await educationProfileService.saveProfile({
        country: 'India',
        board: selectedBoard,
        classLevel: selectedClass,
        stream: (selectedClass === 11 || selectedClass === 12) ? selectedStream : undefined,
        medium: selectedMedium,
        selectedSubjects,
        targetExam: targetAim,
        dailyStudyGoalMinutes: dailyMinutes
      }, userId);

      setIsEditing(false);
      setShowSubjectManager(false);
      nativeService.triggerHaptic('success');
      nativeService.showToast('✅ এডুকেশন প্রোফাইল আপডেট হয়েছে! AI আপনার সিলেবাসে অ্যাডাপ্ট করেছে।');
      if (onProfileChanged) {
        onProfileChanged(updated);
      }
    } catch (e) {
      console.error('Failed to save profile:', e);
      nativeService.showToast('প্রোফাইল সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const currentBoardInfo = INDIAN_BOARDS.find(b => b.id === profile.board) || INDIAN_BOARDS[0];
  const currentMediumInfo = MEDIUMS.find(m => m.id === profile.medium) || MEDIUMS[0];
  const currentStreamInfo = profile.stream ? STREAMS.find(s => s.id === profile.stream) : null;
  const availableSubjects = getSubjectsForProfile(profile.board, profile.classLevel, profile.stream);
  const activeSubjects = availableSubjects.filter(s => profile.selectedSubjects.includes(s.id));

  const draftAvailableSubjects = getSubjectsForProfile(
    selectedBoard,
    selectedClass,
    (selectedClass === 11 || selectedClass === 12) ? selectedStream : undefined
  );

  return (
    <div className={`rounded-3xl bg-stone-900/90 border border-stone-800 text-white overflow-hidden shadow-xl ${className}`}>
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-stone-900 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF7A30] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Your Study Profile
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-[#FF7A30] border border-orange-500/30">
                INDIA 🇮🇳
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Multi-Board, Multi-Class AI Education Engine (Class 1–12)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-orange-400 border border-orange-500/30"
        >
          <Sliders size={13} />
          <span>{isEditing ? 'বাতিল' : 'পরিবর্তন করুন'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-4">
        {!isEditing ? (
          /* DISPLAY MODE */
          <div className="space-y-4">
            {/* Top Badges Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Board Badge */}
              <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
                  <Globe size={11} className="text-blue-400" /> Board
                </span>
                <span className="text-sm font-black text-white mt-1 line-clamp-1" title={currentBoardInfo.name}>
                  {currentBoardInfo.shortName}
                </span>
                <span className="text-[10px] text-stone-500 line-clamp-1">{currentBoardInfo.state}</span>
              </div>

              {/* Class Badge */}
              <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
                  <GraduationCap size={11} className="text-emerald-400" /> Class
                </span>
                <span className="text-sm font-black text-emerald-400 mt-1">
                  Class {profile.classLevel}
                </span>
                <span className="text-[10px] text-stone-500">
                  {profile.classLevel >= 11 ? 'Higher Secondary' : profile.classLevel >= 9 ? 'Secondary' : profile.classLevel >= 6 ? 'Middle School' : 'Primary'}
                </span>
              </div>

              {/* Stream Badge - ONLY IF CLASS 11-12 */}
              <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
                (profile.classLevel === 11 || profile.classLevel === 12) && currentStreamInfo
                  ? 'bg-stone-950/60 border-stone-800'
                  : 'bg-stone-950/30 border-stone-800/40 opacity-60'
              }`}>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
                  <Atom size={11} className="text-amber-400" /> Stream
                </span>
                <span className="text-sm font-black text-amber-400 mt-1">
                  {(profile.classLevel === 11 || profile.classLevel === 12) && currentStreamInfo
                    ? currentStreamInfo.name
                    : 'General (Class 1–10)'}
                </span>
                <span className="text-[10px] text-stone-500">
                  {profile.classLevel >= 11 ? 'Specialized Track' : 'No stream needed'}
                </span>
              </div>

              {/* Medium Badge */}
              <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
                  <Languages size={11} className="text-pink-400" /> Medium
                </span>
                <span className="text-sm font-black text-pink-400 mt-1">
                  {currentMediumInfo.nativeLabel}
                </span>
                <span className="text-[10px] text-stone-500">{currentMediumInfo.label}</span>
              </div>
            </div>

            {/* Active Subjects Pills */}
            <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[#FF7A30]" /> My Subjects ({activeSubjects.length})
                </span>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowSubjectManager(true);
                  }}
                  className="text-[11px] font-bold text-[#FF7A30] hover:underline cursor-pointer"
                >
                  Manage Subjects
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {activeSubjects.map((sub) => (
                  <span
                    key={sub.id}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white/90 flex items-center gap-1.5"
                    style={{ borderColor: `${sub.color}40` }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
                    {sub.name}
                    {sub.nativeName && <span className="text-[10px] text-stone-400">({sub.nativeName})</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Personalization Indicator */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-200">
              <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 block mb-0.5">
                  Smart AI Personalized to {currentBoardInfo.shortName} • Class {profile.classLevel}
                  {profile.stream ? ` • ${profile.stream.toUpperCase()}` : ''}
                </strong>
                All AI chat answers, doubt explanations, study plans, mock tests, and numerical solutions strictly match this education profile.
              </div>
            </div>
          </div>
        ) : (
          /* EDIT / SETUP MODE */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* 1. Select Board */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                <Globe size={13} className="text-orange-400" /> 1. Select Board (শিক্ষা পর্ষদ)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {INDIAN_BOARDS.map((board) => (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => handleBoardChange(board.id)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      selectedBoard === board.id
                        ? 'bg-orange-500/20 border-orange-500 text-white shadow-md'
                        : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{board.name}</div>
                      <div className="text-[10px] text-stone-400">{board.shortName} • {board.state}</div>
                    </div>
                    {selectedBoard === board.id && (
                      <CheckCircle2 size={16} className="text-orange-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Select Class (Class 1 to 12) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                <GraduationCap size={13} className="text-emerald-400" /> 2. Select Class (শ্রেণি ১ – ১২)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as ClassLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleClassChange(lvl)}
                    className={`py-2 px-1 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                      selectedClass === lvl
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md scale-105'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                    }`}
                  >
                    Class {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Stream Selection - STRICT STREAM RULE (ONLY for Class 11 and 12) */}
            <AnimatePresence>
              {(selectedClass === 11 || selectedClass === 12) ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 pt-1"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Atom size={13} className="text-amber-400" /> 3. Select Stream (বিভাগ) - Class 11 & 12 ONLY
                    </label>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                      Required for 11–12
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {STREAMS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleStreamChange(st.id)}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          selectedStream === st.id
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                            : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-white">{st.name}</div>
                          <div className="text-[10px] text-stone-400">{st.nameBn}</div>
                        </div>
                        {selectedStream === st.id && (
                          <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="p-3 bg-stone-950/50 border border-stone-800/80 rounded-2xl text-stone-400 text-xs flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-400 shrink-0" />
                  <span>
                    Class {selectedClass} uses standard unified curriculum (Stream selection is strictly reserved for Class 11 & 12).
                  </span>
                </div>
              )}
            </AnimatePresence>

            {/* 4. Select Medium */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                <Languages size={13} className="text-pink-400" /> 4. Medium of Instruction (পঠন-পাঠনের মাধ্যম)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MEDIUMS.map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => setSelectedMedium(med.id)}
                    className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                      selectedMedium === med.id
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-md'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{med.nativeLabel}</div>
                      <div className="text-[10px] text-stone-500">{med.label}</div>
                    </div>
                    {selectedMedium === med.id && (
                      <CheckCircle2 size={14} className="text-pink-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Subject Selection Checklist */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[#FF7A30]" /> 5. Select / Deselect Active Subjects
                </label>
                <span className="text-[10px] text-stone-400 font-mono">
                  {selectedSubjects.length} of {draftAvailableSubjects.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {draftAvailableSubjects.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubject(sub.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-white/10 border-orange-500/50 text-white'
                          : 'bg-stone-950/40 border-stone-800 text-stone-500 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-black text-[10px] font-bold ${
                            isChecked ? 'bg-orange-500' : 'bg-stone-800'
                          }`}
                        >
                          {isChecked && <Check size={12} className="text-white" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{sub.name}</div>
                          {sub.nativeName && <div className="text-[10px] text-stone-400">{sub.nativeName}</div>}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400">
                        {sub.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-all cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7A30] to-amber-500 hover:opacity-95 text-white font-black text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={15} />
                <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল সেভ ও AI আপডেট করুন'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
