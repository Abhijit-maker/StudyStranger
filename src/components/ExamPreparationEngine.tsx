import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileQuestion, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Sliders, 
  BookOpen, 
  Layers, 
  Download, 
  Check, 
  AlertCircle,
  HelpCircle,
  Calculator,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { 
  ExamQuestion, 
  ExamQuestionType, 
  ExamDifficulty, 
  ExamSessionConfig, 
  EducationProfile 
} from '../types/education';
import { educationProfileService } from '../services/educationProfileService';
import { getSubjectsForProfile, INDIAN_BOARDS, STREAMS } from '../data/educationData';
import { safeJsonParse } from '../services/geminiService';
import { MathText } from './MathText';
import { nativeService } from '../services/nativeService';
import confetti from 'canvas-confetti';

interface ExamPreparationEngineProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
  apiKey?: string;
  userName?: string;
  userId?: string;
  onPointsAwarded?: (earned: number) => Promise<void> | void;
}

export const ExamPreparationEngine: React.FC<ExamPreparationEngineProps> = ({
  isOpen,
  onClose,
  initialSubject,
  apiKey,
  userName = 'Student',
  userId,
  onPointsAwarded
}) => {
  const [profile, setProfile] = useState<EducationProfile>(() => educationProfileService.getProfile(userId));
  const availableSubjects = getSubjectsForProfile(profile.board, profile.classLevel, profile.stream);

  // Configuration state
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (initialSubject && availableSubjects.some(s => s.id === initialSubject || s.name.toLowerCase() === initialSubject.toLowerCase())) {
      return initialSubject;
    }
    return availableSubjects[0]?.id || 'hs-physics';
  });

  const [topicOrChapter, setTopicOrChapter] = useState<string>('');
  const [questionType, setQuestionType] = useState<ExamQuestionType | 'mixed'>('mixed');
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('board_level');
  const [testMode, setTestMode] = useState<'chapter_test' | 'full_mock' | 'revision' | 'numerical_drill'>('chapter_test');
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Engine state
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [score, setScore] = useState<{ earned: number; total: number }>({ earned: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timer
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeRemainingSeconds > 0 && !isTestSubmitted) {
      interval = setInterval(() => {
        setTimeRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemainingSeconds, isTestSubmitted]);

  if (!isOpen) return null;

  const currentSubjectObj = availableSubjects.find(s => s.id === selectedSubject) || availableSubjects[0];
  const boardInfo = INDIAN_BOARDS.find(b => b.id === profile.board) || INDIAN_BOARDS[0];

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setQuestions([]);
    setUserAnswers({});
    setRevealedSolutions({});
    setIsTestSubmitted(false);
    setCurrentIndex(0);

    const targetTopicDesc = topicOrChapter.trim() 
      ? `Topic / Chapter: "${topicOrChapter.trim()}"` 
      : `Important core syllabus topics for ${currentSubjectObj?.name || 'Subject'}`;

    const prompt = `
Act as an expert Chief Examiner and Question Paper Setter for:
* BOARD: ${boardInfo.name} (${boardInfo.shortName})
* CLASS: Class ${profile.classLevel}${profile.stream ? ` (${profile.stream.toUpperCase()} Stream)` : ''}
* SUBJECT: ${currentSubjectObj?.name} (${currentSubjectObj?.nativeName || ''})
* MEDIUM: ${profile.medium} (Bengali / English / Hindi)
* SCOPE: ${targetTopicDesc}
* TEST MODE: ${testMode}
* DIFFICULTY: ${difficulty}
* QUESTION TYPES DESIRED: ${questionType === 'mixed' ? 'A realistic mix of MCQs, Short conceptual questions (2-3 marks), Long/Descriptive questions (5 marks), and Numerical problems with formulas where applicable' : questionType}
* COUNT: Exactly ${questionCount} questions.

CRITICAL INSTRUCTIONS:
1. Every question MUST strictly respect ${boardInfo.shortName} Class ${profile.classLevel} academic guidelines.
2. For mathematical equations, chemical formulas, physics variables, wrap them STRICTLY in LaTeX with double dollar signs: $$formula$$.
3. For MCQs: provide "options" (array of 4 strings), "optionsNative" (in Bengali/Hindi if applicable), and "correctAnswerIndex" (0 to 3).
4. For Short, Long, or Numerical questions: provide "modelAnswer", "modelAnswerNative", and "stepByStepSolution" with detailed breakdown.
5. Provide marks for each question (MCQ = 1 mark, Short = 2-3 marks, Long/Numerical = 5 marks).
6. Return ONLY valid JSON array:

[
  {
    "id": "q1",
    "type": "mcq" | "short" | "long" | "numerical" | "board_style",
    "question": "Question text in English...",
    "questionNative": "Question text in Bengali / Native language...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "optionsNative": ["Option A (বাংলা)", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "marks": 1,
    "marksBreakdown": "1 Mark",
    "difficulty": "${difficulty}",
    "subject": "${currentSubjectObj?.name}",
    "topic": "${topicOrChapter.trim() || 'Core Chapter'}",
    "modelAnswer": "Comprehensive step-by-step model answer...",
    "modelAnswerNative": "বাংলায় বিস্তারিত ব্যাখ্যা ও সঠিক উত্তর...",
    "stepByStepSolution": [
      { "step": "$$E = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q}{r^2}$$", "explanation": "Step calculation explanation" }
    ],
    "yearReference": "WBCHSE 2023 / Model Paper"
  }
]
`;

    try {
      let responseText = "";
      const res = await fetch("/api/ai/generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          apiKey,
          model: "gemini-2.5-flash",
          responseMimeType: "application/json"
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.text) {
          responseText = data.text;
        }
      }
      if (!responseText) {
        throw new Error("Failed to generate content via server proxy");
      }

      const parsed = safeJsonParse(responseText || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        setQuestions(parsed);
        setTimeRemainingSeconds(parsed.length * 120); // 2 mins per question
        setTimerActive(true);
        nativeService.showToast(`✅ ${parsed.length} টি প্রশ্ন সফলভাবে তৈরি হয়েছে!`);
      } else {
        throw new Error('Could not parse exam questions');
      }
    } catch (err: any) {
      console.error('Exam Generation Error:', err);
      setErrorMsg('প্রশ্ন তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      nativeService.showToast('⚠️ AI প্রশ্ন তৈরিতে ত্রুটি');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectMCQOption = (qId: string, optionIdx: number) => {
    if (isTestSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    nativeService.triggerHaptic('success');
  };

  const handleTextAnswerChange = (qId: string, text: string) => {
    if (isTestSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const toggleSolution = (qId: string) => {
    setRevealedSolutions(prev => ({ ...prev, [qId]: !prev[qId] }));
    nativeService.triggerHaptic('success');
  };

  const handleSubmitTest = () => {
    let earned = 0;
    let total = 0;

    questions.forEach(q => {
      const qMarks = q.marks || 1;
      total += qMarks;

      if (q.type === 'mcq') {
        if (userAnswers[q.id] === q.correctAnswerIndex) {
          earned += qMarks;
        }
      } else {
        // For written questions, if student wrote an answer, give initial mark credit and prompt model answer
        if (typeof userAnswers[q.id] === 'string' && (userAnswers[q.id] as string).trim().length > 10) {
          earned += qMarks;
        }
      }
    });

    setScore({ earned, total });
    setIsTestSubmitted(true);
    setTimerActive(false);

    if (earned > 0 && onPointsAwarded) {
      onPointsAwarded(earned * 10);
    }

    // Auto reveal all solutions
    const allRev: Record<string, boolean> = {};
    questions.forEach(q => { allRev[q.id] = true; });
    setRevealedSolutions(allRev);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    nativeService.triggerHaptic('celebrate');
    nativeService.showToast(`🎉 পরীক্ষা সম্পন্ন! স্কোর: ${earned}/${total}`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[220] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 360 }}
        className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl text-white shadow-2xl flex flex-col overflow-hidden max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/20 via-stone-900 to-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <FileQuestion size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Exam & Question Engine
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {boardInfo.shortName} • Class {profile.classLevel}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                MCQs, Short, Long, Numericals & Board-Level Model Questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {questions.length > 0 && timerActive && (
              <div className="px-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-mono font-bold flex items-center gap-1.5 text-amber-400">
                <Clock size={13} />
                <span>{formatTime(timeRemainingSeconds)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {questions.length === 0 ? (
            /* CONFIGURATION / SETUP SCREEN */
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* 1. Subject Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                  <BookOpen size={13} className="text-emerald-400" /> 1. Select Subject (বিষয়)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSubjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub.id)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                        selectedSubject === sub.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-white">{sub.name}</div>
                        {sub.nativeName && <div className="text-[10px] text-stone-400">{sub.nativeName}</div>}
                      </div>
                      {selectedSubject === sub.id && (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Specific Topic / Chapter Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" /> 2. Chapter / Topic Name (ঐচ্ছিক - নির্দিষ্ট অধ্যায়)
                </label>
                <input
                  type="text"
                  value={topicOrChapter}
                  onChange={(e) => setTopicOrChapter(e.target.value)}
                  placeholder="e.g. Electrostatics, Adarini, Genetics, Organic Chemistry, Trigonometry..."
                  className="w-full bg-stone-950/80 border border-stone-800 rounded-2xl py-3 px-4 text-xs text-white placeholder:text-stone-600 outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* 3. Question Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                  <Sliders size={13} className="text-blue-400" /> 3. Question Format (প্রশ্নের ধরন)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'mixed', label: 'Mixed Board Pattern', desc: 'MCQs, Short & Numerical' },
                    { id: 'mcq', label: 'MCQs Only', desc: '4 options with explanations' },
                    { id: 'short', label: 'Short Answer (2–3 Marks)', desc: 'Reasoning & definitions' },
                    { id: 'long', label: 'Long / Descriptive (5 Marks)', desc: 'Detailed step answers' },
                    { id: 'numerical', label: 'Numerical Problems', desc: 'Formulas, step & LaTeX' },
                    { id: 'board_style', label: 'Official PYQ Style', desc: 'Previous Year style' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setQuestionType(t.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        questionType === t.id
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{t.label}</div>
                      <div className="text-[10px] text-stone-400">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Difficulty & Question Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-stone-400 tracking-wider">
                    4. Difficulty Level
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'easy', label: 'Easy (মৌলিক)' },
                      { id: 'medium', label: 'Medium (মধ্যম)' },
                      { id: 'hard', label: 'Hard (কঠিন)' },
                      { id: 'board_level', label: 'Board Level ⭐' }
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDifficulty(d.id as any)}
                        className={`py-2 px-2 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                          difficulty === d.id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-stone-400 tracking-wider">
                    5. Number of Questions
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[5, 10, 15].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setQuestionCount(cnt)}
                        className={`py-2 px-2 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                          questionCount === cnt
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        {cnt} Questions
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error message if any */}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle size={15} className="text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles size={18} />
                <span>
                  {isGenerating
                    ? 'AI প্রশ্ন তৈরি করছে (Generating Questions)...'
                    : `Generate ${boardInfo.shortName} Class ${profile.classLevel} Exam Paper`}
                </span>
              </button>
            </div>
          ) : (
            /* ACTIVE EXAM / QUESTION TEST INTERFACE */
            <div className="space-y-4">
              {/* Question Navigation Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-950/80 border border-stone-800 rounded-2xl">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {questions.map((q, idx) => {
                    const isAnswered = userAnswers[q.id] !== undefined;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center ${
                          currentIndex === idx
                            ? 'bg-emerald-500 text-white ring-2 ring-emerald-400 shadow-md'
                            : isAnswered
                            ? 'bg-stone-800 border border-emerald-500/50 text-emerald-400'
                            : 'bg-stone-900 border border-stone-800 text-stone-400'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">
                    Q {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {currentQ.marks || 1} Marks • {currentQ.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Current Question Display Card */}
              {currentQ && (
                <div className="p-4 sm:p-6 rounded-3xl bg-stone-950/90 border border-stone-800 space-y-4">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <div className="text-sm sm:text-base font-bold text-white leading-relaxed">
                      <span className="text-emerald-400 font-black mr-2">Q{currentIndex + 1}.</span>
                      <MathText text={currentQ.question} />
                    </div>

                    {currentQ.questionNative && (
                      <div className="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium pl-6 border-l-2 border-emerald-500/30 italic">
                        <MathText text={currentQ.questionNative} />
                      </div>
                    )}
                  </div>

                  {/* Question Interaction Type: MCQ vs Written */}
                  {currentQ.type === 'mcq' && currentQ.options && currentQ.options.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      {currentQ.options.map((opt, optIdx) => {
                        const isSelected = userAnswers[currentQ.id] === optIdx;
                        const isCorrect = currentQ.correctAnswerIndex === optIdx;
                        const showStatus = isTestSubmitted || revealedSolutions[currentQ.id];

                        let optionStyle = 'bg-stone-900/90 border-stone-800 text-stone-300 hover:border-stone-700';
                        if (showStatus) {
                          if (isCorrect) {
                            optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'bg-red-500/20 border-red-500 text-red-200';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-emerald-500/20 border-emerald-500 text-white';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectMCQOption(currentQ.id, optIdx)}
                            disabled={isTestSubmitted}
                            className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${optionStyle}`}
                          >
                            <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <div className="flex-1 text-xs sm:text-sm">
                              <div><MathText text={opt} /></div>
                              {currentQ.optionsNative && currentQ.optionsNative[optIdx] && (
                                <div className="text-[11px] text-stone-400 mt-0.5">
                                  <MathText text={currentQ.optionsNative[optIdx]} />
                                </div>
                              )}
                            </div>
                            {showStatus && isCorrect && (
                              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Written Answer / Numerical Input Area */
                    <div className="space-y-2 pt-2">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                        Your Written / Step-by-Step Answer:
                      </label>
                      <textarea
                        value={(userAnswers[currentQ.id] as string) || ''}
                        onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                        disabled={isTestSubmitted}
                        placeholder="Type your explanation, formula steps or derivation here..."
                        rows={4}
                        className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-3 text-xs text-white placeholder:text-stone-600 outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  )}

                  {/* Toggle Solution / Model Answer Button */}
                  <div className="pt-2 flex items-center justify-between border-t border-stone-800">
                    <button
                      onClick={() => toggleSolution(currentQ.id)}
                      className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle size={14} />
                      <span>{revealedSolutions[currentQ.id] ? 'Hide Solution' : 'View Model Solution & Explanation'}</span>
                    </button>

                    {currentQ.yearReference && (
                      <span className="text-[10px] text-stone-500 font-mono">
                        Source: {currentQ.yearReference}
                      </span>
                    )}
                  </div>

                  {/* Revealed Solution Box */}
                  <AnimatePresence>
                    {revealedSolutions[currentQ.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2 text-xs"
                      >
                        <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Official Model Solution & Step Breakdown:
                        </div>

                        {currentQ.modelAnswer && (
                          <div className="text-stone-200 leading-relaxed">
                            <MathText text={currentQ.modelAnswer} />
                          </div>
                        )}

                        {currentQ.modelAnswerNative && (
                          <div className="text-emerald-200/90 leading-relaxed italic pt-1 border-t border-emerald-500/20">
                            <MathText text={currentQ.modelAnswerNative} />
                          </div>
                        )}

                        {/* Step by step formulas */}
                        {currentQ.stepByStepSolution && currentQ.stepByStepSolution.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-emerald-500/20">
                            <div className="text-[11px] font-bold text-emerald-400">Step-by-Step Derivation:</div>
                            {currentQ.stepByStepSolution.map((st, sIdx) => (
                              <div key={sIdx} className="p-2 rounded-xl bg-black/40 border border-emerald-500/20 flex flex-col gap-1">
                                <div className="font-mono text-emerald-300"><MathText text={st.step} /></div>
                                <div className="text-[10px] text-stone-300"><MathText text={st.explanation} /></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Navigation Controls Bottom Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Previous
                </button>

                <div className="flex gap-2">
                  {!isTestSubmitted ? (
                    <button
                      onClick={handleSubmitTest}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-xs font-black text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send size={14} /> Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={() => setQuestions([])}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw size={14} /> New Test
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
