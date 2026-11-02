/**
 * Core Pure Logic for Study Stranger Pro:
 * 1. Realistic 3D AI Mentor Gesture, Nodding, Smiling & Lip-Sync State Machine
 * 2. Strict Verification-Gated Daily Streak & Focus Goals Engine (Anti-Cheat)
 * 3. 1000MB (1GB) Chunked PDF Upload & Validation Engine
 */

export type Mentor3DGesture =
  | "idle"
  | "nodding"
  | "smiling"
  | "wave"
  | "explaining"
  | "thinking"
  | "talking"
  | "dancing"
  | "laugh"
  | "clap"
  | "shy"
  | "cry"
  | "run"
  | "walk";

export type MentorFacialExpression =
  | "neutral"
  | "smile"
  | "grin"
  | "wink"
  | "focused"
  | "surprised"
  | "empathetic";

export interface Mentor3DReactionPlan {
  gesture: Mentor3DGesture;
  animation?: Mentor3DGesture;
  expression: MentorFacialExpression;
  nodIntensity: number; // 0.0 to 1.0
  smileIntensity: number; // 0.0 to 1.0
  handGestureSpeed: number; // 0.5 to 2.5
  eyeContactWeight: number; // 0.0 to 1.0
  reasonBn: string;
}

/**
 * Determines realistic 3D mentor gesture, nodding, smiling, and hand movements
 * from user speech/text input or AI response text.
 */
export function analyzeMentorGestureFromDialogue(
  userText: string,
  aiResponseText: string = "",
  phase: "listening" | "processing" | "speaking" | "idle" = "speaking"
): Mentor3DReactionPlan {
  const combined = `${userText || ""} ${aiResponseText || ""}`.toLowerCase();
  const userLower = (userText || "").toLowerCase();

  if (phase === "listening") {
    return {
      gesture: "nodding",
      expression: "smile",
      nodIntensity: 0.75,
      smileIntensity: 0.65,
      handGestureSpeed: 0.8,
      eyeContactWeight: 1.0,
      reasonBn: "মনোযোগ দিয়ে আপনার কথা শুনছে ও মাথা নাড়াচ্ছে (Attentive Listening & Nodding)"
    };
  }

  if (phase === "processing") {
    return {
      gesture: "thinking",
      expression: "focused",
      nodIntensity: 0.35,
      smileIntensity: 0.3,
      handGestureSpeed: 0.6,
      eyeContactWeight: 0.85,
      reasonBn: "প্রশ্নটি বিশ্লেষণ করছে (Deep Analytical Thinking)"
    };
  }

  // 1. Explicit Dance Command
  if (/(dance|nacho|nach|নাচো|নাচ|ড্যান্স)/i.test(userLower)) {
    return {
      gesture: "dancing",
      expression: "grin",
      nodIntensity: 0.6,
      smileIntensity: 1.0,
      handGestureSpeed: 2.2,
      eyeContactWeight: 0.9,
      reasonBn: "আনন্দে নাচছে ও হাত নাড়াচ্ছে (Celebratory 3D Dance)"
    };
  }

  // 2. Explicit Hand Wave / Greeting
  if (/(hello|hi\b|hey|namaskar|nomoshkar|wave|hat narao|haat narao|হ্যালো|হাই|নমস্কার|হাত নাড়াও|হাত নাড়াও)/i.test(userLower)) {
    return {
      gesture: "wave",
      expression: "smile",
      nodIntensity: 0.5,
      smileIntensity: 0.95,
      handGestureSpeed: 1.8,
      eyeContactWeight: 1.0,
      reasonBn: "হাসিমুখে হাত নেড়ে অভিবাদন জানাচ্ছে (Friendly Hand Wave & Smile)"
    };
  }

  // 3. Explicit Smile / Happy Command
  if (/(smile|haso|hasho|happy|হাসো|মিষ্টি হাসি|হাসি|খুশি)/i.test(userLower)) {
    return {
      gesture: "smiling",
      expression: "grin",
      nodIntensity: 0.55,
      smileIntensity: 1.0,
      handGestureSpeed: 1.1,
      eyeContactWeight: 1.0,
      reasonBn: "মিষ্টি হাসছে ও মাথা নেড়ে সায় দিচ্ছে (Warm Realistic Smile & Nod)"
    };
  }

  // 4. Laugh / Joke
  if (/(laugh|haha|hehe|joke|moja|মজা|জোকস|হা হা)/i.test(combined)) {
    return {
      gesture: "laugh",
      expression: "grin",
      nodIntensity: 0.7,
      smileIntensity: 1.0,
      handGestureSpeed: 1.6,
      eyeContactWeight: 0.95,
      reasonBn: "প্রাণখোলা হাসছে (Joyful Laughter)"
    };
  }

  // 5. Clap / Praise / Achievement
  if (/(clap|shabash|darun|bravo|congrat|শাবাশ|দারুণ|হাততালি|তালি)/i.test(combined)) {
    return {
      gesture: "clap",
      expression: "grin",
      nodIntensity: 0.65,
      smileIntensity: 0.95,
      handGestureSpeed: 2.0,
      eyeContactWeight: 1.0,
      reasonBn: "উৎসাহ দিতে হাততালি দিচ্ছে (Encouraging Applause)"
    };
  }

  // 6. Nodding / Agreement / Confirmation
  if (/(nod|yes|right|correct|thik|bujhechi|হ্যাঁ|ঠিক|বুঝেছি|মাথা নাড়াও|মাথা নাড়াও)/i.test(userLower)) {
    return {
      gesture: "nodding",
      expression: "smile",
      nodIntensity: 0.95,
      smileIntensity: 0.85,
      handGestureSpeed: 1.0,
      eyeContactWeight: 1.0,
      reasonBn: "সম্মতি জানিয়ে মাথা নাড়াচ্ছে (Affirmative Head Nod)"
    };
  }

  // 7. Shy / Blush
  if (/(shy|lojja|blush|লজ্জা)/i.test(userLower)) {
    return {
      gesture: "shy",
      expression: "wink",
      nodIntensity: 0.3,
      smileIntensity: 0.8,
      handGestureSpeed: 0.7,
      eyeContactWeight: 0.6,
      reasonBn: "মিষ্টি লজ্জায় হাসছে (Shy Smile)"
    };
  }

  // 8. Academic Explanation / Teaching with Hand Gestures
  if (
    phase === "speaking" &&
    (combined.length > 40 ||
      /(explain|what|why|how|formula|zp3|dna|biology|bengali|english|math|physics|chemistry|বুঝিয়ে|কীভাবে|কেন|সূত্র|আদিরিনী)/i.test(combined))
  ) {
    return {
      gesture: "explaining",
      expression: "smile",
      nodIntensity: 0.65,
      smileIntensity: 0.75,
      handGestureSpeed: 1.45,
      eyeContactWeight: 0.98,
      reasonBn: "হাত নেড়ে ও মাথা ঝাঁকিয়ে সহজভাবে বিষয়টি বোঝাচ্ছে (Interactive Hand Gestures & Teaching)"
    };
  }

  if (phase === "speaking") {
    return {
      gesture: "talking",
      expression: "smile",
      nodIntensity: 0.5,
      smileIntensity: 0.75,
      handGestureSpeed: 1.25,
      eyeContactWeight: 0.95,
      reasonBn: "স্বাভাবিক ভঙ্গিতে কথা বলছে (Natural Speaking & Lip-Sync)"
    };
  }

  return {
    gesture: "idle",
    expression: "smile",
    nodIntensity: 0.2,
    smileIntensity: 0.5,
    handGestureSpeed: 0.6,
    eyeContactWeight: 0.9,
    reasonBn: "প্রস্তুত ও স্বাভাবিক অবস্থায় রয়েছে (Calm Breathing & Eye Contact)"
  };
}

// ============================================================================
// 2. STRICT VERIFICATION-GATED DAILY STREAK & FOCUS GOALS ENGINE
// ============================================================================

export interface DailyActivityMetrics {
  date: string; // YYYY-MM-DD
  mockTestsCompleted: number;
  flashcardsReviewed: number;
  mistakesReviewed: number;
  focusMinutesCompleted: number;
  voiceMentorInteractions: number;
  pdfsUploadedOrGenerated: number;
}

export interface VerifiedDailyGoal {
  id: string;
  titleBn: string;
  titleEn: string;
  xp: number;
  metricKey: keyof Omit<DailyActivityMetrics, "date">;
  targetValue: number;
  unitBn: string;
  actionRoute: string;
  actionLabelBn: string;
  claimed: boolean;
}

export const DEFAULT_VERIFIED_DAILY_GOALS: Omit<VerifiedDailyGoal, "claimed">[] = [
  {
    id: "g-1",
    titleBn: "১টি WBCHSE মক টেস্ট বা কুইজ সম্পূর্ণ করা",
    titleEn: "Complete 1 WBCHSE Mock Test or Quiz",
    xp: 50,
    metricKey: "mockTestsCompleted",
    targetValue: 1,
    unitBn: "টি টেস্ট",
    actionRoute: "/app/mock",
    actionLabelBn: "মক টেস্ট দিন"
  },
  {
    id: "g-2",
    titleBn: "৫টি বায়োলজি বা বাংলা ফ্ল্যাশকার্ড রিভিশন করা",
    titleEn: "Review 5 Biology or Bengali Flashcards",
    xp: 30,
    metricKey: "flashcardsReviewed",
    targetValue: 5,
    unitBn: "টি কার্ড",
    actionRoute: "/app/flashcards",
    actionLabelBn: "ফ্ল্যাশকার্ড পড়ুন"
  },
  {
    id: "g-3",
    titleBn: "ভুল উত্তর ব্যাংক বা AI ডাউট সলভারে ১টি সমাধান দেখা",
    titleEn: "Analyze 1 Question in Mistake Bank or Doubt Solver",
    xp: 25,
    metricKey: "mistakesReviewed",
    targetValue: 1,
    unitBn: "টি সমাধান",
    actionRoute: "/app/mistakes",
    actionLabelBn: "ভুল উত্তর বিশ্লেষণ করুন"
  },
  {
    id: "g-4",
    titleBn: "৩ডি AI মেন্টরের সাথে কথা বলা বা ফোকাস সেশন করা",
    titleEn: "Interact with 3D AI Voice Mentor or Focus Room",
    xp: 40,
    metricKey: "voiceMentorInteractions",
    targetValue: 1,
    unitBn: "টি সেশন",
    actionRoute: "/app/voice",
    actionLabelBn: "৩ডি মেন্টরের সাথে কথা বলুন"
  },
  {
    id: "g-5",
    titleBn: "১টি স্টাডি PDF আপলোড বা স্মার্ট নোট সংরক্ষণ করা",
    titleEn: "Upload 1 Study PDF (up to 1000MB) or Save Smart Note",
    xp: 35,
    metricKey: "pdfsUploadedOrGenerated",
    targetValue: 1,
    unitBn: "টি PDF",
    actionRoute: "#pdf-upload-hub",
    actionLabelBn: "PDF আপলোড করুন"
  }
];

export interface GoalClaimCheckResult {
  canClaim: boolean;
  alreadyClaimed: boolean;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  messageBn: string;
}

/**
 * Strictly checks whether a Daily Goal can be claimed based on real verified activity metrics.
 * Clicking an incomplete goal NEVER grants XP or marks it done.
 */
export function evaluateGoalClaimEligibility(
  goal: VerifiedDailyGoal,
  metrics: DailyActivityMetrics
): GoalClaimCheckResult {
  const rawVal = Number(metrics[goal.metricKey] || 0);
  const currentValue = Math.max(0, rawVal);
  const targetValue = Math.max(1, goal.targetValue);
  const progressPercent = Math.min(100, Math.round((currentValue / targetValue) * 100));

  if (goal.claimed) {
    return {
      canClaim: false,
      alreadyClaimed: true,
      currentValue,
      targetValue,
      progressPercent: 100,
      messageBn: "এই লক্ষ্যমাত্রার XP ইতিমধ্যে সংগ্রহ করা হয়েছে! ✓"
    };
  }

  if (currentValue < targetValue) {
    return {
      canClaim: false,
      alreadyClaimed: false,
      currentValue,
      targetValue,
      progressPercent,
      messageBn: `টাস্কটি এখনও অসম্পূর্ণ (${currentValue}/${targetValue} ${goal.unitBn})। শুধুমাত্র ক্লিক করলে কালেক্ট হবে না — আগে টাস্কটি সম্পন্ন করুন!`
    };
  }

  return {
    canClaim: true,
    alreadyClaimed: false,
    currentValue,
    targetValue,
    progressPercent: 100,
    messageBn: `অভিনন্দন! আপনি টাস্কটি সফলভাবে সম্পন্ন করেছেন (${currentValue}/${targetValue})। এখন +${goal.xp} XP কালেক্ট করুন!`
  };
}

export function calculateStudentLevelInfo(totalXp: number) {
  const safeXp = Math.max(0, totalXp);
  if (safeXp < 200) {
    return { level: 1, title: "নবাগত শিক্ষার্থী (Novice Stranger)", nextReq: 200, progress: (safeXp / 200) * 100 };
  } else if (safeXp < 600) {
    return { level: 2, title: "মনোযোগী পরীক্ষার্থী (Dedicated Aspirant)", nextReq: 600, progress: ((safeXp - 200) / 400) * 100 };
  } else if (safeXp < 1200) {
    return { level: 3, title: "বিষয় বিশেষজ্ঞ (Subject Specialist)", nextReq: 1200, progress: ((safeXp - 600) / 600) * 100 };
  } else if (safeXp < 2000) {
    return { level: 4, title: "বোর্ড চ্যাম্পিয়ন (Board Champion)", nextReq: 2000, progress: ((safeXp - 1200) / 800) * 100 };
  } else {
    return { level: 5, title: "WBCHSE শীর্ষস্থানাধিকারী (Board Topper)", nextReq: 3000, progress: 100 };
  }
}

// ============================================================================
// 3. 1000MB (1GB) CHUNKED PDF VALIDATION & STORAGE PLANNER
// ============================================================================

export const MAX_PDF_UPLOAD_SIZE_MB = 1000; // 1000 MB (1 GB) limit requested by user
export const PDF_CHUNK_SIZE_BYTES = 16 * 1024 * 1024; // 16 MB per IndexedDB chunk

export interface PdfValidationResult {
  valid: boolean;
  errorBn?: string;
  errorMessage?: string;
  sizeBytes: number;
  sizeMB: number;
  chunkCount: number;
  estimatedChunks: number;
  isLargeFileMode: boolean; // True if > 15MB (uses chunked Blob storage instead of Base64 DataURL)
}

export function validatePdfFileForUpload(
  fileName: string,
  mimeType: string,
  sizeBytes: number,
  maxSizeMB: number = MAX_PDF_UPLOAD_SIZE_MB
): PdfValidationResult {
  const isPdf =
    mimeType === "application/pdf" ||
    fileName.toLowerCase().trim().endsWith(".pdf");

  const sizeMB = Number((sizeBytes / (1024 * 1024)).toFixed(2));

  if (!isPdf) {
    const msg = "অনুগ্রহ করে শুধুমাত্র বৈধ PDF ডকুমেন্ট (.pdf ফাইল) নির্বাচন করুন।";
    return {
      valid: false,
      errorBn: msg,
      errorMessage: msg,
      sizeBytes,
      sizeMB,
      chunkCount: 0,
      estimatedChunks: 0,
      isLargeFileMode: false
    };
  }

  if (sizeBytes <= 0) {
    const msg = "নির্বাচিত PDF ফাইলটি খালি (0 Bytes)। সঠিক ফাইল নির্বাচন করুন।";
    return {
      valid: false,
      errorBn: msg,
      errorMessage: msg,
      sizeBytes,
      sizeMB,
      chunkCount: 0,
      estimatedChunks: 0,
      isLargeFileMode: false
    };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (sizeBytes > maxBytes) {
    const msg = `ফাইলের আকার (${sizeMB} MB) সর্বোচ্চ অনুমোদিত ${maxSizeMB} MB সীমার বেশি।`;
    return {
      valid: false,
      errorBn: msg,
      errorMessage: msg,
      sizeBytes,
      sizeMB,
      chunkCount: 0,
      estimatedChunks: 0,
      isLargeFileMode: false
    };
  }

  const chunkCount = Math.max(1, Math.ceil(sizeBytes / PDF_CHUNK_SIZE_BYTES));
  const isLargeFileMode = sizeBytes > 15 * 1024 * 1024;

  return {
    valid: true,
    sizeBytes,
    sizeMB,
    chunkCount,
    estimatedChunks: chunkCount,
    isLargeFileMode
  };
}

export function formatByteSize(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(Math.min(1, decimals))} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(decimals)} MB`;
}

