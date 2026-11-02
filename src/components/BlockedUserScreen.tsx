import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  Mail, 
  Copy, 
  Check, 
  LogOut, 
  Lock, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface BlockedUserScreenProps {
  user: any;
  onLogout: () => void;
}

export const BlockedUserScreen: React.FC<BlockedUserScreenProps> = ({ user, onLogout }) => {
  const [copied, setCopied] = useState(false);
  const adminEmail = "jhhh47943@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const mailSubject = encodeURIComponent(`Unblock Request - ${user?.displayName || user?.username || "Student"}`);
  const mailBody = encodeURIComponent(
    `Hello Admin,\n\nMy account has been blocked on Study Stranger.\nAccount Details:\n- Name: ${user?.displayName || "N/A"}\n- Email/Username: ${user?.email || user?.username || "N/A"}\n- User ID: ${user?.uid || "N/A"}\n\nPlease review and kindly unblock my account.\n\nThank you!`
  );
  const mailtoUrl = `mailto:${adminEmail}?subject=${mailSubject}&body=${mailBody}`;

  return (
    <div className="fixed inset-0 z-[99999] bg-stone-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-red-500 selection:text-white">
      {/* Background ambient red glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[32rem] h-96 sm:h-[32rem] bg-rose-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-900/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg bg-stone-900/90 border-2 border-rose-500/40 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-rose-950/60 backdrop-blur-2xl text-center space-y-6"
      >
        {/* Security Shield Icon Header */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-xl shadow-rose-600/40 animate-bounce">
              <ShieldAlert size={44} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-stone-950 text-rose-400 p-2 rounded-2xl border border-rose-500/50 shadow-md">
              <Lock size={18} />
            </div>
          </div>
        </div>

        {/* Warning Badge & Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider">
            <AlertTriangle size={14} />
            <span>Account Suspended / Blocked</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">
            অ্যাডমিনের নির্দেশনায় আপনার অ্যাকাউন্টের সমস্ত ফিচার এবং অ্যাক্সেস সাময়িকভাবে বন্ধ (Locked) রাখা হয়েছে।
          </p>
        </div>

        {/* Block Info Card */}
        <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-stone-800/80">
            <span className="text-stone-400 font-bold uppercase text-[10px]">User Account:</span>
            <span className="text-white font-mono font-bold truncate max-w-[200px]">
              {user?.displayName || user?.username || "Student"}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-stone-800/80">
            <span className="text-stone-400 font-bold uppercase text-[10px]">Email / Handle:</span>
            <span className="text-stone-300 font-mono truncate max-w-[200px]">
              {user?.email || `@${user?.username || "user"}`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400 font-bold uppercase text-[10px]">Feature Status:</span>
            <span className="text-rose-400 font-black uppercase text-[10px] bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              🚫 All Features Disabled
            </span>
          </div>
        </div>

        {/* Contact Admin Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-stone-950 to-stone-900 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 justify-center text-xs font-black uppercase tracking-wider text-rose-300">
            <Mail size={16} />
            <span>Contact Administrator to Unblock</span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            অ্যাকাউন্ট সক্রিয় করতে অ্যাডমিনের সাথে ইমেইলে যোগাযোগ করুন:
          </p>

          {/* Email Pill with Copy Button */}
          <div className="flex items-center justify-between gap-2 p-3 bg-stone-950 rounded-xl border border-stone-800">
            <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 select-all truncate">
              {adminEmail}
            </span>

            <button
              onClick={handleCopyEmail}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                copied 
                  ? "bg-emerald-500 text-stone-950 font-black" 
                  : "bg-stone-800 hover:bg-stone-700 text-stone-200"
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          {/* 1-Click Direct Mail Button */}
          <a
            href={mailtoUrl}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Mail size={16} />
            <span>Send Unblock Request Email</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Real-time sync hint */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 font-medium">
          <RefreshCw size={12} className="animate-spin text-rose-400" />
          <span>অ্যাডমিন আনব্লক করলে স্বয়ংক্রিয়ভাবে স্ক্রিন খুলে যাবে।</span>
        </div>

        {/* Logout / Switch Account */}
        <div className="pt-2 border-t border-stone-800">
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Log Out / Switch Account (অন্য অ্যাকাউন্টে সাইন ইন করুন)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
