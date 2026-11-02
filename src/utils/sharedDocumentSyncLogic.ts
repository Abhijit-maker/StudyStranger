/**
 * Pure logic for centralized 'shared_documents' Firestore collection synchronization,
 * payload sanitization, base64 chunking/reassembly (to respect Firestore's 1MB limit),
 * and deterministic merging across all student & admin accounts.
 */

export const FIRESTORE_DOC_CHUNK_SIZE = 700_000; // 700KB chars per chunk (safely below 1MB Firestore limit)

export interface SharedDocumentMetadata {
  id: string;
  name: string;
  folderId: string;
  subjectTag: string;
  uploadedBy: "admin" | "student";
  uploaderName?: string;
  uploaderEmail?: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  uploadedAt: string;
  dataUrl: string;
  streamUrl?: string;
  isFirestoreChunked: boolean;
  firestoreChunkCount: number;
}

export interface SharedDocumentChunk {
  docId: string;
  index: number;
  totalChunks: number;
  data: string;
}

export type FirestoreDocumentChunk = SharedDocumentChunk;

/**
 * Splits a large dataUrl (e.g. data:application/pdf;base64,...) into Firestore-safe chunks
 * if it exceeds FIRESTORE_DOC_CHUNK_SIZE.
 */
export function splitDataUrlForFirestore(
  docId: string,
  dataUrl: string,
  maxInlineLength = FIRESTORE_DOC_CHUNK_SIZE
): {
  inlineDataUrl: string;
  chunks: SharedDocumentChunk[];
  isChunked: boolean;
  chunkCount: number;
} {
  if (!dataUrl || !dataUrl.startsWith("data:")) {
    return { inlineDataUrl: "", chunks: [], isChunked: false, chunkCount: 0 };
  }

  if (dataUrl.length <= maxInlineLength) {
    return {
      inlineDataUrl: dataUrl,
      chunks: [],
      isChunked: false,
      chunkCount: 0,
    };
  }

  const rawSlices: string[] = [];
  for (let offset = 0; offset < dataUrl.length; offset += maxInlineLength) {
    rawSlices.push(dataUrl.slice(offset, offset + maxInlineLength));
  }

  const totalChunks = rawSlices.length;
  const chunks: SharedDocumentChunk[] = rawSlices.map((slice, index) => ({
    docId,
    index,
    totalChunks,
    data: slice,
  }));

  return {
    inlineDataUrl: "",
    chunks,
    isChunked: true,
    chunkCount: totalChunks,
  };
}

/**
 * Reassembles ordered or unordered SharedDocumentChunks back into the original dataUrl.
 */
export function reassembleDataUrlFromFirestoreChunks(
  chunks: SharedDocumentChunk[],
  expectedChunks?: number
): string {
  if (!Array.isArray(chunks) || chunks.length === 0) return "";
  const sorted = [...chunks].sort((a, b) => a.index - b.index);

  // If expectedChunks is provided and we have fewer, check if contiguous from 0
  if (typeof expectedChunks === "number" && expectedChunks > 0 && sorted.length < expectedChunks) {
    // Only reject if gap in sequence
    const hasGap = sorted.some((c, idx) => c.index !== idx);
    if (hasGap) {
      return "";
    }
  }

  return sorted.map((c) => c.data).join("");
}

/**
 * Sanitizes and validates an outgoing SharedDocumentMetadata payload so it strictly
 * conforms to firebase-blueprint.json and firestore.rules constraints.
 */
export function buildSanitizedSharedDocumentPayload(input: {
  id: string;
  name: string;
  folderId?: string;
  subjectTag?: string;
  uploadedBy?: "admin" | "student";
  uploaderName?: string;
  uploaderEmail?: string;
  size: number;
  sizeFormatted: string;
  mimeType?: string;
  uploadedAt?: string;
  inlineDataUrl?: string;
  dataUrl?: string;
  streamUrl?: string;
  isFirestoreChunked?: boolean;
  firestoreChunkCount?: number;
}): SharedDocumentMetadata {
  const safeId = String(input.id || "")
    .trim()
    .replace(/[^a-zA-Z0-9_\-@\.]/g, "_")
    .slice(0, 128);
  const safeName = String(input.name || "Study_Document.pdf")
    .trim()
    .slice(0, 240);
  const safeFolderId = String(input.folderId || "folder_mock_vault")
    .trim()
    .slice(0, 128);
  const safeSubjectTag = String(input.subjectTag || "WBCHSE Sem 3")
    .trim()
    .slice(0, 80);
  const safeUploadedBy: "admin" | "student" =
    input.uploadedBy === "student" ? "student" : "admin";
  const safeSize = Math.max(0, Number(input.size) || 0);
  const safeSizeFormatted = String(input.sizeFormatted || "0 Bytes")
    .trim()
    .slice(0, 40);
  const safeMimeType = String(input.mimeType || "application/pdf")
    .trim()
    .slice(0, 64);
  const safeUploadedAt = String(input.uploadedAt || new Date().toISOString())
    .trim()
    .slice(0, 64);

  const rawDataUrl = input.inlineDataUrl ?? input.dataUrl ?? "";
  const safeInlineDataUrl =
    rawDataUrl && rawDataUrl.length <= FIRESTORE_DOC_CHUNK_SIZE ? rawDataUrl : "";

  const safeStreamUrl = String(
    input.streamUrl || `/api/shared-documents/${encodeURIComponent(safeId)}/stream`
  ).slice(0, 512);
  const safeChunkCount = Math.max(0, Math.floor(Number(input.firestoreChunkCount) || 0));
  const safeIsChunked = Boolean(input.isFirestoreChunked || safeChunkCount > 0);

  const payload: SharedDocumentMetadata = {
    id: safeId,
    name: safeName,
    folderId: safeFolderId,
    subjectTag: safeSubjectTag,
    uploadedBy: safeUploadedBy,
    size: safeSize,
    sizeFormatted: safeSizeFormatted,
    mimeType: safeMimeType,
    uploadedAt: safeUploadedAt,
    dataUrl: safeInlineDataUrl,
    streamUrl: safeStreamUrl,
    isFirestoreChunked: safeIsChunked,
    firestoreChunkCount: safeChunkCount,
  };

  if (input.uploaderName) {
    payload.uploaderName = String(input.uploaderName).trim().slice(0, 120);
  }
  if (input.uploaderEmail) {
    payload.uploaderEmail = String(input.uploaderEmail).trim().slice(0, 254);
  }

  return payload;
}

/**
 * Checks whether the current logged-in user is an Admin who can upload & manage shared PDFs.
 */
export function isStudyStrangerAdmin(userEmail?: string | null, userHandle?: string | null): boolean {
  const emailLower = String(userEmail || "").trim().toLowerCase();
  const handleLower = String(userHandle || "").trim().toLowerCase();
  const adminEmails = new Set([
    "studystrangerai@gmail.com",
    "ayanofficial762@gmail.com",
    "jhhh47943@gmail.com",
  ]);
  if (adminEmails.has(emailLower) || adminEmails.has(handleLower)) {
    return true;
  }
  if (handleLower === "admin" || handleLower === "studystrangerai") {
    return true;
  }
  return false;
}

/**
 * Merges local IndexedDB PDF records with remote 'shared_documents' records,
 * preserving local Blob/dataUrl streams when available and sorting newest first.
 */
export function mergeSharedDocumentRecords<
  T extends {
    id: string;
    name: string;
    folderId: string;
    uploadedAt: string;
    dataUrl?: string;
    blob?: any;
    isFirestoreChunked?: boolean;
    firestoreChunkCount?: number;
    streamUrl?: string;
  }
>(localRecords: T[], remoteRecords: T[]): T[] {
  const byId = new Map<string, T>();

  for (const local of localRecords) {
    if (local && local.id) {
      byId.set(local.id, local);
    }
  }

  for (const remote of remoteRecords) {
    if (!remote || !remote.id) continue;
    const existing = byId.get(remote.id);
    if (!existing) {
      byId.set(remote.id, remote);
    } else {
      const hasLocalData =
        Boolean(existing.blob) ||
        Boolean(existing.dataUrl && existing.dataUrl.startsWith("data:"));
      const remoteHasData = Boolean(remote.dataUrl && remote.dataUrl.startsWith("data:"));
      byId.set(remote.id, {
        ...existing,
        ...remote,
        blob: existing.blob || remote.blob,
        dataUrl: hasLocalData
          ? existing.dataUrl
          : remoteHasData
          ? remote.dataUrl
          : existing.dataUrl || "",
        isFirestoreChunked: Boolean(remote.isFirestoreChunked || existing.isFirestoreChunked),
        firestoreChunkCount: Math.max(
          Number(remote.firestoreChunkCount || 0),
          Number(existing.firestoreChunkCount || 0)
        ),
        streamUrl: remote.streamUrl || existing.streamUrl,
      });
    }
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}
