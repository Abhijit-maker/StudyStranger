import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, FileText, Download, Search, Filter, BookOpen, ExternalLink, Trash2, Eye } from "lucide-react";
import { DocumentPreviewModal } from "./DocumentPreviewModal";

interface Resource {
  id: string;
  title: string;
  type: string;
  date: string;
  fileData?: string;
  url?: string;
  body?: string;
}

interface ResourceLibraryProps {
  resources: Resource[];
  onClose: () => void;
  onRemove?: (id: string) => void;
}

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ resources, onClose, onRemove }) => {
  const [selectedPreview, setSelectedPreview] = useState<Resource | null>(null);

  const handleDownload = (res: any) => {
    if (res.fileData) {
      try {
        const link = document.createElement("a");
        link.href = res.fileData;
        link.download = res.fileName || `${res.title.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Base64 download failed", err);
        const win = window.open();
        if (win) {
          win.document.write(`<iframe src="${res.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
      }
    } else if (res.url) {
      window.open(res.url, "_blank", "noopener,noreferrer");
    } else {
      alert("No download URL or file data available for this resource.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl"
      >
        <div className="bg-white w-full max-w-3xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <BookOpen size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Knowledge Hub</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Personal Study Resources & Document Previews</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.length === 0 ? (
                 <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <FileText size={40} />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No resources added yet.</p>
                 </div>
              ) : (
                resources.map((res, idx) => (
                  <motion.div
                    key={`res-${res.id || idx}-${idx}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-emerald-200 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 leading-tight line-clamp-1">{res.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.type} • {res.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedPreview(res)}
                        className="flex-1 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye size={14} /> Preview
                      </button>
                      <button 
                        onClick={() => handleDownload(res)}
                        className="py-3 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition-all cursor-pointer"
                      >
                        <Download size={14} /> Download
                      </button>
                      {onRemove && (
                        <button 
                          onClick={() => onRemove(res.id)}
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
             <button className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center gap-2">
                <ExternalLink size={14} /> Access Board Library
             </button>
          </div>
        </div>
      </motion.div>

      {/* Document Preview Modal */}
      {selectedPreview && (
        <DocumentPreviewModal
          isOpen={!!selectedPreview}
          onClose={() => setSelectedPreview(null)}
          title={selectedPreview.title}
          subtitle={`Type: ${selectedPreview.type} • WBCHSE Class 12`}
          content={selectedPreview.body || selectedPreview.title}
          subject="WBCHSE Class 12"
          date={selectedPreview.date}
        />
      )}
    </>
  );
};
