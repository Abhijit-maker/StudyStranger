// Telegram Bot shared types & interfaces for Study Stranger

export type TelegramLanguage = 'bn' | 'en' | 'hi';

export interface TelegramUserProfile {
  telegramId: string;
  username?: string;
  firstName?: string;
  language: TelegramLanguage;
  classLevel: string; // e.g. "Class 12"
  stream: string;     // e.g. "Science", "Arts", "Commerce"
  subjects: string[]; // e.g. ["Biology", "English B", "Bengali A"]
  examGoal: string;   // e.g. "WBCHSE Sem 3 / NEET"
  linkedFirebaseUid?: string;
  createdAt: string;
  lastActive: string;
  streak: number;
  questionsSolved: number;
  quizzesCompleted: number;
  xp: number;
  level: number;
  accuracy: number;
  isBlocked?: boolean;
}

export interface TelegramLinkToken {
  token: string;
  firebaseUid: string;
  displayName: string;
  createdAt: number;
  expiresAt: number; // 10 minute expiration
  isUsed: boolean;
}

export interface TelegramStudyMaterial {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  classLevel: string;
  type: 'PDF' | 'Notes' | 'MCQ' | 'Formula' | 'QuestionBank' | 'PYQ' | 'Revision';
  description: string;
  contentSnippet?: string;
  downloadUrl?: string;
  telegramFileId?: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface TelegramQuizItem {
  id: string;
  subject: string;
  chapter: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
}

export interface TelegramConversationMessage {
  id: string;
  telegramId: string;
  userId?: string;
  role: 'user' | 'model';
  content: string;
  source: 'telegram' | 'web';
  timestamp: string;
  meta?: {
    character?: string;
    style?: string;
  };
}
