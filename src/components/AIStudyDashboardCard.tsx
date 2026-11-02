import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Brain,
  Calculator,
  PenTool,
  HelpCircle,
  FileQuestion,
  Calendar,
  Layers,
  Award,
  Target,
  Clock,
  ChevronRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  Atom,
  Languages,
  Plus,
  ArrowRight,
  Zap,
  Bot
} from 'lucide-react';
import { EducationProfile, BoardId, ClassLevel, StreamType, MediumType, Subject } from '../types/education';
import { INDIAN_BOARDS, MEDIUMS, STREAMS, getSubjectsForProfile } from '../data/educationData';
import { educationProfileService } from '../services/educationProfileService';
import { nativeService } from '../services/nativeService';

interface AIStudyDashboardCardProps {
  userId?: string;
  userName?: string;
  onOpenDoubtSolver?: (subject?: string) => void;
  onOpenAskAI?: (initialPrompt?: string) => void;
  onOpenMockTest?: (subject?: string) => void;
  onOpenStudyPlan?: () => void;
  onOpenPracticeQuestions?: (subject?: string) => void;
  onOpenRevision?: (subject?: string) => void;
  onOpenNotes?: (subject?: string) => void;
  onOpenStudyMaterials?: (subject?: string) => void;
  onOpenProfileSettings?: () => void;
  onOpenProfile?: () => void;
  onOpenExamEngine?: (subject?: string) => void;
  onOpenExamPreparation?: (subject?: string) => void;
  className?: string;
}

export const AIStudyDashboardCard: React.FC<AIStudyDashboardCardProps> = ({
  userId,
  userName = 'Student',
  onOpenDoubtSolver,
  onOpenAskAI,
  onOpenMockTest,
  onOpenStudyPlan,
  onOpenPracticeQuestions,
  onOpenRevision,
  onOpenNotes,
  onOpenStudyMaterials,
  onOpenProfileSettings,
  onOpenProfile,
  onOpenExamEngine,
  onOpenExamPreparation,
  className = ''
}) => {
  const [profile, setProfile] = useState<EducationProfile>(() => educationProfileService.getProfile(userId));
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('all');
  const [studyMinutesToday, setStudyMinutesToday] = useState(45);
  const [completedGoals, setCompletedGoals] = useState<string[]>(['1']);

  const handleOpenProfile = () => {
    if (onOpenProfileSettings) onOpenProfileSettings();
    else if (onOpenProfile) onOpenProfile();
  };

  const handleOpenExam = (subject?: string) => {
    if (onOpenExamPreparation) onOpenExamPreparation(subject);
    else if (onOpenExamEngine) onOpenExamEngine(subject);
    else if (onOpenMockTest) onOpenMockTest(subject);
  };

  useEffect(() => {
    const unsub = educationProfileService.subscribe((updated) => {
      setProfile(updated);
    });
    return () => unsub();
  }, []);

  const boardInfo = INDIAN_BOARDS.find(b => b.id === profile.board) || INDIAN_BOARDS[0];
  const mediumInfo = MEDIUMS.find(m => m.id === profile.medium) || MEDIUMS[0];
  const streamInfo = profile.stream ? STREAMS.find(s => s.id === profile.stream) : null;
  const availableSubjects = getSubjectsForProfile(profile.board, profile.classLevel, profile.stream);
  const activeSubjects = availableSubjects.filter(s => profile.selectedSubjects.includes(s.id));

  const goalPercent = Math.min(100, Math.round((studyMinutesToday / (profile.dailyStudyGoalMinutes || 120)) * 100));

  const toggleGoal = (id: string) => {
    setCompletedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
    nativeService.triggerHaptic('success');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Personalized Hero Header Card */}
      <div className="relative overflow-hidden stranger-card-premium p-5 sm:p-8 transition-all duration-500">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-orange-500/15 text-[#FF7A30] border border-orange-500/30 flex items-center gap-1.5 shadow-sm pl-[0.2em]">
                <GraduationCap size={13} /> {boardInfo.shortName}
              </span>
              <span className="px-3.5 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 pl-[0.2em]">
                Class {profile.classLevel}
              </span>
              {(profile.classLevel === 11 || profile.classLevel === 12) && profile.stream && (
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Atom size={12} /> {streamInfo?.name || profile.stream.toUpperCase()}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 text-stone-300 border border-white/10 flex items-center gap-1">
                <Languages size={11} className="text-pink-400" /> {mediumInfo.nativeLabel}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tighter flex items-center gap-3 stranger-text-editorial">
                Academic Command Center
                <span className="text-[10px] bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-black tracking-widest uppercase">
                  Active
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl font-medium">
                Tailored for <strong className="text-stone-800 dark:text-stone-200">{boardInfo.name}</strong> • Class {profile.classLevel}
                {profile.stream ? ` (${profile.stream.toUpperCase()} Stream)` : ''}.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenProfile}
            className="self-start md:self-auto px-5 py-3 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Switch Board</span>
            <ChevronRight size={14} className="text-[#FF7A30]" />
          </button>
        </div>

        {/* 2. My Subjects Bar */}
        <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <BookOpen size={13} className="text-[#FF7A30]" /> My Subjects ({activeSubjects.length})
            </span>
            <button
              onClick={handleOpenProfile}
              className="text-[11px] font-bold text-[#FF7A30] hover:underline cursor-pointer"
            >
              + Manage Subjects
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            <button
              onClick={() => setActiveSubjectTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeSubjectTab === 'all'
                  ? 'bg-gradient-to-r from-[#FF7A30] to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-stone-950/70 border border-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              All Subjects
            </button>
            {activeSubjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubjectTab(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeSubjectTab === sub.id
                    ? 'bg-white/15 border border-white/30 text-white'
                    : 'bg-stone-950/70 border border-stone-800 text-stone-400 hover:text-white'
                }`}
                style={{ borderColor: activeSubjectTab === sub.id ? sub.color : undefined }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
                <span>{sub.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. AI Study Dashboard Launcher Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* AI Doubt Solver */}
        <button
          onClick={() => {
            if (onOpenDoubtSolver) onOpenDoubtSolver(activeSubjectTab !== 'all' ? activeSubjectTab : undefined);
          }}
          className="p-5 stranger-card-premium hover:shadow-2xl hover:-translate-y-1 text-left transition-all group flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#FF7A30] flex items-center justify-center group-hover:scale-110 transition-transform stranger-scribble-border">
              <Sparkles size={22} />
            </div>
            <span className="text-[9px] font-black tracking-widest text-orange-500 dark:text-orange-400 uppercase">
              24/7 Support
            </span>
          </div>
          <div>
            <h4 className="text-sm font-black text-stone-900 dark:text-white group-hover:text-[#FF7A30] transition-colors uppercase tracking-wider">
              Doubt Solver
            </h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 font-bold">
              Instant Step-by-Step AI
            </p>
          </div>
        </button>

        {/* Ask AI / Personal Mentor */}
        <button
          onClick={() => {
            if (onOpenAskAI) onOpenAskAI();
          }}
          className="p-5 stranger-card-premium hover:shadow-2xl hover:-translate-y-1 text-left transition-all group flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot size={22} />
            </div>
            <span className="text-[9px] font-black tracking-widest text-indigo-500 dark:text-indigo-400 uppercase">
              Mentor Mode
            </span>
          </div>
          <div>
            <h4 className="text-sm font-black text-stone-900 dark:text-white group-hover:text-indigo-500 transition-colors uppercase tracking-wider">
              Ask AI Mentor
            </h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 font-bold">
              Voice & Interactive Sessions
            </p>
          </div>
        </button>

        {/* Question & Exam Engine (MCQ, Short, Long, Numerical) */}
        <button
          onClick={() => handleOpenExam(activeSubjectTab !== 'all' ? activeSubjectTab : undefined)}
          className="p-4 rounded-3xl bg-white dark:bg-stone-900/90 hover:bg-stone-50 dark:hover:bg-stone-850 border border-stone-200/90 dark:border-stone-800 hover:border-emerald-500/50 text-left transition-all group shadow-xs dark:shadow-lg cursor-pointer flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileQuestion size={20} />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Exam Mode
            </span>
          </div>
          <div>
            <h4 className="text-sm font-black text-stone-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              Practice & Questions
            </h4>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-1">
              MCQs, Short, Long, Numerical & PYQ
            </p>
          </div>
        </button>

        {/* Full Mock Test */}
        <button
          onClick={() => {
            if (onOpenMockTest) onOpenMockTest(activeSubjectTab !== 'all' ? activeSubjectTab : undefined);
            else handleOpenExam(activeSubjectTab !== 'all' ? activeSubjectTab : undefined);
          }}
          className="p-4 rounded-3xl bg-white dark:bg-stone-900/90 hover:bg-stone-50 dark:hover:bg-stone-850 border border-stone-200/90 dark:border-stone-800 hover:border-pink-500/50 text-left transition-all group shadow-xs dark:shadow-lg cursor-pointer flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 dark:bg-pink-500/20 text-pink-500 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award size={20} />
            </div>
            <span className="text-[10px] font-mono font-bold text-pink-500 dark:text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
              Score 95%+
            </span>
          </div>
          <div>
            <h4 className="text-sm font-black text-stone-900 dark:text-white group-hover:text-pink-500 transition-colors">
              Full Mock Test
            </h4>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-1">
              Timed board-style test with report
            </p>
          </div>
        </button>
      </div>

      {/* 4. Secondary Hub Row: Study Plan, Revision, Notes, Materials */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => onOpenStudyPlan?.()}
          className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 hover:border-stone-700 text-left transition-all flex items-center gap-3 cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Calendar size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Study Plan</div>
            <div className="text-[10px] text-stone-400">AI Daily Schedule</div>
          </div>
        </button>

        <button
          onClick={() => onOpenRevision?.(activeSubjectTab !== 'all' ? activeSubjectTab : undefined)}
          className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 hover:border-stone-700 text-left transition-all flex items-center gap-3 cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Zap size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Quick Revision</div>
            <div className="text-[10px] text-stone-400">Flashcards & Blitz</div>
          </div>
        </button>

        <button
          onClick={() => onOpenNotes?.(activeSubjectTab !== 'all' ? activeSubjectTab : undefined)}
          className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 hover:border-stone-700 text-left transition-all flex items-center gap-3 cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Chapter Notes</div>
            <div className="text-[10px] text-stone-400">Key Points & Mindmap</div>
          </div>
        </button>

        <button
          onClick={() => onOpenStudyMaterials?.(activeSubjectTab !== 'all' ? activeSubjectTab : undefined)}
          className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 hover:border-stone-700 text-left transition-all flex items-center gap-3 cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Layers size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Study Materials</div>
            <div className="text-[10px] text-stone-400">PDFs, Diagrams & Labs</div>
          </div>
        </button>
      </div>

      {/* 5. Progress, Daily Study Goal & Weak Topics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Daily Study Goal Card */}
        <div className="p-4 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#FF7A30]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Daily Study Goal</h4>
            </div>
            <span className="text-xs font-bold text-[#FF7A30]">
              {studyMinutesToday} / {profile.dailyStudyGoalMinutes || 120} mins
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF7A30] to-amber-400 transition-all duration-500 rounded-full"
              style={{ width: `${goalPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>{goalPercent}% completed today</span>
            <button
              onClick={() => {
                setStudyMinutesToday(prev => prev + 15);
                nativeService.triggerHaptic('success');
                nativeService.showToast('+15 মিনিট পড়ার সময় যোগ হয়েছে!');
              }}
              className="text-[#FF7A30] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus size={12} /> Add 15m
            </button>
          </div>
        </div>

        {/* Identified Weak Topics Card */}
        <div className="p-4 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-red-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Weak Topics to Master</h4>
            </div>
            <span className="text-[10px] text-red-400 font-mono font-bold bg-red-500/10 px-2 py-0.5 rounded-full">
              {profile.weakTopics.length} Focus
            </span>
          </div>

          <div className="space-y-1.5">
            {profile.weakTopics.length > 0 ? (
              profile.weakTopics.slice(0, 3).map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => onOpenAskAI?.(`Let's master my weak topic: "${topic}" with complete concepts and MCQs`)}
                  className="w-full text-left p-2 rounded-xl bg-stone-950/60 border border-stone-800/80 hover:border-red-500/40 text-[11px] text-stone-300 hover:text-white flex items-center justify-between group transition-all cursor-pointer"
                >
                  <span className="line-clamp-1">📌 {topic}</span>
                  <ArrowRight size={12} className="text-stone-500 group-hover:text-red-400 transition-colors shrink-0" />
                </button>
              ))
            ) : (
              <p className="text-[11px] text-stone-500 italic">No weak topics marked. Take a test to diagnose!</p>
            )}
          </div>
        </div>

        {/* Daily Checklist Tasks */}
        <div className="p-4 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Target Tasks</h4>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">Today</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {[
              { id: '1', text: `Solve 10 MCQs in ${activeSubjects[0]?.name || 'Physics'}` },
              { id: '2', text: 'Revise 1 Formula Sheet' },
              { id: '3', text: 'Take a 15-min Speed Blitz Quiz' }
            ].map(task => (
              <button
                key={task.id}
                onClick={() => toggleGoal(task.id)}
                className={`w-full p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  completedGoals.includes(task.id)
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through'
                    : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold ${
                  completedGoals.includes(task.id) ? 'bg-emerald-500 text-white' : 'bg-stone-800'
                }`}>
                  {completedGoals.includes(task.id) && '✓'}
                </div>
                <span className="text-[11px] line-clamp-1">{task.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
