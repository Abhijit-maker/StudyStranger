export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'very_hard' | 'jee_mains' | 'jee_advanced' | 'neet';

export type MockTestScope = 'topic' | 'chapter' | 'unit' | 'syllabus';

export interface MockTestConfig {
  topic: string;
  subject: string;
  difficulty: QuizDifficulty;
  scope: MockTestScope;
  isPYQ: boolean;
  yearRange?: [number, number];
}

export interface MCQQuestion {
  id: string;
  questionEn: string;
  questionBn: string;
  optionsEn: string[];
  optionsBn: string[];
  correctIndex: number;
  explanationEn: string;
  explanationBn: string;
  difficulty: QuizDifficulty;
  year?: number;
}
