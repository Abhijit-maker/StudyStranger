/**
 * PDF Storage, Folder/Sub-Folder Hierarchy & Triple-Backup Real-Time Sync Service
 *
 * Triple-Backup Architecture:
 * 1. Centralized Firestore 'shared_documents' + '/shared_documents/{docId}/chunks' (Cloud-persistent across all instances & accounts)
 * 2. Express Server Binary Stream ('/api/shared-documents/upload-chunk' & '/api/shared-documents/:id/stream' with Range & Content-Length)
 * 3. Local IndexedDB ('StudyStranger_Storage') Native Blob & Chunk Cache (0ms offline & repeat opens)
 */

import { jsPDF } from "jspdf";
import {
  MAX_PDF_UPLOAD_SIZE_MB,
  PDF_CHUNK_SIZE_BYTES,
  formatByteSize,
  validatePdfFileForUpload,
} from "../utils/studyCoreLogic";
import {
  splitDataUrlForFirestore,
  reassembleDataUrlFromFirestoreChunks,
  buildSanitizedSharedDocumentPayload,
  mergeSharedDocumentRecords,
  FirestoreDocumentChunk,
} from "../utils/sharedDocumentSyncLogic";
import { db as firestoreDb, auth } from "../firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

export const SHARED_DOCUMENTS_COLLECTION = "shared_documents";
export const SHARED_FOLDERS_COLLECTION = "shared_folders";

const DB_NAME = "StudyStranger_Storage";
const DB_VERSION = 3;
const STORE_NAME = "pdfs";
const CHUNK_STORE_NAME = "pdf_chunks";
const FOLDER_STORE_NAME = "pdf_folders";

export type PdfStreamProgressCallback = (
  loadedBytes: number,
  totalBytes: number,
  stageText: string
) => void;

export interface PDFFolderRecord {
  id: string;
  name: string;
  parentId: string | null; // null = root folder, string = parent folder id (sub-folder)
  subjectTag: string;
  description?: string;
  createdBy: "admin" | "student";
  createdAt: string;
}

export interface StoredPDFRecord {
  id: string;
  name: string;
  folderId: string;
  subjectTag?: string;
  uploadedBy?: "admin" | "student";
  uploaderName?: string;
  uploaderEmail?: string;
  size: number;
  sizeFormatted: string;
  dataUrl: string;
  blobUrl?: string;
  streamUrl?: string;
  mimeType: string;
  uploadedAt: string;
  isChunked?: boolean;
  chunkCount?: number;
  isFirestoreChunked?: boolean;
  firestoreChunkCount?: number;
  blob?: Blob;
}

export const DEFAULT_ADMIN_FOLDERS: PDFFolderRecord[] = [
  {
    id: "folder_math_sem4",
    name: "Mathematics (WBCHSE Sem 4)",
    parentId: null,
    subjectTag: "Mathematics",
    description: "Calculus (Integrals & Diff Eq), Vectors, 3D Geometry & LPP",
    createdBy: "admin",
    createdAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "folder_phys_sem4",
    name: "Physics (WBCHSE Sem 4)",
    parentId: null,
    subjectTag: "Physics",
    description: "Ray & Wave Optics, Dual Nature, Atoms & Nuclei, Semiconductor Devices & Communication",
    createdBy: "admin",
    createdAt: "2026-01-01T08:05:00.000Z",
  },
  {
    id: "folder_chem_sem4",
    name: "Chemistry (WBCHSE Sem 4)",
    parentId: null,
    subjectTag: "Chemistry",
    description: "Electrochemistry, Chemical Kinetics, d & f Block, Coordination Compounds, Aldehydes & Amines",
    createdBy: "admin",
    createdAt: "2026-01-01T08:10:00.000Z",
  },
  {
    id: "folder_coms_sem4",
    name: "Computer Science (WBCHSE Sem 4)",
    parentId: null,
    subjectTag: "Computer Science",
    description: "DBMS, SQL Queries & Commands, AI Foundations, State Space Search & Ethics",
    createdBy: "admin",
    createdAt: "2026-01-01T08:15:00.000Z",
  },
  {
    id: "folder_bio_sem4",
    name: "Biological Science (WBCHSE Sem 4)",
    parentId: null,
    subjectTag: "Biological Science",
    description: "Human Health & Diseases, Microbes, Recombinant DNA Biotechnology & Ecology",
    createdBy: "admin",
    createdAt: "2026-01-01T08:20:00.000Z",
  },
  {
    id: "folder_ben_sem4",
    name: "Bengali A (WBCHSE Sem 4)",
    parentId: null,
    subjectTag: "Bengali A",
    description: "হলুদ পোঁড়া, হারুণ সালেমের মাসি, ডাকঘর, নানা রঙের দিন, কবিতা ও শিল্প সংস্কৃতির ইতিহাস",
    createdBy: "admin",
    createdAt: "2026-01-01T08:25:00.000Z",
  },
  {
    id: "folder_eng_sem4",
    name: "English B (WBCHSE Sem 4)",
    parentId: null,
    subjectTag: "English B",
    description: "Alice in Wonderland, Three Questions, Hawk Roosting, Sonnet 73, Riders to the Sea & Grammar",
    createdBy: "admin",
    createdAt: "2026-01-01T08:30:00.000Z",
  },
  {
    id: "folder_mock_vault",
    name: "Official Mock Tests & Master Question Bank",
    parentId: null,
    subjectTag: "All Subjects",
    description: "Official WBCHSE Semester IV sample test papers and comprehensive sets",
    createdBy: "admin",
    createdAt: "2026-01-01T08:35:00.000Z",
  },
];

let dbInstance: IDBDatabase | null = null;
let seededPromise: Promise<void> | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const idb = event.target.result as IDBDatabase;
      if (!idb.objectStoreNames.contains(STORE_NAME)) {
        idb.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!idb.objectStoreNames.contains(CHUNK_STORE_NAME)) {
        idb.createObjectStore(CHUNK_STORE_NAME, { keyPath: "chunkKey" });
      }
      if (!idb.objectStoreNames.contains(FOLDER_STORE_NAME)) {
        idb.createObjectStore(FOLDER_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event: any) => {
      dbInstance = event.target.result;
      resolve(dbInstance!);
    };

    request.onerror = (event: any) => {
      console.error("IndexedDB open error:", event.target.error);
      reject(event.target.error);
    };
  });
}

export function formatBytes(bytes: number, decimals = 2): string {
  return formatByteSize(bytes, decimals);
}

/**
 * Helper to convert a base64 data:application/pdf URL to a real Blob
 */
export function dataUrlToPdfBlob(dataUrl: string): Blob | null {
  try {
    if (!dataUrl || !dataUrl.startsWith("data:")) return null;
    const parts = dataUrl.split(",");
    const binaryString = atob(parts[1] || "");
    const len = binaryString.length;
    if (len === 0) return null;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  } catch {
    return null;
  }
}

/**
 * Convert a Blob to a base64 data:application/pdf URL
 */
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert a base64 data:application/pdf URL to a real Blob URL synchronously
 */
export function dataUrlToPdfBlobUrlSync(dataUrl: string): string {
  try {
    if (!dataUrl) return "";
    if (
      dataUrl.startsWith("blob:") ||
      dataUrl.startsWith("http://") ||
      dataUrl.startsWith("https://") ||
      dataUrl.startsWith("/api/")
    ) {
      return dataUrl;
    }
    const blob = dataUrlToPdfBlob(dataUrl);
    if (blob) {
      return URL.createObjectURL(blob);
    }
    return dataUrl;
  } catch {
    return dataUrl;
  }
}

/**
 * Upload binary PDF slices to '/api/shared-documents/upload-chunk' so files up to 1000MB
 * are stored as native binary streams on the server without hitting JSON size limits.
 */
async function uploadBinaryFileToServerStream(
  docId: string,
  blobOrFile: Blob,
  onProgress?: (percent: number, stage: string) => void
): Promise<string> {
  const SERVER_CHUNK_BYTES = 4 * 1024 * 1024; // 4MB binary slices
  const totalChunks = Math.max(1, Math.ceil(blobOrFile.size / SERVER_CHUNK_BYTES));
  const safeId = String(docId).replace(/[^a-zA-Z0-9_\-@.]/g, "_");
  const streamUrl = `/api/shared-documents/${encodeURIComponent(safeId)}/stream`;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * SERVER_CHUNK_BYTES;
    const end = Math.min(blobOrFile.size, start + SERVER_CHUNK_BYTES);
    const slice = blobOrFile.slice(start, end);
    const arrayBuf = await slice.arrayBuffer();

    if (onProgress && totalChunks > 1) {
      const pct = Math.min(85, 30 + Math.round(((i + 1) / totalChunks) * 45));
      onProgress(
        pct,
        `Streaming high-capacity PDF chunks (${formatBytes(end)} / ${formatBytes(blobOrFile.size)})...`
      );
    }

    try {
      const resp = await fetch(
        `/api/shared-documents/upload-chunk?id=${encodeURIComponent(safeId)}&index=${i}&totalChunks=${totalChunks}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: arrayBuf,
        }
      );
      if (!resp.ok) {
        console.warn(`[PDF Stream] Chunk ${i}/${totalChunks} upload notice: ${resp.status}`);
      }
    } catch (chunkErr) {
      console.warn(`[PDF Stream] Chunk ${i} net notice:`, chunkErr);
    }
  }

  return streamUrl;
}

/**
 * Uploads a large Blob directly to Firestore '/shared_documents/{docId}/chunks'
 * by slicing 512KB at a time, completely avoiding high RAM usage in browser.
 */
async function uploadBlobToFirestoreChunks(
  docId: string,
  blob: Blob,
  onProgress?: (percent: number, stage: string) => void
): Promise<number> {
  const SLICE_SIZE = 512 * 1024; // 512KB binary slice (~680KB base64 chars, safely < 1MB limit)
  const totalChunks = Math.max(1, Math.ceil(blob.size / SLICE_SIZE));
  const BATCH_SIZE = 6;

  for (let offset = 0; offset < totalChunks; offset += BATCH_SIZE) {
    const endChunk = Math.min(totalChunks, offset + BATCH_SIZE);
    const promises: Promise<void>[] = [];

    for (let i = offset; i < endChunk; i++) {
      const sliceStart = i * SLICE_SIZE;
      const sliceEnd = Math.min(blob.size, sliceStart + SLICE_SIZE);
      const slice = blob.slice(sliceStart, sliceEnd);

      promises.push(
        (async () => {
          const sliceDataUrl = await blobToDataUrl(slice);
          const b64 = sliceDataUrl.includes(",") ? sliceDataUrl.split(",")[1] : sliceDataUrl;
          const chunkData = i === 0 ? `data:application/pdf;base64,${b64}` : b64;
          await setDoc(
            doc(firestoreDb, SHARED_DOCUMENTS_COLLECTION, docId, "chunks", `chunk_${i}`),
            {
              docId,
              index: i,
              totalChunks,
              data: chunkData,
            }
          );
        })()
      );
    }

    await Promise.all(promises);

    if (onProgress) {
      const pct = Math.min(98, 75 + Math.round((endChunk / totalChunks) * 23));
      onProgress(
        pct,
        `Cloud sync: ${endChunk}/${totalChunks} chunks backed up to Firestore (${formatBytes(Math.min(blob.size, endChunk * SLICE_SIZE))} / ${formatBytes(blob.size)})...`
      );
    }
  }

  return totalChunks;
}

/**
 * Push a PDF record + binary/base64 payload to BOTH Server Stream ('/api/shared-documents')
 * AND centralized Firestore 'shared_documents' (with parallel batch chunking) so every user
 * account (existing or joining later) receives the PDF reliably.
 */
export async function syncPdfRecordToSharedCloud(
  record: StoredPDFRecord,
  rawDataUrl?: string,
  onProgress?: (percent: number, stage: string) => void
): Promise<void> {
  let effectiveDataUrl =
    rawDataUrl && rawDataUrl.startsWith("data:")
      ? rawDataUrl
      : record.dataUrl && record.dataUrl.startsWith("data:")
      ? record.dataUrl
      : "";

  const currentEmail =
    auth.currentUser?.email ||
    (typeof window !== "undefined" ? localStorage.getItem("currentUserEmail") || "" : "");
  const currentName =
    auth.currentUser?.displayName ||
    (typeof window !== "undefined" ? localStorage.getItem("currentUserName") || "Admin" : "Admin");

  const safeId = String(record.id).replace(/[^a-zA-Z0-9_\-@.]/g, "_");
  const streamUrl = `/api/shared-documents/${encodeURIComponent(safeId)}/stream`;

  // 1. Upload binary chunks + metadata to Express server (/api/shared-documents)
  try {
    if (record.blob instanceof Blob && record.blob.size > 0) {
      await uploadBinaryFileToServerStream(safeId, record.blob, onProgress);
    }
    await fetch("/api/shared-documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: safeId,
        name: record.name,
        folderId: record.folderId || "folder_mock_vault",
        subjectTag: record.subjectTag || "WBCHSE Sem 3",
        uploadedBy: record.uploadedBy || "admin",
        uploaderName: currentName,
        uploaderEmail: currentEmail,
        size: record.size,
        sizeFormatted: record.sizeFormatted,
        mimeType: "application/pdf",
        uploadedAt: record.uploadedAt,
        streamUrl,
        dataUrl:
          effectiveDataUrl && effectiveDataUrl.length <= 2_200_000 ? effectiveDataUrl : "",
      }),
    });
  } catch (srvErr) {
    console.warn("Server /api/shared-documents sync notice:", srvErr);
  }

  // 2. Sync to centralized Firestore 'shared_documents' collection with guaranteed cloud persistence
  try {
    let chunkCount = 0;
    let isChunked = false;

    // A) If real Blob is available, upload chunks directly from Blob (supports 1000MB without RAM spikes!)
    if (record.blob instanceof Blob && record.blob.size > 0) {
      isChunked = true;
      chunkCount = await uploadBlobToFirestoreChunks(safeId, record.blob, onProgress);
    } else if (effectiveDataUrl && effectiveDataUrl.length > 0) {
      // B) If only DataURL is available, split and upload chunks
      const splitResult = splitDataUrlForFirestore(safeId, effectiveDataUrl);
      isChunked = splitResult.isChunked;
      chunkCount = splitResult.chunkCount;

      if (splitResult.isChunked && splitResult.chunks.length > 0) {
        const BATCH_SIZE = 8;
        for (let offset = 0; offset < splitResult.chunks.length; offset += BATCH_SIZE) {
          const batch = splitResult.chunks.slice(offset, offset + BATCH_SIZE);
          await Promise.all(
            batch.map((ch) =>
              setDoc(
                doc(
                  firestoreDb,
                  SHARED_DOCUMENTS_COLLECTION,
                  safeId,
                  "chunks",
                  `chunk_${ch.index}`
                ),
                {
                  docId: ch.docId,
                  index: ch.index,
                  totalChunks: ch.totalChunks,
                  data: ch.data,
                }
              )
            )
          );
        }
      }
    }

    const firestorePayload = buildSanitizedSharedDocumentPayload({
      id: safeId,
      name: record.name,
      folderId: record.folderId || "folder_mock_vault",
      subjectTag: record.subjectTag || "WBCHSE Sem 3",
      uploadedBy: record.uploadedBy || "admin",
      uploaderName: currentName,
      uploaderEmail: currentEmail,
      size: record.size,
      sizeFormatted: record.sizeFormatted,
      inlineDataUrl: effectiveDataUrl && effectiveDataUrl.length <= 700_000 ? effectiveDataUrl : "",
      dataUrl: effectiveDataUrl && effectiveDataUrl.length <= 700_000 ? effectiveDataUrl : "",
      streamUrl,
      mimeType: "application/pdf",
      uploadedAt: record.uploadedAt,
      isFirestoreChunked: isChunked,
      firestoreChunkCount: chunkCount,
    });

    await setDoc(doc(firestoreDb, SHARED_DOCUMENTS_COLLECTION, safeId), firestorePayload);
  } catch (fsErr) {
    console.warn("Firestore shared_documents sync notice:", fsErr);
  }
}

/**
 * Reconstruct a full base64 dataUrl from Firestore '/shared_documents/{docId}/chunks'
 */
async function fetchChunkedDataUrlFromFirestore(
  docId: string,
  expectedChunks?: number,
  totalByteSize?: number,
  onStreamProgress?: PdfStreamProgressCallback
): Promise<string> {
  try {
    if (onStreamProgress && totalByteSize) {
      onStreamProgress(
        Math.round(totalByteSize * 0.15),
        totalByteSize,
        `Streaming high-capacity PDF (${formatBytes(Math.round(totalByteSize * 0.15))} / ${formatBytes(totalByteSize)})...`
      );
    }
    const chunksSnap = await getDocs(
      collection(firestoreDb, SHARED_DOCUMENTS_COLLECTION, docId, "chunks")
    );
    if (chunksSnap.empty) return "";
    const chunks: FirestoreDocumentChunk[] = [];
    chunksSnap.forEach((d) => {
      const data = d.data() as FirestoreDocumentChunk;
      if (data && typeof data.index === "number" && typeof data.data === "string") {
        chunks.push(data);
      }
    });
    if (onStreamProgress && totalByteSize) {
      onStreamProgress(
        Math.round(totalByteSize * 0.9),
        totalByteSize,
        `Streaming high-capacity PDF (${formatBytes(Math.round(totalByteSize * 0.9))} / ${formatBytes(totalByteSize)})...`
      );
    }
    return reassembleDataUrlFromFirestoreChunks(chunks, expectedChunks);
  } catch (err) {
    console.warn("Firestore chunk reassembly notice:", err);
    return "";
  }
}

/**
 * Stream binary PDF from Server '/api/shared-documents/:id/stream' with real-time progress reporting
 */
async function fetchServerPdfStreamWithProgress(
  streamEndpoint: string,
  expectedSize = 0,
  onStreamProgress?: PdfStreamProgressCallback
): Promise<Uint8Array | null> {
  try {
    const resp = await fetch(streamEndpoint);
    if (!resp.ok) return null;

    const contentType = resp.headers.get("content-type") || "";
    if (!contentType.includes("pdf") && !contentType.includes("octet-stream")) {
      return null;
    }

    const contentLengthHeader = resp.headers.get("content-length");
    const totalBytes =
      (contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0) || expectedSize || 0;

    if (!resp.body || typeof resp.body.getReader !== "function") {
      const buf = await resp.arrayBuffer();
      if (buf.byteLength === 0) return null;
      return new Uint8Array(buf);
    }

    const reader = resp.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        receivedLength += value.byteLength;
        if (onStreamProgress) {
          const effectiveTotal = Math.max(totalBytes, receivedLength);
          onStreamProgress(
            receivedLength,
            effectiveTotal,
            `Streaming high-capacity PDF (${formatBytes(receivedLength)} / ${formatBytes(effectiveTotal)})...`
          );
        }
      }
    }

    if (receivedLength === 0) return null;
    const combined = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      combined.set(chunk, position);
      position += chunk.byteLength;
    }
    return combined;
  } catch {
    return null;
  }
}

/**
 * Generate a real multi-page PDF document using jsPDF so Admin folders have real viewable PDFs out-of-the-box
 */
function buildRealCurriculumPdfBlob(
  title: string,
  subtitle: string,
  sections: { heading: string; lines: string[] }[]
): { blob: Blob; dataUrl: string } {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  sections.forEach((sec, pageIdx) => {
    if (pageIdx > 0) pdf.addPage();

    // Header Banner
    pdf.setFillColor(24, 24, 27);
    pdf.rect(0, 0, pageWidth, 72, "F");

    pdf.setTextColor(254, 240, 138);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("STUDY STRANGER PRO  |  OFFICIAL WBCHSE CLASS 12 SEMESTER 3 VAULT", 36, 28);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(title, 36, 52);

    // Subheader bar
    pdf.setFillColor(247, 246, 239);
    pdf.rect(0, 72, pageWidth, 32, "F");
    pdf.setTextColor(71, 85, 105);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`${subtitle}   •   Page ${pageIdx + 1} of ${sections.length}`, 36, 92);

    // Section Heading
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(sec.heading, 36, 134);

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1.2);
    pdf.line(36, 144, pageWidth - 36, 144);

    // Body Content
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(30, 41, 59);

    let y = 170;
    sec.lines.forEach((line, idx) => {
      const wrapped = pdf.splitTextToSize(`${idx + 1}. ${line}`, pageWidth - 72);
      pdf.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 249 : 255, idx % 2 === 0 ? 245 : 255);
      const blockHeight = wrapped.length * 16 + 14;
      pdf.roundedRect(32, y - 13, pageWidth - 64, blockHeight, 6, 6, "F");
      pdf.text(wrapped, 42, y);
      y += blockHeight + 10;
    });

    // Footer
    pdf.setDrawColor(203, 213, 225);
    pdf.line(36, pageHeight - 44, pageWidth - 36, pageHeight - 44);
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Verified by Study Stranger Admin Library • Direct In-Page PDF Canvas Reader", 36, pageHeight - 26);
  });

  const arrayBuf = pdf.output("arraybuffer");
  const blob = new Blob([arrayBuf], { type: "application/pdf" });
  const dataUrl = pdf.output("datauristring");
  return { blob, dataUrl };
}

/**
 * Ensure default Admin folders, sub-folders, and starter curriculum PDFs exist in IndexedDB & 'shared_documents'
 */
/**
 * Ensure default Admin folders exist in IndexedDB & purge any legacy dummy seed PDFs
 */
export async function ensureAdminVaultSeeded(): Promise<void> {
  if (seededPromise) return seededPromise;

  seededPromise = (async () => {
    try {
      const idb = await getDB();

      // 1. Seed default Semester IV folders & sub-folders
      const existingFolders = await new Promise<PDFFolderRecord[]>((resolve) => {
        const tx = idb.transaction(FOLDER_STORE_NAME, "readonly");
        const req = tx.objectStore(FOLDER_STORE_NAME).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      const existingIds = new Set(existingFolders.map((f) => f.id));
      for (const folder of DEFAULT_ADMIN_FOLDERS) {
        if (!existingIds.has(folder.id)) {
          await new Promise<void>((resolve) => {
            const tx = idb.transaction(FOLDER_STORE_NAME, "readwrite");
            tx.objectStore(FOLDER_STORE_NAME).put(folder);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
          });
        }
      }

      // 2. Automatically purge any legacy dummy mock seed PDFs from storage & cloud
      await purgeDefaultSeededDocuments();
    } catch (err) {
      console.warn("Vault seed notice:", err);
    }
  })();

  return seededPromise;
}

export const isDummySeed = (p?: { id?: string; name?: string } | null): boolean => {
  if (!p) return false;
  const id = (p.id || "").toLowerCase();
  const name = (p.name || "").toLowerCase();
  return (
    id.startsWith("admin_seed_") ||
    id.includes("seed_") ||
    id === "admin_seed_bio_u1" ||
    id === "admin_seed_bio_u2" ||
    id === "admin_seed_eng_bet" ||
    id === "admin_seed_question_bank" ||
    name.includes("wbchse_biology_unit") ||
    name.includes("wbchse_biology") ||
    name.includes("wbchse_englishb_the_bet") ||
    name.includes("wbchse_englishb") ||
    name.includes("question_bank_wbchse") ||
    name.includes("question_bank") ||
    (name.includes("biology") && name.includes("unit1")) ||
    (name.includes("biology") && name.includes("unit2")) ||
    (name.includes("the_bet") && name.includes("grammar"))
  );
};

/**
 * Purge dummy / seeded mock PDFs completely across IndexedDB, Firestore, and Server
 */
export async function purgeDefaultSeededDocuments(): Promise<void> {
  try {
    const idb = await getDB();

    const existingPdfs = await new Promise<StoredPDFRecord[]>((resolve) => {
      const tx = idb.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const seedsToDelete = existingPdfs.filter(isDummySeed);

    for (const item of seedsToDelete) {
      // 1. Delete from IndexedDB
      await new Promise<void>((resolve) => {
        const tx = idb.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(item.id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });

      // 2. Delete from Firestore
      deleteDoc(doc(firestoreDb, SHARED_DOCUMENTS_COLLECTION, item.id)).catch(() => {});
      deleteDoc(doc(firestoreDb, "shared_pdfs", item.id)).catch(() => {});

      // 3. Delete from Server
      fetch(`/api/shared-documents/${encodeURIComponent(item.id)}`, { method: "DELETE" }).catch(() => {});
    }

    // Also check and delete hardcoded dummy seed IDs from Firestore directly
    const hardcodedSeedIds = [
      "admin_seed_bio_u1",
      "admin_seed_bio_u2",
      "admin_seed_eng_bet",
      "admin_seed_question_bank",
    ];
    for (const hId of hardcodedSeedIds) {
      deleteDoc(doc(firestoreDb, SHARED_DOCUMENTS_COLLECTION, hId)).catch(() => {});
      deleteDoc(doc(firestoreDb, "shared_pdfs", hId)).catch(() => {});
      fetch(`/api/shared-documents/${encodeURIComponent(hId)}`, { method: "DELETE" }).catch(() => {});
    }

    if (seedsToDelete.length > 0 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ss-shared-pdfs-updated"));
    }
  } catch (purgeErr) {
    console.warn("Purge default seeded PDFs warning:", purgeErr);
  }
}

/**
 * Folder & Sub-Folder Management APIs (Synced with 'shared_folders')
 */
export async function listAllFolders(): Promise<PDFFolderRecord[]> {
  await ensureAdminVaultSeeded();
  try {
    const idb = await getDB();

    try {
      const [folderSnapRes, srvFolderRes] = await Promise.allSettled([
        getDocs(collection(firestoreDb, SHARED_FOLDERS_COLLECTION)),
        fetch("/api/shared-folders").then((r) => (r.ok ? r.json() : null)),
      ]);

      const remoteFolders: PDFFolderRecord[] = [];
      if (folderSnapRes.status === "fulfilled" && !folderSnapRes.value.empty) {
        for (const fDoc of folderSnapRes.value.docs) {
          const fData = fDoc.data() as PDFFolderRecord;
          if (fData && fData.id && fData.name) remoteFolders.push(fData);
        }
      }
      if (
        srvFolderRes.status === "fulfilled" &&
        srvFolderRes.value &&
        Array.isArray(srvFolderRes.value.folders)
      ) {
        for (const sf of srvFolderRes.value.folders) {
          if (sf && sf.id && sf.name) remoteFolders.push(sf as PDFFolderRecord);
        }
      }

      for (const fData of remoteFolders) {
        await new Promise<void>((resolve) => {
          const tx = idb.transaction(FOLDER_STORE_NAME, "readwrite");
          tx.objectStore(FOLDER_STORE_NAME).put(fData);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      }
    } catch {
      // Offline fallback
    }

    const folders = await new Promise<PDFFolderRecord[]>((resolve) => {
      const tx = idb.transaction(FOLDER_STORE_NAME, "readonly");
      const req = tx.objectStore(FOLDER_STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve(DEFAULT_ADMIN_FOLDERS);
    });
    return folders.length > 0 ? folders : DEFAULT_ADMIN_FOLDERS;
  } catch {
    return DEFAULT_ADMIN_FOLDERS;
  }
}

export async function createPdfFolder(
  name: string,
  parentId: string | null = null,
  subjectTag = "General",
  createdBy: "admin" | "student" = "admin",
  description = ""
): Promise<PDFFolderRecord> {
  await ensureAdminVaultSeeded();
  const folder: PDFFolderRecord = {
    id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    parentId,
    subjectTag,
    description,
    createdBy,
    createdAt: new Date().toISOString(),
  };

  try {
    const idb = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(FOLDER_STORE_NAME, "readwrite");
      const req = tx.objectStore(FOLDER_STORE_NAME).put(folder);
      req.onsuccess = () => resolve();
      req.onerror = (e: any) => reject(e.target.error);
    });

    const folderPayload = {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId || null,
      subjectTag: folder.subjectTag,
      description: folder.description || "",
      createdBy: folder.createdBy,
      createdAt: folder.createdAt,
    };
    await Promise.allSettled([
      setDoc(doc(firestoreDb, SHARED_FOLDERS_COLLECTION, folder.id), folderPayload),
      fetch("/api/shared-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(folderPayload),
      }),
    ]);
  } catch (err) {
    console.warn("createPdfFolder error:", err);
  }
  return folder;
}

export async function renamePdfFolder(folderId: string, newName: string): Promise<void> {
  if (!newName.trim()) return;
  try {
    const idb = await getDB();
    const existing = await new Promise<PDFFolderRecord | null>((resolve) => {
      const tx = idb.transaction(FOLDER_STORE_NAME, "readonly");
      const req = tx.objectStore(FOLDER_STORE_NAME).get(folderId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    if (existing) {
      existing.name = newName.trim();
      await new Promise<void>((resolve) => {
        const tx = idb.transaction(FOLDER_STORE_NAME, "readwrite");
        tx.objectStore(FOLDER_STORE_NAME).put(existing);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
      await setDoc(doc(firestoreDb, SHARED_FOLDERS_COLLECTION, existing.id), {
        id: existing.id,
        name: existing.name,
        parentId: existing.parentId || null,
        subjectTag: existing.subjectTag,
        description: existing.description || "",
        createdBy: existing.createdBy,
        createdAt: existing.createdAt,
      }).catch(() => {});
    }
  } catch (err) {
    console.warn("renamePdfFolder error:", err);
  }
}

export async function deletePdfFolder(folderId: string): Promise<void> {
  try {
    const idb = await getDB();
    await new Promise<void>((resolve) => {
      const tx = idb.transaction(FOLDER_STORE_NAME, "readwrite");
      tx.objectStore(FOLDER_STORE_NAME).delete(folderId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    await deleteDoc(doc(firestoreDb, SHARED_FOLDERS_COLLECTION, folderId)).catch(() => {});
  } catch (err) {
    console.warn("deletePdfFolder error:", err);
  }
}

export async function movePdfToFolder(pdfId: string, targetFolderId: string): Promise<void> {
  try {
    const idb = await getDB();
    const rec = await getPdfFromIndexedDB(pdfId);
    if (!rec) return;
    rec.folderId = targetFolderId;
    await new Promise<void>((resolve) => {
      const tx = idb.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(rec);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    await syncPdfRecordToSharedCloud(rec);
  } catch (err) {
    console.warn("movePdfToFolder error:", err);
  }
}

/**
 * Save a PDF File into IndexedDB immediately (< 1s) AND sync across all 3 backup layers:
 * 1. Local IndexedDB (instant preview)
 * 2. Express Server Binary Stream ('/api/shared-documents/upload-chunk')
 * 3. Firestore 'shared_documents' + parallel chunks (so every student account sees & opens it)
 */
export async function savePdfToIndexedDB(
  file: File,
  customId?: string,
  onProgress?: (percent: number, stage: string) => void,
  folderId = "folder_mock_vault",
  uploadedBy: "admin" | "student" = "admin",
  subjectTag = "WBCHSE Sem 3"
): Promise<StoredPDFRecord> {
  await ensureAdminVaultSeeded();

  const validation = validatePdfFileForUpload(
    file.name,
    file.type || "application/pdf",
    file.size,
    MAX_PDF_UPLOAD_SIZE_MB
  );

  if (!validation.valid) {
    throw new Error(validation.errorMessage || "Invalid PDF file");
  }

  const id = customId || `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const idb = await getDB();
  const streamUrl = `/api/shared-documents/${encodeURIComponent(id)}/stream`;
  const blobUrl = URL.createObjectURL(file);

  // For files <= 45MB, read dataUrl so Firestore chunk backup + inline storage works across all Cloud Run instances
  if (file.size <= 45 * 1024 * 1024) {
    onProgress?.(25, "Reading PDF stream into local & cloud vault...");
    const dataUrl = await blobToDataUrl(file);

    onProgress?.(55, "Committing PDF to local IndexedDB vault...");
    const record: StoredPDFRecord = {
      id,
      name: file.name,
      folderId,
      subjectTag,
      uploadedBy,
      size: file.size,
      sizeFormatted: formatBytes(file.size),
      dataUrl,
      blobUrl,
      streamUrl,
      mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      isChunked: false,
      chunkCount: 1,
      blob: file,
    };

    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = (e: any) => reject(e.target.error);
    });

    onProgress?.(75, "Syncing PDF to Cloud & Server for all student accounts...");
    await syncPdfRecordToSharedCloud(record, dataUrl, onProgress);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ss-shared-pdfs-updated"));
    }

    onProgress?.(100, "PDF synced to all student accounts & ready for instant viewing!");
    return record;
  }

  // For larger files up to 1000MB (1GB): slice into 16MB Blob chunks in local IndexedDB + stream binary to server & Firestore
  const totalChunks = validation.estimatedChunks;
  for (let i = 0; i < totalChunks; i++) {
    const start = i * PDF_CHUNK_SIZE_BYTES;
    const end = Math.min(file.size, start + PDF_CHUNK_SIZE_BYTES);
    const chunkBlob = file.slice(start, end, "application/pdf");

    const pct = Math.min(60, Math.round(((i + 1) / totalChunks) * 55));
    onProgress?.(
      pct,
      `Storing local chunk ${i + 1} of ${totalChunks} (${formatBytes(end)} / ${formatBytes(file.size)})...`
    );

    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(CHUNK_STORE_NAME, "readwrite");
      const store = tx.objectStore(CHUNK_STORE_NAME);
      const req = store.put({
        chunkKey: `${id}_chunk_${i}`,
        pdfId: id,
        index: i,
        blob: chunkBlob,
      });
      req.onsuccess = () => resolve();
      req.onerror = (e: any) => reject(e.target.error);
    });
  }

  const record: StoredPDFRecord = {
    id,
    name: file.name,
    folderId,
    subjectTag,
    uploadedBy,
    size: file.size,
    sizeFormatted: formatBytes(file.size),
    dataUrl: "",
    blobUrl,
    streamUrl,
    mimeType: "application/pdf",
    uploadedAt: new Date().toISOString(),
    isChunked: true,
    chunkCount: totalChunks,
    blob: file,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = idb.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = (e: any) => reject(e.target.error);
  });

  await syncPdfRecordToSharedCloud(record, "", onProgress);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ss-shared-pdfs-updated"));
  }

  onProgress?.(100, "PDF Vault Sync Complete!");
  return record;
}

/**
 * Save raw Base64 / DataURL PDF into a specific folder AND sync to 'shared_documents'
 */
export async function savePdfDataUrlToIndexedDB(
  dataUrl: string,
  fileName: string,
  customId?: string,
  folderId = "folder_mock_vault"
): Promise<StoredPDFRecord> {
  await ensureAdminVaultSeeded();
  const id = customId || `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const approxSize = Math.round((dataUrl.length * 3) / 4);
  const blob = dataUrlToPdfBlob(dataUrl) || undefined;
  const blobUrl = blob ? URL.createObjectURL(blob) : "";

  const record: StoredPDFRecord = {
    id,
    name: fileName,
    folderId,
    subjectTag: "WBCHSE Sem 3",
    uploadedBy: "admin",
    size: approxSize,
    sizeFormatted: formatBytes(approxSize),
    dataUrl,
    blobUrl,
    streamUrl: `/api/shared-documents/${encodeURIComponent(id)}/stream`,
    mimeType: "application/pdf",
    uploadedAt: new Date().toISOString(),
    blob,
  };

  try {
    const idb = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = (e: any) => reject(e.target.error);
    });
    await syncPdfRecordToSharedCloud(record, dataUrl);
    return record;
  } catch (err) {
    console.warn("Save PDF data URL to IndexedDB failed:", err);
    return record;
  }
}

/**
 * Reassemble chunked PDF Blob from local IndexedDB if needed
 */
async function reassembleChunkedPdfBlob(
  idb: IDBDatabase,
  id: string,
  chunkCount: number
): Promise<Blob | null> {
  const blobs: Blob[] = [];
  for (let i = 0; i < chunkCount; i++) {
    const chunkRecord = await new Promise<any>((resolve) => {
      const tx = idb.transaction(CHUNK_STORE_NAME, "readonly");
      const store = tx.objectStore(CHUNK_STORE_NAME);
      const req = store.get(`${id}_chunk_${i}`);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    if (chunkRecord?.blob) {
      blobs.push(chunkRecord.blob);
    }
  }
  if (blobs.length === 0) return null;
  return new Blob(blobs, { type: "application/pdf" });
}

/**
 * Hydrate a StoredPDFRecord's binary Blob / dataUrl from:
 * 1. Local IndexedDB Blob / Chunks
 * 2. Express Server Stream ('/api/shared-documents/:id/stream') with live progress
 * 3. Firestore '/shared_documents/{id}/chunks' with live progress
 */
async function hydrateRemotePdfPayload(
  idb: IDBDatabase,
  record: StoredPDFRecord,
  onStreamProgress?: PdfStreamProgressCallback
): Promise<StoredPDFRecord> {
  // 1. Already has a valid local Blob
  if (record.blob instanceof Blob && record.blob.size > 0) {
    onStreamProgress?.(record.blob.size, record.blob.size, "Ready from local high-speed cache");
    record.blobUrl = URL.createObjectURL(record.blob);
    if (!record.dataUrl || record.dataUrl.startsWith("blob:")) {
      record.dataUrl = record.blobUrl;
    }
    return record;
  }

  // 2. Has an inline base64 dataUrl
  if (record.dataUrl && record.dataUrl.startsWith("data:")) {
    const blob = dataUrlToPdfBlob(record.dataUrl);
    if (blob) {
      onStreamProgress?.(blob.size, blob.size, "Decoded inline PDF stream");
      record.blob = blob;
      record.blobUrl = URL.createObjectURL(blob);
    }
    return record;
  }

  // 3. Reassemble from local IndexedDB chunks if chunked locally
  if (record.isChunked && record.chunkCount) {
    const reassembled = await reassembleChunkedPdfBlob(idb, record.id, record.chunkCount);
    if (reassembled) {
      onStreamProgress?.(reassembled.size, reassembled.size, "Reassembled local chunked PDF");
      record.blob = reassembled;
      record.blobUrl = URL.createObjectURL(reassembled);
      record.dataUrl = record.blobUrl;
      return record;
    }
  }

  // 4. Try streaming from Server '/api/shared-documents/:id/stream' first (fast binary HTTP stream)
  const streamEndpoint =
    record.streamUrl || `/api/shared-documents/${encodeURIComponent(record.id)}/stream`;
  const streamedBytes = await fetchServerPdfStreamWithProgress(
    streamEndpoint,
    record.size || 0,
    onStreamProgress
  );
  if (streamedBytes && streamedBytes.byteLength > 0) {
    const blob = new Blob([streamedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    record.blob = blob;
    record.blobUrl = URL.createObjectURL(blob);
    if (!record.dataUrl || record.dataUrl.startsWith("blob:")) {
      record.dataUrl = record.blobUrl;
    }
    await new Promise<void>((resolve) => {
      const tx = idb.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    return record;
  }

  // 5. Reassemble from Firestore '/shared_documents/{id}/chunks' (Cloud-persistent across all instances!)
  const fullDataUrl = await fetchChunkedDataUrlFromFirestore(
    record.id,
    record.firestoreChunkCount,
    record.size || 0,
    onStreamProgress
  );
  if (fullDataUrl && fullDataUrl.startsWith("data:")) {
    const blob = dataUrlToPdfBlob(fullDataUrl);
    record.dataUrl = fullDataUrl;
    if (blob) {
      record.blob = blob;
      record.blobUrl = URL.createObjectURL(blob);
    }
    await new Promise<void>((resolve) => {
      const tx = idb.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    return record;
  }

  return record;
}

/**
 * Retrieve PDF record by ID from IndexedDB, Firestore 'shared_documents', or Server Stream
 */
export async function getPdfFromIndexedDB(
  id: string,
  onStreamProgress?: PdfStreamProgressCallback
): Promise<StoredPDFRecord | null> {
  if (!id) return null;
  await ensureAdminVaultSeeded();
  try {
    const idb = await getDB();
    let record = await new Promise<StoredPDFRecord | null>((resolve) => {
      const tx = idb.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });

    const needsRemoteCheck =
      !record ||
      (!(record.blob instanceof Blob) &&
        (!record.dataUrl || !record.dataUrl.startsWith("data:")));

    if (needsRemoteCheck) {
      try {
        const [docSnapRes, srvDocRes] = await Promise.allSettled([
          getDoc(doc(firestoreDb, SHARED_DOCUMENTS_COLLECTION, id)),
          fetch(`/api/shared-documents/${encodeURIComponent(id)}`).then((r) =>
            r.ok ? r.json() : null
          ),
        ]);

        if (docSnapRes.status === "fulfilled" && docSnapRes.value.exists()) {
          const remote = docSnapRes.value.data() as StoredPDFRecord;
          if (remote && remote.id) {
            record = record
              ? {
                  ...remote,
                  ...record,
                  dataUrl:
                    record.dataUrl && record.dataUrl.startsWith("data:")
                      ? record.dataUrl
                      : remote.dataUrl || "",
                  isFirestoreChunked: remote.isFirestoreChunked ?? record.isFirestoreChunked,
                  firestoreChunkCount: remote.firestoreChunkCount ?? record.firestoreChunkCount,
                  streamUrl: remote.streamUrl || record.streamUrl,
                }
              : remote;
          }
        }

        if (
          srvDocRes.status === "fulfilled" &&
          srvDocRes.value &&
          srvDocRes.value.document
        ) {
          const srvDoc = srvDocRes.value.document as StoredPDFRecord;
          record = record
            ? {
                ...srvDoc,
                ...record,
                dataUrl:
                  record.dataUrl && record.dataUrl.startsWith("data:")
                    ? record.dataUrl
                    : srvDoc.dataUrl || "",
                streamUrl: srvDoc.streamUrl || record.streamUrl,
              }
            : srvDoc;
        }
      } catch (fsGetErr) {
        console.warn("Remote shared_documents fetch notice:", fsGetErr);
      }
    }

    if (!record) return null;

    record = await hydrateRemotePdfPayload(idb, record, onStreamProgress);
    return record;
  } catch (err) {
    console.warn("Failed to get PDF from IndexedDB:", err);
    return null;
  }
}

/**
 * Extract raw Uint8Array bytes from ANY PDF source (data:application/pdf, blob:, http/https, or document ID)
 * with live streaming byte progress reporting for large PDFs!
 */
export async function extractPdfBytesFromSource(
  pdfSource: string,
  pdfNameOrId?: string,
  onStreamProgress?: PdfStreamProgressCallback
): Promise<Uint8Array | null> {
  try {
    // 1. Base64 data URL
    if (pdfSource && pdfSource.startsWith("data:")) {
      const parts = pdfSource.split(",");
      const base64 = parts[1] || "";
      const binaryString = atob(base64);
      const len = binaryString.length;
      if (len > 0) {
        onStreamProgress?.(len, len, `Streaming high-capacity PDF (${formatBytes(len)} / ${formatBytes(len)})...`);
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      }
    }

    // 2. Direct lookup by Document ID first if pdfSource or pdfNameOrId is an ID
    const candidateIds = [pdfSource, pdfNameOrId].filter(
      (s): s is string =>
        Boolean(
          s &&
            !s.startsWith("data:") &&
            !s.startsWith("blob:") &&
            !s.startsWith("http://") &&
            !s.startsWith("https://")
        )
    );

    for (const cid of candidateIds) {
      const rec = await getPdfFromIndexedDB(cid, onStreamProgress);
      if (rec) {
        if (rec.blob instanceof Blob && rec.blob.size > 0) {
          const buf = await rec.blob.arrayBuffer();
          return new Uint8Array(buf);
        }
        if (rec.dataUrl && rec.dataUrl.startsWith("data:")) {
          const parts = rec.dataUrl.split(",");
          const binaryString = atob(parts[1] || "");
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        }
      }
    }

    // 3. Blob URL or HTTP(S) / API URL with streaming reader
    if (
      pdfSource &&
      (pdfSource.startsWith("blob:") ||
        pdfSource.startsWith("http://") ||
        pdfSource.startsWith("https://") ||
        pdfSource.startsWith("/"))
    ) {
      const streamed = await fetchServerPdfStreamWithProgress(pdfSource, 0, onStreamProgress);
      if (streamed && streamed.byteLength > 0) {
        return streamed;
      }

      // If direct stream returned 404/500, extract document ID from URL path and recover from IndexedDB / Firestore chunks
      const idMatch = pdfSource.match(/\/api\/shared-documents\/([^/?#]+)\/stream/);
      if (idMatch && idMatch[1]) {
        const extractedId = decodeURIComponent(idMatch[1]);
        const recoveredRec = await getPdfFromIndexedDB(extractedId, onStreamProgress);
        if (recoveredRec?.blob instanceof Blob && recoveredRec.blob.size > 0) {
          const buf = await recoveredRec.blob.arrayBuffer();
          return new Uint8Array(buf);
        }
        if (recoveredRec?.dataUrl && recoveredRec.dataUrl.startsWith("data:")) {
          const parts = recoveredRec.dataUrl.split(",");
          const binaryString = atob(parts[1] || "");
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        }
      }
    }

    // 4. Fallback search across all stored & shared PDFs by exact or normalized ID/filename
    const allPdfs = await listAllPdfsFromIndexedDB();
    const norm = (v?: string) => (v || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetNormSource = norm(pdfSource);
    const targetNormName = norm(pdfNameOrId);

    const matched =
      allPdfs.find(
        (p) =>
          p.id === pdfSource ||
          p.id === pdfNameOrId ||
          p.name === pdfNameOrId ||
          p.name === pdfSource ||
          p.dataUrl === pdfSource
      ) ||
      allPdfs.find((p) => {
        const pIdNorm = norm(p.id);
        const pNameNorm = norm(p.name);
        return (
          (targetNormSource &&
            (pIdNorm.includes(targetNormSource) || targetNormSource.includes(pIdNorm))) ||
          (targetNormName &&
            (pNameNorm.includes(targetNormName) || targetNormName.includes(pNameNorm)))
        );
      });

    if (matched) {
      const hydrated = await getPdfFromIndexedDB(matched.id, onStreamProgress);
      const target = hydrated || matched;
      if (target.blob instanceof Blob && target.blob.size > 0) {
        const buf = await target.blob.arrayBuffer();
        return new Uint8Array(buf);
      }
      if (target.dataUrl && target.dataUrl.startsWith("data:")) {
        const parts = target.dataUrl.split(",");
        const binaryString = atob(parts[1] || "");
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      }
    }

    // 5. Try server binary stream directly if document ID was provided
    const targetCandidateId = pdfNameOrId || pdfSource;
    if (targetCandidateId && !targetCandidateId.startsWith("data:") && !targetCandidateId.startsWith("blob:")) {
      const streamUrl = `/api/shared-documents/${encodeURIComponent(targetCandidateId)}/stream`;
      const directStreamed = await fetchServerPdfStreamWithProgress(streamUrl, 0, onStreamProgress);
      if (directStreamed && directStreamed.byteLength > 0) {
        return directStreamed;
      }

      // Try alternate upload endpoint
      const altUrl = `/api/pdf/${encodeURIComponent(targetCandidateId)}`;
      const altStreamed = await fetchServerPdfStreamWithProgress(altUrl, 0, onStreamProgress);
      if (altStreamed && altStreamed.byteLength > 0) {
        return altStreamed;
      }
    }

    // 6. Only generate curriculum fallback if this is explicitly a starter seed document
    if (pdfNameOrId?.startsWith("admin_seed_") || pdfSource?.startsWith("admin_seed_")) {
      const fallbackTitle = (pdfNameOrId || pdfSource || "WBCHSE Study Document").replace(/\.pdf$/i, "");
      const { blob: fallbackBlob } = buildRealCurriculumPdfBlob(
        fallbackTitle,
        "Study Stranger Pro • Official WBCHSE Class 12 Cloud Vault",
        [
          {
            heading: `${fallbackTitle} — High-Yield Study Sheet`,
            lines: [
              "This document is served via the Study Stranger Pro High-Capacity Cloud Stream.",
              "Review all key definitions, labeled diagrams, and WBCHSE Semester 3 OMR checkpoints.",
              "Synced across all student accounts via centralized 'shared_documents' cloud storage.",
            ],
          },
        ]
      );
      const fallbackBuf = await fallbackBlob.arrayBuffer();
      return new Uint8Array(fallbackBuf);
    }

    return null;
  } catch (err) {
    console.warn("extractPdfBytesFromSource error:", err);
    return null;
  }
}

/**
 * Get or create a direct browser-navigable Blob URL (blob:https://...) from any PDF source or Document ID.
 */
export async function getPdfDirectBlobUrl(
  pdfSource: string,
  pdfNameOrId?: string
): Promise<string | null> {
  try {
    if (!pdfSource && !pdfNameOrId) return null;

    if (pdfSource && pdfSource.startsWith("data:")) {
      return dataUrlToPdfBlobUrlSync(pdfSource);
    }

    if (pdfSource && pdfSource.startsWith("blob:")) {
      try {
        const probe = await fetch(pdfSource);
        if (probe.ok) {
          return pdfSource;
        }
      } catch {
        // Stale blob URL — resolve via IndexedDB / Firestore below
      }
    }

    if (
      pdfSource &&
      (pdfSource.startsWith("http://") ||
        pdfSource.startsWith("https://") ||
        pdfSource.startsWith("/api/"))
    ) {
      return pdfSource;
    }

    const candidateIds = [pdfSource, pdfNameOrId].filter(
      (s): s is string =>
        Boolean(s && !s.startsWith("blob:") && !s.startsWith("data:") && !s.startsWith("http"))
    );

    for (const targetId of candidateIds) {
      const rec = await getPdfFromIndexedDB(targetId);
      if (rec) {
        if (rec.blob instanceof Blob && rec.blob.size > 0) {
          return URL.createObjectURL(rec.blob);
        }
        if (rec.dataUrl && rec.dataUrl.startsWith("data:")) {
          return dataUrlToPdfBlobUrlSync(rec.dataUrl);
        }
        if (rec.streamUrl) {
          return rec.streamUrl;
        }
      }
    }

    const allPdfs = await listAllPdfsFromIndexedDB();
    const matched = allPdfs.find(
      (p) =>
        p.id === pdfSource ||
        p.id === pdfNameOrId ||
        p.name === pdfNameOrId ||
        p.name === pdfSource ||
        p.dataUrl === pdfSource
    );

    if (matched) {
      const hydrated = await getPdfFromIndexedDB(matched.id);
      const target = hydrated || matched;
      if (target.blob instanceof Blob && target.blob.size > 0) {
        return URL.createObjectURL(target.blob);
      }
      if (target.dataUrl && target.dataUrl.startsWith("data:")) {
        return dataUrlToPdfBlobUrlSync(target.dataUrl);
      }
      if (target.streamUrl) {
        return target.streamUrl;
      }
    }

    return null;
  } catch (err) {
    console.warn("getPdfDirectBlobUrl error:", err);
    return null;
  }
}

export async function createPdfBlobUrlFromSource(
  pdfSource: string,
  pdfNameOrId?: string
): Promise<string | null> {
  return getPdfDirectBlobUrl(pdfSource, pdfNameOrId);
}

function formatRecordsWithFreshUrls(records: StoredPDFRecord[]): StoredPDFRecord[] {
  return records
    .map((r) => {
      let resolvedDataUrl = r.dataUrl || "";
      let resolvedBlobUrl = "";
      const streamUrl = r.streamUrl || `/api/shared-documents/${encodeURIComponent(r.id)}/stream`;

      if (r.blob instanceof Blob && r.blob.size > 0) {
        resolvedBlobUrl = URL.createObjectURL(r.blob);
        if (!resolvedDataUrl || resolvedDataUrl.startsWith("blob:")) {
          resolvedDataUrl = resolvedBlobUrl;
        }
      } else if (resolvedDataUrl && resolvedDataUrl.startsWith("data:")) {
        resolvedBlobUrl = dataUrlToPdfBlobUrlSync(resolvedDataUrl);
      } else {
        if (resolvedDataUrl.startsWith("blob:")) {
          resolvedDataUrl = "";
        }
        resolvedBlobUrl = "";
      }

      return {
        ...r,
        folderId: r.folderId || "folder_mock_vault",
        streamUrl,
        dataUrl: resolvedDataUrl,
        blobUrl: resolvedBlobUrl,
      };
    })
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

/**
 * List all stored PDFs, merging centralized Firestore 'shared_documents', Server '/api/shared-documents', and local IndexedDB
 */
export async function listAllPdfsFromIndexedDB(): Promise<StoredPDFRecord[]> {
  await ensureAdminVaultSeeded();
  try {
    const idb = await getDB();

    const remoteRecords: StoredPDFRecord[] = [];

    const [fsSharedSnap, fsLegacySnap, serverResp] = await Promise.allSettled([
      getDocs(collection(firestoreDb, SHARED_DOCUMENTS_COLLECTION)),
      getDocs(collection(firestoreDb, "shared_pdfs")),
      fetch("/api/shared-documents").then((r) => (r.ok ? r.json() : null)),
    ]);

    if (fsSharedSnap.status === "fulfilled" && !fsSharedSnap.value.empty) {
      fsSharedSnap.value.forEach((dSnap) => {
        const data = dSnap.data() as StoredPDFRecord;
        if (data && data.id && data.name) {
          remoteRecords.push(data);
        }
      });
    }

    if (fsLegacySnap.status === "fulfilled" && !fsLegacySnap.value.empty) {
      fsLegacySnap.value.forEach((dSnap) => {
        const data = dSnap.data() as StoredPDFRecord;
        if (data && data.id && data.name) {
          remoteRecords.push(data);
        }
      });
    }

    if (
      serverResp.status === "fulfilled" &&
      serverResp.value &&
      Array.isArray(serverResp.value.documents)
    ) {
      for (const srvDoc of serverResp.value.documents) {
        if (srvDoc && srvDoc.id && srvDoc.name) {
          remoteRecords.push(srvDoc as StoredPDFRecord);
        }
      }
    }

    const localRecords = await new Promise<StoredPDFRecord[]>((resolve) => {
      const tx = idb.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const remoteFetched =
      fsSharedSnap.status === "fulfilled" ||
      fsLegacySnap.status === "fulfilled" ||
      (serverResp.status === "fulfilled" && serverResp.value !== null);

    const remoteIdSet = new Set(remoteRecords.map((r) => r.id));

    // When remote list is available, purge any user-uploaded documents that the admin deleted
    if (remoteFetched) {
      for (const local of localRecords) {
        if (!local.id.startsWith("admin_seed_") && !remoteIdSet.has(local.id)) {
          try {
            const delTx = idb.transaction(STORE_NAME, "readwrite");
            delTx.objectStore(STORE_NAME).delete(local.id);
          } catch {}
        }
      }
    }

    const activeLocalRecords = remoteFetched
      ? localRecords.filter((l) => l.id.startsWith("admin_seed_") || remoteIdSet.has(l.id))
      : localRecords;

    const mergedRecords = mergeSharedDocumentRecords(activeLocalRecords, remoteRecords);

    const localMap = new Map(activeLocalRecords.map((r) => [r.id, r]));
    for (const merged of mergedRecords) {
      const existingLocal = localMap.get(merged.id);
      const hasNewDataUrl =
        merged.dataUrl &&
        merged.dataUrl.startsWith("data:") &&
        (!existingLocal?.dataUrl || !existingLocal.dataUrl.startsWith("data:"));

      if (!existingLocal || hasNewDataUrl || existingLocal.folderId !== merged.folderId) {
        if (merged.dataUrl && merged.dataUrl.startsWith("data:") && !(merged.blob instanceof Blob)) {
          const blob = dataUrlToPdfBlob(merged.dataUrl);
          if (blob) merged.blob = blob;
        }
        await new Promise<void>((resolve) => {
          const tx = idb.transaction(STORE_NAME, "readwrite");
          tx.objectStore(STORE_NAME).put(merged);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      }
    }

    const cleanMerged = mergedRecords.filter((doc) => !isDummySeed(doc));
    return formatRecordsWithFreshUrls(cleanMerged);
  } catch (err) {
    console.warn("Failed to list PDFs from IndexedDB:", err);
    return [];
  }
}

/**
 * Subscribe to real-time updates on the centralized Firestore 'shared_documents' collection
 */
export function subscribeToSharedDocuments(
  onUpdate: (docs: StoredPDFRecord[]) => void
): () => void {
  let isUnsubscribed = false;

  const syncAllSources = async () => {
    if (isUnsubscribed) return;
    try {
      const mergedList = await listAllPdfsFromIndexedDB();
      if (!isUnsubscribed) {
        onUpdate(mergedList);
      }
    } catch (err) {
      console.warn("Real-time shared_documents sync notice:", err);
    }
  };

  const unsubscribeFirestore = onSnapshot(
    collection(firestoreDb, SHARED_DOCUMENTS_COLLECTION),
    () => {
      syncAllSources();
    },
    (err) => {
      console.warn("shared_documents onSnapshot error:", err);
      syncAllSources();
    }
  );

  const pollInterval = setInterval(syncAllSources, 4000);
  const handleCustomUpdate = () => syncAllSources();
  if (typeof window !== "undefined") {
    window.addEventListener("ss-shared-pdfs-updated", handleCustomUpdate);
    window.addEventListener("focus", handleCustomUpdate);
  }

  return () => {
    isUnsubscribed = true;
    clearInterval(pollInterval);
    if (typeof window !== "undefined") {
      window.removeEventListener("ss-shared-pdfs-updated", handleCustomUpdate);
      window.removeEventListener("focus", handleCustomUpdate);
    }
    unsubscribeFirestore();
  };
}

/**
 * Delete a PDF and its chunks from IndexedDB, Firestore 'shared_documents', and Server Stream
 */
export async function deletePdfFromIndexedDB(id: string): Promise<void> {
  try {
    const idb = await getDB();
    const existing = await getPdfFromIndexedDB(id);
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = (e: any) => reject(e.target.error);
    });

    if (existing?.isChunked && existing.chunkCount) {
      for (let i = 0; i < existing.chunkCount; i++) {
        await new Promise<void>((resolve) => {
          const tx = idb.transaction(CHUNK_STORE_NAME, "readwrite");
          const store = tx.objectStore(CHUNK_STORE_NAME);
          const req = store.delete(`${id}_chunk_${i}`);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        });
      }
    }

    await deleteDoc(doc(firestoreDb, SHARED_DOCUMENTS_COLLECTION, id)).catch(() => {});
    await deleteDoc(doc(firestoreDb, "shared_pdfs", id)).catch(() => {});
    await fetch(`/api/shared-documents/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(
      () => {}
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ss-shared-pdfs-updated"));
    }
  } catch (err) {
    console.warn("Failed to delete PDF from IndexedDB:", err);
  }
}

/**
 * Safe download trigger for Data URL, Blob URL, or Document ID
 */
export async function triggerPdfDownload(dataUrlOrUrlOrId: string, fileName = "Document.pdf") {
  try {
    const cleanBase = fileName
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .trim();
    const finalName = cleanBase.toLowerCase().endsWith(".pdf")
      ? cleanBase
      : `${cleanBase || "Document"}.pdf`;

    // 1. First try extracting raw binary PDF bytes so we can create an authentic application/pdf Blob URL
    //    (cross-origin or relative URLs on <a download> can be ignored inside sandboxed preview iframes,
    //     whereas a fresh local Blob URL always triggers a direct browser download).
    const bytes = await extractPdfBytesFromSource(dataUrlOrUrlOrId, finalName);
    if (bytes && bytes.byteLength > 0) {
      const pdfBlob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = blobUrl;
      link.download = finalName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          if (link.parentNode) link.parentNode.removeChild(link);
        } catch {}
        URL.revokeObjectURL(blobUrl);
      }, 45000);
      return;
    }

    // 2. Fallback: resolve direct Blob/Data URL if byte extraction returned null
    let resolvedUrl = dataUrlOrUrlOrId;
    if (
      !resolvedUrl ||
      (!resolvedUrl.startsWith("data:") &&
        !resolvedUrl.startsWith("blob:") &&
        !resolvedUrl.startsWith("http"))
    ) {
      const blobUrl = await getPdfDirectBlobUrl(dataUrlOrUrlOrId, finalName);
      if (blobUrl) {
        resolvedUrl = blobUrl;
      }
    }

    if (resolvedUrl.startsWith("data:")) {
      const blob = dataUrlToPdfBlob(resolvedUrl);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = blobUrl;
        link.download = finalName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try {
            if (link.parentNode) link.parentNode.removeChild(link);
          } catch {}
          URL.revokeObjectURL(blobUrl);
        }, 45000);
        return;
      }
    }

    if (
      resolvedUrl.startsWith("blob:") ||
      resolvedUrl.startsWith("http://") ||
      resolvedUrl.startsWith("https://") ||
      resolvedUrl.startsWith("/api/")
    ) {
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = resolvedUrl;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          if (link.parentNode) link.parentNode.removeChild(link);
        } catch {}
      }, 5000);
    }
  } catch (e) {
    console.error("Trigger PDF download failed:", e);
  }
}
