import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  FileCheck, 
  CheckCircle2, 
  HelpCircle, 
  Globe, 
  BookOpen, 
  UserCheck, 
  Server,
  Mail
} from 'lucide-react';

export default function PrivacyPolicy() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  return (
    <div className="pro-app-root min-h-screen bg-[#f7f6ef] text-[#191919] font-sans">
      {/* Top Header */}
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="btn btn-ghost btn-sm text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>{lang === 'bn' ? 'লগইন পেজে ফিরুন' : 'Back to Login'}</span>
            </Link>
            <Link to="/" className="brand">
              <div className="w-8 h-8 rounded-xl bg-white border-[1.5px] border-[#18181b] p-0.5 shadow-xs flex items-center justify-center shrink-0">
                <img src="/logo.svg" alt="Study Stranger" className="w-full h-full object-contain" />
              </div>
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#18181b] hidden sm:inline">Study Stranger</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-pill hidden sm:inline-flex" style={{ background: 'var(--yellow)', fontSize: 11 }}>
              WBCHSE Class 12
            </span>
            <button
              type="button"
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="btn btn-ghost btn-sm text-xs cursor-pointer font-bold"
              style={{ background: '#fff' }}
            >
              <Globe className="w-3.5 h-3.5 mr-1" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold mb-4 border border-orange-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>WBCHSE Class 12 Sem 3 · Data Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 font-sans">
            {lang === 'bn' 
              ? 'গোপনীয়তা নীতি ও শিক্ষার্থী সুরক্ষা নির্দেশিকা' 
              : 'Privacy Policy & Student Safety Guidelines'}
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {lang === 'bn'
              ? 'Study Stranger-এ শিক্ষার্থীদের ব্যক্তিগত গোপনীয়তা ও পড়াশোনার তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিত করা আমাদের প্রথম অঙ্গীকার।'
              : 'At Study Stranger, safeguarding student privacy and securing exam preparation records is our foundational principle.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <span>সর্বশেষ আপডেট: অক্টোবর ২০২৬</span>
            <span>·</span>
            <span>সংস্করণ: Pro v3.2</span>
            <span>·</span>
            <span>অধিক্ষেত্র: পশ্চিমবঙ্গ উচ্চমাধ্যমিক শিক্ষা সংসদ (WBCHSE)</span>
          </div>
        </div>

        {/* Content Cards */}
        <div className="space-y-8">
          {/* Card 1: Core Principles */}
          <section 
            className="p-6 sm:p-8 rounded-[24px] bg-white border-2 border-[#191919]"
            style={{ boxShadow: '4px 4px 0px #191919' }}
          >
            <h2 className="text-xl font-serif font-bold text-[#191919] flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white border-[1.5px] border-[#191919] text-[#191919] flex items-center justify-center shadow-xs">
                <FileCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <span>{lang === 'bn' ? '১. মূল নীতিমালা ও আমাদের অঙ্গীকার' : '1. Core Principles & Student Commitment'}</span>
            </h2>
            <div className="text-sm text-[#30302f] space-y-3 leading-relaxed">
              <p>
                {lang === 'bn' ? (
                  <>
                    Study Stranger Pro মূলত পশ্চিমবঙ্গ উচ্চমাধ্যমিক শিক্ষা সংসদের (WBCHSE) দ্বাদশ শ্রেণির তৃতীয় সেমিস্টার (Semester 3)-এর <strong>Biology (জীববিদ্যা)</strong>, <strong>Bengali A (বাংলা এ)</strong>, এবং <strong>English B</strong> শিক্ষার্থীদের সহায়তার জন্য নির্মিত হয়েছে।
                  </>
                ) : (
                  <>
                    Study Stranger Pro is purpose-built to assist WBCHSE Class 12 Semester 3 students preparing for <strong>Biology</strong>, <strong>Bengali A</strong>, and <strong>English B</strong> MCQ examinations.
                  </>
                )}
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#f7f6ef] border-[1.5px] border-[#191919] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold">
                    {lang === 'bn' ? 'কোনো বিজ্ঞাপন বা বাণিজ্যিক ট্র্যাকার নেই' : '100% Ad-Free with zero behavioral tracking'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f7f6ef] border-[1.5px] border-[#191919] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold">
                    {lang === 'bn' ? 'জিমেইল ছাড়াও নতুন একাউন্ট খোলার পূর্ণ সুবিধা' : 'Direct student registration without requiring Gmail'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f7f6ef] border-[1.5px] border-[#191919] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold">
                    {lang === 'bn' ? 'Google OAuth দিয়ে দ্রুত ও সুরক্ষিত লগইন' : 'Official Google Sign-In with verified domain tags'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f7f6ef] border-[1.5px] border-[#191919] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold">
                    {lang === 'bn' ? 'মক টেস্ট ফলাফল ও স্ট্রিক ক্লাউড ব্যাকআপ' : 'Continuous encrypted cloud backup of test marks'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: What We Collect */}
          <section 
            className="p-6 sm:p-8 rounded-[24px] bg-white border-2 border-[#191919]"
            style={{ boxShadow: '4px 4px 0px #191919' }}
          >
            <h2 className="text-xl font-serif font-bold text-[#191919] flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white border-[1.5px] border-[#191919] text-[#191919] flex items-center justify-center shadow-xs">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <span>{lang === 'bn' ? '২. কোন কোন তথ্য সংরক্ষিত হয়?' : '2. Information We Collect'}</span>
            </h2>
            <div className="text-sm text-[#30302f] space-y-4 leading-relaxed">
              <div>
                <h4 className="font-bold text-[#191919] text-sm mb-1">
                  {lang === 'bn' ? 'ক. প্রোফাইল ও একাউন্ট তথ্য:' : 'A. Student Profile & Account Details:'}
                </h4>
                <p className="text-xs">
                  {lang === 'bn' 
                    ? 'আপনার পছন্দের নাম (Full Name), ইউজারনেম (Username), পাসওয়ার্ড এবং বোর্ড (WBCHSE Class 12 Sem 3)। আপনার পাসওয়ার্ড সম্পূর্ণ সুরক্ষিত রাখা হয়।'
                    : 'Your chosen name, username, password hash, and board metadata. Direct passwords are never stored in plain text.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#191919] text-sm mb-1">
                  {lang === 'bn' ? 'খ. মক টেস্ট ও সিলেবাস প্রগ্রেস:' : 'B. Mock Tests & Exam Performance:'}
                </h4>
                <p className="text-xs">
                  {lang === 'bn'
                    ? 'Biology (Reproduction, Genetics & Evolution), Bengali A (আদিরিনী, বাঙ্গালা ভাষা, কবিতা ও ব্যাকরণ), English B (The Night Train at Deoli, Strong Roots, The Bet, Ulysses)-এর প্রতিটি মক টেস্টে প্রাপ্ত স্কোর ও সময়।'
                    : 'Subject scores, question attempts, revision speed, and time spent on Sem 3 chapters across Biology, Bengali A, and English B.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#191919] text-sm mb-1">
                  {lang === 'bn' ? 'গ. আমরা যা কখনই সংগ্রহ করি না:' : 'C. Information We NEVER Collect:'}
                </h4>
                <p className="text-xs text-rose-600 font-semibold">
                  {lang === 'bn'
                    ? 'আমরা কোনো ব্যাংক বিবরণী, আধার বা ভোটার কার্ড, মোবাইল কন্ট্যাক্টস, অথবা ব্যক্তিগত চ্যাট হিস্ট্রি সংগ্রহ করি না।'
                    : 'We never collect payment cards, Aadhaar numbers, private address books, or external browser histories.'}
                </p>
              </div>
            </div>
          </section>

          {/* Card 3: Google Login & Authentication */}
          <section 
            className="p-6 sm:p-8 rounded-[24px] bg-white border-2 border-[#191919]"
            style={{ boxShadow: '4px 4px 0px #191919' }}
          >
            <h2 className="text-xl font-serif font-bold text-[#191919] flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white border-[1.5px] border-[#191919] text-[#191919] flex items-center justify-center shadow-xs">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <span>{lang === 'bn' ? '৩. Google সাইন-ইন ও ডোমেইন পলিসি' : '3. Google Sign-In & Domain Identity'}</span>
            </h2>
            <div className="text-sm text-[#30302f] space-y-3 leading-relaxed">
              <p>
                {lang === 'bn' ? (
                  <>
                    যখন আপনি <strong>"Continue with Google"</strong> নির্বাচন করবেন, Google Authentication API নিরাপদে আপনার পরিচয় যাচাই করবে। সাইন-ইন ইন্টারফেসে <strong>Study Stranger</strong> প্ল্যাটফর্ম নিরাপদ অ্যাক্সেস প্রদান করে।
                  </>
                ) : (
                  <>
                    When opting to authenticate with Google, standard OAuth tokens ensure secure access under the application title <strong>Study Stranger</strong>. We never get access to your master Google account password.
                  </>
                )}
              </p>
            </div>
          </section>

          {/* Card 4: Security & Storage */}
          <section 
            className="p-6 sm:p-8 rounded-[24px] bg-white border-2 border-[#191919]"
            style={{ boxShadow: '4px 4px 0px #191919' }}
          >
            <h2 className="text-xl font-serif font-bold text-[#191919] flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white border-[1.5px] border-[#191919] text-[#191919] flex items-center justify-center shadow-xs">
                <Server className="w-5 h-5 text-purple-600" />
              </div>
              <span>{lang === 'bn' ? '৪. ক্লাউড ডেটাবেস ও নিরাপত্তা প্রযুক্তি' : '4. Cloud Storage & Security Architecture'}</span>
            </h2>
            <div className="text-sm text-[#30302f] space-y-2 leading-relaxed text-xs">
              <p>
                {lang === 'bn'
                  ? 'Study Stranger ব্যাকএন্ডে ফায়ারস্টোর ক্লাউড সিকিউরিটি রুলস (Firestore Security Rules) ব্যবহার করে যাতে কোনো শিক্ষার্থী অন্য কারও পরীক্ষার নম্বর বা প্রোফাইল পরিবর্তন করতে না পারে।'
                  : 'Backend persistence utilizes Firebase Firestore access policies preventing unauthorized reads, score modifications, or impersonation.'}
              </p>
              <p>
                {lang === 'bn'
                  ? 'ইন্টারনেট সংযোগ সাময়িক বন্ধ থাকলেও ব্রাউজার স্টোরেজের মাধ্যমে স্টাডি স্ট্রিক ও অফলাইন নোটস সংরক্ষিত থাকে।'
                  : 'Offline caches ensure revision notes and session records remain active even in low-connectivity exam prep areas.'}
              </p>
            </div>
          </section>

          {/* Card 5: Contact & Inquiries */}
          <section 
            className="p-6 sm:p-8 rounded-[24px] bg-[#fdfdfb] border-2 border-[#191919]"
            style={{ boxShadow: '4px 4px 0px #191919' }}
          >
            <h2 className="text-xl font-serif font-bold text-[#191919] flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-[#191919]" />
              <span>{lang === 'bn' ? '৫. শিক্ষার্থী সহায়তা ও যোগাযোগ' : '5. Student Support & Inquiries'}</span>
            </h2>
            <p className="text-xs text-[#716d66] mb-4">
              {lang === 'bn'
                ? 'আপনার অ্যাকাউন্ট মুছে ফেলতে চাইলে বা গোপনীয়তা সম্পর্কিত কোনো প্রশ্ন থাকলে আমাদের সাথে নির্দ্বিধায় যোগাযোগ করুন:'
                : 'For data deletion requests, password resets, or questions regarding our academic policies, reach out to:'}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-[1.5px] border-[#191919] text-xs font-mono font-semibold text-[#191919] shadow-xs">
              <Mail className="w-4 h-4 text-[#191919]" />
              <span>support@studystranger.app</span>
            </div>
          </section>
        </div>

        {/* Bottom CTA to Login */}
        <div className="mt-12 text-center">
          <Link
            to="/login"
            className="btn btn-dark py-3.5 px-8 rounded-full font-bold text-sm shadow-[3px_3px_0px_#191919] cursor-pointer"
          >
            <span>{lang === 'bn' ? 'লগইন পেজে যান ও পড়া শুরু করুন' : 'Go to Login & Start Studying'}</span>
            <ArrowLeft className="w-4 h-4 rotate-180 ml-2" />
          </Link>
        </div>
      </main>
    </div>
  );
}
