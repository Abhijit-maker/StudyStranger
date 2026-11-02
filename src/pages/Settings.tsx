import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Volume2,
  ShieldCheck,
  Save,
  User,
  Activity,
  Play,
  Square,
  Globe,
  Smartphone,
  Languages,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Zap,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Lock,
  Server,
  Trash2,
} from "lucide-react";
import { voiceService } from "../services/voiceService";
import { soundEffects } from "../services/soundEffectsService";
import { db, auth, doc, getDoc, setDoc } from "../firebase";
import { USER } from "../data.js";
import GoogleSetupGuideModal from "../components/GoogleSetupGuideModal";
import { PWAInstallButton } from "../components/PWAInstallButton";
import { listAllPdfsFromIndexedDB } from "../services/pdfStorageService";

export default function Settings() {
  const nav = useNavigate();
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveNoticeMsg, setSaveNoticeMsg] = useState<string>("");

  // Gemini API Key & Model Configuration
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return (
      localStorage.getItem("gemini_api_key") ||
      localStorage.getItem("custom_gemini_api_key") ||
      localStorage.getItem("user_gemini_api_key") ||
      localStorage.getItem("ss-gemini-key") ||
      ""
    );
  });
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    model?: string;
  } | null>(null);
  const [isSavingKey, setIsSavingKey] = useState<boolean>(false);
  const [serverKeyStatus, setServerKeyStatus] = useState<{
    hasCustomKey: boolean;
    maskedKey: string;
    serverHasDefault?: boolean;
    source?: string;
  }>({ hasCustomKey: false, maskedKey: "", serverHasDefault: true, source: "default" });
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [preferredQuizModel, setPreferredQuizModel] = useState<string>(() => {
    return localStorage.getItem("pref_quiz_model") || "gemini-3.1-flash-lite";
  });
  const [preferredMathModel, setPreferredMathModel] = useState<string>(() => {
    return localStorage.getItem("pref_math_model") || "gemini-3.1-flash-lite";
  });

  // Language & PDF Overlay Preferences (English UI + Bengali explanations/PDFs by default)
  const [uiLanguage, setUiLanguage] = useState<"en_bn" | "en" | "bn">(() => {
    return (localStorage.getItem("pref_app_language") as "en_bn" | "en" | "bn") || "en_bn";
  });
  const [pdfOverlayLang, setPdfOverlayLang] = useState<"bn" | "en" | "bilingual">(() => {
    return (localStorage.getItem("pref_pdf_overlay_language") as "bn" | "en" | "bilingual") || "bn";
  });

  // Voice & 3D Mentor Configuration
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    return localStorage.getItem("pref_voice_character") || "anjali";
  });
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    const s = localStorage.getItem("pref_voice_rate");
    return s ? parseFloat(s) : 1.04;
  });
  const [isEmotionalPersona, setIsEmotionalPersona] = useState<boolean>(() => {
    return localStorage.getItem("pref_voice_persona") !== "false";
  });
  const [isPlayingSample, setIsPlayingSample] = useState<boolean>(false);
  const [isGoogleGuideOpen, setIsGoogleGuideOpen] = useState<boolean>(false);

  // Student Profile
  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem("currentUserName") || USER.name || "Abhijit";
  });
  const [district, setDistrict] = useState<string>(() => {
    return localStorage.getItem("userDistrict") || "Kolkata";
  });
  const [targetGoal, setTargetGoal] = useState<string>(() => {
    return localStorage.getItem("userTargetGoal") || "95%+ Board Score";
  });

  // Real-time Stats & Vault Count
  const [cloudStats, setCloudStats] = useState({
    points: parseInt(localStorage.getItem("ss_student_xp") || "1280", 10),
    streak: parseInt(localStorage.getItem("ss_study_streak") || "19", 10),
    mistakesCount: 0,
    pdfVaultCount: 0,
    firestoreConnected: true,
  });

  useEffect(() => {
    try {
      const savedM = localStorage.getItem("study_stranger_mistakes_v1");
      if (savedM) {
        const parsed = JSON.parse(savedM);
        setCloudStats((prev) => ({
          ...prev,
          mistakesCount: Array.isArray(parsed) ? parsed.length : 0,
        }));
      }
    } catch {}

    listAllPdfsFromIndexedDB()
      .then((records) => {
        setCloudStats((prev) => ({ ...prev, pdfVaultCount: records.length }));
      })
      .catch(() => {});

    if (auth.currentUser?.uid) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      getDoc(userRef)
        .then((snap) => {
          if (snap.exists()) {
            const d = snap.data();
            setCloudStats((prev) => ({
              ...prev,
              points: typeof d.points === "number" ? d.points : prev.points,
              streak: typeof d.streak === "number" ? d.streak : prev.streak,
              firestoreConnected: true,
            }));
          }
        })
        .catch(() => {});
    }

    // Query current server key status
    fetch(`/api/settings/key-status${auth.currentUser?.uid ? `?firebaseUid=${auth.currentUser.uid}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasCustomKey === "boolean") {
          setServerKeyStatus({
            hasCustomKey: data.hasCustomKey,
            maskedKey: data.maskedKey || "",
            serverHasDefault: !!data.serverHasDefault,
            source: data.source || "default",
          });
        }
      })
      .catch(() => {});

    return () => {
      voiceService.stop();
    };
  }, []);

  const fetchServerKeyStatus = async () => {
    try {
      const res = await fetch(`/api/settings/key-status${auth.currentUser?.uid ? `?firebaseUid=${auth.currentUser.uid}` : ""}`);
      const data = await res.json();
      if (data && typeof data.hasCustomKey === "boolean") {
        setServerKeyStatus({
          hasCustomKey: data.hasCustomKey,
          maskedKey: data.maskedKey || "",
          serverHasDefault: !!data.serverHasDefault,
          source: data.source || "default",
        });
      }
    } catch {}
  };

  const handleVerifyApiKey = async () => {
    soundEffects.play("click");
    const keyToTest = geminiApiKey.trim();
    if (!keyToTest) {
      setVerifyResult({
        success: false,
        message: "অনুগ্রহ করে যাচাই করার আগে একটি ভ্যালিড Gemini API Key পেস্ট করুন।"
      });
      return;
    }

    setIsVerifyingKey(true);
    setVerifyResult(null);

    try {
      const res = await fetch("/api/settings/verify-apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyToTest })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        soundEffects.play("success");
        setVerifyResult({
          success: true,
          message: data.message || "Gemini API Key ভ্যালিড এবং সক্রিয়!",
          latencyMs: data.latencyMs,
          model: data.model || "gemini-3.1-flash-lite"
        });
      } else {
        setVerifyResult({
          success: false,
          message: data.error || "API Key যাচাইকরণ ব্যর্থ হয়েছে। কি-টি সঠিক কিনা তা নিশ্চিত করুন।"
        });
      }
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: err.message || "সার্ভার যাচাইকরণে বিলম্ব হয়েছে। ইন্টারনেট কানেকশন চেক করুন।"
      });
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleSaveApiKey = async () => {
    soundEffects.play("click");
    const cleanKey = geminiApiKey.trim();
    if (!cleanKey) {
      alert("অনুগ্রহ করে সেভ করার আগে একটি ভ্যালিড Gemini API Key দিন অথবা Reset বাটনে ক্লিক করে ডিফল্ট কি সক্রিয় করুন।");
      return;
    }

    setIsSavingKey(true);

    try {
      // 1. Save to local storage under all standard key names
      localStorage.setItem("gemini_api_key", cleanKey);
      localStorage.setItem("custom_gemini_api_key", cleanKey);
      localStorage.setItem("user_gemini_api_key", cleanKey);
      localStorage.setItem("ss-gemini-key", cleanKey);
      localStorage.setItem("pref_quiz_model", preferredQuizModel);
      localStorage.setItem("pref_math_model", preferredMathModel);

      // 2. Sync to server session & disk persistence
      const res = await fetch("/api/settings/save-apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: cleanKey,
          firebaseUid: auth.currentUser?.uid,
          username: displayName,
        })
      });

      // 3. Save to Firestore profile if authenticated
      if (auth.currentUser?.uid) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await setDoc(
            userRef,
            {
              geminiApiKey: cleanKey,
              preferredQuizModel,
              preferredMathModel,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn("Firestore api key save:", e);
        }
      }

      await fetchServerKeyStatus();
      soundEffects.play("success");
      setSaveNoticeMsg("✅ আপনার Gemini API Key সফলভাবে সেভ ও সিঙ্ক হয়েছে! এখন মক টেস্ট, লং আনসার চেকার এবং সব এআই টুলস এই কি দিয়ে চলবে।");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert("API Key সেভ করার সময় ত্রুটি দেখা দিয়েছে: " + (err.message || "Unknown error"));
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleClearApiKey = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে কাস্টম API Key মুছে ফেলে সিস্টেমের ডিফল্ট কি ফিরিয়ে নিতে চান?")) {
      return;
    }

    soundEffects.play("click");
    localStorage.removeItem("gemini_api_key");
    localStorage.removeItem("custom_gemini_api_key");
    localStorage.removeItem("user_gemini_api_key");
    localStorage.removeItem("ss-gemini-key");
    setGeminiApiKey("");
    setVerifyResult(null);

    try {
      await fetch("/api/settings/clear-apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: auth.currentUser?.uid,
          username: displayName,
        })
      });

      if (auth.currentUser?.uid) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await setDoc(userRef, { geminiApiKey: null }, { merge: true });
        } catch {}
      }

      await fetchServerKeyStatus();
      soundEffects.play("success");
      setSaveNoticeMsg("🔄 কাস্টম API Key মুছে ফেলা হয়েছে। এখন সিস্টেমের ডিফল্ট এআই ইঞ্জিন সক্রিয় রয়েছে।");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.warn("Clear key notice:", e);
    }
  };

  const handleCopyKey = () => {
    if (!geminiApiKey) return;
    navigator.clipboard.writeText(geminiApiKey);
    setCopiedKey(true);
    soundEffects.play("click");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveAllSettings = async () => {
    soundEffects.play("click");

    const cleanKey = geminiApiKey.trim();
    if (cleanKey) {
      localStorage.setItem("gemini_api_key", cleanKey);
      localStorage.setItem("custom_gemini_api_key", cleanKey);
      localStorage.setItem("user_gemini_api_key", cleanKey);
      localStorage.setItem("ss-gemini-key", cleanKey);

      fetch("/api/settings/save-apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: cleanKey,
          firebaseUid: auth.currentUser?.uid,
          username: displayName,
        }),
      }).catch(() => {});
    }

    localStorage.setItem("pref_quiz_model", preferredQuizModel);
    localStorage.setItem("pref_math_model", preferredMathModel);
    localStorage.setItem("pref_app_language", uiLanguage);
    localStorage.setItem("pref_pdf_overlay_language", pdfOverlayLang);
    localStorage.setItem("pref_voice_character", selectedVoice);
    localStorage.setItem("pref_voice_rate", playbackSpeed.toString());
    localStorage.setItem("pref_voice_persona", isEmotionalPersona ? "true" : "false");
    localStorage.setItem("currentUserName", displayName);
    localStorage.setItem("userDistrict", district);
    localStorage.setItem("userTargetGoal", targetGoal);

    voiceService.setPlaybackRate(playbackSpeed);
    voiceService.setVoicePersonaEnabled(isEmotionalPersona);

    if (auth.currentUser?.uid) {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(
          userRef,
          {
            displayName,
            district,
            targetGoal,
            uiLanguage,
            pdfOverlayLang,
            geminiApiKey: cleanKey || null,
            preferredQuizModel,
            preferredMathModel,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("Firestore profile save:", e);
      }
    }

    setSaveNoticeMsg("Settings saved! Language, Gemini API Key, PDF overlay, and 3D mentor voice preferences are active across all tools.");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePlayVoiceSample = () => {
    if (isPlayingSample) {
      voiceService.stop();
      setIsPlayingSample(false);
      return;
    }

    setIsPlayingSample(true);
    const sampleText =
      uiLanguage === "en"
        ? `Hello ${displayName}! I am your realistic 3D study mentor. Let's master your WBCHSE Class 12 chapters today!`
        : selectedVoice === "mahi"
        ? `নমস্কার ${displayName}! আমি তোমার মাহি দিদি। তোমার ক্লাস টুয়েলভ জীববিদ্যা ও বাংলা পরীক্ষার প্রস্তুতি কেমন চলছে?`
        : selectedVoice === "anjali"
        ? `হ্যালো ${displayName}! আমি অঞ্জলি! আজকে আমরা একসাথে দারুণ পড়াশোনা করব আর বোর্ডে সেরা নম্বর তুলব!`
        : selectedVoice === "rohan"
        ? `হ্যালো দোস্ত ${displayName}! আমি রোহন দাদা। কোনো ডাউট থাকলে নির্ভয়ে জিজ্ঞেস কর, আমরা একসাথে সমাধান করব!`
        : `নমস্কার ${displayName}! আমি স্টাডি স্ট্রেঞ্জার। একাগ্রতার সাথে অধ্যয়ন করো, সাফল্য তোমারই হবে।`;

    voiceService.speak(sampleText, {
      character: selectedVoice as any,
      rate: playbackSpeed,
      onStart: () => setIsPlayingSample(true),
      onEnd: () => setIsPlayingSample(false),
      onError: () => setIsPlayingSample(false),
    });
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "10px 0 60px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              className="badge-pill"
              style={{ background: "var(--yellow)", fontSize: 11, padding: "4px 10px" }}
            >
              ⚙️ Studio Settings & Preferences
            </span>
            <span
              className="badge-pill"
              style={{
                background: "#dcfce7",
                color: "#166534",
                fontSize: 11,
                padding: "4px 10px",
              }}
            >
              🟢 WBCHSE Sem 3 Verified
            </span>
          </div>
          <h1 style={{ margin: "4px 0", fontSize: 26, fontFamily: "var(--font-serif)" }}>
            Studio Settings &amp; Language Preferences
          </h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            Configure App &amp; PDF Overlay Language, Realistic 3D Girl/Boy Mentor Voices, and Student Profile.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PWAInstallButton variant="compact" />
          <button
            onClick={() => nav("/app")}
            className="btn btn-ghost btn-sm"
            style={{ borderColor: "var(--line)", background: "#ffffff" }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1.5px solid #10b981",
            borderRadius: 16,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            color: "#065f46",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={20} color="#10b981" />
          <span>
            Settings saved! Language, PDF overlay, and 3D mentor voice preferences are now active across all tools.
          </span>
        </div>
      )}

      {/* SECTION -1: GEMINI AI API KEY & ENGINE SETTINGS */}
      <div
        className="panel"
        style={{
          marginBottom: 24,
          border: "2px solid var(--ink)",
          background: "#ffffff",
          boxShadow: "4px 4px 0 var(--ink)",
          borderRadius: 16,
          padding: 24,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "#FEF08A",
                border: "2px solid var(--ink)",
                display: "grid",
                placeItems: "center",
                boxShadow: "2px 2px 0 var(--ink)",
              }}
            >
              <Key size={22} color="var(--ink)" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: 19, fontFamily: "var(--font-serif)", fontWeight: 800 }}>
                  Gemini AI Engine &amp; API Key
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: serverKeyStatus?.hasCustomKey || geminiApiKey.trim() ? "#dcfce7" : "#fef3c7",
                    color: serverKeyStatus?.hasCustomKey || geminiApiKey.trim() ? "#166534" : "#92400e",
                    border: "1px solid var(--ink)",
                  }}
                >
                  {serverKeyStatus?.hasCustomKey || geminiApiKey.trim()
                    ? "🟢 Custom Key Active"
                    : serverKeyStatus?.serverHasDefault
                    ? "⚡ Server Default Active"
                    : "⚠️ No Key Configured"}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--muted)" }}>
                মক টেস্ট (MCQ &amp; Long Answer), Voice AI, ডাউট সলভার ও মাইন্ড ম্যাপের জন্য নিজস্ব জেমিনাই API Key ব্যবহার করুন
              </p>
            </div>
          </div>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#F3E8FF",
              border: "1.5px solid var(--ink)",
              fontSize: 12,
              fontWeight: 700,
              padding: "8px 12px",
              borderRadius: 10,
              textDecoration: "none",
              color: "var(--ink)",
              boxShadow: "2px 2px 0 var(--ink)",
            }}
          >
            <span>Get Free Key</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* API Key Input Row */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
              Gemini API Key (গুগল এআই স্টুডিও কী):
            </label>
            {serverKeyStatus?.maskedKey && (
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                Current server: {serverKeyStatus.maskedKey} ({serverKeyStatus.source})
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fafaf9",
              border: "2px solid var(--ink)",
              borderRadius: 12,
              padding: "4px 8px 4px 14px",
              boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Lock size={16} color="var(--muted)" />
            <input
              type={showApiKey ? "text" : "password"}
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy... (Paste your Google Gemini API Key here)"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 14,
                fontFamily: "monospace",
                color: "var(--ink)",
                padding: "8px 0",
              }}
            />

            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? "Hide key" : "Show key"}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 6,
                color: "var(--muted)",
                display: "grid",
                placeItems: "center",
              }}
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {geminiApiKey && (
              <button
                type="button"
                onClick={handleCopyKey}
                title="Copy Key"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  color: "var(--muted)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {copiedKey ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
              </button>
            )}

            {geminiApiKey && (
              <button
                type="button"
                onClick={() => setGeminiApiKey("")}
                title="Clear input field"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  color: "#ef4444",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "var(--muted)" }}>
            🔒 আপনার API কী ব্রাউজারের সিকিউর লোকাল স্টোরেজ ও আপনার ফায়ারবেস প্রোফাইলে সংরক্ষিত হয়। মক টেস্ট প্রশ্ন তৈরি ও লং আনসার মূল্যায়নে স্বয়ংক্রিয়ভাবে ব্যবহার করা হবে।
          </p>
        </div>

        {/* Buttons Row: Verify, Save, Reset */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={handleVerifyApiKey}
            disabled={isVerifyingKey}
            className="btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#DBEAFE",
              border: "1.5px solid var(--ink)",
              padding: "9px 16px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "2px 2px 0 var(--ink)",
              cursor: isVerifyingKey ? "not-allowed" : "pointer",
            }}
          >
            <Zap size={16} color="#1d4ed8" />
            <span>{isVerifyingKey ? "Testing Connection..." : "Test & Verify Connection"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveApiKey}
            disabled={isSavingKey}
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 13,
              boxShadow: "2px 2px 0 var(--ink)",
              cursor: isSavingKey ? "not-allowed" : "pointer",
            }}
          >
            <Save size={16} />
            <span>{isSavingKey ? "Saving..." : "Save API Key"}</span>
          </button>

          <button
            type="button"
            onClick={handleClearApiKey}
            className="btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#fef2f2",
              border: "1.5px solid var(--ink)",
              padding: "9px 14px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 12,
              color: "#b91c1c",
              boxShadow: "2px 2px 0 var(--ink)",
              marginLeft: "auto",
            }}
          >
            <RotateCcw size={14} />
            <span>Reset to Server Default</span>
          </button>
        </div>

        {/* Verification Alert Banner */}
        {verifyResult && (
          <div
            style={{
              marginBottom: 18,
              padding: "12px 16px",
              borderRadius: 12,
              border: `1.5px solid ${verifyResult.success ? "#10b981" : "#ef4444"}`,
              background: verifyResult.success ? "#ecfdf5" : "#fef2f2",
              color: verifyResult.success ? "#065f46" : "#991b1b",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 13,
            }}
          >
            {verifyResult.success ? (
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>
                {verifyResult.success ? "✅ API Key Verified & Working!" : "❌ Verification Failed"}
              </div>
              <div style={{ fontSize: 12, marginTop: 2 }}>{verifyResult.message}</div>
              {verifyResult.model && (
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85, fontFamily: "monospace" }}>
                  Model: {verifyResult.model} {verifyResult.latencyMs ? `• Ping: ${verifyResult.latencyMs}ms` : ""}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gemini Engine / Model Preferences */}
        <div
          style={{
            background: "#f8fafc",
            border: "1.5px solid #cbd5e1",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} color="#6366f1" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
              Recommended Gemini Models (মডেল প্রেফারেন্স):
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                Mock Test &amp; Question Generation:
              </label>
              <select
                value={preferredQuizModel}
                onChange={(e) => setPreferredQuizModel(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1.5px solid var(--ink)",
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#ffffff",
                }}
              >
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fastest, High Quota)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (High Intelligence &amp; Reasoning)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                Descriptive Exam Evaluation &amp; Math Solver:
              </label>
              <select
                value={preferredMathModel}
                onChange={(e) => setPreferredMathModel(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1.5px solid var(--ink)",
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#ffffff",
                }}
              >
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-quick response)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Deep OCR &amp; Paper Analysis)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Instructions Guide */}
        <div
          style={{
            fontSize: 12,
            background: "#fffbeb",
            border: "1px dashed #f59e0b",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#92400e",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <HelpCircle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>বিনামূল্যে Gemini API Key কীভাবে তৈরি করবেন?</strong>
            <ol style={{ margin: "4px 0 0 0", paddingLeft: 18, lineHeight: 1.5 }}>
              <li>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#b45309", fontWeight: 700, textDecoration: "underline" }}
                >
                  aistudio.google.com/apikey
                </a>{" "}
                এ গিয়ে আপনার গুগল অ্যাকাউন্ট দিয়ে লগইন করুন।
              </li>
              <li>"Create API Key" বাটনে ক্লিক করে নতুন কী কপি করুন।</li>
              <li>এখানে পেস্ট করে "Test &amp; Verify Connection" চাপুন এবং পরে "Save API Key" করুন।</li>
            </ol>
          </div>
        </div>
      </div>

      {/* SECTION 0: LANGUAGE & PDF OVERLAY PREFERENCES */}
      <div
        className="panel"
        style={{
          marginBottom: 24,
          border: "2px solid var(--ink)",
          background: "#ffffff",
          boxShadow: "4px 4px 0 var(--ink)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#FEF08A",
              border: "1.5px solid var(--ink)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Languages size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontFamily: "var(--font-serif)" }}>
              Language &amp; PDF Overlay Mode
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
              Keep interface labels in crisp English while explanations, PDF summaries, and voice work in Bengali (or switch anytime)
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              Interface &amp; Explanation Language:
            </label>
            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value as "en_bn" | "en" | "bn")}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--ink)",
                fontSize: 13,
                fontWeight: 700,
                background: "#fafaf9",
              }}
            >
              <option value="en_bn">
                English UI + Bengali Explanations (Recommended)
              </option>
              <option value="en">English Only (UI + Explanations in English)</option>
              <option value="bn">Bengali + English Hybrid (বাংলা ও ইংরেজি)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              PDF Overlay, AI Summary &amp; Doubt Solution Language:
            </label>
            <select
              value={pdfOverlayLang}
              onChange={(e) => setPdfOverlayLang(e.target.value as "bn" | "en" | "bilingual")}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--ink)",
                fontSize: 13,
                fontWeight: 700,
                background: "#fafaf9",
              }}
            >
              <option value="bn">Bengali (বাংলায় পিডিএফ ওভারলে ও সমাধান)</option>
              <option value="bilingual">Bilingual (Bengali + English Terms)</option>
              <option value="en">English (Full English Solutions &amp; Notes)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1: NATURAL VOICE MENTOR & REALISTIC 3D AVATAR SETTINGS */}
      <div
        className="panel"
        style={{
          marginBottom: 24,
          border: "2px solid var(--ink)",
          background: "#ffffff",
          boxShadow: "4px 4px 0 var(--ink)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "var(--pink)",
                border: "1.5px solid var(--ink)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Volume2 size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontFamily: "var(--font-serif)" }}>
                Realistic 3D Girl/Boy Mentor &amp; Natural Voice
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                Choose your default realistic human 3D Girl or Boy mentor and natural voice cadence
              </p>
            </div>
          </div>

          <button
            onClick={handlePlayVoiceSample}
            className="btn btn-sm"
            style={{
              background: isPlayingSample ? "#fee2e2" : "var(--yellow)",
              color: isPlayingSample ? "#991b1b" : "var(--ink)",
              border: "1.5px solid var(--ink)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 800,
            }}
          >
            {isPlayingSample ? <Square size={14} /> : <Play size={14} />}
            {isPlayingSample ? "Stop Sample" : "Test Natural Voice"}
          </button>
        </div>

        {/* Mentor Selection Cards */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
            Select Default Realistic 3D Girl / Boy Mentor:
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 12,
            }}
          >
            {[
              {
                id: "anjali",
                name: "Anjali (অঞ্জলি দিদি)",
                role: "Realistic 3D Girl Co-Host",
                voice: "Warm Natural Bengali/English",
                badge: "3D Girl Model",
                bg: "#fef9c3",
              },
              {
                id: "mahi",
                name: "Mahi (মাহি দিদি)",
                role: "Biology & Literature Guide",
                voice: "Melodic Expressive Voice",
                badge: "3D Girl Model",
                bg: "#fce7f3",
              },
              {
                id: "stranger",
                name: "Study Stranger (স্ট্রেঞ্জার)",
                role: "Physics & Math Elder Brother",
                voice: "Calm Brotherly Cadence",
                badge: "3D Boy Model",
                bg: "#e0e7ff",
              },
              {
                id: "rohan",
                name: "Rohan (রোহন দাদা)",
                role: "Rapid MCQ & Exam Tricks",
                voice: "Energetic Study Buddy",
                badge: "3D Boy Model",
                bg: "#dcfce7",
              },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedVoice(m.id);
                  soundEffects.play("click");
                }}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border:
                    selectedVoice === m.id
                      ? "2.5px solid var(--ink)"
                      : "1.5px solid var(--line)",
                  background: selectedVoice === m.id ? m.bg : "#fafaf9",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: selectedVoice === m.id ? "3px 3px 0 var(--ink)" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: "#ffffff",
                      border: "1px solid var(--ink)",
                    }}
                  >
                    {m.badge}
                  </span>
                  {selectedVoice === m.id && (
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#15803d" }}>
                      ✓ Active
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
                  {m.role}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                  🎙️ {m.voice}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Speed Slider & Persona Toggle */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 18,
            paddingTop: 14,
            borderTop: "1px solid var(--line)",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>
                Natural Speech Cadence (Speed):
              </label>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                {playbackSpeed.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.35"
              step="0.05"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--ink)" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "var(--muted)",
                marginTop: 4,
              }}
            >
              <span>Calm (0.85x)</span>
              <span>Natural Human (1.04x)</span>
              <span>Fast Revision (1.35x)</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <input
                type="checkbox"
                checked={isEmotionalPersona}
                onChange={(e) => setIsEmotionalPersona(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--ink)" }}
              />
              <span>Natural Human Prosody &amp; 3D Lip-Sync Gestures</span>
            </label>
            <p style={{ margin: "4px 0 0 28px", fontSize: 11, color: "var(--muted)" }}>
              Ensures natural conversational tone, nodding, and hand gestures while speaking in Bengali and English.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: STUDENT PROFILE & BOARD PREFERENCES */}
      <div
        className="panel"
        style={{
          marginBottom: 24,
          border: "2px solid var(--ink)",
          background: "#ffffff",
          boxShadow: "4px 4px 0 var(--ink)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "var(--teal)",
              border: "1.5px solid var(--ink)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <User size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontFamily: "var(--font-serif)" }}>
              Student Profile &amp; Board Goal
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
              Your personal profile for WBCHSE Class 12 Semester 3 preparation
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              Student Name:
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Abhijit"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--ink)",
                fontSize: 14,
                background: "#fafaf9",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              District:
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--ink)",
                fontSize: 14,
                background: "#fafaf9",
              }}
            >
              <option value="Kolkata">Kolkata (কলকাতা)</option>
              <option value="North 24 Parganas">North 24 Parganas (উত্তর ২৪ পরগনা)</option>
              <option value="South 24 Parganas">South 24 Parganas (দক্ষিণ ২৪ পরগনা)</option>
              <option value="Howrah">Howrah (হাওড়া)</option>
              <option value="Hooghly">Hooghly (হুগলি)</option>
              <option value="Nadia">Nadia (নদীয়া)</option>
              <option value="Murshidabad">Murshidabad (মুর্শিদাবাদ)</option>
              <option value="Purba Bardhaman">Purba Bardhaman (পূর্ব বর্ধমান)</option>
              <option value="Paschim Medinipur">Paschim Medinipur (পশ্চিম মেদিনীপুর)</option>
              <option value="Darjeeling & Siliguri">Darjeeling &amp; Siliguri (শিলিগুড়ি)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              Target Board Goal:
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="95%+ in Sem 3 MCQs"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--ink)",
                fontSize: 14,
                background: "#fafaf9",
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: WEB APK INSTALL & 1000MB PDF LIBRARY */}
      <div
        className="panel"
        style={{
          marginBottom: 24,
          border: "2px solid var(--ink)",
          background: "#ffffff",
          boxShadow: "4px 4px 0 var(--ink)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "var(--lime)",
                border: "1.5px solid var(--ink)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Smartphone size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontFamily: "var(--font-serif)" }}>
                Web App Install &amp; 1000MB PDF Library
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                Install directly on mobile or desktop and organize up to 1000MB of PDFs into folders &amp; sub-folders
              </p>
            </div>
          </div>

          <PWAInstallButton variant="hero" />
        </div>
      </div>

      {/* SECTION 4: REAL-TIME ACCOUNT & PDF VAULT SUMMARY */}
      <div
        className="panel"
        style={{
          marginBottom: 28,
          border: "2px solid var(--ink)",
          background: "#fafaf9",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={18} color="var(--ink)" />
            <span style={{ fontWeight: 800, fontSize: 14 }}>
              Account Progress &amp; PDF Library Overview
            </span>
          </div>

          <span
            className="badge-pill"
            style={{
              background: "#dcfce7",
              color: "#166534",
              fontSize: 11,
            }}
          >
            🟢 Cloud &amp; Local Vault Synced
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1.5px solid var(--line)",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>
              Active Streak
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>
              🔥 {cloudStats.streak} Days
            </div>
          </div>
          <div
            style={{
              background: "#ffffff",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1.5px solid var(--line)",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>
              Earned XP
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>
              ⚡ {cloudStats.points} pts
            </div>
          </div>
          <div
            style={{
              background: "#ffffff",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1.5px solid var(--line)",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>
              Saved PDFs in Library
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>
              📄 {cloudStats.pdfVaultCount} Files
            </div>
          </div>
          <div
            style={{
              background: "#ffffff",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1.5px solid var(--line)",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>
              Mistake Bank Items
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>
              🧠 {cloudStats.mistakesCount} Questions
            </div>
          </div>
        </div>

        {/* Google Sign-In & Domain Setup Guide Trigger Card */}
        <div
          style={{
            marginTop: 14,
            padding: "12px 16px",
            background: "#ffffff",
            borderRadius: 14,
            border: "1.5px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "#fef08a",
                border: "1.5px solid var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Globe size={18} color="var(--ink)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "var(--ink)" }}>
                Domain &amp; Cloud Deployment Guide
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Authorized Domains, PWA Web APK, and Custom Domain setup guide
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGoogleGuideOpen(true)}
            className="btn btn-dark btn-sm"
            style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>🛠️ Open Guide</span>
          </button>
        </div>
      </div>

      {/* Floating Save Actions Bar */}
      <div
        style={{
          position: "sticky",
          bottom: 20,
          zIndex: 40,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(10px)",
          padding: "14px 20px",
          borderRadius: 20,
          border: "2px solid var(--ink)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08), 4px 4px 0 var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={20} color="#16a34a" />
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            Changes apply immediately across PDF Overlays, Voice AI, and 3D Mentors.
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => nav("/app")}
            className="btn btn-ghost btn-sm"
            style={{ border: "1.5px solid var(--line)", background: "#ffffff" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAllSettings}
            className="btn btn-dark"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 22px" }}
          >
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <GoogleSetupGuideModal
        isOpen={isGoogleGuideOpen}
        onClose={() => setIsGoogleGuideOpen(false)}
      />
    </div>
  );
}
