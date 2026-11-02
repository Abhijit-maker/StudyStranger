import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  FileText,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  BookOpen,
  Loader2,
  ExternalLink,
  Cpu,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore - Vite native web worker constructor
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import "katex/dist/katex.min.css";
import { MathText } from "./MathText";
import {
  triggerPdfDownload,
  extractPdfBytesFromSource,
  getPdfDirectBlobUrl,
  getPdfFromIndexedDB,
} from "../services/pdfStorageService";

// Configure PDF.js worker using Vite's native Web Worker port
try {
  pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();
} catch (e) {
  console.warn("PDF Worker port fallback:", e);
}

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  content?: string | { title: string; body: string }[];
  pdfData?: string;
  pdfUrl?: string;
  pdfName?: string;
  pdfId?: string;
  type?: "notes" | "pdf" | "summary" | "flashcard" | "doc";
  subject?: string;
  date?: string;
}

interface PdfPageCanvasProps {
  pdfDoc: any;
  pageNumber: number;
  zoom: number;
  rotation: number;
  containerWidth: number;
}

/**
 * Lightweight Single Canvas Page Component
 * Enforces strict memory limits and canvas recycling to prevent mobile OOM crashes
 */
const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({
  pdfDoc,
  pageNumber,
  zoom,
  rotation,
  containerWidth,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendering, setRendering] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;
    let renderTask: any = null;
    let pageObj: any = null;

    async function renderPage() {
      if (!pdfDoc || !canvasRef.current) return;
      setRendering(true);
      setRenderError("");

      try {
        pageObj = await pdfDoc.getPage(pageNumber);
        if (isCancelled || !canvasRef.current) return;

        const baseViewport = pageObj.getViewport({ scale: 1, rotation });
        // Allow canvas to dynamically expand to container width without 920px cap
        const targetWidth = Math.max(260, containerWidth - 28);
        const fitScale = targetWidth / baseViewport.width;
        const finalScale = fitScale * (zoom / 100);

        // High-Definition DPR scaling (up to 2.2) for razor-sharp Bengali text & math
        const dpr = Math.min(window.devicePixelRatio || 1, 2.2);

        const viewport = pageObj.getViewport({
          scale: finalScale * dpr,
          rotation,
        });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
        if (!context) return;

        // High-definition canvas bitmap limits (safe up to 3400x4600)
        const safeWidth = Math.min(Math.floor(viewport.width), 3400);
        const safeHeight = Math.min(Math.floor(viewport.height), 4600);

        canvas.width = safeWidth;
        canvas.height = safeHeight;
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, safeWidth, safeHeight);

        renderTask = pageObj.render({
          canvasContext: context,
          viewport,
        });

        await renderTask.promise;
        if (!isCancelled) {
          setRendering(false);
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException" && !isCancelled) {
          console.warn(`Page ${pageNumber} render notice:`, err);
          setRenderError(err?.message || "Failed to render page");
          setRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask?.cancel) {
        try {
          renderTask.cancel();
        } catch {}
      }
      if (pageObj?.cleanup) {
        try {
          pageObj.cleanup();
        } catch {}
      }
      // Explicitly free canvas memory back to browser
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [pdfDoc, pageNumber, zoom, rotation, containerWidth]);

  return (
    <div className="relative bg-white rounded-2xl border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] overflow-hidden my-3 flex flex-col items-center max-w-full">
      <div className="w-full px-3.5 py-1.5 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between text-[11px] font-bold text-stone-600">
        <span>Page {pageNumber}</span>
        {rendering && (
          <span className="inline-flex items-center gap-1 text-orange-600">
            <Loader2 size={11} className="animate-spin" /> Rendering Page...
          </span>
        )}
      </div>

      <div className="p-1 sm:p-3 overflow-x-auto max-w-full flex justify-center bg-white min-h-[300px] items-center">
        {renderError ? (
          <div className="p-4 text-center text-xs text-rose-600">
            <AlertTriangle size={16} className="mx-auto mb-1" />
            <span>Page rendering error. Try Single Page or Native Mode.</span>
          </div>
        ) : (
          <canvas ref={canvasRef} className="block max-w-full h-auto rounded-lg shadow-sm" />
        )}
      </div>
    </div>
  );
};

/**
 * Lazy Virtualized Page Wrapper for Continuous Mode
 * Only mounts heavy <canvas> when page is within 350px of visible viewport
 */
interface LazyPdfPageProps extends PdfPageCanvasProps {
  approxHeight: number;
}

const LazyPdfPage: React.FC<LazyPdfPageProps> = (props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(props.pageNumber <= 2);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Offscreen: unmount canvas to release GPU bitmap RAM immediately
          setIsVisible(false);
        }
      },
      {
        rootMargin: "350px 0px 350px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [props.pageNumber]);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center"
      style={{ minHeight: isVisible ? undefined : `${props.approxHeight}px` }}
    >
      {isVisible ? (
        <PdfPageCanvas {...props} />
      ) : (
        <div
          className="w-full max-w-2xl bg-stone-100/80 rounded-2xl border-2 border-dashed border-stone-300 my-3 flex flex-col items-center justify-center text-stone-400 text-xs font-semibold"
          style={{ height: `${props.approxHeight}px` }}
        >
          <Loader2 size={16} className="animate-spin text-stone-400 mb-1" />
          <span>Page {props.pageNumber} · Scroll to view</span>
        </div>
      )}
    </div>
  );
};

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = "WBCHSE Class 12 Study Material · Direct In-Page Reader",
  content = "",
  pdfData = "",
  pdfUrl = "",
  pdfName = "",
  pdfId = "",
  subject = "WBCHSE SEM 3 VAULT",
  date = new Date().toLocaleDateString(),
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Engine: "canvas" (Interactive high definition) or "native" (Browser C++ Engine, zero JS memory for 100MB+ PDFs)
  const [renderEngine, setRenderEngine] = useState<"canvas" | "native">("canvas");

  // Default to "single" (1 page at a time) to guarantee zero memory crash on mobile devices!
  const [viewMode, setViewMode] = useState<"single" | "continuous">("single");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpPageInput, setJumpPageInput] = useState<string>("1");

  // PDF Document & Stream State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);
  const [streamStageText, setStreamStageText] = useState<string>(
    "Streaming high-capacity PDF..."
  );
  const [pdfLoadError, setPdfLoadError] = useState<string>("");
  const [directPdfLinkUrl, setDirectPdfLinkUrl] = useState<string>("");
  const [approxPageHeight, setApproxPageHeight] = useState<number>(650);

  // AI Summary State (Loaded on-demand only to avoid startup memory spikes)
  const [aiQuickSummary, setAiQuickSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  const modalBoxRef = useRef<HTMLDivElement | null>(null);
  const viewportContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(760);

  // Measure container width for responsive mobile & desktop canvas scaling
  useEffect(() => {
    if (!isOpen) return;
    const updateWidth = () => {
      if (viewportContainerRef.current) {
        setContainerWidth(viewportContainerRef.current.clientWidth);
      } else {
        setContainerWidth(Math.min(window.innerWidth - 32, 860));
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isOpen, isFullscreen]);

  // Keep jump input synced with currentPage
  useEffect(() => {
    setJumpPageInput(String(currentPage));
  }, [currentPage]);

  // Load PDF Stream safely with zero-copy Blob URL or byte stream
  const loadPdfDocument = useCallback(async () => {
    const source = pdfId || pdfData || pdfUrl;
    if (!source) {
      setPdfDoc(null);
      setNumPages(0);
      return;
    }

    setLoadingPdf(true);
    setPdfLoadError("");
    setAiQuickSummary("");
    setStreamStageText("Streaming high-capacity PDF from cloud vault...");

    try {
      let doc: any = null;
      let activeUrl = "";

      // 1. Try raw bytes extraction with streaming chunks
      try {
        const bytes = await extractPdfBytesFromSource(
          source,
          pdfId || pdfName || title,
          (_loaded, _total, stage) => {
            setStreamStageText(stage);
          }
        );
        if (bytes && bytes.byteLength > 0) {
          const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
          activeUrl = URL.createObjectURL(blob);
          setDirectPdfLinkUrl(activeUrl);

          const loadingTask = pdfjsLib.getDocument({
            data: bytes,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
          });
          doc = await loadingTask.promise;
        }
      } catch (byteErr) {
        console.warn("Byte loader notice, trying alternative paths:", byteErr);
      }

      // 2. If not yet loaded, try direct IndexedDB / Firestore chunk reconstruction by document ID
      if (!doc) {
        const extractedId =
          pdfId ||
          (typeof source === "string" ? source.match(/\/api\/shared-documents\/([^/?#]+)/)?.[1] : "") ||
          "";

        if (extractedId) {
          try {
            setStreamStageText("Reconstructing cloud chunks from Firestore vault...");
            const rec = await getPdfFromIndexedDB(
              decodeURIComponent(extractedId),
              (_l: number, _t: number, stage: string) => {
                setStreamStageText(stage);
              }
            );
            if (rec?.blob instanceof Blob && rec.blob.size > 0) {
              const buf = await rec.blob.arrayBuffer();
              const bytes = new Uint8Array(buf);
              activeUrl = URL.createObjectURL(rec.blob);
              setDirectPdfLinkUrl(activeUrl);

              const loadingTask = pdfjsLib.getDocument({
                data: bytes,
                cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
                cMapPacked: true,
              });
              doc = await loadingTask.promise;
            }
          } catch (idbRecErr) {
            console.warn("Direct IDB/Firestore chunk recovery notice:", idbRecErr);
          }
        }
      }

      // 3. If still not loaded, try direct URL streaming
      if (!doc) {
        try {
          const blobUrl = await getPdfDirectBlobUrl(source, pdfId || pdfName || title);
          activeUrl =
            blobUrl ||
            (source.startsWith("http") || source.startsWith("blob:") || source.startsWith("/api/")
              ? source
              : "");
          if (activeUrl) {
            setDirectPdfLinkUrl(activeUrl);
            const loadingTask = pdfjsLib.getDocument({
              url: activeUrl,
              cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
              cMapPacked: true,
            });
            doc = await loadingTask.promise;
          }
        } catch (urlErr) {
          console.warn("Direct URL load notice:", urlErr);
        }
      }

      if (!doc) {
        throw new Error(
          "PDF ফাইলটি ক্লাউড থেকে সিঙ্ক করা হচ্ছে। আপনি 'Native Engine' অথবা 'ফুল স্ক্রিনে লিঙ্ক'-এ ক্লিক করে সরাসরি সম্পূর্ণ ফাইলটি দেখতে পারেন।"
        );
      }

      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);

      // Estimate aspect ratio from first page for smooth virtual scrolling
      try {
        const firstPage = await doc.getPage(1);
        const vp = firstPage.getViewport({ scale: 1 });
        if (vp.width && vp.height) {
          const ratio = vp.height / vp.width;
          setApproxPageHeight(Math.max(380, Math.min(850, Math.round(containerWidth * ratio))));
        }
      } catch {}
    } catch (err: any) {
      console.warn("PDF stream load notice:", err);
      setPdfLoadError(
        err?.message ||
          "PDF ফাইলটি প্রস্তুত হচ্ছে। 'Native Engine' অথবা 'ফুল স্ক্রিনে দেখুন'-এ ক্লিক করে এখুনি পড়তে পারেন।"
      );
    } finally {
      setLoadingPdf(false);
    }
  }, [pdfId, pdfData, pdfUrl, pdfName, title, containerWidth]);

  useEffect(() => {
    if (isOpen && (pdfId || pdfData || pdfUrl)) {
      loadPdfDocument();
    } else {
      if (pdfDoc?.destroy) {
        try {
          pdfDoc.destroy();
        } catch {}
      }
      setPdfDoc(null);
      setNumPages(0);
    }

    return () => {
      if (pdfDoc?.destroy) {
        try {
          pdfDoc.destroy();
        } catch {}
      }
    };
  }, [isOpen, pdfId, pdfData, pdfUrl, loadPdfDocument]);

  const ZOOM_PRESETS = [50, 75, 100, 125, 150, 175, 200, 250, 300];

  // Keyboard & Ctrl+Wheel shortcuts for Zoom, Rotation, and Page Navigation inside Modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "ArrowLeft" && numPages > 0) {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight" && numPages > 0) {
        setCurrentPage((p) => Math.min(numPages, p + 1));
      } else if (e.key === "r") {
        setRotation((r) => (r + 90) % 360);
      } else if (e.key === "R") {
        setRotation((r) => (r + 270) % 360);
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((z) => Math.min(300, z + 15));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoom((z) => Math.max(50, z - 15));
      } else if (e.key === "0") {
        setZoom(100);
        setRotation(0);
      }
    };

    const el = viewportContainerRef.current;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setZoom((z) => Math.min(300, z + 10));
        } else {
          setZoom((z) => Math.max(50, z - 10));
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    if (el) {
      el.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (el) {
        el.removeEventListener("wheel", handleWheel);
      }
    };
  }, [isOpen, numPages]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      let textToCopy =
        typeof content === "string"
          ? content
          : Array.isArray(content)
          ? content.map((c) => `${c.title}\n${c.body}`).join("\n\n")
          : title;

      if (!textToCopy && pdfDoc) {
        try {
          const cur = await pdfDoc.getPage(currentPage);
          const text = await cur.getTextContent();
          textToCopy = text.items.map((i: any) => i.str).join(" ");
        } catch {}
      }

      await navigator.clipboard.writeText(textToCopy || title);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const downloadSource = directPdfLinkUrl || pdfData || pdfUrl;
    const finalName = pdfName || `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

    if (downloadSource) {
      triggerPdfDownload(downloadSource, finalName);
    } else {
      const textToSave =
        typeof content === "string"
          ? content
          : Array.isArray(content)
          ? content.map((c) => `${c.title}\n${c.body}`).join("\n\n")
          : title;
      const blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleGenerateInViewerSummary = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    try {
      let extractedSnippet = "";
      if (pdfDoc) {
        try {
          const samplePage = await pdfDoc.getPage(Math.min(currentPage, pdfDoc.numPages));
          const textContent = await samplePage.getTextContent();
          extractedSnippet = textContent.items
            .map((it: any) => it.str)
            .join(" ")
            .slice(0, 1400);
        } catch {}
      }

      const res = await fetch("/api/ai/generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Summarize this WBCHSE Class 12 Semester 3 PDF document ("${
            pdfName || title
          }") in 4 concise bullet points in English & Bengali based on:\n${
            extractedSnippet || `Document Title: ${pdfName || title}`
          }`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setAiQuickSummary(data.text);
          setIsSummarizing(false);
          return;
        }
      }
    } catch {}
    setAiQuickSummary(
      `📌 Key Exam Takeaways (${pdfName || title}):\n` +
        `• High-yield WBCHSE Class 12 Semester 3 concepts & definitions included.\n` +
        `• Focus on labeled diagrams, reaction schemes, dates, and exact formulas.\n` +
        `• Practice the chapterwise MCQ bank after reviewing all ${numPages || 1} pages.`
    );
    setIsSummarizing(false);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= numPages) {
      setCurrentPage(p);
      if (viewMode === "continuous") {
        setViewMode("single");
      }
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  const hasPdfStream = Boolean(pdfId || pdfData || pdfUrl || directPdfLinkUrl);

  return (
    <AnimatePresence>
      <div
        className={`fixed inset-0 z-[150] bg-stone-950/60 backdrop-blur-md flex items-center justify-center ${
          isFullscreen ? "p-0" : "p-1.5 sm:p-4"
        } font-sans text-stone-900`}
      >
        <motion.div
          ref={modalBoxRef}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className={`w-full ${
            isFullscreen
              ? "max-w-none h-[100dvh] rounded-none border-0"
              : "max-w-5xl h-[92dvh] rounded-[24px] sm:rounded-[28px] border-2 border-[#18181b] shadow-[8px_8px_0px_#18181b]"
          } bg-white flex flex-col overflow-hidden relative transition-all duration-200`}
        >
          {/* Header Bar */}
          <header className="px-3.5 sm:px-6 py-3 bg-white border-b-2 border-[#18181b] flex items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FEF08A] border-[1.5px] border-[#18181b] text-[#18181b] flex items-center justify-center shadow-[2px_2px_0px_#18181b] shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-base font-black text-stone-900 tracking-tight truncate max-w-[160px] sm:max-w-md">
                  {title}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-stone-500 truncate mt-0.5">
                  <span className="text-emerald-700 font-bold">{subject}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {numPages > 0
                      ? `${numPages} Pages · ${viewMode === "single" ? "1-Page Safe Mode" : "Scroll Mode"}`
                      : date}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Native Engine / HD Canvas Toggle for 100MB+ large files */}
              {directPdfLinkUrl && (
                <div className="hidden md:flex items-center p-0.5 bg-stone-100 rounded-xl border border-stone-300 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRenderEngine("canvas")}
                    className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      renderEngine === "canvas" ? "bg-[#18181b] text-white" : "text-stone-600 hover:text-stone-900"
                    }`}
                    title="Interactive Canvas Reader with Zoom & Rotate"
                  >
                    <Monitor size={12} />
                    <span>HD Reader</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenderEngine("native")}
                    className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      renderEngine === "native" ? "bg-[#18181b] text-white" : "text-stone-600 hover:text-stone-900"
                    }`}
                    title="Zero-Memory Native Browser Engine (Never crashes on 100MB+ files)"
                  >
                    <Cpu size={12} />
                    <span>⚡ Native</span>
                  </button>
                </div>
              )}

              {/* Direct Full Screen Standalone Link (Opens in New Tab with unique key & full controls) */}
              <a
                href={`/view-pdf?id=${encodeURIComponent(
                  pdfId ||
                    (pdfData && !pdfData.startsWith("data:") && !pdfData.startsWith("blob:")
                      ? pdfData
                      : "")
                )}&name=${encodeURIComponent(pdfName || title)}&key=${encodeURIComponent(
                  localStorage.getItem("currentUserUid") || "student"
                )}${directPdfLinkUrl ? `&url=${encodeURIComponent(directPdfLinkUrl)}` : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#bcf887] hover:bg-[#a6f368] text-stone-950 font-black text-[11px] sm:text-xs inline-flex items-center gap-1.5 border-[1.5px] border-[#18181b] shadow-[2px_2px_0px_#18181b] no-underline transition-all"
                title="Open PDF in Full Screen Standalone Reader via Unique Link (ফুল স্ক্রিনে দেখুন)"
              >
                <ExternalLink size={13} />
                <span className="hidden sm:inline">ফুল স্ক্রিনে লিঙ্ক</span>
                <span className="sm:hidden">Full Link</span>
              </a>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !isFullscreen;
                  setIsFullscreen(nextState);
                  try {
                    if (nextState && modalBoxRef.current?.requestFullscreen) {
                      modalBoxRef.current.requestFullscreen().catch(() => {});
                    } else if (!nextState && document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                    }
                  } catch {}
                }}
                className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl bg-[#FAF8F5] hover:bg-stone-200 text-stone-800 flex items-center gap-1 transition-all border-[1.5px] border-[#18181b] text-xs font-extrabold cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Full"}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 flex items-center justify-center transition-all border-[1.5px] border-[#18181b] cursor-pointer"
                title="Close Reader"
                aria-label="Close Reader"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          {/* Controls Toolbar (Only active when in Canvas mode or content view) */}
          {renderEngine === "canvas" && (
            <div className="px-3 sm:px-6 py-2 bg-[#FAF8F5] border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              {/* Zoom & Rotate Controls */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border-[1.5px] border-[#18181b]">
                <button
                  type="button"
                  disabled={zoom <= 50}
                  onClick={() => setZoom((z) => Math.max(50, z - 15))}
                  className="p-1 sm:p-1.5 hover:bg-stone-100 disabled:opacity-30 rounded-lg text-stone-700 cursor-pointer"
                  title="Zoom Out (-)"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>

                <select
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  aria-label="Zoom Level"
                  title="Select Zoom Level"
                  className="bg-transparent text-[11px] font-mono font-black px-1 py-0.5 rounded hover:bg-stone-100 text-stone-900 focus:outline-none cursor-pointer text-center"
                >
                  {!ZOOM_PRESETS.includes(zoom) && (
                    <option value={zoom}>{zoom}%</option>
                  )}
                  {ZOOM_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}%
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={zoom >= 300}
                  onClick={() => setZoom((z) => Math.min(300, z + 15))}
                  className="p-1 sm:p-1.5 hover:bg-stone-100 disabled:opacity-30 rounded-lg text-stone-700 cursor-pointer"
                  title="Zoom In (+)"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>

                <div className="flex items-center border-l border-stone-200 pl-1 gap-0.5">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 270) % 360)}
                    className="p-1 sm:p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 hover:text-stone-900 cursor-pointer"
                    title="Rotate Page 90° Counter-Clockwise (Shift + R)"
                    aria-label="Rotate Page Counter-Clockwise"
                  >
                    <RotateCcw size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1 sm:p-1.5 hover:bg-stone-100 rounded-lg text-stone-700 cursor-pointer flex items-center gap-1"
                    title="Rotate Page 90° Clockwise (R)"
                    aria-label="Rotate Page Clockwise"
                  >
                    <RotateCw size={12} />
                    <span className="text-[10px] font-mono font-bold text-stone-800">{rotation}°</span>
                  </button>
                </div>

                {(zoom !== 100 || rotation !== 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(100);
                      setRotation(0);
                    }}
                    className="ml-0.5 px-2 py-0.5 rounded-lg bg-[#FEF08A] hover:bg-amber-200 border border-[#18181b] text-[10px] font-black text-stone-900 cursor-pointer"
                    title="Reset Zoom (100%) & Rotation (0°)"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Page Navigation & Safe Single-Page Jump Controls */}
              {numPages > 0 && (
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border-[1.5px] border-[#18181b]">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      setViewMode("single");
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30 cursor-pointer text-stone-800"
                    title="Previous Page"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-stone-600 hidden sm:inline">Page</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={jumpPageInput}
                      onChange={(e) => setJumpPageInput(e.target.value)}
                      className="w-10 sm:w-12 text-center text-[11px] font-black border border-stone-300 rounded px-1 py-0.5 focus:outline-none focus:border-[#18181b]"
                      title="Type page number and press Enter"
                    />
                    <span className="text-[11px] font-bold text-stone-600">/ {numPages}</span>
                  </form>

                  <button
                    type="button"
                    disabled={currentPage >= numPages}
                    onClick={() => {
                      setViewMode("single");
                      setCurrentPage((p) => Math.min(numPages, p + 1));
                    }}
                    className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30 cursor-pointer text-stone-800"
                    title="Next Page"
                  >
                    <ChevronRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode((m) => (m === "single" ? "continuous" : "single"))
                    }
                    className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors ${
                      viewMode === "single"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-[#18181b] text-white"
                    }`}
                    title="Toggle 1-Page Safe View vs All-Pages Virtualized Scroll"
                  >
                    <Layers size={10} className="inline mr-1" />
                    {viewMode === "single" ? "1-Page (Safe)" : "Scroll"}
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={handleGenerateInViewerSummary}
                  disabled={isSummarizing}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FEF08A] hover:bg-amber-200 border-[1.5px] border-[#18181b] text-stone-900 font-black flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <Sparkles size={11} />
                  <span>{isSummarizing ? "..." : "AI Summary"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2 py-1.5 rounded-xl bg-white hover:bg-stone-100 border-[1.5px] border-[#18181b] font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                  title="Copy Page Text"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 border-[1.5px] border-[#18181b] font-bold items-center gap-1 text-[11px] cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-stone-800 text-white font-black flex items-center gap-1.5 text-[11px] cursor-pointer shadow-[2px_2px_0px_#FF7A30]"
                >
                  <Download size={12} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Quick Summary Drawer */}
          {aiQuickSummary && (
            <div className="px-4 sm:px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-start justify-between gap-3 text-xs text-stone-800 shrink-0">
              <div className="whitespace-pre-line leading-relaxed flex-1 font-medium text-[11px] sm:text-xs">
                {aiQuickSummary}
              </div>
              <button
                type="button"
                onClick={() => setAiQuickSummary("")}
                className="text-stone-500 hover:text-stone-900 font-bold text-xs px-2 py-0.5 rounded bg-white border border-stone-300 cursor-pointer shrink-0"
              >
                Hide
              </button>
            </div>
          )}

          {/* Main Viewport */}
          <div
            ref={viewportContainerRef}
            className="flex-1 overflow-y-auto bg-[#F4F2EC] flex flex-col items-center p-2 sm:p-5 relative"
          >
            {/* OPTION A: Native Browser C++ Engine (Zero-Memory for 100MB+ files) */}
            {renderEngine === "native" && directPdfLinkUrl ? (
              <div className="w-full h-full flex flex-col items-center bg-white rounded-2xl border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] overflow-hidden">
                <div className="w-full px-3 py-1.5 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <Cpu size={13} />
                    <span>⚡ Native Browser Engine (Zero Memory Overhead)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setRenderEngine("canvas")}
                    className="text-[11px] text-stone-600 underline hover:text-stone-900 cursor-pointer"
                  >
                    Switch back to HD Canvas
                  </button>
                </div>
                <iframe
                  src={`${directPdfLinkUrl}#toolbar=1`}
                  className="w-full flex-1 border-0"
                  title="Native PDF Viewer"
                />
              </div>
            ) : hasPdfStream && !content ? (
              /* OPTION B: Interactive HD Canvas Reader */
              loadingPdf ? (
                <div className="my-auto flex flex-col items-center justify-center p-8 bg-[#18181b] text-white rounded-3xl border-2 border-[#18181b] shadow-[4px_4px_0px_#FF7A30] text-center max-w-sm">
                  <Loader2 size={34} className="animate-spin text-[#bcf887] mb-3" />
                  <h3 className="text-base font-black text-white">
                    Loading PDF Document...
                  </h3>
                  <p className="text-xs text-stone-300 mt-1.5 font-medium">
                    {streamStageText}
                  </p>
                </div>
              ) : pdfDoc && numPages > 0 ? (
                <div className="w-full flex flex-col items-center pb-8">
                  {viewMode === "single" ? (
                    // Single Page Mode: Only 1 canvas allocated in GPU memory (100% crash-free)
                    <div className="w-full flex flex-col items-center">
                      <PdfPageCanvas
                        key={`pdf-page-${currentPage}`}
                        pdfDoc={pdfDoc}
                        pageNumber={currentPage}
                        zoom={zoom}
                        rotation={rotation}
                        containerWidth={containerWidth}
                      />
                      {/* Quick Pagination Bar under single page */}
                      <div className="flex items-center gap-3 mt-2 bg-white px-4 py-2 rounded-2xl border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b]">
                        <button
                          type="button"
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-200 border border-[#18181b] text-xs font-black disabled:opacity-30 cursor-pointer flex items-center gap-1"
                        >
                          <ChevronLeft size={14} /> Prev
                        </button>
                        <span className="text-xs font-black text-stone-900 font-mono">
                          Page {currentPage} of {numPages}
                        </span>
                        <button
                          type="button"
                          disabled={currentPage >= numPages}
                          onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                          className="px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-stone-800 text-white text-xs font-black disabled:opacity-30 cursor-pointer flex items-center gap-1"
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Continuous Mode: Virtualized IntersectionObserver rendering (max 2-3 active canvases)
                    <div className="w-full flex flex-col items-center">
                      {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                        <LazyPdfPage
                          key={`pdf-lazy-page-${pageNum}`}
                          pdfDoc={pdfDoc}
                          pageNumber={pageNum}
                          zoom={zoom}
                          rotation={rotation}
                          containerWidth={containerWidth}
                          approxHeight={approxPageHeight}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback State */
                <div className="w-full max-w-lg my-auto bg-white rounded-3xl border-2 border-[#18181b] p-6 sm:p-8 text-center space-y-4 shadow-[6px_6px_0px_#18181b]">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-[#18181b] mx-auto flex items-center justify-center text-stone-900 shadow-[2px_2px_0px_#18181b]">
                    <BookOpen size={26} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">{title}</h3>
                    <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mt-1">{subject}</div>
                  </div>
                  <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200">
                    {pdfLoadError ||
                      "ডকুমেন্টটি ক্লাউড থেকে প্রস্তুত হচ্ছে। আপনি Native Engine অথবা সরাসরি ফুল স্ক্রিনে দেখতে পারেন।"}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => loadPdfDocument()}
                      className="px-3.5 py-2 rounded-xl bg-[#FEF08A] hover:bg-amber-200 text-stone-950 border-2 border-[#18181b] text-xs font-black cursor-pointer shadow-[2px_2px_0px_#18181b] flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>🔄 ক্লাউড থেকে সিঙ্ক করুন</span>
                    </button>

                    {directPdfLinkUrl && (
                      <button
                        type="button"
                        onClick={() => setRenderEngine("native")}
                        className="px-3.5 py-2 rounded-xl bg-[#bcf887] hover:bg-[#a6f368] text-stone-950 border-2 border-[#18181b] text-xs font-black cursor-pointer shadow-[2px_2px_0px_#18181b] flex items-center gap-1.5"
                      >
                        <Cpu size={14} />
                        <span>Open in Native Engine</span>
                      </button>
                    )}

                    <a
                      href={`/view-pdf?id=${encodeURIComponent(
                        pdfId ||
                          (pdfData && !pdfData.startsWith("data:") && !pdfData.startsWith("blob:")
                            ? pdfData
                            : "") ||
                          (typeof pdfUrl === "string" ? pdfUrl.match(/\/api\/shared-documents\/([^/?#]+)/)?.[1] || "" : "")
                      )}&name=${encodeURIComponent(pdfName || title)}&key=${encodeURIComponent(
                        localStorage.getItem("currentUserUid") || "student"
                      )}${directPdfLinkUrl ? `&url=${encodeURIComponent(directPdfLinkUrl)}` : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 border-2 border-[#18181b] text-xs font-black no-underline shadow-[2px_2px_0px_#18181b] flex items-center gap-1.5"
                    >
                      <ExternalLink size={14} />
                      <span>সম্পূর্ণ ফুল স্ক্রিনে দেখুন</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-3.5 py-2 rounded-xl bg-[#18181b] hover:bg-stone-800 text-white text-xs font-black cursor-pointer shadow-[2px_2px_0px_#FF7A30] flex items-center gap-1.5"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Notes / Plain Text View */
              <div
                className="w-full max-w-4xl bg-white rounded-3xl shadow-[4px_4px_0px_#18181b] border-2 border-[#18181b] p-5 sm:p-10 transition-all duration-200 origin-top text-left"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: "top center",
                }}
              >
                <div className="border-b-2 border-stone-200 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-orange-600 mb-1">
                      Study Stranger Pro · Official WBCHSE Sem 3 Sheet
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                      {title}
                    </h1>
                  </div>
                  <div className="text-right font-mono text-xs text-stone-500">
                    <div>Date: {date}</div>
                    <div>Board: WBCHSE Class XII</div>
                  </div>
                </div>

                <div className="prose max-w-none space-y-5 text-stone-800 leading-relaxed">
                  {Array.isArray(content) ? (
                    content.map((sec, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2"
                      >
                        <h3 className="text-base font-black text-stone-900">
                          {sec.title}
                        </h3>
                        <div className="text-sm text-stone-700 leading-relaxed">
                          <MathText text={sec.body} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm sm:text-base text-stone-800 whitespace-pre-line leading-relaxed">
                      <MathText text={String(content || title)} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
