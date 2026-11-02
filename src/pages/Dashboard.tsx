import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Eye,
  FolderOpen,
  Sparkles,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { USER } from '../data.js'
import { COMMUNITY_LINKS } from '../data/communityLinks'
import { StudyStreakTracker } from '../components/StudyStreakTracker'
import { DocumentPreviewModal } from '../components/DocumentPreviewModal'
import {
  StoredPDFRecord,
  subscribeToSharedDocuments,
  savePdfToIndexedDB,
  getPdfFromIndexedDB,
  isDummySeed,
  deletePdfFromIndexedDB,
} from '../services/pdfStorageService'

interface BulletinItem {
  id: string
  tag1: string
  tag2: string
  title: string
  subtitle: string
  actionLabel: string
  actionPath?: string
  pdfDoc?: StoredPDFRecord
}

const DEFAULT_BULLETINS: BulletinItem[] = [
  {
    id: 'b-bio-1',
    tag1: 'HIGH YIELD',
    tag2: 'Study Material',
    title: '🧬 জীববিদ্যা (Biology) Unit I & II উচ্চমাধ্যমিক গুরুত্বপূর্ণ স্টাডি হ্যান্ডবুক',
    subtitle:
      'সপুষ্পক উদ্ভিদের যৌন জনন, ZP3 রিসেপ্টর ও মেন্ডেলের সূত্রের এক্সক্লুসিভ নোটস প্রকাশিত হয়েছে।',
    actionLabel: '📖 VIEW BOARD →',
    actionPath: '/app/notices',
  },
  {
    id: 'b-ben-2',
    tag1: 'WBCHSE SEM 4',
    tag2: 'Bengali & English',
    title: '📚 আদিরিনী, বিবেকানন্দের প্রবন্ধ ও The Bet — সম্পূর্ণ প্রশ্নোত্তর ও সাজেশন',
    subtitle:
      'উচ্চমাধ্যমিক পরীক্ষার জন্য অধ্যায়ভিত্তিক সংক্ষিপ্ত ও রচনাধর্মী প্রশ্নের পিডিএফ ও মক টেস্ট প্রস্তুত।',
    actionLabel: '📖 VIEW BOARD →',
    actionPath: '/app/predictor',
  },
  {
    id: 'b-pdf-3',
    tag1: 'LIVE SYNC',
    tag2: 'PDF Library',
    title: '📄 কমন পিডিএফ লাইব্রেরি — যেকোনো পিডিএফ আপলোড করলেই সবার অ্যাকাউন্টে সাথে সাথে যুক্ত হবে',
    subtitle:
      'নতুন বা পুরনো সকল স্টুডেন্ট অ্যাকাউন্টে রিয়েল-টাইম সিঙ্ক ও ইন-পেজ জুম/রোটেশন পিডিএফ ভিউয়ার সক্রিয়।',
    actionLabel: '📖 OPEN PDFS →',
    actionPath: '/app/notes',
  },
]

export default function Dashboard() {
  const nav = useNavigate()
  const userName =
    localStorage.getItem('currentUserName') ||
    localStorage.getItem('currentUserDisplayName') ||
    USER.name ||
    'Abhiyaan963'

  const [bulletinIndex, setBulletinIndex] = useState(0)
  const [sharedPdfs, setSharedPdfs] = useState<StoredPDFRecord[]>([])
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null)
  const [loadingPdfId, setLoadingPdfId] = useState<string | null>(null)
  const [isUploadingQuickPdf, setIsUploadingQuickPdf] = useState(false)
  const [quickUploadProgress, setQuickUploadProgress] = useState(0)
  const [quickUploadSuccess, setQuickUploadSuccess] = useState('')
  const quickFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unsubscribe = subscribeToSharedDocuments((docs) => {
      docs.forEach((d) => {
        if (isDummySeed(d)) {
          deletePdfFromIndexedDB(d.id).catch(() => {});
        }
      });
      setSharedPdfs(docs.filter((d) => !isDummySeed(d)))
    })
    return () => unsubscribe()
  }, [])

  const bulletins: BulletinItem[] = React.useMemo(() => {
    const dynamicFromPdfs: BulletinItem[] = sharedPdfs.slice(0, 3).map((docItem) => ({
      id: `pdf-bulletin-${docItem.id}`,
      tag1: 'NEW PDF',
      tag2: docItem.subjectTag || 'Shared Study PDF',
      title: `📄 ${docItem.name}`,
      subtitle: `${docItem.uploaderName || 'Admin'} দ্বারা আপলোডকৃত (${docItem.sizeFormatted}) — সকল স্টুডেন্ট অ্যাকাউন্টে সিঙ্কড।`,
      actionLabel: '📖 OPEN PDF →',
      pdfDoc: docItem,
    }))
    return [...DEFAULT_BULLETINS, ...dynamicFromPdfs]
  }, [sharedPdfs])

  const activeBulletin = bulletins[bulletinIndex % bulletins.length] || DEFAULT_BULLETINS[0]

  const handleOpenSharedPdf = async (docItem: StoredPDFRecord) => {
    setLoadingPdfId(docItem.id)
    try {
      const full = await getPdfFromIndexedDB(docItem.id)
      const dataUrl =
        full?.blobUrl ||
        full?.dataUrl ||
        docItem.blobUrl ||
        docItem.dataUrl ||
        docItem.streamUrl ||
        `/api/shared-documents/${encodeURIComponent(docItem.id)}/stream`
      setPreviewDoc({
        url: dataUrl,
        name: docItem.name,
      })
    } catch {
      setPreviewDoc({
        url:
          docItem.blobUrl ||
          docItem.dataUrl ||
          docItem.streamUrl ||
          `/api/shared-documents/${encodeURIComponent(docItem.id)}/stream`,
        name: docItem.name,
      })
    } finally {
      setLoadingPdfId(null)
    }
  }

  const handleQuickPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setIsUploadingQuickPdf(true)
    setQuickUploadProgress(10)
    setQuickUploadSuccess('')

    try {
      await savePdfToIndexedDB(
        file,
        undefined,
        (pct: number) => setQuickUploadProgress(pct),
        'folder_mock_vault',
        'admin',
        'WBCHSE Sem 4'
      )
      setQuickUploadSuccess(
        `✅ "${file.name}" সফলভাবে আপলোড হয়েছে এবং সকল ইউজারের অ্যাকাউন্টে সিঙ্ক হয়ে গেছে!`
      )
      setTimeout(() => setQuickUploadSuccess(''), 6000)
    } catch {
      // handled gracefully
    } finally {
      setIsUploadingQuickPdf(false)
      setQuickUploadProgress(0)
    }
  }

  const filterPills = [
    { label: '★ All (সব অপশন)', active: true, path: '/app' },
    { label: '📐 Math Lab (LaTeX Solver)', active: false, path: '/app/formulas' },
    { label: '📄 PDF Library & Viewer', active: false, path: '/app/notes' },
    { label: '🎯 Mock Test AI', active: false, path: '/app/mock' },
    { label: '🔬 3D Science Lab', active: false, path: '/app/3d-lab' },
    { label: '⚡ Speed Blitz', active: false, path: '/app/blitz' },
    { label: '🎙️ Voice AI', active: false, path: '/app/voice' },
  ]

  const masterclassActions = [
    {
      label: '📐 Math Lab (LaTeX)',
      path: '/app/formulas',
      className: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] hover:bg-[#DBEAFE] font-black',
    },
    {
      label: '🛡️ AI Autopsy',
      path: '/app/autopsy',
      className: 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3] hover:bg-[#FFE4E6]',
    },
    {
      label: '🎙️ Voice Quiz',
      path: '/app/voice-mcq',
      className: 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF] hover:bg-[#E9D5FF]/70',
    },
    {
      label: '⚔️ 1v1 Duel Arena',
      path: '/app/battle',
      className: 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA] hover:bg-[#FFEDD5]',
    },
    {
      label: '⚡ AI Doubt Solver',
      path: '/app/doubt',
      className: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] hover:bg-[#D1FAE5]',
    },
    {
      label: '📚 Exclusive PDFs',
      path: '/app/notes',
      className: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] hover:bg-[#FDE68A]/80',
    },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-10">
      {/* Hidden Quick PDF Input so users can upload directly from Home or PDF Library */}
      <input
        ref={quickFileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleQuickPdfUpload}
        className="hidden"
      />

      {/* 1. OFFICIAL BULLETIN CARD (Matches Top of Screenshot) */}
      <div className="bg-white rounded-[26px] border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white flex items-center justify-center text-lg shrink-0 shadow-xs mt-0.5">
            📢
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#EA580C]">
                OFFICIAL BULLETIN
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-black uppercase">
                {activeBulletin.tag1}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold">
                {activeBulletin.tag2}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug break-words">
              {activeBulletin.title}
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
              {activeBulletin.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              setBulletinIndex((prev) => (prev - 1 + bulletins.length) % bulletins.length)
            }
            className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Previous bulletin"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => setBulletinIndex((prev) => (prev + 1) % bulletins.length)}
            className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Next bulletin"
          >
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeBulletin.pdfDoc) {
                handleOpenSharedPdf(activeBulletin.pdfDoc)
              } else if (activeBulletin.actionPath) {
                nav(activeBulletin.actionPath)
              }
            }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white text-xs font-black tracking-wide shadow-xs cursor-pointer transition-all whitespace-nowrap"
          >
            {activeBulletin.actionLabel}
          </button>
        </div>
      </div>

      {/* Official Community Hub Banner (WhatsApp & Telegram) */}
      <div className="bg-gradient-to-r from-[#FEF9C3] via-[#FEF08A] to-[#DCFCE7] rounded-[24px] border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div className="w-11 h-11 rounded-2xl bg-[#18181b] text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
            💬
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#18181b] text-white">
                Official Study Circles
              </span>
              <span className="text-xs font-bold text-slate-700">WBCHSE Class 12</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
              হোয়াটসঅ্যাপ গ্রুপ ও টেলিগ্রাম চ্যানেলে যুক্ত হও
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              সবার আগে অধ্যায়ভিত্তিক নোটস, পিডিএফ মেটেরিয়াল ও পরীক্ষার টেস্ট আপডেট পেতে সরাসরি যুক্ত থাকো।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
          <a
            href={COMMUNITY_LINKS.whatsappGroup}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black border border-[#18181b] shadow-[2px_2px_0px_#18181b] hover:translate-y-[-1px] transition-all no-underline inline-flex items-center gap-1.5"
          >
            <span>💬 WhatsApp Group</span>
            <ExternalLink size={12} />
          </a>

          <a
            href={COMMUNITY_LINKS.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-black border border-[#18181b] shadow-[2px_2px_0px_#18181b] hover:translate-y-[-1px] transition-all no-underline inline-flex items-center gap-1.5"
          >
            <span>✈️ Telegram Channel</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* 2. HORIZONTAL CATEGORY PILL BAR (Matches Screenshot) */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
        {filterPills.map((pill) => (
          <button
            key={pill.label}
            type="button"
            onClick={() => {
              if (pill.path !== '/app') nav(pill.path)
            }}
            className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
              pill.active
                ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white border-[#EA580C] shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 3. WBCHSE SEM 4 MASTERCLASS CARD (Matches Screenshot) */}
      <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#115E59] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
            <span className="text-lg sm:text-xl font-black leading-none">12</span>
            <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 text-teal-100">
              CLASS
            </span>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#0D9488]">
                WBCHSE SEM 4 MASTERCLASS
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
              Biology • Bengali A • English B • AI Study Companion
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Complete syllabus mastery, voice quizzes, AI autopsy, &amp; council exam models
            </p>
          </div>
        </div>

        {/* 95% Target Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl sm:text-2xl font-black text-[#0F766E] block leading-none">
                95% Target
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-1 block">
                EXAM PREPARATION TRACK
              </span>
            </div>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#10B981] rounded-full"
              style={{ width: '88%' }}
            />
          </div>
        </div>

        {/* 5 Action Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {masterclassActions.map((act) => (
            <button
              key={act.label}
              type="button"
              onClick={() => nav(act.path)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${act.className}`}
            >
              {act.label}
            </button>
          ))}
        </div>
      </div>

      {/* MATH LAB (LATEX SOLVER & ANSWER KEY PDF) HERO CARD */}
      <div className="bg-gradient-to-r from-[#EFF6FF] via-[#DBEAFE] to-[#EEF2FF] rounded-[28px] border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center text-2xl shrink-0 shadow-xs border-2 border-[#18181b]">
            📐
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#18181b] text-white">
                Math Lab • Sem 4
              </span>
              <span className="text-[11px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                ফরওয়ার্ড ১-২ ফরম্যাট &amp; KaTeX
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              এআই ম্যাথ ল্যাব: ছবি বা একাধিক অংকের প্রশ্ন সলভ ও আনসার কি PDF
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              পরীক্ষার টেস্ট পেপারের একাধিক প্রশ্ন শনাক্ত করে ধাপে ধাপে LaTeX ব্যাখ্যা এবং হাই-কোয়ালিটি আনসার কি PDF ডাউনলোড করুন। (ডিফল্ট ৫টি ফ্রি ট্রায়াল)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => nav('/app/formulas')}
          className="px-6 py-3 rounded-2xl bg-[#18181b] text-white hover:bg-slate-800 font-black text-xs sm:text-sm border-2 border-[#18181b] shadow-[3px_3px_0px_#FF7A30] transition-all whitespace-nowrap cursor-pointer shrink-0"
        >
          ম্যাথ ল্যাব খুলুন →
        </button>
      </div>

      {/* 4. DAILY STUDY STREAK & LEVEL SYSTEM CARD (Matches Screenshot) */}
      <StudyStreakTracker userName={userName} onExplore={() => nav('/app/mock')} />

      {/* 5. STUDIO CARDS 2-COLUMN GRID (Matches Bottom of Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Voice AI Tutor Studio */}
        <div className="bg-white rounded-[26px] border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-xl shrink-0">
                  🎙️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    Voice AI Tutor Studio
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold block">
                    Anjali, Mahi &amp; Stranger
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black shrink-0">
                Live Voice
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Speak aloud in Bengali or English for natural voice mentoring, sound waveforms, and
              interactive Q&amp;A.
            </p>
          </div>

          <button
            type="button"
            onClick={() => nav('/app/voice')}
            className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs sm:text-sm font-black transition-all cursor-pointer"
          >
            Open Voice Studio →
          </button>
        </div>

        {/* 1v1 Friend Quiz Duel */}
        <div className="bg-white rounded-[26px] border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-xl shrink-0">
                  ⚔️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    1v1 Friend Quiz Duel
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold block">
                    Real-time 6-digit Room Codes
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black shrink-0">
                Multiplayer
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Challenge classmates on WhatsApp with 6-digit codes or battle the AI Rival in
              rapid-fire 1v1 rounds.
            </p>
          </div>

          <button
            type="button"
            onClick={() => nav('/app/battle')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white text-xs sm:text-sm font-black transition-all cursor-pointer"
          >
            Enter 1v1 Arena →
          </button>
        </div>
      </div>

      {/* 6. LIVE SHARED PDF LIBRARY & INSTANT UPLOAD STRIP (Ensures every user sees & can upload/open shared PDFs immediately) */}
      <div className="bg-white rounded-[26px] border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900">
                  PDF Library &amp; Shared Study Notes
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                  <Sparkles size={11} /> সিনক্রোনাইজড ({sharedPdfs.length} PDF)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                যেকোনো পিডিএফ আপলোড করলে নতুন ও পুরনো সব স্টুডেন্টের অ্যাকাউন্টে সাথে সাথে দেখা যাবে
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isUploadingQuickPdf}
              onClick={() => quickFileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isUploadingQuickPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Uploading {quickUploadProgress}%...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>+ Upload PDF (সবার জন্য)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => nav('/app/notes')}
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen size={14} />
              <span>Open Full Library →</span>
            </button>
          </div>
        </div>

        {quickUploadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{quickUploadSuccess}</span>
          </div>
        )}

        {(() => {
          const cleanDocs = sharedPdfs.filter((d) => !isDummySeed(d));
          if (cleanDocs.length === 0) {
            return (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  এখনও কোনো শেয়ারড পিডিএফ আপলোড করা হয়নি।
                </p>
                <p className="text-xs text-slate-500">
                  উপরের &ldquo;+ Upload PDF&rdquo; বাটনে ক্লিক করে প্রথম পিডিএফ নোট বা সাজেশন আপলোড করুন।
                </p>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {cleanDocs.slice(0, 6).map((docItem) => (
                <div
                  key={docItem.id}
                  className="p-3.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/90 flex flex-col justify-between gap-3 transition-all"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4
                        className="text-xs font-black text-slate-900 truncate"
                        title={docItem.name}
                      >
                        {docItem.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        {docItem.sizeFormatted} • {docItem.uploaderName || 'Admin'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenSharedPdf(docItem)}
                    disabled={loadingPdfId === docItem.id}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-900 hover:text-white text-slate-900 border border-slate-300 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {loadingPdfId === docItem.id ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>খুলছে...</span>
                      </>
                    ) : (
                      <>
                        <Eye size={13} />
                        <span>📖 পিডিএফ পড়ুন (Open PDF)</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Instant PDF Viewer Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.name || 'Study PDF'}
          pdfData={previewDoc.url}
          pdfName={previewDoc.name}
          type="pdf"
          subject="WBCHSE Shared Study PDF"
        />
      )}
    </div>
  )
}
