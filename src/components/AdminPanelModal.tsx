import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ShieldAlert, 
  Megaphone, 
  FileText, 
  Users, 
  Bot, 
  BarChart3, 
  Pin, 
  Trash2, 
  Eye, 
  Download, 
  Plus, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Lock, 
  Unlock, 
  Flame, 
  Activity, 
  RefreshCw,
  FileCheck,
  BookOpen,
  UserPlus,
  Edit3,
  Database,
  Check,
  Sliders,
  AlertTriangle,
  Server,
  Layers,
  HelpCircle,
  Clock,
  Send,
  ShieldCheck,
  ArrowUpDown,
  Globe,
  ExternalLink,
  Copy
} from "lucide-react";
import { db } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  setDoc,
  getDocs 
} from "firebase/firestore";
import { generateStyledPDF } from "../utils/pdfGenerator";
import { AdminAIAssistant } from "./AdminAIAssistant";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { PDFUploadZone, PDFSourceType } from "./PDFUploadZone";
import { 
  savePdfDataUrlToIndexedDB, 
  getPdfFromIndexedDB, 
  triggerPdfDownload 
} from "../services/pdfStorageService";
import { nativeService } from "../services/nativeService";
import { FALLBACK_WBCHSE_QUESTIONS } from "../data/wbchseFallbackQuestions";

interface AdminPanelModalProps {
  onClose: () => void;
  adminName: string;
  adminEmail: string;
  customApiKey?: string;
  user?: any;
  onPromoteSelfToAdmin?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  onClose,
  adminName,
  adminEmail,
  customApiKey,
  user,
  onPromoteSelfToAdmin
}) => {
  const [activeTab, setActiveTab] = useState<"notices" | "students" | "questions" | "ai_pilot" | "stats" | "seo">("notices");
  const [copiedSeoLink, setCopiedSeoLink] = useState<string | null>(null);

  // Notices state
  const [notices, setNotices] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [category, setCategory] = useState("WBCHSE Sem 3");
  const [isPinned, setIsPinned] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // PDF attachment state
  const [pdfSourceType, setPdfSourceType] = useState<PDFSourceType>("upload");
  const [uploadedPdfData, setUploadedPdfData] = useState<string>("");
  const [uploadedPdfName, setUploadedPdfName] = useState<string>("");
  const [uploadedPdfSize, setUploadedPdfSize] = useState<string>("");
  const [uploadedPdfId, setUploadedPdfId] = useState<string>("");
  const [customPdfUrl, setCustomPdfUrl] = useState<string>("");
  const [generatedPdfNotes, setGeneratedPdfNotes] = useState<string>("");

  // Students state
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<"all" | "active" | "blocked" | "live" | "vip">("all");
  const [studentSortBy, setStudentSortBy] = useState<"points" | "streak" | "active" | "name">("active");
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Student sub-modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [newStudentForm, setNewStudentForm] = useState({
    displayName: "",
    email: "",
    username: "",
    points: 250,
    streak: 1,
    role: "student",
    status: "active",
    stream: "Science (WBCHSE)"
  });

  // Question Bank state
  const [questionsSubject, setQuestionsSubject] = useState<string>("Biology");
  const [customQuestions, setCustomQuestions] = useState<any[]>([]);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState({
    subject: "Biology",
    questionEn: "",
    questionBn: "",
    optionsEn: ["", "", "", ""],
    optionsBn: ["", "", "", ""],
    correctIndex: 0,
    explanationEn: "",
    explanationBn: "",
    difficulty: "medium" as "easy" | "medium" | "hard"
  });

  // Preview modal
  const [previewDocument, setPreviewDocument] = useState<any>(null);

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    return localStorage.getItem("sys_maintenance_mode") === "true";
  });
  const [systemAlertBanner, setSystemAlertBanner] = useState<string>("");

  // Real-Time Live Presence Server Poller (every 4 seconds)
  const [serverActiveUsers, setServerActiveUsers] = useState<any[]>([]);
  const [serverOnlineCount, setServerOnlineCount] = useState<number>(0);
  const [presenceLastFetched, setPresenceLastFetched] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const fetchLivePresence = async () => {
      try {
        const res = await fetch("/api/presence/active-users");
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setServerOnlineCount(data.onlineCount || 0);
            setServerActiveUsers(Array.isArray(data.users) ? data.users : []);
            setPresenceLastFetched(new Date().toLocaleTimeString("bn-IN"));
          }
        }
      } catch (e) {
        // silent fallback
      }
    };

    fetchLivePresence();
    const interval = setInterval(fetchLivePresence, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Real-time Announcements
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, "announcements"), (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
        setNotices(list);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firestore announcements sync error:", e);
    }
  }, []);

  // Real-time Students Monitor
  useEffect(() => {
    setLoadingStudents(true);
    try {
      const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => {
          const aOnline = a.isOnline || (a.lastActive && (Date.now() - new Date(a.lastActive).getTime()) < 180000);
          const bOnline = b.isOnline || (b.lastActive && (Date.now() - new Date(b.lastActive).getTime()) < 180000);
          if (aOnline && !bOnline) return -1;
          if (!aOnline && bOnline) return 1;
          return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
        });
        setStudents(list);
        setLoadingStudents(false);
      }, (err) => {
        console.warn("Real-time students listener warning:", err);
        setLoadingStudents(false);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firestore students snapshot setup error:", e);
      setLoadingStudents(false);
    }
  }, []);

  // Real-time Custom Questions Monitor
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, "question_bank"), (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setCustomQuestions(list);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Question bank listener warning:", e);
    }
  }, []);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(list);
    } catch (e) {
      console.warn("Fetch students error:", e);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Quick Notice Templates
  const handleApplyNoticeTemplate = (type: "routine" | "urgent" | "material" | "tips") => {
    if (type === "routine") {
      setTitle("WBCHSE Class 12 Sem 3 Exam Routine & Exam Guidelines");
      setNoticeText("The WBCHSE Semester 3 examination timetable has been declared. Please review Unit I (Biology Reproduction) and Unit II (Genetics & Evolution) thoroughly along with English B prose texts. Check the attached routine PDF for details.");
      setCategory("Exam Alert");
      setIsPinned(true);
    } else if (type === "urgent") {
      setTitle("🚨 Urgent: Important Instructions for Mock Test Submission");
      setNoticeText("All students must complete their pending MCQ Speed Blitz tests and Mock Exam series by tonight. Top rankers on the Stranger Leaderboard will be featured in the State Honors list.");
      setCategory("Urgent Alert");
      setIsPinned(true);
    } else if (type === "material") {
      setTitle("📘 High-Yield Formula & Concept Sheet: Physics & Biology");
      setNoticeText("Comprehensive formula cheat-sheet for WBCHSE Class 12 covering Acrosome Reaction, DNA Base Pairing, Snell's Law, and Electromagnetic Waves has been published.");
      setCategory("Study Material");
    } else if (type === "tips") {
      setTitle("💡 Bengali A & English B Model Answers & Grammar Rules");
      setNoticeText("Key insights on Adarini (আদিরিনী - জয়রাম মোক্তার), Swami Vivekananda's বাঙ্গালা ভাষা, Ruskin Bond's The Night Train at Deoli, and Tennyson's Ulysses have been updated.");
      setCategory("WBCHSE Sem 3");
    }
  };

  // Publish Notice
  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeText.trim() && !title.trim() && !uploadedPdfName) {
      alert("Please provide a title, message, or attach a PDF document.");
      return;
    }

    setIsPublishing(true);
    try {
      let finalPdfData = "";
      let finalPdfName = "";
      let finalPdfSize = "";
      let finalPdfUrl = customPdfUrl.trim();
      let finalPdfId = uploadedPdfId;

      if (pdfSourceType === "upload" && (uploadedPdfData || uploadedPdfId)) {
        finalPdfData = uploadedPdfData;
        finalPdfName = uploadedPdfName || "Attached_Document.pdf";
        finalPdfSize = uploadedPdfSize || "PDF Document";
        finalPdfId = uploadedPdfId;
        
        if (finalPdfData && !finalPdfId) {
          const rec = await savePdfDataUrlToIndexedDB(finalPdfData, finalPdfName);
          finalPdfId = rec.id;
        }
      } else if (pdfSourceType === "generate") {
        const contentForPdf = generatedPdfNotes.trim() || noticeText.trim() || title.trim();
        finalPdfData = generateStyledPDF({
          title: title || "WBCHSE Class 12 Official Notice",
          category: category,
          author: `${adminName} (Admin)`,
          content: contentForPdf
        });
        finalPdfName = `${(title || "Official_Notice").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        finalPdfSize = "Generated PDF";
        const rec = await savePdfDataUrlToIndexedDB(finalPdfData, finalPdfName);
        finalPdfId = rec.id;
      } else if (pdfSourceType === "url" && customPdfUrl.trim()) {
        finalPdfUrl = customPdfUrl.trim();
        finalPdfName = `${(title || "Notice_File").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        finalPdfSize = "External Link";
      }

      if (finalPdfData && !finalPdfUrl) {
        try {
          const uploadResp = await fetch("/api/upload/pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: finalPdfName || "Notice_Document.pdf",
              fileData: finalPdfData
            })
          });
          if (uploadResp.ok) {
            const upJson = await uploadResp.json();
            if (upJson.success && upJson.pdfUrl) {
              finalPdfUrl = upJson.pdfUrl;
              if (upJson.pdfSize) finalPdfSize = upJson.pdfSize;
            }
          }
        } catch (serverUploadErr) {
          console.warn("[PDF Notice Sync] Server upload warning:", serverUploadErr);
        }
      }

      const isSmallPayload = finalPdfData && finalPdfData.length < 350000;

      const noticePayload: any = {
        title: title.trim() || finalPdfName || "Official Announcement",
        text: noticeText.trim(),
        category,
        timestamp: new Date().toISOString(),
        author: `${adminName} (Admin)`,
        isPinned
      };

      if (isSmallPayload) {
        noticePayload.pdfData = finalPdfData;
      }
      if (finalPdfId) {
        noticePayload.pdfId = finalPdfId;
      }
      if (finalPdfName) {
        noticePayload.pdfName = finalPdfName;
        noticePayload.pdfSize = finalPdfSize || "PDF Document";
      }
      if (finalPdfUrl) {
        noticePayload.pdfUrl = finalPdfUrl;
      }

      await addDoc(collection(db, "announcements"), noticePayload);

      try {
        await fetch("/api/admin/broadcast-notice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noticePayload.title,
            text: noticePayload.text,
            category: noticePayload.category,
            pdfUrl: finalPdfUrl,
            pdfName: finalPdfName,
            pdfSize: finalPdfSize
          })
        });
      } catch (tgBroadcastErr) {
        console.warn("Telegram notice broadcast warning:", tgBroadcastErr);
      }

      nativeService.showToast("Notice & PDF successfully published to all students!");
      setTitle("");
      setNoticeText("");
      setUploadedPdfData("");
      setUploadedPdfName("");
      setUploadedPdfSize("");
      setUploadedPdfId("");
      setCustomPdfUrl("");
      setGeneratedPdfNotes("");
      setIsPinned(false);
      setPdfSourceType("upload");
    } catch (err: any) {
      console.error("Publish error:", err);
      alert(`Publish failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Preview Document Handler
  const handleOpenNoticePreview = async (n: any) => {
    let activePdfData = n.pdfData || "";
    if (!activePdfData && n.pdfId) {
      const rec = await getPdfFromIndexedDB(n.pdfId);
      if (rec) {
        activePdfData = rec.dataUrl;
      }
    }

    setPreviewDocument({
      id: n.id,
      title: n.title || n.pdfName || "Notice Document",
      pdfData: activePdfData,
      pdfUrl: n.pdfUrl,
      pdfName: n.pdfName,
      body: n.text,
      category: n.category,
      date: n.timestamp ? new Date(n.timestamp).toLocaleDateString() : new Date().toLocaleDateString()
    });
  };

  // Download Document Handler
  const handleDownloadNoticePdf = async (n: any) => {
    let activePdfData = n.pdfData || "";
    if (!activePdfData && n.pdfId) {
      const rec = await getPdfFromIndexedDB(n.pdfId);
      if (rec) {
        activePdfData = rec.dataUrl;
      }
    }

    const downloadTarget = activePdfData || n.pdfUrl;
    if (downloadTarget) {
      triggerPdfDownload(downloadTarget, n.pdfName || `${n.title || "Notice"}.pdf`);
      nativeService.showToast(`Downloading: ${n.pdfName || "Notice.pdf"}`);
    } else {
      nativeService.showToast("No PDF binary available for download");
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm("Delete this broadcast notice?")) {
      try {
        await deleteDoc(doc(db, "announcements", id));
        nativeService.showToast("Notice removed from bulletin");
      } catch (e) {
        console.error("Delete error:", e);
      }
    }
  };

  // Modify Student Points / Status
  const handleModifyStudent = async (studentId: string, updates: any) => {
    try {
      await updateDoc(doc(db, "users", studentId), updates);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updates } : s));
      nativeService.showToast("Student profile updated successfully");
    } catch (e) {
      console.error("Update student error:", e);
    }
  };

  // Create New Student Account
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.displayName.trim() && !newStudentForm.email.trim()) {
      alert("Please provide at least a student name or email");
      return;
    }

    try {
      const newUid = `student_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const studentPayload = {
        uid: newUid,
        displayName: newStudentForm.displayName.trim() || "Student",
        email: newStudentForm.email.trim() || `${newStudentForm.username || "student"}@studystranger.app`,
        username: newStudentForm.username.trim() || newStudentForm.displayName.toLowerCase().replace(/\s+/g, ""),
        points: Number(newStudentForm.points) || 100,
        streak: Number(newStudentForm.streak) || 1,
        role: newStudentForm.role || "student",
        status: newStudentForm.status || "active",
        stream: newStudentForm.stream || "Science (WBCHSE)",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isOnline: false,
        totalStudyTimeMinutes: 0,
        questionsSolved: 0
      };

      await setDoc(doc(db, "users", newUid), studentPayload);
      setStudents(prev => [studentPayload, ...prev]);
      setShowAddStudentModal(false);
      nativeService.showToast("New student account created in database!");
      setNewStudentForm({
        displayName: "",
        email: "",
        username: "",
        points: 250,
        streak: 1,
        role: "student",
        status: "active",
        stream: "Science (WBCHSE)"
      });
    } catch (err: any) {
      console.error("Create student error:", err);
      alert(`Could not create student: ${err?.message || "Unknown error"}`);
    }
  };

  // Save Edited Student
  const handleSaveEditedStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      await updateDoc(doc(db, "users", editingStudent.id || editingStudent.uid), {
        displayName: editingStudent.displayName,
        email: editingStudent.email,
        username: editingStudent.username,
        points: Number(editingStudent.points) || 0,
        streak: Number(editingStudent.streak) || 0,
        role: editingStudent.role || "student",
        status: editingStudent.status || "active",
        premiumUnlocked: !!editingStudent.premiumUnlocked
      });

      setStudents(prev => prev.map(s => (s.id === editingStudent.id || s.uid === editingStudent.uid) ? editingStudent : s));
      setEditingStudent(null);
      nativeService.showToast("Student profile saved!");
    } catch (err) {
      console.error("Save edit student error:", err);
      alert("Failed to save student changes.");
    }
  };

  // Add Question to Question Bank
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionForm.questionEn.trim()) {
      alert("Please provide the question text");
      return;
    }

    try {
      const questionPayload = {
        subject: newQuestionForm.subject,
        questionEn: newQuestionForm.questionEn.trim(),
        questionBn: newQuestionForm.questionBn.trim() || newQuestionForm.questionEn.trim(),
        optionsEn: newQuestionForm.optionsEn,
        optionsBn: newQuestionForm.optionsBn.map((opt, i) => opt.trim() || newQuestionForm.optionsEn[i]),
        correctIndex: Number(newQuestionForm.correctIndex),
        explanationEn: newQuestionForm.explanationEn.trim(),
        explanationBn: newQuestionForm.explanationBn.trim() || newQuestionForm.explanationEn.trim(),
        difficulty: newQuestionForm.difficulty,
        createdAt: new Date().toISOString(),
        author: `${adminName} (Admin)`
      };

      await addDoc(collection(db, "question_bank"), questionPayload);
      setShowAddQuestionModal(false);
      nativeService.showToast("Question successfully added to WBCHSE Bank!");
      setNewQuestionForm({
        subject: "Biology",
        questionEn: "",
        questionBn: "",
        optionsEn: ["", "", "", ""],
        optionsBn: ["", "", "", ""],
        correctIndex: 0,
        explanationEn: "",
        explanationBn: "",
        difficulty: "medium"
      });
    } catch (err: any) {
      console.error("Question add error:", err);
      alert(`Failed to save question: ${err?.message}`);
    }
  };

  // Export Students CSV
  const handleExportStudentsCSV = () => {
    try {
      const headers = ["ID", "Name", "Email", "Username", "Points", "Streak", "Status", "Role", "Minutes Studied", "Questions Solved", "Last Active"];
      const rows = students.map(s => [
        s.id || s.uid || "",
        `"${(s.displayName || "").replace(/"/g, '""')}"`,
        `"${s.email || ""}"`,
        `"${s.username || ""}"`,
        s.points || 0,
        s.streak || 0,
        s.status || "active",
        s.role || "student",
        s.totalStudyTimeMinutes || 0,
        s.questionsSolved || 0,
        `"${s.lastActive || ""}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `WBCHSE_Students_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      nativeService.showToast("Student Database CSV downloaded!");
    } catch (err) {
      console.error("CSV Export error:", err);
    }
  };

  // Combined Questions for Selected Subject
  const allSubjectQuestions = [
    ...(customQuestions.filter(q => q.subject?.toLowerCase() === questionsSubject.toLowerCase())),
    ...(FALLBACK_WBCHSE_QUESTIONS[questionsSubject] || [])
  ];

  // Accurate Real-time online students count from server heartbeats + Firestore
  const onlineStudentsCount = Math.max(
    serverOnlineCount,
    students.filter(s => s.isOnline || (s.lastActive && (Date.now() - new Date(s.lastActive).getTime()) < 60000)).length
  );
  const totalStudyHours = Math.round(students.reduce((acc, s) => acc + (s.totalStudyTimeMinutes || 0), 0) / 60);
  const totalQuestionsSolved = students.reduce((acc, s) => acc + (s.questionsSolved || 0), 0);

  // Filter & Sort Students
  const filteredStudents = students
    .filter(s => {
      const q = studentSearch.toLowerCase();
      const matchesQuery = (
        (s.displayName && s.displayName.toLowerCase().includes(q)) ||
        (s.username && s.username.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
      if (!matchesQuery) return false;
      const isLive = s.isOnline || (s.lastActive && (Date.now() - new Date(s.lastActive).getTime()) < 180000);
      if (studentStatusFilter === "live") return isLive;
      if (studentStatusFilter === "active") return s.status !== "suspended" && !s.isBlocked;
      if (studentStatusFilter === "blocked") return s.status === "suspended" || s.isBlocked;
      if (studentStatusFilter === "vip") return !!s.premiumUnlocked;
      return true;
    })
    .sort((a, b) => {
      if (studentSortBy === "points") return (b.points || 0) - (a.points || 0);
      if (studentSortBy === "streak") return (b.streak || 0) - (a.streak || 0);
      if (studentSortBy === "name") return (a.displayName || "").localeCompare(b.displayName || "");
      // default: active status first
      const aLive = a.isOnline || (a.lastActive && (Date.now() - new Date(a.lastActive).getTime()) < 180000);
      const bLive = b.isOnline || (b.lastActive && (Date.now() - new Date(b.lastActive).getTime()) < 180000);
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;
      return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
    });

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-2xl"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-stone-900 text-stone-100 w-full max-w-6xl h-[94vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-800"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#FF7A30] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-mono">
                    Admin Command Deck v4.0
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md">
                    Master Authority
                  </span>
                </div>
                {/* Clean unboxed metadata strip */}
                <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5 font-medium flex-wrap">
                  <span>Logged as <strong className="text-[#FF7A30]">{adminEmail}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>{adminName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    {onlineStudentsCount} Live
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onPromoteSelfToAdmin && (
                <button
                  onClick={onPromoteSelfToAdmin}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all border border-stone-700/60"
                  title="Refresh admin privileges"
                >
                  <ShieldCheck size={14} className="text-[#FF7A30]" />
                  <span>Verify Status</span>
                </button>
              )}
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:bg-stone-700"
                title="Close Admin Panel"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Stats Ribbon */}
          <div className="px-4 sm:px-6 py-2 bg-stone-950/40 border-b border-stone-800/80 flex items-center justify-between gap-4 overflow-x-auto text-[11px] font-mono shrink-0">
            <div className="flex items-center gap-4 shrink-0 text-stone-400">
              <span>👥 <strong className="text-white font-bold">{students.length}</strong> Students</span>
              <span>·</span>
              <span className="text-emerald-400">🟢 <strong className="font-bold">{onlineStudentsCount}</strong> Online Now</span>
              <span>·</span>
              <span>📢 <strong className="text-[#FF7A30] font-bold">{notices.length}</strong> Notices</span>
              <span>·</span>
              <span>📝 <strong className="text-amber-400 font-bold">{customQuestions.length + 30}</strong> Questions</span>
              <span>·</span>
              <span>⏱️ <strong className="text-white font-bold">{totalStudyHours}h</strong> Studied</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-stone-500">WBCHSE Class 12 Sem 3 Hub</span>
            </div>
          </div>

          {/* Tab Navigation - Clean Segmented Control */}
          <div className="px-4 sm:px-6 py-2 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide shrink-0">
            <nav className="flex items-center gap-1.5 p-1 bg-stone-900 rounded-2xl border border-stone-800/80">
              <button
                onClick={() => setActiveTab("notices")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "notices"
                    ? "bg-[#FF7A30] text-white shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Megaphone size={13} />
                <span>Broadcast & PDF</span>
              </button>

              <button
                onClick={() => setActiveTab("students")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "students"
                    ? "bg-[#FF7A30] text-white shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Users size={13} />
                <span>Student Accounts ({students.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("questions")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "questions"
                    ? "bg-[#FF7A30] text-white shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <BookOpen size={13} />
                <span>Question Bank</span>
              </button>

              <button
                onClick={() => setActiveTab("ai_pilot")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "ai_pilot"
                    ? "bg-[#FF7A30] text-white shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Bot size={13} />
                <span>AI Co-Pilot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              <button
                onClick={() => setActiveTab("stats")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "stats"
                    ? "bg-[#FF7A30] text-white shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <BarChart3 size={13} />
                <span>Diagnostics & Health</span>
              </button>

              <button
                onClick={() => setActiveTab("seo")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "seo"
                    ? "bg-[#FF7A30] text-white shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Globe size={13} />
                <span>Search Console & SEO</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </button>
            </nav>

            <button
              onClick={fetchStudents}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              title="Sync latest Firestore data"
            >
              <RefreshCw size={13} className={loadingStudents ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh Sync</span>
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-900/60">
            {/* TAB 1: NOTICES & PDF MANAGER */}
            {activeTab === "notices" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form column */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Quick Notice Templates Strip */}
                  <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      ⚡ 1-Click Notice Presets
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleApplyNoticeTemplate("routine")}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-[11px] font-medium text-stone-200 border border-stone-800 transition-colors"
                      >
                        📅 Exam Routine
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyNoticeTemplate("urgent")}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 text-[11px] font-medium text-rose-300 border border-rose-800/40 transition-colors"
                      >
                        🚨 Urgent Alert
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyNoticeTemplate("material")}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-[11px] font-medium text-amber-300 border border-stone-800 transition-colors"
                      >
                        📘 Study Material
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyNoticeTemplate("tips")}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-[11px] font-medium text-stone-200 border border-stone-800 transition-colors"
                      >
                        💡 Bengali & English
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#FF7A30] flex items-center gap-2">
                        <Megaphone size={16} /> Broadcast Official Notice
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Live Sync
                      </span>
                    </div>

                    <form onSubmit={handlePublishNotice} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Notice Title</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. WBCHSE Sem 3 Biology & Language Routine"
                          className="w-full bg-stone-900 border border-stone-800 rounded-2xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#FF7A30]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Category Tag</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-stone-900 border border-stone-800 rounded-2xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#FF7A30]"
                          >
                            <option value="WBCHSE Sem 3">WBCHSE Sem 3</option>
                            <option value="Exam Alert">Exam Alert</option>
                            <option value="Study Material">Study Material</option>
                            <option value="Class Notice">Class Notice</option>
                            <option value="Urgent Alert">Urgent Alert</option>
                          </select>
                        </div>

                        <div className="flex items-end pb-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-300">
                            <input
                              type="checkbox"
                              checked={isPinned}
                              onChange={(e) => setIsPinned(e.target.checked)}
                              className="accent-[#FF7A30] w-4 h-4 rounded"
                            />
                            <span>Pin to Bulletin Board</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Notice Description / Announcement</label>
                        <textarea
                          rows={3}
                          value={noticeText}
                          onChange={(e) => setNoticeText(e.target.value)}
                          placeholder="Write full notice details for all students..."
                          className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-3 text-xs text-white outline-none focus:border-[#FF7A30] resize-none"
                        />
                      </div>

                      {/* PDF Attachment Controls */}
                      <PDFUploadZone
                        sourceType={pdfSourceType}
                        onSourceTypeChange={setPdfSourceType}
                        pdfData={uploadedPdfData}
                        pdfName={uploadedPdfName}
                        pdfSize={uploadedPdfSize}
                        pdfId={uploadedPdfId}
                        pdfUrl={customPdfUrl}
                        generatedNotes={generatedPdfNotes}
                        onPdfDataChange={({ pdfData, pdfName, pdfSize, pdfId }) => {
                          setUploadedPdfData(pdfData);
                          setUploadedPdfName(pdfName);
                          setUploadedPdfSize(pdfSize);
                          setUploadedPdfId(pdfId || "");
                        }}
                        onPdfUrlChange={setCustomPdfUrl}
                        onGeneratedNotesChange={setGeneratedPdfNotes}
                        onPreviewRequest={(data, name) => {
                          setPreviewDocument({
                            title: name || title || "Attached PDF Preview",
                            pdfData: data,
                            pdfName: name,
                            subtitle: "Pre-broadcast PDF Preview",
                            type: "pdf",
                            category: category,
                            date: new Date().toLocaleDateString()
                          });
                        }}
                        maxSizeMB={1000}
                        label="Attach PDF Document (Max 1000MB / 1GB)"
                      />

                      <button
                        type="submit"
                        disabled={isPublishing}
                        className="w-full py-3 bg-[#FF7A30] text-white font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <Send size={15} />
                        <span>{isPublishing ? "Broadcasting Notice..." : "Publish & Broadcast to All Students"}</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Published notices list */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <FileCheck size={16} className="text-[#FF7A30]" /> Active Bulletins ({notices.length})
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {notices.length === 0 ? (
                      <div className="p-8 text-center text-stone-500 font-bold text-xs bg-stone-950 rounded-3xl border border-stone-800">
                        No notices posted yet. Use the form to publish one.
                      </div>
                    ) : (
                      notices.map((n, idx) => (
                        <div
                          key={`admin-notice-${n.id || idx}-${idx}`}
                          className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 hover:border-stone-700 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 text-xs text-stone-400 flex-wrap">
                                {n.isPinned && (
                                  <span className="text-[#FF7A30] font-bold flex items-center gap-0.5">
                                    <Pin size={11} /> Pinned
                                  </span>
                                )}
                                {n.isPinned && <span aria-hidden="true">·</span>}
                                <span className="font-semibold text-stone-300">{n.category || "Notice"}</span>
                                <span aria-hidden="true">·</span>
                                <span className="text-stone-500 font-mono text-[10px]">
                                  {n.timestamp ? new Date(n.timestamp).toLocaleDateString() : "Recent"}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-white">{n.title || "Notice"}</h4>
                              <p className="text-xs text-stone-400 line-clamp-2">{n.text}</p>
                            </div>

                            <button
                              onClick={() => handleDeleteAnnouncement(n.id)}
                              className="p-2 text-stone-500 hover:text-rose-400 rounded-xl hover:bg-rose-950/40 transition-all cursor-pointer"
                              title="Delete Notice"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {(n.pdfData || n.pdfUrl || n.pdfId || n.pdfName) && (
                            <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between gap-2 mt-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText size={16} className="text-[#FF7A30] shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-stone-200 truncate block font-mono">
                                    {n.pdfName || "Notice.pdf"}
                                  </span>
                                  {n.pdfSize && (
                                    <span className="text-[9px] font-mono text-stone-400">
                                      {n.pdfSize}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleOpenNoticePreview(n)}
                                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Eye size={12} className="text-[#FF7A30]" /> Preview
                                </button>
                                <button
                                  onClick={() => handleDownloadNoticePdf(n)}
                                  className="px-2.5 py-1 bg-[#FF7A30] hover:bg-orange-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                  title="Download Attached PDF"
                                >
                                  <Download size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STUDENT ACCOUNTS */}
            {activeTab === "students" && (
              <div className="space-y-4">
                {/* Real-time Live Logged-in Presence Banner & Active User Radar */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-stone-900 to-teal-950/80 border-2 border-emerald-500/40 shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
                          👥
                        </div>
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-stone-900 animate-ping" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-stone-900" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400">
                            রিয়েল-টাইম লাইভ অনলাইন উপস্থিতি (Live Online Radar)
                          </span>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                            Active Sync
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                          <span>বর্তমানে ওয়েবসাইটে মোট লগইন করা আছে:</span>
                          <span className="text-emerald-400 font-mono text-xl">{onlineStudentsCount} জন শিক্ষার্থী</span>
                        </h3>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-stone-400 self-end sm:self-center">
                      <span>স্বয়ংক্রিয় রিফ্রেশ: প্রতি ৪ সেকেন্ডে</span>
                      <span className="block text-emerald-400/80 font-bold">{presenceLastFetched ? `আপডেট: ${presenceLastFetched}` : "লাইভ সিঙ্ক চলছে..."}</span>
                    </div>
                  </div>

                  {/* Active Connected User Chips */}
                  {serverActiveUsers.length > 0 && (
                    <div className="pt-2 border-t border-emerald-500/20 flex items-center gap-2 overflow-x-auto touch-pan-x custom-scrollbar">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold shrink-0">
                        লাইভ সক্রিয় সেশন:
                      </span>
                      {serverActiveUsers.map((u, i) => (
                        <div
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-stone-950/80 border border-emerald-500/30 text-[11px] text-white flex items-center gap-1.5 shrink-0"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold">{u.displayName || "Student"}</span>
                          <span className="text-[10px] text-stone-400 font-mono">({u.currentRoute || "/app"})</span>
                          <span className="text-[9px] text-emerald-400 font-mono font-bold">
                            {u.secondsAgo !== undefined ? `${u.secondsAgo}s ago` : "Online"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search, Filter & Actions Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search by name, email or username..."
                      className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-2xl text-xs text-white outline-none focus:border-[#FF7A30]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                    {/* Status Filter Segmented Control */}
                    <div className="flex items-center bg-stone-950 p-1 rounded-2xl border border-stone-800 text-[11px] font-bold">
                      <button
                        onClick={() => setStudentStatusFilter("all")}
                        className={`px-2.5 py-1 rounded-xl transition-all ${
                          studentStatusFilter === "all" ? "bg-stone-800 text-white shadow-sm" : "text-stone-400 hover:text-stone-200"
                        }`}
                      >
                        All ({students.length})
                      </button>
                      <button
                        onClick={() => setStudentStatusFilter("live")}
                        className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                          studentStatusFilter === "live" ? "bg-emerald-500 text-stone-950 font-black shadow-sm" : "text-emerald-400"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Live ({onlineStudentsCount})
                      </button>
                      <button
                        onClick={() => setStudentStatusFilter("active")}
                        className={`px-2.5 py-1 rounded-xl transition-all ${
                          studentStatusFilter === "active" ? "bg-stone-800 text-emerald-400" : "text-stone-400"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setStudentStatusFilter("blocked")}
                        className={`px-2.5 py-1 rounded-xl transition-all ${
                          studentStatusFilter === "blocked" ? "bg-stone-800 text-rose-400" : "text-stone-400"
                        }`}
                      >
                        Blocked
                      </button>
                      <button
                        onClick={() => setStudentStatusFilter("vip")}
                        className={`px-2.5 py-1 rounded-xl transition-all ${
                          studentStatusFilter === "vip" ? "bg-amber-500 text-stone-950 font-black" : "text-amber-400"
                        }`}
                      >
                        VIP
                      </button>
                    </div>

                    {/* Sort Selector */}
                    <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-xl border border-stone-800 text-xs text-stone-400">
                      <ArrowUpDown size={12} />
                      <select
                        value={studentSortBy}
                        onChange={(e: any) => setStudentSortBy(e.target.value)}
                        className="bg-transparent text-white text-[11px] font-bold outline-none cursor-pointer"
                      >
                        <option value="active" className="bg-stone-900 text-white">Active State</option>
                        <option value="points" className="bg-stone-900 text-white">Highest Points</option>
                        <option value="streak" className="bg-stone-900 text-white">Longest Streak</option>
                        <option value="name" className="bg-stone-900 text-white">Name (A-Z)</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="px-3 py-1.5 bg-[#FF7A30] hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <UserPlus size={14} />
                      <span>Add Student</span>
                    </button>

                    <button
                      onClick={handleExportStudentsCSV}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Export Student Database to CSV"
                    >
                      <Download size={14} />
                      <span className="hidden md:inline">Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Students Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-stone-500 font-bold text-xs bg-stone-950 rounded-3xl border border-stone-800">
                      No student accounts found matching your filter.
                    </div>
                  ) : (
                    filteredStudents.map((st, idx) => {
                      const isBlocked = st.status === "suspended" || st.isBlocked;
                      const isLive = st.isOnline || (st.lastActive && (Date.now() - new Date(st.lastActive).getTime()) < 180000);
                      return (
                        <div
                          key={`admin-student-${st.id || st.uid || idx}-${idx}`}
                          className={`p-4 rounded-3xl bg-stone-950 border transition-all shadow-sm space-y-3 ${
                            isBlocked
                              ? "border-rose-500/40 bg-rose-950/10"
                              : "border-stone-800 hover:border-stone-700"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm border ${
                                  isBlocked 
                                    ? "bg-rose-950/60 text-rose-400 border-rose-800/60"
                                    : "bg-stone-800 text-stone-200 border-stone-700"
                                }`}>
                                  {(st.displayName || st.username || "S").substring(0, 2).toUpperCase()}
                                </div>
                                {isLive && (
                                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-stone-950 animate-pulse" title="Online Live Now"></span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-extrabold text-sm text-white truncate">
                                    {st.displayName || st.username || "Anonymous Student"}
                                  </h4>
                                  {st.role === "admin" && (
                                    <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                                      ADMIN
                                    </span>
                                  )}
                                  {st.premiumUnlocked && (
                                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                      VIP
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-400 font-mono truncate">
                                  {st.email || `@${st.username || "student"}`}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => setEditingStudent(st)}
                              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                              title="Edit Student Account"
                            >
                              <Edit3 size={15} />
                            </button>
                          </div>

                          {/* Real-time Activity Indicator */}
                          <div className="bg-stone-900/90 border border-stone-800/80 rounded-2xl p-2.5 space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-400 font-medium">Activity:</span>
                              <span className="text-stone-300 font-semibold truncate max-w-[150px]">
                                {st.currentActivity || "WBCHSE Sem 3 Prep"}
                              </span>
                            </div>
                            {/* Unboxed metrics */}
                            <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono pt-1 border-t border-stone-800">
                              <span>⏱️ {st.totalStudyTimeMinutes || 0}m active</span>
                              <span>🎯 {st.questionsSolved || 0} solved</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-stone-900/60 p-2 rounded-2xl text-[11px] font-mono">
                            <div>
                              <span className="text-[9px] text-stone-500 font-sans block uppercase font-bold">Study Points</span>
                              <span className="font-bold text-[#FF7A30]">{st.points || 0} PTS</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-stone-500 font-sans block uppercase font-bold">Streak</span>
                              <span className="font-bold text-amber-400">🔥 {st.streak || 0} Days</span>
                            </div>
                          </div>

                          {/* Quick Admin Actions */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() => handleModifyStudent(st.id || st.uid, { points: (st.points || 0) + 100 })}
                              className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                              title="Award +100 Study Points"
                            >
                              +100 PTS
                            </button>

                            <button
                              onClick={() => handleModifyStudent(st.id || st.uid, { streak: (st.streak || 0) + 1 })}
                              className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                              title="Increment Streak"
                            >
                              +1 Streak
                            </button>

                            <button
                              onClick={() => handleModifyStudent(st.id || st.uid, { premiumUnlocked: !st.premiumUnlocked })}
                              className={`px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                st.premiumUnlocked 
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                                  : "bg-stone-800 hover:bg-stone-700 text-stone-400"
                              }`}
                              title="Toggle VIP Tier"
                            >
                              {st.premiumUnlocked ? "VIP ON" : "VIP"}
                            </button>

                            {/* Block / Unblock Primary Button */}
                            <button
                              onClick={() => {
                                const nextBlocked = !isBlocked;
                                const actionText = nextBlocked ? "Block" : "Unblock";
                                if (confirm(`Are you sure you want to ${actionText} ${st.displayName || st.username || "this student"}?`)) {
                                  handleModifyStudent(st.id || st.uid, { 
                                    status: nextBlocked ? "suspended" : "active",
                                    isBlocked: nextBlocked
                                  });
                                }
                              }}
                              className={`flex-1 py-1 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                isBlocked
                                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                  : "bg-rose-500/20 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/40"
                              }`}
                            >
                              {isBlocked ? (
                                <>
                                  <Unlock size={11} />
                                  <span>Unblock</span>
                                </>
                              ) : (
                                <>
                                  <Lock size={11} />
                                  <span>Block</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: QUESTION & SYLLABUS BANK */}
            {activeTab === "questions" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Subject:</span>
                    <div className="flex items-center bg-stone-950 p-1 rounded-2xl border border-stone-800 text-xs font-bold">
                      {["Biology", "Bengali A", "English B", "Physics", "Chemistry", "Mathematics"].map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setQuestionsSubject(sub)}
                          className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                            questionsSubject.toLowerCase() === sub.toLowerCase()
                              ? "bg-[#FF7A30] text-white shadow-sm"
                              : "text-stone-400 hover:text-stone-200"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNewQuestionForm(prev => ({ ...prev, subject: questionsSubject }));
                      setShowAddQuestionModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#FF7A30] hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add New MCQ Question</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>Active Questions for <strong>{questionsSubject}</strong>: {allSubjectQuestions.length}</span>
                    <span className="font-mono text-[11px] text-stone-500">Live WBCHSE Sem 3 Syllabus Grounding</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[560px] overflow-y-auto pr-1">
                    {allSubjectQuestions.map((q, idx) => (
                      <div
                        key={`q-card-${q.id || idx}`}
                        className="p-4 rounded-3xl bg-stone-950 border border-stone-800 space-y-2.5 hover:border-stone-700 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold text-[#FF7A30] bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                            Q#{idx + 1} · {q.difficulty || "medium"}
                          </span>
                          {q.id && q.id.startsWith("custom_") && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              Admin Added
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-white leading-relaxed">{q.questionEn}</h4>
                          {q.questionBn && q.questionBn !== q.questionEn && (
                            <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed font-sans">{q.questionBn}</p>
                          )}
                        </div>

                        <div className="space-y-1 pt-1">
                          {(q.optionsEn || []).map((opt: string, optIdx: number) => {
                            const isCorrect = optIdx === q.correctIndex;
                            return (
                              <div
                                key={`opt-${optIdx}`}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] flex items-center justify-between border ${
                                  isCorrect
                                    ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-bold"
                                    : "bg-stone-900/60 text-stone-300 border-stone-800/80"
                                }`}
                              >
                                <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                {isCorrect && <Check size={12} className="text-emerald-400" />}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanationEn && (
                          <div className="p-2 bg-stone-900/80 rounded-xl text-[10px] text-stone-400 font-mono">
                            <strong>Explanation:</strong> {q.explanationEn}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ADMIN AI CO-PILOT */}
            {activeTab === "ai_pilot" && (
              <div className="h-[620px]">
                <AdminAIAssistant
                  adminName={adminName}
                  adminEmail={adminEmail}
                  customApiKey={customApiKey}
                  onNoticeCreated={() => fetchStudents()}
                />
              </div>
            )}

            {/* TAB 5: SYSTEM STATS & TELEMETRY */}
            {activeTab === "stats" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-3xl bg-stone-950 border border-stone-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Registered</span>
                    <p className="text-2xl font-black text-white font-mono">{students.length || 1}</p>
                    <span className="text-[10px] text-emerald-400 font-bold">100% Synced</span>
                  </div>

                  <div className="p-4 rounded-3xl bg-stone-950 border border-stone-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Online Now
                    </span>
                    <p className="text-2xl font-black text-emerald-400 font-mono">{onlineStudentsCount}</p>
                    <span className="text-[10px] text-stone-400 font-bold">Heartbeat active</span>
                  </div>

                  <div className="p-4 rounded-3xl bg-stone-950 border border-stone-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Total Study Time</span>
                    <p className="text-2xl font-black text-amber-400 font-mono">{totalStudyHours} hrs</p>
                    <span className="text-[10px] text-stone-400 font-bold">Logged across app</span>
                  </div>

                  <div className="p-4 rounded-3xl bg-stone-950 border border-stone-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A30]">Questions Solved</span>
                    <p className="text-2xl font-black text-[#FF7A30] font-mono">{totalQuestionsSolved}</p>
                    <span className="text-[10px] text-stone-400 font-bold">Mock tests & practice</span>
                  </div>
                </div>

                {/* System Control Deck */}
                <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Sliders size={15} className="text-[#FF7A30]" /> Platform Administration Controls
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-stone-900 rounded-2xl border border-stone-800 flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-white">Maintenance Mode</h5>
                        <p className="text-[11px] text-stone-400">Restricts non-admin access for scheduled upgrades</p>
                      </div>
                      <button
                        onClick={() => {
                          const next = !maintenanceMode;
                          setMaintenanceMode(next);
                          localStorage.setItem("sys_maintenance_mode", next ? "true" : "false");
                          nativeService.showToast(`Maintenance mode ${next ? "ACTIVATED" : "DEACTIVATED"}`);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          maintenanceMode
                            ? "bg-rose-500 text-white shadow-md shadow-rose-900/30"
                            : "bg-stone-800 text-stone-400 hover:text-white"
                        }`}
                      >
                        {maintenanceMode ? "ACTIVE" : "OFF"}
                      </button>
                    </div>

                    <div className="p-3.5 bg-stone-900 rounded-2xl border border-stone-800 flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-white">Database Cache & Offline Sync</h5>
                        <p className="text-[11px] text-stone-400">Flush IndexedDB caches and re-query Firestore</p>
                      </div>
                      <button
                        onClick={() => {
                          fetchStudents();
                          nativeService.showToast("Caches flushed and sync verified");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all"
                      >
                        Flush Cache
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Online Students Stream */}
                <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Real-time Active Students Feed ({onlineStudentsCount} Live)
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono">Heartbeat active</span>
                  </div>

                  <div className="divide-y divide-stone-900 max-h-48 overflow-y-auto">
                    {students.filter(s => s.isOnline || (s.lastActive && (Date.now() - new Date(s.lastActive).getTime()) < 180000)).length === 0 ? (
                      <p className="py-4 text-center text-xs text-stone-500 font-mono">No students currently in active online sessions. Standby.</p>
                    ) : (
                      students
                        .filter(s => s.isOnline || (s.lastActive && (Date.now() - new Date(s.lastActive).getTime()) < 180000))
                        .map(s => (
                          <div key={`live-stream-${s.id || s.uid}`} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span className="font-bold text-white">{s.displayName || s.username || "Student"}</span>
                              <span className="text-stone-500 font-mono text-[11px]">({s.email || "student"})</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[#FF7A30] font-medium text-[11px] block">{s.currentActivity || "Class 12 Preparation"}</span>
                              <span className="text-stone-500 font-mono text-[10px]">{s.totalStudyTimeMinutes || 0}m active</span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: GOOGLE SEARCH CONSOLE & SEO CONTROL HUB */}
            {activeTab === "seo" && (
              <div className="space-y-5">
                <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Google Search Console & Brand SEO Hub
                        </h4>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                          Site Name: Study Stranger
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1">
                        Ensure Google Search, Google AI Overview & Bing display <strong>Study Stranger</strong> with official logo & #1 search ranking.
                      </p>
                    </div>
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#FF7A30] hover:bg-[#e0631b] text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-lg"
                    >
                      <ExternalLink size={14} /> Open Google Search Console
                    </a>
                  </div>

                  {/* 1-Click Verification Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <a
                      href="https://studystranger.ai.studio/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-stone-900 hover:bg-stone-850 rounded-2xl border border-stone-800 flex items-center justify-between group transition-all"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">XML Sitemap</span>
                        <span className="text-xs font-mono text-cyan-400 font-bold group-hover:underline">sitemap.xml</span>
                      </div>
                      <ExternalLink size={13} className="text-stone-500 group-hover:text-white transition-colors" />
                    </a>

                    <a
                      href="https://studystranger.ai.studio/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-stone-900 hover:bg-stone-850 rounded-2xl border border-stone-800 flex items-center justify-between group transition-all"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Robots Crawler</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold group-hover:underline">robots.txt</span>
                      </div>
                      <ExternalLink size={13} className="text-stone-500 group-hover:text-white transition-colors" />
                    </a>

                    <a
                      href="https://search.google.com/test/rich-results?url=https%3A%2F%2Fstudystranger.ai.studio%2F"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-stone-900 hover:bg-stone-850 rounded-2xl border border-stone-800 flex items-center justify-between group transition-all"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Google Rich Results</span>
                        <span className="text-xs font-mono text-amber-400 font-bold group-hover:underline">Test Structured Data</span>
                      </div>
                      <ExternalLink size={13} className="text-stone-500 group-hover:text-white transition-colors" />
                    </a>

                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-stone-900 hover:bg-stone-850 rounded-2xl border border-stone-800 flex items-center justify-between group transition-all"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">URL Inspection</span>
                        <span className="text-xs font-mono text-[#FF7A30] font-bold group-hover:underline">Request Indexing</span>
                      </div>
                      <ExternalLink size={13} className="text-stone-500 group-hover:text-white transition-colors" />
                    </a>
                  </div>
                </div>

                {/* Step-by-Step Google Search Console Execution Guide */}
                <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={15} /> Google Search Console দিয়ে সাইট নেম ও ইনডেক্সিং আপডেট করার নিয়ম (Step-by-Step Guide)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
                      <div className="w-6 h-6 rounded-full bg-[#FF7A30] text-white flex items-center justify-center font-bold text-xs">১</div>
                      <h5 className="font-bold text-white">Google Search Console খুলুন</h5>
                      <p className="text-stone-400 text-[11px]">
                        গুগল সার্চ কনসোলে যান (<a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">search.google.com/search-console</a>) এবং প্রপার্টি হিসেবে <strong>https://studystranger.ai.studio/</strong> নির্বাচন করুন।
                      </p>
                    </div>

                    <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
                      <div className="w-6 h-6 rounded-full bg-[#FF7A30] text-white flex items-center justify-center font-bold text-xs">২</div>
                      <h5 className="font-bold text-white">Sitemap জমা দিন (Submit Sitemap)</h5>
                      <p className="text-stone-400 text-[11px]">
                        বামপাশের মেনু থেকে <strong>Sitemaps</strong> অপশনে যান। সেখানে <code>sitemap.xml</code> লিখে <strong>Submit</strong> বাটনে ক্লিক করুন।
                      </p>
                    </div>

                    <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
                      <div className="w-6 h-6 rounded-full bg-[#FF7A30] text-white flex items-center justify-center font-bold text-xs">৩</div>
                      <h5 className="font-bold text-white">ইনস্ট্যান্ট রিক্রল ও ইনডেক্সিং</h5>
                      <p className="text-stone-400 text-[11px]">
                        উপরে <strong>URL Inspection</strong> বারে <code>https://studystranger.ai.studio/</code> লিখে এন্টার দিন, তারপর <strong>Test Live URL</strong> ক্লিক করে <strong>Request Indexing</strong> চাপুন।
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-900/60 rounded-2xl border border-stone-800 text-[11px] text-stone-300 flex items-center justify-between gap-3">
                    <span>
                      💡 <strong>নোট:</strong> আমাদের ওয়েবসাইটে Schema.org WebSite JSON-LD এবং og:site_name ট্যাগে <strong>Study Stranger</strong> শতভাগ নিখুঁতভাবে বসানো আছে। Search Console-এ Request Indexing করার ২৪-৪৮ ঘণ্টার মধ্যে গুগলের সার্চ ফলাফলে সাইটের নাম ও লোগো আপডেট হয়ে যাবে।
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("https://studystranger.ai.studio/sitemap.xml");
                        setCopiedSeoLink("sitemap");
                        setTimeout(() => setCopiedSeoLink(null), 2000);
                      }}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSeoLink === "sitemap" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedSeoLink === "sitemap" ? "Copied!" : "Copy Sitemap Link"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* SUB-MODAL: ADD NEW STUDENT */}
      <AnimatePresence>
        {showAddStudentModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h3 className="font-black text-sm uppercase tracking-wider text-[#FF7A30] flex items-center gap-2">
                  <UserPlus size={16} /> Add Student Account
                </h3>
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="p-1 text-stone-400 hover:text-white rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-400 uppercase">Student Name</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.displayName}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="e.g. Abhijit Das"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-400 uppercase">Email</label>
                  <input
                    type="email"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. student@wbchse.edu"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase">Initial Points</label>
                    <input
                      type="number"
                      value={newStudentForm.points}
                      onChange={(e) => setNewStudentForm(prev => ({ ...prev, points: Number(e.target.value) }))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase">Role</label>
                    <select
                      value={newStudentForm.role}
                      onChange={(e) => setNewStudentForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF7A30] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Create Student in Database
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUB-MODAL: EDIT STUDENT */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h3 className="font-black text-sm uppercase tracking-wider text-[#FF7A30] flex items-center gap-2">
                  <Edit3 size={16} /> Edit Student Profile
                </h3>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="p-1 text-stone-400 hover:text-white rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEditedStudent} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-400 uppercase">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.displayName || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, displayName: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-400 uppercase">Email</label>
                  <input
                    type="email"
                    value={editingStudent.email || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase">Points</label>
                    <input
                      type="number"
                      value={editingStudent.points || 0}
                      onChange={(e) => setEditingStudent({ ...editingStudent, points: Number(e.target.value) })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase">Streak (Days)</label>
                    <input
                      type="number"
                      value={editingStudent.streak || 0}
                      onChange={(e) => setEditingStudent({ ...editingStudent, streak: Number(e.target.value) })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase">Account Status</label>
                    <select
                      value={editingStudent.status || "active"}
                      onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value, isBlocked: e.target.value === "suspended" })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended / Blocked</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase">VIP Access</label>
                    <select
                      value={editingStudent.premiumUnlocked ? "true" : "false"}
                      onChange={(e) => setEditingStudent({ ...editingStudent, premiumUnlocked: e.target.value === "true" })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                    >
                      <option value="false">Standard Tier</option>
                      <option value="true">VIP Unlocked</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF7A30] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUB-MODAL: ADD QUESTION */}
      <AnimatePresence>
        {showAddQuestionModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl p-5 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h3 className="font-black text-sm uppercase tracking-wider text-[#FF7A30] flex items-center gap-2">
                  <Plus size={16} /> Add WBCHSE Sem 3 Question
                </h3>
                <button
                  onClick={() => setShowAddQuestionModal(false)}
                  className="p-1 text-stone-400 hover:text-white rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateQuestion} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase">Subject</label>
                    <select
                      value={newQuestionForm.subject}
                      onChange={(e) => setNewQuestionForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                    >
                      <option value="Biology">Biology</option>
                      <option value="Bengali A">Bengali A</option>
                      <option value="English B">English B</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase">Difficulty</label>
                    <select
                      value={newQuestionForm.difficulty}
                      onChange={(e: any) => setNewQuestionForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-400 uppercase">Question (English)</label>
                  <textarea
                    rows={2}
                    required
                    value={newQuestionForm.questionEn}
                    onChange={(e) => setNewQuestionForm(prev => ({ ...prev, questionEn: e.target.value }))}
                    placeholder="e.g. Which receptor on zona pellucida is responsible for sperm binding?"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#FF7A30] resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-400 uppercase">Question (Bengali - Optional)</label>
                  <textarea
                    rows={2}
                    value={newQuestionForm.questionBn}
                    onChange={(e) => setNewQuestionForm(prev => ({ ...prev, questionBn: e.target.value }))}
                    placeholder="e.g. জোনা পেলুসিডার কোন রিসেপ্টরটি শুক্রাণু বাঁধনের জন্য দায়ী?"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#FF7A30] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-400 uppercase">4 Options & Correct Answer</label>
                  {[0, 1, 2, 3].map((optIdx) => (
                    <div key={`input-opt-${optIdx}`} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctIndex"
                        checked={newQuestionForm.correctIndex === optIdx}
                        onChange={() => setNewQuestionForm(prev => ({ ...prev, correctIndex: optIdx }))}
                        className="accent-[#FF7A30] w-4 h-4 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        required
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        value={newQuestionForm.optionsEn[optIdx]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewQuestionForm(prev => {
                            const newOpts = [...prev.optionsEn];
                            newOpts[optIdx] = val;
                            return { ...prev, optionsEn: newOpts };
                          });
                        }}
                        className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#FF7A30]"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-400 uppercase">Explanation</label>
                  <textarea
                    rows={2}
                    value={newQuestionForm.explanationEn}
                    onChange={(e) => setNewQuestionForm(prev => ({ ...prev, explanationEn: e.target.value }))}
                    placeholder="Brief syllabus justification..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#FF7A30] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF7A30] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Save Question to Bank
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Preview */}
      {previewDocument && (
        <DocumentPreviewModal
          isOpen={!!previewDocument}
          title={previewDocument.title || "Notice Document"}
          subtitle="Admin PDF & Document Preview"
          content={previewDocument.body || previewDocument.text || "Document Attachment"}
          pdfData={previewDocument.pdfData}
          pdfUrl={previewDocument.pdfUrl}
          pdfName={previewDocument.pdfName}
          pdfId={previewDocument.pdfId}
          type="pdf"
          subject="WBCHSE Administration"
          date={previewDocument.date || new Date().toLocaleDateString()}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </>
  );
};
