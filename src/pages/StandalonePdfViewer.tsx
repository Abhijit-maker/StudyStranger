import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  FileText,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Layers,
  Cpu,
  Monitor,
  Sparkles,
  ExternalLink,
  Share2
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore - Vite native web worker constructor
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import {
  getPdfFromIndexedDB,
  extractPdfBytesFromSource,
  getPdfDirectBlobUrl,
  triggerPdfDownload,
  StoredPDFRecord
} from "../services/pdfStorageService";

// Configure PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();
} catch (e) {
  console.warn("PDF Worker port fallback in Standalone:", e);
}

export default function StandalonePdfViewer() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();

  const docId = searchParams.get("id") || "";
  const userKey = searchParams.get("key") || "student";
  const docNameParam = searchParams.get("name") || "";
  const directUrlParam = searchParams.get("url") || "";

  const [docName, setDocName] = useState<string>(docNameParam || "Study Document");
  const [pdfSource, setPdfSource] = useState<string>("");
  const [directBlobUrl, setDirectBlobUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [streamStageText, setStreamStageText] = useState<string>(
    "Streaming high-capacity PDF (0.0 MB)..."
  );
  const [streamPercent, setStreamPercent] = useState<number>(15);
  const [error, setError] = useState<string>("");

  // Reader Controls
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [fitMode, setFitMode] = useState<"width" | "height">("width");
  const [viewMode, setViewMode] = useState<"single" | "continuous">("single");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pageRendering, setPageRendering] = useState<boolean>(false);

  // 1. Resolve Document by ID or direct URL with live byte streaming progress
  useEffect(() => {
    let isCancelled = false;

    const handleStreamProgress = (loaded: number, total: number, stage: string) => {
      if (isCancelled) return;
      setStreamStageText(stage);
      if (total > 0) {
        setStreamPercent(Math.min(98, Math.max(10, Math.round((loaded / total) * 100))));
      }
    };

    async function resolveDocument() {
      setLoading(true);
      setError("");
      setStreamStageText("Streaming high-capacity PDF...");
      setStreamPercent(18);

      try {
        let activeSource = directUrlParam;
        let resolvedTitle = docNameParam;

        if (docId) {
          try {
            const stored = await getPdfFromIndexedDB(docId, handleStreamProgress);
            if (stored) {
              activeSource = stored.blobUrl || stored.dataUrl || stored.streamUrl || docId;
              resolvedTitle = stored.name || resolvedTitle;
            } else {
              activeSource = activeSource || docId;
            }
          } catch (e) {
            console.warn("IndexedDB resolve notice:", e);
            activeSource = activeSource || docId;
          }
        }

        if (!activeSource && docId) {
          const localCache = localStorage.getItem(`ss_pdf_${docId}`);
          if (localCache) {
            activeSource = localCache;
          }
        }

        if (!activeSource && resolvedTitle) {
          activeSource = resolvedTitle;
        }

        if (!activeSource) {
          throw new Error(
            "PDF document source not found. The link may have expired or document was removed."
          );
        }

        if (resolvedTitle) setDocName(resolvedTitle);
        setPdfSource(activeSource);

        // Load into PDF.js using fast in-memory Uint8Array bytes first
        let doc: any = null;
        let loadedBytes: Uint8Array | null = null;
        try {
          loadedBytes = await extractPdfBytesFromSource(
            docId || activeSource,
            resolvedTitle || docId,
            handleStreamProgress
          );
          if (loadedBytes && loadedBytes.byteLength > 0) {
            // Also create a zero-copy Blob URL from the loaded bytes for instant download/raw tab
            if (!isCancelled) {
              const blob = new Blob([loadedBytes.buffer as ArrayBuffer], {
                type: "application/pdf",
              });
              setDirectBlobUrl(URL.createObjectURL(blob));
            }
            const loadingTask = pdfjsLib.getDocument({
              data: loadedBytes,
              cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
              cMapPacked: true,
            });
            doc = await loadingTask.promise;
          }
        } catch (e) {
          console.warn("Byte stream fallback notice:", e);
        }

        if (!doc) {
          const blobUrl = await getPdfDirectBlobUrl(
            docId || activeSource,
            resolvedTitle || docId || "Document.pdf"
          );
          if (!isCancelled && blobUrl) {
            setDirectBlobUrl(blobUrl);
            const loadingTask = pdfjsLib.getDocument({
              url: blobUrl,
              cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
              cMapPacked: true,
            });
            doc = await loadingTask.promise;
          }
        }

        if (!doc) {
          throw new Error("Unable to read PDF byte stream.");
        }

        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || "Failed to load PDF document.");
          setLoading(false);
        }
      }
    }

    resolveDocument();

    return () => {
      isCancelled = true;
      if (pdfDoc?.destroy) {
        try {
          pdfDoc.destroy();
        } catch {}
      }
    };
  }, [docId, docNameParam, directUrlParam]);

  // Fullscreen event listener sync
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const ZOOM_PRESETS = [50, 75, 100, 125, 150, 175, 200, 250, 300];

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(50, z - 15));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(300, z + 15));
  }, []);

  const handleRotateCw = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  const handleRotateCcw = useCallback(() => {
    setRotation((r) => (r + 270) % 360);
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(100);
    setRotation(0);
    setFitMode("width");
  }, []);

  // Keyboard navigation & shortcuts: Arrow Left/Right, +/-/0 Zoom, R / Shift+R Rotate, F Fullscreen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        setCurrentPage((p) => Math.min(numPages || p, p + 1));
      } else if (e.key === "r") {
        handleRotateCw();
      } else if (e.key === "R") {
        handleRotateCcw();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetView();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [numPages, handleRotateCw, handleRotateCcw, handleZoomIn, handleZoomOut, handleResetView]);

  // Pinch / Ctrl+Wheel smooth zoom support
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
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
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // 2. High-Definition Canvas Rendering for Current Page
  useEffect(() => {
    let isCancelled = false;
    let renderTask: any = null;
    let pageObj: any = null;

    async function renderPage() {
      if (!pdfDoc || !canvasRef.current || !containerRef.current) return;
      setPageRendering(true);

      try {
        pageObj = await pdfDoc.getPage(currentPage);
        if (isCancelled || !canvasRef.current || !containerRef.current) return;

        const containerW = containerRef.current.clientWidth || window.innerWidth;
        const containerH = containerRef.current.clientHeight || window.innerHeight;

        const baseViewport = pageObj.getViewport({ scale: 1, rotation });

        let fitScale: number;
        if (fitMode === "height") {
          const availH = Math.max(300, containerH - (zenMode ? 20 : 120));
          fitScale = availH / baseViewport.height;
        } else {
          const availW = Math.max(300, Math.min(containerW - (zenMode ? 16 : 32), 1020));
          fitScale = availW / baseViewport.width;
        }

        const finalScale = fitScale * (zoom / 100);
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

        const viewport = pageObj.getViewport({
          scale: finalScale * dpr,
          rotation,
        });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
        if (!ctx) return;

        const safeWidth = Math.min(Math.floor(viewport.width), 3600);
        const safeHeight = Math.min(Math.floor(viewport.height), 4800);

        canvas.width = safeWidth;
        canvas.height = safeHeight;
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, safeWidth, safeHeight);

        renderTask = pageObj.render({
          canvasContext: ctx,
          viewport,
        });

        await renderTask.promise;
        if (!isCancelled) {
          setPageRendering(false);
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException" && !isCancelled) {
          console.warn("Standalone PDF page render notice:", err);
          setPageRendering(false);
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
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [pdfDoc, currentPage, zoom, rotation, fitMode, zenMode]);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    } catch {}
  };

  const handleShareLink = async () => {
    const fullUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      window.prompt("Shareable PDF Link:", fullUrl);
    }
  };

  const handleDownload = () => {
    const src = directBlobUrl || pdfSource || docId;
    if (src) {
      triggerPdfDownload(src, docName.endsWith(".pdf") ? docName : `${docName}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-[#141416] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header Bar matching screenshot */}
      {!zenMode && (
        <header className="px-3 sm:px-5 py-3 bg-[#1c1c1f] border-b border-stone-800/80 flex items-center justify-between gap-3 shrink-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  nav(-1);
                } else {
                  nav("/app/notes");
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-[#27272a] hover:bg-stone-700 text-stone-100 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700/80 shrink-0"
              title="Back to Study Stranger Vault"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-black text-white truncate max-w-[170px] sm:max-w-md">
                {docName}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-stone-400 font-semibold">
                <span>{numPages > 0 ? `${numPages} Pages` : "0 Pages"}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-[#bcf887]">WBCHSE Sem 3 Cloud Stream</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShareLink}
              className="hidden sm:inline-flex px-2.5 py-1.5 rounded-xl bg-[#27272a] hover:bg-stone-700 text-stone-200 text-xs font-bold items-center gap-1.5 cursor-pointer transition-colors border border-stone-700"
              title="Copy Shareable Link"
            >
              {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              <span>{copiedLink ? "Copied!" : "Share"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-xl bg-[#27272a] hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-stone-700"
              title="Download PDF"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-[#27272a] hover:bg-stone-700 text-stone-200 cursor-pointer border border-stone-700"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </header>
      )}

      {/* Sleek Centered Pill Toolbar with Full Zoom & Rotation Controls */}
      <div className="px-3 py-2.5 bg-[#18181b] border-b border-stone-800/70 flex items-center justify-center shrink-0 z-20 overflow-x-auto">
        <div className="inline-flex items-center gap-1 sm:gap-2 bg-[#232329] px-2.5 sm:px-3.5 py-1.5 rounded-2xl border border-stone-700/80 shadow-lg text-xs">
          {/* Page Navigation */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg hover:bg-stone-700 disabled:opacity-30 cursor-pointer text-stone-300"
            title="Previous Page (Arrow Left)"
            aria-label="Previous Page"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-bold px-1.5 text-stone-100 whitespace-nowrap">
            Page {currentPage} / {numPages || 1}
          </span>
          <button
            type="button"
            disabled={currentPage >= (numPages || 1)}
            onClick={() => setCurrentPage((p) => Math.min(numPages || 1, p + 1))}
            className="p-1.5 rounded-lg hover:bg-stone-700 disabled:opacity-30 cursor-pointer text-stone-300"
            title="Next Page (Arrow Right)"
            aria-label="Next Page"
          >
            <ChevronRight size={15} />
          </button>

          <div className="h-4 w-[1px] bg-stone-700 mx-0.5 sm:mx-1" />

          {/* Zoom Controls (- / Preset Select / +) */}
          <button
            type="button"
            disabled={zoom <= 50}
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-stone-700 disabled:opacity-30 text-stone-300 cursor-pointer"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>

          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom Level"
            title="Select Zoom Level (or press 0 to reset)"
            className="bg-transparent text-xs font-mono font-bold text-stone-100 px-1 py-0.5 rounded hover:bg-stone-700 focus:outline-none cursor-pointer text-center"
          >
            {!ZOOM_PRESETS.includes(zoom) && (
              <option value={zoom} className="bg-[#1c1c1f] text-white">
                {zoom}%
              </option>
            )}
            {ZOOM_PRESETS.map((preset) => (
              <option key={preset} value={preset} className="bg-[#1c1c1f] text-white">
                {preset}%
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={zoom >= 300}
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-stone-700 disabled:opacity-30 text-stone-300 cursor-pointer"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn size={14} />
          </button>

          <div className="h-4 w-[1px] bg-stone-700 mx-0.5 sm:mx-1" />

          {/* Bidirectional Rotation Controls (-90° Counter-Clockwise & +90° Clockwise) */}
          <button
            type="button"
            onClick={handleRotateCcw}
            className="p-1.5 hover:bg-stone-700 rounded-lg text-stone-300 hover:text-white cursor-pointer"
            title="Rotate Counter-Clockwise -90° (Shift + R)"
            aria-label="Rotate Counter-Clockwise"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            onClick={handleRotateCw}
            className="p-1.5 hover:bg-stone-700 rounded-lg text-stone-200 hover:text-[#bcf887] cursor-pointer flex items-center gap-1"
            title="Rotate Clockwise +90° (R)"
            aria-label="Rotate Clockwise"
          >
            <RotateCw size={14} />
            <span className="text-[10px] font-mono font-bold text-[#bcf887]">{rotation}°</span>
          </button>

          {(zoom !== 100 || rotation !== 0) && (
            <button
              type="button"
              onClick={handleResetView}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] font-bold text-[#FEF08A] cursor-pointer border border-stone-600 whitespace-nowrap"
              title="Reset Zoom (100%) & Rotation (0°)"
            >
              Reset
            </button>
          )}

          <div className="h-4 w-[1px] bg-stone-700 mx-0.5 sm:mx-1" />

          {/* Layers / Fit Mode Toggle */}
          <button
            type="button"
            onClick={() => setFitMode((m) => (m === "width" ? "height" : "width"))}
            className={`px-2 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-bold ${
              fitMode === "height"
                ? "bg-[#bcf887] text-stone-950"
                : "text-stone-300 hover:bg-stone-700"
            }`}
            title={fitMode === "width" ? "Switch to Fit Page Height" : "Switch to Fit Page Width"}
          >
            <Layers size={13} />
            <span className="hidden sm:inline">
              {fitMode === "width" ? "Fit Width" : "Fit Page"}
            </span>
          </button>
        </div>
      </div>

      {/* Main High-Definition Canvas Stage */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#141416] flex items-center justify-center p-2 sm:p-4 relative"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-8 text-center max-w-sm">
            <Loader2 size={42} className="animate-spin text-[#bcf887] mb-4" />
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Loading PDF Document...
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1.5 font-medium">
              {streamStageText}
            </p>
            <div className="w-56 h-1.5 bg-stone-800 rounded-full overflow-hidden mt-4 border border-stone-700">
              <div
                className="h-full bg-[#bcf887] transition-all duration-200 rounded-full"
                style={{ width: `${streamPercent}%` }}
              />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 bg-[#1c1c1f] rounded-3xl border border-rose-900/80 text-center max-w-md">
            <AlertTriangle size={36} className="text-rose-500 mb-3" />
            <h3 className="text-base font-black text-rose-300">Document Load Notice</h3>
            <p className="text-xs text-stone-400 mt-1 mb-4">{error}</p>
            <div className="flex items-center gap-2">
              <Link
                to="/app/notes"
                className="px-4 py-2 rounded-xl bg-stone-800 text-white font-bold text-xs no-underline"
              >
                Go to PDF Vault
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative max-w-full max-h-full flex flex-col items-center justify-center">
            {pageRendering && (
              <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-stone-900/85 backdrop-blur text-[11px] font-bold text-[#bcf887] flex items-center gap-1.5 border border-stone-700">
                <Loader2 size={12} className="animate-spin" />
                <span>Rendering HD...</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="block rounded-lg shadow-2xl transition-all duration-150 bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}
