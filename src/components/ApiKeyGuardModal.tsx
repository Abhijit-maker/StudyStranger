import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Key, AlertTriangle, Clock, ExternalLink, CheckCircle, Sparkles, X } from "lucide-react";
import { soundEffects } from "../services/soundEffectsService";

interface ApiKeyGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  isVoiceTrialExpired?: boolean;
  onKeySaved?: (key: string) => void;
}

export const ApiKeyGuardModal: React.FC<ApiKeyGuardModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  isVoiceTrialExpired = false,
  onKeySaved,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (!isOpen) return null;

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKeyInput.trim();
    if (!cleanKey) {
      setSaveError("দয়া করে একটি সঠিক Gemini API Key লিখুন।");
      return;
    }
    if (cleanKey.length < 20) {
      setSaveError("API Key সাধারণত ৩৯ অক্ষরের হয় (e.g. AIzaSy...)");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      soundEffects.play("click");
      // Save locally
      localStorage.setItem("gemini_api_key", cleanKey);
      localStorage.setItem("custom_gemini_api_key", cleanKey);
      localStorage.setItem("user_gemini_api_key", cleanKey);
      localStorage.setItem("ss-gemini-key", cleanKey);

      // Save to server
      await fetch("/api/settings/save-apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: cleanKey }),
      });

      setSaveSuccess(true);
      soundEffects.play("success");
      onKeySaved?.(cleanKey);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setSaveError(err.message || "API Key সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-3 border-[#18181b] shadow-[8px_8px_0px_#18181b] p-6 sm:p-7 overflow-hidden">
        {/* Top colored accent bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-3 ${
            isVoiceTrialExpired ? "bg-red-500" : "bg-[#FFD666]"
          }`}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={() => {
            soundEffects.play("click");
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border-2 border-[#18181b] bg-white flex items-center justify-center text-[#18181b] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon + Titles */}
        <div className="flex items-start gap-3.5 mb-4 mt-2">
          <div
            className={`w-12 h-12 rounded-2xl border-2 border-[#18181b] flex items-center justify-center shadow-[3px_3px_0px_#18181b] shrink-0 ${
              isVoiceTrialExpired ? "bg-[#FEE2E2] text-red-600" : "bg-[#FEF08A] text-[#18181b]"
            }`}
          >
            {isVoiceTrialExpired ? (
              <Clock className="w-6 h-6 animate-pulse" />
            ) : (
              <Key className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#18181b] text-white text-[10px] font-black uppercase tracking-wider mb-1">
              {isVoiceTrialExpired ? "Trial Expired" : "Gemini API Key Required"}
            </div>
            <h3 className="font-serif font-black text-xl text-[#18181b] leading-tight">
              {title || (isVoiceTrialExpired
                ? "আপনার ৫ মিনিটের ফ্রি ভয়েস সেশন শেষ হয়েছে!"
                : "টুলটি ব্যবহার করতে API Key প্রদান করুন")}
            </h3>
          </div>
        </div>

        {/* Message body */}
        <p className="text-xs sm:text-sm text-[#18181b]/80 font-medium leading-relaxed mb-5">
          {description || (isVoiceTrialExpired
            ? "ভয়েস মেন্টরের ৫ মিনিটের ফ্রি ট্রায়াল শেষ হয়েছে। আনলিমিটেড সময় কথা বলতে এবং অন্যান্য সমস্ত AI ফিচার ফ্রিতে ব্যবহার করতে অনুগ্রহ করে সেটিংস-এ গিয়ে আপনার ফ্রি Gemini API Key প্রদান করুন।"
            : "এই AI টুলটি সক্রিয় করতে আপনার নিজস্ব Google Gemini API Key প্রয়োজন। আপনি সম্পূর্ণ বিনামূল্যে Google থেকে ব্যক্তিগত API Key নিতে পারেন।")}
        </p>

        {/* Fast inline Key input form */}
        <form onSubmit={handleSaveKey} className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-black text-[#18181b] mb-1.5">
              🔑 এখনই Gemini API Key পেস্ট করুন:
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  if (saveError) setSaveError("");
                }}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#18181b] bg-[#FAFAFA] font-mono text-xs text-[#18181b] focus:outline-none focus:bg-white shadow-[2px_2px_0px_#18181b]"
              />
            </div>
            {saveError && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 mt-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mt-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>✅ API Key সফলভাবে সেভ হয়েছে! টুলটি সক্রিয় হচ্ছে...</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving || saveSuccess}
            className="w-full py-2.5 px-4 rounded-xl bg-[#18181b] text-white text-xs font-black border-2 border-[#18181b] shadow-[3px_3px_0px_#FF7A30] hover:bg-[#27272a] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span>যাচাই ও সংরক্ষণ করা হচ্ছে...</span>
            ) : saveSuccess ? (
              <span>সফলভাবে যুক্ত হয়েছে!</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#FFD666]" />
                <span>API Key সংরক্ষণ করুন ও চালু করুন</span>
              </>
            )}
          </button>
        </form>

        {/* Actions / Guide */}
        <div className="pt-3 border-t-2 border-[#18181b]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <Link
            to="/settings"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#FEF08A] text-[#18181b] font-black border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] hover:bg-[#FDE047] transition-all no-underline"
          >
            ⚙️ Settings & API Key পেজে যান
          </Link>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[#18181b]/70 hover:text-[#18181b] font-bold no-underline"
          >
            <span>ফ্রি API Key পান</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
