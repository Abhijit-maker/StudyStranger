import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone,
  Shield,
  Users,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code2,
  ExternalLink,
  X,
  PhoneCall,
  Smartphone,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";
import { AndroidPermissionService } from "../services/androidPermissionService";

interface AndroidPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPhoneNumber?: string;
  targetContactName?: string;
  onPermissionGranted?: () => void;
  onDirectCallTriggered?: (phoneNumber: string) => void;
  onOpenDialPadTriggered?: (phoneNumber: string) => void;
}

export const AndroidPermissionModal: React.FC<AndroidPermissionModalProps> = ({
  isOpen,
  onClose,
  targetPhoneNumber,
  targetContactName,
  onPermissionGranted,
  onDirectCallTriggered,
  onOpenDialPadTriggered,
}) => {
  const [currentStep, setCurrentStep] = useState<"advance_prompt" | "call_phone" | "read_contacts" | "granted_actions" | "audit_view">("advance_prompt");
  const [callPhoneGranted, setCallPhoneGranted] = useState(false);
  const [readContactsGranted, setReadContactsGranted] = useState(false);
  const [showCodeDetails, setShowCodeDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const callStatus = AndroidPermissionService.isCallPhoneGranted();
      const contactsStatus = AndroidPermissionService.isReadContactsGranted();
      setCallPhoneGranted(callStatus);
      setReadContactsGranted(contactsStatus);

      if (callStatus && contactsStatus) {
        setCurrentStep("granted_actions");
      } else if (!targetPhoneNumber) {
        // If opened upfront (like notification permission onboarding), show advance combined prompt
        setCurrentStep("advance_prompt");
      } else if (!callStatus) {
        setCurrentStep("call_phone");
      } else if (!contactsStatus) {
        setCurrentStep("read_contacts");
      } else {
        setCurrentStep("granted_actions");
      }
    }
  }, [isOpen, targetPhoneNumber]);

  if (!isOpen) return null;

  const handleGrantAll = () => {
    AndroidPermissionService.grantAllPermissions();
    setCallPhoneGranted(true);
    setReadContactsGranted(true);
    setCurrentStep("granted_actions");
    onPermissionGranted?.();
  };

  const handleGrantCallPhone = () => {
    AndroidPermissionService.setPermissionStatus("CALL_PHONE", "granted");
    AndroidPermissionService.requestNativeAndroidPermissions();
    setCallPhoneGranted(true);
    if (!readContactsGranted) {
      setCurrentStep("read_contacts");
    } else {
      setCurrentStep("granted_actions");
      onPermissionGranted?.();
    }
  };

  const handleDenyCallPhone = () => {
    AndroidPermissionService.setPermissionStatus("CALL_PHONE", "denied");
    setCallPhoneGranted(false);
    onClose();
  };

  const handleGrantReadContacts = () => {
    AndroidPermissionService.setPermissionStatus("READ_CONTACTS", "granted");
    AndroidPermissionService.requestNativeAndroidPermissions();
    setReadContactsGranted(true);
    setCurrentStep("granted_actions");
    onPermissionGranted?.();
  };

  const handleDenyReadContacts = () => {
    AndroidPermissionService.setPermissionStatus("READ_CONTACTS", "denied");
    setReadContactsGranted(false);
    if (callPhoneGranted) {
      setCurrentStep("granted_actions");
    } else {
      onClose();
    }
  };

  const handleExecuteDirectCall = async (phoneToCall?: string) => {
    const num = phoneToCall || targetPhoneNumber || "+919007012345";
    await AndroidPermissionService.makeDirectCall(num);
    onDirectCallTriggered?.(num);
    onClose();
  };

  const handleExecuteOpenDialPad = async (phoneToCall?: string) => {
    const num = phoneToCall || targetPhoneNumber || "";
    await AndroidPermissionService.openDialPad(num);
    onOpenDialPadTriggered?.(num);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          className="relative w-full max-w-[390px] bg-white border border-stone-250 rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex flex-col animate-fade-in"
        >
          {/* Top Header / Android Badge */}
          <div className="p-4 bg-gradient-to-r from-orange-50 via-stone-50 to-stone-100 border-b border-stone-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF7A30]">
                <Smartphone size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wider text-stone-900 uppercase">Android Runtime</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 font-sans">
                  নিরাপদ কল ও কন্টাক্ট অ্যাক্সেস কন্ট্রোল
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 hover:text-stone-850 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body content based on step */}
          <div className="p-6 flex flex-col gap-5 bg-white">
            {/* ADVANCE ONBOARDING PROMPT: Advance Combined Permission Request (like notifications) */}
            {currentStep === "advance_prompt" && (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative animate-bounce-slow">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-50 via-orange-50 to-emerald-50 border border-stone-200 text-stone-800 flex items-center justify-center shadow-md">
                    <PhoneCall size={30} className="text-orange-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    ✓
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      অগ্রিম পারমিশন সেটআপ
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 leading-snug">
                    ফোন কল ও কন্টাক্ট পারমিশন সক্রিয় করুন
                  </h3>
                  <p className="text-xs text-stone-550 leading-relaxed mt-1">
                    নোটিফিকেশন পারমিশনের মতোই সরাসরি কল ও কন্টাক্ট দেখার জন্য Android Runtime Permissions আগে থেকেই সক্রিয় করে রাখুন।
                  </p>
                </div>

                {/* Permissions Breakdown Cards */}
                <div className="w-full flex flex-col gap-2 text-left">
                  <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                      <PhoneCall size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">Direct Phone Call</span>
                        <span className="text-[9px] font-mono text-stone-400">CALL_PHONE</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                        AI মেন্টর মাহি বা স্টাডি ফ্রেন্ডদের এক ক্লিকেই সরাসরি ফোন কল করার সুবিধা।
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <Users size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">Contacts Access</span>
                        <span className="text-[9px] font-mono text-stone-400">READ_CONTACTS</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                        ফোনের কন্টাক্ট বুক থেকে সহপাঠী ও টিচারদের নম্বর সহজে নির্বাচন করার সুবিধা।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Zero Knowledge Callout */}
                <div className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-left text-[11px] text-emerald-800">
                  <Lock size={14} className="shrink-0 text-emerald-600" />
                  <span>🔒 সম্পূর্ণ জিরো-নলেজ সিকিউরিটি — কোনো ডেটা সার্ভারে যায় না।</span>
                </div>

                {/* Buttons */}
                <div className="w-full flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleGrantAll}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>সব পারমিশন সক্রিয় করুন (ALLOW ALL)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCurrentStep("call_phone")}
                      className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-850 font-medium text-xs rounded-xl transition-all cursor-pointer border border-stone-200"
                    >
                      ধাপে ধাপে অনুমোদন
                    </button>
                    <button
                      onClick={() => {
                        AndroidPermissionService.setPromptedInitialPermission();
                        onClose();
                      }}
                      className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-550 font-medium text-xs rounded-xl transition-all cursor-pointer border border-stone-200"
                    >
                      পরে করব (Later)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: CALL_PHONE Permission */}
            {currentStep === "call_phone" && (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-150 text-indigo-600 flex items-center justify-center shadow-xs">
                  <PhoneCall size={30} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest">
                    android.permission.CALL_PHONE
                  </span>
                  <h3 className="text-base font-bold text-stone-900 leading-snug">
                    Study Stranger-কে সরাসরি ফোন কল করার অনুমতি দেবেন?
                  </h3>
                  <p className="text-xs text-stone-550 leading-relaxed mt-1">
                    অনুমতি দিলে অ্যাপ থেকে সরাসরি মেন্টর মাহি বা সহপাঠীদের কল (Direct Call) করতে পারবেন।
                  </p>
                </div>

                {targetPhoneNumber && (
                  <div className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-left">
                    <span className="text-[11px] text-stone-500">টার্গেট নম্বর:</span>
                    <span className="text-xs font-mono font-bold text-orange-500">{targetPhoneNumber}</span>
                  </div>
                )}

                <div className="w-full flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleGrantCallPhone}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>ALLOW (অনুমতি দিন)</span>
                  </button>
                  <button
                    onClick={handleDenyCallPhone}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 font-medium text-xs rounded-xl transition-all cursor-pointer border border-stone-200"
                  >
                    DON'T ALLOW (অনুমতি দেবেন না)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: READ_CONTACTS Permission */}
            {currentStep === "read_contacts" && (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-150 text-emerald-600 flex items-center justify-center shadow-xs">
                  <Users size={30} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">
                    android.permission.READ_CONTACTS
                  </span>
                  <h3 className="text-base font-bold text-stone-900 leading-snug">
                    Study Stranger-কে কন্টাক্ট বুক দেখার অনুমতি দেবেন?
                  </h3>
                  <p className="text-xs text-stone-550 leading-relaxed mt-1">
                    অনুমতি দিলে ডিভাইসের কন্টাক্ট লিস্ট থেকে সহজেই সহপাঠী ও শিক্ষকদের নম্বর সিলেক্ট করতে পারবেন।
                  </p>
                </div>

                <div className="w-full flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleGrantReadContacts}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>ALLOW ACCESS (কন্টাক্ট অনুমতি দিন)</span>
                  </button>
                  <button
                    onClick={handleDenyReadContacts}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 font-medium text-xs rounded-xl transition-all cursor-pointer border border-stone-200"
                  >
                    DON'T ALLOW (অনুমতি দেবেন না)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: GRANTED ACTIONS (Direct Call vs Dial Pad) */}
            {currentStep === "granted_actions" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-in">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Android Permissions সক্রিয়</h4>
                    <p className="text-[10px] text-stone-500">
                      CALL_PHONE ও READ_CONTACTS অনুমতি সফলভাবে দেওয়া হয়েছে।
                    </p>
                  </div>
                </div>

                {/* Target details or General Success info */}
                {targetPhoneNumber ? (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-stone-400 uppercase">কল করার লক্ষ্য:</span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-900">
                        {targetContactName || "Mahi (WBCHSE Mentor)"}
                      </span>
                      <span className="text-xs font-mono font-bold text-orange-500">
                        {targetPhoneNumber}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col gap-1 text-left">
                    <span className="text-xs font-bold text-stone-900">সব সুবিধা এখন সক্রিয়:</span>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      যে কোনো সময় মেন্টর বা সহপাঠীদের এক ক্লিকে কল করতে পারেন অথবা কন্টাক্ট বুক থেকে নম্বর বেছে নিতে পারবেন।
                    </p>
                  </div>
                )}

                {/* Action Buttons: Direct Call vs Dial Pad */}
                <div className="flex flex-col gap-2.5">
                  {targetPhoneNumber ? (
                    <button
                      onClick={() => handleExecuteDirectCall()}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Phone size={16} className="fill-white" />
                      <span>সরাসরি কল করুন (Intent.ACTION_CALL)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleExecuteOpenDialPad()}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Smartphone size={16} />
                      <span>ডায়াল প্যাড টেস্ট করুন (Intent.ACTION_DIAL)</span>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>সম্পন্ন (Done)</span>
                  </button>
                </div>

                {/* Quick Toggle to Audit */}
                <button
                  onClick={() => setCurrentStep("audit_view")}
                  className="text-[11px] text-stone-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-1 mt-1 cursor-pointer"
                >
                  <Shield size={13} className="text-orange-500" />
                  <span>জিরো-নলেজ প্রাইভেসি ও ওপেন সোর্স অডিট দেখুন</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            )}

            {/* STEP 4: PRIVACY & OPEN SOURCE AUDIT */}
            {currentStep === "audit_view" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Shield size={16} className="text-emerald-500" />
                    100% Zero-Knowledge Security
                  </span>
                  <button
                    onClick={() => setCurrentStep("granted_actions")}
                    className="text-[10px] text-orange-500 hover:underline cursor-pointer"
                  >
                    ফিরে যান
                  </button>
                </div>

                <div className="space-y-2 text-left">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl flex items-start gap-2">
                    <Lock size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
                      <strong>ডেভেলপারও জানতে পারবে না:</strong> আপনার কন্টাক্ট লিস্ট বা ফোন কল সম্পূর্ণ আপনার ডিভাইসেই থাকে। কোনো ডেটা সার্ভারে পাঠানো হয় না।
                    </p>
                  </div>

                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 text-[10px] font-mono text-stone-700">
                    <div className="flex justify-between">
                      <span className="text-stone-400">ডাটাবেজ আপলোড:</span>
                      <span className="text-emerald-600 font-bold">0 Bytes (Zero)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">ডেভেলপার ভিজিবিলিটি:</span>
                      <span className="text-emerald-600 font-bold">0% (সম্পূর্ণ গোপন)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">লোকাল স্টোরেজ:</span>
                      <span className="text-blue-600 font-bold">Client-Sandbox Only</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => setShowCodeDetails(!showCodeDetails)}
                      className="w-full py-1.5 text-[10px] font-mono text-stone-550 hover:text-stone-850 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                    >
                      <Code2 size={13} />
                      <span>{showCodeDetails ? "কোড স্ন্যাপশট লুকান" : "AndroidManifest.xml কোড দেখুন"}</span>
                    </button>

                    {showCodeDetails && (
                      <div className="mt-2 p-2.5 bg-stone-950 border border-stone-850 rounded-xl text-[9px] font-mono text-stone-200 overflow-x-auto leading-relaxed">
                        <div className="text-emerald-400">&lt;!-- AndroidManifest.xml --&gt;</div>
                        <div>&lt;uses-permission android:name="android.permission.READ_CONTACTS" /&gt;</div>
                        <div>&lt;uses-permission android:name="android.permission.CALL_PHONE" /&gt;</div>
                        <div className="text-indigo-400 mt-1">// Intent.ACTION_CALL for direct dial:</div>
                        <div>val intent = Intent(Intent.ACTION_CALL, Uri.parse("tel:$num"))</div>
                        <div className="text-indigo-400 mt-1">// Intent.ACTION_DIAL for dial pad:</div>
                        <div>val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$num"))</div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep("granted_actions")}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer mt-1"
                >
                  বুঝেছি (OK)
                </button>
              </div>
            )}

            {/* Bottom Security Assurance Tag */}
            {currentStep !== "audit_view" && (
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-400">
                <span className="flex items-center gap-1 font-bold">
                  <Lock size={11} className="text-emerald-500 animate-pulse" />
                  জিরো-নলেজ ওপেন সোর্স সিকিউরড
                </span>
                <button
                  onClick={() => setCurrentStep("audit_view")}
                  className="text-orange-500 hover:text-orange-600 hover:underline cursor-pointer font-bold"
                >
                  প্রাইভেসি অডিট
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
