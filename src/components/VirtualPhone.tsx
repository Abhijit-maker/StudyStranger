import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  PhoneOff, 
  X, 
  Volume2, 
  VolumeX, 
  Delete, 
  User, 
  ChevronRight,
  Clock,
  Shield,
  Plus,
  Search,
  Users,
  Smartphone,
  CheckSquare,
  Settings,
  Eye,
  Check
} from "lucide-react";
import { CharacterType } from "../services/liveService";
import { AndroidPermissionService } from "../services/androidPermissionService";

interface VirtualDialerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacter: CharacterType;
  characterAvatars: Record<CharacterType, string>;
  onInitiateCall: (phoneNumber: string) => void;
}

export const VirtualDialer: React.FC<VirtualDialerProps> = ({
  isOpen,
  onClose,
  selectedCharacter,
  characterAvatars,
  onInitiateCall,
}) => {
  const [number, setNumber] = useState("");
  const [permissionStep, setPermissionStep] = useState<"calls" | "contacts" | "default_dialer" | "draw_overlay" | "perm_call_log" | null>(null);
  const [showContactsList, setShowContactsList] = useState(false);
  const [showTruecallerSettings, setShowTruecallerSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  const defaultContacts = [
    { name: "Mahi WBCHSE Mentor", phone: "+919007012345" },
    { name: "The Stranger Team", phone: "+15550192834" },
    { name: "Anjali (Reproduction Peer)", phone: "+919830155678" },
    { name: "Zoya Classmate", phone: "+919433099121" },
    { name: "Rohan Group Coordinator", phone: "+919123456789" },
    { name: "Ishani (Bengali Verse Co-Author)", phone: "+919051065432" },
  ];

  const [contacts, setContacts] = useState<{ name: string; phone: string }[]>(() => {
    try {
      const saved = localStorage.getItem("custom_contacts");
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultContacts;
  });

  useEffect(() => {
    localStorage.setItem("custom_contacts", JSON.stringify(contacts));
  }, [contacts]);

  const checkNextPermission = () => {
    const callsGranted = localStorage.getItem("perm_calls") === "granted";
    const contactsGranted = localStorage.getItem("perm_contacts") === "granted";
    const defaultDialerGranted = localStorage.getItem("perm_default_dialer") === "granted";
    const drawOverlayGranted = localStorage.getItem("perm_draw_overlay") === "granted";
    const callLogGranted = localStorage.getItem("perm_call_log") === "granted";

    if (!callsGranted) {
      setPermissionStep("calls");
    } else if (!contactsGranted) {
      setPermissionStep("contacts");
    } else if (!defaultDialerGranted) {
      setPermissionStep("default_dialer");
    } else if (!drawOverlayGranted) {
      setPermissionStep("draw_overlay");
    } else if (!callLogGranted) {
      setPermissionStep("perm_call_log");
    } else {
      setPermissionStep(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkNextPermission();
    }
  }, [isOpen]);

  const grantCalls = () => {
    localStorage.setItem("perm_calls", "granted");
    AndroidPermissionService.setPermissionStatus("CALL_PHONE", "granted");
    checkNextPermission();
  };

  const grantContacts = async () => {
    localStorage.setItem("perm_contacts", "granted");
    AndroidPermissionService.setPermissionStatus("READ_CONTACTS", "granted");
    if ('contacts' in navigator && 'getProperties' in (navigator as any).contacts) {
      try {
        await (navigator as any).contacts.getProperties();
      } catch (e1) {
        console.warn(e1);
      }
    }
    checkNextPermission();
  };

  const grantDefaultDialer = () => {
    localStorage.setItem("perm_default_dialer", "granted");
    checkNextPermission();
  };

  const grantDrawOverlay = () => {
    localStorage.setItem("perm_draw_overlay", "granted");
    checkNextPermission();
  };

  const grantCallLog = () => {
    localStorage.setItem("perm_call_log", "granted");
    checkNextPermission();
  };

  const resetAllPermissions = () => {
    AndroidPermissionService.resetPermissions();
    localStorage.removeItem("perm_calls");
    localStorage.removeItem("perm_contacts");
    localStorage.removeItem("perm_default_dialer");
    localStorage.removeItem("perm_draw_overlay");
    localStorage.removeItem("perm_call_log");
    checkNextPermission();
  };

  const handleOpenContactPicker = async () => {
    if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
      try {
        const props = ['name', 'tel'];
        const selection = await (navigator as any).contacts.select(props, { multiple: false });
        if (selection && selection.length > 0) {
          const selectedNum = selection[0].tel?.[0] || "";
          setNumber(selectedNum.replace(/\s+/g, ''));
          return;
        }
      } catch (err) {
        console.warn("Device contact selection skipped or unsupported by nested sandbox frame:", err);
      }
    }
    setShowContactsList(true);
  };

  const handleAddContact = () => {
    if (newContactName.trim() && newContactPhone.trim()) {
      setContacts(prev => [...prev, { name: newContactName.trim(), phone: newContactPhone.trim() }]);
      setNewContactName("");
      setNewContactPhone("");
    }
  };

  const handleDeleteContact = (phoneToDelete: string) => {
    setContacts(prev => prev.filter(c => c.phone !== phoneToDelete));
  };

  const handleKeyPress = (val: string) => {
    if (number.length < 15) {
      setNumber(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (number.trim().length >= 4) {
      onInitiateCall(number);
      onClose();
    }
  };

  const keys = [
    { num: "1", sub: "" },
    { num: "2", sub: "A B C" },
    { num: "3", sub: "D E F" },
    { num: "4", sub: "G H I" },
    { num: "5", sub: "J K L" },
    { num: "6", sub: "M N O" },
    { num: "7", sub: "P Q R S" },
    { num: "8", sub: "T U V" },
    { num: "9", sub: "W X Y Z" },
    { num: "*", sub: "" },
    { num: "0", sub: "+" },
    { num: "#", sub: "" },
  ];

  if (!isOpen) return null;

  const characterNames: Record<CharacterType, string> = {
    stranger: "The Stranger",
    anjali: "Anjali",
    zoya: "Zoya",
    khud: "Khud",
    rohan: "Rohan",
    ishani: "Ishani",
    mahi: "Mahi"
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        {permissionStep === "calls" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-full max-w-[320px] bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center z-[110]"
          >
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
              <Smartphone size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider">android.permission.CALL_PHONE</span>
              <h3 className="text-white font-bold text-sm">মেক অ্যান্ড ম্যানেজ কল পারমিশন</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Allow <span className="text-[#EF6D2F] font-bold">Study Stranger</span> to make and manage phone calls on your device?
              </p>
              <div className="mt-1 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] text-indigo-300 text-left">
                🔒 <strong>100% জিরো-নলেজ:</strong> কোনো কল হিস্ট্রি বা অডিও ডেটা সার্ভারে সংরক্ষণ হয় না। ডেভেলপার নিজেও এটি দেখতে পারবে না।
              </div>
            </div>
            <div className="w-full h-px bg-white/5 my-1" />
            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={grantCalls}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                id="grant-calls-btn"
              >
                ALLOW (অনুমতি দিন)
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                DENY (বাতিল করুন)
              </button>
            </div>
          </motion.div>
        )}

        {permissionStep === "contacts" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-full max-w-[320px] bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center z-[110]"
          >
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">android.permission.READ_CONTACTS</span>
              <h3 className="text-white font-bold text-sm">ডিভাইস কন্টাক্ট বুক পারমিশন</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Allow <span className="text-[#EF6D2F] font-bold">Study Stranger</span> to read your contacts to quickly sync device phone numbers?
              </p>
              <div className="mt-1 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-300 text-left">
                🔒 <strong>100% জিরো-নলেজ ওপেন সোর্স:</strong> আপনার কন্টাক্ট সম্পূর্ণ আপনার ডিভাইসে সুরক্ষিত থাকবে। ডেভেলপার বা কোনো সার্ভার আপনার কন্টাক্ট দেখতে পাবে না।
              </div>
            </div>
            <div className="w-full h-px bg-white/5 my-1" />
            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={grantContacts}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                id="grant-contacts-btn"
              >
                ALLOW ACCESS (কন্টাক্ট অনুমতি দিন)
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                DENY (বাতিল করুন)
              </button>
            </div>
          </motion.div>
        )}

        {permissionStep === "default_dialer" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-full max-w-[320px] bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center z-[110]"
          >
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div className="flex flex-col gap-1 w-full text-center">
              <h3 className="text-white font-bold text-sm">ডিফল্ট ফোন অ্যাপ সিলেক্ট করুন</h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-3">
                Change Phone application to route real live carrier dials seamlessly? (টেলিফোন অ্যাপ পরিবর্তন করুন)
              </p>
              
              <div className="flex flex-col gap-2.5 w-full text-left">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-zinc-650 flex items-center justify-center p-0.5">
                      <div className="w-full h-full bg-transparent rounded-full" />
                    </div>
                    <span className="text-xs text-zinc-405 font-medium font-sans">System Default (সিস্টেম ডায়ালার)</span>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center p-0.5">
                      <div className="w-full h-full bg-blue-500 rounded-full" />
                    </div>
                    <span className="text-xs text-blue-400 font-extrabold font-sans">STUDY STRANGER (ট্রু-কলার আইডি)</span>
                  </div>
                  <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-bold px-1.5 py-0.5 rounded-full uppercase">RECOMMENDED</span>
                </div>
              </div>
            </div>
            <div className="w-full h-px bg-white/5 my-1" />
            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={grantDefaultDialer}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                id="grant-default-dialer-btn"
              >
                SET AS DEFAULT (ডিফল্ট হিসেবে সেট করুন)
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                CANCEL (বাতিল করুন)
              </button>
            </div>
          </motion.div>
        )}

        {permissionStep === "draw_overlay" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-full max-w-[320px] bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center z-[110]"
          >
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center">
              <CheckSquare size={24} />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <h3 className="text-white font-bold text-sm">ডিসপ্লে ওভার আদার অ্যাপস (Overlay)</h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-1">
                Allow Study Stranger to display windows over other apps for real-time caller overlays.
              </p>
              
              {/* Simulated System Settings Overlay Pane */}
              <div className="bg-zinc-950 border border-white/5 rounded-xl p-3 text-left flex flex-col gap-2">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block border-b border-white/5 pb-1.5 font-sans">MOCKED SYSTEM SETTINGS / ড্র ওভার অ্যাপস</span>
                
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-zinc-405 font-sans">Chrome Browser</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">ALLOWED</span>
                </div>
                
                <div className="flex items-center justify-between text-xs py-1 border-t border-white/5 pt-1.5">
                  <div className="flex flex-col">
                    <span className="text-white font-bold font-sans">STUDY STRANGER</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Truecaller Identification Overlay</span>
                  </div>
                  {/* Toggle Switch */}
                  <button 
                    onClick={grantDrawOverlay}
                    className="w-9 h-5 rounded-full bg-zinc-700 p-0.5 transition-all flex items-center justify-start cursor-pointer hover:bg-blue-600"
                    id="grant-draw-overlay-toggle"
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-0" />
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full h-px bg-white/5 my-1" />
            <p className="text-[10px] text-zinc-500 italic">
              *ভিডিও ক্লাস বা স্টাডি রিং করার সময় স্ক্রিনে পপআপ পেতে এই অপশনটি চালু করুন।
            </p>
          </motion.div>
        )}

        {permissionStep === "perm_call_log" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-full max-w-[320px] bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center z-[110]"
          >
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center">
              <Phone size={24} className="fill-transparent" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-white font-bold text-sm">কল লগ এবং ফোন ডায়াল স্টেট পারমিশন</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Allow <span className="text-[#EF6D2F] font-bold">Study Stranger</span> to read your phone call logs to identify unknown students and mentors inside Truecaller database?
              </p>
            </div>
            <div className="w-full h-px bg-white/5 my-1" />
            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={grantCallLog}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                id="grant-call-log-btn"
              >
                ALLOW (অনুমতি দিন)
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                DENY (বাতিল করুন)
              </button>
            </div>
          </motion.div>
        )}

        {showContactsList && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute w-full max-w-[340px] bg-zinc-950 border border-white/10 rounded-[32px] overflow-hidden p-6 shadow-2xl flex flex-col gap-4 z-[120]"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-orange-500" />
                <span className="text-white text-sm font-bold">কন্টাক্ট বুক (Device Contacts)</span>
              </div>
              <button 
                onClick={() => setShowContactsList(false)}
                className="p-1.5 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নাম বা মোবাইল নম্বর খুঁজুন..."
                className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/30 transition-all font-mono"
              />
            </div>

            <div className="flex-1 max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin">
              {contacts
                .filter(c => 
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  c.phone.includes(searchQuery)
                )
                .map((c, idx) => (
                  <div 
                    key={`contact-${c.phone}-${idx}`}
                    className="flex items-center justify-between p-2 bg-white/5 hover:bg-[#EF6D2F]/10 border border-white/5 rounded-xl transition-all"
                  >
                    <button
                      onClick={() => {
                        setNumber(c.phone);
                        setShowContactsList(false);
                      }}
                      className="flex-1 flex flex-col items-start text-left cursor-pointer"
                    >
                      <span className="text-xs font-bold text-white transition-colors">{c.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{c.phone}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteContact(c.phone)}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-[10px] font-mono font-black text-orange-400 uppercase">নতুন কন্টাক্ট অ্যাড করুন</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="নাম"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none placeholder-zinc-650"
                />
                <input
                  type="text"
                  placeholder="নম্বর"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none font-mono placeholder-zinc-650"
                />
              </div>
              <button
                onClick={handleAddContact}
                className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-extrabold tracking-wider uppercase transition-all cursor-pointer"
              >
                সেভ করুন (Save)
              </button>
            </div>
          </motion.div>
        )}

        {showTruecallerSettings && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute w-full max-w-[340px] bg-zinc-950 border border-white/10 rounded-[32px] overflow-hidden p-6 shadow-2xl flex flex-col gap-4 z-[120]"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-blue-500 fill-blue-500/20 animate-pulse" />
                <span className="text-white text-sm font-bold">ট্রু-কলার ইন্টিগ্রেশন সেটিংস</span>
              </div>
              <button 
                onClick={() => setShowTruecallerSettings(false)}
                className="p-1.5 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Feature Switch 1: Default Dialer */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Default Phone App</span>
                  <span className="text-[9px] text-zinc-500">Study Stranger is your primary dialer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-blue-400 font-mono font-bold">ACTIVE</span>
                  <div className="w-8 h-4 rounded-full bg-blue-600 p-0.5 flex items-center justify-end">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              {/* Feature Switch 2: Display Over other apps */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Incoming Caller Overlay</span>
                  <span className="text-[9px] text-zinc-500">Displays real-time AI status popup</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-blue-400 font-mono font-bold">ACTIVE</span>
                  <div className="w-8 h-4 rounded-full bg-blue-600 p-0.5 flex items-center justify-end">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              {/* Feature Switch 3: Call Logs access */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Access Call Logs</span>
                  <span className="text-[9px] text-zinc-500">Read & save dial list automatically</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-blue-400 font-mono font-bold font-sans">GRANTED</span>
                  <div className="w-8 h-4 rounded-full bg-blue-600 p-0.5 flex items-center justify-end">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-white/5 my-1" />

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 text-center leading-relaxed">
                  এখানে ট্রু-কলার মোডের সকল পারমিশন রেজিস্টার করা আছে। পুনরায় পারমিশন টেস্ট করতে চাইলে রিসেট করুন।
                </span>
                <button
                  onClick={() => {
                    resetAllPermissions();
                    setShowTruecallerSettings(false);
                  }}
                  className="w-full py-2 bg-rose-600/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-extrabold transition-all cursor-pointer hover:text-white"
                >
                  পারমিশন রিসেট করুন (Reset Setup Flow)
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {!permissionStep && !showContactsList && !showTruecallerSettings && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[360px] bg-zinc-950 border border-white/10 rounded-[32px] overflow-hidden p-6 shadow-2xl flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={characterAvatars[selectedCharacter]} 
                    alt={selectedCharacter}
                    className="w-10 h-10 rounded-full border-2 border-orange-500/50" 
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-mono tracking-widest text-[#EF6D2F] font-black uppercase flex items-center gap-1">
                    DIRECT CALL 
                    <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 py-0.2 rounded font-sans flex items-center gap-0.5 font-bold" title="Truecaller Overlay Mode Active">
                      <Shield size={7} className="fill-blue-400" />
                      TRU
                    </span>
                  </span>
                  <button 
                    onClick={() => setShowTruecallerSettings(true)}
                    className="text-white text-sm font-bold hover:text-blue-400 transition-colors flex items-center gap-1 group text-left"
                    title="Open Truecaller Settings"
                  >
                    <span>{characterNames[selectedCharacter]} Dialing</span>
                    <Settings size={12} className="text-zinc-500 group-hover:text-blue-400 transition-colors animate-spin" style={{ animationDuration: '6s' }} />
                  </button>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Bengali Assist */}
            <div className="text-center">
              <p className="text-[11px] text-zinc-400 font-medium">
                তোমার মেন্টর মাহি বা স্ট্রেঞ্জারকে কল করতে নম্বর ডায়াল করো:
              </p>
            </div>

            {/* Screen Display */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-center min-h-[72px] relative group select-none">
              <div className="flex items-center justify-between w-full">
                <span className="text-white text-xl font-mono font-bold tracking-widest text-left block overflow-x-auto whitespace-nowrap scrollbar-none flex-1">
                  {number || <span className="text-zinc-650">Enter Number...</span>}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleOpenContactPicker}
                    className="p-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/25 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                    title="Open Device Contacts"
                  >
                    <Users size={16} />
                  </button>
                  {number && (
                    <button 
                      onClick={handleBackspace}
                      className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Delete size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Grid of Keypad Keys */}
            <div className="grid grid-cols-3 gap-3">
              {keys.map((k) => (
                <motion.button
                  key={k.num}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleKeyPress(k.num)}
                  className="h-14 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex flex-col items-center justify-center transition-all group cursor-pointer"
                >
                  <span className="text-white text-lg font-bold font-mono group-hover:scale-110 transition-transform">{k.num}</span>
                  {k.sub && <span className="text-[8px] text-zinc-500 font-mono font-bold block">{k.sub}</span>}
                </motion.button>
              ))}
            </div>

            {/* Lower Dialer Buttons */}
            <div className="flex flex-col items-center gap-3 mt-1 pb-1">
              <div className="flex items-center justify-center gap-4">
                {/* Intent.ACTION_DIAL Button */}
                <button
                  type="button"
                  onClick={() => {
                    AndroidPermissionService.openDialPad(number);
                  }}
                  title="Open Phone's System Dial Pad (Intent.ACTION_DIAL)"
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white rounded-2xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Smartphone size={14} className="text-blue-400" />
                  <span>ACTION_DIAL</span>
                </button>

                {/* Direct Call Button (Intent.ACTION_CALL) */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleCall}
                  disabled={number.trim().length < 4}
                  title="Direct Call (Intent.ACTION_CALL)"
                  className="w-16 h-16 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Phone size={24} className="fill-white" />
                </motion.button>

                {/* Contact Picker Button */}
                <button
                  type="button"
                  onClick={handleOpenContactPicker}
                  title="Pick Contact (Intent.ACTION_PICK / READ_CONTACTS)"
                  className="px-3.5 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-2xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Users size={14} />
                  <span>কন্টাক্ট</span>
                </button>
              </div>

              {/* Zero-Knowledge Privacy Guarantee Note */}
              <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-sans">
                <Shield size={10} className="text-emerald-400 shrink-0" />
                <span>100% জিরো-নলেজ: কোনো কন্টাক্ট বা কল হিস্ট্রি সার্ভারে আপলোড হয় না</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

interface ActiveCallScreenProps {
  activeCall: { phoneNumber: string; status: "dialing" | "ringing" | "connected" | "disconnected" } | null;
  selectedCharacter: CharacterType;
  characterAvatars: Record<CharacterType, string>;
  onDisconnect: () => void;
  callHistory: string[];
  onInitiateCall: (phoneNumber: string) => void;
}

export const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({
  activeCall,
  selectedCharacter,
  characterAvatars,
  onDisconnect,
  callHistory,
  onInitiateCall,
}) => {
  const [seconds, setSeconds] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringOscillators = useRef<any[]>([]);

  // Timer running when call is connected
  useEffect(() => {
    if (!activeCall || activeCall.status !== "connected") {
      setSeconds(0);
      return;
    }
    
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCall?.status]);

  // Handle ring tone synthesizers automatically on mount
  useEffect(() => {
    if (!activeCall) return;

    if (activeCall.status === "dialing" || activeCall.status === "ringing") {
      // Start ring sound
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;

          // USA style or UK style ring back sequences
          const playRingTone = () => {
            if (!audioContextRef.current || ctx.state === "closed") return;
            
            // Indian standard mixed tone generators 400Hz and 450Hz
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc1.frequency.value = 400;
            osc2.frequency.value = 450;

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);

            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            // Fade in gently
            gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
            // Short Ring 1 duration is 0.7s
            gainNode.gain.setValueAtTime(0.12, ctx.currentTime + 0.7);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.85);

            // Short Ring 2 duration is 0.7s after 0.2s pause
            gainNode.gain.setValueAtTime(0, ctx.currentTime + 1.0);
            gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.05);
            gainNode.gain.setValueAtTime(0.12, ctx.currentTime + 1.75);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.9);

            osc1.start(ctx.currentTime);
            osc2.start(ctx.currentTime);
            
            osc1.stop(ctx.currentTime + 2.0);
            osc2.stop(ctx.currentTime + 2.0);

            ringOscillators.current.push(osc1, osc2);
          };

          // Play initially
          playRingTone();

          // Repeat every 3.5 seconds
          const intervalId = setInterval(() => {
            if (audioContextRef.current && ctx.state !== "closed") {
              playRingTone();
            } else {
              clearInterval(intervalId);
            }
          }, 3500);

          (ctx as any)._ringInterval = intervalId;
        }
      } catch (err) {
        console.error("Audio Synthesis error:", err);
      }
    } else {
      // Not ringing, so stop sound
      stopRinging();
    }

    return () => {
      stopRinging();
    };
  }, [activeCall?.status]);

  const stopRinging = () => {
    try {
      if (audioContextRef.current) {
        if ((audioContextRef.current as any)._ringInterval) {
          clearInterval((audioContextRef.current as any)._ringInterval);
        }
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (e) {
      console.warn("Ringing context clean up warning", e);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!activeCall) return null;

  const characterNames: Record<CharacterType, string> = {
    stranger: "The Stranger",
    anjali: "Anjali",
    zoya: "Zoya",
    khud: "Khud",
    rohan: "Rohan",
    ishani: "Ishani",
    mahi: "Mahi"
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-8 text-white select-none">
        
        {/* Top Status */}
        <div className="flex flex-col items-center gap-2 pt-12 md:pt-16">
          <span className="text-[11px] font-mono tracking-[0.4em] text-orange-500 font-extrabold uppercase animate-pulse">
            {activeCall.status === "dialing" && "Dialing Link / কানেক্টিং..."}
            {activeCall.status === "ringing" && "Ringing / রিং হচ্ছে..."}
            {activeCall.status === "connected" && "Voice Call Connected / ফোনে কথা বলছি"}
          </span>
          <h2 className="text-2xl font-black tracking-wider uppercase">{characterNames[selectedCharacter]}</h2>
          <span className="text-zinc-500 font-mono text-sm tracking-widest">{activeCall.phoneNumber}</span>
        </div>

        {/* Center Glowing Visual */}
        <div className="relative flex items-center justify-center max-w-full my-auto">
          {/* Animated glow rings */}
          {(activeCall.status === "dialing" || activeCall.status === "ringing") && (
            <>
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute w-[240px] h-[240px] bg-[#EF6D2F]/20 rounded-full blur-xl"
              />
              <motion.div 
                animate={{ scale: [1, 1.8, 1], opacity: [0.05, 0.2, 0.05] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
                className="absolute w-[240px] h-[240px] bg-orange-500/10 rounded-full blur-2xl"
              />
            </>
          )}

          {activeCall.status === "connected" && (
            <motion.div 
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-xl border border-emerald-500/25"
            />
          )}

          {/* Profile Picture */}
          <div className="relative z-10">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl relative">
              <img 
                src={characterAvatars[selectedCharacter]} 
                alt="Active Mentor"
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Pulsing connected state */}
            {activeCall.status === "connected" && (
              <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-emerald-500 text-white rounded-full px-4 py-1 flex items-center gap-1.5 border border-zinc-950 shadow-lg text-[10px] font-mono uppercase tracking-wider font-extrabold animate-bounce">
                <Clock size={10} className="animate-spin" />
                {formatTimer(seconds)}
              </div>
            )}
          </div>
        </div>

        {/* Call History / Recent Mentored Students */}
        {callHistory && callHistory.length > 0 && (
          <div className="w-full max-w-xs bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-2 backdrop-blur-md relative z-10 my-3">
            <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-400 font-bold uppercase flex items-center gap-1.5 justify-center">
              <Clock size={10} className="text-[#EF6D2F]" /> CALL HISTORY / রিসেন্ট কলস
            </span>
            <div className="flex flex-col gap-1.5 max-h-[110px] overflow-y-auto pr-1">
              {callHistory.map((historyNum, idx) => (
                <button
                  key={`${historyNum}-${idx}`}
                  onClick={() => onInitiateCall(historyNum)}
                  className="w-full py-1.5 px-2 bg-white/5 hover:bg-[#EF6D2F]/15 hover:border-[#EF6D2F]/40 border border-white/5 rounded-xl flex items-center justify-between text-left text-[11px] font-medium text-white transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[9px] font-mono text-zinc-400 group-hover:bg-[#EF6D2F]/25 group-hover:text-white transition-all">
                      {idx + 1}
                    </div>
                    <span className="font-mono tracking-wide">{historyNum}</span>
                  </div>
                  <span className="text-[9px] text-[#EF6D2F] font-bold tracking-widest opacity-40 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    REDIAL <ChevronRight size={10} className="stroke-[3.5]" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls & Footer */}
        <div className="flex flex-col items-center gap-5 w-full max-w-sm pb-12 md:pb-16 px-4">
          <p className="text-xs text-center text-zinc-500 italic max-w-[280px] leading-relaxed">
            {activeCall.status === "connected" 
              ? `Tomar AI math and literature mentor, ${characterNames[selectedCharacter]} calls you through current active session.`
              : `Making double-bound calling routing across the device carrier link...`
            }
          </p>

          <div className="w-full flex flex-col items-center gap-4">
            <a
              href={`tel:${activeCall.phoneNumber}`}
              target="_parent"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-[#EF6D2F] to-amber-500 font-bold text-sm text-center shadow-lg shadow-orange-500/20 border border-orange-400/30 text-white flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all animate-pulse"
              id="native-dialer-link"
            >
              <Phone size={16} className="fill-white animate-bounce" />
              ফোন অ্যাপ দিয়ে কল করো (Real Device Voice Call)
            </a>

            <div className="flex items-center justify-center gap-8 mt-2">
              {/* Red End Call Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onDisconnect}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all cursor-pointer border border-rose-500/50"
                id="end-call-btn"
              >
                <PhoneOff size={24} className="fill-white" />
              </motion.button>
            </div>
          </div>
        </div>

      </div>
    </AnimatePresence>
  );
};
