import React, { useState } from "react";
import { motion } from "motion/react";
import { Wrench, Clock, ShieldAlert, LogOut, Mail, Copy, Check } from "lucide-react";

interface MaintenanceScreenProps {
  user: any;
  onLogout: () => void;
  onAdminLogin?: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ user, onLogout, onAdminLogin }) => {
  const [copied, setCopied] = useState(false);
  const adminEmail = "studystrangerai@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-stone-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-amber-500 selection:text-white font-sans">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[32rem] h-96 sm:h-[32rem] bg-orange-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-900/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg bg-stone-900/90 border-2 border-amber-500/40 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-orange-950/60 backdrop-blur-2xl text-center space-y-6"
      >
        {/* Icon Header */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/40 animate-pulse">
              <Wrench size={44} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-stone-950 text-amber-400 p-2 rounded-2xl border border-amber-500/50 shadow-md">
              <Clock size={18} />
            </div>
          </div>
        </div>

        {/* Title & Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
            <ShieldAlert size={14} />
            <span>System Maintenance Notice</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Study Stranger is Under Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">
            The application is temporarily closed for general users. No one can use the system except the administrator; only the administrator is allowed to log in and use it. System upgrades and updates are currently in progress, and the platform will remain closed for a few days. Thank you for your patience.
          </p>
        </div>

        {/* Status Box */}
        <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-stone-800/80">
            <span className="text-stone-400 font-bold uppercase text-[10px]">Platform Status:</span>
            <span className="text-amber-400 font-mono font-bold uppercase text-[10px] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              ⚡ Upgrading & Updating
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-stone-800/80">
            <span className="text-stone-400 font-bold uppercase text-[10px]">Estimated Duration:</span>
            <span className="text-stone-300 font-mono">A Few Days (Will be back soon)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400 font-bold uppercase text-[10px]">Admin Access:</span>
            <span className="text-emerald-400 font-black uppercase text-[10px]">
              🔒 Restricted to Admin Only
            </span>
          </div>
        </div>

        {/* Admin Contact Box */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-center space-y-2">
          <p className="text-[11px] text-stone-400">
            Need urgent assistance or inquiry? Contact the administrator:
          </p>
          <div className="flex items-center justify-between gap-2 p-2.5 bg-stone-900 rounded-xl border border-stone-800">
            <span className="font-mono text-xs font-bold text-amber-300 truncate">
              {adminEmail}
            </span>
            <button
              onClick={handleCopyEmail}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                copied ? "bg-emerald-500 text-stone-950 font-black" : "bg-stone-800 hover:bg-stone-700 text-stone-200"
              }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Action Button: Admin Sign In or Logout */}
        <div className="pt-2 border-t border-stone-800 flex flex-col gap-2">
          {user ? (
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>Log Out / Switch Account</span>
            </button>
          ) : (
            onAdminLogin && (
              <button
                onClick={onAdminLogin}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-orange-500/20"
              >
                🔒 Authorized Admin Login
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
};
