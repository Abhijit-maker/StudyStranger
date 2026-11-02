import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Sparkles, 
  Coins, 
  ExternalLink, 
  ShieldCheck, 
  Tv, 
  Hand, 
  GraduationCap, 
  Flame, 
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle
} from "lucide-react";

interface StudyAdvantageProps {
  isOpen: boolean;
  onClose: () => void;
  userPoints: number;
  onUpdatePoints: (earned: number) => Promise<void>;
  userName: string;
}

// Interactive Ad Container component utilizing script key
const AdsterraAdvantageBannerA: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const adContainer = document.createElement("div");
    adContainer.id = "container-81400440586e371af5392dbbaadf2875";
    containerRef.current.appendChild(adContainer);

    const script = document.createElement("script");
    script.src = "https://pl29660586.effectivecpmnetwork.com/81400440586e371af5392dbbaadf2875/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="bg-slate-50 border border-[#CBD5E1]/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] w-full text-center">
      <span className="text-[9px] font-mono font-black text-[#EF6D2F] bg-orange-100/70 px-2 py-0.5 rounded uppercase tracking-widest mb-3">
        Native Advantage Terminal 1
      </span>
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
};

// Interactive 468x60 iframe ad options component
const AdsterraAdvantageBannerB: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    (window as any).atOptions = {
      'key' : '33e25dc1ccfefb623f67d1f7b59114d9',
      'format' : 'iframe',
      'height' : 60,
      'width' : 468,
      'params' : {}
    };

    const script = document.createElement("script");
    script.src = "https://www.highperformanceformat.com/33e25dc1ccfefb623f67d1f7b59114d9/invoke.js";
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="bg-slate-50 border border-[#CBD5E1]/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] w-full text-center">
      <span className="text-[9px] font-mono font-black text-rose-500 bg-rose-100/70 px-2 py-0.5 rounded uppercase tracking-widest mb-3">
        Standard High-Format Banner B
      </span>
      <div ref={containerRef} className="w-full flex justify-center overflow-x-auto" />
    </div>
  );
};

// Interactive 160x300 vertical banner component
const AdsterraAdvantageBannerC: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    (window as any).atOptions = {
      'key' : 'b4375cd4f584081c060c7e7916adcdfe',
      'format' : 'iframe',
      'height' : 300,
      'width' : 160,
      'params' : {}
    };

    const script = document.createElement("script");
    script.src = "https://www.highperformanceformat.com/b4375cd4f584081c060c7e7916adcdfe/invoke.js";
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="bg-slate-50 border border-[#CBD5E1]/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[350px] w-full text-center">
      <span className="text-[9px] font-mono font-black text-indigo-500 bg-indigo-100/70 px-2 py-0.5 rounded uppercase tracking-widest mb-3">
        Vertical Booster Station (160x300)
      </span>
      <div ref={containerRef} className="w-full flex justify-center overflow-x-auto" />
    </div>
  );
};

// Interactive 320x50 mobile landscape banner component
const AdsterraAdvantageBannerD: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    (window as any).atOptions = {
      'key' : '7088111d703b644e7de8f5ad237df166',
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };

    const script = document.createElement("script");
    script.src = "https://www.highperformanceformat.com/7088111d703b644e7de8f5ad237df166/invoke.js";
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="bg-slate-50 border border-[#CBD5E1]/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[110px] w-full text-center animate-bounce">
      <span className="text-[9px] font-mono font-black text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded uppercase tracking-widest mb-2">
        Mobile Adapter Station (320x50)
      </span>
      <div ref={containerRef} className="w-full flex justify-center overflow-x-auto" />
    </div>
  );
};

export const StudyAdvantage: React.FC<StudyAdvantageProps> = ({
  isOpen,
  onClose,
  userPoints,
  onUpdatePoints,
  userName
}) => {
  const [clickCount, setClickCount] = useState<number>(() => {
    const saved = localStorage.getItem(`study_adv_clicks_${userName}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [cooldown, setCooldown] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Background script loader
  useEffect(() => {
    if (!isOpen) return;

    const backgroundScripts = [
      "https://pl29660585.effectivecpmnetwork.com/42/85/ff/4285ff9aea78589126ca9578d8dd8654.js",
      "https://pl29660587.effectivecpmnetwork.com/58/5a/7e/585a7ec1cd7b434bcdfb8aa28f1dbddc.js"
    ];

    const mountedScripts: HTMLScriptElement[] = [];

    backgroundScripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
        mountedScripts.push(script);
      }
    });

    return () => {
      mountedScripts.forEach(script => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      });
    };
  }, [isOpen]);

  // Cooldown tracker
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleDeepEarningClick = async () => {
    if (cooldown > 0) return;

    // Direct link trigger
    window.open("https://www.effectivecpmnetwork.com/geiqexyer?key=e1f4a1e571d2f0b707e81f91f3903f70", "_blank");
    
    // Add points & update counters
    const reward = 150; // generous high points
    await onUpdatePoints(reward);
    const newCount = clickCount + 1;
    setClickCount(newCount);
    localStorage.setItem(`study_adv_clicks_${userName}`, newCount.toString());
    
    setCooldown(15); // 15-second grace period
    setSuccessMsg(`Abhijit, you earned +${reward} Points! Your click supported our educational platform servers.`);

    setTimeout(() => {
      setSuccessMsg(null);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full max-w-4xl max-h-[90vh] bg-white border border-[#CBD5E1]/30 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header branding */}
            <div className="relative px-6 py-5 border-b border-[#FAF3EB] bg-gradient-to-r from-orange-50/50 via-white to-amber-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EF6D2F]/10 flex items-center justify-center text-[#EF6D2F] shadow-inner">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none">
                    Study Advantage (স্টাডি অ্যাডভান্টেজ)
                  </h2>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
                    Direct Monetized Portal & Reward Stations
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full text-xs font-mono font-black flex items-center gap-1">
                  <Coins size={14} className="text-amber-500" />
                  <span>{userPoints} PTS</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-95 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Center */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
              {/* Introduction Card */}
              <div className="p-6 bg-[#FCFAF7] border border-[#FAF3EB] rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-[9px] font-black uppercase text-[#EF6D2F] tracking-widest bg-orange-100/60 px-2 py-0.5 rounded">
                    High Speed Servers Sponsor Program
                  </span>
                  <h3 className="text-base font-black text-slate-800 leading-tight">
                    Support Our Servers & Earn Double Points!
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
                    নিচের স্পন্সর লিংকে ক্লিক করে নতুন অ্যাড লোড করো। এর মাধ্যমে আমাদের এডুকেশনাল সার্ভার কন্টিনিউ রাখতে সাহায্য হবে এবং তোমার একাউন্টে সরাসরি হাই পয়েন্ট যোগ হবে!
                  </p>
                </div>

                <div className="bg-white border border-[#CBD5E1]/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 min-w-[120px]">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">SUPPORT COUNTER</span>
                  <span className="text-3xl font-black text-slate-800 mt-1">{clickCount}</span>
                  <span className="text-[9px] font-extrabold text-[#EF6D2F] uppercase tracking-widest mt-1">Sponsor Clicks</span>
                </div>
              </div>

              {/* Status Alert Area */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3"
                  >
                    <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
                    <span className="text-xs font-bold">{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid of Earning Generators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Earning Card A - Direct High CPA Boost */}
                <div className="p-6 border border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-white rounded-3xl flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Flame className="text-amber-500 fill-amber-500" size={18} />
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                        SUPER ADVANTAGE SPONSOR
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-800 leading-snug">
                      High CPM Earning Station (স্পন্সর ডিরেক্ট লিংক)
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Click this dynamic high-CPM sponsor portal. The webpage will load sponsor items, support our system runtime, and grant immediate huge points reward! Memory boost and math key activations require points.
                    </p>
                  </div>

                  <button
                    onClick={handleDeepEarningClick}
                    disabled={cooldown > 0}
                    className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-md ${
                      cooldown > 0 
                        ? "bg-slate-300 shadow-none cursor-not-allowed text-slate-500" 
                        : "bg-gradient-to-r from-[#EF6D2F] to-amber-500 hover:from-[#e05e20] hover:to-amber-600 cursor-pointer hover:shadow-lg active:scale-[0.98]"
                    }`}
                  >
                    {cooldown > 0 ? (
                      <span>Cooldown: {cooldown}s (Wait for active tracking)</span>
                    ) : (
                      <>
                        Load Direct Sponsored Link <ExternalLink size={14} />
                      </>
                    )}
                  </button>

                  <div className="flex justify-between text-[10px] font-bold text-slate-400 border-t border-[#FAF3EB] pt-3">
                    <span>Reward: +150 Points</span>
                    <span>Status: Highly Active</span>
                  </div>
                </div>

                {/* Earning Card B - Privilege explanation */}
                <div className="p-6 border border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-white rounded-3xl flex flex-col justify-between space-y-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="text-indigo-500" size={18} />
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        ACADEMIC ACCESS PRIVILEGES
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-800 leading-snug">
                      How to spend your points to boost success?
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      You can instantly unlock unique features:
                    </p>
                    <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 font-semibold">
                      <li><span className="font-extrabold text-[#EF6D2F]">Premium Pass</span> - Unlock Virtual Phone & 100% voice sync (costs 500 PTS).</li>
                      <li><span className="font-extrabold text-[#EF6D2F]">Extreme Practice Sets</span> - Unlock full-length solved exams PDFs on genetics and board prose.</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-extrabold text-indigo-500 bg-indigo-50/50 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={14} />
                      <span>Maximize your board score with Study Stranger.</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic Live Banner Display Area */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Tv size={16} className="text-[#EF6D2F]" />
                  <span className="text-[10px] font-black tracking-widest text-[#2E2520] uppercase">
                    LIVE ROTATING BANNER TERMINALS (বিজ্ঞাপন স্টেশন্স)
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  {/* Left Column: Horizontal / Native Banners */}
                  <div className="space-y-4">
                    <AdsterraAdvantageBannerA />
                    <AdsterraAdvantageBannerB />
                    <AdsterraAdvantageBannerD />
                  </div>

                  {/* Right Column: Tall Vertical Banner for massive engagement */}
                  <div className="h-full">
                    <AdsterraAdvantageBannerC />
                  </div>
                </div>
              </div>

              {/* Secure Notice */}
              <div className="p-4 bg-orange-50/50 border border-orange-200/50 rounded-2xl flex gap-3">
                <AlertCircle size={16} className="text-[#EF6D2F] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-[11px] font-black text-slate-700">Adsterra Integration Safety Note:</h5>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    বিজ্ঞাপনে কোনো সাইন-আপ করার প্রয়োজন নেই, শুধু বিজ্ঞাপন পেজটি ৫-১০ সেকেন্ড লোড করে ব্যাক করতে পারো। এতে সিস্টেম সিকিউর থাকে এবং আর্নিং জেনারেট হতে সাহায্য করে। ধন্যবাদ অভিজিৎ!
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#FAF3EB] bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] text-slate-400 font-medium">
              <span>Study Stranger Web Application Advantage Hub • Built for Class 12 Sem 3</span>
              <button 
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Return to Dashboard
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
