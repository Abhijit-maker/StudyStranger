export type Country = 'India';

export type BoardId = 
  | 'WBCHSE'       // West Bengal Council of Higher Secondary Education (Class 11-12)
  | 'WBBSE'        // West Bengal Board of Secondary Education (Class 1-10)
  | 'CBSE'         // Central Board of Secondary Education (Class 1-12)
  | 'ICSE_ISC'     // CISCE (ICSE Class 1-10, ISC Class 11-12)
  | 'MAHARASHTRA'  // Maharashtra State Board
  | 'TAMILNADU'    // Tamil Nadu State Board
  | 'KARNATAKA'    // Karnataka State Board (KSEEB/KSEAB)
  | 'UP_BOARD'     // Uttar Pradesh Board (UPMSP)
  | 'BIHAR_BOARD'  // Bihar School Examination Board (BSEB)
  | 'OTHER_STATE'; // Other Indian Recognized State Boards

export type ClassLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type StreamType = 'science' | 'commerce' | 'arts';

export type MediumType = 'english' | 'bengali' | 'hindi' | 'marathi' | 'tamil' | 'kannada' | 'other';

export interface BoardInfo {
  id: BoardId;
  name: string;
  shortName: string;
  nativeName?: string;
  state: string;
  description: string;
  minClass: ClassLevel;
  maxClass: ClassLevel;
  badgeColor: string;
}

export interface Subject {
  id: string;
  name: string;
  nativeName?: string;
  code?: string;
  category: 'core' | 'science' | 'commerce' | 'arts' | 'language' | 'vocational' | 'elementary';
  iconName: string;
  color: string;
  description?: string;
  chaptersCount?: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  titleNative?: string;
  topics: string[];
  unitName?: string;
}

export interface EducationProfile {
  country: Country;
  board: BoardId;
  classLevel: ClassLevel;
  stream?: StreamType; // STRICT RULE: Only populated for Class 11 and 12. Must be undefined for Class 1-10!
  medium: MediumType;
  selectedSubjects: string[];
  weakTopics: string[];
  dailyStudyGoalMinutes: number;
  targetExam?: string;
  targetScorePercent?: number;
  lastUpdated?: string;
}

export type ExamQuestionType = 
  | 'mcq'
  | 'short'
  | 'long'
  | 'numerical'
  | 'board_style'
  | 'assertion_reason';

export type ExamDifficulty = 'easy' | 'medium' | 'hard' | 'board_level';

export interface ExamQuestion {
  id: string;
  type: ExamQuestionType;
  question: string;
  questionNative?: string;
  options?: string[];
  optionsNative?: string[];
  correctAnswerIndex?: number;
  modelAnswer?: string;
  modelAnswerNative?: string;
  stepByStepSolution?: { step: string; explanation: string }[];
  marks: number;
  marksBreakdown?: string;
  difficulty: ExamDifficulty;
  subject: string;
  topic?: string;
  yearReference?: string;
}

export interface ExamSessionConfig {
  board: BoardId;
  classLevel: ClassLevel;
  stream?: StreamType;
  medium: MediumType;
  subject: string;
  chapter?: string;
  mode: 'chapter_test' | 'full_mock' | 'revision' | 'speed_blitz' | 'numerical_drill';
  questionType: ExamQuestionType | 'mixed';
  difficulty: ExamDifficulty;
  questionCount: number;
  timeLimitMinutes: number;
}
