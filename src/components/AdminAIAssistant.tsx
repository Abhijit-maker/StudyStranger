import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Megaphone, 
  Trophy, 
  Terminal, 
  Loader2, 
  X, 
  Copy, 
  RefreshCw, 
  CornerDownLeft,
  ChevronRight,
  Flame,
  Download
} from "lucide-react";
import { TypewriterText } from "./TypewriterText";
import { db } from "../firebase";
import { collection, addDoc, getDocs, updateDoc, doc, query, where, limit } from "firebase/firestore";
import { generateStyledPDF, downloadPdfFromDataUrl } from "../utils/pdfGenerator";
import { nativeService } from "../services/nativeService";

interface AdminAIAssistantProps {
  adminName: string;
  adminEmail: string;
  customApiKey?: string;
  onNoticeCreated?: () => void;
}

interface ActionCard {
  id: string;
  type: "notice_pdf" | "user_update" | "analytics" | "mock_pdf";
  title: string;
  description: string;
  status: "pending" | "executed" | "failed";
  payload: any;
  resultMessage?: string;
}

interface AdminMessage {
  id: string;
  sender: "admin" | "ai";
  text: string;
  timestamp: string;
  actionCard?: ActionCard;
}

export const AdminAIAssistant: React.FC<AdminAIAssistantProps> = ({
  adminName,
  adminEmail,
  customApiKey,
  onNoticeCreated
}) => {
  const [messages, setMessages] = useState<AdminMessage[]>([
    {
      id: "init-1",
      sender: "ai",
      text: `নমস্কার অ্যাডমিন **${adminName}**! আমি আপনার **Dedicated Admin AI Co-Pilot**। \n\nআপনি আমাকে বাংলায় বা ইংরেজিতে নির্দেশ দিন—আমি আপনার কথা মতো:\n- 📄 **PDF এটাচমেন্ট সহ অফিসিয়াল নোটিস** পাবলিশ করব\n- 👥 **স্টুডেন্টদের একাউন্ট, পয়েন্ট ও স্ট্যাটাস** ম্যানেজ করব\n- 🧬 **WBCHSE Sem 3 সিলেবাসের স্টাডি মেটেরিয়াল / মক টেস্ট PDF** তৈরি করব\n- 📊 **সিস্টেম টেলিমেট্রি ও ইউজার অ্যাক্টিভিটি** রিপোর্ট দেব।\n\nবলুন, আজ কী কাজ করতে হবে?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Voice Input Setup (SpeechRecognition)
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "bn-IN"; // Prefer Bengali / Indian accent

      rec.onresult = (event: any) => {
        let finalChunk = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + " ";
          }
        }
        if (finalChunk.trim()) {
          setInput(prev => prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim());
          nativeService.triggerHaptic("success");
        }
      };

      rec.onerror = (e: any) => {
        if (e.error !== "no-speech" && e.error !== "aborted") {
          console.warn("Speech rec error:", e);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      nativeService.showToast("Speech recognition not supported in this browser");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        nativeService.showToast("Listening... (কথা বলুন)");
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const executeAction = async (action: ActionCard): Promise<{ success: boolean; message: string }> => {
    try {
      if (action.type === "notice_pdf") {
        const { title, text, category, pdfTitle, pdfContentText, isPinned } = action.payload;
        
        let pdfDataUri = "";
        let pdfName = "";
        let pdfSize = "";

        if (pdfContentText || pdfTitle) {
          pdfDataUri = generateStyledPDF({
            title: pdfTitle || title || "WBCHSE Official Notice",
            category: category || "Admin Notice",
            author: adminName,
            content: pdfContentText || text || "Official Notice for WBCHSE Class 12."
          });
          pdfName = `${(pdfTitle || title || "Notice").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
          pdfSize = "PDF Attached (~1.2 MB)";
        }

        await addDoc(collection(db, "announcements"), {
          title: title || pdfTitle || "Official Notice",
          text: text || "Please check the attached document.",
          category: category || "WBCHSE Sem 3",
          timestamp: new Date().toISOString(),
          author: `${adminName} (Admin)`,
          isPinned: !!isPinned,
          ...(pdfDataUri ? { pdfData: pdfDataUri, pdfName, pdfSize } : {})
        });

        if (onNoticeCreated) onNoticeCreated();
        return { success: true, message: `✅ Notice "${title}" successfully published to all students with PDF attached!` };
      } 
      
      else if (action.type === "user_update") {
        const { targetIdentifier, pointsToAdd, status, unlockPro } = action.payload;
        const usersSnap = await getDocs(collection(db, "users"));
        let updatedCount = 0;
        let matchedUserName = "";

        for (const userDoc of usersSnap.docs) {
          const data = userDoc.data();
          const match = 
            targetIdentifier === "all" ||
            (data.email && data.email.toLowerCase() === targetIdentifier.toLowerCase()) ||
            (data.displayName && data.displayName.toLowerCase().includes(targetIdentifier.toLowerCase())) ||
            (data.username && data.username.toLowerCase() === targetIdentifier.toLowerCase());

          if (match) {
            const updates: any = {};
            if (pointsToAdd) updates.points = (data.points || 0) + Number(pointsToAdd);
            if (status) updates.status = status;
            if (unlockPro !== undefined) updates.premiumUnlocked = unlockPro;
            
            await updateDoc(doc(db, "users", userDoc.id), updates);
            updatedCount++;
            matchedUserName = data.displayName || data.username || "Student";
          }
        }

        if (updatedCount > 0) {
          return { success: true, message: `✅ Successfully updated ${updatedCount} student account (${matchedUserName})!` };
        } else {
          return { success: false, message: `⚠️ Could not find any student matching "${targetIdentifier}".` };
        }
      }

      else if (action.type === "mock_pdf") {
        const { subject, topic, pdfDataUri, pdfName } = action.payload;
        await addDoc(collection(db, "announcements"), {
          title: `📝 WBCHSE Mock Test: ${subject} - ${topic}`,
          text: `Official WBCHSE Semester 3 Exam Paper for ${subject} (${topic}). Download the attached PDF to practice with answers.`,
          category: "Exam Alert",
          timestamp: new Date().toISOString(),
          author: `${adminName} (Admin)`,
          isPinned: true,
          pdfData: pdfDataUri,
          pdfName: pdfName || `${subject}_Mock_Exam.pdf`,
          pdfSize: "Verified Exam PDF"
        });

        if (onNoticeCreated) onNoticeCreated();
        return { success: true, message: `✅ WBCHSE Mock Exam PDF for ${subject} published and pinned for all students!` };
      }

      return { success: false, message: "Unknown action type" };
    } catch (err: any) {
      console.error("Action execution error:", err);
      return { success: false, message: `❌ Error: ${err?.message || "Execution failed"}` };
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isProcessing) return;

    const userMsg: AdminMessage = {
      id: `${Date.now()}-adm`,
      sender: "admin",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    try {
      // 1. Fetch current live students and stats context for the AI
      let studentContext = "";
      let announcementsCount = 0;
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const usersList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        studentContext = `Total Registered Students: ${usersList.length}\nSample Students: ${JSON.stringify(usersList.slice(0, 10).map((u: any) => ({ name: u.displayName || u.username, email: u.email, points: u.points, status: u.status })))}`;
        
        const annSnap = await getDocs(collection(db, "announcements"));
        announcementsCount = annSnap.size;
      } catch (e) {
        studentContext = "Student database accessible.";
      }

      const systemPrompt = `You are the EXCLUSIVE ADMIN AI CO-PILOT for Study Stranger (WBCHSE Class 12 Sem 3 Portal).
You obey Admin ${adminName} (${adminEmail}) exclusively.
You have the power to create official notices with PDF attachments, grant points, suspend/activate accounts, generate WBCHSE mock papers/study materials in PDF, and monitor stats.

Current Live Database State:
${studentContext}
Total Announcements: ${announcementsCount}

INSTRUCTIONS:
1. Respond with high intelligence, respect, and crisp professional Bengali/English.
2. When the Admin asks to:
   - Post a notice or send a PDF (e.g. "Notice pathiye dao PDF soho", "Biology Unit 1 er notice dao"): Create an action of type "notice_pdf" with title, text, category, pdfTitle, and detailed pdfContentText (formatted with headings # and bullet points).
   - Modify a user (e.g. "Give 100 points to Abhijit", "Suspend user X"): Create an action of type "user_update" with targetIdentifier, pointsToAdd, or status.
   - Generate a mock exam paper or study notes PDF: Create an action of type "notice_pdf" or "mock_pdf" with full exam questions and answer keys.
   - Query stats or list students: Answer directly from the provided live database state.

You MUST format your output as a JSON object with this EXACT structure:
{
  "reply": "Your friendly response explaining what you did or answering the question in Bengali/English markdown.",
  "action": {
    "type": "notice_pdf" | "user_update" | "mock_pdf" | "none",
    "title": "Title of the action",
    "description": "Brief description of what will be executed",
    "autoExecute": true,
    "payload": {
      // For notice_pdf:
      "title": "...",
      "text": "...",
      "category": "Exam Alert" | "Study Material" | "WBCHSE Sem 3" | "Class Notice",
      "pdfTitle": "...",
      "pdfContentText": "# Heading\\n- Bullet 1\\n- Bullet 2...",
      "isPinned": true or false,

      // For user_update:
      "targetIdentifier": "email or name or username or 'all'",
      "pointsToAdd": 100,
      "status": "active" | "suspended",
      "unlockPro": true,

      // For mock_pdf:
      "subject": "Biology",
      "topic": "Reproduction Unit I",
      "pdfName": "Biology_Sem3_Mock.pdf"
    }
  }
}
Always return VALID JSON ONLY.`;

      let responseText = "";
      const res = await fetch("/api/ai/generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${systemPrompt}\n\nAdmin Command:\n${queryText}`,
          apiKey: customApiKey,
          model: "gemini-2.5-flash",
          responseMimeType: "application/json"
        })
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.text) {
          responseText = resData.text;
        }
      }

      let parsed: any = {};
      try {
        parsed = JSON.parse(responseText || "{}");
      } catch (err) {
        parsed = {
          reply: responseText || "আমি আপনার নির্দেশ বুঝতে পেরেছি।",
          action: { type: "none" }
        };
      }

      let actionCard: ActionCard | undefined = undefined;

      if (parsed.action && parsed.action.type && parsed.action.type !== "none") {
        actionCard = {
          id: `act-${Date.now()}`,
          type: parsed.action.type,
          title: parsed.action.title || "Admin Task Execution",
          description: parsed.action.description || "Executing administrative operation...",
          status: "pending",
          payload: parsed.action.payload || {}
        };

        // If auto-execute is enabled or standard command
        if (parsed.action.autoExecute) {
          const res = await executeAction(actionCard);
          actionCard.status = res.success ? "executed" : "failed";
          actionCard.resultMessage = res.message;
          nativeService.triggerHaptic(res.success ? "success" : "failure");
        }
      }

      const aiMsg: AdminMessage = {
        id: `${Date.now()}-ai`,
        sender: "ai",
        text: parsed.reply || "কাজ সম্পন্ন হয়েছে।",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Admin AI query failed:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          sender: "ai",
          text: `⚠️ অ্যাডমিন এআই প্রসেস করতে ত্রুটি হয়েছে: ${err?.message || "Check API Key in Settings"}. দয়া করে আবার চেষ্টা করুন।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAction = async (msgId: string, action: ActionCard) => {
    const res = await executeAction(action);
    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.actionCard) {
        return {
          ...m,
          actionCard: {
            ...m.actionCard,
            status: res.success ? "executed" : "failed",
            resultMessage: res.message
          }
        };
      }
      return m;
    }));
    nativeService.showToast(res.message);
  };

  const quickPrompts = [
    { label: "📢 Publish Exam Notice + PDF", prompt: "Biology Unit I Reproduction exam schedule ar akta notice create kore PDF soho broadcast kore dao" },
    { label: "🧬 Generate Biology Notes PDF", prompt: "Class 12 WBCHSE Reproduction Unit I er sob key points diye akta study material PDF baniye notice e post koro" },
    { label: "👥 List All Students", prompt: "Database theke sob registered students der list, points ar status dekhao" },
    { label: "⭐ Award +100 Points to All", prompt: "Sob active students der +100 bonus study points award kore dao" },
    { label: "📊 System Health & Stats", prompt: "System status, total users, notices count ar active telemetry report dao" }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-stone-900 text-stone-100 rounded-[2.5rem] border border-stone-800 overflow-hidden shadow-2xl">
      {/* Admin Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF7A30] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <span>Admin AI Co-Pilot</span>
                <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  Exclusive
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-stone-400 font-medium">
              Autonomous Command Core • Admin: {adminName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-800/80 rounded-full border border-stone-700/60 text-[10px] font-bold text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>AI Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2.5 bg-stone-950/40 border-b border-stone-800/60 flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7A30] shrink-0 flex items-center gap-1">
          <Sparkles size={12} /> Prompts:
        </span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp.prompt)}
            disabled={isProcessing}
            className="px-3 py-1 rounded-xl bg-stone-800/90 hover:bg-[#FF7A30]/20 hover:border-[#FF7A30]/40 border border-stone-700/60 text-[11px] font-bold text-stone-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-xs sm:text-sm">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${m.sender === "admin" ? "justify-end" : "justify-start"}`}
          >
            {m.sender === "ai" && (
              <div className="w-8 h-8 rounded-xl bg-[#FF7A30]/20 text-[#FF7A30] border border-[#FF7A30]/30 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
              <div
                className={`p-4 rounded-3xl leading-relaxed whitespace-pre-line ${
                  m.sender === "admin"
                    ? "bg-[#FF7A30] text-white font-medium rounded-tr-sm shadow-md shadow-orange-500/20"
                    : "bg-stone-800/90 border border-stone-700/70 text-stone-200 rounded-tl-sm shadow-sm"
                }`}
              >
                {m.sender === "admin" ? (
                  m.text
                ) : (
                  <TypewriterText
                    text={m.text}
                    enabled={m.id === messages[messages.length - 1]?.id}
                    speed={12}
                    chunkSize={3}
                    onComplete={() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    cursorClassName="inline-block w-1.5 h-3.5 bg-[#FF7A30] ml-0.5 align-middle animate-pulse"
                  />
                )}
              </div>

              {/* Action Card if AI triggered a tool */}
              {m.actionCard && (
                <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-[#FF7A30]" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-white">
                        {m.actionCard.title}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        m.actionCard.status === "executed"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : m.actionCard.status === "failed"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                      }`}
                    >
                      {m.actionCard.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400 font-mono leading-tight">
                    {m.actionCard.description}
                  </p>

                  {m.actionCard.resultMessage && (
                    <div className="p-2 bg-stone-900 rounded-xl text-[11px] font-mono text-emerald-300 border border-stone-800">
                      {m.actionCard.resultMessage}
                    </div>
                  )}

                  {m.actionCard.status === "pending" && (
                    <button
                      onClick={() => handleApproveAction(m.id, m.actionCard!)}
                      className="w-full py-2 bg-[#FF7A30] text-white font-bold text-xs rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Approve & Execute Now
                    </button>
                  )}
                </div>
              )}

              <span className="text-[9px] text-stone-500 block px-1">
                {m.timestamp}
              </span>
            </div>

            {m.sender === "admin" && (
              <div className="w-8 h-8 rounded-xl bg-stone-700 text-stone-300 flex items-center justify-center shrink-0 mt-1 font-black text-xs">
                A
              </div>
            )}
          </motion.div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-stone-400 text-xs font-mono py-2">
            <Loader2 size={16} className="animate-spin text-[#FF7A30]" />
            <span>Admin AI is executing your command...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3.5 sm:p-4 bg-stone-950 border-t border-stone-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isListening
                ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                : "bg-stone-800 text-stone-400 hover:text-white border-stone-700 hover:border-stone-600"
            }`}
            title="Voice Command"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Give instructions in Bengali / English (e.g. Notice pathao PDF soho)..."
            disabled={isProcessing}
            className="flex-1 bg-stone-800/90 border border-stone-700/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 outline-none focus:border-[#FF7A30] transition-all font-medium"
          />

          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="p-3 bg-[#FF7A30] text-white rounded-2xl hover:bg-orange-600 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-orange-500/30"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
