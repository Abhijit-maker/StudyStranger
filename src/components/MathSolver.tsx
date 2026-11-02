import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Calculator,
  ArrowRight,
  BookOpen,
  Clock,
  AlertCircle,
  History,
  Sparkles,
  Send,
  Loader2,
  Camera,
  Upload,
  Volume2,
  RotateCcw,
  MessageSquare,
  Info,
  Brain,
  Download,
  FileText,
  File as FileIcon,
  Image as ImageIcon,
  Key,
  CheckCircle,
  ListOrdered,
  Layers,
  Check,
  ChevronRight
} from "lucide-react";
import "katex/dist/katex.min.css";
import { MathText } from "./MathText";
import { ApiKeyGuardModal } from "./ApiKeyGuardModal";
import {
  exportMathSolutionToPdf,
  exportMathSolutionToPng,
  MathPdfExportPayload,
} from "../utils/richPdfExporter";
import { savePdfDataUrlToIndexedDB } from "../services/pdfStorageService";
import {
  solveProblemWithImage,
  getStrangerAudio,
  getStrangerResponse,
  safeJsonParse,
  getPreferences,
  getStoredGeminiApiKey,
  resolveCurrentUserName
} from "../services/geminiService";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const FORMULA_CATEGORIES = [
  {
    name: "Calculus (Sem 4 Integrals & Diff Eq)",
    formulas: [
      { label: "Standard Integral dx/(x²+a²)", latex: "\\int \\frac{dx}{x^2+a^2} = \\frac{1}{a}\\tan^{-1}\\left(\\frac{x}{a}\\right) + C" },
      { label: "Integration by Parts", latex: "\\int u\\,dv = uv - \\int v\\,du" },
      { label: "Linear Diff Eq (I.F.)", latex: "\\frac{dy}{dx} + Py = Q, \\; \\text{I.F.} = e^{\\int P\\,dx}" },
      { label: "Standard Root Integral", latex: "\\int \\frac{dx}{\\sqrt{a^2-x^2}} = \\sin^{-1}\\left(\\frac{x}{a}\\right) + C" }
    ]
  },
  {
    name: "Vectors & 3D Geometry (Sem 4)",
    formulas: [
      { label: "Shortest Distance (Skew Lines)", latex: "d = \\frac{|(\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 \\times \\vec{b}_2)|}{|\\vec{b}_1 \\times \\vec{b}_2|}" },
      { label: "Vector Cross Product", latex: "\\vec{a} \\times \\vec{b} = |\\vec{a}||\\vec{b}|\\sin\\theta \\,\\hat{n}" },
      { label: "Direction Cosines", latex: "l^2 + m^2 + n^2 = 1" }
    ]
  },
  {
    name: "Optics & Modern Physics (Sem 4)",
    formulas: [
      { label: "Lens Maker’s Formula", latex: "\\frac{1}{f} = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)" },
      { label: "Brewster’s Law", latex: "\\tan(i_p) = \\mu" },
      { label: "Einstein’s Photoelectric Eq", latex: "h\\nu = \\Phi_0 + \\frac{1}{2}m v_{\\max}^2" },
      { label: "de Broglie Wavelength", latex: "\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2mE}}" }
    ]
  },
  {
    name: "Electrochem & Kinetics (Sem 4)",
    formulas: [
      { label: "Nernst Equation (298 K)", latex: "E = E^\\circ - \\frac{0.0591}{n}\\log_{10} Q" },
      { label: "First Order Half Life", latex: "t_{1/2} = \\frac{0.693}{k}" },
      { label: "Arrhenius Equation", latex: "k = A \\, e^{-\\frac{E_a}{RT}}" }
    ]
  }
];

export interface MathQuestionDetail {
  questionNumber: string;
  questionTitle: string;
  questionText?: string;
  analysis: string;
  steps: { step: string; explanation: string }[];
  finalAnswer: string;
}

interface MathSolverProps {
  onClose: () => void;
  apiKey?: string;
  userName?: string;
  userId?: string;
  onSolved?: (problem: string) => void;
  onOpenApiKeyPrompt?: () => void;
}

const MAX_FREE_SOLVES = 5;

export const MathSolver: React.FC<MathSolverProps> = ({
  onClose,
  apiKey,
  userName = "Student",
  userId,
  onSolved,
  onOpenApiKeyPrompt
}) => {
  const accountInfo = resolveCurrentUserName(userName);
  const effectiveUserName = accountInfo.name;
  const effectiveUserId = userId || accountInfo.uid;

  const [problem, setProblem] = useState(() => localStorage.getItem("draft_math_problem") || "");
  const [image, setImage] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [steps, setSteps] = useState<{ step: string; explanation: string }[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [historyList, setHistoryList] = useState<{ id: string; title: string; data: any }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Follow-up doubts state
  const [followUpList, setFollowUpList] = useState<{ question: string; answer: string }[]>([]);
  const [followUpQuery, setFollowUpQuery] = useState("");
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  // Multi-Question State ("ফরওয়ার্ড ১-২ ফরম্যাট")
  const [questionsList, setQuestionsList] = useState<MathQuestionDetail[]>([]);
  const [activeQuestionTab, setActiveQuestionTab] = useState<number | "all">("all");
  const [isMultiQuestion, setIsMultiQuestion] = useState(false);

  // Account-bound Quota Management: 5 Free Solves per new account
  const quotaKey = effectiveUserId && effectiveUserId !== "default" && effectiveUserId !== "guest"
    ? `math_lab_free_uses_${effectiveUserId}`
    : "math_lab_free_uses_guest";

  const [freeSolvesCount, setFreeSolvesCount] = useState<number>(() => {
    try {
      const v = localStorage.getItem(quotaKey);
      return v ? parseInt(v, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Sync quota from Firestore user doc
  useEffect(() => {
    if (effectiveUserId && effectiveUserId !== "default" && effectiveUserId !== "guest" && effectiveUserId !== "logged_in_user") {
      getDoc(doc(db, "users", effectiveUserId)).then((snap) => {
        if (snap.exists()) {
          const d = snap.data();
          if (typeof d.mathLabFreeUses === "number") {
            setFreeSolvesCount(d.mathLabFreeUses);
            localStorage.setItem(quotaKey, String(d.mathLabFreeUses));
          }
        }
      }).catch(() => {});
    }
  }, [effectiveUserId, quotaKey]);

  const [activeApiKey, setActiveApiKey] = useState<string>(() => {
    return (apiKey || getStoredGeminiApiKey()).trim();
  });

  const [showApiKeyGuard, setShowApiKeyGuard] = useState(false);
  const [showQuotaAlertModal, setShowQuotaAlertModal] = useState(false);

  const hasPersonalKey = Boolean(activeApiKey && activeApiKey.length >= 20);
  const remainingFreeSolves = Math.max(0, MAX_FREE_SOLVES - freeSolvesCount);
  const isFreeQuotaExhausted = !hasPersonalKey && remainingFreeSolves <= 0;

  const triggerQuotaExhaustedAlert = () => {
    setShowQuotaAlertModal(true);
    try {
      const voiceText = `${effectiveUserName !== "Student" ? effectiveUserName : "প্রিয় শিক্ষার্থী"}, আপনার ৫টি ফ্রি সলভ ট্রায়াল শেষ হয়েছে। আনলিমিটেড সমাধান পেতে সেটিংসে যান অথবা নিজস্ব জেমিনি এপিআই কি দিন।`;
      getStrangerAudio(voiceText, "stranger", activeApiKey).then((audioBase64) => {
        if (audioBase64) {
          const snd = new Audio(`data:audio/mp3;base64,${audioBase64}`);
          snd.play().catch(() => {});
        }
      }).catch(() => {});
    } catch {}
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeySaved = () => {
      const key = getStoredGeminiApiKey();
      if (key) setActiveApiKey(key);
    };
    window.addEventListener("storage", handleKeySaved);
    return () => window.removeEventListener("storage", handleKeySaved);
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("ক্যামেরা ব্যবহারের অনুমতি পাওয়া যায়নি। দয়া করে ছবি আপলোড অপশনটি ব্যবহার করুন।");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        setImage(dataUrl);
        setProblem("");
        stopCamera();
      }
    }
  };

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("math_history");
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (title: string, data: any) => {
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: title.slice(0, 45) + (title.length > 45 ? "..." : ""),
      data
    };
    const updated = [newItem, ...historyList].slice(0, 20);
    setHistoryList(updated);
    localStorage.setItem("math_history", JSON.stringify(updated));
    if (onSolved) onSolved(title);
  };

  const cleanMathText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\$\$(.*?)\$\$/gs, "$1")
      .replace(/\$(.*?)\$/g, "$1")
      .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, "($1 / $2)")
      .replace(/\^\{(.*?)\}/g, "^$1")
      .replace(/\^(\d)/g, "^$1")
      .replace(/_\{(.*?)\}/g, "_$1")
      .replace(/_(\d)/g, "_$1")
      .replace(/\\times/g, " × ")
      .replace(/\\div/g, " ÷ ")
      .replace(/\\cdot/g, " · ")
      .replace(/\\pm/g, " ± ")
      .replace(/\\sqrt\{(.*?)\}/g, "√($1)")
      .replace(/\\sqrt/g, "√")
      .replace(/\\int/g, "∫")
      .replace(/\\theta/g, "θ")
      .replace(/\\pi/g, "π")
      .replace(/\\alpha/g, "α")
      .replace(/\\beta/g, "β")
      .replace(/\\infty/g, "∞")
      .replace(/\\Delta/g, "Δ")
      .replace(/\\rightarrow/g, " → ")
      .replace(/\\text\{(.*?)\}/g, "$1")
      .replace(/\\mathbf\{(.*?)\}/g, "$1")
      .replace(/\\/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const buildMathExportPayload = (): MathPdfExportPayload | null => {
    const hasSteps = steps.length > 0 || questionsList.length > 0 || Boolean(finalAnswer);
    if (!hasSteps) return null;

    const exportQuestions =
      questionsList.length > 0
        ? activeQuestionTab === "all"
          ? questionsList
          : [questionsList[activeQuestionTab] || questionsList[0]]
        : [
            {
              questionNumber: "1",
              questionTitle: "প্রশ্ন ১ (Question 1)",
              questionText: problem || "Uploaded Mathematical Problem",
              analysis: analysis || "",
              steps: steps.map((s) => ({
                step: s.step,
                explanation: s.explanation,
              })),
              finalAnswer: finalAnswer || "",
            },
          ];

    return {
      title: "WBCHSE Class 12 Sem 4 — Math Lab Master Solution",
      subtitle: `Student: ${effectiveUserName}`,
      userName: effectiveUserName,
      problemText: problem,
      problemImageDataUrl: image,
      questions: exportQuestions,
      followUps: followUpList.map((f) => ({ q: f.question, a: f.answer })),
      fileName: `StudyStranger_Sem4_Math_Solution_${Date.now().toString().slice(-5)}.pdf`,
    };
  };

  // 100% Pixel-Perfect Multi-Page Answer Key PDF Generator (Preserves Full Bengali & 2D LaTeX Math)
  const handleDownloadAnswerKeyPdf = async () => {
    const payload = buildMathExportPayload();
    if (!payload) {
      setError("আগে কোনো অংকের সমাধান তৈরি করুন, তারপর PDF ডাউনলোড করুন।");
      return;
    }

    setIsSolving(true);
    try {
      const { dataUrl } = await exportMathSolutionToPdf(payload, true);
      if (dataUrl && payload.fileName) {
        savePdfDataUrlToIndexedDB(dataUrl, payload.fileName, undefined, "folder_math_sem4").catch(
          () => {}
        );
      }
    } catch (err) {
      console.error("Math PDF export error:", err);
      setError("PDF ডাউনলোডে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSolving(false);
    }
  };

  const handlePrintSolution = async () => {
    await handleDownloadAnswerKeyPdf();
  };

  const handleDownload = async (format: "png" | "pdf") => {
    if (format === "pdf") {
      await handleDownloadAnswerKeyPdf();
      return;
    }

    const payload = buildMathExportPayload();
    if (!payload) {
      setError("আগে অংকের সমাধান তৈরি করুন!");
      return;
    }

    setIsSolving(true);
    try {
      await exportMathSolutionToPng(payload);
    } catch (err) {
      console.error("Math PNG export error:", err);
      await handleDownloadAnswerKeyPdf();
    } finally {
      setIsSolving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setProblem("");
      };
      reader.readAsDataURL(file);
    }
  };

  const speakText = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const keyToUse = activeApiKey || getStoredGeminiApiKey();
      const audioData = await getStrangerAudio(text, "stranger", keyToUse);
      if (audioData) {
        const url = `data:audio/mp3;base64,${audioData}`;
        const audio = new Audio(url);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      } else {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanMathText(text));
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
        }
      }
    } catch (err) {
      console.error("Audio error:", err);
      setIsSpeaking(false);
    }
  };

  const playFullExplanation = () => {
    if (isSpeaking) return;
    let fullText = analysis ? `এই প্রশ্নটিতে জানতে চাওয়া হয়েছে: ${analysis}. ` : "";
    fullText += "আসুন এটি ধাপে ধাপে সমাধান করি। ";
    steps.forEach((s, i) => {
      fullText += `ধাপ ${i + 1}: ${s.explanation}. `;
    });
    fullText += finalAnswer ? `সর্বশেষ উত্তর হলো: ${cleanMathText(finalAnswer)}.` : "";
    speakText(fullText);
  };

  const solveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim() && !image) return;

    // Quota Enforcement: If quota is exhausted and no personal API key is provided
    if (isFreeQuotaExhausted) {
      triggerQuotaExhaustedAlert();
      return;
    }

    setIsSolving(true);
    setAnalysis(null);
    setSteps([]);
    setFinalAnswer(null);
    setError(null);
    setQuestionsList([]);
    setIsMultiQuestion(false);
    setActiveQuestionTab("all");
    setFollowUpList([]);
    setFollowUpQuery("");

    try {
      let data: any;
      const keyToUse = activeApiKey || getStoredGeminiApiKey();

      if (image) {
        const base64Data = image.split(",")[1];
        data = await solveProblemWithImage(base64Data, keyToUse, effectiveUserName);
      } else {
        const systemInstruction = `You are an expert, world-class Academic Math and Science Solver/Tutor for ${effectiveUserName} in WBCHSE Class 12 Semester 4.
Your goal is to provide deep, comprehensive, beautifully clear step-by-step master-class explanations in warm, supportive Bengali and Bunglish.

CRITICAL INSTRUCTIONS FOR MULTI-QUESTION DETECTION & FORWARD 1-2 FORMAT:
1. The student input may contain ONE or MULTIPLE questions (e.g., Question 1, Question 2, or sub-problems (a), (b)).
2. Parse ALL questions sequentially into a forward "Question 1, Question 2..." structure inside a "questions" array.
3. For each question:
   - "questionNumber": "1", "2", etc.
   - "questionTitle": "প্রশ্ন ১ (Question 1)", "প্রশ্ন ২ (Question 2)", etc.
   - "questionText": The transcribed problem statement with LaTeX (wrapped in $$...$$).
   - "analysis": Detailed, warm analysis explaining given parameters and formula strategies in Bengali.
   - "steps": Granular step-by-step breakdown:
     * "step": Equation strictly in LaTeX (wrap in $$...$$ e.g. $$\\int \\frac{dx}{x^2+a^2}$$).
     * "explanation": Clear, pedagogical teacher explanation in Bengali explaining the calculation.
   - "finalAnswer": The definitive result in LaTeX ($$...$$).
4. Also populate the top-level "analysis", "steps", and "finalAnswer" with the first question's content.
5. Wrap ALL mathematical expressions in $$ inside the JSON strings and double escape backslashes (\\\\frac).

Return ONLY valid JSON matching this schema:
{
  "isMultiQuestion": true,
  "totalQuestions": 2,
  "questions": [
    {
      "questionNumber": "1",
      "questionTitle": "প্রশ্ন ১ (Question 1)",
      "questionText": "$$Problem 1$$",
      "analysis": "Analysis in Bengali",
      "steps": [{ "step": "$$Step LaTeX$$", "explanation": "Explanation in Bengali" }],
      "finalAnswer": "$$Final Answer LaTeX$$"
    }
  ],
  "analysis": "Analysis of first question",
  "steps": [{ "step": "$$Step LaTeX$$", "explanation": "Explanation in Bengali" }],
  "finalAnswer": "$$Final Answer LaTeX$$"
}`;

        let responseText = "";
        const res = await fetch("/api/ai/generateContent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: [
              { role: "system", parts: [{ text: systemInstruction }] },
              { role: "user", parts: [{ text: `Solve this problem step-by-step: ${problem.trim()}` }] }
            ],
            apiKey: keyToUse,
            model: getPreferences().mathModel,
            responseMimeType: "application/json"
          })
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.text) {
            responseText = resData.text;
          }
        }

        if (!responseText) {
          throw new Error("এই অংকটি সমাধান করতে সমস্যা হয়েছে। দয়া করে আরেকবার চেষ্টা করুন।");
        }

        data = safeJsonParse(responseText);
      }

      // Handle multi-question array or fallback to single question
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestionsList(data.questions);
        setIsMultiQuestion(data.questions.length > 1);
        setAnalysis(data.questions[0].analysis || data.analysis || null);
        setSteps(data.questions[0].steps || data.steps || []);
        setFinalAnswer(data.questions[0].finalAnswer || data.finalAnswer || null);
      } else {
        const singleQ: MathQuestionDetail = {
          questionNumber: "1",
          questionTitle: "প্রশ্ন ১ (Question 1)",
          questionText: problem || "Image Uploaded Problem",
          analysis: data.analysis || "",
          steps: data.steps || [],
          finalAnswer: data.finalAnswer || ""
        };
        setQuestionsList([singleQ]);
        setIsMultiQuestion(false);
        setAnalysis(data.analysis || null);
        setSteps(data.steps || []);
        setFinalAnswer(data.finalAnswer || null);
      }

      // Decrement free trial quota if user is on default admin key
      if (!hasPersonalKey) {
        const nextUsed = freeSolvesCount + 1;
        setFreeSolvesCount(nextUsed);
        localStorage.setItem(quotaKey, String(nextUsed));
        if (effectiveUserId && effectiveUserId !== "default" && effectiveUserId !== "guest" && effectiveUserId !== "logged_in_user") {
          setDoc(doc(db, "users", effectiveUserId), { mathLabFreeUses: nextUsed }, { merge: true }).catch(() => {});
        }
      }

      localStorage.removeItem("draft_math_problem");
      setProblem("");
      saveToHistory(problem || "Image Question", data);
    } catch (err: any) {
      console.error("Math Solving Error:", err);
      const userMessage = err.message || "সমাধান করতে সমস্যা হয়েছে। দয়া করে আরেকবার চেষ্টা করুন।";
      setError(`দুঃখিত ${effectiveUserName}, ${userMessage}`);
    } finally {
      setIsSolving(false);
    }
  };

  const resetAll = () => {
    setProblem("");
    setImage(null);
    setAnalysis(null);
    setSteps([]);
    setFinalAnswer(null);
    setError(null);
    setQuestionsList([]);
    setIsMultiQuestion(false);
    setActiveQuestionTab("all");
    setFollowUpList([]);
    setFollowUpQuery("");
    localStorage.removeItem("draft_math_problem");
  };

  const handleAskFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = followUpQuery.trim();
    if (!q || isAskingFollowUp) return;

    if (isFreeQuotaExhausted) {
      triggerQuotaExhaustedAlert();
      return;
    }

    setIsAskingFollowUp(true);
    try {
      const summaryContext = (questionsList.length > 0 ? questionsList : [{
        questionNumber: "1",
        questionTitle: "প্রশ্ন",
        questionText: problem || "Image Uploaded Problem",
        analysis: analysis || "",
        steps: steps,
        finalAnswer: finalAnswer || ""
      }]).map((item, idx) => `[Question ${idx+1}: ${item.questionText || "Question"}]\nAnalysis: ${item.analysis}\nSteps: ${item.steps.map((s, si) => `Step ${si+1}: ${s.step} (${s.explanation})`).join("\n")}\nFinal Answer: ${item.finalAnswer}`).join("\n\n");

      const prompt = `The student (${effectiveUserName}) has solved this mathematics/science problem with you and now has a follow-up doubt or question:

--- PROBLEM & CURRENT SOLUTION ---
${summaryContext}
----------------------------------

Student's Follow-up Question/Doubt:
"${q}"

Please answer their doubt clearly, directly, and patiently in natural, conversational Bengali (বাংলা).
If formulas or mathematical expressions are involved, ALWAYS format them in clean LaTeX ($...$ or $$...$$).
Explain why each step worked or clear up their confusion thoroughly like an expert teacher.`;

      const reply = await getStrangerResponse(prompt, [], "stranger", activeApiKey, effectiveUserName, effectiveUserId);
      setFollowUpList(prev => [...prev, { question: q, answer: reply }]);
      setFollowUpQuery("");
    } catch (err: any) {
      alert("ডাউটের উত্তর আনতে সমস্যা হয়েছে: " + (err.message || "দয়া করে আবার চেষ্টা করুন"));
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  const displayedQuestions =
    activeQuestionTab === "all"
      ? questionsList
      : questionsList.filter((_, idx) => idx === activeQuestionTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 md:p-3 lg:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-7xl h-full sm:h-[97vh] bg-white rounded-none sm:rounded-3xl md:rounded-[2.5rem] border-0 sm:border-3 border-[#18181b] shadow-2xl sm:shadow-[10px_10px_0px_#18181b] flex flex-col overflow-hidden">
        
        {/* Top Accent Header */}
        <div className="bg-[#18181b] text-white px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b-2 border-[#18181b] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF08A] text-[#18181b] flex items-center justify-center shadow-[2px_2px_0px_#FF7A30]">
              <Calculator size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">Math Lab (LaTeX Solver)</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[9px] font-black uppercase tracking-wider">
                  Sem 4 Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {effectiveUserName !== "Student" ? `স্বাগতম, ${effectiveUserName}` : "ফরওয়ার্ড ১-২ ফরম্যাট সমাধান ও আনসার কি PDF"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFormulas(!showFormulas)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={14} /> <span className="hidden sm:inline">সূত্র তালিকা</span>
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <History size={14} /> <span className="hidden sm:inline">ইতিহাস</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white text-slate-300 transition-colors flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quota Status Banner */}
        <div className="bg-[#FAF9F5] border-b-2 border-slate-200 px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {hasPersonalKey ? (
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle size={15} className="text-emerald-600" />
              <span>⚡ নিজস্ব Gemini API Key সক্রিয় (আনলিমিটেড সলভ)</span>
            </div>
          ) : (
            <div
              onClick={() => {
                if (remainingFreeSolves <= 0) triggerQuotaExhaustedAlert();
              }}
              className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer"
            >
              <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-black ${remainingFreeSolves <= 0 ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-amber-100 text-amber-800 border-amber-300"}`}>
                🎁 ফ্রি ট্রায়াল: {remainingFreeSolves}/{MAX_FREE_SOLVES} বাকি
              </span>
              <span className="text-slate-600 hidden sm:inline">
                {effectiveUserId && effectiveUserId !== "default" && effectiveUserId !== "guest" ? `(অ্যাকাউন্ট: ${effectiveUserName})` : "(অ্যাডমিন কী দ্বারা পরিচালিত)"}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!hasPersonalKey && remainingFreeSolves <= 0 && (
              <button
                type="button"
                onClick={triggerQuotaExhaustedAlert}
                className="text-rose-600 hover:text-rose-700 font-black text-xs animate-pulse underline cursor-pointer"
              >
                ফ্রি ৫টি সেশন শেষ! সেটিংস বা কী দিন ↗
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!hasPersonalKey && remainingFreeSolves <= 0) {
                  triggerQuotaExhaustedAlert();
                } else {
                  setShowApiKeyGuard(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FEF08A] hover:bg-[#FDE047] text-[#18181b] font-black border border-[#18181b] shadow-[1.5px_1.5px_0px_#18181b] text-xs transition-all cursor-pointer"
            >
              <Key size={13} />
              <span>{hasPersonalKey ? "API Key পরিবর্তন করুন" : "নিজস্ব API Key দিন (আনলিমিটেড)"}</span>
            </button>
          </div>
        </div>

        {/* Main Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4">
          
          {/* Formula Drawer / Modal */}
          <AnimatePresence>
            {showFormulas && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-black text-indigo-950 text-sm sm:text-base flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-600" />
                    WBCHSE Class 12 Semester 4 Formula Cheat Sheet
                  </h3>
                  <button
                    onClick={() => setShowFormulas(false)}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    বন্ধ করুন
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FORMULA_CATEGORIES.map((cat, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-sm">
                      <h4 className="text-xs font-black text-indigo-900 mb-2 uppercase tracking-wide">
                        {cat.name}
                      </h4>
                      <div className="space-y-2">
                        {cat.formulas.map((f, fIdx) => (
                          <div key={fIdx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-slate-600">{f.label}:</span>
                            <div className="overflow-x-auto text-xs font-serif font-bold text-indigo-950">
                              <MathText text={f.latex} block={false} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Drawer */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif font-black text-amber-950 text-sm flex items-center gap-2">
                    <History size={16} className="text-amber-700" />
                    পূর্বের সমাধানের ইতিহাস (Recent Solves)
                  </h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-xs font-bold text-amber-800 hover:underline"
                  >
                    বন্ধ করুন
                  </button>
                </div>
                {historyList.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium">কোনো ইতিহাস সংরক্ষিত নেই।</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto">
                    {historyList.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.data) {
                            if (Array.isArray(item.data.questions) && item.data.questions.length > 0) {
                              setQuestionsList(item.data.questions);
                              setIsMultiQuestion(item.data.questions.length > 1);
                            }
                            setAnalysis(item.data.analysis || null);
                            setSteps(item.data.steps || []);
                            setFinalAnswer(item.data.finalAnswer || null);
                            setShowHistory(false);
                          }
                        }}
                        className="p-2.5 rounded-xl bg-white border border-amber-200 text-left hover:border-amber-400 transition-all text-xs font-bold text-slate-800 truncate shadow-2xs"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Problem Input Section - Compact Mobile-Friendly Chat-Bar */}
          <form onSubmit={solveProblem} className="space-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <span>অংক বা প্রশ্ন লিখুন / ছবি আপলোড করুন</span>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RotateCcw size={10} /> ছবি মুছুন
                  </button>
                )}
              </div>

              <div className="relative">
                {isCameraActive ? (
                  <div className="relative w-full aspect-[4/3] max-h-72 bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-[#18181b]">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="p-2.5 bg-slate-900/80 text-white rounded-xl hover:bg-rose-600 transition-all cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={takePhoto}
                        className="w-12 h-12 bg-white rounded-full border-4 border-indigo-600 flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-indigo-600 rounded-full" />
                      </button>
                    </div>
                  </div>
                ) : !image ? (
                  <div className="bg-white border-2 border-[#18181b] rounded-2xl shadow-[3px_3px_0px_#18181b] focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden">
                    <textarea
                      value={problem}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProblem(val);
                        localStorage.setItem("draft_math_problem", val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if ((problem.trim() || image) && !isSolving) {
                            solveProblem(e);
                          }
                        }
                      }}
                      rows={2}
                      placeholder={`${userName}, যেকোনো গণিত বা বিজ্ঞানের সমীকরণ/প্রশ্ন লিখুন... (Enter চাপলে সাথে সাথে সলভ হবে)`}
                      className="w-full bg-transparent px-3.5 pt-2.5 pb-1 text-slate-900 text-xs sm:text-sm font-medium outline-none min-h-[46px] max-h-32 resize-none leading-snug placeholder:text-slate-400"
                    />

                    {/* Integrated Bottom Toolbar (Zero extra whitespace / padding) */}
                    <div className="px-2.5 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-1 cursor-pointer text-xs font-semibold"
                          title="ক্যামেরা থেকে প্রশ্ন তুলুন"
                        >
                          <Camera size={15} />
                          <span className="hidden sm:inline text-[11px]">ক্যামেরা</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-1 cursor-pointer text-xs font-semibold"
                          title="ছবি বা স্ক্রিনশট আপলোড করুন"
                        >
                          <ImageIcon size={15} />
                          <span className="hidden sm:inline text-[11px]">ছবি</span>
                        </button>
                        <span className="hidden md:inline text-[10px] text-slate-400 pl-1 font-medium">
                          ↵ Enter to solve • Shift+Enter newline
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {(steps.length > 0 || finalAnswer || questionsList.length > 0) && (
                          <button
                            type="button"
                            onClick={resetAll}
                            className="px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition-all cursor-pointer"
                          >
                            নতুন প্রশ্ন
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSolving || (!problem.trim() && !image)}
                          className="px-4 py-1.5 rounded-xl bg-[#18181b] text-white hover:bg-stone-800 font-extrabold text-xs border border-[#18181b] shadow-[2px_2px_0px_#FF7A30] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        >
                          {isSolving ? (
                            <>
                              <Loader2 className="animate-spin" size={13} />
                              <span>সলভ হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={13} className="text-[#FEF08A]" />
                              <span>সলভ করুন ↵</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border-2 border-[#18181b] rounded-2xl p-2.5 shadow-[3px_3px_0px_#18181b] flex flex-col gap-2">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 h-24 sm:h-28 bg-slate-950 flex items-center justify-center">
                      <img src={image} className="w-full h-full object-contain" alt="Uploaded problem" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2">
                        <p className="text-white text-[11px] font-bold flex items-center gap-1.5 truncate">
                          <Sparkles size={12} className="text-amber-300 shrink-0" />
                          <span>টেস্ট পেপারের প্রশ্ন ছবি লোড হয়েছে</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="px-2 py-0.5 rounded-md bg-rose-600/90 hover:bg-rose-700 text-white text-[10px] font-black shrink-0 cursor-pointer"
                        >
                          ✕ মুছুন
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        >
                          <ImageIcon size={13} /> অন্য ছবি
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {(steps.length > 0 || finalAnswer || questionsList.length > 0) && (
                          <button
                            type="button"
                            onClick={resetAll}
                            className="px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition-all cursor-pointer"
                          >
                            নতুন প্রশ্ন
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSolving}
                          className="px-4 py-1.5 rounded-xl bg-[#18181b] text-white hover:bg-stone-800 font-extrabold text-xs border border-[#18181b] shadow-[2px_2px_0px_#FF7A30] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        >
                          {isSolving ? (
                            <>
                              <Loader2 className="animate-spin" size={13} />
                              <span>ছবি থেকে সলভ হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={13} className="text-[#FEF08A]" />
                              <span>ছবি থেকে সলভ করুন ↵</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  hidden
                  accept="image/*"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          </form>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {isSolving && (
              <motion.div
                key="solving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <Brain size={26} className="animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-base font-black text-slate-800">
                    এআই ম্যাথ কোর প্রসেসিং চলছে...
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">
                    প্রশ্নের ছবি/টেক্সট বিশ্লেষণ, মাল্টি-কোয়েশ্চন সনাক্তকরণ এবং KaTeX ল্যাটেক্স প্রস্তুত করা হচ্ছে
                  </p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-rose-50 border-2 border-rose-200 rounded-3xl flex items-center gap-3 text-rose-700 shadow-sm"
              >
                <AlertCircle size={22} className="shrink-0" />
                <p className="text-xs sm:text-sm font-bold">{error}</p>
              </motion.div>
            )}

            {(questionsList.length > 0 || steps.length > 0 || finalAnswer) && !isSolving && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Voice Mentor Banner & Document Export Buttons */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#18181b] text-white rounded-3xl p-5 border-3 border-[#18181b] shadow-[5px_5px_0px_#6366F1]">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isSpeaking ? "bg-emerald-400 text-slate-900 animate-pulse" : "bg-[#FEF08A] text-slate-900"}`}>
                        <Volume2 size={22} />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black tracking-tight">AI Voice Tutor</h3>
                        <p className="text-[11px] text-slate-300 font-medium">
                          {isSpeaking ? "বাংলাতে অংকের ধাপগুলো বর্ণনা করা হচ্ছে..." : "সম্পূর্ণ সমাধান অডিওতে শুনতে ক্লিক করুন"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={playFullExplanation}
                      disabled={isSpeaking}
                      className="px-6 py-2.5 rounded-2xl bg-[#FEF08A] text-[#18181b] hover:bg-[#FDE047] font-black text-xs uppercase tracking-wider border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Volume2 size={15} />
                      <span>{isSpeaking ? "ভয়েস চলছে..." : "সম্পূর্ণ ব্যাখ্যা শুনুন"}</span>
                    </button>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 no-print">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                      <ListOrdered size={16} className="text-indigo-600" />
                      <span>পরীক্ষার সমাধান ({questionsList.length > 0 ? questionsList.length : 1}টি প্রশ্ন)</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleDownloadAnswerKeyPdf}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-black text-xs border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] transition-all cursor-pointer"
                        title="ডাউনলোড আনসার কি PDF"
                      >
                        <FileText size={14} />
                        <span>📄 ডাউনলোড PDF (KaTeX + বাংলা সহ)</span>
                      </button>
                      <button
                        onClick={handlePrintSolution}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 transition-all cursor-pointer"
                        title="সরাসরি প্রিন্ট বা সেভ করুন"
                      >
                        <Download size={14} />
                        <span>🖨️ প্রিন্ট / সেভ PDF</span>
                      </button>
                      <button
                        onClick={() => handleDownload("png")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 transition-all cursor-pointer"
                        title="JPG ইমেজ ডাউনলোড"
                      >
                        <ImageIcon size={14} />
                        <span>JPG ইমেজ</span>
                      </button>
                      <button
                        onClick={() => {
                          let textToCopy = "Study Stranger Pro - Math Lab Solution:\n\n";
                          const list = questionsList.length > 0 ? questionsList : [
                            {
                              questionNumber: "1",
                              questionTitle: "প্রশ্ন ১",
                              questionText: problem,
                              analysis,
                              steps,
                              finalAnswer
                            }
                          ];
                          list.forEach((q, idx) => {
                            textToCopy += `--- ${q.questionTitle || `প্রশ্ন ${idx + 1}`} ---\n`;
                            if (q.questionText) textToCopy += `Problem: ${cleanMathText(q.questionText)}\n`;
                            if (q.analysis) textToCopy += `Analysis: ${cleanMathText(q.analysis)}\n\n`;
                            q.steps.forEach((s, sIdx) => {
                              textToCopy += `Step ${sIdx + 1}: ${cleanMathText(s.step)}\n${cleanMathText(s.explanation)}\n`;
                            });
                            if (q.finalAnswer) textToCopy += `Final Answer: ${cleanMathText(q.finalAnswer)}\n\n`;
                          });
                          navigator.clipboard.writeText(textToCopy);
                          alert("সম্পূর্ণ সমাধান টেক্সট কপি হয়েছে!");
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 transition-all cursor-pointer"
                      >
                        <Send size={13} />
                        <span>টেক্সট কপি</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Result Cards Container (Continuous, Tab-free Clean Layout) */}
                <div
                  ref={resultsRef}
                  id="math-results-container"
                  className="space-y-8 bg-white p-5 sm:p-7 md:p-8 rounded-3xl border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b]"
                >
                  {(questionsList.length > 0
                    ? questionsList
                    : [
                        {
                          questionNumber: "1",
                          questionTitle: "প্রশ্ন ১",
                          questionText: problem,
                          analysis,
                          steps,
                          finalAnswer
                        }
                      ]
                  ).map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="space-y-6 pb-8 border-b-2 border-slate-200 last:border-b-0 last:pb-0"
                    >
                      {/* Question Title Header */}
                      <div className="flex items-center justify-between bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-[#18181b] text-white flex items-center justify-center text-xs font-black">
                            {q.questionNumber || qIndex + 1}
                          </span>
                          <h3 className="font-serif font-black text-sm sm:text-base text-stone-900">
                            {q.questionTitle || `প্রশ্ন ${qIndex + 1}`}
                          </h3>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 bg-stone-200 px-2.5 py-0.5 rounded-md">
                          WBCHSE Sem 4
                        </span>
                      </div>

                      {/* Question Text (if present) */}
                      {q.questionText && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed">
                          <span className="font-bold text-slate-500 text-xs uppercase block mb-1">
                            প্রশ্ন:
                          </span>
                          <MathText text={q.questionText} />
                        </div>
                      )}

                      {/* Concept & Methodology Analysis */}
                      {q.analysis && (
                        <div className="space-y-2">
                          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-800 text-xs sm:text-sm leading-relaxed">
                            <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                              <Info size={14} className="text-amber-700" />
                              <span>কনসেপ্ট ও সূত্র বিশ্লেষণ (Approach & Formulas):</span>
                            </span>
                            <MathText text={q.analysis} />
                          </div>
                        </div>
                      )}

                      {/* Step-by-Step Breakdown (Equation First, Then Result/Explanation) */}
                      {q.steps && q.steps.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-slate-800 text-xs font-black">
                            <BookOpen size={15} className="text-indigo-600" />
                            <span>ধাপে ধাপে সমাধান (Step-by-Step Derivation):</span>
                          </div>

                          <div className="space-y-4">
                            {q.steps.map((st, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-5 rounded-2xl bg-[#FAF9F5] border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] space-y-3"
                              >
                                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                                      {sIdx + 1}
                                    </span>
                                    <span className="font-black text-xs text-stone-800 uppercase tracking-wide">
                                      ধাপ {sIdx + 1}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-stone-500">
                                    Step Calculation
                                  </span>
                                </div>

                                {/* 1. The Mathematical Equation in KaTeX */}
                                <div className="p-3.5 rounded-xl bg-white border border-stone-300 overflow-x-auto text-center font-serif text-base sm:text-lg text-stone-900 shadow-2xs">
                                  <MathText text={st.step} block />
                                </div>

                                {/* 2. Explanation / Interpretation right after equation */}
                                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
                                  <div className="flex items-center gap-1 text-indigo-700 font-bold mb-1 text-[11px]">
                                    <span>↳ ব্যাখ্যা ও পদ্ধতি:</span>
                                  </div>
                                  <MathText text={st.explanation} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. The Classic Final Answer Card */}
                      {q.finalAnswer && (
                        <div className="p-6 rounded-3xl bg-[#ECFDF5] border-3 border-[#059669] text-center space-y-2 shadow-[4px_4px_0px_#18181b]">
                          <span className="text-[11px] font-black uppercase tracking-widest text-[#065F46] bg-[#A7F3D0] px-3.5 py-1 rounded-full border border-[#059669] inline-block">
                            🎯 চূড়ান্ত উত্তর (Final Answer)
                          </span>
                          <div className="text-xl sm:text-3xl font-black text-[#064E3B] py-2 overflow-x-auto">
                            <MathText text={q.finalAnswer} block />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Follow-up Doubt / Question Interactive Section (Zero Print / Real-time Teacher AI) */}
                <div className="no-print bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-indigo-50/70 rounded-3xl p-5 sm:p-6 border-2 border-indigo-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">
                          কোনো ডাউট বা প্রশ্ন আছে? (Ask Follow-up Doubt)
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          এই সমাধান বা নির্দিষ্ট কোনো ধাপ নিয়ে এআই মেন্টরকে যেকোনো প্রশ্ন করুন
                        </p>
                      </div>
                    </div>
                    {followUpList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFollowUpList([])}
                        className="text-xs text-slate-500 hover:text-rose-600 font-bold cursor-pointer"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>

                  {/* Follow-up Conversation Threads */}
                  {followUpList.length > 0 && (
                    <div className="space-y-3.5 pt-1">
                      {followUpList.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-end">
                            <div className="bg-[#18181b] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-2xl max-w-[85%] rounded-br-none shadow-sm">
                              <span className="text-amber-300 font-black mr-1">প্রশ্ন:</span> {item.question}
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <div className="bg-white border-2 border-indigo-200 text-slate-800 text-xs sm:text-sm px-4 py-3 rounded-2xl max-w-[95%] rounded-bl-none shadow-sm space-y-2 leading-relaxed">
                              <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5 mb-1">
                                <span className="text-[11px] font-black text-indigo-700 flex items-center gap-1">
                                  <Sparkles size={12} className="text-indigo-600" /> এআই মেন্টরের ব্যাখ্যা:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => speakText(item.answer)}
                                  className="p-1 rounded-lg hover:bg-indigo-50 text-indigo-600 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                                  title="ভয়েসে শুনুন"
                                >
                                  <Volume2 size={13} /> ভয়েস
                                </button>
                              </div>
                              <div className="leading-relaxed">
                                <MathText text={item.answer} block={true} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input form */}
                  <form onSubmit={handleAskFollowUp} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={followUpQuery}
                      onChange={(e) => setFollowUpQuery(e.target.value)}
                      placeholder="যেমন: 'ধাপ ২-এ এই ইন্টিগ্রেশনটা কীভাবে এল?' বা 'বিকল্প কোনো সহজ নিয়ম আছে?'..."
                      className="flex-1 bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none placeholder:text-slate-400 transition-all shadow-2xs"
                    />
                    <button
                      type="submit"
                      disabled={isAskingFollowUp || !followUpQuery.trim()}
                      className="px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 shadow-xs cursor-pointer shrink-0"
                    >
                      {isAskingFollowUp ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span className="hidden sm:inline">ভাবছে...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>জিজ্ঞাসা করুন</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quota Exhausted Friendly Alert Modal */}
        <AnimatePresence>
          {showQuotaAlertModal && (
            <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-3xl p-6 border-3 border-[#18181b] shadow-[8px_8px_0px_#18181b] space-y-4 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-700 mx-auto flex items-center justify-center">
                  <AlertCircle size={28} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    ৫টি ফ্রি সলভ ট্রায়াল সম্পন্ন হয়েছে!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    আপনার অ্যাকাউন্টের ({effectiveUserName}) জন্য ৫টি ফ্রি সলভ শেষ হয়েছে। আনলিমিটেড সময় ফ্রিতে ম্যাথ ল্যাব ও এআই মেন্টর ব্যবহার করতে অনুগ্রহ করে সেটিংসে গিয়ে অথবা নিচে আপনার নিজস্ব ফ্রি Gemini API Key প্রদান করুন।
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuotaAlertModal(false);
                      setShowApiKeyGuard(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#FEF08A] hover:bg-[#FDE047] text-[#18181b] font-black text-xs border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Key size={14} />
                    <span>এখানে নিজস্ব API Key দিন (১ মিনিটে ফ্রি)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuotaAlertModal(false);
                      window.location.href = "/app/settings";
                    }}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>⚙️ সেটিংসে যান (Go to Settings)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuotaAlertModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold py-1 cursor-pointer"
                  >
                    পরে করব (Close)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Inline API Key Guard Modal */}
        <ApiKeyGuardModal
          isOpen={showApiKeyGuard}
          onClose={() => setShowApiKeyGuard(false)}
          title="Google Gemini API Key যুক্ত করুন"
          description="ডিফল্ট অ্যাডমিন কী দিয়ে ৫টি ফ্রি সলভ সুবিধা প্রদান করা হয়েছে। আনলিমিটেড সময় ফ্রিতে ম্যাথ ল্যাব, ভয়েস মেন্টর ও টেস্ট পেপার সমাধান করতে অনুগ্রহ করে আপনার বিনামূল্যে পাওয়া Google Gemini API Key প্রদান করুন।"
          onKeySaved={(newKey) => {
            setActiveApiKey(newKey);
            setShowApiKeyGuard(false);
          }}
        />
      </div>
    </div>
  );
};
