import type { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";
import os from "os";

export interface StoredSharedDocServer {
  id: string;
  name: string;
  folderId: string;
  subjectTag?: string;
  uploadedBy?: "admin" | "student";
  uploaderName?: string;
  uploaderEmail?: string;
  size: number;
  sizeFormatted: string;
  streamUrl: string;
  mimeType: string;
  uploadedAt: string;
  dataUrl?: string;
}

export interface SharedFolderServer {
  id: string;
  name: string;
  parentId: string | null;
  subjectTag: string;
  description?: string;
  createdBy: "admin" | "student";
  createdAt: string;
}

const DEFAULT_FOLDERS: SharedFolderServer[] = [
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

export function registerSharedDocumentServerService(app: Express) {
  const dataDir = process.env.RUNTIME_DATA_DIR || path.join(os.tmpdir(), "studystranger-runtime-data");
  const primaryStorageDir = path.join(dataDir, "shared_pdfs");
  const legacyStorageDir = path.join(dataDir, "pdfs");
  const chunksDir = path.join(primaryStorageDir, "chunks");
  const sharedDocsFilePath = path.join(dataDir, "shared_documents.json");
  const sharedFoldersFilePath = path.join(dataDir, "shared_folders.json");

  // Ensure directories exist
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(primaryStorageDir)) fs.mkdirSync(primaryStorageDir, { recursive: true });
    if (!fs.existsSync(legacyStorageDir)) fs.mkdirSync(legacyStorageDir, { recursive: true });
    if (!fs.existsSync(chunksDir)) fs.mkdirSync(chunksDir, { recursive: true });
  } catch (err) {
    console.warn("[SharedDoc Server] Directory creation warning:", err);
  }

  // In-memory registry
  const documentsMap = new Map<string, StoredSharedDocServer>();
  const foldersMap = new Map<string, SharedFolderServer>();

  // Helper: Format bytes
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return "0 Bytes";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper: locate PDF file on disk across primary and legacy paths
  const findPdfOnDisk = (id: string): string => {
    const safeId = String(id).replace(/[^a-zA-Z0-9_\-@.]/g, "_");
    const candidates = [
      path.join(primaryStorageDir, `${safeId}.pdf`),
      path.join(primaryStorageDir, safeId),
      path.join(legacyStorageDir, `${safeId}.pdf`),
      path.join(legacyStorageDir, safeId),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return "";
  };

  // Load documents from disk (handles both array and object format)
  const loadDocumentsFromDisk = () => {
    try {
      if (fs.existsSync(sharedDocsFilePath)) {
        const raw = fs.readFileSync(sharedDocsFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        const list: any[] = Array.isArray(parsed)
          ? parsed
          : parsed && typeof parsed === "object"
          ? Object.values(parsed)
          : [];

        let purgedAny = false;
        for (const item of list) {
          if (item && item.id && item.name) {
            // Strictly exclude dummy seed mock documents
            const isSeed = item.id.startsWith("admin_seed_") ||
              item.name.includes("WBCHSE_Biology_Unit") ||
              item.name.includes("WBCHSE_EnglishB_The_Bet") ||
              item.name.includes("question_bank_wbchse_sem3");
            if (isSeed) {
              purgedAny = true;
              const diskPath = findPdfOnDisk(item.id);
              if (diskPath && fs.existsSync(diskPath)) {
                try { fs.unlinkSync(diskPath); } catch {}
              }
              continue;
            }
            documentsMap.set(item.id, item);
          }
        }
        if (purgedAny) {
          saveDocumentsToDisk();
        }
        console.log(`[SharedDoc Server] Loaded ${documentsMap.size} documents from disk.`);
      }
    } catch (err) {
      console.warn("[SharedDoc Server] Load docs error:", err);
    }
  };

  // Save documents to disk (persists as clean array + supports quick map lookup)
  const saveDocumentsToDisk = () => {
    try {
      const list = Array.from(documentsMap.values());
      fs.writeFileSync(sharedDocsFilePath, JSON.stringify(list, null, 2));
    } catch (err) {
      console.warn("[SharedDoc Server] Save docs error:", err);
    }
  };

  // Load folders from disk
  const loadFoldersFromDisk = () => {
    try {
      if (fs.existsSync(sharedFoldersFilePath)) {
        const raw = fs.readFileSync(sharedFoldersFilePath, "utf-8");
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          for (const f of list) {
            if (f && f.id && f.name) foldersMap.set(f.id, f);
          }
          console.log(`[SharedDoc Server] Loaded ${foldersMap.size} folders from disk.`);
          return;
        }
      }
    } catch (err) {
      console.warn("[SharedDoc Server] Load folders error:", err);
    }

    // Seed default folders
    for (const f of DEFAULT_FOLDERS) {
      foldersMap.set(f.id, f);
    }
    saveFoldersToDisk();
  };

  // Save folders to disk
  const saveFoldersToDisk = () => {
    try {
      const list = Array.from(foldersMap.values());
      fs.writeFileSync(sharedFoldersFilePath, JSON.stringify(list, null, 2));
    } catch (err) {
      console.warn("[SharedDoc Server] Save folders error:", err);
    }
  };

  // Initial load
  loadDocumentsFromDisk();
  loadFoldersFromDisk();

  // 1. Chunked Binary Upload Endpoint (supports 1000MB+ files streamed in slices)
  // Handles /api/shared-documents/upload-chunk?id=...&index=...&totalChunks=...
  app.post(
    "/api/shared-documents/upload-chunk",
    (req: Request, res: Response) => {
      try {
        const rawId = String(req.query.id || req.body?.id || "").trim();
        const index = parseInt(String(req.query.index ?? req.body?.index ?? "0"), 10);
        const totalChunks = parseInt(String(req.query.totalChunks ?? req.body?.totalChunks ?? "1"), 10);

        if (!rawId) {
          return res.status(400).json({ success: false, error: "Missing document id in query" });
        }

        const safeId = rawId.replace(/[^a-zA-Z0-9_\-@.]/g, "_");
        const chunkFilePath = path.join(chunksDir, `${safeId}_chunk_${index}`);

        // If body is already a Buffer (via express.raw), write it directly
        if (Buffer.isBuffer(req.body) && req.body.length > 0) {
          fs.writeFileSync(chunkFilePath, req.body);
          finishChunkProcessing(safeId, index, totalChunks, res);
          return;
        }

        // Otherwise collect stream buffers
        const rawChunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => {
          rawChunks.push(chunk);
        });

        req.on("end", () => {
          try {
            const buffer = Buffer.concat(rawChunks);
            fs.writeFileSync(chunkFilePath, buffer);
            finishChunkProcessing(safeId, index, totalChunks, res);
          } catch (innerErr: any) {
            console.error("[SharedDoc Server] Chunk write error:", innerErr);
            if (!res.headersSent) res.status(500).json({ success: false, error: innerErr.message });
          }
        });

        req.on("error", (err) => {
          console.error("[SharedDoc Server] Chunk receive stream error:", err);
          if (!res.headersSent) res.status(500).json({ success: false, error: err.message });
        });
      } catch (err: any) {
        console.error("[SharedDoc Server] Upload chunk error:", err);
        if (!res.headersSent) res.status(500).json({ success: false, error: err.message });
      }
    }
  );

  function finishChunkProcessing(safeId: string, index: number, totalChunks: number, res: Response) {
    try {
      // Check if all chunks have arrived
      let allReceived = true;
      for (let i = 0; i < totalChunks; i++) {
        const p = path.join(chunksDir, `${safeId}_chunk_${i}`);
        if (!fs.existsSync(p)) {
          allReceived = false;
          break;
        }
      }

      if (allReceived) {
        console.log(`[SharedDoc Server] All ${totalChunks} chunks received for ${safeId}. Assembling complete PDF...`);
        const finalPdfPath = path.join(primaryStorageDir, `${safeId}.pdf`);
        const writeStream = fs.createWriteStream(finalPdfPath);

        for (let i = 0; i < totalChunks; i++) {
          const p = path.join(chunksDir, `${safeId}_chunk_${i}`);
          if (fs.existsSync(p)) {
            const data = fs.readFileSync(p);
            writeStream.write(data);
            try {
              fs.unlinkSync(p);
            } catch {}
          }
        }
        writeStream.end();

        writeStream.on("finish", () => {
          const stat = fs.statSync(finalPdfPath);
          console.log(`[SharedDoc Server] Assembly complete for ${safeId}: ${formatBytes(stat.size)}`);

          // Update metadata if exists
          const existing = documentsMap.get(safeId);
          if (existing) {
            existing.size = stat.size;
            existing.sizeFormatted = formatBytes(stat.size);
            existing.streamUrl = `/api/shared-documents/${encodeURIComponent(safeId)}/stream`;
            saveDocumentsToDisk();
          }
        });
      }

      if (!res.headersSent) {
        res.json({
          success: true,
          id: safeId,
          chunkIndex: index,
          totalChunks,
          isComplete: allReceived,
          streamUrl: `/api/shared-documents/${encodeURIComponent(safeId)}/stream`,
        });
      }
    } catch (e: any) {
      if (!res.headersSent) res.status(500).json({ success: false, error: e.message });
    }
  }

  // 2. Metadata Save Endpoint
  // Handles POST /api/shared-documents
  app.post("/api/shared-documents", (req: Request, res: Response) => {
    try {
      const data = req.body as Partial<StoredSharedDocServer>;
      if (!data || !data.id || !data.name) {
        return res.status(400).json({ success: false, error: "Missing required document id or name" });
      }

      const id = String(data.id).trim();
      const safeId = id.replace(/[^a-zA-Z0-9_\-@.]/g, "_");
      const streamUrl = `/api/shared-documents/${encodeURIComponent(safeId)}/stream`;
      const finalPdfPath = path.join(primaryStorageDir, `${safeId}.pdf`);

      // If dataUrl with Base64 is supplied, write it to disk
      if (data.dataUrl && data.dataUrl.includes(",")) {
        try {
          const parts = data.dataUrl.split(",");
          const buf = Buffer.from(parts[1], "base64");
          if (buf.length > 0) {
            fs.writeFileSync(finalPdfPath, buf);
            console.log(`[SharedDoc Server] Saved base64 PDF to disk: ${safeId}.pdf (${formatBytes(buf.length)})`);
          }
        } catch (b64Err) {
          console.warn("[SharedDoc Server] Base64 write warning:", b64Err);
        }
      }

      // Check file size on disk if available
      let computedSize = Number(data.size) || 0;
      const diskPath = findPdfOnDisk(safeId);
      if (diskPath) {
        try {
          const stat = fs.statSync(diskPath);
          if (stat.size > 0) computedSize = stat.size;
        } catch {}
      }

      const docRecord: StoredSharedDocServer = {
        id: safeId,
        name: String(data.name).trim(),
        folderId: String(data.folderId || "folder_mock_vault"),
        subjectTag: String(data.subjectTag || "WBCHSE Sem 3"),
        uploadedBy: data.uploadedBy === "student" ? "student" : "admin",
        uploaderName: String(data.uploaderName || "Admin").trim(),
        uploaderEmail: String(data.uploaderEmail || "").trim(),
        size: computedSize,
        sizeFormatted: data.sizeFormatted || formatBytes(computedSize),
        streamUrl,
        mimeType: "application/pdf",
        uploadedAt: data.uploadedAt || new Date().toISOString(),
        // Keep compact dataUrl if <= 2MB for ultra-fast instant view fallback
        dataUrl:
          typeof data.dataUrl === "string" &&
          data.dataUrl.startsWith("data:") &&
          data.dataUrl.length <= 2_500_000
            ? data.dataUrl
            : "",
      };

      documentsMap.set(safeId, docRecord);
      saveDocumentsToDisk();

      console.log(`[SharedDoc Server] Document registered & synced: ${docRecord.name} (${docRecord.sizeFormatted})`);
      res.json({ success: true, document: docRecord });
    } catch (err: any) {
      console.error("[SharedDoc Server] POST doc error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. List All Shared Documents
  // Handles GET /api/shared-documents
  app.get("/api/shared-documents", (_req: Request, res: Response) => {
    try {
      const docs = Array.from(documentsMap.values()).map((d) => ({
        ...d,
        streamUrl: `/api/shared-documents/${encodeURIComponent(d.id)}/stream`,
      }));
      res.json({ success: true, documents: docs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Get Single Document Metadata
  // Handles GET /api/shared-documents/:id
  app.get("/api/shared-documents/:id", (req: Request, res: Response, next) => {
    const { id } = req.params;
    if (id === "upload-chunk") return next();

    const safeId = String(id).replace(/[^a-zA-Z0-9_\-@.]/g, "_");
    const docRecord = documentsMap.get(safeId) || documentsMap.get(id);
    if (!docRecord) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }
    res.json({
      success: true,
      document: {
        ...docRecord,
        streamUrl: `/api/shared-documents/${encodeURIComponent(safeId)}/stream`,
      },
    });
  });

  // 5. Binary Stream with HTTP 206 Partial Content Range Support (for instant page 1 loading of 170+ page 1000MB PDFs)
  // Handles GET /api/shared-documents/:id/stream
  app.get("/api/shared-documents/:id/stream", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const safeId = String(id).replace(/[^a-zA-Z0-9_\-@.]/g, "_");
      let targetPath = findPdfOnDisk(safeId) || findPdfOnDisk(id);

      // If not yet on disk, check if we have dataUrl in memory to reconstruct it on-the-fly
      if (!targetPath) {
        const record = documentsMap.get(safeId) || documentsMap.get(id);
        if (record && typeof record.dataUrl === "string" && record.dataUrl.includes(",")) {
          try {
            const buf = Buffer.from(record.dataUrl.split(",")[1], "base64");
            if (buf.length > 0) {
              const writePath = path.join(primaryStorageDir, `${safeId}.pdf`);
              fs.writeFileSync(writePath, buf);
              targetPath = writePath;
              console.log(`[SharedDoc Stream] Restored ${safeId}.pdf from dataUrl (${formatBytes(buf.length)})`);
            }
          } catch (restoreErr) {
            console.warn("[SharedDoc Stream] Restore warning:", restoreErr);
          }
        }
      }

      if (!targetPath) {
        console.warn(`[SharedDoc Stream] Document not found on disk: ${id}`);
        return res.status(404).json({ success: false, error: "PDF document not found on server stream." });
      }

      const stat = fs.statSync(targetPath);
      const totalSize = stat.size;
      const record = documentsMap.get(safeId) || documentsMap.get(id);
      const fileName = record?.name || `${safeId}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader("Cache-Control", "public, max-age=86400, must-revalidate");

      const rangeHeader = req.headers.range;

      if (rangeHeader) {
        // Parse Range: bytes=start-end
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

        if (isNaN(start) || start >= totalSize || end >= totalSize || start > end) {
          res.setHeader("Content-Range", `bytes */${totalSize}`);
          return res.status(416).send("Requested Range Not Satisfiable");
        }

        const chunkSize = end - start + 1;
        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`);
        res.setHeader("Content-Length", chunkSize);

        const readStream = fs.createReadStream(targetPath, { start, end });
        readStream.on("error", (streamErr) => {
          console.warn("[SharedDoc Stream] Range read error:", streamErr);
          if (!res.headersSent) res.status(500).end();
        });
        readStream.pipe(res);
      } else {
        res.status(200);
        res.setHeader("Content-Length", totalSize);
        const readStream = fs.createReadStream(targetPath);
        readStream.on("error", (streamErr) => {
          console.warn("[SharedDoc Stream] Full read error:", streamErr);
          if (!res.headersSent) res.status(500).end();
        });
        readStream.pipe(res);
      }
    } catch (err: any) {
      console.error("[SharedDoc Stream] Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Error streaming PDF document." });
      }
    }
  });

  // 6. Delete PDF Document (Admin Delete - removed for ALL users across cloud & local)
  // Handles DELETE /api/shared-documents/:id
  app.delete("/api/shared-documents/:id", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const safeId = String(id).replace(/[^a-zA-Z0-9_\-@.]/g, "_");

      documentsMap.delete(safeId);
      documentsMap.delete(id);
      saveDocumentsToDisk();

      // Delete file on disk
      const targetPath = findPdfOnDisk(safeId) || findPdfOnDisk(id);
      if (targetPath && fs.existsSync(targetPath)) {
        try {
          fs.unlinkSync(targetPath);
          console.log(`[SharedDoc Server] Deleted PDF on disk: ${targetPath}`);
        } catch (unlinkErr) {
          console.warn("[SharedDoc Server] File unlink notice:", unlinkErr);
        }
      }

      // Also clean any dangling chunks
      try {
        const chunkFiles = fs.readdirSync(chunksDir);
        for (const file of chunkFiles) {
          if (file.startsWith(`${safeId}_chunk_`) || file.startsWith(`${id}_chunk_`)) {
            fs.unlinkSync(path.join(chunksDir, file));
          }
        }
      } catch {}

      res.json({ success: true, message: `Document ${safeId} deleted for all users.` });
    } catch (err: any) {
      console.error("[SharedDoc Server] Delete error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Folder Endpoints
  // Handles GET /api/shared-folders
  app.get("/api/shared-folders", (_req: Request, res: Response) => {
    try {
      const folders = Array.from(foldersMap.values());
      res.json({ success: true, folders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Handles POST /api/shared-folders
  app.post("/api/shared-folders", (req: Request, res: Response) => {
    try {
      const folder = req.body as SharedFolderServer;
      if (!folder || !folder.id || !folder.name) {
        return res.status(400).json({ success: false, error: "Invalid folder data" });
      }

      foldersMap.set(folder.id, {
        id: folder.id,
        name: folder.name.trim(),
        parentId: folder.parentId || null,
        subjectTag: folder.subjectTag || "General",
        description: folder.description || "",
        createdBy: folder.createdBy || "admin",
        createdAt: folder.createdAt || new Date().toISOString(),
      });
      saveFoldersToDisk();

      res.json({ success: true, folder: foldersMap.get(folder.id) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Handles DELETE /api/shared-folders/:id
  app.delete("/api/shared-folders/:id", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      foldersMap.delete(id);
      saveFoldersToDisk();
      res.json({ success: true, message: "Folder deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
