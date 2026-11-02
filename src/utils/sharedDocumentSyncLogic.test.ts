import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  splitDataUrlForFirestore,
  reassembleDataUrlFromFirestoreChunks,
  buildSanitizedSharedDocumentPayload,
  mergeSharedDocumentRecords,
  isStudyStrangerAdmin,
} from "./sharedDocumentSyncLogic";

describe("sharedDocumentSyncLogic (centralized shared_documents sync)", () => {
  it("keeps small dataUrl inline when under maxInlineLength", () => {
    const sample = "data:application/pdf;base64,JVBERi0xLjQK";
    const result = splitDataUrlForFirestore("pdf_1", sample, 1000);
    assert.equal(result.inlineDataUrl, sample);
    assert.equal(result.chunks.length, 0);
    assert.equal(result.isChunked, false);
    assert.equal(result.chunkCount, 0);
  });

  it("splits large dataUrl into ordered chunks with totalChunks and reassembles identically", () => {
    const body = "A".repeat(2500) + "B".repeat(2500) + "C".repeat(1200);
    const fullDataUrl = `data:application/pdf;base64,${body}`;
    const { inlineDataUrl, chunks, isChunked, chunkCount } = splitDataUrlForFirestore(
      "pdf_large",
      fullDataUrl,
      2000
    );

    assert.equal(inlineDataUrl, "");
    assert.equal(isChunked, true);
    assert.equal(chunkCount, 4);
    assert.equal(chunks.length, 4);
    assert.equal(chunks[0].totalChunks, 4);

    // Shuffle chunks to verify out-of-order reassembly works deterministically
    const shuffled = [chunks[2], chunks[0], chunks[3], chunks[1]];
    const restored = reassembleDataUrlFromFirestoreChunks(shuffled, 4);
    assert.equal(restored, fullDataUrl);
  });

  it("sanitizes SharedDocumentMetadata supporting both dataUrl and inlineDataUrl", () => {
    const payload = buildSanitizedSharedDocumentPayload({
      id: "pdf_test_123",
      name: "  WBCHSE Sem 3 Biology Notes.pdf  ",
      folderId: "subfolder_bio_u1",
      subjectTag: "Biology",
      uploadedBy: "admin",
      uploaderName: "Study Stranger Admin",
      size: 204800,
      sizeFormatted: "200 KB",
      dataUrl: "data:application/pdf;base64,JVBERi0=",
      isFirestoreChunked: false,
      firestoreChunkCount: 0,
    });

    assert.equal(payload.id, "pdf_test_123");
    assert.equal(payload.name, "WBCHSE Sem 3 Biology Notes.pdf");
    assert.equal(payload.uploadedBy, "admin");
    assert.equal(payload.dataUrl, "data:application/pdf;base64,JVBERi0=");
    assert.equal(payload.isFirestoreChunked, false);
    assert.equal(payload.streamUrl, "/api/shared-documents/pdf_test_123/stream");
  });

  it("correctly identifies official Admin accounts vs regular Student viewers", () => {
    assert.equal(isStudyStrangerAdmin("studystrangerai@gmail.com", ""), true);
    assert.equal(isStudyStrangerAdmin("ayanofficial762@gmail.com", ""), true);
    assert.equal(isStudyStrangerAdmin("student123@gmail.com", "riya"), false);
  });

  it("merges local and remote shared_documents preserving local binary dataUrl while adding new remote documents", () => {
    const local = [
      {
        id: "doc_1",
        name: "Doc 1.pdf",
        folderId: "folder_a",
        uploadedAt: "2026-02-01T10:00:00.000Z",
        dataUrl: "data:application/pdf;base64,LOCAL_BINARY",
      },
    ];
    const remote = [
      {
        id: "doc_1",
        name: "Doc 1 Renamed.pdf",
        folderId: "folder_b",
        uploadedAt: "2026-02-01T10:00:00.000Z",
        dataUrl: "", // remote metadata without inline data
      },
      {
        id: "doc_2",
        name: "Admin Uploaded Doc 2.pdf",
        folderId: "folder_b",
        uploadedAt: "2026-02-02T12:00:00.000Z",
        dataUrl: "data:application/pdf;base64,REMOTE_BINARY",
      },
    ];

    const merged = mergeSharedDocumentRecords(local, remote);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].id, "doc_2"); // newest first
    assert.equal(merged[1].id, "doc_1");
    assert.equal(merged[1].name, "Doc 1 Renamed.pdf");
    assert.equal(merged[1].folderId, "folder_b");
    assert.equal(merged[1].dataUrl, "data:application/pdf;base64,LOCAL_BINARY");
  });
});
