import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { X, Trophy, Medal, Star, TrendingUp, Users, Crown, Loader2 } from "lucide-react";
import { db, collection, query, orderBy, limit, onSnapshot, OperationType, handleFirestoreError } from "../firebase";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  isMe?: boolean;
}

export const StrangerLeaderboard: React.FC<{ onClose: () => void; currentUserId?: string }> = ({ onClose, currentUserId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        name: doc.data().displayName,
        points: doc.data().points,
        isMe: doc.id === currentUserId
      }));
      setLeaderboard(data);
      setLoading(false);
    }, (error) => {
      console.warn("Leaderboard subscription error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xl"
    >
      <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200 dark:border-stone-800 h-[80vh]">
        {/* Header */}
        <div className="p-8 bg-stone-900 text-white relative overflow-hidden shrink-0">
           <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
             <Trophy size={140} />
           </div>
           <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
                   <Crown size={28} />
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight leading-none uppercase">Stranger Rank</h2>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-1 text-emerald-400 text-xs font-black uppercase tracking-widest">
                     <TrendingUp size={12} /> Live Ranking
                   </div>
                   <div className="w-1 h-1 rounded-full bg-white/20"></div>
                   <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Global Sem 3 Ranking</div>
                </div>
              </div>
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-stone-50/50 dark:bg-stone-950/20 custom-scrollbar">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-4 text-stone-400">
               <Loader2 className="animate-spin text-orange-500" size={32} />
               <span className="text-[10px] font-black uppercase tracking-widest">Fetching global rankings...</span>
             </div>
           ) : leaderboard.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center gap-4 text-stone-400">
                <Users size={40} className="opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-widest">No rankings found</span>
             </div>
           ) : (
             leaderboard.map((entry, i) => (
               <motion.div
                 key={`${entry.name}-${entry.rank}-${i}`}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className={`p-5 rounded-[2rem] flex items-center justify-between transition-all border ${
                   entry.isMe 
                     ? "bg-stone-900 dark:bg-orange-500 text-white shadow-xl shadow-stone-900/20 border-stone-900 dark:border-orange-400" 
                     : "bg-white dark:bg-stone-800/50 border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700 shadow-sm"
                 }`}
               >
                 <div className="flex items-center gap-5">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                     entry.rank === 1 ? "bg-amber-100 text-amber-600" :
                     entry.rank === 2 ? "bg-slate-100 text-slate-400" :
                     entry.rank === 3 ? "bg-orange-100 text-orange-600" :
                     entry.isMe ? "bg-white/10 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                   }`}>
                     {entry.rank === 1 ? <Medal size={20} /> : entry.rank}
                   </div>
                   <div>
                     <h4 className={`text-sm font-black ${entry.isMe ? "text-white" : "text-stone-800 dark:text-stone-200"}`}>
                       {entry.name || "Unknown Stranger"}
                     </h4>
                     <p className={`text-[10px] font-bold uppercase tracking-widest ${entry.isMe ? "text-white/70" : "text-stone-400"}`}>
                       Active Stranger
                     </p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className={`text-lg font-black ${entry.isMe ? "text-white" : "text-orange-500"}`}>
                     {entry.points?.toLocaleString() || 0}
                   </p>
                   <p className={`text-[10px] font-bold uppercase tracking-widest ${entry.isMe ? "text-white/50" : "text-stone-400"}`}>Points</p>
                 </div>
               </motion.div>
             ))
           )}
        </div>

        {/* Footer info */}
        <div className="p-8 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Users size={20} />
             </div>
             <p className="text-xs font-bold text-stone-500 dark:text-stone-400">1,240 Strangers active online</p>
           </div>
           <button className="px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer">
             Weekly Rewards
           </button>
        </div>
      </div>
    </motion.div>
  );
};
