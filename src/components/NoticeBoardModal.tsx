import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Megaphone, 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Pin, 
  Search, 
  Sparkles, 
  Plus, 
  ShieldAlert, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  ExternalLink,
  BookOpen
} from "lucide-react";
import { db } from "../firebase";
import { collection, onSnapshot, query, deleteDoc, doc } from "firebase/firestore";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { 
  getPdfFromIndexedDB, 
  triggerPdfDownload 
} from "../services/pdfStorageService";
import { nativeService } from "../services/nativeService";
import { DEFAULT_WBCHSE_NOTICES } from "../data/wbchseNoticesData";

export interface NoticeItem {
  id: string;
  title?: string;
  text: string;
  category?: string;
  timestamp: string;
  author?: string;
  pdfData?: string;
  pdfName?: string;
  pdfUrl?: string;
  pdfSize?: string;
  pdfId?: string;
  isPinned?: boolean;
}

interface NoticeBoardModalProps {
  onClose: () => void;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

export const NoticeBoardModal: React.FC<NoticeBoardModalProps> = ({
  onClose,
  isAdmin = false,
  onOpenAdminPanel
}) => {
  const [notices, setNotices] = useState<NoticeItem[]>(DEFAULT_WBCHSE_NOTICES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [previewItem, setPreviewItem] = useState<{
    title: string;
    pdfData?: string;
    pdfUrl?: string;
    pdfName?: string;
    text?: string;
    category?: string;
    timestamp?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, "announcements"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreItems: NoticeItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        } as NoticeItem));

        // Combine Firestore custom notices with default official notices (preventing duplicates)
        const combined = [...firestoreItems];
        DEFAULT_WBCHSE_NOTICES.forEach(def => {
          if (!combined.some(item => item.id === def.id || (item.title && item.title === def.title))) {
            combined.push(def);
          }
        });

        // Sort: Pinned first, then by timestamp desc
        combined.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
        });

        setNotices(combined);
        setLoading(false);
      }, (err) => {
        console.warn("Firestore announcements read note, using official default notices:", err);
        setNotices(DEFAULT_WBCHSE_NOTICES);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Announcements subscription note:", e);
      setNotices(DEFAULT_WBCHSE_NOTICES);
      setLoading(false);
    }
  }, []);

  const handleDeleteNotice = async (id: string) => {
    if (!isAdmin) return;
    if (confirm("Are you sure you want to delete this notice?")) {
      try {
        await deleteDoc(doc(db, "announcements", id));
        nativeService.showToast("Notice deleted successfully");
      } catch (err) {
        console.error("Delete notice error:", err);
      }
    }
  };

  const handleOpenPreview = async (notice: NoticeItem) => {
    let activePdfData = notice.pdfData || "";
    if (!activePdfData && notice.pdfId) {
      const rec = await getPdfFromIndexedDB(notice.pdfId);
      if (rec) {
        activePdfData = rec.dataUrl;
      }
    }

    setPreviewItem({
      title: notice.title || notice.pdfName || "Notice Document",
      pdfData: activePdfData,
      pdfUrl: notice.pdfUrl,
      pdfName: notice.pdfName,
      text: notice.text,
      category: notice.category,
      timestamp: notice.timestamp
    });
  };

  const handleDownloadPdf = async (notice: NoticeItem) => {
    let activePdfData = notice.pdfData || "";
    if (!activePdfData && notice.pdfId) {
      const rec = await getPdfFromIndexedDB(notice.pdfId);
      if (rec) {
        activePdfData = rec.dataUrl;
      }
    }

    const downloadTarget = activePdfData || notice.pdfUrl;
    if (downloadTarget) {
      triggerPdfDownload(downloadTarget, notice.pdfName || `${notice.title || "WBCHSE_Notice"}.pdf`);
      nativeService.showToast(`Downloading: ${notice.pdfName || "Notice PDF"}`);
    } else {
      nativeService.showToast("No PDF binary available for download");
    }
  };

  const categories = ["All", "Exam Alert", "Study Material", "WBCHSE Sem 3", "Urgent", "Class Notice"];

  const filteredNotices = notices.filter(n => {
    const matchesSearch = 
      (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.text && n.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.category && n.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "All" || n.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xl"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white dark:bg-stone-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200 dark:border-stone-800"
        >
          {/* Header */}
          <div className="p-5 sm:p-7 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FF7A30]/15 text-[#FF7A30] flex items-center justify-center shadow-xs">
                <Megaphone size={26} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                    Notice & Bulletin Board
                  </h2>
                  <span className="text-[10px] bg-orange-100 dark:bg-orange-950/60 text-[#FF7A30] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {notices.length} Live
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold mt-1.5 flex items-center gap-1.5">
                  <span>WBCHSE Sem 3 Announcements & Official PDF Notes</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && onOpenAdminPanel && (
                <button 
                  onClick={() => {
                    onClose();
                    onOpenAdminPanel();
                  }}
                  className="px-4 py-2.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#FF7A30] hover:text-white transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ShieldAlert size={14} className="text-[#FF7A30]" />
                  <span>Admin Panel</span>
                </button>
              )}
              <button 
                onClick={onClose}
                className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="px-5 sm:px-7 py-3.5 bg-stone-50/70 dark:bg-stone-950/40 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notices or PDFs..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium outline-none focus:border-[#FF7A30]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? "bg-[#FF7A30] text-white shadow-xs"
                      : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-orange-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4 bg-stone-50/30 dark:bg-stone-950/20">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400">
                <div className="w-10 h-10 border-4 border-[#FF7A30] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-wider">Loading Notice Bulletin...</p>
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="w-18 h-18 rounded-3xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-300">
                  <FileText size={36} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-800 dark:text-stone-200">No Notices Found</h3>
                  <p className="text-stone-400 text-xs font-medium mt-1">
                    {searchQuery ? "Try a different search keyword" : "No announcements posted yet."}
                  </p>
                </div>
              </div>
            ) : (
              filteredNotices.map((notice, idx) => (
                <motion.div
                  key={`notice-${notice.id || 'item'}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-5 sm:p-6 rounded-[2rem] border transition-all ${
                    notice.isPinned
                      ? "bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 dark:from-stone-800 dark:to-stone-900 border-[#FF7A30]/40 shadow-sm"
                      : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {notice.isPinned && (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-[#FF7A30] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                            <Pin size={11} className="fill-current" /> Pinned Notice
                          </span>
                        )}
                        {notice.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2.5 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
                            {notice.category}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-stone-400 flex items-center gap-1">
                          <Calendar size={11} />
                          {notice.timestamp ? new Date(notice.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Recently"}
                        </span>
                      </div>

                      {notice.title && (
                        <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 leading-snug">
                          {notice.title}
                        </h3>
                      )}

                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line font-medium">
                        {notice.text}
                      </p>

                      <div className="pt-1 text-[11px] font-bold text-stone-400 flex items-center gap-1">
                        <span>Issued by:</span>
                        <span className="text-[#FF7A30] font-extrabold">{notice.author || "Admin (Abhijit)"}</span>
                      </div>
                    </div>

                    {/* PDF Attachment & Action Controls */}
                    <div className="flex flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                      {(notice.pdfData || notice.pdfUrl || notice.pdfId || notice.pdfName) && (
                        <div className="p-3 bg-[#FF7A30]/10 dark:bg-stone-800/90 border border-[#FF7A30]/20 rounded-2xl flex flex-col gap-2 w-full sm:w-56">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-[#FF7A30] text-white flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-stone-900 dark:text-stone-100 truncate font-mono">
                                {notice.pdfName || "Notice_Document.pdf"}
                              </p>
                              <span className="text-[9px] font-bold text-stone-400 uppercase">
                                {notice.pdfSize || "Official PDF"}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <button
                              onClick={() => handleOpenPreview(notice)}
                              className="py-1.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 border border-stone-200 dark:border-stone-600 hover:bg-orange-50 dark:hover:bg-stone-600 transition-all cursor-pointer"
                            >
                              <Eye size={12} className="text-[#FF7A30]" /> Preview
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(notice)}
                              className="py-1.5 bg-[#FF7A30] text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-orange-600 transition-all shadow-xs cursor-pointer"
                            >
                              <Download size={12} /> Download
                            </button>
                          </div>
                        </div>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="self-end p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                          title="Delete Notice (Admin Only)"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Document Preview Modal */}
      {previewItem && (
        <DocumentPreviewModal
          isOpen={!!previewItem}
          title={previewItem.title || previewItem.pdfName || "Notice Document"}
          subtitle={`Published ${previewItem.timestamp ? new Date(previewItem.timestamp).toLocaleDateString() : "Recent"} • WBCHSE Official Notice`}
          content={previewItem.text || "No text description attached."}
          pdfData={previewItem.pdfData}
          pdfUrl={previewItem.pdfUrl}
          pdfName={previewItem.pdfName}
          type="pdf"
          subject={previewItem.category || "General Notice"}
          date={previewItem.timestamp ? new Date(previewItem.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </>
  );
};
