import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Globe, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  AlertTriangle,
  Server,
  Layers,
  HelpCircle
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface GoogleSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleSetupGuideModal({ isOpen, onClose }: GoogleSetupGuideModalProps) {
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedProjectId, setCopiedProjectId] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'firebase' | 'hosting'>('board');

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const projectId = firebaseConfig?.projectId || 'gen-lang-client-0804708254';

  const copyToClipboard = (text: string, type: 'domain' | 'project') => {
    navigator.clipboard.writeText(text);
    if (type === 'domain') {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } else {
      setCopiedProjectId(true);
      setTimeout(() => setCopiedProjectId(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white border-2 border-[#191919] rounded-[22px] sm:rounded-[26px] w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        style={{ boxShadow: '6px 6px 0px #191919' }}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#191919] bg-[#fef08a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#191919] p-1 flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-black text-[#191919] leading-tight">
                গুগল সাইন বোর্ড ও হোস্টিং সেটআপ গাইড
              </h2>
              <p className="text-[11px] text-[#716d66] font-medium leading-none mt-0.5">
                Google OAuth Consent Screen & Free Hosting Step-by-Step
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#e5e5e0] bg-[#fafaf7] px-3 pt-2 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('board')}
            className={`py-2 px-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'board'
                ? 'bg-white border-t-2 border-x-2 border-[#191919] text-[#191919] -mb-[1px]'
                : 'text-[#716d66] hover:text-[#191919]'
            }`}
          >
            📋 ১. সাইন বোর্ড (OAuth Consent)
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-2 px-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'firebase'
                ? 'bg-white border-t-2 border-x-2 border-[#191919] text-[#191919] -mb-[1px]'
                : 'text-[#716d66] hover:text-[#191919]'
            }`}
          >
            🔐 ২. Firebase Authorized Domains
          </button>
          <button
            onClick={() => setActiveTab('hosting')}
            className={`py-2 px-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'hosting'
                ? 'bg-white border-t-2 border-x-2 border-[#191919] text-[#191919] -mb-[1px]'
                : 'text-[#716d66] hover:text-[#191919]'
            }`}
          >
            🚀 ৩. ফ্রি ওয়েব হোস্টিং (Free Hosts)
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-[13px] text-[#333]">
          
          {/* TAB 1: OAuth Consent Screen (সাইন বোর্ড) */}
          {activeTab === 'board' && (
            <div className="space-y-4">
              <div className="bg-[#f0fdf4] border-[1.5px] border-[#22c55e] p-3 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-[#166534] mb-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>"গুগল সাইন বোর্ড" আসলে কী?</span>
                </div>
                <p className="text-[12px] text-[#14532d] leading-relaxed">
                  গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করার সময় ব্যবহারকারী যে স্ক্রিন বা ডায়ালগ দেখতে পায় যেখানে অ্যাপের নাম, লোগো এবং অনুমতির তথ্য থাকে—সেটিকে টেকনিক্যাল ভাষায় বলা হয় <b>"OAuth Consent Screen"</b> (বা গুগল সাইন বোর্ড)।
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-[#191919] flex items-center gap-1.5 text-sm">
                  <span>🛠️</span>
                  <span>Google Cloud Console-এ সাইন বোর্ড তৈরির ধাপ:</span>
                </h4>

                <div className="p-3 bg-[#fafaf7] rounded-xl border border-neutral-200 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#191919] text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">১</span>
                    <div>
                      <p className="font-bold text-[#191919]">Google Cloud Console-এ যান:</p>
                      <a 
                        href="https://console.cloud.google.com/apis/credentials/consent" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold mt-0.5"
                      >
                        console.cloud.google.com/apis/credentials/consent
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#191919] text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">২</span>
                    <div>
                      <p className="font-bold text-[#191919]">User Type নির্বাচন করুন:</p>
                      <p className="text-[#666] text-xs"><b>"External"</b> রেডিও বাটন সিলেক্ট করে <b>Create</b> বাটনে ক্লিক করুন।</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#191919] text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">৩</span>
                    <div>
                      <p className="font-bold text-[#191919]">অ্যাপের তথ্য (App Information) পূরণ করুন:</p>
                      <ul className="list-disc list-inside text-[#555] text-xs mt-1 space-y-0.5">
                        <li><b>App Name:</b> Study Stranger</li>
                        <li><b>User support email:</b> আপনার জিমেইল সিলেক্ট করুন (যেমন: jnictabhi9632@gmail.com)</li>
                        <li><b>Developer contact information:</b> আপনার জিমেইল লিখুন</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#191919] text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">৪</span>
                    <div>
                      <p className="font-bold text-[#191919]">Scopes ও Test Users:</p>
                      <p className="text-[#666] text-xs">Scopes অংশে ডিফল্ট <code>email, profile, openid</code> রেখে <b>Save and Continue</b> করে শেষ করুন। টেস্ট ইউজার হিসেবে আপনার নিজের জিমেইল অ্যাড করে রাখুন।</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Firebase Authorized Domains */}
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="bg-[#fffbeb] border-[1.5px] border-[#f59e0b] p-3 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-[#b45309] mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>কেন Google লগইনে "auth/unauthorized-domain" সমস্যা হয়?</span>
                </div>
                <p className="text-[12px] text-[#92400e] leading-relaxed">
                  Firebase সুরক্ষার জন্য শুধুমাত্র অনুমোদিত (Authorized) ডোমেইনেই Google Sign-In পপআপ কাজ করতে দেয়। নতুন ফ্রি হোস্টিংয়ে ডেপ্লয় করলে সেই ডোমেইনটি Firebase-এ যোগ করতে হয়।
                </p>
              </div>

              {/* Quick Copy Info Card */}
              <div className="p-3 bg-neutral-50 rounded-xl border-2 border-[#191919] space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#716d66] uppercase tracking-wider mb-1">
                    বর্তমান ডোমেইন (Current Domain - এটি Firebase এ যোগ করতে হবে):
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      readOnly 
                      value={currentDomain} 
                      className="flex-1 bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#191919] select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentDomain, 'domain')}
                      className="btn btn-dark btn-sm flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg cursor-pointer"
                    >
                      {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDomain ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#716d66] uppercase tracking-wider mb-1">
                    Firebase Project ID:
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      readOnly 
                      value={projectId} 
                      className="flex-1 bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#191919] select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(projectId, 'project')}
                      className="btn btn-ghost btn-sm flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg border border-neutral-300 cursor-pointer"
                    >
                      {copiedProjectId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedProjectId ? 'কপি হয়েছে!' : 'কপি'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step by step to add domain */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-[#191919]">ডোমেইন যোগ করার ৩টি সহজ ক্লিক:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-[#444] pl-1">
                  <li>
                    Firebase Console-এ যান: <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">console.firebase.google.com</a>
                  </li>
                  <li>
                    আপনার প্রোজেক্ট ওপেন করে বামের মেনু থেকে <b>Authentication</b> &gt; <b>Settings</b> ট্যাবে ক্লিক করুন।
                  </li>
                  <li>
                    <b>"Authorized domains"</b> সেকশনে <b>"Add domain"</b> বাটনে ক্লিক করে উপরের কপি করা ডোমেইন পেস্ট করে সেভ করুন। ব্যস, সাথে সাথে গুগল লগইন চালু হয়ে যাবে!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Free Web Hosting Solutions */}
          {activeTab === 'hosting' && (
            <div className="space-y-3.5">
              <p className="text-xs text-[#555]">
                গুগল লগইন এবং সব ফিচার সম্পূর্ণ ফ্রি হোস্টিং করার জন্য সেরা ৩টি প্ল্যাটফর্ম:
              </p>

              {/* 1. Firebase Hosting */}
              <div className="p-3 bg-white rounded-xl border-2 border-[#191919] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-[#191919]">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>১. Firebase Hosting (সবচেয়ে সহজ ও সেরা)</span>
                  </div>
                  <span className="badge-pill text-[10px] bg-amber-100 text-amber-800 font-bold">100% Free</span>
                </div>
                <p className="text-xs text-[#555]">
                  যেহেতু আপনি ইতিমধ্যেই Firebase ব্যবহার করছেন, Firebase Hosting এ গুগল লগইন কোনো ঝামেলা ছাড়াই সরাসরি কাজ করে (ডোমেন অটোমেটিক অথোরাইজড হয়ে যায়)।
                </p>
                <div className="bg-[#191919] text-[#e0e0e0] p-2 rounded-lg font-mono text-[11px]">
                  <code>npm run build && npx firebase-tools deploy --only hosting</code>
                </div>
              </div>

              {/* 2. Vercel */}
              <div className="p-3 bg-white rounded-xl border-2 border-[#191919] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-[#191919]">
                    <span className="w-2.5 h-2.5 rounded-full bg-black" />
                    <span>২. Vercel (দ্রুততম ও ফ্রি গিটহাব ডেপ্লয়)</span>
                  </div>
                  <span className="badge-pill text-[10px] bg-neutral-100 text-neutral-800 font-bold">Instant Deploy</span>
                </div>
                <p className="text-xs text-[#555]">
                  GitHub রিপোজিটরি <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">vercel.com</a>-এ কানেক্ট করলেই ১ ক্লিকে ফ্রি ওয়েবসাইট তৈরি হয়ে যায় (যেমন: <code>study-stranger.vercel.app</code>)।
                </p>
                <p className="text-[11px] text-[#716d66]">
                  টিপ: ডেপ্লয় হওয়ার পর Vercel-এর দেওয়া লিঙ্কটি Firebase Authorized Domains-এ অ্যাড করে নিলেই গুগল লগইন সক্রিয় হয়ে যায়।
                </p>
              </div>

              {/* 3. Render / Netlify */}
              <div className="p-3 bg-white rounded-xl border-2 border-[#191919] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-[#191919]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>৩. Netlify / Render</span>
                  </div>
                  <span className="badge-pill text-[10px] bg-emerald-100 text-emerald-800 font-bold">Free Tier</span>
                </div>
                <p className="text-xs text-[#555]">
                  Netlify বা Render-এ ড্র্যাগ-অ্যান্ড-ড্রপ করে বিল্ড ফোল্ডার আপলোড করলেই ফুললি রেসপন্সিভ সাইট লাইভ হয়ে যায়।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t-2 border-[#191919] bg-[#fafaf7] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-[#716d66] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>লগইন পেজে সরাসরি "⚡ ১-ট্যাপ প্রবেশ" অপশন দিয়ে যেকোনো ডিভাইসে লগইন করা যাবে!</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-dark text-xs py-2 px-4 rounded-xl font-bold cursor-pointer ml-auto"
          >
            বুঝেছি, বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
