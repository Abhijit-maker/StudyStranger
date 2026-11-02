import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, Eye, FileText, ExternalLink, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[20px] sm:rounded-[24px] bg-white border-2 border-[#191919] overflow-hidden"
        style={{ boxShadow: '4px 4px 0px #191919' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-[#191919] bg-[#f7f6ef]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border-[1.5px] border-[#191919] text-[#191919] flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-serif font-bold text-[#191919] tracking-tight truncate">
                  {lang === 'bn' ? 'গোপনীয়তা নীতি ও সুরক্ষাবিধি' : 'Privacy & Safety Policy'}
                </h3>
                <span className="badge-pill hidden xs:inline-flex" style={{ background: 'var(--yellow)', fontSize: 9, padding: '2px 6px' }}>
                  Study Stranger
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#716d66] truncate">
                {lang === 'bn' ? 'WBCHSE শিক্ষার্থীদের ডেটা নিরাপত্তা' : 'Student Data Protection'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg sm:rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors border border-zinc-300"
              title="Toggle Bengali / English"
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-[11px] sm:text-xs">{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg sm:rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors border border-zinc-300 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
          {lang === 'bn' ? (
            <>
              <div className="p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/40 text-xs text-orange-900 dark:text-orange-200 flex items-start gap-2.5">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" />
                <p>
                  <strong>Study Stranger</strong> পশ্চিমবঙ্গের উচ্চমাধ্যমিক (WBCHSE Class 12 Sem 3) শিক্ষার্থীদের পড়াশোনা এবং মক টেস্ট অনুশীলনের একটি নির্ভরযোগ্য প্ল্যাটফর্ম। আমরা কোনো বিজ্ঞাপন দেখাই না বা শিক্ষার্থীদের ব্যক্তিগত ডেটা তৃতীয় পক্ষের সাথে শেয়ার করি না।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-sm mb-1.5">
                  <Eye className="w-4 h-4 text-orange-500" /> ১. আমরা কী তথ্য সংগ্রহ করি?
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                  <li><strong>শিক্ষার্থীর পরিচয়:</strong> আপনার নাম, ইউজারনেম এবং পাসওয়ার্ড (এনক্রিপ্ট করা)।</li>
                  <li><strong>Google Sign-In:</strong> আপনি যদি Google দিয়ে লগইন করেন, তবে কেবল নাম, ইমেইল এবং প্রোফাইল ফটো যাচাইয়ের জন্য ব্যবহৃত হয়।</li>
                  <li><strong>পড়াশোনা ও মক টেস্ট রেকর্ড:</strong> Biology, Bengali A এবং English B বিষয়ের টেস্ট স্কোর, উত্তর বিশ্লেষণ ও স্টাডি স্ট্রিক।</li>
                  <li>আমরা কোনো প্রকার ফোন নম্বর বা অপ্রয়োজনীয় আর্থিক তথ্য চাই না।</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-sm mb-1.5">
                  <Lock className="w-4 h-4 text-emerald-500" /> ২. তথ্য কীভাবে সুরক্ষিত থাকে?
                </h4>
                <p className="text-xs">
                  আপনার সম্পূর্ণ অ্যাকাউন্টের তথ্য ক্লাউড ফায়ারস্টোর (Firestore Enterprise Security Rules) ও ব্রাউজারের সিকিউর সেশনের মাধ্যমে নিরাপদে সংরক্ষিত থাকে। মক টেস্ট বা পরীক্ষার ডেটা স্বয়ংক্রিয়ভাবে ব্যাকআপ নেওয়া হয় যাতে ডিভাইস পরিবর্তন করলেও প্রস্তুতি হারিয়ে না যায়।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-sm mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" /> ৩. বিজ্ঞাপন ও বাণিজ্যিক গোপনীয়তা
                </h4>
                <p className="text-xs">
                  আমাদের অ্যাপটি ১০০% বিজ্ঞাপনমুক্ত। আপনার মক টেস্টের ফলাফল বা ব্যক্তিগত অধ্যয়নের অভ্যাস কোনো বিজ্ঞাপন কোম্পানিকে সরবরাহ করা হয় না।
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/40 text-xs text-orange-900 dark:text-orange-200 flex items-start gap-2.5">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" />
                <p>
                  <strong>Study Stranger</strong> is an ad-free educational studio for WBCHSE Class 12 (Semester 3) students. We prioritize academic integrity, encrypted data protection, and transparent student privacy.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-sm mb-1.5">
                  <Eye className="w-4 h-4 text-orange-500" /> 1. Information Collected
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                  <li><strong>Account Credentials:</strong> Full Name, custom Username, and encrypted passwords. No Gmail account required for direct registration.</li>
                  <li><strong>Google Authentication:</strong> When choosing Google login, authentication is managed securely with OAuth tokens; we do not store your private Google password.</li>
                  <li><strong>Academic Records:</strong> Mock test submissions, answer choices, revision flashcards, and syllabus milestones in Biology, Bengali A, and English B.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-sm mb-1.5">
                  <Lock className="w-4 h-4 text-emerald-500" /> 2. Data Protection & Encryption
                </h4>
                <p className="text-xs">
                  Academic records and session state are secured via Firebase Firestore rule authorization and browser session storage. Only authorized requests can read or update your study milestones.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-sm mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" /> 3. Zero Ad-Tracking Commitment
                </h4>
                <p className="text-xs">
                  We do not sell student profile details, study hours, or test scores to third-party ad networks or data brokers.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t-2 border-[#191919] bg-[#f7f6ef]">
          <Link
            to="/privacy"
            onClick={onClose}
            className="text-xs font-bold text-[#191919] underline hover:text-black flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সম্পূর্ণ গোপনীয়তা নীতি পেজ দেখুন' : 'View Full Privacy Policy Page'}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto btn btn-dark btn-sm rounded-full font-bold shadow-xs cursor-pointer"
          >
            {lang === 'bn' ? 'বুঝেছি (Got it)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
