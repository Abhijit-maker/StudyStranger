import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  X, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Volume2,
  Share2
} from "lucide-react";
import { MathText } from "./MathText";

interface StickyItem {
  id: string;
  subject: "Biology" | "Physics" | "Chemistry" | "Mathematics" | "Bengali" | "English";
  title: string;
  content: string;
  latex?: string;
  notes?: string;
  tag: string;
  createdAt: string;
}

const DEFAULT_STICKIES: StickyItem[] = [
  {
    id: "st-1",
    subject: "Biology",
    title: "Fertilization ZP3 Receptor",
    content: "Human sperm acrosome releases hyaluronidase to bind ZP3 glycoprotein on Zona Pellucida.",
    latex: "\\text{Sperm Acrosome} + \\text{ZP3} \\rightarrow \\text{Fertilization}",
    notes: "WBCHSE Class 12 Sem 3 must-know critical MCQ point.",
    tag: "Unit I",
    createdAt: "2026-10-01"
  },
  {
    id: "st-2",
    subject: "Biology",
    title: "LH Surge & Ovulation Timing",
    content: "Luteinizing Hormone (LH) surge occurs on Day 14 of 28-day menstrual cycle, triggering Graafian follicle rupture.",
    latex: "\\text{Day 14} \\rightarrow \\text{LH Surge} \\rightarrow \\text{Ovulation}",
    notes: "High yield board question.",
    tag: "Unit I",
    createdAt: "2026-10-01"
  },
  {
    id: "st-3",
    subject: "Physics",
    title: "Bohr Quantized Energy Levels",
    content: "Hydrogen atom electron energy levels are negative and inversely proportional to n².",
    latex: "E_n = -\\frac{13.6}{n^2}\\text{ eV},\\quad \\Delta E = h\\nu = E_2 - E_1",
    notes: "Lyman (UV), Balmer (Visible), Paschen (Infrared).",
    tag: "Modern Physics",
    createdAt: "2026-10-01"
  },
  {
    id: "st-4",
    subject: "Chemistry",
    title: "Benzene Delocalized Pi-Electrons",
    content: "Planar hexagonal ring with 6 delocalized π-electrons following Hückel's Rule (4n+2, n=1).",
    latex: "\\text{C}_6\\text{H}_6\\text{ (120}^\\circ\\text{ sp}^2\\text{ Hybridization)},\\quad E_{\\text{res}} = 150.6\\text{ kJ/mol}",
    notes: "Equal C-C bond length 1.39 Angstroms.",
    tag: "Organic",
    createdAt: "2026-10-01"
  },
  {
    id: "st-5",
    subject: "English",
    title: "Lord Tennyson: Ulysses Core Moto",
    content: "'To strive, to seek, to find, and not to yield.'",
    notes: "Victorian spirit of boundless exploration & continuous struggle.",
    tag: "Verse",
    createdAt: "2026-10-01"
  },
  {
    id: "st-6",
    subject: "Bengali",
    title: "প্রভাতকুমার মুখোপাধ্যায়: আদরিনী",
    content: "জয়রাম মোক্তারের আদরিনী হাতির ক্রয়মূল্য ছিল ২০০০ টাকা।",
    notes: "বাৎসল্য স্নেহ ও আর্থিক সংকটের পারিবারিক ট্র্যাজেডি।",
    tag: "গল্প",
    createdAt: "2026-10-01"
  }
];

interface FormulaStickyDiaryModalProps {
  onClose: () => void;
  userName?: string;
}

export const FormulaStickyDiaryModal: React.FC<FormulaStickyDiaryModalProps> = ({
  onClose,
  userName = "Abhijit"
}) => {
  const [stickies, setStickies] = useState<StickyItem[]>(() => {
    try {
      const saved = localStorage.getItem("user_sticky_formula_diary");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_STICKIES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New item form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLatex, setNewLatex] = useState("");
  const [newSubject, setNewSubject] = useState<StickyItem["subject"]>("Biology");

  const saveToStorage = (items: StickyItem[]) => {
    setStickies(items);
    localStorage.setItem("user_sticky_formula_diary", JSON.stringify(items));
  };

  const handleAddSticky = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newItem: StickyItem = {
      id: `st-${Date.now()}`,
      subject: newSubject,
      title: newTitle.trim(),
      content: newContent.trim(),
      latex: newLatex.trim() || undefined,
      tag: "Custom Note",
      createdAt: new Date().toISOString().split("T")[0]
    };

    const updated = [newItem, ...stickies];
    saveToStorage(updated);
    setNewTitle("");
    setNewContent("");
    setNewLatex("");
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = stickies.filter(s => s.id !== id);
    saveToStorage(updated);
  };

  const handleCopy = (item: StickyItem) => {
    const textToCopy = `${item.title}\n${item.content}\n${item.latex ? `Formula: ${item.latex}` : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = stickies.filter(s => {
    const matchSub = selectedSubject === "All" || s.subject === selectedSubject;
    const q = searchQuery.toLowerCase();
    const matchQ = s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || (s.latex && s.latex.toLowerCase().includes(q));
    return matchSub && matchQ;
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-stone-900 to-orange-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#FF7A30] flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Bookmark size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                  WBCHSE Formula & Quote Diary
                </span>
                <span className="text-xs text-stone-400 font-mono">({stickies.length} Saved)</span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                ব্যক্তিগত বুকমার্ক, ফর্মুলা ও উক্তি ডায়েরি
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF7A30] hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Note</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sub-bar: Search & Subject Filters */}
        <div className="p-3 sm:p-4 bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {["All", "Biology", "Physics", "Chemistry", "Mathematics", "Bengali", "English"].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedSubject === sub
                    ? "bg-[#FF7A30] text-white shadow-xs"
                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulas or quotes..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white outline-none focus:border-[#FF7A30]"
            />
          </div>
        </div>

        {/* Add Note Form Modal / Drawer */}
        {showAddForm && (
          <form onSubmit={handleAddSticky} className="p-4 bg-amber-500/10 border-b border-amber-500/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title (e.g., Lorentz Force / Ulysses Quote)"
                required
                className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-white outline-none"
              />
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value as any)}
                className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-white outline-none"
              >
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Bengali">Bengali</option>
                <option value="English">English</option>
              </select>
            </div>

            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Content / Explanation / Quote text..."
              rows={2}
              required
              className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-white outline-none"
            />

            <input
              type="text"
              value={newLatex}
              onChange={(e) => setNewLatex(e.target.value)}
              placeholder="Optional LaTeX formula (e.g. F = q(E + v \times B))"
              className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono text-stone-900 dark:text-white outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#FF7A30] text-white text-xs font-bold shadow-sm"
              >
                Save Bookmark
              </button>
            </div>
          </form>
        )}

        {/* Sticky Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700/80 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF7A30]/10 text-[#FF7A30]">
                    {item.subject} · {item.tag}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 cursor-pointer"
                      title="Copy to clipboard"
                    >
                      {copiedId === item.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
                      title="Delete bookmark"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-black text-stone-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  <MathText text={item.content} />
                </p>

                {item.latex && (
                  <div className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-center">
                    <MathText text={item.latex} block={true} />
                  </div>
                )}
              </div>

              {item.notes && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-700 text-[10px] text-stone-500 flex items-center justify-between">
                  <span>💡 {item.notes}</span>
                  <span className="font-mono">{item.createdAt}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
