import React from "react";
import { motion } from "motion/react";
import { X, BarChart3, TrendingUp, Target, AlertTriangle, CheckCircle2, ChevronRight, Brain } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

interface SubjectStats {
  subject: string;
  score: number;
  total: number;
  color: string;
}

const masteryData = [
  { subject: "Bengali", score: 85, fullMark: 100, unit: "Literature" },
  { subject: "English", score: 72, fullMark: 100, unit: "Grammar" },
  { subject: "Math", score: 45, fullMark: 100, unit: "Calculus" },
  { subject: "Physics", score: 68, fullMark: 100, unit: "Optics" },
  { subject: "Chemistry", score: 55, fullMark: 100, unit: "Organic" },
  { subject: "Com. App.", score: 92, fullMark: 100, unit: "Logic" },
];

export const PerformanceInsights: React.FC<{ onClose: () => void; userName?: string; userId?: string }> = ({ onClose, userName = "Abhijit", userId }) => {
  const [masteryData, setMasteryData] = React.useState<any[]>([]);
  const [history, setHistory] = React.useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const testHistoryKey = userId ? `mock_test_history_${userId}` : "mock_test_history";

  const loadData = React.useCallback(() => {
    setIsRefreshing(true);
    const savedHistory = JSON.parse(localStorage.getItem(testHistoryKey) || "[]");
    setHistory(savedHistory);

    // Calculate mastery per subject
    const subjects = ["English", "Bengali", "Math", "Physics", "Chemistry", "Computer App"];
    const subjectMap: Record<string, { total: number; score: number }> = {};
    
    subjects.forEach(s => subjectMap[s] = { total: 0, score: 0 });
    
    savedHistory.forEach((item: any) => {
      if (subjectMap[item.subject]) {
        subjectMap[item.subject].total += item.total;
        subjectMap[item.subject].score += item.score;
      }
    });

    const calculatedData = subjects.map(s => ({
      subject: s,
      score: subjectMap[s].total > 0 ? Math.round((subjectMap[s].score / subjectMap[s].total) * 100) : 0,
      fullMark: 100,
      unit: savedHistory.filter((h: any) => h.subject === s).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.topic || "General Practice"
    }));

    setMasteryData(calculatedData);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [testHistoryKey]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const clearHistory = () => {
    if (confirm("History delete korte chao?")) {
      localStorage.removeItem(testHistoryKey);
      loadData();
    }
  };

  const strongest = [...masteryData].sort((a, b) => b.score - a.score)[0];
  const weakest = [...masteryData].sort((a, b) => a.score - b.score).find(m => m.score > 0) || masteryData.find(m => m.score === 0) || masteryData[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center md:p-4 bg-slate-900/60 backdrop-blur-xl"
    >
      <div className="bg-white w-full max-w-5xl h-full md:h-[85vh] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="p-5 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-3 md:gap-5">
            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm transition-all ${isRefreshing ? 'animate-pulse' : ''}`}>
              <BarChart3 className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight leading-none">AI Study Insight</h2>
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 md:mt-2">Personalized Weakness Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={loadData}
              className="px-3 py-2 md:px-4 md:py-2 bg-indigo-600 text-white rounded-xl text-[8px] md:text-[10px] font-black uppercase hover:bg-indigo-700 transition-all shadow-sm"
            >
              Reload
            </button>
            <button 
              onClick={clearHistory}
              className="px-3 py-2 md:px-4 md:py-2 bg-slate-50 text-slate-400 rounded-xl text-[8px] md:text-[10px] font-black uppercase hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              Reset
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm"
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 bg-slate-50/30 space-y-6 md:space-y-8">
          {history.length === 0 && (
            <div className="p-8 md:p-12 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 text-center space-y-4">
               <Brain size={48} className="mx-auto text-indigo-600 opacity-20" />
               <h3 className="text-xl font-black text-slate-800">No Data Yet</h3>
               <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                 {userName}, analysis dekhar jonne prothome kichu mock test dao. Tomar performance-er opor base kore AI weakness khuje ber korbe.
               </p>
            </div>
          )}

          {/* Top Row: Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 md:p-6 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-3 md:gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <TrendingUp size={16} className="md:w-5 md:h-5" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</span>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-slate-900 line-clamp-1">{strongest?.score > 0 ? strongest.subject : "N/A"}</p>
                <p className="text-[10px] md:text-xs font-bold text-emerald-600 mt-1">{strongest?.score || 0}% Mastery Level</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 md:p-6 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-rose-100 shadow-sm flex flex-col gap-3 md:gap-4 bg-gradient-to-br from-white to-rose-50/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <AlertTriangle size={16} className="md:w-5 md:h-5" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Weakness</span>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-slate-900 line-clamp-1">{weakest?.score < 40 ? weakest.subject : "Checking..."}</p>
                <p className="text-[10px] md:text-xs font-bold text-rose-600 mt-1">Focus Required: {weakest?.score < 40 ? "High" : "Moderate"}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 md:p-6 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-3 md:gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Target size={16} className="md:w-5 md:h-5" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Target for Today</span>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-slate-900">Solve 20 MCQs</p>
                <p className="text-[10px] md:text-xs font-bold text-amber-600 mt-1">+120 Stranger Points</p>
              </div>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Subject Mastery Radar */}
            <div className="p-6 md:p-8 bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-8 text-center md:text-left">Subject Mastery Wheel</h3>
              <div className="h-[250px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={masteryData}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 900, fill: "#64748b" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Mastery"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mastery Grid */}
            <div className="p-6 md:p-8 bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-8 text-center md:text-left">Mastery Progress</h3>
              <div className="space-y-4 md:space-y-6 flex-1 overflow-y-auto pr-2">
                {masteryData.slice(0, 6).map((m, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">{m.subject}</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">{m.unit}</p>
                      </div>
                      <span className="text-[10px] md:text-xs font-black text-indigo-600">{m.score}%</span>
                    </div>
                    <div className="w-full h-1.5 md:h-2 bg-slate-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.score}%` }}
                        transition={{ delay: i * 0.1, duration: 1 }}
                        className={`h-full rounded-full ${m.score > 80 ? "bg-emerald-500" : m.score > 50 ? "bg-indigo-500" : "bg-rose-500"}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Advice */}
          <div className="p-6 md:p-8 bg-slate-900 rounded-[2rem] md:rounded-[3rem] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500 hidden md:block">
               <Brain size={120} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start text-center md:text-left">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/10 flex items-center justify-center text-indigo-400 shadow-2xl shrink-0">
                  <Brain className="w-6 h-6 md:w-8 md:h-8" />
               </div>
               <div className="space-y-3 md:space-y-4">
                  <div>
                    <h4 className="text-lg md:text-xl font-black tracking-tight leading-tight">Stranger's Strategy for Today</h4>
                    <p className="text-slate-400 text-[8px] md:text-[10px] font-medium uppercase tracking-widest mt-1">Based on your recent MCQ performance</p>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed max-w-2xl px-2 md:px-0">
                    {userName}, tomar {strongest?.score > 0 ? strongest.subject : "study sessions"} e performance bhalo, kintu <span className="text-rose-400 font-black">{weakest?.subject || "certain topics"}</span> segment e ektu focus dorker. Mock tests show that you might need to review fundamental concepts carefully. Review your Mistake Bank today.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 pt-2">
                    <button className="px-4 py-2 md:px-6 md:py-3 bg-white text-slate-900 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all">
                      Review Mistakes
                    </button>
                    <button className="px-4 py-2 md:px-6 md:py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      Daily Goal
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
