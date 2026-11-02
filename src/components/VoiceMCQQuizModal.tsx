import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Brain, 
  Flame, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight,
  Award
} from "lucide-react";
import confetti from "canvas-confetti";
import { MathText } from "./MathText";
import { FALLBACK_WBCHSE_QUESTIONS } from "../data/wbchseFallbackQuestions";
import { soundEffects } from "../services/soundEffectsService";

interface VoiceMCQQuizModalProps {
  onClose: () => void;
  userName?: string;
}

export const VoiceMCQQuizModal: React.FC<VoiceMCQQuizModalProps> = ({
  onClose,
  userName = "Abhijit"
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("Biology");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [recognizedTranscript, setRecognizedTranscript] = useState<string>("");
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const questions = FALLBACK_WBCHSE_QUESTIONS[selectedSubject] || FALLBACK_WBCHSE_QUESTIONS["Biology"] || [];
  const currentQ = questions[currentIndex % questions.length];

  const recognitionRef = useRef<any>(null);

  // Speak question on load
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (currentQ) {
      speakText(`Question ${currentIndex + 1}. ${currentQ.questionEn}`);
    }
  }, [currentIndex, selectedSubject]);

  // Web Speech Recognition for voice answers
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Voice recognition is not supported in this browser. Please tap the options!");
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setRecognizedTranscript("Listening for your answer (say A, B, C, or D)...");
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript.toLowerCase();
        setRecognizedTranscript(`You said: "${text}"`);
        setIsListening(false);

        // Check if user said A, B, C, D or first, second, etc.
        if (text.includes("a") || text.includes("option 1") || text.includes("first")) {
          handleSelectOption(0);
        } else if (text.includes("b") || text.includes("option 2") || text.includes("second")) {
          handleSelectOption(1);
        } else if (text.includes("c") || text.includes("option 3") || text.includes("third")) {
          handleSelectOption(2);
        } else if (text.includes("d") || text.includes("option 4") || text.includes("fourth")) {
          handleSelectOption(3);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
        setRecognizedTranscript("Could not recognize clearly. Try again or tap.");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      soundEffects.playCorrectSound();
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      speakText("Brilliant! That is correct!");
    } else {
      soundEffects.playWrongSound();
      setStreak(0);
      speakText(`Incorrect. The right answer is option ${String.fromCharCode(65 + currentQ.correctIndex)}.`);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setRecognizedTranscript("");
    if (currentIndex + 1 >= Math.min(questions.length, 10)) {
      setQuizFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setQuizFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950 via-stone-900 to-purple-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Mic size={20} className={isListening ? "animate-ping text-rose-300" : "text-white"} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                  Interactive Voice Quiz
                </span>
                <span className="text-xs text-amber-400 font-bold">🔥 {streak} Streak</span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                কথা বলে লাইভ এমসিকিউ চ্যালেঞ্জ
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subject Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 overflow-x-auto scrollbar-hide text-xs">
          {["Biology", "Bengali A", "English B", "Physics", "Chemistry", "Mathematics"].map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setSelectedSubject(sub);
                setCurrentIndex(0);
                setSelectedOption(null);
              }}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSubject === sub
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Quiz Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {!quizFinished ? (
            <>
              {/* Question Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-bold">
                  <span>Question #{currentIndex + 1}</span>
                  <button
                    onClick={() => speakText(currentQ.questionEn)}
                    className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 font-semibold cursor-pointer"
                  >
                    <Volume2 size={14} className={isSpeaking ? "animate-pulse text-[#FF7A30]" : ""} />
                    <span>Repeat Audio</span>
                  </button>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-snug">
                  <MathText text={currentQ.questionEn} />
                </h3>
                {currentQ.questionBn && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 bangla-text">
                    <MathText text={currentQ.questionBn} />
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(currentQ.optionsEn || []).map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  let style = "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-indigo-500";
                  if (selectedOption !== null) {
                    if (isCorrect) style = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                    else if (isSelected) style = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={selectedOption !== null}
                      className={`p-3 rounded-2xl border text-xs text-left flex items-center gap-2.5 transition-all cursor-pointer min-h-[48px] ${style}`}
                    >
                      <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-700 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">
                        <MathText text={opt} />
                      </span>
                      {selectedOption !== null && isCorrect && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Voice Trigger Bar */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
                <button
                  onClick={toggleListening}
                  className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  <Mic size={16} />
                  <span>{isListening ? "Listening... (Speak Now)" : "Tap & Speak Answer"}</span>
                </button>
                {recognizedTranscript && (
                  <p className="text-xs text-indigo-900 dark:text-indigo-300 font-medium text-center">
                    {recognizedTranscript}
                  </p>
                )}
              </div>

              {/* Bottom Action */}
              {selectedOption !== null && (
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="text-xs text-stone-500">
                    <MathText text={currentQ.explanationEn} />
                  </div>
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-[#FF7A30] hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 ml-3"
                  >
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950 text-amber-600 mx-auto flex items-center justify-center shadow-lg">
                <Award size={36} />
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">
                Voice Challenge Complete! 🎉
              </h3>
              <p className="text-xs text-stone-500">
                You earned <strong>{score} XP</strong> with an awesome voice reaction streak.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RotateCcw size={14} />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
