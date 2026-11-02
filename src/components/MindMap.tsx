import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Brain, Sparkles, ChevronRight, Zap, Target, Loader2, Search } from "lucide-react";
import { generateMindMap } from "../services/geminiService";

interface Node {
  id: string;
  label: string;
  type: "root" | "main" | "sub";
  parentId: string | null;
  x?: number;
  y?: number;
}

export const MindMap: React.FC<{ onClose: () => void, apiKey?: string }> = ({ onClose, apiKey }) => {
  const [topic, setTopic] = useState(() => localStorage.getItem("draft_mindmap_topic") || "");
  const [mapNodes, setMapNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const calculateLayout = (nodes: Node[]): Node[] => {
    if (nodes.length === 0) return [];
    
    const root = nodes.find(n => n.type === 'root') || nodes[0];
    const laidOut: Node[] = [];
    
    // Position root at center
    const rootNode = { ...root, x: 50, y: 50 };
    laidOut.push(rootNode);

    const mainNodes = nodes.filter(n => n.parentId === root.id && n.id !== root.id);
    mainNodes.forEach((node, i) => {
      const angle = (i / mainNodes.length) * 2 * Math.PI;
      const radius = 25;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      
      const mainNode = { ...node, x, y };
      laidOut.push(mainNode);

      const subNodes = nodes.filter(n => n.parentId === node.id);
      subNodes.forEach((sub, j) => {
        const subAngle = angle + (j - (subNodes.length - 1) / 2) * 0.3;
        const subRadius = 40;
        const subX = 50 + subRadius * Math.cos(subAngle);
        const subY = 50 + subRadius * Math.sin(subAngle);
        laidOut.push({ ...sub, x: subX, y: subY });
      });
    });

    // Handle any orphans
    nodes.forEach(node => {
        if (!laidOut.find(l => l.id === node.id)) {
            laidOut.push({ ...node, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
        }
    });

    return laidOut;
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setMapNodes([]);
    setSelectedNode(null);
    try {
      const nodes = await generateMindMap(topic, apiKey);
      const laidOut = calculateLayout(nodes);
      setMapNodes(laidOut);
      localStorage.removeItem("draft_mindmap_topic");
      setTopic("");
    } catch (err) {
      console.error("Failed to generate mind map", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 bg-slate-950/60 backdrop-blur-2xl"
    >
      <div className="bg-slate-50 w-full h-full md:max-w-7xl md:h-[90vh] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 relative">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-200 flex items-center justify-between bg-white relative z-30">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <Brain size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Concept Neural Map</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                <Sparkles size={12} className="text-amber-400" /> Topic Visualization
              </p>
            </div>
          </div>
          
          <form onSubmit={handleGenerate} className="hidden md:flex items-center gap-3 bg-slate-100 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-slate-900 transition-all">
             <div className="pl-4 text-slate-400"><Search size={18} /></div>
             <input 
               type="text" 
               value={topic}
               onChange={(e) => {
                 const val = e.target.value;
                 setTopic(val);
                 localStorage.setItem("draft_mindmap_topic", val);
               }}
               placeholder="Enter a topic (e.g. Life Cycle of Frog)"
               className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-80 h-10"
             />
             <button 
               type="submit"
               disabled={isLoading || !topic.trim()}
               className="px-8 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
             >
               {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Synthesize Map"}
             </button>
          </form>

          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Map Display area */}
        <div className="flex-1 relative overflow-hidden bg-slate-50">
           {/* Grid */}
           <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

           <AnimatePresence>
             {isLoading ? (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-xl"
               >
                 <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-6" />
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Analyzing Concept Layers</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 animate-pulse">Building associative connections...</p>
               </motion.div>
             ) : mapNodes.length > 0 ? (
               <div className="absolute inset-0 w-full h-full p-10 md:p-20 overflow-auto scrollbar-hide">
                 <div className="relative w-[150%] h-[150%] md:w-full md:h-full min-h-[600px]">
                    {/* SVG Connections Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                       {mapNodes.map(node => {
                         if (!node.parentId) return null;
                         const parent = mapNodes.find(n => n.id === node.parentId);
                         if (!parent) return null;
                         return (
                           <line 
                             key={`line-${node.id || 'line'}-${node.parentId || ''}`}
                             x1={`${parent.x}%`} 
                             y1={`${parent.y}%`} 
                             x2={`${node.x}%`} 
                             y2={`${node.y}%`} 
                             stroke="black" 
                             strokeWidth="2"
                             strokeDasharray="4 4"
                           />
                         );
                       })}
                    </svg>

                    {/* Nodes Layer */}
                    {mapNodes.map((node, i) => (
                      <motion.div
                        key={`node-${node.id || i}-${i}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, type: 'spring' }}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group"
                        onClick={() => setSelectedNode(node)}
                      >
                         <div className={`
                            p-4 md:p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col items-center justify-center min-w-[140px] md:min-w-[180px] shadow-sm hover:shadow-xl
                            ${node.type === 'root' ? 'bg-slate-900 border-slate-900 text-white z-20 scale-125' : 
                              node.type === 'main' ? 'bg-white border-slate-200 text-slate-900 z-10' : 
                              'bg-indigo-50 border-indigo-100 text-indigo-900 scale-90'}
                         `}>
                            {node.type === 'root' && <Sparkles size={16} className="text-amber-400 mb-2" />}
                            <span className={`font-black uppercase tracking-tight leading-none ${node.type === 'root' ? 'text-base' : 'text-xs'}`}>
                               {node.label}
                            </span>
                         </div>
                      </motion.div>
                    ))}
                 </div>
               </div>
             ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                   <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl rotate-3">
                      <Brain size={64} className="text-slate-200" />
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Visualizer</h3>
                   <p className="text-sm text-slate-400 font-bold max-w-sm mt-4 uppercase tracking-widest leading-loose">Enter any topic above to generate a topological map of human knowledge and semantic relationships.</p>
                </div>
             )}
           </AnimatePresence>
        </div>

        {/* Info Overlay */}
        <AnimatePresence>
           {selectedNode && (
             <motion.div
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 50 }}
               className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-auto min-w-[320px] bg-white rounded-[2.5rem] shadow-2xl p-8 z-[60] border border-slate-100 flex items-center justify-between gap-8"
             >
                <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedNode.type === 'root' ? 'bg-slate-900 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                      {selectedNode.type === 'root' ? <Brain size={24} /> : <Zap size={24} />}
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-900 leading-tight">{selectedNode.label}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                         Node Connection Strength: High
                      </p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900"
                >
                   <X size={18} />
                </button>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
