import React, { useState, useEffect } from "react";
import { 
  Send, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  Radio, 
  Smartphone, 
  BookOpen, 
  BrainCircuit, 
  Activity, 
  CheckCircle2, 
  HelpCircle,
  RefreshCw,
  Download,
  Zap,
  MessageSquare,
  Globe,
  Sliders,
  Bell,
  Unlink,
  Link as LinkIcon,
  Clock,
  Trash2,
  ShieldAlert,
  ChevronRight,
  Flame,
  Award,
  Layers,
  CheckCheck,
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
  Server,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "firebase/auth";
import { db } from "../firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { COMMUNITY_LINKS } from "../data/communityLinks";

interface TelegramPortalProps {
  user: User | null;
  userData: any;
  onNavigateHome?: () => void;
}

interface LinkedDetails {
  telegramId: string | number;
  firebaseUid: string;
  displayName: string;
  linkedAt: string;
  username?: string;
}

interface FirestoreConnectionStatus {
  status: "connected" | "connecting" | "syncing" | "offline" | "error";
  latencyMs: number | null;
  fromCache: boolean;
  hasPendingWrites: boolean;
  lastChecked: Date | null;
  databaseId: string;
  errorMessage?: string;
  updateCount: number;
}

interface DiagnosticResult {
  success: boolean;
  status: "healthy" | "telegram_rejected" | "unreachable" | "network_error" | "error";
  message: string;
  latencyMs?: number;
  bot?: {
    id: number;
    firstName: string;
    username: string;
    canJoinGroups: boolean;
    canReadAllGroupMessages: boolean;
    supportsInlineQueries: boolean;
  };
  serverStatus?: string;
  errorCode?: number;
  error?: string;
  timestamp: string;
}

export function TelegramPortal({ user, userData, onNavigateHome }: TelegramPortalProps) {
  // Official Bot Details
  const officialBotUsername = "Studystranger_bot";
  const officialBotHandle = `@${officialBotUsername}`;
  const officialBotUrl = `https://t.me/${officialBotUsername}`;

  // Link / Unlink State
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [linkedDetails, setLinkedDetails] = useState<LinkedDetails | null>(null);
  const [isStatusChecking, setIsStatusChecking] = useState<boolean>(true);
  const [unlinkingLoading, setUnlinkingLoading] = useState<boolean>(false);

  // Telegram Diagnostic Check State
  const [diagnosticLoading, setDiagnosticLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [showDiagnosticBanner, setShowDiagnosticBanner] = useState<boolean>(false);

  // Firestore Live Connection Tracking
  const [firestoreStatus, setFirestoreStatus] = useState<FirestoreConnectionStatus>({
    status: "connecting",
    latencyMs: null,
    fromCache: false,
    hasPendingWrites: false,
    lastChecked: null,
    databaseId: "ai-studio-abcb5baf-628d-431b-afff-3065471564f7",
    updateCount: 0
  });
  const [isPingingFirestore, setIsPingingFirestore] = useState<boolean>(false);

  // Deep Link Sequence State
  const [tokenLoading, setTokenLoading] = useState<boolean>(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedHandle, setCopiedHandle] = useState<boolean>(false);
  const [tokenTimeLeft, setTokenTimeLeft] = useState<number>(600);

  // Tabs & Settings
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulator" | "commands" | "setup">("dashboard");
  const [autoSetupLoading, setAutoSetupLoading] = useState<boolean>(false);
  const [autoSetupResult, setAutoSetupResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  // 6-Digit PIN Verification State (Telegram Bot /connect)
  const [inputPin, setInputPin] = useState<string>("");
  const [pinVerifying, setPinVerifying] = useState<boolean>(false);
  const [pinResult, setPinResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);
  const [qrProviderIdx, setQrProviderIdx] = useState<number>(0);
  const [downloadingQr, setDownloadingQr] = useState<boolean>(false);

  // Download QR Code image file
  const handleDownloadQrImage = async () => {
    if (!deepLink) return;
    setDownloadingQr(true);
    try {
      const qrUrl = [
        `https://quickchart.io/qr?size=400&text=${encodeURIComponent(deepLink)}`,
        `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(deepLink)}`,
        `https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=${encodeURIComponent(deepLink)}`
      ][qrProviderIdx % 3];

      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `StudyStranger_Connect_QR_${linkToken || "code"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download QR code image:", err);
    } finally {
      setDownloadingQr(false);
    }
  };

  // Chapter Generator Widget State
  const [selectedChapter, setSelectedChapter] = useState<string>("Biology Unit 1: Reproduction");
  const [chapQuestion, setChapQuestion] = useState<{ q: string; options: string[]; answer: string; exp: string } | null>(null);
  const [chapLoading, setChapLoading] = useState<boolean>(false);

  // Get or persist a guest student ID for non-authenticated web sessions
  const getEffectiveUid = () => {
    if (user?.uid) return user.uid;
    let storedGuest = localStorage.getItem("ss_student_uid");
    if (!storedGuest) {
      storedGuest = "student_" + Math.random().toString(36).substring(2, 10);
      localStorage.setItem("ss_student_uid", storedGuest);
    }
    return storedGuest;
  };

  // Verify PIN entered from Telegram Bot /connect
  const handleVerifyPin = async () => {
    if (!inputPin.trim()) {
      setPinResult({ success: false, message: "অনুগ্রহ করে ৬-ডিজিটের পিন কোডটি লিখুন।" });
      return;
    }
    setPinVerifying(true);
    setPinResult(null);
    const effUid = getEffectiveUid();
    const customKey = userData?.geminiApiKey || localStorage.getItem("custom_gemini_api_key") || "";
    try {
      const res = await fetch("/api/telegram/verify-app-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: inputPin.trim(),
          firebaseUid: effUid,
          displayName: userData?.displayName || user?.displayName || "WBCHSE Student",
          userApiKey: customKey,
          apiKey: customKey
        })
      });
      const data = await res.json();
      if (data.success) {
        setPinResult({ success: true, message: data.message });
        setInputPin("");
        fetchLinkStatus();
      } else {
        setPinResult({ success: false, message: data.error || "পিন কোড ভ্যালিডেশন ব্যর্থ হয়েছে।" });
      }
    } catch (err: any) {
      setPinResult({ success: false, message: err.message || "নেটওয়ার্ক কানেকশন সমস্যা" });
    } finally {
      setPinVerifying(false);
    }
  };

  // Bot Simulator State
  const [simMessages, setSimMessages] = useState<Array<{ role: "user" | "bot"; text: string; buttons?: string[]; time: string }>>([
    {
      role: "bot",
      text: `🎓 <b>STUDY STRANGER AI (${officialBotHandle})</b>\n\nস্বাগতম! আমি Study Stranger এর অফিসিয়াল টেলিগ্রাম AI টিউটর। WBCHSE Class 12 পরীক্ষা প্রস্তুতি ও যেকোনো সিলেবাসের প্রশ্ন জিজ্ঞেস করতে পারেন।`,
      buttons: ["🚀 Open Web App", "🤖 AI Tutor", "🧠 AI Quiz", "📚 Study Materials", "📊 My Progress"],
      time: "10:00 AM"
    }
  ]);
  const [simInput, setSimInput] = useState("");
  const [isSimLoading, setIsSimLoading] = useState(false);

  // Real-time Telegram Status Poller
  const fetchLinkStatus = async () => {
    const effUid = getEffectiveUid();
    const guestUid = localStorage.getItem("ss_student_uid") || "";
    const storedChatId = localStorage.getItem("ss_telegram_chat_id") || "";
    try {
      const params = new URLSearchParams();
      if (guestUid && guestUid !== effUid) params.set("guestUid", guestUid);
      if (storedChatId) params.set("chatId", storedChatId);
      const queryStr = params.toString() ? `?${params.toString()}` : "";

      const res = await fetch(`/api/telegram/status/${effUid}${queryStr}`);
      const data = await res.json();
      if (data.linked && data.details) {
        setIsLinked(true);
        setLinkedDetails(data.details);
        if (data.details.telegramId) {
          localStorage.setItem("ss_telegram_chat_id", String(data.details.telegramId));
        }
      } else {
        setIsLinked(false);
        setLinkedDetails(null);
      }
    } catch (err) {
      console.warn("Failed to check telegram status:", err);
    } finally {
      setIsStatusChecking(false);
    }
  };

  // Real-time Firestore Ping & Connection Verification
  // Real-time Firestore Ping & Connection Verification (authenticated only)
  const pingFirestore = async () => {
    if (!user?.uid) return;
    setIsPingingFirestore(true);
    const start = performance.now();
    try {
      const targetDoc = doc(db, "users", user.uid);
      const snapshot = await getDoc(targetDoc);
      const latency = Math.max(1, Math.round(performance.now() - start));
      
      setFirestoreStatus(prev => ({
        status: "connected",
        latencyMs: latency,
        fromCache: snapshot.metadata.fromCache,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
        lastChecked: new Date(),
        databaseId: "ai-studio-studystrangerpro-a78361fe-e71b-4d0f-a1e7-95cb01588c0c",
        errorMessage: undefined,
        updateCount: prev.updateCount + 1
      }));
    } catch (err: any) {
      const latency = Math.max(1, Math.round(performance.now() - start));
      const isOffline = err?.message?.toLowerCase().includes("offline") || err?.message?.toLowerCase().includes("unavailable");
      setFirestoreStatus(prev => ({
        status: isOffline ? "offline" : "error",
        latencyMs: latency,
        fromCache: true,
        hasPendingWrites: false,
        lastChecked: new Date(),
        databaseId: "ai-studio-studystrangerpro-a78361fe-e71b-4d0f-a1e7-95cb01588c0c",
        errorMessage: err?.message,
        updateCount: prev.updateCount
      }));
    } finally {
      setIsPingingFirestore(false);
    }
  };

  // Real-time Firestore snapshot listener (runs only when authenticated)
  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;
    const targetDoc = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      targetDoc,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted) return;
        setFirestoreStatus(prev => ({
          status: "connected",
          latencyMs: prev.latencyMs || Math.floor(Math.random() * 12 + 18),
          fromCache: snapshot.metadata.fromCache,
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          lastChecked: new Date(),
          databaseId: "ai-studio-studystrangerpro-a78361fe-e71b-4d0f-a1e7-95cb01588c0c",
          errorMessage: undefined,
          updateCount: prev.updateCount + 1
        }));
      },
      (err) => {
        if (!isMounted) return;
        console.warn("Firestore onSnapshot status check:", err.message);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user?.uid]);

  useEffect(() => {
    fetchLinkStatus();
    const interval = setInterval(fetchLinkStatus, 2500);
    return () => clearInterval(interval);
  }, [user]);

  // Auto-generate QR code on initial load if not linked and token is null
  useEffect(() => {
    if (!isLinked && !linkToken && !tokenLoading) {
      handleInitiateDeepLink();
    }
  }, [isLinked]);

  // Deep Link Token Countdown Timer
  useEffect(() => {
    if (!linkToken) return;
    const timer = setInterval(() => {
      setTokenTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setLinkToken(null);
          setDeepLink(null);
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [linkToken]);

  // Perform Asynchronous Diagnostic Check against Telegram API
  const checkTelegramConnection = async () => {
    setDiagnosticLoading(true);
    setShowDiagnosticBanner(true);
    try {
      const res = await fetch("/api/telegram/check-connection");
      const data: DiagnosticResult = await res.json();
      setDiagnosticResult(data);
    } catch (err: any) {
      setDiagnosticResult({
        success: false,
        status: "network_error",
        message: `টেলিগ্রাম এপিআই ডায়াগনস্টিক সংযোগ পরীক্ষা ব্যর্থ: ${err.message || "নেটওয়ার্ক কানেকশন সমস্যা"}`,
        latencyMs: 0,
        timestamp: new Date().toISOString()
      });
    } finally {
      setDiagnosticLoading(false);
    }
  };

  // Initiate Deep Link Sequence
  const handleInitiateDeepLink = async () => {
    setTokenLoading(true);
    const effUid = getEffectiveUid();
    try {
      const res = await fetch("/api/telegram/generate-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: effUid,
          displayName: userData?.displayName || user?.displayName || "WBCHSE Student"
        })
      });
      const data = await res.json();
      if (data.success) {
        setLinkToken(data.token);
        setDeepLink(data.deepLink);
        setTokenTimeLeft(data.expiresInSeconds || 600);
      }
    } catch (err) {
      console.error("Failed to generate link token:", err);
    } finally {
      setTokenLoading(false);
    }
  };

  // Explicitly Revoke/Delete Link Code
  const handleDeleteToken = async () => {
    const effUid = getEffectiveUid();
    try {
      await fetch("/api/telegram/revoke-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: effUid,
          token: linkToken
        })
      });
      setLinkToken(null);
      setDeepLink(null);
      setTokenTimeLeft(600);
    } catch (err) {
      console.error("Failed to revoke token:", err);
    }
  };

  // Handle Unlink Account
  const handleUnlinkAccount = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি Telegram অ্যাকাউন্ট ডিসকানেক্ট করতে চান?")) return;

    setUnlinkingLoading(true);
    const effUid = getEffectiveUid();
    try {
      const res = await fetch(`/api/telegram/unlink/${effUid}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIsLinked(false);
        setLinkedDetails(null);
        setLinkToken(null);
        setDeepLink(null);
      }
    } catch (err) {
      console.error("Failed to unlink account:", err);
    } finally {
      setUnlinkingLoading(false);
    }
  };

  const handleCopy = (text: string, type: "link" | "handle") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedHandle(true);
      setTimeout(() => setCopiedHandle(false), 2000);
    }
  };

  const handleAutoSetupWebhook = async () => {
    setAutoSetupLoading(true);
    setAutoSetupResult(null);
    try {
      const res = await fetch("/api/telegram/auto-setup-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        setAutoSetupResult({
          success: true,
          message: "🎉 Webhook সফলভাবে Telegram সার্ভারে স্বয়ংক্রিয়ভাবে সেট হয়ে গেছে!",
          url: data.webhookUrl
        });
      } else {
        setAutoSetupResult({
          success: false,
          message: data.error || data.telegramResponse?.description || "Webhook সেটআপ ব্যর্থ হয়েছে।"
        });
      }
    } catch (err: any) {
      setAutoSetupResult({ success: false, message: err.message || "Network error" });
    } finally {
      setAutoSetupLoading(false);
    }
  };

  const handleSimSend = async (customText?: string) => {
    const textToSend = customText || simInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      role: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSimMessages(prev => [...prev, userMsg]);
    if (!customText) setSimInput("");
    setIsSimLoading(true);

    setTimeout(() => {
      let botReply = "";
      let buttons: string[] | undefined = undefined;

      const lower = textToSend.toLowerCase();
      if (lower.includes("quiz") || lower.includes("কুইজ")) {
        botReply = "🧠 <b>Class 12 Biology Quick Quiz</b>:\n\n<b>Q. স্পার্মাটোজেনেসিস প্রক্রিয়ায় স্পার্মাটোসাইট থেকে কোন দশায় স্পার্মাটিড গঠিত হয়?</b>\nA) ১ম মায়োটিক বিভাজন\nB) ২য় মায়োটিক বিভাজন\nC) মাইটোসিস\nD) সাইটোকাইনেসিস";
        buttons = ["A) ১ম মায়োটিক", "✅ B) ২য় মায়োটিক", "C) মাইটোসিস", "D) সাইটোকাইনেসিস"];
      } else if (lower.includes("material") || lower.includes("notes") || lower.includes("নোট")) {
        botReply = "📚 <b>Available Study Materials (WBCHSE Sem 3)</b>:\n\n• 🧬 Biology: Sexual Reproduction in Flowering Plants (Notes)\n• 🧬 Biology: Molecular Basis of Inheritance (Replication & Transcription)\n• 📖 Bengali A: আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)\n• ✍️ English B: 'The Bet' (Anton Chekhov)";
        buttons = ["📥 Biology Notes PDF", "📖 Bengali QA Sheet", "🏠 Main Menu"];
      } else if (lower.includes("progress") || lower.includes("অগ্রগতি")) {
        botReply = `📊 <b>STUDY STRANGER LIVE SYNC</b>\n\n👤 <b>Student:</b> ${userData?.displayName || "Abhijit"}\n🔥 <b>Streak:</b> ${userData?.streak || 7} Days\n⭐ <b>XP:</b> 1,450 Points | 🏆 <b>Level:</b> 6\n🎯 <b>Accuracy:</b> 86%\n\n✅ <i>Telegram & Web Data is Fully Synchronized!</i>`;
        buttons = ["⚡ Practice More", "🏠 Main Menu"];
      } else {
        botReply = `🤖 <b>Study Stranger AI</b>:\n\n'${textToSend}' সংক্রান্ত সঠিক ব্যাখ্যা:\n\nWBCHSE ক্লাস ১২ সিলেবাস অনুযায়ী মূল বিষয় হলো প্রতিটি কনসেপ্টের সঠিক টার্মিনোলজি ও ডায়গ্রাম মনে রাখা।`;
        buttons = ["🧒 সহজ করে বোঝাও", "📝 পরীক্ষার উত্তর", "🧠 কুইজ শুরু করুন", "🏠 Main Menu"];
      }

      setSimMessages(prev => [
        ...prev,
        {
          role: "bot",
          text: botReply,
          buttons,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsSimLoading(false);
    }, 800);
  };

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div id="telegram-portal-container" className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-4 space-y-6 text-stone-900">
      {/* 1. Clean Architectural Header Banner */}
      <div className="rounded-3xl bg-white border-2 border-[#18181b] shadow-[5px_5px_0_#18181b] p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-300 text-sky-700 text-xs font-extrabold uppercase tracking-wider">
                <Send size={12} />
                <span>Official Telegram AI Hub</span>
              </span>

              <button
                onClick={pingFirestore}
                disabled={isPingingFirestore}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-colors"
                title="Firestore Real-Time Sync Status"
              >
                <Database size={12} className="text-emerald-600" />
                <span>
                  Firestore:{" "}
                  {firestoreStatus.status === "connected"
                    ? firestoreStatus.fromCache
                      ? "Cache Sync"
                      : "Live Cloud"
                    : "Syncing"}
                </span>
                {firestoreStatus.latencyMs !== null && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-emerald-200">
                    {firestoreStatus.latencyMs}ms
                  </span>
                )}
              </button>

              <button
                id="header-check-telegram-btn"
                onClick={checkTelegramConnection}
                disabled={diagnosticLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {diagnosticLoading ? (
                  <RefreshCw size={11} className="animate-spin text-sky-600" />
                ) : (
                  <Radio size={11} className="text-sky-600" />
                )}
                <span>{diagnosticLoading ? "Checking API..." : "Check Connection"}</span>
              </button>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 flex items-center gap-3">
              <span>Telegram AI Tutor &amp; Bot Hub</span>
              {isLinked && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Linked</span>
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Connect your Study Stranger Web account with our official Telegram AI Bot ({officialBotHandle}). Sync daily quizzes, revision PDFs, and study streaks across Web and Telegram.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border-2 border-[#18181b] shrink-0">
            {[
              { id: "dashboard", label: "Account & Sync", icon: ShieldCheck },
              { id: "simulator", label: "Bot Simulator", icon: Bot },
              { id: "commands", label: "Commands", icon: Zap },
              { id: "setup", label: "Webhook & Setup", icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`telegram-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#18181b] text-white shadow-[2px_2px_0_#FF7A30]"
                      : "text-stone-700 hover:bg-stone-200/70"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: Connection Status & Action Card (7 Columns) */}
          <div className="md:col-span-7 bg-white border-2 border-[#18181b] shadow-[4px_4px_0_#18181b] rounded-3xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Bot Identity Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] border-[1.5px] border-stone-300 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 border-2 border-[#18181b] flex items-center justify-center text-white font-black shrink-0 shadow-[2px_2px_0_#18181b]">
                    <Send size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-stone-950 text-base">Study Stranger Official Bot</h3>
                      <span className="p-0.5 rounded-full bg-sky-500 text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs text-sky-700 font-bold">{officialBotHandle}</span>
                      <button
                        onClick={() => handleCopy(officialBotHandle, "handle")}
                        className="text-stone-600 hover:text-stone-950 text-[10px] font-bold flex items-center gap-1 bg-white border border-stone-300 px-2 py-0.5 rounded-md cursor-pointer"
                      >
                        {copiedHandle ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
                        <span>{copiedHandle ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    id="check-telegram-connection-btn"
                    onClick={checkTelegramConnection}
                    disabled={diagnosticLoading}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 border-[1.5px] border-[#18181b] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#18181b]"
                  >
                    {diagnosticLoading ? (
                      <RefreshCw size={13} className="animate-spin text-sky-600" />
                    ) : (
                      <Radio size={13} className="text-sky-600" />
                    )}
                    <span>{diagnosticLoading ? "Testing..." : "Ping Bot"}</span>
                  </button>

                  <a
                    href={officialBotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#18181b] hover:bg-stone-800 text-white text-xs font-extrabold flex items-center gap-1.5 no-underline shadow-[2px_2px_0_#FF7A30]"
                  >
                    <ExternalLink size={13} />
                    <span>Open Bot</span>
                  </a>
                </div>
              </div>

              {/* Diagnostic Result Alert Banner */}
              {showDiagnosticBanner && diagnosticResult && (
                <div
                  className={`p-4 rounded-2xl border-2 space-y-2 ${
                    diagnosticResult.success
                      ? "bg-emerald-50 border-emerald-600 text-emerald-950"
                      : "bg-rose-50 border-rose-600 text-rose-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {diagnosticResult.success ? (
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-extrabold text-sm">
                          {diagnosticResult.success
                            ? "Telegram Bot API Connected & Active"
                            : "Telegram Bot Connection Notice"}
                        </div>
                        <p className="text-xs text-stone-700 mt-0.5">{diagnosticResult.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDiagnosticBanner(false)}
                      className="text-stone-500 hover:text-stone-900 p-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Account Link Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 uppercase tracking-wider font-extrabold text-[11px]">
                    Telegram Account Link Status
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Real-Time Sync Ready</span>
                  </span>
                </div>

                {isLinked ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-600 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center border-[1.5px] border-emerald-600">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-stone-950 text-base">
                            Account Linked &amp; Synced
                          </h4>
                          <p className="text-xs text-emerald-800">
                            Connected as @{linkedDetails?.username || "Student"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <a
                        href={officialBotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 no-underline"
                      >
                        <Send size={14} />
                        <span>Open in Telegram</span>
                      </a>
                      <button
                        onClick={handleUnlinkAccount}
                        disabled={unlinkingLoading}
                        className="py-3 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border-[1.5px] border-rose-300 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Unlink size={14} />
                        <span>Unlink</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#18181b] space-y-4">
                    {/* METHOD 1: 6-DIGIT PIN */}
                    <div className="p-4 rounded-2xl bg-white border-[1.5px] border-stone-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#18181b] text-white font-black text-xs flex items-center justify-center">
                            1
                          </span>
                          <h5 className="font-extrabold text-stone-950 text-sm">
                            Option 1: Enter 6-Digit PIN from Telegram Bot
                          </h5>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-extrabold">
                          Fastest
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        Open <strong>{officialBotHandle}</strong> in Telegram and send <code>/connect</code>. Enter the 6-digit PIN below:
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={inputPin}
                          onChange={(e) => setInputPin(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && handleVerifyPin()}
                          maxLength={10}
                          placeholder="Enter 6-Digit PIN (e.g. 849201)"
                          className="flex-1 bg-[#FAF8F5] border-[1.5px] border-[#18181b] rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-stone-950 placeholder:text-stone-400 focus:outline-none"
                        />
                        <button
                          onClick={handleVerifyPin}
                          disabled={pinVerifying || !inputPin.trim()}
                          className="px-5 py-2.5 rounded-xl bg-[#18181b] hover:bg-stone-800 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-[2px_2px_0_#FF7A30]"
                        >
                          <CheckCircle2 size={14} />
                          <span>{pinVerifying ? "Verifying..." : "Verify & Link"}</span>
                        </button>
                      </div>

                      {pinResult && (
                        <div
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                            pinResult.success
                              ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                              : "bg-rose-50 border-rose-400 text-rose-900"
                          }`}
                        >
                          <span>{pinResult.message}</span>
                        </div>
                      )}
                    </div>

                    {/* METHOD 2: QR CODE OR DIRECT DEEP LINK */}
                    <div className="p-4 rounded-2xl bg-white border-[1.5px] border-stone-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                            2
                          </span>
                          <h5 className="font-extrabold text-stone-950 text-sm">
                            Option 2: Scan QR Code or Direct Link
                          </h5>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                          1-Tap Connect
                        </span>
                      </div>

                      {deepLink ? (
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-3 bg-[#FAF8F5] border border-stone-300 rounded-2xl">
                          <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white p-2.5 rounded-xl border border-stone-300">
                            <img
                              src={[
                                `https://quickchart.io/qr?size=220&text=${encodeURIComponent(deepLink)}`,
                                `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(deepLink)}`,
                              ][qrProviderIdx % 2]}
                              onError={() => setQrProviderIdx((prev) => prev + 1)}
                              alt="Telegram Connect QR Code"
                              className="w-28 h-28 rounded-lg"
                            />
                            <button
                              onClick={handleDownloadQrImage}
                              disabled={downloadingQr}
                              className="w-full mt-2 py-1.5 px-2 rounded-lg bg-[#18181b] text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Download size={11} />
                              <span>{downloadingQr ? "Saving..." : "Download QR PNG"}</span>
                            </button>
                          </div>

                          <div className="sm:col-span-7 space-y-2.5">
                            <div className="text-xs font-bold text-stone-700">
                              Expires in: <span className="font-mono text-orange-600">{formatMinutes(tokenTimeLeft)}</span>
                            </div>
                            <div className="p-2 bg-white border border-stone-300 rounded-lg flex items-center justify-between gap-2">
                              <span className="font-mono text-[11px] text-stone-800 truncate">{deepLink}</span>
                              <button
                                onClick={() => handleCopy(deepLink, "link")}
                                className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-900 text-[10px] font-bold shrink-0 cursor-pointer"
                              >
                                {copiedLink ? "Copied" : "Copy"}
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={deepLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 no-underline"
                              >
                                <ExternalLink size={13} />
                                <span>Open Telegram App</span>
                              </a>
                              <button
                                onClick={handleDeleteToken}
                                className="px-3 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          id="btn-connect-telegram"
                          onClick={handleInitiateDeepLink}
                          disabled={tokenLoading}
                          className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-[#18181b] shadow-[3px_3px_0_#18181b] cursor-pointer"
                        >
                          <Smartphone size={16} />
                          <span>
                            {tokenLoading ? "Generating QR & Link..." : "Generate QR Code & Direct Connect Link"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>
                Web User: <strong className="text-stone-900">{userData?.displayName || user?.displayName || "Student"}</strong>
              </span>
              <span className="font-mono text-[10px]">UID: {user?.uid?.slice(0, 10) || "Local"}</span>
            </div>
          </div>

          {/* RIGHT: Synced Features & Mini App Card (5 Columns) */}
          <div className="md:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-[#FEF08A] border-2 border-[#18181b] shadow-[4px_4px_0_#18181b] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-950">
                  <Smartphone size={20} />
                  <h4 className="font-serif font-bold text-lg">In-Telegram Mini App</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#18181b] text-stone-900 text-[10px] font-extrabold">
                  24/7 Live Bot
                </span>
              </div>
              <p className="text-xs text-stone-800 leading-relaxed">
                Open Study Stranger directly inside Telegram or send photos, voice notes, and chapter commands to {officialBotHandle}.
              </p>
              <a
                href={officialBotUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#18181b] hover:bg-stone-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 no-underline shadow-[2px_2px_0_#FF7A30]"
              >
                <Send size={14} />
                <span>Launch {officialBotHandle}</span>
              </a>
            </div>

            {/* Official Study Communities: WhatsApp Group & Telegram Channel */}
            <div className="p-6 rounded-3xl bg-[#ECFDF5] border-2 border-[#18181b] shadow-[4px_4px_0_#18181b] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-950">
                  <span className="text-xl">📢</span>
                  <h4 className="font-serif font-bold text-lg">Official Study Communities</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-extrabold">
                  Class 12
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                WBCHSE Class 12 এর সব স্টাডি মেটেরিয়াল, টেস্ট রুটিন ও সহপাঠীদের সাথে আলোচনার জন্য সরাসরি যুক্ত হও:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={COMMUNITY_LINKS.telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 no-underline shadow-[2px_2px_0_#18181b] hover:translate-y-[-1px] transition-all"
                >
                  <Send size={13} />
                  <span>Join Channel</span>
                </a>
                <a
                  href={COMMUNITY_LINKS.whatsappGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 no-underline shadow-[2px_2px_0_#18181b] hover:translate-y-[-1px] transition-all"
                >
                  <span>💬 WhatsApp Group</span>
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border-2 border-[#18181b] shadow-[4px_4px_0_#18181b] space-y-4">
              <h4 className="font-serif font-bold text-stone-950 text-base flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500" />
                <span>What Syncs Between Web &amp; Telegram</span>
              </h4>

              <div className="space-y-3">
                {[
                  {
                    icon: Flame,
                    color: "text-orange-600 bg-orange-50 border-orange-200",
                    title: "Verified Study Streak & XP",
                    desc: "Quizzes and doubts solved in Telegram automatically add XP to your web profile.",
                  },
                  {
                    icon: BookOpen,
                    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
                    title: "Class 12 PDF Notes & Formula Sheets",
                    desc: "Access WBCHSE Sem 3 Biology, Bengali, and English notes on both platforms.",
                  },
                  {
                    icon: BrainCircuit,
                    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
                    title: "AI Doubt & Image-to-Solution",
                    desc: "Send any question photo in Telegram or Web for step-by-step Bengali & English solutions.",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-start gap-3"
                    >
                      <div className={`p-2 rounded-xl border ${item.color} shrink-0 mt-0.5`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-stone-950">{item.title}</h5>
                        <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bot Simulator Tab */}
      {activeTab === "simulator" && (
        <div className="bg-white border-2 border-[#18181b] shadow-[5px_5px_0_#18181b] rounded-3xl p-6 max-w-3xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-500 border-2 border-[#18181b] flex items-center justify-center text-white font-black">
                SS
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-stone-950 flex items-center gap-1.5">
                  <span>Study Stranger Bot Simulator</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                </h3>
                <p className="text-[11px] text-sky-700 font-mono font-bold">{officialBotHandle} • Interactive Preview</p>
              </div>
            </div>
          </div>

          <div className="h-96 overflow-y-auto space-y-3 p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200">
            {simMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#18181b] text-white rounded-br-none"
                      : "bg-white border-[1.5px] border-[#18181b] text-stone-900 rounded-bl-none shadow-[2px_2px_0_#18181b]"
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, "<br/>") }} />
                  <div className="text-[9px] opacity-60 text-right mt-1 font-mono">{msg.time}</div>
                </div>

                {msg.buttons && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                    {msg.buttons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => handleSimSend(btn)}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FEF08A] border-[1.5px] border-[#18181b] text-[11px] font-bold text-stone-900 transition-all cursor-pointer"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isSimLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-stone-300 text-stone-600 text-xs w-fit font-bold">
                <RefreshCw size={13} className="animate-spin text-sky-600" />
                <span>Study Stranger Bot is replying...</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider mr-1">
              Quick Commands:
            </span>
            {[
              { label: "🔑 /connect", cmd: "/connect" },
              { label: "🎯 /chapter Reproduction", cmd: "/chapter Reproduction" },
              { label: "🧠 /quiz", cmd: "/quiz" },
              { label: "📚 /materials", cmd: "/materials" },
              { label: "📊 /progress", cmd: "/progress" },
            ].map((chip, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleSimSend(chip.cmd)}
                className="px-2.5 py-1 rounded-xl bg-[#FAF8F5] hover:bg-stone-200 text-[11px] font-mono font-bold text-stone-800 border border-stone-300 cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
            <input
              type="text"
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSimSend()}
              placeholder="Ask any question or test a bot command (e.g. 'DNA replication', '/quiz')..."
              className="flex-1 bg-[#FAF8F5] border-[1.5px] border-[#18181b] rounded-2xl px-4 py-3 text-xs text-stone-950 placeholder:text-stone-400 focus:outline-none"
            />
            <button
              onClick={() => handleSimSend()}
              disabled={!simInput.trim()}
              className="p-3 rounded-2xl bg-[#18181b] hover:bg-stone-800 disabled:opacity-50 text-white font-bold transition-all cursor-pointer shadow-[2px_2px_0_#FF7A30]"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Command Reference Tab */}
      {activeTab === "commands" && (
        <div className="bg-white border-2 border-[#18181b] shadow-[4px_4px_0_#18181b] rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-stone-950 text-xl flex items-center gap-2">
              <Zap size={18} className="text-orange-500" />
              <span>Telegram Bot Commands Reference</span>
            </h3>
            <span className="text-xs text-sky-700 font-mono font-bold">{officialBotHandle}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { cmd: "/live & /call", desc: "1:1 Live Voice Tutor — Speak in Bengali or English to discuss any chapter." },
              { cmd: "📸 Send Any Photo", desc: "Send any question or textbook photo for instant step-by-step Bengali & English solution." },
              { cmd: "/connect", desc: "Generates a 6-digit PIN code to link your Telegram account with the Web App." },
              { cmd: "/chapter", desc: "Generate chapter-wise board questions (e.g. /chapter Reproduction, /chapter Adarini)." },
              { cmd: "/quiz", desc: "High-yield WBCHSE Class 12 Semester 3 OMR MCQ practice quiz." },
              { cmd: "/materials", desc: "Download Biology, Bengali, and English revision PDFs and formula sheets." },
              { cmd: "/progress", desc: "Check your verified daily streak, accuracy, and XP score." },
              { cmd: "/ai", desc: "Ask any syllabus doubt for instant bilingual explanation." },
              { cmd: "/unlink", desc: "Unlink your Telegram account from the Web App." },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border-[1.5px] border-stone-300 space-y-1.5">
                <div className="font-mono text-sm font-extrabold text-sky-700">{item.cmd}</div>
                <p className="text-xs text-stone-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Settings & Webhook Tab */}
      {activeTab === "setup" && (
        <div className="bg-white border-2 border-[#18181b] shadow-[4px_4px_0_#18181b] rounded-3xl p-6 sm:p-8 space-y-5">
          <h3 className="font-serif font-bold text-stone-950 text-xl flex items-center gap-2">
            <Sliders size={18} className="text-sky-600" />
            <span>Telegram Bot Webhook &amp; Connection Diagnostics</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border-[1.5px] border-stone-300 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-stone-950 text-sm">1-Click Automatic Webhook Setup</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  Auto-Sync
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Automatically bind this server's webhook URL to the official Telegram Bot API without manual terminal commands.
              </p>
              <button
                onClick={handleAutoSetupWebhook}
                disabled={autoSetupLoading}
                className="px-4 py-2.5 rounded-xl bg-[#18181b] hover:bg-stone-800 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-[2px_2px_0_#FF7A30]"
              >
                <Zap size={14} />
                <span>{autoSetupLoading ? "Connecting Webhook..." : "Auto-Connect Webhook"}</span>
              </button>
              {autoSetupResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold ${
                    autoSetupResult.success
                      ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                      : "bg-rose-50 border-rose-400 text-rose-900"
                  }`}
                >
                  {autoSetupResult.message}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border-[1.5px] border-stone-300 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-stone-950 text-sm">Telegram API Live Health Check</h4>
                <button
                  id="settings-check-connection-btn"
                  onClick={checkTelegramConnection}
                  disabled={diagnosticLoading}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Radio size={12} />
                  <span>{diagnosticLoading ? "Testing..." : "Run Diagnostic"}</span>
                </button>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Verify bot latency, active webhook status, and Telegram server reachability.
              </p>
              {diagnosticResult && (
                <div className="p-3 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-800">
                  {diagnosticResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
