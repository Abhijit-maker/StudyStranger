import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { 
  Headphones, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Bookmark, 
  Search, 
  Flame, 
  Clock, 
  Copy, 
  Check, 
  ChevronRight, 
  Zap, 
  Layers, 
  FileText, 
  GraduationCap, 
  BrainCircuit, 
  RefreshCw, 
  Sliders, 
  X, 
  Info,
  Award,
  FastForward,
  Rewind,
  Share2
} from "lucide-react";
import { getStrangerAudio, getStrangerResponse } from "../services/geminiService";

export interface AudioLesson {
  id: string;
  subject: "Biology" | "Bengali" | "English";
  titleBn: string;
  titleEn?: string;
  duration: string;
  keyPoints: string[];
  examTips: string[];
  criticalFacts: { label: string; value: string }[];
  audioScriptBn: string;
  audioScriptEn: string;
  recommendedMCQs: string[];
}

const LESSONS_DATA: AudioLesson[] = [
  {
    id: "bio_human_repro",
    subject: "Biology",
    titleBn: "Human Reproduction (মানব জনন ও নিষেক)",
    titleEn: "Human Reproduction & Menstrual Cycle",
    duration: "4:30 min",
    keyPoints: [
      "Spermatogenesis vs Oogenesis: শুক্রাণু ও ডিম্বাণু তৈরির বিভিন্ন পর্যায়।",
      "Sperm Structure: Head (Acrosome - এনজাইম থাকে), Midpiece (Mitochondria - শক্তির উৎস), Tail (চলন)।",
      "Menstrual Cycle: Follicular, Ovulatory (LH Surge on Day 14), Luteal phase (Corpus luteum - Progesterone)।",
      "Fertilization: শুক্রাণু ডিম্বাণুর ZP3 রিসেপ্টরের সাথে যুক্ত হয়ে অ্যাক্রোসোম বিক্রিয়া ঘটায়।",
      "Ectopic Pregnancy: জরায়ুর বাইরে (যেমন ফ্যালোপিয়ান নালীতে) ভ্রূণের ইমপ্লান্টেশন।"
    ],
    examTips: [
      "LH Surge কোন দিনে হয়? -> ১৪তম দিনে (14th Day)।",
      "ডিম্বাণুর কোন রিসেপ্টরে শুক্রাণু বাইন্ড করে? -> ZP3 Receptor।"
    ],
    criticalFacts: [
      { label: "LH Surge Timing", value: "Day 14 of Menstrual Cycle" },
      { label: "Sperm Mitochondria", value: "Middle Piece (শক্তি সরবরাহ)" },
      { label: "Acrosome Receptor", value: "ZP3 Glycoprotein Receptor" },
      { label: "Ectopic Site", value: "Fallopian Tubes (অস্থানিক গর্ভধারণ)" }
    ],
    audioScriptBn: "নমস্কার অভিজিৎ! চলো হিউম্যান রিপ্রোডাকশনের গুরুত্বপূর্ণ বিষয়গুলো দ্রুত রিভিশন করে নিই। প্রথমে মনে রাখবে মানব শুক্রাণুর তিনটি প্রধান অংশ— হেড যাতে অ্যাক্রোসোম উৎসেচক থাকে, মিডল পিস যাতে শক্তি দেওয়ার জন্য মাইটোকন্ড্রিয়া সাজানো থাকে, আর লেজ যা সাঁতার কাটতে সাহায্য করে। রজঃচক্রের ১৪তম দিনে এলএইচ হরমোনের তীব্র ক্ষরণ যাকে LH Surge বলে, তার ফলেই ডিম্বপাত ঘটে। আর নিষেকের সময় শুক্রাণু ডিম্বাণুর জোনা পেলুসিডার ZP3 রিসেপ্টরে যুক্ত হয়। এই পয়েন্টগুলো পরীক্ষায় নিশ্চিত কমন আসবে!",
    audioScriptEn: "Hello student! Let's revise Human Reproduction. Remember the sperm structure: Head with Acrosome, Middle piece with Mitochondria, and Tail. The crucial LH Surge occurs precisely on the 14th day of the menstrual cycle, triggering ovulation. During fertilization, the sperm binds specifically to the ZP3 receptor on the Zona Pellucida.",
    recommendedMCQs: [
      "LH Surge occurs on which day of the menstrual cycle? (Answer: 14th day)",
      "Which receptor on the zona pellucida binds sperm? (Answer: ZP3)"
    ]
  },
  {
    id: "bio_genetics_dna",
    subject: "Biology",
    titleBn: "Molecular Basis of Inheritance (ডিএনএ ও জেনেটিক্স)",
    titleEn: "DNA Replication & Molecular Genetics",
    duration: "5:15 min",
    keyPoints: [
      "DNA Base Pairing: Adenine=Thymine (২টি হাইড্রোজেন বন্ড), Guanine≡Cytosine (৩টি হাইড্রোজেন বন্ড)।",
      "DNA Replication: SSB (Single-Stranded Binding) প্রোটিন ডিএনএ স্ট্র্যান্ডকে খুলে ধরে রাখে।",
      "Transcription: প্রমোটার অঞ্চলে TATA Box গুরুত্বপূর্ণ সংকেত দেয়।",
      "STDs Pathogens: Syphilis ব্যাকটেরিয়া হলো Treponema pallidum।",
      "Evolution: ওপারিন-হ্যালডেন তত্ত্ব অনুসারে জীবনের আদি উৎপত্তি সমুদ্রে জৈব স্যুপে ঘটেছিল।"
    ],
    examTips: [
      "A এবং T এর মাঝে কয়টি বন্ড? -> ২টি হাইড্রোজেন বন্ড (Double bond)।",
      "সিফিলিস রোগের প্যাথোজেনের নাম কি? -> Treponema pallidum।"
    ],
    criticalFacts: [
      { label: "Base Bonds", value: "A=T (2 bonds), G≡C (3 bonds)" },
      { label: "Syphilis Pathogen", value: "Treponema pallidum (ব্যাকটেরিয়া)" },
      { label: "Replication Protein", value: "SSB Protein (স্ট্র্যান্ড স্থিতিশীল রাখে)" },
      { label: "Transcription Box", value: "TATA Box (Promoter)" }
    ],
    audioScriptBn: "এবার চলো জেনেটিক্স ও মলিকিউলার বায়োলজি রিভিশন করি। ডিএনএ হেলিক্সে অ্যাডেনিন ও থাইমিনের মধ্যে দুটি হাইড্রোজেন বন্ড থাকে, আর গুয়ানিন ও সাইটোসিনের মধ্যে তিনটি হাইড্রোজেন বন্ড থাকে। ডিএনএ রেপ্লিকেশনের সময় খোলা স্ট্র্যান্ডগুলো যাতে আবার জুড়ে না যায়, তার জন্য এসএসবি (SSB) প্রোটিন ধরে রাখে। আর যৌনবাহিত রোগ সিফিলিসের জীবাণু হলো ট্রিপোনেমা প্যালিডাম। এই ফ্যাক্টগুলো উচ্চমাধ্যমিক সেমিস্টার ৩ এর জন্য অত্যন্ত গুরুত্বপূর্ণ!",
    audioScriptEn: "Let's review Molecular Genetics! In DNA, A pairs with T via 2 hydrogen bonds, while G pairs with C via 3 hydrogen bonds. SSB proteins prevent separated DNA single strands from re-annealing during replication. Keep in mind: the causative agent for Syphilis is Treponema pallidum.",
    recommendedMCQs: [
      "What is the causative agent of Syphilis? (Answer: Treponema pallidum)",
      "How many hydrogen bonds exist between Guanine and Cytosine? (Answer: 3)"
    ]
  },
  {
    id: "bengali_adarini",
    subject: "Bengali",
    titleBn: "আদিরিনী — প্রভাত কুমার মুখোপাধ্যায়",
    titleEn: "Adarini (Elephant Narrative)",
    duration: "4:00 min",
    keyPoints: [
      "মূল চরিত্র: জয়রাম মুখতার এবং তার আদরের পোষা হাতি 'আদিরিনী'।",
      "হাতি কেনার মূল্য: জয়রাম মুখতার ২০০০ টাকা দিয়ে আদিরিনীকে কিনেছিলেন।",
      "গল্পের মূল সুর: প্রভু ও প্রাণীর মধ্যকার গভীর স্নেহ, অর্থনৈতিক টানাপোড়েন ও করুণ বিদায়।",
      "আদিরিনীর স্বভাব: শান্ত, বাধ্য ও পরম অনুগত হাতি।"
    ],
    examTips: [
      "আদিরিনী হাতির দাম কত ছিল? -> ২০০০ টাকা (2000 Rupees)।",
      "গল্পের লেখক কে? -> প্রভাত কুমার মুখোপাধ্যায়।"
    ],
    criticalFacts: [
      { label: "আদিরিনীর মূল্য", value: "২০০০ টাকা (₹2000)" },
      { label: "মালিকের নাম", value: "জয়রাম মুখতার" },
      { label: "লেখক", value: "প্রভাত কুমার মুখোপাধ্যায়" },
      { label: "মূল ভাব", value: "মানুষ ও পোষা প্রাণীর নিঃস্বার্থ ভালোবাসা" }
    ],
    audioScriptBn: "বাংলা সাহিত্যের অন্যতম জনপ্রিয় গল্প প্রভাত কুমার মুখোপাধ্যায়ের 'আদিরিনী'। গল্পের কেন্দ্রে আছেন জয়রাম মুখতার মহাশয় এবং তাঁর প্রাণের চেয়েও প্রিয় হাতি আদিরিনী, যাকে তিনি ২০০০ টাকায় কিনেছিলেন। পারিবারিক আর্থিক দুরবস্থার মধ্যেও আদিরিনীকে পরিবারের সদস্যের মতোই ভালোবাসা দেওয়া হয়েছিল। গল্পের পরিণতিতে আদিরিনীর প্রভুভক্তি ও বিদায় মুহূর্তটি পাঠককে আবেগাপ্লুত করে। পরীক্ষার জন্য ২০০০ টাকা দাম এবং মূল চরিত্রগুলো ভালো করে মনে রাখবে!",
    audioScriptEn: "In Prabhat Kumar Mukhopadhyay's poignant Bengali short story 'Adarini', Jayram Mokhtar buys his beloved pet elephant Adarini for 2000 rupees. The narrative reflects deep affection between master and animal.",
    recommendedMCQs: [
      "আদিরিনী হাতিটিকে কত টাকা দিয়ে কেনা হয়েছিল? (উত্তর: ২০০০ টাকা)",
      "আদিরিনী গল্পের লেখকের নাম কী? (উত্তর: প্রভাত কুমার মুখোপাধ্যায়)"
    ]
  },
  {
    id: "english_the_bet",
    subject: "English",
    titleBn: "The Bet — Anton Chekhov",
    duration: "4:45 min",
    keyPoints: [
      "The Conflict: Capital Punishment (Death Penalty) vs Life Imprisonment.",
      "The Wager: The Banker wagered 2 Million Rubles that the Lawyer couldn't stay 15 years in solitary confinement.",
      "The Transformation: The lawyer read theology, philosophy, and discovered that material wealth is worthless.",
      "The Climax: The lawyer renounced the 2 million rubles and walked out 5 hours before time to prove money is an illusion."
    ],
    examTips: [
      "What was the bet amount? -> 2 Million Rubles (২ মিলিয়ন রুবল)।",
      "For how many years was the confinement? -> 15 Years (১৫ বছর)।"
    ],
    criticalFacts: [
      { label: "Wager Amount", value: "2 Million Rubles" },
      { label: "Confinement Period", value: "15 Years" },
      { label: "Author", value: "Anton Chekhov" },
      { label: "Theme", value: "Illusion of worldly wealth & wisdom" }
    ],
    audioScriptBn: "অ্যান্টন চেখভের বিশ্ববিখ্যাত গল্প 'The Bet'। এক পার্টিতে মৃত্যুদণ্ড ও যাবজ্জীবন কারাদণ্ড নিয়ে তর্কের সূত্র ধরে ব্যাংকার ও এক তরুণ উকিলের মধ্যে বাজি হয়। ব্যাংকার ২০ লক্ষ রুবলের বাজি ধরে যে উকিল ১৫ বছর নির্জন ঘরে বন্দি থাকতে পারবে না। উকিল ১৫ বছর সমস্ত বই ও ধর্মগ্রন্থ পড়ে উপলব্ধি করে পৃথিবীর টাকা-পয়সা সব মায়া, তাই সে সময় শেষ হওয়ার ৫ ঘণ্টা আগে নিজের ইচ্ছায় বেরিয়ে এসে বাজির টাকা প্রত্যাখ্যান করে!",
    audioScriptEn: "In Anton Chekhov's masterpiece 'The Bet', a wealthy banker and a young lawyer place a wager of 2 million rubles for 15 years of solitary confinement. Over 15 years, the lawyer discovers true philosophical wisdom, renouncing the 2 million rubles just 5 hours before completion.",
    recommendedMCQs: [
      "What was the wager amount in 'The Bet'? (Answer: 2 million rubles)",
      "How many years did the lawyer spend in solitary confinement? (Answer: 15 years)"
    ]
  },
  {
    id: "english_strong_roots",
    subject: "English",
    titleBn: "Strong Roots — APJ Abdul Kalam",
    duration: "3:50 min",
    keyPoints: [
      "Birthplace: Rameswaram, Tamil Nadu in an erstwhile Madras State.",
      "Father: Jainulabdeen (austere, deeply spiritual, simple man).",
      "Mother: Ashiamma (generous host feeding many people daily).",
      "Spiritual Philosophy: Kalam's father taught him that prayer connects our mind to the cosmos and eliminates adversity."
    ],
    examTips: [
      "Where did Kalam spend his childhood? -> Island town of Rameswaram.",
      "What did Kalam's father tell him about prayer? -> It creates a communion of spirit with the universe."
    ],
    criticalFacts: [
      { label: "Birthplace", value: "Rameswaram Island" },
      { label: "Father's Name", value: "Jainulabdeen" },
      { label: "Mother's Name", value: "Ashiamma" },
      { label: "Key Message", value: "Prayer connects individual soul to cosmos" }
    ],
    audioScriptBn: "এপিজে আব্দুল কালামের আত্মজীবনী 'Wings of Fire' থেকে নেওয়া 'Strong Roots'। কালামের জন্ম হয়েছিল রামেশ্বরমের এক সাধারণ মুসলিম পরিবারে। তাঁর পিতা জয়নুলাবদিন অত্যন্ত সৎ, অনাড়ম্বর ও ধার্মিক মানুষ ছিলেন। তিনি কালামকে শিখিয়েছিলেন প্রার্থনা কোনো দুর্বলতা নয়, প্রার্থনা মানুষের মনকে বিশ্বব্রহ্মাণ্ডের সাথে একাত্ম করে তোলে। এই অধ্যায়ের রামেশ্বরম ও কালামের বাবার জীবনদর্শন পরীক্ষার জন্য খুব জরুরি।",
    audioScriptEn: "In 'Strong Roots' by APJ Abdul Kalam, Kalam recounts his childhood in Rameswaram. His father Jainulabdeen taught him how prayer enables individuals to transcend body limits and commune with the divine cosmos.",
    recommendedMCQs: [
      "Where was Kalam born? (Answer: Rameswaram)",
      "What was the name of Kalam's father? (Answer: Jainulabdeen)"
    ]
  },
  {
    id: "english_ulysses",
    subject: "English",
    titleBn: "Ulysses — Alfred Lord Tennyson",
    duration: "3:30 min",
    keyPoints: [
      "Speaker: King Ulysses of Ithaca (restless warrior longing for adventure).",
      "Son: Telemachus (responsible ruler who will govern Ithaca).",
      "Famous Motto: 'To strive, to seek, to find, and not to yield.'",
      "Philosophy: Life is about endless exploration and courage till the last breath."
    ],
    examTips: [
      "What is the ultimate line of Ulysses? -> 'To strive, to seek, to find, and not to yield.'",
      "Who was Ulysses' son? -> Telemachus."
    ],
    criticalFacts: [
      { label: "Famous Motto", value: "'To strive, to seek, to find, and not to yield.'" },
      { label: "Son's Name", value: "Telemachus" },
      { label: "Kingdom", value: "Ithaca" },
      { label: "Poet", value: "Alfred Lord Tennyson" }
    ],
    audioScriptBn: "আলফ্রেড লর্ড টেনিসনের অমর কবিতা 'Ulysses'। ট্রয় যুদ্ধের পর ইথাকার রাজা ইউলিসিস ঘরে অলস বসে থাকতে চান না। তিনি তাঁর সহযোদ্ধাদের ডেকে বলেন বয়স হলেও আত্মাকে অপরাজেয় রাখতে হবে। কবিতার শেষ ঐতিহাসিক উক্তি— 'To strive, to seek, to find, and not to yield'— অর্থাৎ চেষ্টা করতে হবে, খুঁজতে হবে, সত্যকে অর্জন করতে হবে কিন্তু কখনোই পরাজয় স্বীকার করা যাবে না!",
    audioScriptEn: "Tennyson's dramatic monologue 'Ulysses' presents the aging hero of Ithaca urging his mariners onward with the immortal words: 'To strive, to seek, to find, and not to yield.'",
    recommendedMCQs: [
      "Who wrote the poem 'Ulysses'? (Answer: Alfred Lord Tennyson)",
      "What is the famous closing line of Ulysses? (Answer: To strive, to seek, to find, and not to yield)"
    ]
  }
];

interface ExamBoosterHubProps {
  onClose?: () => void;
  geminiApiKey?: string;
  userName?: string;
}

export const ExamBoosterHub: React.FC<ExamBoosterHubProps> = ({
  onClose,
  geminiApiKey,
  userName = "Abhijit"
}) => {
  const [selectedSubject, setSelectedSubject] = useState<"All" | "Biology" | "Bengali" | "English">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLesson, setActiveLesson] = useState<AudioLesson>(LESSONS_DATA[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.15);
  const [copiedFact, setCopiedFact] = useState<string | null>(null);
  const [showFlashcardMode, setShowFlashcardMode] = useState(false);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<string | null>(null);

  // Audio speech synthesis ref
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const filteredLessons = LESSONS_DATA.filter((lesson) => {
    const matchesSubject = selectedSubject === "All" || lesson.subject === selectedSubject;
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      lesson.titleBn.toLowerCase().includes(q) ||
      (lesson.titleEn || "").toLowerCase().includes(q) ||
      lesson.keyPoints.some(k => k.toLowerCase().includes(q)) ||
      lesson.criticalFacts.some(f => f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q));
    return matchesSubject && matchesQuery;
  });

  // Collect all critical facts for high-yield table
  const allCriticalFacts = LESSONS_DATA.flatMap(l => 
    l.criticalFacts.map(f => ({ ...f, subject: l.subject, lessonTitle: l.titleBn }))
  );

  const filteredFacts = allCriticalFacts.filter(f => {
    const matchesSubject = selectedSubject === "All" || f.subject === selectedSubject;
    const q = searchQuery.toLowerCase();
    return matchesSubject && (f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q) || f.lessonTitle.toLowerCase().includes(q));
  });

  // Audio Player Handlers
  const handlePlayAudio = (lesson: AudioLesson) => {
    if (isPlaying && activeLesson.id === lesson.id) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    setActiveLesson(lesson);
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(lesson.audioScriptBn);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.05;
    
    // Choose Bengali voice if available
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find(v => v.lang.includes("bn") || v.lang.includes("Bengali"));
    if (bnVoice) utterance.voice = bnVoice;

    utterance.onend = () => {
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying && activeLesson) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeLesson.audioScriptBn);
      utterance.rate = speed;
      utterance.pitch = 1.05;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFact(id);
    setTimeout(() => setCopiedFact(null), 2000);
  };

  const handleGenerateInstantNote = async (topic: string) => {
    setIsGeneratingNote(true);
    setGeneratedNote(null);
    try {
      const prompt = `Student: ${userName}. WBCHSE Class 12 Semester 3 Exam.
Create an ultra-concise, high-yield bullet point revision card for the topic: "${topic}".
Include:
1. 3 Sure-shot MCQ Points (with exact values/data).
2. Common Pitfall/Trap to avoid.
3. 1 Memory Mnemonic.
Language: Bengali mixed with simple English. Keep it punchy and exam-ready!`;

      const response = await getStrangerResponse(prompt, [], "mahi", geminiApiKey);
      setGeneratedNote(response);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      setGeneratedNote("নোট তৈরি করতে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsGeneratingNote(false);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-stone-950 text-white overflow-hidden select-none">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between gap-4 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Headphones size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Exam Booster & Audio Podcasts</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                WBCHSE Sem 3
              </span>
            </h1>
            <p className="text-xs text-stone-400 font-medium hidden sm:block">
              অধ্যায়ভিত্তিক দ্রুত অডিও রিভিশন ও লাস্ট-মিনিট কি-পয়েন্ট ভল্ট
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFlashcardMode(!showFlashcardMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showFlashcardMode 
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30 font-black"
                : "bg-stone-800 hover:bg-stone-700 text-stone-300"
            }`}
          >
            <BrainCircuit size={14} />
            <span className="hidden sm:inline">Recall Flashcard Mode</span>
            <span className="sm:hidden">Flashcard</span>
          </button>

          {onClose && (
            <button
              onClick={() => {
                handleStopAudio();
                onClose();
              }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* Left Column: Audio Lessons & Playlists */}
        <div className="w-full md:w-5/12 lg:w-4/12 border-r border-stone-800/80 flex flex-col bg-stone-950/60 min-h-0">
          
          {/* Search & Subject Tabs */}
          <div className="p-3 sm:p-4 border-b border-stone-800/80 space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={14} />
              <input
                type="text"
                placeholder="Search chapters, keywords, or MCQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Subject Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {(["All", "Biology", "Bengali", "English"] as const).map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubject === subj
                      ? "bg-[#FF7A30] text-white shadow-sm"
                      : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                  }`}
                >
                  {subj === "All" ? "🌟 All Topics" : subj === "Biology" ? "🧬 Biology" : subj === "Bengali" ? "📚 Bengali A" : "📖 English B"}
                </button>
              ))}
            </div>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
            {filteredLessons.map((lesson, idx) => {
              const isSelected = activeLesson.id === lesson.id;
              const isThisPlaying = isPlaying && isSelected;

              return (
                <motion.div
                  key={`lesson-${lesson.id || idx}-${idx}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setActiveLesson(lesson);
                    if (isPlaying && activeLesson.id !== lesson.id) {
                      handlePlayAudio(lesson);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-amber-500/50 shadow-md shadow-amber-500/10"
                      : "bg-stone-900/70 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          lesson.subject === "Biology" 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : lesson.subject === "Bengali"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        }`}>
                          {lesson.subject}
                        </span>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Clock size={10} /> {lesson.duration}
                        </span>
                      </div>

                      <h4 className={`text-xs sm:text-sm font-bold leading-snug ${isSelected ? "text-amber-300" : "text-white"}`}>
                        {lesson.titleBn}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-mono">
                        {lesson.titleEn}
                      </p>
                    </div>

                    {/* Play/Pause Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(lesson);
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isThisPlaying
                          ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/40"
                          : "bg-stone-800 hover:bg-stone-700 text-amber-400"
                      }`}
                    >
                      {isThisPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>
                  </div>

                  {/* High Yield Tag */}
                  <div className="mt-2.5 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[10px] text-stone-400">
                    <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                      <Flame size={11} /> {lesson.criticalFacts.length} Critical Data Points
                    </span>
                    <span className="text-stone-400">
                      {lesson.keyPoints.length} Key Concepts
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Audio Player & Detailed Lesson View / Flashcards */}
        <div className="flex-1 flex flex-col bg-stone-900/30 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {showFlashcardMode ? (
            /* Flashcard Interactive Recall Mode */
            <div className="space-y-6 max-w-xl mx-auto w-full py-4">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Instant Memory Booster
                </span>
                <h3 className="text-lg font-black text-white">
                  Flashcard Recall Challenge (কার্ডে ক্লিক করে উত্তর দেখুন)
                </h3>
                <p className="text-xs text-stone-400">
                  কার্ড {activeFlashcardIndex + 1} / {filteredFacts.length}
                </p>
              </div>

              {filteredFacts.length > 0 ? (
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-[220px] rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 border-2 border-amber-500/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl relative select-none hover:border-amber-400 transition-all"
                >
                  <span className="absolute top-4 left-4 text-[10px] font-mono font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {filteredFacts[activeFlashcardIndex].subject}
                  </span>

                  <span className="absolute top-4 right-4 text-[10px] text-stone-500">
                    {isFlipped ? "Answer Side 🟢" : "Tap to Flip 🔄"}
                  </span>

                  <div className="space-y-3">
                    <p className="text-xs text-stone-400 font-medium">
                      {filteredFacts[activeFlashcardIndex].lessonTitle}
                    </p>
                    <h3 className="text-base sm:text-xl font-black text-white px-4">
                      {isFlipped ? filteredFacts[activeFlashcardIndex].value : filteredFacts[activeFlashcardIndex].label}
                    </h3>
                  </div>

                  <span className="mt-4 text-[11px] text-amber-400 font-bold">
                    {isFlipped ? "✓ দারুন মনে রেখেছ!" : "🔍 উত্তর দেখতে ক্লিক করুন"}
                  </span>
                </div>
              ) : (
                <div className="text-center py-12 text-stone-500 text-xs">
                  কোনো ফ্ল্যাশকার্ড পাওয়া যায়নি।
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveFlashcardIndex((prev) => (prev > 0 ? prev - 1 : filteredFacts.length - 1));
                  }}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                >
                  ← Previous Card
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveFlashcardIndex((prev) => (prev < filteredFacts.length - 1 ? prev + 1 : 0));
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1 transition-all shadow-md shadow-amber-500/20"
                >
                  Next Card →
                </button>
              </div>
            </div>
          ) : (
            /* Standard Audio Player & Comprehensive Revision View */
            <>
              {/* Active Playing Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/30 border border-amber-500/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {activeLesson.subject} • Live Audio
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        {activeLesson.duration}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      {activeLesson.titleBn}
                    </h2>
                    <p className="text-xs text-stone-400 font-mono">
                      {activeLesson.titleEn}
                    </p>
                  </div>

                  {/* Play Controls & Speed */}
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    {/* Speed Pill */}
                    <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-[11px] font-mono">
                      {[1.0, 1.15, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                            playbackSpeed === spd
                              ? "bg-amber-500 text-stone-950 font-black"
                              : "text-stone-400 hover:text-stone-200"
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePlayAudio(activeLesson)}
                      className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                        isPlaying
                          ? "bg-rose-600 text-white shadow-rose-600/30"
                          : "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-orange-500/30"
                      }`}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      <span>{isPlaying ? "Pause Audio" : "Listen Lecture"}</span>
                    </button>
                  </div>
                </div>

                {/* Live Transcript / Audio Script Box */}
                <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs text-stone-300 leading-relaxed font-sans">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    <Volume2 size={12} />
                    <span>Audio Transcript (বাস্তবসম্মত ভয়েস স্ক্রিপ্ট)</span>
                  </div>
                  <p>{activeLesson.audioScriptBn}</p>
                </div>
              </div>

              {/* Critical Sure-Shot Data Points Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Flame size={16} className="text-amber-400" />
                    <span>Sure-Shot High-Yield Data Points (লাস্ট মিনিট কি-পয়েন্ট)</span>
                  </h3>
                  <span className="text-[11px] text-stone-400">
                    Directly mapped to WBCHSE Semester 3 MCQs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeLesson.criticalFacts.map((fact, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800/80 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                          {fact.label}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-amber-300 font-sans">
                          {fact.value}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(`${fact.label}: ${fact.value}`, `${activeLesson.id}_${idx}`)}
                        className="p-2 rounded-xl bg-stone-900 text-stone-400 group-hover:text-amber-400 hover:bg-stone-800 transition-all"
                        title="Copy to clipboard"
                      >
                        {copiedFact === `${activeLesson.id}_${idx}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Concepts & Exam Tips */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Key Concepts */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <BookOpen size={14} />
                    <span>Core Syllabus Concepts</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-300">
                    {activeLesson.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exam Tips & Recommended MCQs */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Award size={14} />
                    <span>Sure-Shot MCQ Targets</span>
                  </h4>
                  <div className="space-y-2.5">
                    {activeLesson.recommendedMCQs.map((mcq, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-stone-200">
                        <span className="text-amber-400 font-bold mr-1">Q{i + 1}:</span>
                        <span>{mcq}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Custom Quick Note Generator */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleGenerateInstantNote(activeLesson.titleBn)}
                      disabled={isGeneratingNote}
                      className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 border border-amber-500/30 transition-all cursor-pointer"
                    >
                      <Sparkles size={14} className={isGeneratingNote ? "animate-spin" : ""} />
                      <span>{isGeneratingNote ? "Generating AI Cheat Card..." : "Generate AI Rapid Revision Card"}</span>
                    </button>

                    {generatedNote && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-stone-200 whitespace-pre-line leading-relaxed">
                        {generatedNote}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
