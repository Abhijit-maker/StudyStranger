import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search, Sparkles, BookOpen, Brain, Bot, ArrowRight, Layers, FileText, Compass, ExternalLink } from "lucide-react";
import { TOOLS } from "../data.js";

interface ToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "all", label: "All Tools (24)" },
  { id: "ai", label: "🤖 AI & Mentors" },
  { id: "practice", label: "🎯 Mock & Practice" },
  { id: "pdf", label: "📚 PDF & Vault" },
  { id: "strategy", label: "⚡ Study Lab" },
];

export const ToolsDrawer: React.FC<ToolsDrawerProps> = ({ isOpen, onClose }) => {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.desc.toLowerCase().includes(search.toLowerCase()) ||
      tool.tag.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCat === "all") return true;
    if (selectedCat === "ai") {
      return ["voice", "doubt", "scanner", "mentors", "memory"].includes(tool.id);
    }
    if (selectedCat === "practice") {
      return ["mock", "mcq", "blitz", "duel", "voicequiz", "flash"].includes(tool.id);
    }
    if (selectedCat === "pdf") {
      return ["notes", "notices", "pdf", "diary"].includes(tool.id);
    }
    if (selectedCat === "strategy") {
      return ["lab", "mind", "math", "mistakes", "syllabus", "autopsy", "focus", "telegram", "calls"].includes(tool.id);
    }
    return true;
  });

  const handleToolClick = (path: string) => {
    onClose();
    nav(path);
  };

  return (
    <div className="fixed inset-0 z-[160] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-[#FAF8F5] border-l-2 border-[#18181b] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-white border-b-2 border-[#18181b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF08A] border-2 border-[#18181b] flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_#18181b]">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-stone-900 font-serif">
                  Studio Tools Directory
                </h2>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#18181b] text-white">
                  24 Tools
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                WBCHSE Class 12 Semester 3 AI Toolkit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border-2 border-[#18181b] flex items-center justify-center font-black cursor-pointer shadow-[2px_2px_0px_#18181b]"
            title="Close Tools"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 bg-white border-b border-stone-200 shrink-0">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Search tools, notes, MCQs, voice, 3D..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F4F2EC] border-[1.5px] border-[#18181b] rounded-xl text-xs font-semibold focus:outline-none focus:bg-white text-stone-900 placeholder:text-stone-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black whitespace-nowrap cursor-pointer transition-colors border ${
                  selectedCat === cat.id
                    ? "bg-[#18181b] text-white border-[#18181b]"
                    : "bg-[#FAF8F5] text-stone-600 hover:bg-stone-200 border-stone-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredTools.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm font-bold text-stone-600">No tools found matching "{search}"</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCat("all");
                }}
                className="mt-3 px-3 py-1.5 bg-[#18181b] text-white rounded-xl text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredTools.map((t) => (
              <div
                key={t.id}
                onClick={() => handleToolClick(t.to)}
                className="group p-3 rounded-2xl bg-white border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] hover:shadow-[4px_4px_0px_#18181b] hover:-translate-y-0.5 cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl border-[1.5px] border-[#18181b] flex items-center justify-center font-bold text-sm shrink-0 shadow-[1.5px_1.5px_0px_#18181b]"
                    style={{ background: t.color || "#FEF08A" }}
                  >
                    ✦
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-amber-600 transition-colors truncate">
                        {t.title}
                      </h3>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                        {t.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-stone-50 group-hover:bg-[#18181b] group-hover:text-white border border-stone-200 flex items-center justify-center text-stone-500 transition-all shrink-0">
                  <ArrowRight size={13} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Bottom Bar */}
        <div className="p-3 bg-white border-t-2 border-[#18181b] flex items-center justify-between shrink-0 text-xs">
          <span className="font-bold text-stone-600">Showing {filteredTools.length} of 24 tools</span>
          <button
            type="button"
            onClick={() => handleToolClick("/app/notes")}
            className="px-3 py-1.5 rounded-xl bg-[#FEF08A] hover:bg-yellow-300 border-[1.5px] border-[#18181b] text-stone-900 font-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#18181b]"
          >
            <BookOpen size={13} />
            <span>PDF Library</span>
          </button>
        </div>
      </div>
    </div>
  );
};
