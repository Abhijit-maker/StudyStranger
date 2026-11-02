import React, { useState, useEffect } from "react";
import { 
  X, 
  CheckCircle2, 
  Clock, 
  FileText, 
  User, 
  Award, 
  Edit3, 
  Save, 
  Search, 
  Eye, 
  ExternalLink, 
  ShieldCheck, 
  MessageSquare, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { ExamSubmissionRecord } from "../server/examEvaluationService";

interface DescriptiveAdminReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName?: string;
}

export const DescriptiveAdminReviewModal: React.FC<DescriptiveAdminReviewModalProps> = ({
  isOpen,
  onClose,
  adminName = "Teacher (শিক্ষক)"
}) => {
  const [submissions, setSubmissions] = useState<ExamSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<ExamSubmissionRecord | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [search, setSearch] = useState("");

  // Admin grading inputs
  const [gradeInput, setGradeInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>("");
  const [savingGrade, setSavingGrade] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exam/submissions");
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
        if (selectedSub) {
          const updated = data.submissions.find((s: ExamSubmissionRecord) => s.id === selectedSub.id);
          if (updated) setSelectedSub(updated);
        }
      }
    } catch (err) {
      console.warn("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSub) {
      setGradeInput(
        selectedSub.adminEvaluation?.adminScore ?? selectedSub.aiEvaluation?.totalScore ?? 0
      );
      setFeedbackInput(
        selectedSub.adminEvaluation?.adminFeedback ||
        "উত্তরপত্রটি ভালো হয়েছে। বোর্ড পরীক্ষার নিয়ম মেনে পয়েন্ট ও ডায়াগ্রাম বজায় রাখবেন।"
      );
    }
  }, [selectedSub]);

  if (!isOpen) return null;

  const filtered = submissions.filter((s) => {
    const matchSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.testTitle.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (filter === "pending") return s.adminEvaluation?.status === "pending";
    if (filter === "reviewed") return s.adminEvaluation?.status === "reviewed";
    return true;
  });

  const handleSaveGrade = async () => {
    if (!selectedSub) return;
    setSavingGrade(true);
    try {
      const res = await fetch("/api/exam/admin-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          adminScore: gradeInput,
          adminFeedback: feedbackInput,
          adminName
        })
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg("শিক্ষক মূল্যায়ন ও নম্বর সফলভাবে সংরক্ষিত হয়েছে!");
        fetchSubmissions();
        setTimeout(() => setToastMsg(null), 3000);
      } else {
        alert(data.error || "Failed to save marks");
      }
    } catch (e: any) {
      alert("Error saving: " + e.message);
    } finally {
      setSavingGrade(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-2 sm:p-4 bg-stone-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-[#FAF8F5] dark:bg-stone-900 rounded-3xl border-2 border-stone-800 dark:border-stone-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white dark:bg-stone-800/90 border-b-2 border-stone-800 dark:border-stone-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-stone-900 flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_#1c1917]">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white font-serif">
                  অ্যাডমিন খাতা মূল্যায়ন ডেক্স (Teacher Evaluation Desk)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 text-[10px] font-black border border-amber-300 dark:border-amber-700">
                  {submissions.length} Scripts
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                শিক্ষার্থীদের লিখিত উত্তরপত্র (PDF/ছবি) পর্যালোচনা, নম্বর সংশোধন ও শিক্ষক মন্তব্য প্রদান
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSubmissions}
              className="p-2 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600 transition-colors cursor-pointer"
              title="Refresh submissions"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border-2 border-stone-900 dark:border-stone-600 flex items-center justify-center font-black cursor-pointer shadow-[2px_2px_0px_#1c1917]"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className="bg-emerald-500 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-sm shrink-0">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Content Body: Left Column (List) + Right Column (Evaluation Workspace) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: List of Submissions */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-stone-300 dark:border-stone-700 flex flex-col bg-white/60 dark:bg-stone-900/60 shrink-0">
            {/* Filter & Search Bar */}
            <div className="p-3 border-b border-stone-200 dark:border-stone-700 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="খাতা খুঁজুন (শিক্ষার্থী বা বিষয়)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-1">
                {(["all", "pending", "reviewed"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilter(mode)}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer capitalize ${
                      filter === mode
                        ? "bg-amber-400 text-stone-900 shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                    }`}
                  >
                    {mode === "all" ? "সব খাতা" : mode === "pending" ? "অপেক্ষমান" : "মূল্যায়িত"}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-200 dark:divide-stone-800 custom-scrollbar">
              {loading && submissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-amber-500" />
                  খাতার তালিকা লোড হচ্ছে...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500">
                  কোনো খাতা জমা পাওয়া যায়নি।
                </div>
              ) : (
                filtered.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  const isReviewed = sub.adminEvaluation?.status === "reviewed";
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`p-3.5 transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500"
                          : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-stone-900 dark:text-white line-clamp-1">
                          {sub.studentName}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-black shrink-0 ${
                            isReviewed
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {isReviewed ? "✓ শিক্ষক যাচাইকৃত" : "⏳ অপেক্ষমান"}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 dark:text-stone-300 font-medium line-clamp-1 mb-1.5">
                        {sub.testTitle}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                        <span>{sub.subject}</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          {isReviewed && sub.adminEvaluation?.adminScore !== undefined
                            ? `${sub.adminEvaluation.adminScore}/${sub.totalMarks} (শিক্ষক)`
                            : `${sub.aiEvaluation?.totalScore ?? 0}/${sub.totalMarks} (AI)`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Script View & Teacher Marking Deck */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 bg-[#FAF8F5] dark:bg-stone-950 custom-scrollbar">
            {selectedSub ? (
              <div className="space-y-6 max-w-3xl mx-auto w-full">
                {/* Script Header Bar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-black">
                        {selectedSub.subject} • {selectedSub.totalMarks} Marks Exam
                      </span>
                      <span className="text-stone-400">•</span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(selectedSub.submittedAt).toLocaleString("bn-IN")}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-stone-900 dark:text-white">
                      {selectedSub.testTitle}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                      শিক্ষার্থী: <strong>{selectedSub.studentName}</strong> (ID: {selectedSub.studentId.slice(-6)})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedSub.fileUrl && (
                      <a
                        href={selectedSub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <ExternalLink size={13} />
                        <span>মূল খাতা খুলুন (Open PDF)</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Teacher Grading & Feedback Action Box */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 border-2 border-amber-500/40 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit3 size={18} className="text-amber-600 dark:text-amber-400" />
                      <h4 className="text-sm font-black text-stone-900 dark:text-white">
                        শিক্ষক চূড়ান্ত নম্বর ও খাতা নিরীক্ষণ (Teacher Grading)
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                      AI প্রারম্ভিক নম্বর: <strong className="text-amber-600">{selectedSub.aiEvaluation?.totalScore}/{selectedSub.totalMarks}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Score Input */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                        চূড়ান্ত নম্বর (Marks Awarded):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={selectedSub.totalMarks}
                          value={gradeInput}
                          onChange={(e) => setGradeInput(Number(e.target.value))}
                          className="w-24 p-2 bg-white dark:bg-stone-800 border-2 border-stone-800 dark:border-stone-600 rounded-xl text-base font-black text-center text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-sm font-bold text-stone-500">
                          / {selectedSub.totalMarks}
                        </span>
                      </div>
                    </div>

                    {/* Teacher Feedback Text */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                        শিক্ষকের ব্যক্তিগত মন্তব্য ও পরামর্শ (Teacher Feedback):
                      </label>
                      <textarea
                        rows={2}
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="শিক্ষার্থীর উদ্দেশে পরামর্শ বা নম্বর বৃদ্ধির টিপস..."
                        className="w-full p-2 bg-white dark:bg-stone-800 border-2 border-stone-800 dark:border-stone-600 rounded-xl text-xs font-medium text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-stone-500 font-medium">
                      নিরীক্ষক: <strong>{adminName}</strong>
                    </span>
                    <button
                      onClick={handleSaveGrade}
                      disabled={savingGrade}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[2px_2px_0px_#1c1917] flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Save size={14} />
                      <span>{savingGrade ? "সংরক্ষণ হচ্ছে..." : "নম্বর প্রকাশ করুন (Save Grade)"}</span>
                    </button>
                  </div>
                </div>

                {/* AI Preliminary Evaluation Report Breakdown */}
                {selectedSub.aiEvaluation && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                        <span>🤖</span>
                        <span>AI বিস্তারিত মূল্যায়ন রিপোর্ট ও খাতার বিশ্লেষণ</span>
                      </h4>
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        গ্রেড: {selectedSub.aiEvaluation.grade} ({selectedSub.aiEvaluation.percentage}%)
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                      <p className="text-stone-700 dark:text-stone-300 font-medium">
                        <strong>সামগ্রিক মূল্যায়ন:</strong> {selectedSub.aiEvaluation.overallFeedbackBn}
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                        <strong>শক্তিশালী দিকসমূহ:</strong> {selectedSub.aiEvaluation.strengthsSummaryBn}
                      </p>
                      <p className="text-amber-700 dark:text-amber-400 font-medium">
                        <strong>উন্নতির সুযোগ:</strong> {selectedSub.aiEvaluation.improvementTipsBn}
                      </p>
                    </div>

                    {/* Question by Question Table */}
                    {selectedSub.aiEvaluation.questionEvaluations && selectedSub.aiEvaluation.questionEvaluations.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-black text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                          প্রশ্নভিত্তিক নম্বর ও রুব্রিক বিশ্লেষণ
                        </h5>
                        <div className="space-y-2">
                          {selectedSub.aiEvaluation.questionEvaluations.map((qEval) => (
                            <div
                              key={qEval.questionNumber}
                              className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-stone-900 dark:text-white">
                                  প্রশ্ন {qEval.questionNumber}
                                </span>
                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                  {qEval.marksAwarded} / {qEval.maxMarks}
                                </span>
                              </div>
                              <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                                <span className="text-emerald-600 font-bold">✓</span> {qEval.strengthsBn}
                              </p>
                              {qEval.weaknessesBn && (
                                <p className="text-rose-600 dark:text-rose-400 text-[11px]">
                                  <span className="font-bold">⚠️</span> {qEval.weaknessesBn}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-stone-400">
                <FileText size={48} className="mb-3 opacity-40 text-amber-500" />
                <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300">
                  বামদিকের তালিকা থেকে যেকোনো খাতা নির্বাচন করুন
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mt-1">
                  শিক্ষার্থীদের জমা দেওয়া খাতা দেখে নম্বর সংশোধন ও মন্তব্য প্রদান করতে পারবেন।
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
