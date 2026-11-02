import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { USER, MENTORS, NOTES, TOOLS } from "../data.js";

// Full AI & Core Interactive Components
import { MockTest as RealMockTest } from "../components/MockTest";
import { DoubtSolver as RealDoubtSolver } from "../components/DoubtSolver";
import { FlashcardDeck as RealFlashcardDeck } from "../components/FlashcardDeck";
import { ScienceLab3D as RealScienceLab3D } from "../components/ScienceLab3D";
import { SmartScanner as RealSmartScanner } from "../components/SmartScanner";
import { MindMap as RealMindMap } from "../components/MindMap";
import { QuestionBankQuiz as RealQuestionBankQuiz } from "../components/QuestionBankQuiz";
import { SpeedBlitz as RealSpeedBlitz } from "../components/SpeedBlitz";
import { FocusStudyRoom as RealFocusStudyRoom } from "../components/FocusStudyRoom";
import { MathSolver as RealMathSolver } from "../components/MathSolver";
import { MistakeBank as RealMistakeBank } from "../components/MistakeBank";
import { Syllabus as RealSyllabus } from "../components/Syllabus";
import { AIMemoryVault as RealAIMemoryVault } from "../components/AIMemoryVault";
import { AIExamAutopsyModal } from "../components/AIExamAutopsyModal";
import { VoiceMCQQuizModal } from "../components/VoiceMCQQuizModal";
import { FriendQuizDuelModal } from "../components/FriendQuizDuelModal";
import { PrintableMockPDFModal } from "../components/PrintableMockPDFModal";
import { FormulaStickyDiaryModal } from "../components/FormulaStickyDiaryModal";
import { NoticeBoardModal } from "../components/NoticeBoardModal";
import { TelegramPortal } from "../components/TelegramPortal";
import { MistakeAnalyzer } from "../components/MistakeAnalyzer";
import { ChapterFlashcards } from "../components/ChapterFlashcards";
import { QuestionBank as RealQuestionBank } from "../components/QuestionBank";
import { StudyStreakTracker } from "../components/StudyStreakTracker";
import { AccountabilityVigilanceModal } from "../components/AccountabilityVigilanceModal";
import { LiveBoard as RealLiveBoard, BoardElement } from "../components/LiveBoard";
import { SoundWaveformCanvas } from "../components/SoundWaveformCanvas";
import Visualizer from "../components/Visualizer";
import { AnjaliAnimationState } from "../components/Anjali3DViewer";
import { TypewriterText } from "../components/TypewriterText";
import { TiltContainer } from "../components/TiltContainer";
import mahiAvatar from "../assets/images/mahi_avatar_1780353082547.png";
import { voiceService } from "../services/voiceService";
import { LiveSessionManager, CharacterType } from "../services/liveService";
import { getStrangerResponse, resolveCurrentUserName } from "../services/geminiService";
import { auth } from "../firebase";
import { analyzeMentorGestureFromDialogue } from "../utils/studyCoreLogic";
import { recordVerifiedStudyActivity } from "../utils/studyActivityTracker";
import { PDFUploadZone, PDFSourceType } from "../components/PDFUploadZone";
import { DocumentPreviewModal } from "../components/DocumentPreviewModal";

const MENTOR_AVATARS: Record<string, string> = {
  stranger: "https://i.ibb.co/WWHh1m2V/hay.jpg",
  mahi: mahiAvatar,
  anjali: "https://picsum.photos/seed/anjali/200/200",
  zoya: "https://picsum.photos/seed/scholar/200/200"
};

function ToolHeader({ title, tag, onBack }: { title: string; tag: string; onBack: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack}>
        ← Back to Studio Tools
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="badge-pill">{tag}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{title}</span>
      </div>
    </div>
  );
}

// 1. Mock Test AI (Full exam simulation with 3D Launch Countdown, AI questions, timer, KaTeX)
export function MockTest() {
  const nav = useNavigate();
  const [launchStage, setLaunchStage] = useState<"countdown" | "ready">("countdown");
  const [countdownNum, setCountdownNum] = useState<number>(2);

  useEffect(() => {
    if (launchStage !== "countdown") return;
    const timer = setInterval(() => {
      setCountdownNum((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLaunchStage("ready");
          recordVerifiedStudyActivity("mockTestsCompleted", 1);
          return 0;
        }
        return prev - 1;
      });
    }, 650);
    return () => clearInterval(timer);
  }, [launchStage]);

  return (
    <div>
      <ToolHeader title="Mock Test AI" tag="Full Exam Simulation" onBack={() => nav("/app")} />

      {launchStage === "countdown" ? (
        <div
          className="panel"
          style={{
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            background: "linear-gradient(135deg, #FFF385 0%, #EDF7F0 55%, #E0F2FE 100%)",
            border: "2.5px solid var(--ink)",
            boxShadow: "8px 8px 0px var(--ink)",
            borderRadius: 28,
            padding: 32,
          }}
        >
          <span className="badge-pill" style={{ background: "#fff", marginBottom: 16 }}>
            ⚡ WBCHSE Class 12 Semester 3 OMR Examination Engine
          </span>
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: 32,
              background: "#fff",
              border: "3px solid var(--ink)",
              boxShadow: "6px 6px 0px var(--ink)",
              display: "grid",
              placeItems: "center",
              fontSize: 52,
              fontWeight: 900,
              fontFamily: "var(--font-serif)",
              marginBottom: 20,
            }}
          >
            {countdownNum}
          </div>
          <h2 style={{ fontSize: 30, margin: "0 0 8px", fontFamily: "var(--font-serif)" }}>
            Calibrating Bilingual Question Paper...
          </h2>
          <p className="muted" style={{ maxWidth: 460, fontSize: 14 }}>
            Preparing KaTeX mathematical equations, timer synchronization, and instant board evaluation.
          </p>
          <button
            type="button"
            onClick={() => {
              setLaunchStage("ready");
              recordVerifiedStudyActivity("mockTestsCompleted", 1);
            }}
            className="btn btn-dark btn-sm"
            style={{ marginTop: 18 }}
          >
            Enter Exam Hall Immediately →
          </button>
        </div>
      ) : (
        <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
          <RealMockTest 
            onClose={() => nav("/app")} 
            character="stranger" 
            userName={USER.name} 
          />
        </div>
      )}
    </div>
  );
}

// 2. AI Doubt Solver (Real Gemini Chat with syllabus grounding & citations)
export function Doubt() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="AI Doubt Solver" tag="Gemini AI Tutor" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <RealDoubtSolver 
          onClose={() => nav("/app")} 
          userName={USER.name} 
        />
      </div>
    </div>
  );
}

// 3. Voice Tutor (Full Speech Recognition, Gemini AI Reasoning, Avatars & Visualizer, Live Whiteboard Studio)
export function Voice() {
  const nav = useNavigate();
  const [selectedMentor, setSelectedMentor] = useState(MENTORS[0]);
  const [appState, setAppState] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.15);
  const [expression, setExpression] = useState<string>("greeting");
  const [anjali3DAnimation, setAnjali3DAnimation] = useState<AnjaliAnimationState>("idle");
  const [showLiveBoard, setShowLiveBoard] = useState<boolean>(false);
  const [boardElements, setBoardElements] = useState<BoardElement[]>([]);
  const [transcriptLog, setTranscriptLog] = useState<{ sender: "user" | "stranger"; text: string; time: string }[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [inputTopic, setInputTopic] = useState("");

  const samplePromptsAnjali = [
    { label: "💃 Dance Koro!", prompt: "Anjali, ekta bhalo dance kore dekhaw!", anim: "dancing" as AnjaliAnimationState },
    { label: "👋 Wave Hi", prompt: "Anjali, say hi to me!", anim: "wave" as AnjaliAnimationState },
    { label: "💡 Think", prompt: "Anjali, think about this problem deeply.", anim: "thinking" as AnjaliAnimationState },
    { label: "👏 Clap", prompt: "Anjali, clap for my good preparation!", anim: "clap" as AnjaliAnimationState },
    { label: "😂 Laugh", prompt: "Anjali, bolo ekta mojar kotha!", anim: "laugh" as AnjaliAnimationState },
    { label: "🥺 Shy", prompt: "Anjali, ektu lojja pao!", anim: "shy" as AnjaliAnimationState },
    { label: "🧬 Bio 5 MCQs", prompt: "Ask me 5 high-yield WBCHSE Class 12 Biology MCQs from Unit 1 Reproduction right now." },
    { label: "📖 Adarini Story", prompt: "Explain the story and themes of Bengali prose Adarini in simple Bengali." },
    { label: "🗣️ বাংলায় বলো", prompt: "Please speak and explain in pure, friendly Bengali (বাংলায় সহজ করে বুঝিয়ে দাও)." },
    { label: "📋 Diagram to Board", prompt: "Show and explain the diagram of human sperm fertilization on the Live Board." }
  ];

  const samplePromptsMahi = [
    { label: "🧬 Bio 5 MCQs", prompt: "Ask me 5 high-yield WBCHSE Class 12 Biology MCQs from Unit 1 Reproduction right now." },
    { label: "📖 Explain Adarini", prompt: "Explain the story and themes of Bengali prose Adarini by Prabhat Kumar Mukhopadhyay in simple Bengali." },
    { label: "⚡ Mendel Laws", prompt: "Summarize Mendel's Laws of Inheritance and Linkage in English and Bengali." },
    { label: "📜 The Bet 15 Years", prompt: "Explain Anton Chekhov's The Bet and the lawyer's 15-year wager." },
    { label: "📋 Diagram to Board", prompt: "Show and explain the diagram of human sperm fertilization on the Live Board." },
    { label: "🗣️ বাংলায় বলো", prompt: "Please speak and explain in pure, friendly Bengali (বাংলায় সহজ করে বুঝিয়ে দাও)." }
  ];

  const samplePromptsStranger = [
    { label: "🧬 Reproduction & ZP3", prompt: "Explain human sperm fertilization and the role of ZP3 receptor." },
    { label: "⚡ DNA Replication & SSB", prompt: "Explain the DNA replication fork, helicase, and SSB protein in molecular genetics." },
    { label: "📖 Adarini ও জয়রাম মোক্তার", prompt: "Explain Jayram Mokhtar's tragic bond with Adarini the elephant in Prabhat Kumar's story." },
    { label: "📜 The Bet (Anton Chekhov)", prompt: "Discuss the 2 million rubles wager in The Bet and life imprisonment vs death penalty." },
    { label: "📋 Live Board Formulas", prompt: "Explain calculus integration by parts and standard formulas on the Live Board." },
    { label: "🗣️ বাংলায় সহজ করে বলো", prompt: "সবকিছু বাংলায় খুব সহজ ও পরিষ্কার করে বুঝিয়ে দাও।" }
  ];

  const mahiMoods = [
    { label: "Greeting", id: "greeting", icon: "🤗" },
    { label: "Thinking", id: "thinking", icon: "🤔" },
    { label: "Wink", id: "wink", icon: "😉" },
    { label: "Blush", id: "blush", icon: "😳" },
    { label: "Smirk", id: "smirk", icon: "😏" },
    { label: "Pout", id: "pout", icon: "😤" },
    { label: "Starry", id: "starry_eyes", icon: "🤩" },
    { label: "Heart Eyes", id: "heart_eyes", icon: "🥰" }
  ];

  const handleAskVoiceAI = async (questionText: string, specificAnim?: AnjaliAnimationState) => {
    if (!questionText.trim()) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTranscriptLog(prev => [...prev, { sender: "user", text: questionText, time: nowTime }]);
    setAppState("processing");
    setExpression("thinking");

    recordVerifiedStudyActivity("voiceMentorInteractions", 1);

    if (specificAnim) {
      setAnjali3DAnimation(specificAnim);
    } else {
      const preDecision = analyzeMentorGestureFromDialogue(questionText, "", "processing");
      setAnjali3DAnimation(preDecision.animation as AnjaliAnimationState);
    }

    try {
      const historyFormatted = transcriptLog.map(t => ({ sender: t.sender, text: t.text }));
      const aiReply = await getStrangerResponse(
        questionText,
        historyFormatted,
        selectedMentor.id as any,
        undefined,
        USER.name
      );

      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setTranscriptLog(prev => [...prev, { sender: "stranger", text: aiReply, time: replyTime }]);
      setAppState("speaking");
      setExpression("studying");

      const speakDecision = analyzeMentorGestureFromDialogue(questionText, aiReply, "speaking");
      if (!specificAnim) {
        setAnjali3DAnimation(speakDecision.animation as AnjaliAnimationState);
      }

      // Auto-extract notes to Live Board if relevant
      const qLower = questionText.toLowerCase();
      if (qLower.includes("diagram") || qLower.includes("formula") || qLower.includes("zp3") || qLower.includes("sperm") || qLower.includes("dna") || qLower.includes("pollination") || qLower.includes("calculus") || qLower.includes("board")) {
        setBoardElements(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "text",
            content: `### 📌 ${selectedMentor.name} Key Note:\n${aiReply.slice(0, 260)}...`,
            timestamp: Date.now()
          }
        ]);
        if (!showLiveBoard) setShowLiveBoard(true);
      }

      voiceService.speak(aiReply, {
        character: selectedMentor.id as any,
        rate: playbackSpeed,
        onStart: () => {
          setAppState("speaking");
          if (!specificAnim) {
            setAnjali3DAnimation(speakDecision.animation as AnjaliAnimationState);
          }
        },
        onEnd: () => {
          setAppState("idle");
          setExpression("greeting");
          setAnjali3DAnimation("smiling");
          setTimeout(() => setAnjali3DAnimation("idle"), 1800);
        },
        onError: () => {
          setAppState("idle");
          setExpression("greeting");
          setAnjali3DAnimation("idle");
        }
      });
    } catch (err) {
      console.error("Voice AI reasoning error:", err);
      setAppState("idle");
      setExpression("greeting");
      setAnjali3DAnimation("idle");
    }
  };

  const handleReplayVoice = (text: string) => {
    voiceService.stop();
    setAppState("speaking");
    if (selectedMentor.id === "anjali") setAnjali3DAnimation("talking");

    voiceService.speak(text, {
      character: selectedMentor.id as any,
      rate: playbackSpeed,
      onStart: () => setAppState("speaking"),
      onEnd: () => {
        setAppState("idle");
        setAnjali3DAnimation("idle");
      },
      onError: () => {
        setAppState("idle");
        setAnjali3DAnimation("idle");
      }
    });
  };

  const handleSendToBoard = (text: string) => {
    setBoardElements(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "text",
        content: `### 📋 Note from ${selectedMentor.name}:\n${text}`,
        timestamp: Date.now()
      }
    ]);
    setShowLiveBoard(true);
  };

  const liveManagerRef = React.useRef<LiveSessionManager | null>(null);

  const toggleListening = async () => {
    if (appState === "listening" || appState === "speaking" || liveManagerRef.current) {
      if (liveManagerRef.current) {
        liveManagerRef.current.stop(true);
        liveManagerRef.current = null;
      }
      voiceService.stop();
      voiceService.stopRecognition();
      setAppState("idle");
      setExpression("greeting");
      setAnjali3DAnimation("idle");
      return;
    }

    setAppState("processing");
    setExpression("thinking");
    if (selectedMentor.id === "anjali") setAnjali3DAnimation("thinking");
    setCurrentTranscript("");

    try {
      const apiKey = localStorage.getItem("gemini_api_key") || localStorage.getItem("custom_gemini_api_key") || localStorage.getItem("ss-gemini-key") || process.env.GEMINI_API_KEY || "";
      const manager = new LiveSessionManager(
        selectedMentor.id as CharacterType,
        "default",
        "",
        apiKey,
        USER.name,
        undefined,
        false
      );

      manager.onStateChange = (state) => {
        setAppState(state);
      };

      manager.onMessage = (sender, text) => {
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setTranscriptLog(prev => [...prev, { sender: sender === "user" ? "user" : "stranger", text, time: timeStr }]);
      };

      manager.onBoardUpdate = (action, type, content) => {
        if (action === "add") {
          setBoardElements(prev => [...prev, { id: Date.now().toString(), type: type as any, content, timestamp: Date.now() }]);
          setShowLiveBoard(true);
        }
      };

      manager.on3DAnimation = (anim) => {
        setAnjali3DAnimation(anim as AnjaliAnimationState);
      };

      manager.onReconnect = () => {
        console.log("Reconnecting live session...");
      };

      liveManagerRef.current = manager;
      await manager.start();
    } catch (err: any) {
      console.error("Failed to start live session audio stream:", err);
      setAppState("idle");
      setExpression("greeting");
      setAnjali3DAnimation("idle");
    }
  };

  const stopAllVoice = () => {
    if (liveManagerRef.current) {
      liveManagerRef.current.stop(true);
      liveManagerRef.current = null;
    }
    voiceService.stop();
    voiceService.stopRecognition();
    setAppState("idle");
    setExpression("greeting");
    setAnjali3DAnimation("idle");
  };

  // Ensure Voice AI stops immediately when unmounting or navigating to another tool
  useEffect(() => {
    return () => {
      if (liveManagerRef.current) {
        liveManagerRef.current.stop(true);
        liveManagerRef.current = null;
      }
      voiceService.stop();
      voiceService.stopRecognition();
    };
  }, []);

  const activeAvatar = MENTOR_AVATARS[selectedMentor.id] || MENTOR_AVATARS.stranger;
  const currentActionChips = selectedMentor.id === "anjali" 
    ? samplePromptsAnjali 
    : selectedMentor.id === "mahi" 
    ? samplePromptsMahi 
    : samplePromptsStranger;

  return (
    <div>
      <ToolHeader title="Voice AI Tutor Studio" tag="Live Real-Time Audio + Avatars" onBack={() => nav("/app")} />
      
      {/* Mentor Selector Grid */}
      <div className="mentor-grid" style={{ marginBottom: 16 }}>
        {MENTORS.map((m) => (
          <TiltContainer key={m.id} className="w-full">
            <button 
              className={`mentor ${selectedMentor.id === m.id ? "selected" : ""}`} 
              style={{ 
                background: m.color, 
                border: selectedMentor.id === m.id ? "2.5px solid var(--ink)" : "1.5px solid var(--line)",
                boxShadow: selectedMentor.id === m.id ? "4px 4px 0px var(--ink)" : "none",
                cursor: "pointer",
                width: "100%"
              }} 
              onClick={() => {
                setSelectedMentor(m);
                stopAllVoice();
                setExpression("greeting");
                setAnjali3DAnimation("idle");
              }}
            >
              <b>{m.name}</b>
              <div className="bn">{m.bn}</div>
              <p style={{ fontSize: 13, marginTop: 4 }}>{m.role}</p>
              <small className="muted">{m.tone}</small>
            </button>
          </TiltContainer>
        ))}
      </div>

      {/* Main Studio Stage */}
        <div className="panel" style={{ border: "2px solid var(--ink)", boxShadow: "5px 5px 0px var(--ink)", marginBottom: 20 }}>
          {/* Mentor Control Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderBottom: "1.5px solid var(--ink)", paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div 
              style={{ 
                width: 52, 
                height: 52, 
                borderRadius: 18, 
                background: selectedMentor.color, 
                display: "grid", 
                placeItems: "center", 
                fontSize: 26, 
                border: "2px solid var(--ink)",
                boxShadow: "2px 2px 0px var(--ink)"
              }}
            >
              🎙️
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 22, margin: 0, fontFamily: "var(--font-serif)" }}>{selectedMentor.name}</h2>
                <span className="chip" style={{ background: appState === "listening" ? "var(--lime)" : appState === "speaking" ? "var(--yellow)" : "var(--bg)", border: "1.5px solid var(--ink)", fontWeight: 700 }}>
                  {appState === "listening" ? "● Listening (শুনছি)..." : appState === "speaking" ? "● Speaking (বলছি)..." : appState === "processing" ? "● Thinking (ভাবছি)..." : "● Ready"}
                </span>
                {selectedMentor.id === "anjali" && (
                  <span className="badge-pill" style={{ background: "var(--pink)", fontSize: 11 }}>
                    💃 3D Rigged Model Ready
                  </span>
                )}
              </div>
              <p className="muted" style={{ fontSize: 13, marginTop: 3 }}>{selectedMentor.bn} · {selectedMentor.role}</p>
            </div>
          </div>

          {/* Action & Speed Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>Speed:</span>
            {[0.75, 1.0, 1.25, 1.5].map((spd) => (
              <button 
                key={spd} 
                onClick={() => setPlaybackSpeed(spd)}
                className={`btn btn-sm ${playbackSpeed === spd ? "btn-dark" : "btn-ghost"}`}
                style={{ padding: "4px 8px", fontSize: 11, minHeight: 26, fontWeight: 700 }}
              >
                {spd}x
              </button>
            ))}
            
            <button
              onClick={() => setShowLiveBoard(!showLiveBoard)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11, padding: "4px 8px", border: "1.5px solid var(--line)" }}
            >
              {showLiveBoard ? "📋 Close Board" : "📋 Open Board"}
            </button>

            <button
              onClick={() => nav("/app/settings")}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11, padding: "4px 10px", border: "1.5px solid var(--ink)", background: "#ffffff", color: "var(--ink)", fontWeight: 700 }}
              title="Configure Voice & 3D Studio Settings"
            >
              ⚙️ Studio Settings
            </button>

            {appState !== "idle" && (
              <button 
                onClick={stopAllVoice}
                className="btn btn-sm"
                style={{ background: "#dc2626", color: "#fff", padding: "4px 12px", fontSize: 12, minHeight: 28, fontWeight: 700 }}
              >
                ⏹ Stop Voice
              </button>
            )}
          </div>
        </div>

        {/* Universal 3D Mentor Gestures Bar (Active for ALL Mentors) */}
        <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 16, background: "var(--pink)", border: "1.5px solid var(--ink)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 4 }}>
            ✨ 3D Live Mentor Gestures:
          </span>
          {[
            { id: "nodding", label: "🙂 Nod (মাথা নাড়ানো)", say: "Haa Abhijit, ami tomar kotha mon diye shunchi!" },
            { id: "smiling", label: "😊 Smile (হাসি)", say: "Tomar preparation dekhe khub bhalo lagche!" },
            { id: "wave", label: "👋 Wave Hi", say: "Hello Abhijit! Kemon acho? Ajke ki porbe?" },
            { id: "explaining", label: "🙌 Explain (হাত নেড়ে বোঝানো)", say: "Ei concept-ta khub shohoz, cholo step by step dekhi!" },
            { id: "thinking", label: "💡 Think", say: "Hm, ami bhabchi problem ta niye..." },
            { id: "clap", label: "👏 Clap", say: "Darun! Tomar preparation khub bhalo hochhe!" },
            { id: "laugh", label: "😂 Laugh", say: "Hehe! Kothata shune moja laglo!" },
            { id: "dancing", label: "💃 Dance", say: "Dekho ami nachchi! Tomar porashona kintu sesh korte hobe!" },
            { id: "idle", label: "🧘 Reset Pose", say: "" }
          ].map((anim) => (
            <button
              key={anim.id}
              onClick={() => {
                setAnjali3DAnimation(anim.id as AnjaliAnimationState);
                recordVerifiedStudyActivity("voiceMentorInteractions", 1);
                if (anim.say) {
                  voiceService.stop();
                  voiceService.speak(anim.say, { character: selectedMentor.id as any, rate: playbackSpeed });
                }
              }}
              className={`btn btn-sm ${anjali3DAnimation === anim.id ? "btn-dark" : "btn-ghost"}`}
              style={{ fontSize: 11, padding: "4px 10px", background: anjali3DAnimation === anim.id ? "var(--ink)" : "#fff", color: anjali3DAnimation === anim.id ? "#fff" : "var(--ink)", border: "1.5px solid var(--ink)", fontWeight: 700 }}
            >
              {anim.label}
            </button>
          ))}
        </div>

        {selectedMentor.id === "mahi" && (
          <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 16, background: "var(--yellow)", border: "1.5px solid var(--ink)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>
              ✨ Mahi Mood Expressions:
            </span>
            {mahiMoods.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setExpression(m.id);
                  voiceService.speak(`Ami ekhon ${m.label} moode achhi. Bolo ki jante chao?`, { character: "mahi", rate: playbackSpeed });
                }}
                className={`btn btn-sm ${expression === m.id ? "btn-dark" : "btn-ghost"}`}
                style={{ fontSize: 11, padding: "4px 8px", background: expression === m.id ? "var(--ink)" : "#fff", color: expression === m.id ? "#fff" : "var(--ink)", border: "1.5px solid var(--ink)", fontWeight: 700 }}
              >
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Center Visualizer with Avatar, Mood Expressions, & Subtitles */}
        <div 
          style={{ 
            background: "linear-gradient(180deg, #FDFCF7 0%, #F5F1E6 100%)", 
            borderRadius: 24, 
            padding: 20, 
            textAlign: "center", 
            marginBottom: 20, 
            border: "2px solid var(--ink)",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.03)",
            position: "relative"
          }}
        >
          {/* Real Avatar Visualizer Component with Wide Studio Frame */}
          <div className="relative w-full max-w-[680px] h-[410px] mx-auto overflow-hidden">
            <Visualizer
              state={appState}
              characterName={selectedMentor.id}
              currentVisual={activeAvatar}
              expression={expression}
              onSelectExpression={(expr) => setExpression(expr)}
              anjali3DAnimation={anjali3DAnimation}
              onAnjaliAnimationChange={setAnjali3DAnimation}
              userName={USER.name}
            />
          </div>

          {/* Live Typewriter Floating Subtitle */}
          <div 
            className="max-w-[620px] w-full mx-auto mt-4 p-4 md:p-5 rounded-[18px] bg-white border-2 border-[var(--ink)] shadow-[4px_4px_0px_var(--ink)] text-left"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--muted)", flexWrap: "wrap", gap: 8 }}>
              <span style={{ color: "var(--ink)" }}>
                {appState === "listening" ? "🎙️ YOU ARE SPEAKING" : `✨ ${selectedMentor.name.toUpperCase()} (MENTOR)`}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="chip" style={{ background: appState === "speaking" ? "var(--yellow)" : "var(--bg)", border: "1px solid var(--ink)", fontSize: 10 }}>
                  {appState === "speaking" ? "🔊 SPEAKING ALOUD" : appState === "listening" ? "🔴 MICROPHONE LIVE" : "READY"}
                </span>
                {transcriptLog.length > 0 && (
                  <button
                    onClick={() => handleReplayVoice(transcriptLog[transcriptLog.length - 1]?.text)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: "2px 8px", border: "1px solid var(--ink)" }}
                    title="Listen to this explanation again"
                  >
                    🔊 Replay
                  </button>
                )}
                {transcriptLog.length > 0 && (
                  <button
                    onClick={() => handleSendToBoard(transcriptLog[transcriptLog.length - 1]?.text)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: "2px 8px", border: "1px solid var(--ink)" }}
                    title="Send note to Live Board"
                  >
                    📋 Send to Board
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink)", fontWeight: 500 }}>
              {appState === "listening" ? (
                currentTranscript ? `"${currentTranscript}"` : "Listening... মুখে বলুন..."
              ) : transcriptLog.length > 0 ? (
                <TypewriterText
                  text={transcriptLog[transcriptLog.length - 1]?.text}
                  speed={14}
                  chunkSize={2}
                  cursorClassName="inline-block w-1.5 h-3.5 bg-amber-500 ml-0.5 align-middle animate-pulse"
                />
              ) : (
                <span className="muted" style={{ fontStyle: "italic", color: "var(--muted)" }}>
                  🎙️ মাইকে একবার ট্যাপ করুন এবং সরাসরি কথা বলুন—কোনো অটোমেটেড টেক্সট ছাড়া লাইভ ভয়েস শুরু হবে!
                </span>
              )}
            </div>
          </div>

          {/* Real-time Animated Sound Waveform Visualization (Canvas API) */}
          <div className="max-w-[620px] w-full mx-auto mt-4 mb-2">
            <SoundWaveformCanvas appState={appState} height={80} />
          </div>

          {/* Big Glowing Microphone Button */}
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              onClick={toggleListening}
              className="btn"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: appState === "listening" ? "var(--lime)" : appState === "speaking" ? "var(--yellow)" : "var(--ink)",
                color: (appState === "listening" || appState === "speaking") ? "var(--ink)" : "#fff",
                border: "3px solid var(--ink)",
                boxShadow: "4px 4px 0px var(--ink)",
                fontSize: 32,
                cursor: "pointer",
                transition: "transform 0.15s ease"
              }}
              title={appState === "listening" ? "Stop Live Voice Session" : "Start Live Voice Session"}
            >
              {appState === "listening" ? "🔴" : appState === "speaking" ? "🔊" : "🎙️"}
            </button>
            <p style={{ marginTop: 10, fontWeight: 800, fontSize: 13, color: "var(--ink)" }}>
              {appState === "listening" 
                ? "🎙️ Live Stream Active — Click to finish (কথা শেষ হলে চাপুন)" 
                : "Tap Mic to Talk Live with Mentor (কথা বলতে চাপুন)"}
            </p>
          </div>
        </div>

        {/* Live Board Split View / Drawer */}
        {showLiveBoard && (
          <div style={{ marginBottom: 24, borderRadius: 24, overflow: "hidden", border: "2px solid var(--ink)", boxShadow: "5px 5px 0px var(--ink)" }}>
            <div style={{ background: "var(--ink)", color: "#fff", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 800 }}>📋 Interactive Live Board — Drawing & Formula Canvas</span>
                <span className="badge-pill" style={{ background: "var(--lime)", color: "var(--ink)", fontSize: 10 }}>Sync with Mentor</span>
              </div>
              <button onClick={() => setShowLiveBoard(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <RealLiveBoard
              elements={boardElements}
              isExpanded={false}
              onToggleExpand={() => {}}
              onClearBoard={() => setBoardElements([])}
              onAddElement={(el) => setBoardElements(prev => [...prev, { ...el, id: Date.now().toString() + Math.random(), timestamp: Date.now() }])}
            />
          </div>
        )}

        {/* Quick Voice Prompt Strip */}
        <div style={{ marginBottom: 18 }}>
          <p className="kicker" style={{ fontSize: 13, marginBottom: 8 }}>⚡ Quick WBCHSE Class 12 Sem 3 Prompts:</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {currentActionChips.map((chip: any, idx: number) => (
              <button 
                key={idx} 
                onClick={() => handleAskVoiceAI(chip.prompt, chip.anim)}
                className="btn btn-ghost btn-sm"
                style={{ 
                  fontSize: 12, 
                  background: chip.label.includes("Dance") ? "var(--pink)" : chip.label.includes("Bio") ? "var(--lime)" : "var(--bg)", 
                  borderColor: "var(--ink)",
                  fontWeight: 600
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Transcript Log */}
        <div className="chat" style={{ minHeight: 220, maxHeight: 380, overflowY: "auto", marginBottom: 18, border: "1.5px solid var(--ink)", borderRadius: 18, padding: 18, background: "var(--bg)" }}>
          {transcriptLog.map((line, idx) => (
            <div 
              key={idx} 
              className={`bubble ${line.sender === "user" ? "me" : "ai"}`}
              style={{
                background: line.sender === "user" ? "var(--ink)" : "#fff",
                color: line.sender === "user" ? "#fff" : "var(--ink)",
                border: line.sender === "user" ? "none" : "1.5px solid var(--ink)",
                boxShadow: "2px 2px 0px rgba(0,0,0,0.06)",
                marginBottom: 12
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{line.sender === "user" ? `You (${USER.name})` : selectedMentor.name} · {line.time}</span>
                {line.sender === "stranger" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleReplayVoice(line.text)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: "0 4px", fontWeight: 700 }}
                      title="Listen again"
                    >
                      🔊 Replay
                    </button>
                    <button
                      onClick={() => handleSendToBoard(line.text)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: "0 4px", fontWeight: 700 }}
                      title="Send to Live Board"
                    >
                      📋 Board
                    </button>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                {line.text}
              </div>
            </div>
          ))}
        </div>

        {/* Text Input Fallback */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!inputTopic.trim()) return;
            handleAskVoiceAI(inputTopic);
            setInputTopic("");
          }}
          style={{ display: "flex", gap: 10 }}
        >
          <input 
            value={inputTopic} 
            onChange={(e) => setInputTopic(e.target.value)}
            placeholder={`Type question or speak aloud with ${selectedMentor.name}...`} 
            style={{ flex: 1, height: 48, borderRadius: 14, border: "1.5px solid var(--ink)", padding: "0 16px", fontSize: 14, background: "#fff", outline: "none" }}
          />
          <button className="btn btn-dark" type="submit" style={{ padding: "0 20px", fontWeight: 700 }}>
            Ask & Hear
          </button>
        </form>
      </div>
    </div>
  );
}

// 4. 3D Concept Flashcards (Spaced repetition & bilingual revision)
export function Flash() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"chapter" | "3d">("chapter");

  useEffect(() => {
    recordVerifiedStudyActivity("flashcardsReviewed", 5);
  }, [tab]);

  return (
    <div>
      <ToolHeader title="3D Concept Flashcards" tag="WBCHSE Sem 3 Revision" onBack={() => nav("/app")} />
      
      {/* Mode Switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setTab("chapter")}
          className={`btn btn-sm ${tab === "chapter" ? "btn-dark" : "btn-ghost"}`}
          style={{ borderRadius: 12, fontWeight: 700 }}
        >
          ⚡ চ্যাপ্টার ফ্ল্যাশকার্ড (Bilingual WBCHSE)
        </button>
        <button
          onClick={() => setTab("3d")}
          className={`btn btn-sm ${tab === "3d" ? "btn-dark" : "btn-ghost"}`}
          style={{ borderRadius: 12, fontWeight: 700 }}
        >
          🃏 3D ট্যাক্টাইল ডেক (Tactile 3D)
        </button>
      </div>

      <div style={{ borderRadius: 24, overflow: "hidden" }}>
        {tab === "chapter" ? (
          <ChapterFlashcards onClose={() => nav("/app")} userName={USER.name} />
        ) : (
          <RealFlashcardDeck onClose={() => nav("/app")} userName={USER.name} />
        )}
      </div>
    </div>
  );
}

// 5. Revision Notes & 1000MB PDF Study Vault
export function Notes() {
  const nav = useNavigate();
  const [activeId, setActiveId] = useState(NOTES[0].id);
  const currentNote = NOTES.find((n) => n.id === activeId) || NOTES[0];

  const [pdfSourceType, setPdfSourceType] = useState<PDFSourceType>("none");
  const [pdfData, setPdfData] = useState<string>("");
  const [pdfName, setPdfName] = useState<string>("");
  const [pdfSize, setPdfSize] = useState<string>("");
  const [pdfId, setPdfId] = useState<string | undefined>(undefined);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [generatedNotes, setGeneratedNotes] = useState<string>("");
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

  return (
    <div>
      <ToolHeader title="PDF Library, Folders & Revision Notes" tag="In-Page PDF Reader & Admin Folders" onBack={() => nav("/app")} />

      <div style={{ marginBottom: 24 }}>
        <PDFUploadZone
          sourceType={pdfSourceType}
          onSourceTypeChange={setPdfSourceType}
          pdfData={pdfData}
          pdfName={pdfName}
          pdfSize={pdfSize}
          pdfId={pdfId}
          pdfUrl={pdfUrl}
          generatedNotes={generatedNotes}
          onPdfDataChange={(d) => {
            setPdfData(d.pdfData);
            setPdfName(d.pdfName);
            setPdfSize(d.pdfSize);
            setPdfId(d.pdfId);
          }}
          onPdfUrlChange={setPdfUrl}
          onGeneratedNotesChange={setGeneratedNotes}
          onPreviewRequest={(dataOrUrl, fileName) => {
            setPreviewDoc({ url: dataOrUrl, name: fileName });
          }}
          maxSizeMB={1000}
          label="PDF Library, Folder Vault & Instant Document Viewer"
        />
      </div>
      
      <div className="row" style={{ marginBottom: 14 }}>
        {NOTES.map((n) => (
          <button 
            key={n.id} 
            className={`btn ${activeId === n.id ? "btn-dark" : "btn-ghost"}`} 
            onClick={() => setActiveId(n.id)}
          >
            {n.subject}
          </button>
        ))}
      </div>

      <div className="panel">
        <p className="kicker">{currentNote.subject}</p>
        <h2 style={{ fontSize: 32 }}>{currentNote.title}</h2>
        <p className="bn muted" style={{ fontSize: 16 }}>{currentNote.bn}</p>
        
        <div style={{ marginTop: 20 }}>
          {currentNote.points.map((p, i) => (
            <div 
              key={i} 
              style={{ 
                padding: "14px 18px", 
                marginBottom: 10, 
                borderRadius: 14, 
                background: "var(--bg)", 
                border: "1px solid var(--line)", 
                display: "flex", 
                gap: 12 
              }}
            >
              <b style={{ color: "var(--ink)", minWidth: 24 }}>0{i + 1}.</b>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.name || "Uploaded Study PDF"}
          pdfData={previewDoc.url}
          pdfName={previewDoc.name}
          type="pdf"
          subject="WBCHSE Sem 3 Vault"
        />
      )}
    </div>
  );
}

// 6. Concept Mind Maps
export function Mind() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Concept Mind Maps" tag="Visual Knowledge Trees" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <RealMindMap onClose={() => nav("/app")} />
      </div>
    </div>
  );
}

// 7. WBCHSE MCQ Bank & Model Solutions
export function McqBank() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"repository" | "quiz">("repository");

  return (
    <div>
      <ToolHeader title="WBCHSE MCQ Bank" tag="Chapterwise MCQs & Solutions" onBack={() => nav("/app")} />
      
      {/* Mode Switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setTab("repository")}
          className={`btn btn-sm ${tab === "repository" ? "btn-dark" : "btn-ghost"}`}
          style={{ borderRadius: 12, fontWeight: 700 }}
        >
          📖 মডেল প্রশ্নব্যাংক ও সমাধান (Question Bank)
        </button>
        <button
          onClick={() => setTab("quiz")}
          className={`btn btn-sm ${tab === "quiz" ? "btn-dark" : "btn-ghost"}`}
          style={{ borderRadius: 12, fontWeight: 700 }}
        >
          📝 ইন্টারেক্টিভ কুইজ মোড (Interactive Quiz)
        </button>
      </div>

      <div style={{ borderRadius: 24, overflow: "hidden" }}>
        {tab === "repository" ? (
          <RealQuestionBank onClose={() => nav("/app")} />
        ) : (
          <RealQuestionBankQuiz onClose={() => nav("/app")} userName={USER.name} />
        )}
      </div>
    </div>
  );
}

// 8. Speed Blitz (60-second rapid fire sprint)
export function Blitz() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Speed Blitz" tag="60s Fast Quiz" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <RealSpeedBlitz onClose={() => nav("/app")} userName={USER.name} />
      </div>
    </div>
  );
}

// 9. Focus Study Room (Pomodoro + ambient beats)
export function Focus() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Focus Study Room" tag="Pomodoro & Study Audio" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <RealFocusStudyRoom onClose={() => nav("/app")} userName={USER.name} />
      </div>
    </div>
  );
}

// 10. Question Scanner (Camera & Photo Multimodal OCR)
export function Scanner() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Question Scanner" tag="Gemini OCR AI" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <RealSmartScanner onClose={() => nav("/app")} />
      </div>
    </div>
  );
}

// 11. Math Lab & LaTeX Equation Solver
export function Formulas() {
  const nav = useNavigate();
  const account = resolveCurrentUserName();
  return (
    <div>
      <ToolHeader title="Math Lab (LaTeX Solver)" tag="WBCHSE Sem 4 AI Solver & Answer Key PDF" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <RealMathSolver onClose={() => nav("/app")} userName={account.name} userId={account.uid} />
      </div>
    </div>
  );
}

// 12. Mistake Bank & AI Weakness Diagnostic
export function Mistakes() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"analyzer" | "bank">("analyzer");

  // Load saved mistakes from localStorage or provide high-yield WBCHSE sample diagnostic questions
  const savedMistakes = React.useMemo(() => {
    try {
      const s = localStorage.getItem("mistake_bank");
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: any, idx: number) => ({
            id: m.id || idx,
            question: m.question,
            options: m.options,
            correctIndex: m.correctAnswer !== undefined ? m.correctAnswer : m.correctIndex,
            userAnswerIndex: m.userAnswerIndex !== undefined ? m.userAnswerIndex : 1, // sample wrong
            chapter: m.subject || "WBCHSE Class 12 Sem 3",
            subject: m.subject || "Biology / Bengali",
            explanation: m.explanation,
            bilingualExplanation: {
              bn: m.explanation || "সঠিক উত্তরটি সিলেবাস অনুযায়ী যথাযথ নিয়ম মেনে নির্ধারণ করা হয়েছে।",
              en: "Detailed syllabus verified concept explanation.",
              keyPoint: "WBCHSE Sem 3 High-Yield Topic"
            }
          }));
        }
      }
    } catch {}

    // Default sample diagnostic if none saved yet
    return [
      {
        id: "diag-1",
        question: "মানুষের শুক্রাণুর কোন অংশ ডিম্বাণুর জোনা পেলুসিডাকে বিদীর্ণ করতে প্রয়োজনীয় উৎসেচক ধারণ করে?",
        options: ["অ্যাক্রোজম (Acrosome)", "মধ্যখণ্ড বা মাইটোকন্ড্রিয়া", "পুচ্ছ বা টেল", "সেন্ট্রিওল"],
        correctIndex: 0,
        userAnswerIndex: 1, // student selected wrong option
        chapter: "Human Reproduction (Unit I)",
        subject: "Biology",
        bilingualExplanation: {
          bn: "অ্যাক্রোজম মস্তকের অগ্রভাগে অবস্থিত পরিবর্তিত গলগি বডি, যাতে হায়ালুরোনিডেজ ও অ্যাক্রোসিন উৎসেচক থাকে যা ZP3 রিসেপ্টরে আবদ্ধ হয়।",
          en: "Acrosome contains hydrolytic enzymes that digest the zona pellucida via ZP3 receptors.",
          keyPoint: "ZP3 receptor binds to acrosome enzymes."
        }
      },
      {
        id: "diag-2",
        question: "স্ত্রী জননতন্ত্রে এল.এইচ. সার্জ (LH Surge) চক্রের কততম দিনে ঘটে এবং এর ফল কী?",
        options: ["৫ম দিনে", "১০ম দিনে", "১৪তম দিনে (Day 14)", "২৮তম দিনে"],
        correctIndex: 2,
        userAnswerIndex: -1, // skipped
        chapter: "Menstrual Cycle (Unit I)",
        subject: "Biology",
        bilingualExplanation: {
          bn: "ঋতুচক্রের ১৪তম দিনে পিটুইটারি থেকে LH ক্ষরণ সর্বোচ্চ হয় (LH Surge), যার ফলে ডিম্বপাত (Ovulation) ঘটে।",
          en: "Day 14 LH surge triggers ovulation from the Graafian follicle.",
          keyPoint: "Day 14 = LH Peak = Ovulation."
        }
      },
      {
        id: "diag-3",
        question: "DNA দ্বিসূত্রকের গুয়ানিন (G) ও সাইটোসিন (C)-এর মধ্যে কয়টি হাইড্রোজেন বন্ধন থাকে?",
        options: ["১টি", "২টি", "৩টি (3 H-Bonds)", "৪টি"],
        correctIndex: 2,
        userAnswerIndex: 1,
        chapter: "Molecular Basis of Inheritance (Unit II)",
        subject: "Biology",
        bilingualExplanation: {
          bn: "G এবং C-এর মধ্যে ৩টি হাইড্রোজেন বন্ধন থাকে (G ≡ C)। A এবং T-এর মধ্যে ২টি থাকে (A = T)।",
          en: "Guanine and Cytosine form 3 hydrogen bonds, while Adenine and Thymine form 2.",
          keyPoint: "G≡C has 3 bonds (higher melting temperature)."
        }
      },
      {
        id: "diag-4",
        question: "জয়রাম মোক্তার আদিরিনী হাতিটিকে কত টাকায় কিনেছিলেন?",
        options: ["১০০০ টাকা", "১৫০০ টাকা", "২০০০ টাকা", "৩০০০ টাকা"],
        correctIndex: 2,
        userAnswerIndex: 0,
        chapter: "আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)",
        subject: "Bengali",
        bilingualExplanation: {
          bn: "জয়রাম মোক্তার ২০০০ টাকায় আদিরিনীকে কিনেছিলেন। হাতিটিকে কন্যার মতো ভালোবাসতেন।",
          en: "Jayram Mokhtar purchased Adarini the elephant for 2000 rupees.",
          keyPoint: "আদিরিনীর ক্রয়মূল্য ২০০০ টাকা।"
        }
      },
      {
        id: "diag-5",
        question: "In Anton Chekhov's 'The Bet', what was the wager amount and the duration of solitary confinement?",
        options: ["1 million rubles for 10 years", "2 million rubles for 15 years", "5 million rubles for 20 years", "2 million rubles for 5 years"],
        correctIndex: 1,
        userAnswerIndex: 0,
        chapter: "The Bet (Anton Chekhov)",
        subject: "English",
        bilingualExplanation: {
          bn: "১৫ বছরের নির্জন কারাবাসের শর্তে ২ মিলিয়ন (২০ লক্ষ) রুবেলের বাজি ধরা হয়েছিল।",
          en: "The wager was 2 million rubles for 15 years in the banker's garden house.",
          keyPoint: "2 million rubles, 15 years solitary confinement."
        }
      }
    ];
  }, []);

  return (
    <div>
      <ToolHeader title="AI Mistake Bank & Diagnostic" tag="Error Review & Weakness Tracker" onBack={() => nav("/app")} />
      
      {/* Mode Switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setTab("analyzer")}
          className={`btn btn-sm ${tab === "analyzer" ? "btn-dark" : "btn-ghost"}`}
          style={{ borderRadius: 12, fontWeight: 700 }}
        >
          🧠 AI ভুল ও দুর্বলতা ট্র্যাকার (Diagnostic Engine)
        </button>
        <button
          onClick={() => setTab("bank")}
          className={`btn btn-sm ${tab === "bank" ? "btn-dark" : "btn-ghost"}`}
          style={{ borderRadius: 12, fontWeight: 700 }}
        >
          📁 সংরক্ষিত ভুল প্রশ্নব্যাংক (Saved Mistake Bank)
        </button>
      </div>

      <div style={{ borderRadius: 24, overflow: "hidden" }}>
        {tab === "analyzer" ? (
          <MistakeAnalyzer
            questions={savedMistakes}
            subject="WBCHSE Class 12 Sem 3"
            topic="Biology, Bengali & English"
            onClose={() => nav("/app")}
            onRetest={() => nav("/app/mock")}
          />
        ) : (
          <RealMistakeBank onClose={() => nav("/app")} />
        )}
      </div>
    </div>
  );
}

// 12b. Study Streaks, Badges & Rewards
export function Streaks() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Daily Study Streak & Badges" tag="Gamified Rewards" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden" }}>
        <StudyStreakTracker userName={USER.name} onExplore={() => nav("/app/mock")} />
      </div>
    </div>
  );
}

// 13. Class 12 Roadmap Checklist
export function Syllabus() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Class 12 Roadmap" tag="WBCHSE Sem 4 Tracker" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <RealSyllabus isOpen={true} onClose={() => nav("/app")} userName={USER.name} />
      </div>
    </div>
  );
}

// 14. AI Memory Vault (Persistent memories)
export function Memory() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="AI Memory Vault" tag="Persistent Knowledge" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <RealAIMemoryVault isOpen={true} onClose={() => nav("/app")} userId="default" userName={USER.name} />
      </div>
    </div>
  );
}

// 15. 3D Science Lab (Interactive 3D molecules, physics, math)
export function Lab() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="3D Science Lab" tag="Interactive 3D Models" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <RealScienceLab3D isModal={false} onClose={() => nav("/app")} />
      </div>
    </div>
  );
}

// 16. AI Weak Area Autopsy
export function Autopsy() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="AI Weak Area Autopsy" tag="Mistake Diagnostic" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <AIExamAutopsyModal 
          onClose={() => nav("/app")} 
          userName={USER.name} 
          onOpenSpeedBlitz={() => nav("/app/blitz")} 
        />
      </div>
    </div>
  );
}

// 17. Voice MCQ Challenge (Speech input & audio questions)
export function VoiceQuiz() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Voice MCQ Challenge" tag="Voice Answering" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <VoiceMCQQuizModal onClose={() => nav("/app")} userName={USER.name} />
      </div>
    </div>
  );
}

// 18. 1v1 Friend Quiz Duel Arena (Real-time with 6-digit room codes)
export function Duel() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="1v1 Friend Quiz Duel" tag="Multiplayer Battle Arena" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <FriendQuizDuelModal 
          onClose={() => nav("/app")} 
          userName={USER.name} 
          userId="abhijit" 
        />
      </div>
    </div>
  );
}

// 19. Model Paper OMR PDF (Printable 1-click test paper)
export function ModelPaper() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Model Paper + OMR Sheet" tag="Printable Test Paper" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <PrintableMockPDFModal onClose={() => nav("/app")} userName={USER.name} />
      </div>
    </div>
  );
}

// 20. Formula & Quote Diary
export function Diary() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Formula Quote Diary" tag="Sticky Bookmarks" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <FormulaStickyDiaryModal onClose={() => nav("/app")} userName={USER.name} />
      </div>
    </div>
  );
}

// 21. Notice Board PDFs (Official WBCHSE routines)
export function Notices() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Official Notice Board" tag="WBCHSE Routine & Circulars" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <NoticeBoardModal onClose={() => nav("/app")} />
      </div>
    </div>
  );
}

// 22. Telegram AI Bot Portal
export function Telegram() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Telegram AI Bot" tag="Daily Bot Hub" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <TelegramPortal 
          user={auth.currentUser} 
          userData={{ displayName: USER.name, email: "abhijit@wbchse.in" }} 
          onNavigateHome={() => nav("/app")} 
        />
      </div>
    </div>
  );
}

// 23. Daily Calls & Parent Vigilance
export function Vigilance() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="Daily Calls & Parent Vigilance" tag="Accountability Partner" onBack={() => nav("/app")} />
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}>
        <AccountabilityVigilanceModal 
          isOpen={true} 
          onClose={() => nav("/app")} 
          user={{ displayName: USER.name }} 
        />
      </div>
    </div>
  );
}

// 24. AI Mentors Studio
export function Mentors() {
  const nav = useNavigate();
  return (
    <div>
      <ToolHeader title="AI Mentors Studio" tag="4 Specialized Companions" onBack={() => nav("/app")} />
      <div className="mentor-grid">
        {MENTORS.map((m) => (
          <article 
            key={m.id} 
            className="mentor" 
            style={{ background: m.color }}
            onClick={() => nav("/app/voice")}
          >
            <b>{m.name}</b>
            <div className="bn">{m.bn}</div>
            <p style={{ marginTop: 6, fontWeight: 500 }}>{m.role}</p>
            <small className="muted">{m.tone}</small>
            <div style={{ marginTop: 12 }}>
              <span className="btn btn-dark btn-sm" style={{ fontSize: 12, padding: "4px 12px" }}>
                Talk with {m.name.split(" ")[0]} →
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// 25. Interactive AI Live Board (Whiteboard & Diagrams)
export function Board() {
  const nav = useNavigate();
  const [boardElements, setBoardElements] = useState<BoardElement[]>([]);

  const presets = [
    {
      id: "bio-repro",
      label: "🧬 Biology: Reproduction & ZP3",
      elements: [
        {
          type: "text" as const,
          content: `# 🧬 জীববিদ্যা: মানব জনন ও নিষেক (Human Reproduction & Fertilization)
**WBCHSE Class 12 Sem 3 • High-Yield Biology**

### ১. শুক্রাণুর গঠন (Human Sperm Cell Structure):
- **মস্তক (Head):** অ্যাক্রোজোম ক্যাপ (গলগি বডি থেকে উৎপন্ন lytic enzymes) এবং হ্যাপ্লয়েড নিউক্লিয়াস ($n=23$ ক্রোমোজোম)।
- **মধ্যখণ্ড (Midpiece):** স্পাইরাল মাইটোকন্ড্রিয়া (শক্তিঘর যা শুক্রাণুর গতির জন্য ATP জোগায়)।
- **পুচ্ছ (Tail):** অ্যাক্সিয়াল ফিলামেন্ট ($9+2$ মাইক্রোটিউবিউল সজ্জা) যা সন্তরণে সাহায্য করে।

### ২. নিষেক পদ্ধতি ও রিসেপ্টর (Fertilization & ZP3):
- শুক্রাণু ডিম্বাণুর করোনা রেডিয়েটা ভেদ করে **জোনা পেলুসিডা (Zona Pellucida)** স্তরে পৌঁছায়।
- জোনা পেলুসিডার গ্লাইকোপ্রোটিন **ZP3 রিসেপ্টর**-এর সাথে শুক্রাণুর অ্যাক্রোজোম যুক্ত হয়।
- **LH Surge:** রজঃচক্রের **১৪তম দিনে** ঘটে যা ওভুলেশন সম্পন্ন করে।`
        },
        {
          type: "image" as const,
          content: "sperm anatomy fertilization acrosome biology diagram"
        }
      ]
    },
    {
      id: "genetics-dna",
      label: "🔬 Genetics: DNA Replication Fork",
      elements: [
        {
          type: "text" as const,
          content: `# 🔬 বংশগতি ও আণবিক ভিত্তি: DNA প্রতিলিপিকরণ (DNA Replication)
**WBCHSE Class 12 Sem 3 • Genetics Core**

### ১. প্রতিলিপিকরণের প্রধান উৎসেচক ও প্রোটিন:
- **DNA Helicase:** DNA ডবল হেলিক্সের হাইড্রোজেন বন্ধন ভেঙে ফর্ক তৈরি করে।
- **SSB Protein (Single-Stranded Binding):** উন্মুক্ত একক সূত্রদ্বয়কে পুনরায় জোড়া লাগতে বাধা দেয়।
- **Topoisomerase / Gyrase:** সুপারকয়েলিং টেনশন দূর করে।
- **RNA Primase:** ৩'-OH প্রান্তযুক্ত ছোট RNA প্রাইমার সংশ্লেষ করে।
- **DNA Polymerase III:** প্রধান পলিমারাইজেশন কার্যকারী (৫' $\\to$ ৩' অভিমুখে)।

### ২. ওকাজাকি খণ্ড (Okazaki Fragments):
- **Leading Strand:** অবিচ্ছিন্নভাবে গঠিত হয়।
- **Lagging Strand:** টুকরো টুকরো ওকাজাকি খণ্ডে গঠিত হয় যা **DNA Ligase** জোড়া লাগায়।`
        },
        {
          type: "image" as const,
          content: "dna replication fork molecular biology genetics diagram"
        }
      ]
    },
    {
      id: "math-calc",
      label: "📐 Math: Calculus & Integration",
      elements: [
        {
          type: "text" as const,
          content: `# 📐 উচ্চতর গণিত: সমাকলন ও কলনবিদ্যা (Calculus Integration)
**WBCHSE Class 12 Sem 3 • Mathematics Formula Sheet**

### ১. আংশিক সমাকলন সূত্র (Integration by Parts - ILATE Rule):
$$\\int u \\cdot v \\, dx = u \\int v \\, dx - \\int \\left( \\frac{du}{dx} \\int v \\, dx \\right) dx$$

> 📌 **ILATE ক্রম:** 
> - **I:** Inverse Trigonometric ($\\sin^{-1}x, \\tan^{-1}x$)
> - **L:** Logarithmic ($\\ln x$)
> - **A:** Algebraic ($x^2, 3x$)
> - **T:** Trigonometric ($\\sin x, \\cos x$)
> - **E:** Exponential ($e^x, 2^x$)`
        },
        {
          type: "image" as const,
          content: "calculus integration formula mathematics graph"
        }
      ]
    },
    {
      id: "bengali-adarini",
      label: "📚 বাংলা: আদিরিনী (প্রভাত কুমার)",
      elements: [
        {
          type: "text" as const,
          content: `# 📚 বাংলা এ: আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)
**WBCHSE Class 12 Sem 3 • সাহিত্য সংকলন**

### মূল চরিত্র ও প্রেক্ষাপট:
- **জয়রাম মোক্তার:** কৃষ্ণনগরের স্বনামধন্য ও বয়োবৃদ্ধ মোক্তার, হস্তীপ্রেমিক ও স্নেহশীল অভিভাবক।
- **আদিরিনী:** প্রিয় হস্তিনী, যাকে জয়রাম মোক্তার **২,০০০ টাকায়** ক্রয় করেছিলেন।
- **কাহিনীর ট্র্যাজেডি:** জয়রামের আর্থিক সংকট ও পারিবারিক দেনা, আদিরিনীকে নিলামে তোলার বেদনা এবং শেষ পর্যন্ত আদিরিনীর মৃত্যু ও জয়রামের হৃদয়ের চরম রক্তক্ষরণ।

> 📌 **পরীক্ষার জন্য গুরুত্বপূর্ণ তথ্য:** আদিরিনী হস্তিনীর মূল্য ছিল ২০০০ টাকা। গল্পটি প্রভাত কুমার মুখোপাধ্যায়ের শ্রেষ্ঠ সৃষ্টির অন্যতম।`
        },
        {
          type: "image" as const,
          content: "elephant adarini bengal literature rural vintage sketch"
        }
      ]
    }
  ];

  const loadQuickPreset = (preset: typeof presets[0]) => {
    const formatted = preset.elements.map(el => ({
      ...el,
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now()
    }));
    setBoardElements(formatted);
  };

  return (
    <div>
      <ToolHeader title="Interactive AI Live Board" tag="Whiteboard & KaTeX Studio" onBack={() => nav("/app")} />
      
      {/* Top Quick Syllabus Preset Launch Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap" }}>
          ⚡ Quick Presets:
        </span>
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => loadQuickPreset(p)}
            className="btn btn-ghost btn-sm"
            style={{ 
              background: "#fff", 
              border: "1.5px solid var(--ink)", 
              boxShadow: "2px 2px 0px var(--ink)",
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: "nowrap",
              cursor: "pointer"
            }}
          >
            {p.label}
          </button>
        ))}
        {boardElements.length > 0 && (
          <button
            onClick={() => setBoardElements([])}
            className="btn btn-sm"
            style={{ 
              background: "#fee2e2", 
              color: "#991b1b", 
              border: "1.5px solid #ef4444", 
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: "nowrap",
              cursor: "pointer"
            }}
          >
            🗑️ Clear Board
          </button>
        )}
      </div>

      <div style={{ minHeight: "82vh", borderRadius: 24, overflow: "hidden", border: "2px solid var(--ink)", boxShadow: "5px 5px 0px var(--ink)" }}>
        <RealLiveBoard
          elements={boardElements}
          isExpanded={true}
          onToggleExpand={() => {}}
          onClearBoard={() => setBoardElements([])}
          onAddElement={(el) => setBoardElements(prev => [...prev, { ...el, id: Date.now().toString() + Math.random(), timestamp: Date.now() }])}
        />
      </div>
    </div>
  );
}

export function ToolsDirectory() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.desc.toLowerCase().includes(search.toLowerCase()) ||
      tool.tag.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCat === "all") return true;
    if (selectedCat === "ai") return ["voice", "doubt", "scanner", "mentors", "memory"].includes(tool.id);
    if (selectedCat === "practice") return ["mock", "mcq", "blitz", "duel", "voicequiz", "flash"].includes(tool.id);
    if (selectedCat === "pdf") return ["notes", "notices", "pdf", "diary"].includes(tool.id);
    if (selectedCat === "strategy") return ["lab", "mind", "math", "mistakes", "syllabus", "autopsy", "focus", "telegram", "calls"].includes(tool.id);
    return true;
  });

  return (
    <div>
      <div className="top-row">
        <div className="greet">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span className="badge-pill" style={{ background: 'var(--yellow)' }}>🛠️ 24 STUDIO TOOLS</span>
            <span className="badge-pill" style={{ background: '#fff' }}>WBCHSE Sem 3</span>
          </div>
          <h1>Studio Tools Directory</h1>
          <p>Personalized tutoring, exam simulations, 3D science labs, and instant doubt solvers.</p>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Search all 24 tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 260px',
            padding: '10px 14px',
            borderRadius: 14,
            border: '2px solid var(--ink)',
            background: '#fff',
            fontSize: 13,
            fontWeight: 600
          }}
        />
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'all', label: 'All (24)' },
            { id: 'ai', label: '🤖 AI & Voice' },
            { id: 'practice', label: '🎯 Mocks & Practice' },
            { id: 'pdf', label: '📚 PDF & Vault' },
            { id: 'strategy', label: '⚡ Lab & Focus' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className="chip"
              style={{
                background: selectedCat === c.id ? 'var(--ink)' : '#fff',
                color: selectedCat === c.id ? '#fff' : 'var(--ink)',
                border: '1.5px solid var(--ink)',
                cursor: 'pointer',
                fontWeight: 800,
                padding: '6px 12px'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-grid">
        {filteredTools.map((t) => (
          <div
            key={t.id}
            onClick={() => nav(t.to)}
            className="tool-card"
            style={{
              border: '1.5px solid var(--ink)',
              boxShadow: '4px 5px 0 var(--ink)',
              cursor: 'pointer'
            }}
          >
            <div>
              <div className="mini-row">
                <span className="ico" style={{ background: t.color, border: '1.5px solid var(--ink)' }}>✦</span>
                <span className="tag">{t.tag}</span>
              </div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
            <small style={{ fontWeight: 700 }}>Open tool →</small>
          </div>
        ))}
      </div>
    </div>
  );
}

