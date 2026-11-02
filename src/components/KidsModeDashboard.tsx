import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Star,
  Award,
  BookOpen,
  Rocket,
  Palette,
  Lightbulb,
  Smile,
  Send,
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sun,
  Moon,
  Compass,
  Zap,
  Globe,
  Heart,
  Music,
  RefreshCw,
  LogOut,
  Settings
} from "lucide-react";
import { TypewriterText } from "./TypewriterText";

interface KidsModeDashboardProps {
  userName: string;
  onExitKidsMode: () => void;
  geminiApiKey?: string;
  onOpenSettings: () => void;
}

type KidsTab = "wonder_ai" | "stories" | "science" | "games" | "alphabets" | "drawing";
type AgeGroup = "4-6" | "7-9" | "10-12";

interface StoryItem {
  id: string;
  titleBn: string;
  titleEn: string;
  age: AgeGroup;
  category: string;
  emoji: string;
  moralBn: string;
  moralEn: string;
  contentBn: string;
  contentEn: string;
}

interface ScienceWonder {
  id: string;
  titleBn: string;
  titleEn: string;
  emoji: string;
  color: string;
  shortDesc: string;
  funFactBn: string;
  funFactEn: string;
  detailsBn: string;
  detailsEn: string;
}

interface QuizQuestion {
  id: number;
  age: AgeGroup;
  questionBn: string;
  questionEn: string;
  emoji: string;
  optionsBn: string[];
  optionsEn: string[];
  correctIdx: number;
  funExplanationBn: string;
}

const STORIES_DATA: StoryItem[] = [
  {
    id: "lion_mouse",
    titleBn: "সিংহ ও ছোট্ট চালাক ইঁদুর",
    titleEn: "The Lion and the Little Mouse",
    age: "4-6",
    category: "Moral Story",
    emoji: "🦁🐭",
    moralBn: "ছোট হলেও যে কেউ বড় বিপদে সাহায্য করতে পারে। কাউকে অবহেলা করতে নেই!",
    moralEn: "Kindness is never wasted. Even the smallest friend can be of great help!",
    contentBn: "একদিন এক গভীর বনে এক মস্ত বড় সিংহ ঘুমাচ্ছিল। হঠাৎ এক ছোট্ট দুষ্টু ইঁদুর এসে সিংহের গায়ে লাফালাফি করতে লাগল। সিংহের ঘুম ভেঙে গেল! সিংহ রেগে গিয়ে ইঁদুরটিকে থাবা দিয়ে চেপে ধরল। ইঁদুরটি কেঁদে বলল, 'হে মহারাজ! আমায় ক্ষমা করুন, ভবিষ্যতে আমি কোনোদিন আপনার উপকারে আসব।' সিংহ হেসে তাকে ছেড়ে দিল। কিছুদিন পর, সিংহ এক শিকারির জালে বন্দি হলো। সিংহ গর্জন করতে লাগল! সেই ডাক শুনে ছোট্ট ইঁদুরটি দৌড়ে এলো এবং তার ধারালো দাঁত দিয়ে জাল কেটে সিংহকে মুক্ত করে দিল! সিংহ খুশি হয়ে ইঁদুরের সাথে চিরকালের বন্ধু হয়ে গেল।",
    contentEn: "Once in a deep green forest, a mighty lion was fast asleep. A tiny playful mouse scampered across his nose. The lion woke up angrily and caught the mouse with his heavy paw! The mouse begged, 'Please spare me, King! One day I might help you!' The lion laughed and let him go. Weeks later, hunters trapped the lion in a heavy rope net. Hearing his roars, the brave little mouse rushed over and gnawed the thick ropes with his sharp teeth, freeing the lion! From that day on, they were best friends."
  },
  {
    id: "space_rabbit",
    titleBn: "চাঁদের দেশে ছোট্ট খরগোশ",
    titleEn: "Little Bunny's Moon Rocket Adventure",
    age: "7-9",
    category: "Space Adventure",
    emoji: "🚀🐰🌕",
    moralBn: "কৌতূহল ও সাহস থাকলে যে কোনো নতুন স্বপ্ন সত্যি করা যায়!",
    moralEn: "With curiosity and courage, every dream is reachable!",
    contentBn: "টিংকু নামের এক ছোট্ট সাদা খরগোশ ছিল। রাতের বেলা সে ঘাসের ওপর শুয়ে চাঁদের দিকে তাকিয়ে ভাবত—'চাঁদটা কী দিয়ে তৈরি? ওখানে কি মিষ্টি গাজর পাওয়া যায়?' একদিন টিংকু কার্ডবোর্ড আর চকচকে ফয়েল দিয়ে এক সুন্দর রকেট বানাল। তার পাশে এসে দাঁড়াল রোবট বন্ধু রবিন। দুজনে মিলে উল্কা পেরিয়ে চাঁদে নামল! সেখানে তারা ভাসতে ভাসতে দেখল পৃথিবী কেমন নীল মার্বেলের মতো সুন্দর ঘুরছে। চাঁদে মাটি ছুঁয়ে টিংকু আনন্দে লাফাল, কারণ সে নিজের কল্পনার স্বপ্ন সত্যি করেছে!",
    contentEn: "Tinku was a curious white bunny who loved stargazing. Every night he wondered what the shiny moon felt like. With his robot pal Robin, Tinku built a glittering cardboard rocket with rocket boosters! 3... 2... 1... Blastoff! They soared past twinkling stars and landed softly on the glowing moon dust. Floating gently in zero gravity, they looked back at planet Earth—a sparkling blue and green marble in space. Tinku beamed with joy!"
  },
  {
    id: "gopal_wit",
    titleBn: "গোপাল ভাঁড় ও মিষ্টি রসগোল্লা",
    titleEn: "Gopal Bhar and the Magic Sweet",
    age: "7-9",
    category: "Funny & Wit",
    emoji: "👑🍯😋",
    moralBn: "বুদ্ধি ও হাস্যরস দিয়ে কঠিন সমস্যাও সহজে সমাধান করা যায়।",
    moralEn: "Wit and clever thinking can solve the trickiest problems with a smile!",
    contentBn: "মহারাজা কৃষ্ণচন্দ্র একদিন রাজসভায় ঘোষণা করলেন—'যে ব্যক্তি না খেয়ে বলতে পারবে হাঁড়ির রসগোল্লা কতটা মিষ্টি, তাকে সোনার মোহর দেব!' সব পণ্ডিতরা ভেবে অস্থির। তখন গোপাল ভাঁড় সামনে এলো। সে হাঁড়ির কাছে গিয়ে একগাল হেসে বলল, 'মহারাজ, আমার চোখের সামনে এই রসগোল্লা দেখে আমার জিভে যে জল এসেছে, সেই জলই বলে দিচ্ছে এটি অমৃতের মতো মিষ্টি!' রাজা গোপালের বুদ্ধিতে হেসে উঠলেন এবং খুশি হয়ে তাকে পুরস্কার দিলেন।",
    contentEn: "King Krishnachandra posed a funny riddle in his court: 'Who can tell how sweet these freshly made rasgullas are without eating a single bite?' All the wise ministers were puzzled. Clever Gopal Bhar stepped forward with a huge grin, looked at the pot, and said, 'Your Majesty, just the sight of them made my mouth water with delight—that proves they are as sweet as nectar!' The King chuckled happily and rewarded Gopal!"
  },
  {
    id: "water_cycle_friends",
    titleBn: "ছোট্ট জলবিন্দু রিমঝিমের বিশ্বভ্রমণ",
    titleEn: "Rimjhim the Water Droplet's Journey",
    age: "4-6",
    category: "Nature Wonder",
    emoji: "💧☀️☁️🌈",
    moralBn: "প্রকৃতিতে সব উপাদান একে অপরের সাথে মিলেমিশে কাজ করে আমাদের সুন্দর পৃথিবী বাঁচিয়ে রাখে।",
    moralEn: "Nature works in harmony to keep our living planet fresh and green.",
    contentBn: "রিমঝিম ছিল শান্ত নদীর এক ছোট্ট উজ্জ্বল জলবিন্দু। একদিন মিষ্টি রোদের তাপে রিমঝিম হালকা বাষ্প হয়ে আকাশে উড়তে লাগল। আকাশে গিয়ে সে তার কোটি কোটি জলবিন্দু বন্ধুদের সাথে মিলে নরম সাদা মেঘ তৈরি করল। মেঘ যখন ভারী হয়ে উঠল, ঠান্ডা বাতাসের ছোঁয়ায় রিমঝিম বৃষ্টির ফোঁটা হয়ে ঝরে পড়ল এক সবুজ পাহাড়ে! সেখান থেকে ঝরনা বেয়ে আবার ফিরে এল তার প্রিয় নদীতে। আর আকাশে হেসে উঠল সাতরঙা রামধনু!",
    contentEn: "Rimjhim was a sparkling water drop swimming in a blue river. On a sunny morning, warm sunlight tickled him into light vapor, floating up into the sky. High above, he met millions of droplet friends and formed a fluffy cloud. When the cool breeze blew, Rimjhim tumbled down as a joyful raindrop, watering flowers and splashing into streams back to the river—while painting a seven-colored rainbow across the sky!"
  }
];

const SCIENCE_WONDERS: ScienceWonder[] = [
  {
    id: "solar_system",
    titleBn: "আমাদের ৮টি গ্রহের সৌরজগৎ",
    titleEn: "The Solar System & 8 Planets",
    emoji: "🪐☀️🌍",
    color: "from-amber-500 to-orange-600",
    shortDesc: "সূর্যকে ঘিরে ঘুরছে পৃথিবী, মঙ্গল, বৃহস্পতি ও অন্য গ্রহরা!",
    funFactBn: "বৃহস্পতি (Jupiter) এত বড় যে তার ভেতর ১৩০০টি পৃথিবী অনায়াসে এঁটে যাবে!",
    funFactEn: "Jupiter is so gigantic that more than 1,300 Earths could fit inside it!",
    detailsBn: "সূর্য হলো একটি জ্বলন্ত নক্ষত্র যা আমাদের আলো ও তাপ দেয়। সূর্যের সবচেয়ে কাছে আছে বুধ, আর সবচেয়ে সুন্দর বলয় আছে শনি গ্রহের। আমাদের পৃথিবী একমাত্র গ্রহ যেখানে মিষ্টি জল, গাছপালা ও প্রাণ আছে!",
    detailsEn: "The Sun is a giant glowing star at the center. Mercury is closest, Mars is the red planet, Saturn has dazzling rings of ice and rock, and Earth is our precious home full of water and life!"
  },
  {
    id: "rainbow_science",
    titleBn: "আকাশে রামধনু কেন ওঠে?",
    titleEn: "Why Do Rainbows Appear?",
    emoji: "🌈🌦️✨",
    color: "from-pink-500 via-purple-500 to-indigo-600",
    shortDesc: "সূর্যের সাদা আলো বৃষ্টির ফোঁটায় ভেঙে ৭ রঙে পরিণত হয় (VIBGYOR)!",
    funFactBn: "সূর্যের আলো আসলে ৭টি রঙের মিশ্রণ: বেগুনি, নীল, আকাশি, সবুজ, হলুদ, কমলা ও লাল!",
    funFactEn: "White sunlight is actually made of 7 rainbow colors: Violet, Indigo, Blue, Green, Yellow, Orange, and Red!",
    detailsBn: "যখন আকাশে একই সাথে বৃষ্টি হয় আর রোদ ওঠে, তখন প্রতিটি বৃষ্টির ফোঁটা ছোট্ট প্রিজমের মতো কাজ করে। সূর্যের সাদা আলো ফোঁটার ভেতর ঢুকে ভেঙে গিয়ে আকাশে চমৎকার সাতরঙা ধনুকের মতো ফুটে ওঠে!",
    detailsEn: "When sunlight passes through falling raindrops, each tiny droplet bends and reflects the light like a crystal prism, splitting it into a magical arch of 7 bright colors across the sky!"
  },
  {
    id: "dinosaur_world",
    titleBn: "ডাইনোসরদের রোমাঞ্চকর পৃথিবী",
    titleEn: "The Mighty Dinosaur Kingdom",
    emoji: "🦖🦕🌋",
    color: "from-emerald-500 to-teal-700",
    shortDesc: "লক্ষ লক্ষ বছর আগে পৃথিবীতে ছিল টি-রেক্স আর লম্বা গলার ব্র্যাকিওসরাস!",
    funFactBn: "আজকের মিষ্টি মিষ্টি চড়ুই আর টিয়া পাখিরা আসলে প্রাচীন ডাইনোসরদের দূর সম্পর্কের বংশধর!",
    funFactEn: "Modern birds like robins and parrots are living descendants of ancient feathered dinosaurs!",
    detailsBn: "ডাইনোসররা পৃথিবীর সবচেয়ে বড় প্রাণী ছিল। এদের মধ্যে কেউ ছিল গাছপালা খাওয়া শান্ত তৃণভোজী (যেমন ডিপ্লোডোকাস), আবার কেউ ছিল দ্রুত দৌড়ানো শিকারী (যেমন ভেলোসিরাপটর ও টি-রেক্স)।",
    detailsEn: "Millions of years ago, colossal dinosaurs walked the Earth. Some were gentle giants munching treetops, while T-Rex had teeth as big as bananas and footsteps that shook the ground!"
  },
  {
    id: "human_body_superpower",
    titleBn: "আমাদের শরীরের সুপারপাওয়ার",
    titleEn: "Human Body Superpowers",
    emoji: "🧠❤️🫁",
    color: "from-rose-500 to-red-600",
    shortDesc: "হৃৎপিণ্ড দিনে ১ লক্ষ বার পাম্প করে আর মস্তিষ্ক কোটি সংকেত পাঠায়!",
    funFactBn: "আমাদের শরীরে এত রক্তনালী আছে যে সোজা করলে পুরো পৃথিবী দু'বার ঘুরে আসা যাবে!",
    funFactEn: "Your blood vessels are so long that if laid end-to-end, they could circle Earth twice!",
    detailsBn: "আমাদের মস্তিষ্ক সুপারকম্পিউটারের চেয়েও দ্রুত চিন্তা করে। চোখ কোটি রঙের ছবি তোলে এবং নাক হাজারো রকমের গন্ধ চিনতে পারে। আর নিয়মিত দুধ ও ফল খেলে আমাদের হাড় ও পেশি লোহার মতো শক্ত হয়!",
    detailsEn: "Your heart pumps superhero fuel around the body 100,000 times a day, your brain creates creative ideas, and healthy food gives your muscles real-life energy power!"
  }
];

const QUIZ_DATA: QuizQuestion[] = [
  {
    id: 1,
    age: "4-6",
    emoji: "☀️",
    questionBn: "দিনের বেলা আকাশে উজ্জ্বল আলো দেয় কে?",
    questionEn: "What gives us bright light and warmth during daytime?",
    optionsBn: ["চাঁদ (Moon)", "সূর্য (Sun)", "তারা (Star)", "মেঘ (Cloud)"],
    optionsEn: ["Moon", "Sun", "Star", "Cloud"],
    correctIdx: 1,
    funExplanationBn: "ঠিক বলেছ! সূর্য হলো আমাদের সৌরজগতের আলো ও শক্তির উৎস। ☀️"
  },
  {
    id: 2,
    age: "4-6",
    emoji: "🐮",
    questionBn: "আমাদের সুস্বাদু ও পুষ্টিকর দুধ দেয় কোন প্রাণী?",
    questionEn: "Which friendly animal gives us healthy milk?",
    optionsBn: ["বাঘ (Tiger)", "গরু (Cow)", "সিংহ (Lion)", "বানর (Monkey)"],
    optionsEn: ["Tiger", "Cow", "Lion", "Monkey"],
    correctIdx: 1,
    funExplanationBn: "দারুণ! গাভী আমাদের পুষ্টিকর দুধ দেয় যা হাড় শক্ত করে। 🥛"
  },
  {
    id: 3,
    age: "7-9",
    emoji: "🌈",
    questionBn: "আকাশের রামধনুতে (Rainbow) কয়টি প্রধান রঙ থাকে?",
    questionEn: "How many main colors are in a rainbow (VIBGYOR)?",
    optionsBn: ["৩ টি (3)", "৫ টি (5)", "৭ টি (7)", "১০ টি (10)"],
    optionsEn: ["3 colors", "5 colors", "7 colors", "10 colors"],
    correctIdx: 2,
    funExplanationBn: "একদম সঠিক! রামধনুতে ৭টি সুন্দর রঙ থাকে (বেগুনি থেকে লাল)। 🎨"
  },
  {
    id: 4,
    age: "7-9",
    emoji: "🌱",
    questionBn: "গাছপালা খাবার তৈরি করতে কোন জিনিসের সাহায্য নেয়?",
    questionEn: "What helps green plants make their food (Photosynthesis)?",
    optionsBn: ["আইসক্রিম", "সূর্যের আলো ও জল", "চকলেট", "রাতের অন্ধকার"],
    optionsEn: ["Ice Cream", "Sunlight & Water", "Chocolate", "Complete Darkness"],
    correctIdx: 1,
    funExplanationBn: "ব্রিলিয়ান্ট! সবুজ গাছপালা সূর্যের আলো ও জল দিয়ে খাবার বানায়। 🌿"
  },
  {
    id: 5,
    age: "10-12",
    emoji: "🪐",
    questionBn: "সৌরজগতের সবচেয়ে বড় গ্রহ কোনটি?",
    questionEn: "Which is the largest planet in our solar system?",
    optionsBn: ["পৃথিবী (Earth)", "মঙ্গল (Mars)", "বৃহস্পতি (Jupiter)", "বুধ (Mercury)"],
    optionsEn: ["Earth", "Mars", "Jupiter", "Mercury"],
    correctIdx: 2,
    funExplanationBn: "পারফেক্ট! বৃহস্পতি (Jupiter) সৌরজগতের রাজা এবং সবচেয়ে বড় গ্রহ। 👑"
  }
];

export const KidsModeDashboard: React.FC<KidsModeDashboardProps> = ({
  userName,
  onExitKidsMode,
  geminiApiKey,
  onOpenSettings
}) => {
  const [activeTab, setActiveTab] = useState<KidsTab>("wonder_ai");
  const [selectedAge, setSelectedAge] = useState<AgeGroup>("7-9");
  const [starsCount, setStarsCount] = useState<number>(() => {
    return parseInt(localStorage.getItem("kids_stars") || "12");
  });

  // Story reader state
  const [selectedStory, setSelectedStory] = useState<StoryItem>(STORIES_DATA[0]);
  const [isReadingStory, setIsReadingStory] = useState(false);
  const [storyLang, setStoryLang] = useState<"bn" | "en">("bn");

  // Science card modal
  const [selectedScience, setSelectedScience] = useState<ScienceWonder | null>(null);

  // Wonder Bot AI State
  const [wonderQuery, setWonderQuery] = useState("");
  const [isWonderThinking, setIsWonderThinking] = useState(false);
  const [wonderMessages, setWonderMessages] = useState<Array<{ sender: "user" | "bot"; text: string; audioUrl?: string }>>([
    {
      sender: "bot",
      text: `নমস্কার ছোট্ট বন্ধু ${userName}! 🌟 আমি তোমার 'Wonder Bot'। তুমি বিজ্ঞান, পশুপাখি, মহাকাশ, ডাইনোসর বা রূপকথার গল্প যা কিছু জানতে চাও আমায় জিজ্ঞেস করো!`
    }
  ]);

  // Quiz State
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#FF7A30");
  const [brushSize, setBrushSize] = useState(6);

  // Text to Speech with high quality voice selection
  const speakText = (text: string, lang: "bn" | "en" = "bn") => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      // Clean markdown/emojis for clean speech synthesis
      const cleanText = text.replace(/[*#_~`>]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.92;
      utterance.pitch = 1.08; // Friendly, warm & engaging pitch

      const voices = window.speechSynthesis.getVoices();
      if (lang === "bn") {
        const bnVoice = voices.find(v => v.lang.startsWith("bn") || v.lang.includes("Bengali") || v.name.toLowerCase().includes("bengali") || v.name.toLowerCase().includes("bangla"));
        if (bnVoice) {
          utterance.voice = bnVoice;
          utterance.lang = bnVoice.lang;
        } else {
          utterance.lang = "bn-IN";
        }
      } else {
        const naturalEnVoice = voices.find(v => (v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Jenny"))));
        if (naturalEnVoice) {
          utterance.voice = naturalEnVoice;
        }
        utterance.lang = "en-US";
      }

      utterance.onend = () => setIsReadingStory(false);
      utterance.onerror = () => setIsReadingStory(false);
      window.speechSynthesis.speak(utterance);
      setIsReadingStory(true);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsReadingStory(false);
    }
  };

  // Add stars helper
  const earnStars = (amount: number = 1) => {
    const next = starsCount + amount;
    setStarsCount(next);
    localStorage.setItem("kids_stars", next.toString());
  };

  // Ask Wonder Bot
  const handleAskWonderBot = async (customPrompt?: string) => {
    const question = customPrompt || wonderQuery;
    if (!question.trim() || isWonderThinking) return;

    const userMsg = { sender: "user" as const, text: question };
    setWonderMessages((prev) => [...prev, userMsg]);
    setWonderQuery("");
    setIsWonderThinking(true);

    try {
      let botResponse = "";
      const effectiveKey = geminiApiKey;

      if (!effectiveKey) {
        try {
          const promptText = `You are "Wonder Bot", a super joyful, magical, warm and caring AI companion for young children aged ${selectedAge} years.
The child's name is ${userName}.
Child's Question: "${question}"

Instructions:
1. Explain the answer in simple, magical, easy-to-understand words that a 4-12 year old kid will love.
2. Use cheerful emojis, cute comparisons (e.g., comparing planets to basketballs/marbles, clouds to cotton candy, heart to a water pump).
3. If the question is in Bengali or English, provide the explanation primarily in warm, sweet Bengali with easy English keywords in brackets.
4. Keep the response within 3-4 friendly, engaging short paragraphs.
5. End with a loving encouraging note or a fun mini question to spark their curiosity!`;

          const res = await fetch("/api/ai/generateContent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: promptText,
              model: "gemini-2.5-flash"
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.text) {
              botResponse = data.text;
            }
          }
        } catch (proxyErr) {
          console.warn("Kids proxy fetch failed, using local fallback...", proxyErr);
        }

        if (!botResponse) {
          // Fallback intelligent answers for kids
          if (question.includes("আকাশ") || question.includes("নীল") || question.includes("sky")) {
            botResponse = "বাহ্! কী চমৎকার প্রশ্ন! 🌤️ সূর্যের আলোয় সব রঙ লুকানো থাকে। কিন্তু নীল রঙ বাতাসের ছোট ছোট কণার সাথে ধাক্কা খেয়ে চারদিকে ছড়িয়ে পড়ে। তাই পুরো আকাশটা আমাদের চোখে সুন্দর নীল দেখায়! 💙";
          } else if (question.includes("ডাইনোসর") || question.includes("dinosaur")) {
            botResponse = "ডাইনোসররা ছিল বিশাল শক্তিশালী প্রাণী! 🦖 লক্ষ লক্ষ বছর আগে তারা পৃথিবীতে রাজত্ব করত। এক বিশাল উল্কা পৃথিবীতে আছড়ে পড়ার পর তারা বিদায় নেয়, কিন্তু তাদের দূর সম্পর্কের নাতি-নাতনিরা কিন্তু এখনো আমাদের আশপাশে উড়ে বেড়ায়—যেমন পায়রা ও টিয়া পাখি! 🦜";
          } else if (question.includes("চাঁদ") || question.includes("moon")) {
            botResponse = "চাঁদ হলো আমাদের পৃথিবীর একমাত্র মিষ্টি উপগ্রহ! 🌕 চাঁদের নিজের কোনো আলো নেই, সূর্যের আলো চাঁদের গায়ে পড়ে ঠিক আয়নার মতো চকচক করে! 🌟";
          } else if (question.includes("বৃষ্টি") || question.includes("rain")) {
            botResponse = "নদী আর পুকুরের জল রোদের তাপে বাষ্প হয়ে আকাশে উড়ে নরম মেঘ তৈরি করে। ☁️ মেঘ যখন ভারী আর ঠান্ডা হয়ে যায়, তখন টুপটাপ করে মিষ্টি বৃষ্টির ফোঁটা হয়ে মাটিতে ঝরে পড়ে! 💧🌧️";
          } else {
            botResponse = `দারুণ প্রশ্ন বন্ধু ${userName}! 🌟 তোমার চারপাশের সবকিছুই কিন্তু খুব মজার ম্যাজিকে ভরা। প্রতিদিন নতুন কিছু জানতে চেষ্টা করো, তাহলে তুমি বড় হয়ে একজন দারুণ বিজ্ঞানী হবে! 🚀✨`;
          }
        }
      } else {
        const prompt = `You are "Wonder Bot", a super joyful, magical, warm and caring AI companion for young children aged ${selectedAge} years.
The child's name is ${userName}.
Child's Question: "${question}"

Instructions:
1. Explain the answer in simple, magical, easy-to-understand words that a 4-12 year old kid will love.
2. Use cheerful emojis, cute comparisons (e.g., comparing planets to basketballs/marbles, clouds to cotton candy, heart to a water pump).
3. If the question is in Bengali or English, provide the explanation primarily in warm, sweet Bengali with easy English keywords in brackets.
4. Keep the response within 3-4 friendly, engaging short paragraphs.
5. End with a loving encouraging note or a fun mini question to spark their curiosity!`;

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(effectiveKey ? { "x-gemini-api-key": effectiveKey } : {})
          },
          body: JSON.stringify({
            prompt,
            apiKey: effectiveKey
          })
        });

        if (res.ok) {
          const resData = await res.json();
          botResponse = resData.response || "তুমি দারুণ একটা প্রশ্ন করেছ! এসো সহজ করে জেনে নিই...";
        } else {
          botResponse = "তুমি দারুণ একটা প্রশ্ন করেছ! এসো সহজ করে জেনে নিই...";
        }
      }

      setWonderMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
      earnStars(2);
      speakText(botResponse.slice(0, 200), "bn");
    } catch (err) {
      setWonderMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "তুমি দারুণ প্রশ্ন করেছ বন্ধু! 🌟 চলো আবার চেষ্টা করি!"
        }
      ]);
    } finally {
      setIsWonderThinking(false);
    }
  };

  // Drawing Canvas setup
  useEffect(() => {
    if (activeTab === "drawing" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleQuizAnswer = (optIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);
    const currQ = QUIZ_DATA[quizIdx];
    if (optIdx === currQ.correctIdx) {
      setQuizScore((prev) => prev + 1);
      earnStars(3);
      speakText("দারুণ হয়েছে! তুমি একদম সঠিক উত্তর দিয়েছ! 🎉", "bn");
    } else {
      speakText("চেষ্টা করার জন্য ধন্যবাদ! সঠিক উত্তর হলো: " + currQ.optionsBn[currQ.correctIdx], "bn");
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    if (quizIdx + 1 < QUIZ_DATA.length) {
      setQuizIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      earnStars(5);
    }
  };

  const resetQuiz = () => {
    setQuizIdx(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-amber-50 via-sky-50 to-pink-50 dark:from-[#1E1B2E] dark:via-[#161426] dark:to-[#0F0E17] text-stone-900 dark:text-stone-100 flex flex-col overflow-hidden select-none font-sans">
      
      {/* Top Playful Header */}
      <header className="px-4 py-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b-4 border-amber-300 dark:border-amber-500/30 flex items-center justify-between shadow-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 text-2xl"
          >
            🎨
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600">
                Study Stranger Kids (শিশু আনন্দধাম)
              </h1>
              <span className="bg-amber-400 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase shadow-sm animate-pulse">
                Ages 4-12
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              হ্যালো <strong className="text-orange-500 font-bold">{userName || "ছোট্ট বন্ধু"}</strong>! চলো আনন্দ নিয়ে শিখি! 🌈
            </p>
          </div>
        </div>

        {/* Stars Counter & Exit Button */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Star Counter Pill */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 rounded-2xl font-black text-xs shadow-md border-2 border-white dark:border-stone-800 cursor-pointer"
            title="Collected Learning Stars"
          >
            <Star size={16} className="fill-stone-950 text-stone-950 animate-spin" style={{ animationDuration: "12s" }} />
            <span>{starsCount} Stars</span>
          </motion.div>

          {/* Age Switcher Filter */}
          <div className="hidden sm:flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
            {(["4-6", "7-9", "10-12"] as AgeGroup[]).map((age) => (
              <button
                key={age}
                onClick={() => setSelectedAge(age)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all ${
                  selectedAge === age
                    ? "bg-white dark:bg-stone-900 text-orange-600 shadow-sm"
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                {age} Yrs
              </button>
            ))}
          </div>

          {/* Exit / Return to Class 12 Mode */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onExitKidsMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-2xl text-[11px] font-bold transition-all border border-stone-300 dark:border-stone-600"
            title="Switch back to Class 12 Senior Student Exam Mode"
          >
            <LogOut size={13} />
            <span className="hidden md:inline">Exit Kids Mode</span>
            <span className="md:hidden">Exit</span>
          </motion.button>
        </div>
      </header>

      {/* Child Category Tabs Navigation */}
      <div className="bg-white/80 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 shadow-sm">
        {[
          { id: "wonder_ai", label: "🌟 Wonder Bot (ম্যাজিক এআই)", icon: Sparkles, color: "text-amber-500" },
          { id: "stories", label: "📖 গল্পের ঝুলি (Stories)", icon: BookOpen, color: "text-purple-500" },
          { id: "science", label: "🚀 বিজ্ঞানের ম্যাজিক (Science)", icon: Rocket, color: "text-sky-500" },
          { id: "games", label: "🎮 মজার কুইজ (Quiz & Fun)", icon: Award, color: "text-emerald-500" },
          { id: "alphabets", label: "🔤 বর্ণমালা ও সংখ্যা (ABC & 123)", icon: Lightbulb, color: "text-rose-500" },
          { id: "drawing", label: "🎨 ড্রয়িং প্যাড (Art Pad)", icon: Palette, color: "text-pink-500" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(tab.id as KidsTab);
                stopSpeaking();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 ${
                isActive
                  ? "bg-orange-500 border-orange-600 text-white shadow-md shadow-orange-500/30 scale-105"
                  : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100"
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : tab.color} />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Main Tab Content Display */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        
        {/* 1. WONDER BOT AI TAB */}
        {activeTab === "wonder_ai" && (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Friendly Mascot Hero Banner */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 rounded-3xl p-5 md:p-6 text-white shadow-xl flex flex-col md:flex-row items-center gap-5 relative overflow-hidden">
              <div className="text-5xl md:text-6xl animate-bounce">🤖✨</div>
              <div className="flex-1 text-center md:text-left space-y-1">
                <h2 className="text-xl md:text-2xl font-black">Wonder Bot AI: তোমার ছোট্ট বন্ধু!</h2>
                <p className="text-xs md:text-sm text-white/90 font-medium">
                  যেকোনো প্রশ্ন করো—আকাশ, তারা, ডাইনোসর, ফুল, পাখি বা মজার গণিত নিয়ে। আমি সুন্দর করে বুঝিয়ে দেব! 🌟
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isReadingStory ? (
                  <button
                    onClick={stopSpeaking}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-lg"
                  >
                    <VolumeX size={14} /> Stop Voice
                  </button>
                ) : (
                  <button
                    onClick={() => speakText("নমস্কার বন্ধু! আমি তোমার ওয়ান্ডার বট। কী শিখতে চাও আমাকে বলো!", "bn")}
                    className="px-3.5 py-2 bg-white text-stone-900 hover:bg-amber-100 font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-lg"
                  >
                    <Volume2 size={14} className="text-orange-600" /> Listen Voice
                  </button>
                )}
              </div>
            </div>

            {/* Quick Prompt Questions for Kids */}
            <div className="space-y-2">
              <span className="text-xs font-black text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={13} className="text-orange-500" /> মজার প্রশ্ন বেছে নাও (Tap to Ask):
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "কেন আকাশ নীল দেখায়? 🌤️",
                  "ডাইনোসররা কোথায় গেল? 🦖",
                  "পাখিরা কেমন করে ওড়ে? 🕊️",
                  "গাছপালা কেমন করে খাবার বানায়? 🌱",
                  "চাঁদ কেন রাতে চকচক করে? 🌕",
                  "আমাদের হৃৎপিণ্ড কীভাবে কাজ করে? ❤️",
                  "রামধনুতে ৭টি রঙ কেন থাকে? 🌈"
                ].map((q, idx) => (
                  <motion.button
                    key={`kid-prompt-${idx}`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAskWonderBot(q)}
                    className="px-3 py-1.5 bg-white dark:bg-stone-800 border-2 border-amber-200 dark:border-amber-700/50 rounded-2xl text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-amber-50 shadow-sm cursor-pointer transition-all"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 md:p-6 border-2 border-stone-200 dark:border-stone-800 shadow-lg min-h-[300px] max-h-[450px] overflow-y-auto space-y-4">
              {wonderMessages.map((msg, idx) => (
                <div
                  key={`kid-msg-${idx}-${msg.sender}`}
                  className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 shadow-md ${
                    msg.sender === "user" ? "bg-orange-500 text-white" : "bg-purple-600 text-white"
                  }`}>
                    {msg.sender === "user" ? "👦" : "🤖"}
                  </div>
                  <div className={`p-4 rounded-3xl max-w-[85%] text-xs md:text-sm font-medium leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-orange-500 text-white rounded-tr-none"
                      : "bg-amber-50 dark:bg-stone-800 border-2 border-amber-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 rounded-tl-none space-y-2"
                  }`}>
                    <div className="whitespace-pre-line">
                      {msg.sender === "user" ? (
                        msg.text
                      ) : (
                        <TypewriterText
                          text={msg.text}
                          enabled={idx === wonderMessages.length - 1}
                          speed={14}
                          chunkSize={3}
                          cursorClassName="inline-block w-1.5 h-3.5 bg-orange-500 ml-0.5 align-middle animate-pulse"
                        />
                      )}
                    </div>
                    {msg.sender === "bot" && (
                      <div className="flex items-center gap-2 pt-1 border-t border-amber-200/40 dark:border-stone-700/60">
                        <button
                          onClick={() => speakText(msg.text, "bn")}
                          className="flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          <Volume2 size={13} /> পড়ে শোনাও (Listen)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isWonderThinking && (
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 animate-pulse p-3 bg-amber-50 dark:bg-stone-800 rounded-2xl w-fit">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Wonder Bot ভাবছে এবং উত্তর সাজাচ্ছে... ✨</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-2 rounded-3xl border-4 border-amber-300 dark:border-amber-600 shadow-xl">
              <input
                type="text"
                value={wonderQuery}
                onChange={(e) => setWonderQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskWonderBot()}
                placeholder="এখানে তোমার মজার প্রশ্নটি লেখো..."
                className="flex-1 bg-transparent px-4 py-2 text-sm font-medium outline-none text-stone-900 dark:text-white placeholder:text-stone-400"
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleAskWonderBot()}
                disabled={isWonderThinking}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-black text-xs rounded-2xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>জিজ্ঞেস করো</span>
                <Send size={13} />
              </motion.button>
            </div>
          </div>
        )}

        {/* 2. STORIES TAB */}
        {activeTab === "stories" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <BookOpen size={22} /> গল্পের জাদুকরি ঝুলি (Moral Storybook)
                </h2>
                <p className="text-xs text-stone-500">শোনো এবং পড়ো মজার রূপকথা ও শিক্ষণীয় গল্প!</p>
              </div>
              <div className="flex items-center bg-stone-200 dark:bg-stone-800 p-1 rounded-2xl border">
                <button
                  onClick={() => setStoryLang("bn")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${storyLang === "bn" ? "bg-purple-600 text-white" : "text-stone-600 dark:text-stone-300"}`}
                >
                  বাংলা
                </button>
                <button
                  onClick={() => setStoryLang("en")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${storyLang === "en" ? "bg-purple-600 text-white" : "text-stone-600 dark:text-stone-300"}`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Story Picker Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {STORIES_DATA.map((story) => (
                <motion.div
                  key={story.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedStory(story);
                    stopSpeaking();
                  }}
                  className={`p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                    selectedStory.id === story.id
                      ? "bg-purple-500 text-white border-purple-600 shadow-lg shadow-purple-500/30"
                      : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-purple-300"
                  }`}
                >
                  <div className="text-3xl mb-2">{story.emoji}</div>
                  <h3 className="text-sm font-black line-clamp-1">{storyLang === "bn" ? story.titleBn : story.titleEn}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${
                    selectedStory.id === story.id ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                  }`}>
                    {story.category}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Story Reader Card */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 md:p-8 border-4 border-purple-200 dark:border-purple-900/50 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{selectedStory.emoji}</div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-stone-900 dark:text-white">
                      {storyLang === "bn" ? selectedStory.titleBn : selectedStory.titleEn}
                    </h3>
                    <span className="text-xs text-purple-600 font-bold">বয়স: {selectedStory.age} Years</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isReadingStory ? (
                    <button
                      onClick={stopSpeaking}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Pause size={14} /> থামা ও (Pause)
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const txt = storyLang === "bn" ? selectedStory.contentBn : selectedStory.contentEn;
                        speakText(txt, storyLang);
                        earnStars(1);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Play size={14} /> পুরো গল্প শোনো (Read Aloud)
                    </button>
                  )}
                </div>
              </div>

              {/* Story Text */}
              <div className="text-sm md:text-base leading-relaxed text-stone-700 dark:text-stone-200 font-medium space-y-4">
                <p className="first-letter:text-3xl first-letter:font-black first-letter:text-purple-600">
                  {storyLang === "bn" ? selectedStory.contentBn : selectedStory.contentEn}
                </p>
              </div>

              {/* Moral Box */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border-2 border-amber-300 dark:border-amber-700/50 flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="text-xs font-black uppercase text-amber-800 dark:text-amber-300">শিক্ষণীয় শিক্ষা (Moral):</h4>
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                    {storyLang === "bn" ? selectedStory.moralBn : selectedStory.moralEn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SCIENCE WONDERS TAB */}
        {activeTab === "science" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-sky-600 dark:text-sky-400 flex items-center gap-2">
                <Rocket size={22} /> বিজ্ঞানের রোমাঞ্চকর আবিষ্কার ও ম্যাজিক!
              </h2>
              <p className="text-xs text-stone-500">জেনে নাও পৃথিবী, সৌরজগৎ, ডাইনোসর ও আমাদের শরীরের বিস্ময়কর তথ্য!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SCIENCE_WONDERS.map((wonder) => (
                <motion.div
                  key={wonder.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => {
                    setSelectedScience(wonder);
                    speakText(wonder.detailsBn, "bn");
                    earnStars(2);
                  }}
                  className="bg-white dark:bg-stone-900 rounded-3xl p-5 border-3 border-sky-200 dark:border-sky-900/40 shadow-lg cursor-pointer space-y-3 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-4xl group-hover:scale-125 transition-transform">{wonder.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-2.5 py-1 rounded-full">
                      Tap to Explore
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-stone-900 dark:text-white">{wonder.titleBn}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">{wonder.shortDesc}</p>
                  </div>
                  <div className="p-3 bg-sky-50 dark:bg-stone-800 rounded-2xl border border-sky-100 dark:border-stone-700 text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2">
                    <span>💡 মজার তথ্য:</span>
                    <span className="text-[11px] font-medium">{wonder.funFactBn}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Science Detail Modal */}
            <AnimatePresence>
              {selectedScience && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 border-4 border-sky-400 shadow-2xl space-y-4 relative"
                  >
                    <button
                      onClick={() => {
                        setSelectedScience(null);
                        stopSpeaking();
                      }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900"
                    >
                      <XCircle size={20} />
                    </button>
                    <div className="text-5xl text-center">{selectedScience.emoji}</div>
                    <h3 className="text-xl font-black text-center text-sky-600 dark:text-sky-400">{selectedScience.titleBn}</h3>
                    <p className="text-xs text-center text-stone-500 font-bold">{selectedScience.titleEn}</p>
                    <div className="p-4 bg-sky-50 dark:bg-stone-800 rounded-2xl text-xs md:text-sm leading-relaxed text-stone-800 dark:text-stone-200">
                      {selectedScience.detailsBn}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => speakText(selectedScience.detailsBn, "bn")}
                        className="px-4 py-2 bg-sky-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <Volume2 size={14} /> পড়ে শোনাও (Voice)
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 4. FUN QUIZ TAB */}
        {activeTab === "games" && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Award size={22} /> মজার স্টার কুইজ (Fun Quiz Game)
                </h2>
                <p className="text-xs text-stone-500">সঠিক উত্তর দিয়ে জিতো চকচকে সোনার স্টার! ⭐</p>
              </div>
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                প্রশ্ন {quizIdx + 1} / {QUIZ_DATA.length}
              </span>
            </div>

            {!quizFinished ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 md:p-8 border-4 border-emerald-300 dark:border-emerald-700/50 shadow-xl space-y-6">
                <div className="text-5xl text-center">{QUIZ_DATA[quizIdx].emoji}</div>
                <h3 className="text-base md:text-lg font-black text-center text-stone-900 dark:text-white">
                  {QUIZ_DATA[quizIdx].questionBn}
                </h3>
                <p className="text-xs text-center text-stone-400 font-medium">
                  {QUIZ_DATA[quizIdx].questionEn}
                </p>

                {/* Option Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUIZ_DATA[quizIdx].optionsBn.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === QUIZ_DATA[quizIdx].correctIdx;
                    let btnStyle = "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-emerald-400";

                    if (selectedOption !== null) {
                      if (isCorrect) btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow-md";
                      else if (isSelected) btnStyle = "bg-rose-500 text-white border-rose-600";
                    }

                    return (
                      <motion.button
                        key={`kid-opt-${quizIdx}-${idx}`}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleQuizAnswer(idx)}
                        disabled={selectedOption !== null}
                        className={`p-4 rounded-2xl border-3 text-xs md:text-sm font-black transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedOption !== null && isCorrect && <CheckCircle size={16} className="text-white" />}
                        {selectedOption !== null && isSelected && !isCorrect && <XCircle size={16} className="text-white" />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation on Answer */}
                {selectedOption !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex flex-col gap-2"
                  >
                    <p>{QUIZ_DATA[quizIdx].funExplanationBn}</p>
                    <button
                      onClick={handleNextQuiz}
                      className="self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1"
                    >
                      <span>পরবর্তী প্রশ্ন</span>
                      <ArrowRight size={13} />
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Quiz Finished Winner Card */
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border-4 border-amber-400 shadow-2xl text-center space-y-4">
                <div className="text-6xl animate-bounce">🏆🎉⭐</div>
                <h3 className="text-2xl font-black text-orange-600">অসাধারণ পারফরম্যান্স!</h3>
                <p className="text-sm font-bold text-stone-600 dark:text-stone-300">
                  তুমি {QUIZ_DATA.length} টির মধ্যে {quizScore} টি সঠিক উত্তর দিয়েছ!
                </p>
                <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-lg">
                  <Star className="fill-amber-500" />
                  <span>+5 বোনাস স্টার অর্জন করেছ!</span>
                </div>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-2xl text-sm shadow-xl flex items-center gap-2 mx-auto"
                >
                  <RotateCcw size={16} /> আবার খেলো (Play Again)
                </button>
              </div>
            )}
          </div>
        )}

        {/* 5. ALPHABETS & MATH TAB */}
        {activeTab === "alphabets" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Lightbulb size={22} /> বর্ণমালা ও মজার গণিত (ABC, অ আ ক খ & 123)
              </h2>
              <p className="text-xs text-stone-500">ক্লিক করে শোনো সঠিক উচ্চারণ ও গণিতের ম্যাজিক!</p>
            </div>

            {/* Bengali Vowels */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border-2 border-rose-200 dark:border-rose-900/50 shadow-md space-y-3">
              <h3 className="text-sm font-black text-rose-600">বাংলা স্বরবর্ণ (Vowels):</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2">
                {["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ"].map((letter) => (
                  <motion.button
                    key={letter}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      speakText(letter, "bn");
                      earnStars(1);
                    }}
                    className="h-12 rounded-2xl bg-rose-50 dark:bg-stone-800 border-2 border-rose-200 dark:border-rose-700/60 font-black text-lg text-rose-700 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    {letter}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* English Alphabets */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border-2 border-indigo-200 dark:border-indigo-900/50 shadow-md space-y-3">
              <h3 className="text-sm font-black text-indigo-600">English Alphabets (A to Z):</h3>
              <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-2">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                  <motion.button
                    key={letter}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      speakText(letter, "en");
                      earnStars(1);
                    }}
                    className="h-10 rounded-2xl bg-indigo-50 dark:bg-stone-800 border-2 border-indigo-200 dark:border-indigo-700/60 font-black text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    {letter}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Fun Math Addition / Fruit Counting Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { expr: "২ 🍎 + ৩ 🍎 = ৫ 🍎", label: "2 + 3 = 5 (যোগফল)" },
                { expr: "৪ 🍌 + ৪ 🍌 = ৮ 🍌", label: "4 + 4 = 8 (যোগফল)" },
                { expr: "৫ 🍓 x ২ = ১০ 🍓", label: "5 x 2 = 10 (গুণফল)" }
              ].map((item, i) => (
                <div key={`fun-math-${i}-${item.label}`} className="p-4 bg-amber-50 dark:bg-stone-800 rounded-2xl border-2 border-amber-300 text-center space-y-1">
                  <div className="text-lg font-black text-amber-800 dark:text-amber-300">{item.expr}</div>
                  <span className="text-[11px] text-stone-500 font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. DRAWING PAD TAB */}
        {activeTab === "drawing" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-pink-600 dark:text-pink-400 flex items-center gap-2">
                  <Palette size={22} /> ম্যাজিক ড্রয়িং প্যাড (Magic Art Canvas)
                </h2>
                <p className="text-xs text-stone-500">তোমার কল্পনা দিয়ে ছবি আঁকো ও রঙ করো!</p>
              </div>
              <button
                onClick={clearCanvas}
                className="px-3.5 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                রিসেট (Clear)
              </button>
            </div>

            {/* Color Palette & Brush Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500">রঙ বেছে নাও:</span>
                {["#FF7A30", "#EF4444", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#000000"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition-transform border-2 ${
                      brushColor === c ? "scale-125 border-stone-900 shadow-md" : "border-white"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500">তুলি সাইজ:</span>
                {[3, 6, 12, 20].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setBrushSize(sz)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      brushSize === sz ? "bg-pink-500 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-600"
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="border-4 border-pink-300 dark:border-pink-700/60 rounded-3xl overflow-hidden shadow-2xl bg-white">
              <canvas
                ref={canvasRef}
                width={700}
                height={400}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="w-full h-[360px] md:h-[400px] touch-none cursor-crosshair bg-white"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
