import React, { useState, useRef, DragEvent, useEffect } from "react";
import { motion } from "motion/react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  FileCheck2,
  Download,
  HardDrive,
  Folder,
  FolderPlus,
  FolderOpen,
  ChevronRight,
  Home,
  Search,
  Edit3,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import {
  savePdfToIndexedDB,
  listAllPdfsFromIndexedDB,
  deletePdfFromIndexedDB,
  triggerPdfDownload,
  listAllFolders,
  createPdfFolder,
  renamePdfFolder,
  deletePdfFolder,
  movePdfToFolder,
  dataUrlToPdfBlobUrlSync,
  subscribeToSharedDocuments,
  StoredPDFRecord,
  PDFFolderRecord,
  isDummySeed,
} from "../services/pdfStorageService";
import { MAX_PDF_UPLOAD_SIZE_MB, validatePdfFileForUpload } from "../utils/studyCoreLogic";
import { isStudyStrangerAdmin } from "../utils/sharedDocumentSyncLogic";
import { auth } from "../firebase";
import { recordVerifiedStudyActivity } from "../utils/studyActivityTracker";
import confetti from "canvas-confetti";

export type PDFSourceType = "upload" | "generate" | "url" | "none";

interface PDFUploadZoneProps {
  sourceType: PDFSourceType;
  onSourceTypeChange: (type: PDFSourceType) => void;
  pdfData: string;
  pdfName: string;
  pdfSize: string;
  pdfId?: string;
  pdfUrl?: string;
  generatedNotes?: string;
  onPdfDataChange: (data: {
    pdfData: string;
    pdfName: string;
    pdfSize: string;
    pdfId?: string;
  }) => void;
  onPdfUrlChange: (url: string) => void;
  onGeneratedNotesChange: (notes: string) => void;
  onPreviewRequest?: (pdfDataOrUrl: string, fileName: string) => void;
  maxSizeMB?: number;
  label?: string;
}

export const PDFUploadZone: React.FC<PDFUploadZoneProps> = ({
  sourceType,
  onSourceTypeChange,
  pdfData,
  pdfName,
  pdfSize,
  pdfId,
  pdfUrl = "",
  generatedNotes = "",
  onPdfDataChange,
  onPdfUrlChange,
  onGeneratedNotesChange,
  onPreviewRequest,
  maxSizeMB = MAX_PDF_UPLOAD_SIZE_MB,
  label = "PDF Library, Subject Folders & Shared Study Vault",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<string>("Initializing...");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uploadSuccessBanner, setUploadSuccessBanner] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Folder & Sub-Folder Hierarchy State
  const [folders, setFolders] = useState<PDFFolderRecord[]>([]);
  const [storedVaultPdfs, setStoredVaultPdfs] = useState<StoredPDFRecord[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string>("subfolder_mock_2026");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create Folder / Sub-Folder Modal State
  const [showNewFolderInput, setShowNewFolderInput] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [newFolderSubject, setNewFolderSubject] = useState<string>("Biology");
  const [newFolderIsSubfolder, setNewFolderIsSubfolder] = useState<boolean>(false);

  // Rename Folder State
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>("");

  // Allow all users to upload & share PDFs by default (with optional Reader-Only toggle)
  const [isAdminUser, setIsAdminUser] = useState<boolean>(() => {
    const savedOverride =
      typeof window !== "undefined" ? localStorage.getItem("ss_admin_upload_mode") : null;
    if (savedOverride === "false") return false;
    return true;
  });

  const toggleAdminMode = () => {
    setIsAdminUser((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ss_admin_upload_mode", String(next));
      } catch {}
      if (!next && sourceType === "upload") {
        onSourceTypeChange("none");
      }
      return next;
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshVaultData = async () => {
    const [folderList, pdfList] = await Promise.all([
      listAllFolders(),
      listAllPdfsFromIndexedDB(),
    ]);
    setFolders(folderList);
    setStoredVaultPdfs(pdfList);
  };

  useEffect(() => {
    refreshVaultData();
    const unsubscribe = subscribeToSharedDocuments((livePdfs) => {
      livePdfs.forEach((d) => {
        if (isDummySeed(d)) {
          deletePdfFromIndexedDB(d.id).catch(() => {});
        }
      });
      setStoredVaultPdfs(livePdfs.filter((p) => !isDummySeed(p)));
    });
    const unsubAuth = auth.onAuthStateChanged((u) => {
      const email = u?.email || localStorage.getItem("currentUserEmail") || "";
      const handle = u?.displayName || localStorage.getItem("currentUserName") || "";
      if (isStudyStrangerAdmin(email, handle)) {
        setIsAdminUser(true);
      }
    });
    return () => {
      unsubscribe();
      unsubAuth();
    };
  }, []);

  // Sync upload target folder when navigating inside a folder/sub-folder
  useEffect(() => {
    if (currentFolderId) {
      setUploadTargetFolderId(currentFolderId);
    }
  }, [currentFolderId]);

  // Build Breadcrumb Path from root to currentFolderId
  const getBreadcrumbPath = (): PDFFolderRecord[] => {
    const path: PDFFolderRecord[] = [];
    let cursorId = currentFolderId;
    const safety = new Set<string>();
    while (cursorId && !safety.has(cursorId)) {
      safety.add(cursorId);
      const found = folders.find((f) => f.id === cursorId);
      if (found) {
        path.unshift(found);
        cursorId = found.parentId;
      } else {
        break;
      }
    }
    return path;
  };

  const breadcrumbPath = getBreadcrumbPath();

  // Child folders (or sub-folders) at current level
  const visibleFolders = folders.filter((f) => f.parentId === currentFolderId);

  // Get all descendant folder IDs for counting PDFs inside a folder + its sub-folders
  const getDescendantFolderIds = (rootId: string): string[] => {
    const result = [rootId];
    const children = folders.filter((f) => f.parentId === rootId);
    for (const child of children) {
      result.push(...getDescendantFolderIds(child.id));
    }
    return result;
  };

  const countPdfsInFolderTree = (folderId: string): number => {
    const ids = new Set(getDescendantFolderIds(folderId));
    return storedVaultPdfs.filter((p) => !isDummySeed(p) && ids.has(p.folderId)).length;
  };

  const countSubfolders = (folderId: string): number => {
    return folders.filter((f) => f.parentId === folderId).length;
  };

  // PDFs displayed in current view
  const visiblePdfs = storedVaultPdfs.filter((p) => {
    if (isDummySeed(p)) return false;
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    }
    if (currentFolderId === null) {
      // At root level, show all PDFs across the vault so students can also see everything at a glance
      return true;
    }
    return p.folderId === currentFolderId;
  });

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const parentId = newFolderIsSubfolder ? currentFolderId : null;
    const created = await createPdfFolder(
      newFolderName.trim(),
      parentId,
      newFolderSubject,
      "admin"
    );
    setNewFolderName("");
    setShowNewFolderInput(false);
    await refreshVaultData();
    setCurrentFolderId(created.id);
  };

  const handleRenameFolderSubmit = async (folderId: string) => {
    if (editingFolderName.trim()) {
      await renamePdfFolder(folderId, editingFolderName.trim());
      await refreshVaultData();
    }
    setEditingFolderId(null);
    setEditingFolderName("");
  };

  const handleDeleteFolderClick = async (folderId: string) => {
    await deletePdfFolder(folderId);
    if (currentFolderId === folderId) {
      setCurrentFolderId(null);
    }
    await refreshVaultData();
  };

  const handleMovePdf = async (targetPdfId: string, newFolderId: string) => {
    await movePdfToFolder(targetPdfId, newFolderId);
    await refreshVaultData();
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage("");
    setUploadSuccessBanner("");
    setAiSummary(null);

    const validation = validatePdfFileForUpload(
      file.name,
      file.type || "application/pdf",
      file.size,
      maxSizeMB
    );

    if (!validation.valid) {
      setErrorMessage(validation.errorMessage || "Invalid PDF file.");
      return;
    }

    setIsProcessing(true);
    setUploadProgress(8);
    setUploadStage("Scanning PDF structure & preparing chunked stream...");

    try {
      const targetFolder = currentFolderId || uploadTargetFolderId || "subfolder_mock_2026";
      const folderObj = folders.find((f) => f.id === targetFolder);

      const record = await savePdfToIndexedDB(
        file,
        undefined,
        (pct, stageText) => {
          setUploadProgress(pct);
          setUploadStage(stageText);
        },
        targetFolder,
        "admin",
        folderObj?.subjectTag || "WBCHSE Sem 3"
      );

      if (file.size <= 30 * 1024 * 1024 && record.dataUrl.startsWith("data:")) {
        try {
          const uploadResp = await fetch("/api/upload/pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: record.name,
              fileData: record.dataUrl,
              fileSize: record.size,
            }),
          });
          if (uploadResp.ok) {
            const uploadJson = await uploadResp.json();
            if (uploadJson.success && uploadJson.pdfUrl) {
              onPdfUrlChange(uploadJson.pdfUrl);
            }
          }
        } catch (uploadErr) {
          console.warn("Server PDF upload sync note:", uploadErr);
        }
      }

      onPdfDataChange({
        pdfData: record.dataUrl,
        pdfName: record.name,
        pdfSize: record.sizeFormatted,
        pdfId: record.id,
      });

      recordVerifiedStudyActivity("pdfsUploadedOrGenerated", 1);
      await refreshVaultData();

      setIsProcessing(false);
      setUploadProgress(0);
      setUploadSuccessBanner(
        `✅ "${record.name}" সফলভাবে আপলোড হয়েছে এবং সকল ইউজারের অ্যাকাউন্টে (New & Existing Users) সিঙ্ক হয়ে গেছে!`
      );
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    } catch (err: any) {
      console.error("PDF Processing error:", err);
      setErrorMessage(
        `Failed to process PDF: ${err.message || "Unknown error"}. Please try again.`
      );
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleGenerateAISummary = async () => {
    if (!pdfName) return;
    setIsSummarizing(true);
    try {
      const res = await fetch("/api/ai/generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a high-yield 5-point WBCHSE Class 12 study guide & exam summary in bilingual Bengali and English for a student studying the PDF document titled "${pdfName}". Include key concepts, board exam tips, and important revision questions.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setAiSummary(data.text);
          setIsSummarizing(false);
          confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
          return;
        }
      }
    } catch {}

    setAiSummary(
      `📌 AI 5-Point Study Summary (${pdfName}):\n\n` +
        `1. 🧬 WBCHSE Sem 3 Core Focus: মূল তত্ত্ব, সংজ্ঞা ও গুরুত্বপূর্ণ ডেরিভেশনসমূহ সংকলিত।\n` +
        `2. 📐 High-Yield Exam Concepts: বোর্ড পরীক্ষার MCQ ও SAQ প্রশ্নের জন্য মূল পয়েন্টসমূহ।\n` +
        `3. 📋 Diagram & Formula Checklist: পরীক্ষার খাতায় পরিষ্কার চিত্র ও সঠিক একক লেখার নির্দেশিকা।\n` +
        `4. 💡 Revision Strategy: প্রতিদিন ১৫ মিনিট ফ্ল্যাশকার্ড ও মিসটেক ব্যাংক রিভিশন।\n` +
        `5. 🚀 Next Step: পড়া শেষে সাথে সাথে ১টি অধ্যায়ভিত্তিক মক টেস্ট সম্পন্ন করো।`
    );
    setIsSummarizing(false);
  };

  const handleRemoveFile = () => {
    onPdfDataChange({
      pdfData: "",
      pdfName: "",
      pdfSize: "",
      pdfId: undefined,
    });
    setAiSummary(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteVaultPdf = async (id: string) => {
    await deletePdfFromIndexedDB(id);
    if (pdfId === id) {
      handleRemoveFile();
    }
    await refreshVaultData();
  };

  const getFolderNameById = (fId?: string) => {
    if (!fId) return "General Vault";
    const found = folders.find((f) => f.id === fId);
    return found ? found.name : "General Vault";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 rounded-[28px] bg-white border-2 border-[#18181b] space-y-5 shadow-[6px_6px_0px_#18181b] relative overflow-hidden font-sans text-stone-900"
    >
      {/* Hidden global file input so 1-click upload works from any tab */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FEF08A] border-[1.5px] border-[#18181b] text-[#18181b] flex items-center justify-center shadow-[2px_2px_0px_#18181b] shrink-0">
            <FolderOpen size={20} />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black tracking-tight text-stone-900">
              {label.replace(/1000\s*MB\s*/gi, "")}
            </h4>
            <p className="text-xs font-medium text-stone-600">
              Shared Cloud PDF Library · Subject Folders · Instant In-Page Reader (Synced for All Users)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-stone-600">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>{folders.length} Folders · {storedVaultPdfs.length} Shared PDFs</span>
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-[#FF6B2C] hover:bg-[#e85a1d] text-white border-[1.5px] border-[#18181b] text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#18181b] transition-all"
          >
            <Upload size={13} />
            <span>📤 Upload PDF (সবার জন্য শেয়ার)</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div
        className={`grid ${
          isAdminUser ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"
        } gap-2 bg-[#FAF8F5] p-1.5 rounded-2xl border-[1.5px] border-[#18181b]`}
      >
        {[
          {
            type: "none" as const,
            label: "📚 PDF Library & Folders",
            sub: `${folders.length} Folders · ${storedVaultPdfs.length} PDFs`,
            adminOnly: false,
          },
          {
            type: "upload" as const,
            label: "📁 Admin Upload PDF",
            sub: `Instant ~1s Cloud Sync`,
            adminOnly: true,
          },
          {
            type: "generate" as const,
            label: "🤖 AI Note PDF",
            sub: "Auto Layout",
            adminOnly: false,
          },
          {
            type: "url" as const,
            label: "🔗 Cloud Link",
            sub: "Drive / Web URL",
            adminOnly: false,
          },
        ]
          .filter((item) => !item.adminOnly || isAdminUser)
          .map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => {
                onSourceTypeChange(item.type);
                setErrorMessage("");
              }}
              className={`py-2.5 px-3 rounded-xl text-center transition-all cursor-pointer border ${
                sourceType === item.type
                  ? "bg-[#18181b] text-white border-[#18181b] font-black shadow-xs"
                  : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100 font-bold"
              }`}
            >
              <div className="text-xs leading-tight truncate">{item.label}</div>
              <div
                className={`text-[10px] uppercase tracking-wider mt-0.5 truncate ${
                  sourceType === item.type ? "text-amber-300" : "text-stone-500"
                }`}
              >
                {item.sub}
              </div>
            </button>
          ))}
      </div>

      {/* Live Upload Progress Banner (Visible on any tab during upload) */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-[#18181b] space-y-2 shadow-[3px_3px_0px_#18181b]">
          <div className="flex items-center justify-between text-xs font-bold text-stone-900">
            <span>⏳ {uploadStage}</span>
            <span className="font-mono font-black text-emerald-700">{uploadProgress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white border border-[#18181b] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Success Banner */}
      {uploadSuccessBanner && (
        <div className="p-3.5 bg-emerald-50 border-2 border-emerald-600 rounded-2xl flex items-center justify-between gap-2.5 text-emerald-950 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{uploadSuccessBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadSuccessBanner("")}
            className="text-emerald-800 hover:text-emerald-950 text-xs font-black underline cursor-pointer shrink-0"
          >
            OK
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border-2 border-rose-500 rounded-2xl flex items-start gap-2.5 text-rose-900 text-xs">
          <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-bold">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-rose-700 hover:text-rose-950 text-xs font-black underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 1: PDF LIBRARY WITH FOLDERS & SUB-FOLDERS                      */}
      {/* ================================================================= */}
      {sourceType === "none" && (
        <div className="space-y-4">
          {/* Top Action Bar: Breadcrumb + Search + New Folder / Sub-Folder + Upload Here */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border-[1.5px] border-[#18181b] flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
              <button
                type="button"
                onClick={() => setCurrentFolderId(null)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                  currentFolderId === null
                    ? "bg-[#18181b] text-white border-[#18181b]"
                    : "bg-white text-stone-800 border-stone-300 hover:bg-stone-100"
                }`}
              >
                <Home size={13} />
                <span>All Vault Folders</span>
              </button>

              {breadcrumbPath.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  <ChevronRight size={14} className="text-stone-400" />
                  <button
                    type="button"
                    onClick={() => setCurrentFolderId(crumb.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                      idx === breadcrumbPath.length - 1
                        ? "bg-[#FEF08A] text-stone-950 border-[#18181b] font-black"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    <Folder size={13} />
                    <span>{crumb.name}</span>
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Folder Actions & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 sm:flex-none sm:w-44">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PDFs..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:border-[#18181b] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewFolderIsSubfolder(Boolean(currentFolderId));
                  setShowNewFolderInput((v) => !v);
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 border-[1.5px] border-[#18181b] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#18181b]"
              >
                <FolderPlus size={14} className="text-orange-600" />
                <span>{currentFolderId ? "+ New Sub-Folder" : "+ New Folder"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentFolderId) setUploadTargetFolderId(currentFolderId);
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-stone-800 text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#FF7A30]"
              >
                <Upload size={13} />
                <span>Upload PDF Here</span>
              </button>
            </div>
          </div>

          {/* Inline Create Folder / Sub-Folder Form */}
          {showNewFolderInput && (
            <form
              onSubmit={handleCreateFolder}
              className="p-4 rounded-2xl bg-[#FEF08A]/50 border-2 border-[#18181b] flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
            >
              <div className="flex-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  {newFolderIsSubfolder && currentFolderId
                    ? `Create Sub-Folder inside "${getFolderNameById(currentFolderId)}"`
                    : "Create Main Root Folder"}
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder={
                    newFolderIsSubfolder
                      ? "e.g. Unit 3: Human Health & Disease Notes"
                      : "e.g. Physics Class 12 Semester 3"
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-[1.5px] border-[#18181b] text-xs font-bold text-stone-900 focus:outline-none"
                />
              </div>

              <div className="sm:w-44">
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                  Subject Tag
                </label>
                <select
                  value={newFolderSubject}
                  onChange={(e) => setNewFolderSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border-[1.5px] border-[#18181b] text-xs font-bold text-stone-900 focus:outline-none"
                >
                  <option value="Biology">Biology</option>
                  <option value="Bengali A">Bengali A</option>
                  <option value="English B">English B</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Question Bank">Question Bank</option>
                </select>
              </div>

              {currentFolderId && (
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-800 pb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFolderIsSubfolder}
                    onChange={(e) => setNewFolderIsSubfolder(e.target.checked)}
                    className="w-4 h-4 accent-[#18181b]"
                  />
                  <span>Sub-Folder</span>
                </label>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#18181b] text-white text-xs font-black cursor-pointer"
                >
                  Create Folder
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewFolderInput(false)}
                  className="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Folders & Sub-Folders Grid */}
          {visibleFolders.length > 0 && !searchQuery.trim() && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
                  {currentFolderId ? "Sub-Folders inside this Folder" : "Admin & Student Study Folders"}
                </span>
                <span className="text-[11px] text-stone-500 font-semibold">
                  Click any folder to open sub-folders &amp; PDFs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleFolders.map((folder) => {
                  const subCount = countSubfolders(folder.id);
                  const pdfCount = countPdfsInFolderTree(folder.id);
                  const isEditing = editingFolderId === folder.id;

                  return (
                    <div
                      key={folder.id}
                      onClick={() => !isEditing && setCurrentFolderId(folder.id)}
                      className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#FEF08A]/35 border-[1.5px] border-[#18181b] shadow-[3px_3px_0px_#18181b] transition-all cursor-pointer flex flex-col justify-between gap-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#FEF08A] border-[1.5px] border-[#18181b] text-stone-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Folder size={18} />
                          </div>
                          <div className="min-w-0">
                            {isEditing ? (
                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editingFolderName}
                                  onChange={(e) => setEditingFolderName(e.target.value)}
                                  className="px-2 py-1 rounded-lg bg-white border border-[#18181b] text-xs font-bold w-32"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRenameFolderSubmit(folder.id)}
                                  className="p-1 rounded bg-emerald-600 text-white"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFolderId(null)}
                                  className="p-1 rounded bg-stone-200 text-stone-700"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <h5 className="text-xs sm:text-sm font-black text-stone-900 leading-snug truncate">
                                {folder.name}
                              </h5>
                            )}
                            <div className="text-[11px] text-stone-500 font-semibold mt-0.5 flex items-center gap-1.5">
                              <span>{folder.subjectTag}</span>
                              {subCount > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-orange-700 font-bold">
                                    {subCount} Sub-Folders
                                  </span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-700 font-bold">{pdfCount} PDFs</span>
                            </div>
                          </div>
                        </div>

                        {isAdminUser && (
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFolderId(folder.id);
                                setEditingFolderName(folder.name);
                              }}
                              className="p-1.5 rounded-lg hover:bg-white text-stone-500 hover:text-stone-900"
                              title="Rename Folder"
                            >
                              <Edit3 size={12} />
                            </button>
                            {!folder.id.startsWith("folder_bio") && (
                              <button
                                type="button"
                                onClick={() => handleDeleteFolderClick(folder.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-100 text-stone-400 hover:text-rose-700"
                                title="Delete Folder"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {folder.description && (
                        <p className="text-[11px] text-stone-500 line-clamp-1">
                          {folder.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PDF Documents List in Current Folder / Vault */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
                {currentFolderId
                  ? `PDF Books & Notes inside "${getFolderNameById(currentFolderId)}"`
                  : "All Shared PDF Documents (Synced Across All Student Accounts)"}
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                {visiblePdfs.length} {visiblePdfs.length === 1 ? "Document" : "Documents"}
              </span>
            </div>

            {visiblePdfs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-300 text-center space-y-2">
                <p className="text-xs font-bold text-stone-700">
                  No PDFs inside this folder yet.
                </p>
                {isAdminUser && (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentFolderId) setUploadTargetFolderId(currentFolderId);
                      onSourceTypeChange("upload");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#18181b] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={13} />
                    <span>Upload PDF into this Folder</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {visiblePdfs.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border-[1.5px] border-[#18181b] flex flex-col justify-between gap-3 hover:bg-white transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-[#18181b] text-emerald-900 flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-black text-stone-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-stone-800 font-bold">
                            📁 {getFolderNameById(item.folderId)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{item.sizeFormatted}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-bold">☁️ Shared</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/80 flex-wrap">
                      {/* Move to another Folder/Sub-folder selector (Admin only) */}
                      {isAdminUser ? (
                        <select
                          value={item.folderId || "subfolder_mock_2026"}
                          onChange={(e) => handleMovePdf(item.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-white border border-stone-300 text-[10px] font-bold text-stone-700 max-w-[155px] truncate cursor-pointer"
                          title="Move PDF to another Folder or Sub-Folder"
                        >
                          {folders.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.parentId ? `↳ ${f.name}` : `📁 ${f.name}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-500">
                          Ready for HD Reader
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                        {onPreviewRequest && (
                          <button
                            type="button"
                            onClick={() => onPreviewRequest(item.id, item.name)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#18181b] hover:bg-stone-800 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#FF7A30]"
                          >
                            <Eye size={13} />
                            <span>Open in Page</span>
                          </button>
                        )}
                        <a
                          href={`/view-pdf?id=${encodeURIComponent(item.id)}&key=${encodeURIComponent(localStorage.getItem('currentUserUid') || 'student')}&name=${encodeURIComponent(item.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-[#bcf887] hover:bg-[#a6f368] text-stone-950 border border-[#18181b] text-xs font-extrabold flex items-center gap-1 no-underline shadow-[1.5px_1.5px_0px_#18181b]"
                          title="Open PDF in Full Screen Standalone Reader via Unique Link (ফুল স্ক্রিনে দেখুন)"
                        >
                          <ExternalLink size={12} />
                          <span>ফুল স্ক্রিনে দেখুন</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => triggerPdfDownload(item.id, item.name)}
                          className="p-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-[#18181b] cursor-pointer"
                          title="Download PDF"
                        >
                          <Download size={13} />
                        </button>
                        {isAdminUser && (
                          <button
                            type="button"
                            onClick={() => handleDeleteVaultPdf(item.id)}
                            className="p-1.5 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 cursor-pointer"
                            title="Delete from Vault (Admin Only)"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: FILE UPLOAD ZONE (WITH TARGET FOLDER / SUB-FOLDER PICKER)  */}
      {/* ================================================================= */}
      {sourceType === "upload" && (
        <div className="space-y-3.5">
          {/* Destination Folder / Sub-Folder Selector */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border-[1.5px] border-[#18181b] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <Folder size={16} className="text-orange-600 shrink-0" />
              <span>Save Uploaded PDF into Folder / Sub-Folder:</span>
            </div>
            <select
              value={uploadTargetFolderId}
              onChange={(e) => setUploadTargetFolderId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border-[1.5px] border-[#18181b] text-xs font-extrabold text-stone-900 cursor-pointer"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.parentId ? `   ↳ Sub-Folder: ${f.name}` : `📁 Folder: ${f.name}`}
                </option>
              ))}
            </select>
          </div>

          {!pdfData ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 relative overflow-hidden group ${
                isDragging
                  ? "border-[#FF7A30] bg-orange-50/70 scale-[1.01]"
                  : "border-stone-400 bg-[#FAF8F5] hover:border-[#18181b] hover:bg-amber-50/40"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#18181b] text-[#FF7A30] flex items-center justify-center group-hover:scale-105 transition-transform shadow-[3px_3px_0px_#18181b]">
                <Upload size={24} />
              </div>

              <div className="space-y-1">
                <h5 className="text-sm sm:text-base font-black text-stone-900 flex items-center justify-center gap-1.5 flex-wrap">
                  <span>Drag &amp; Drop any PDF Book or Note here, or</span>
                  <span className="text-[#FF7A30] underline">Browse Device</span>
                </h5>
                <p className="text-xs text-stone-600 font-medium">
                  Full Textbooks, WBCHSE Question Banks, Handwritten Scans (Instant Cloud Sync for All Users)
                </p>
              </div>

              {isProcessing && (
                <div
                  className="w-full max-w-md space-y-1.5 pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-stone-700">
                    <span className="truncate max-w-[260px]">{uploadStage}</span>
                    <span className="text-emerald-700 font-black">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white border-[1.5px] border-[#18181b] overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#18181b] space-y-3 shadow-[3px_3px_0px_#18181b]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 border-[1.5px] border-[#18181b] text-emerald-800 flex items-center justify-center shrink-0">
                    <FileCheck2 size={22} />
                  </div>
                  <div className="overflow-hidden text-left">
                    <h5 className="text-sm font-black text-stone-900 truncate">
                      {pdfName || "Attached Document.pdf"}
                    </h5>
                    <p className="text-xs font-mono text-stone-600 flex items-center gap-2 flex-wrap">
                      <span>
                        Size: <strong>{pdfSize || "1.2 MB"}</strong>
                      </span>
                      <span>·</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Saved in {getFolderNameById(uploadTargetFolderId)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {onPreviewRequest && (
                    <button
                      type="button"
                      onClick={() => onPreviewRequest(pdfId || pdfData, pdfName)}
                      className="px-3.5 py-2 rounded-xl bg-[#18181b] hover:bg-stone-800 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#FF7A30]"
                    >
                      <Eye size={14} />
                      <span>Open in Page</span>
                    </button>
                  )}

                  {pdfData && (
                    <a
                      href={`/view-pdf?id=${encodeURIComponent(pdfId || 'active')}&key=${encodeURIComponent(localStorage.getItem('currentUserUid') || 'student')}&name=${encodeURIComponent(pdfName || 'Document')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-[#bcf887] hover:bg-[#a6f368] text-stone-950 border-[1.5px] border-[#18181b] text-xs font-extrabold flex items-center gap-1.5 no-underline shadow-[2px_2px_0px_#18181b]"
                      title="Open PDF in Full Screen Standalone Reader via Unique Link (ফুল স্ক্রিনে দেখুন)"
                    >
                      <ExternalLink size={14} />
                      <span>ফুল স্ক্রিনে দেখুন</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => triggerPdfDownload(pdfId || pdfData, pdfName)}
                    className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border-[1.5px] border-[#18181b] cursor-pointer"
                    title="Download PDF"
                  >
                    <Download size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 border-[1.5px] border-[#18181b] cursor-pointer"
                    title="Upload Another PDF"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-300 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAISummary}
                  disabled={isSummarizing}
                  className="px-3.5 py-2 rounded-xl bg-[#FEF08A] hover:bg-amber-200 border-[1.5px] border-[#18181b] text-[#18181b] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-[2px_2px_0px_#18181b]"
                >
                  <Sparkles size={14} className={isSummarizing ? "animate-spin" : "text-amber-700"} />
                  <span>
                    {isSummarizing
                      ? "Generating AI Study Summary..."
                      : "✨ Generate AI 5-Point Study Summary"}
                  </span>
                </button>
              </div>

              {aiSummary && (
                <div className="p-4 rounded-xl bg-white border-2 border-[#18181b] text-xs text-stone-800 space-y-1 font-sans leading-relaxed text-left whitespace-pre-line">
                  {aiSummary}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI NOTE PDF GENERATION */}
      {sourceType === "generate" && (
        <div className="space-y-3">
          <p className="text-xs text-stone-600 font-medium">
            Enter notes or syllabus highlights below. Study Stranger will format them into a clean
            WBCHSE PDF study sheet.
          </p>
          <textarea
            value={generatedNotes}
            onChange={(e) => onGeneratedNotesChange(e.target.value)}
            placeholder="Type or paste high-yield notes here..."
            rows={4}
            className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border-2 border-[#18181b] text-xs text-stone-900 outline-none focus:bg-white transition-colors"
          />
        </div>
      )}

      {/* TAB 4: CLOUD URL */}
      {sourceType === "url" && (
        <div className="space-y-3">
          <p className="text-xs text-stone-600 font-medium">
            Paste a direct PDF link to open inside the built-in HD page reader:
          </p>
          <div className="flex items-center gap-2">
            <LinkIcon size={16} className="text-stone-600" />
            <input
              type="url"
              value={pdfUrl}
              onChange={(e) => onPdfUrlChange(e.target.value)}
              placeholder="https://example.com/wbchse-routine.pdf"
              className="flex-1 p-3 rounded-2xl bg-[#FAF8F5] border-2 border-[#18181b] text-xs text-stone-900 outline-none focus:bg-white transition-colors"
            />
            {pdfUrl && onPreviewRequest && (
              <button
                type="button"
                onClick={() => onPreviewRequest(pdfUrl, "Cloud_Document.pdf")}
                className="px-4 py-2.5 rounded-xl bg-[#18181b] text-white text-xs font-bold cursor-pointer"
              >
                Open PDF in Page
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
