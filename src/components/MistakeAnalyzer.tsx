import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Brain, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Bookmark, 
  Share2, 
  Zap, 
  Target,
  ArrowRight,
  Flame,
  Award,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { MathText } from "./MathText";
import { soundEffects } from "../services/soundEffectsService";

export interface AnalyzedQuestion {
  id: string | number;
  question: string;
  options: string[];
  correctIndex: number;
  userAnswerIndex: number; // -1 if skipped
  chapter?: string;
  unit?: string;
  subject?: string;
  explanation?: string;
  bilingualExplanation?: {
    bn: string;
    en: string;
    keyPoint: string;
  };
}

interface MistakeAnalyzerProps {
  questions: AnalyzedQuestion[];
  subject?: string;
  topic?: string;
  onClose?: () => void;
  onRetest?: () => void;
}

export const MistakeAnalyzer: React.FC<MistakeAnalyzerProps> = ({
  questions,
  subject = "WBCHSE Semester 3",
  topic = "General Assessment",
  onClose,
  onRetest
}) => {
  const [filter, setFilter] = useState<"all" | "wrong" | "skipped" | "correct">("wrong");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [retriedAnswers, setRetriedAnswers] = useState<Record<string | number, number>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string | number, boolean>>(() => {
    try {
      const saved = localStorage.getItem("bookmarked_mistakes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Calculate high-yield chapter statistics & weakness diagnostics
  const stats = useMemo(() => {
    const total = questions.length;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const chapterMap: Record<string, { total: number; correct: number; wrong: number; skipped: number }> = {};

    questions.forEach((q) => {
      const ch = q.chapter || topic || "General Syllabus";
      if (!chapterMap[ch]) {
        chapterMap[ch] = { total: 0, correct: 0, wrong: 0, skipped: 0 };
      }
      chapterMap[ch].total++;

      if (q.userAnswerIndex === q.correctIndex) {
        correct++;
        chapterMap[ch].correct++;
      } else if (q.userAnswerIndex === -1) {
        skipped++;
        chapterMap[ch].skipped++;
      } else {
        wrong++;
        chapterMap[ch].wrong++;
      }
    });

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Sort chapters by weakness (lowest accuracy first)
    const weaknessList = Object.entries(chapterMap).map(([name, data]) => {
      const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      return {
        name,
        total: data.total,
        correct: data.correct,
        wrong: data.wrong,
        skipped: data.skipped,
        accuracy: acc
      };
    }).sort((a, b) => a.accuracy - b.accuracy);

    return { total, correct, wrong, skipped, accuracy, weaknessList };
  }, [questions, topic]);

  // Filtered questions
  const displayedQuestions = useMemo(() => {
    return questions.filter((q) => {
      const isCorrect = q.userAnswerIndex === q.correctIndex;
      const isSkipped = q.userAnswerIndex === -1;
      const isWrong = !isCorrect && !isSkipped;

      if (filter === "wrong") return isWrong;
      if (filter === "skipped") return isSkipped;
      if (filter === "correct") return isCorrect;
      return true; // "all"
    });
  }, [questions, filter]);

  const handleToggleBookmark = (id: string | number) => {
    soundEffects.play("click");
    setBookmarkedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("bookmarked_mistakes", JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const handleRetrySelect = (qId: string | number, optionIdx: number, correctIdx: number) => {
    setRetriedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    if (optionIdx === correctIdx) {
      soundEffects.play("correct");
    } else {
      soundEffects.play("wrong");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_#0f172a] overflow-hidden text-left">
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
              <Brain size={14} /> AI Diagnostic & Mistake Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              স্মার্ট ভুল বিশ্লেষণ ও দুর্বলতা ট্র্যাকার
            </h2>
            <p className="text-xs md:text-sm text-white/90 font-medium">
              WBCHSE Class 12 Sem 3 • {subject} ({topic})
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/20 self-start md:self-auto">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-white/75 block uppercase">ভুল উত্তর</span>
              <span className="text-xl md:text-2xl font-black text-rose-300">{stats.wrong}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-white/75 block uppercase">ছেড়ে যাওয়া</span>
              <span className="text-xl md:text-2xl font-black text-amber-300">{stats.skipped}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-white/75 block uppercase">সঠিক</span>
              <span className="text-xl md:text-2xl font-black text-emerald-300">{stats.correct}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-8 space-y-8">
        {/* CHAPTER WEAKNESS DIAGNOSTIC RADAR / BARS */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 md:p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-orange-500" size={20} />
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                চ্যাপ্টার অনুযায়ী প্রস্তুতি ও দুর্বলতা (Chapter Weakness Breakdown)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              সামগ্রিক নির্ভুলতা: {stats.accuracy}%
            </span>
          </div>

          <div className="space-y-3">
            {stats.weaknessList.map((ch, idx) => {
              const isWeak = ch.accuracy < 60;
              const isModerate = ch.accuracy >= 60 && ch.accuracy < 85;
              const barColor = isWeak ? "bg-rose-500" : isModerate ? "bg-amber-500" : "bg-emerald-500";
              const tagText = isWeak ? "উন্নতি প্রয়োজন (Needs Focus)" : isModerate ? "ভালো (Good)" : "চমৎকার (Mastered)";
              const tagClass = isWeak 
                ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                : isModerate
                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300";

              return (
                <div key={idx} className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                      {ch.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tagClass}`}>
                        {tagText}
                      </span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {ch.accuracy}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} transition-all duration-700 rounded-full`}
                      style={{ width: `${Math.max(ch.accuracy, 4)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>সঠিক: {ch.correct}/{ch.total}</span>
                    <span>ভুল: {ch.wrong} • বাদ: {ch.skipped}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">ফিল্টার:</span>
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setFilter("wrong")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filter === "wrong"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                ভুল উত্তর ({stats.wrong})
              </button>
              <button
                type="button"
                onClick={() => setFilter("skipped")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filter === "skipped"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                বাদ দেওয়া ({stats.skipped})
              </button>
              <button
                type="button"
                onClick={() => setFilter("correct")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filter === "correct"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                সঠিক ({stats.correct})
              </button>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filter === "all"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                সব প্রশ্ন ({stats.total})
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-bold">
            প্রদর্শিত প্রশ্ন: {displayedQuestions.length} টি
          </div>
        </div>

        {/* QUESTIONS LIST */}
        <div className="space-y-4">
          {displayedQuestions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
              <h4 className="text-base font-black text-slate-800 dark:text-white">এই ফিল্টারে কোনো প্রশ্ন নেই!</h4>
              <p className="text-xs text-slate-500 mt-1">সব ফিল্টারে গিয়ে পুরো টেস্টের উত্তর দেখতে পারেন।</p>
            </div>
          ) : (
            displayedQuestions.map((q, idx) => {
              const isCorrect = q.userAnswerIndex === q.correctIndex;
              const isSkipped = q.userAnswerIndex === -1;
              const isExpanded = expandedId === q.id || displayedQuestions.length === 1;
              const isBookmarked = !!bookmarkedIds[q.id];
              const retriedChoice = retriedAnswers[q.id];
              const hasRetried = retriedChoice !== undefined;
              const retriedCorrect = retriedChoice === q.correctIndex;

              return (
                <div
                  key={q.id || idx}
                  className={`rounded-3xl border-2 transition-all overflow-hidden ${
                    isCorrect
                      ? "border-emerald-200 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10"
                      : isSkipped
                      ? "border-amber-200 dark:border-amber-950 bg-amber-50/20 dark:bg-amber-950/10"
                      : "border-rose-200 dark:border-rose-950 bg-rose-50/20 dark:bg-rose-950/10"
                  }`}
                >
                  {/* Question Title Bar */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-slate-500/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isCorrect ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                            ✓
                          </div>
                        ) : isSkipped ? (
                          <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                            ?
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                            ✕
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                            প্রশ্ন #{idx + 1}
                          </span>
                          {q.chapter && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {q.chapter}
                            </span>
                          )}
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isCorrect 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" 
                              : isSkipped 
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" 
                              : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          }`}>
                            {isCorrect ? "সঠিক (Correct)" : isSkipped ? "বাদ দেওয়া (Skipped)" : "ভুল (Incorrect)"}
                          </span>
                        </div>

                        <div className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug">
                          <MathText text={q.question} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookmark(q.id);
                        }}
                        className={`p-2 rounded-xl transition-all ${
                          isBookmarked 
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300" 
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        }`}
                        title="Bookmark Question"
                      >
                        <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                      </button>

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content: Analysis, Options & On-the-spot Retest */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-4"
                      >
                        {/* Interactive Option Grid */}
                        <div className="space-y-2 pt-2">
                          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                            <span>বিকল্পসমূহ (Options & Interactive Retest):</span>
                            {!isCorrect && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                                <Sparkles size={12} /> অপশনে ক্লিক করে অন-দ্য-স্পট সঠিক করুন
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => {
                              const isUserChosen = q.userAnswerIndex === optIdx;
                              const isCorrectAnswer = q.correctIndex === optIdx;
                              const isRetrySelected = hasRetried && retriedChoice === optIdx;

                              let cardStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200";

                              if (isCorrectAnswer) {
                                cardStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold ring-1 ring-emerald-500/30";
                              } else if (isUserChosen && !isCorrect) {
                                cardStyle = "bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-300 line-through decoration-rose-500";
                              }

                              if (hasRetried) {
                                if (isRetrySelected && isCorrectAnswer) {
                                  cardStyle = "bg-emerald-600 text-white font-black border-emerald-600 shadow-md";
                                } else if (isRetrySelected && !isCorrectAnswer) {
                                  cardStyle = "bg-rose-600 text-white font-black border-rose-600";
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleRetrySelect(q.id, optIdx, q.correctIndex)}
                                  className={`p-3 rounded-2xl border text-left text-xs md:text-sm transition-all flex items-center justify-between gap-2 cursor-pointer ${cardStyle}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black flex items-center justify-center shrink-0">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>
                                      <MathText text={opt} />
                                    </span>
                                  </div>

                                  <div className="shrink-0 text-[10px] font-black uppercase">
                                    {isCorrectAnswer && (
                                      <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                        সঠিক উত্তর ✓
                                      </span>
                                    )}
                                    {isUserChosen && !isCorrect && (
                                      <span className="text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                                        আপনার উত্তর ✕
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {hasRetried && (
                            <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                              retriedCorrect 
                                ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200" 
                                : "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200"
                            }`}>
                              {retriedCorrect ? (
                                <>
                                  <CheckCircle2 size={16} /> সাবাশ! এবার আপনি সঠিক উত্তরটি নির্বাচন করেছেন।
                                </>
                              ) : (
                                <>
                                  <XCircle size={16} /> এটিও ভুল হয়েছে। সঠিক উত্তরটি সবুজ চিহ্নিত বিকল্প।
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* BILINGUAL AI EXPLANATION BOX */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-black text-xs uppercase tracking-wider">
                            <Lightbulb size={16} />
                            <span>AI বিশদ বিশ্লেষণ ও কনসেপ্ট (Bilingual Explanation)</span>
                          </div>

                          {/* Bengali Explanation */}
                          <div className="text-xs md:text-sm text-slate-800 dark:text-slate-200 space-y-1">
                            <span className="font-bold text-indigo-900 dark:text-indigo-200 block text-xs">
                              বাংলা ব্যাখ্যা:
                            </span>
                            <div className="leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-indigo-100/60 dark:border-indigo-900/30">
                              <MathText text={q.bilingualExplanation?.bn || q.explanation || "সঠিক উত্তরটি সিলেবাস অনুযায়ী যথাযথ নিয়ম মেনে নির্ধারণ করা হয়েছে।"} />
                            </div>
                          </div>

                          {/* English Explanation */}
                          <div className="text-xs md:text-sm text-slate-800 dark:text-slate-200 space-y-1">
                            <span className="font-bold text-indigo-900 dark:text-indigo-200 block text-xs">
                              English Conceptual Breakdown:
                            </span>
                            <div className="leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-indigo-100/60 dark:border-indigo-900/30 font-sans">
                              <MathText text={q.bilingualExplanation?.en || q.explanation || "The correct choice corresponds to standard WBCHSE syllabus criteria."} />
                            </div>
                          </div>

                          {/* Critical Memory Hook / WBCHSE Key Point */}
                          {q.bilingualExplanation?.keyPoint && (
                            <div className="p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                              <Flame size={15} className="text-amber-600 shrink-0" />
                              <span>
                                <strong>WBCHSE পরীক্ষার টিপস:</strong> {q.bilingualExplanation.keyPoint}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-bold">
            💡 যে প্রশ্নগুলো ভুল হয়েছে তা রিভিশন করার জন্য বুকমার্ক করে রাখুন।
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onRetest && (
              <button
                type="button"
                onClick={onRetest}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
              >
                <RotateCcw size={16} /> আবার টেস্ট দিন
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                সম্পন্ন করুন (Close)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
