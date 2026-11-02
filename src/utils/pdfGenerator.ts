import { jsPDF } from "jspdf";

export interface PDFDocumentOptions {
  title: string;
  subtitle?: string;
  author?: string;
  category?: string;
  date?: string;
  content: string | string[];
  watermark?: string;
}

/**
 * Generates a styled, downloadable PDF document using jsPDF
 * Returns a base64 Data URL (data:application/pdf;base64,...)
 */
export function generateStyledPDF({
  title,
  subtitle = "WBCHSE Class 12 Semester 3 - Official Study Stranger Material",
  author = "Abhijit (System Admin)",
  category = "Notice / Study Material",
  date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
  content,
  watermark = "STUDY STRANGER"
}: PDFDocumentOptions): string {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 28, "F");

  // Accent Line
  doc.setFillColor(255, 122, 48); // Orange-500 (#FF7A30)
  doc.rect(0, 28, pageWidth, 2.5, "F");

  // Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("STUDY STRANGER", margin, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text("WBCHSE Class 12 • Autonomous AI Study Portal", margin, 21);

  doc.setFontSize(8);
  doc.text(`Official Document: ${category}`, pageWidth - margin, 14, { align: "right" });
  doc.text(`Issued: ${date}`, pageWidth - margin, 21, { align: "right" });

  let cursorY = 42;

  // Title Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // Slate-900
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 7 + 2;

  // Subtitle / Meta
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`${subtitle} • Author: ${author}`, margin, cursorY);
  cursorY += 8;

  // Divider
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Watermark (subtle background text)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(42);
  doc.setTextColor(241, 245, 249); // Very light slate
  doc.text(watermark, pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });

  // Main Content Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);

  const textLines = Array.isArray(content) ? content : content.split("\n");

  for (const rawLine of textLines) {
    const trimmed = rawLine.trim();

    // Check if new page needed
    if (cursorY > pageHeight - 25) {
      doc.addPage();
      cursorY = 25;
      
      // Secondary header
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Study Stranger • ${title.substring(0, 40)}`, margin, 15);
      doc.line(margin, 18, pageWidth - margin, 18);
    }

    if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
      // Heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      cursorY += 4;
      const cleanHeading = trimmed.replace(/^#+\s*/, "");
      const hLines = doc.splitTextToSize(cleanHeading, contentWidth);
      doc.text(hLines, margin, cursorY);
      cursorY += hLines.length * 6 + 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
    } else if (trimmed.startsWith("-") || trimmed.startsWith("•") || /^\d+\./.test(trimmed)) {
      // Bullet or list
      const bulletText = trimmed.replace(/^[-•]\s*/, "");
      const bLines = doc.splitTextToSize(`•  ${bulletText}`, contentWidth - 4);
      doc.text(bLines, margin + 3, cursorY);
      cursorY += bLines.length * 5.5 + 1.5;
    } else if (trimmed.length === 0) {
      cursorY += 4;
    } else {
      // Standard paragraph
      const pLines = doc.splitTextToSize(trimmed, contentWidth);
      doc.text(pLines, margin, cursorY);
      cursorY += pLines.length * 5.5 + 2;
    }
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Study Stranger Platform • Admin Verified Notice & Material", margin, pageHeight - 8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  return doc.output("datauristring");
}

/**
 * Triggers direct browser download for a data URL or Blob
 */
export function downloadPdfFromDataUrl(dataUrl: string, fileName: string = "Notice_Document.pdf") {
  try {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error("PDF Download trigger failed:", e);
    const win = window.open();
    if (win) {
      win.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    }
  }
}
