import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Brain, Plus, Trash2, Bookmark, Check, Sparkles, Lock, Save, RefreshCw, Calculator, MessageSquare, AlertTriangle } from "lucide-react";
import { getUserMemories, saveUserMemory, deleteUserMemory, clearAllUserMemories, syncMemoriesFromFirestore, UserMemory } from "../services/geminiService";

interface AIMemoryVaultProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
}

export const AIMemoryVault: React.FC<AIMemoryVaultProps> = ({
  isOpen,
  onClose,
  userId = "default",
  userName = "Abhijit"
}) => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [category, setCategory] = useState("Mentor Memory");
  const [activeFilter, setActiveFilter] = useState("All");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const refreshMemories = async () => {
    setIsSyncing(true);
    if (userId && userId !== "default") {
      await syncMemoriesFromFirestore(userId);
    }
    setMemories(getUserMemories(userId));
    setIsSyncing(false);
  };

  useEffect(() => {
    if (isOpen) {
      refreshMemories();
    }
  }, [isOpen, userId]);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    saveUserMemory(newMemoryText, userId, category);
    setNewMemoryText("");
    setSavedSuccess(true);
    setMemories(getUserMemories(userId));
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDelete = (id: string) => {
    deleteUserMemory(id, userId);
    setMemories(getUserMemories(userId));
  };

  const handleClearAll = () => {
    clearAllUserMemories(userId);
    setMemories([]);
    setConfirmClear(false);
  };

  if (!isOpen) return null;

  const categoriesList = ["All", "Mentor Memory", "Math Solver", "Doubt Solver", "Study Preference", "Target & Goal"];

  const filteredMemories = memories.filter(m => {
    if (activeFilter === "All") return true;
    return m.category === activeFilter;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-150 overflow-hidden flex flex-col max-h-[88vh] relative animate-fade-in"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-indigo-50/50 text-stone-850 flex items-center justify-between relative overflow-hidden border-b border-indigo-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
                <Brain size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg md:text-xl font-black tracking-tight uppercase text-stone-900">Your AI Memory Bank</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Lock size={10} /> Account Saved
                  </span>
                </div>
                <p className="text-[10px] md:text-xs text-indigo-700 font-bold mt-0.5">
                  Account Bound to <span className="text-indigo-900 font-extrabold">{userName}</span> ({userId !== "default" ? "Cloud Sync Active" : "Local Mode"})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={refreshMemories}
                disabled={isSyncing}
                title="Sync memory from account cloud"
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer border border-stone-200"
              >
                <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all cursor-pointer border border-stone-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Account Banner */}
          <div className="p-3.5 bg-indigo-50/40 border-b border-indigo-100/60 flex items-center justify-between text-indigo-900 text-xs font-medium px-6">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-indigo-600 shrink-0" />
              <p className="leading-snug text-[11px] text-indigo-850">
                <strong>Account Persistence:</strong> Logged out ba new login korleo ei Account-er AI Memories restore hoye jabe.
              </p>
            </div>
          </div>

          {/* Main Body */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 scrollbar-hide bg-white">
            {/* Add Memory Form */}
            <form onSubmit={handleAddMemory} className="space-y-3 bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1 font-sans">
                  <Plus size={12} /> Add New Memory / Rule
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="Mentor Memory">Mentor Memory</option>
                  <option value="Math Solver">Math Solver</option>
                  <option value="Doubt Solver">Doubt Solver</option>
                  <option value="Study Preference">Study Preference</option>
                  <option value="Target & Goal">Target & Goal</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                  placeholder='e.g., "Ami Biology Unit II beshi porbo", "Math step-by-step bujhiye bolo"...'
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!newMemoryText.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-indigo-200 shrink-0 cursor-pointer"
                >
                  <Save size={14} /> Save Rule
                </button>
              </div>

              <AnimatePresence>
                {savedSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-emerald-600 text-xs font-bold pt-1"
                  >
                    <Check size={14} /> Saved into Account Memory Vault!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    activeFilter === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-250"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of Memories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans">
                  Stored Memories ({filteredMemories.length})
                </h3>
                {memories.length > 0 && (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} /> Clear All Memories
                  </button>
                )}
              </div>

              {confirmClear && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                    <AlertTriangle size={16} /> Delete all memories saved for this account?
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer hover:bg-rose-500"
                    >
                      Yes, Delete All
                    </button>
                  </div>
                </div>
              )}

              {filteredMemories.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Bookmark className="mx-auto text-slate-300" size={32} />
                  <p className="text-xs font-bold text-slate-500">No memories found for {activeFilter}</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Type a rule above or talk with Mentor / Solvers to automatically store memories for this account!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {filteredMemories.map((mem, idx) => (
                    <motion.div
                      key={`mem-${mem.id}-${idx}`}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-white border border-slate-150 rounded-2xl shadow-xs hover:border-indigo-100 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-md uppercase tracking-wider font-sans">
                            {mem.category || "Rule"}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(mem.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          "{mem.fact}"
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(mem.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                        title="Delete memory"
                      >
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between px-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">
              Account Memory Protection Enabled
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
