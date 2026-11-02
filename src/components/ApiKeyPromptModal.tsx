import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X, Sparkles } from "lucide-react";

interface ApiKeyPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey?: (key: string) => Promise<void> | void;
  currentKey?: string;
  userName?: string;
  featureNotice?: string;
}

export const ApiKeyPromptModal: React.FC<ApiKeyPromptModalProps> = ({
  isOpen,
  onClose,
  userName = "Student",
  featureNotice = ""
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md select-none"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white border-2 border-slate-900 text-slate-900 rounded-3xl w-full max-w-md shadow-[6px_6px_0_#0f172a] overflow-hidden flex flex-col"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#fafaf7]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Studio Engine Ready
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Welcome {userName} • WBCHSE Sem 3 Cloud
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-3 text-xs text-slate-600 leading-relaxed">
            {featureNotice && (
              <p className="font-semibold text-slate-800">{featureNotice}</p>
            )}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">
                  Server-Side Studio Engine Active
                </strong>
                All 3D Mentors, Natural Voice synthesis, and 1000MB PDF analysis tools are automatically connected via the secure backend server.
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all cursor-pointer"
            >
              চালিয়ে যান (Continue)
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
