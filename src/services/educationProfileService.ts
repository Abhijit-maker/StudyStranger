import { EducationProfile, BoardId, ClassLevel, StreamType, MediumType, Subject } from '../types/education';
import { INDIAN_BOARDS, MEDIUMS, STREAMS, getSubjectsForProfile, getDefaultSubjects } from '../data/educationData';
import { db, doc, getDoc, setDoc } from '../firebase';

const STORAGE_KEY_PREFIX = 'study_stranger_edu_profile_';

export const DEFAULT_EDUCATION_PROFILE: EducationProfile = {
  country: 'India',
  board: 'WBCHSE',
  classLevel: 12,
  stream: 'science', // Strictly valid for Class 11 and 12
  medium: 'bengali',
  selectedSubjects: [
    'hs-physics',
    'hs-chemistry',
    'hs-math',
    'hs-biology',
    'hs-english-b',
    'hs-bengali-a'
  ],
  weakTopics: ['Organic Reaction Mechanisms', 'Genetics - Crossing Over', 'Calculus - Integrals'],
  dailyStudyGoalMinutes: 180,
  targetExam: 'WBCHSE Semester 3 & Board Final',
  targetScorePercent: 95,
  lastUpdated: new Date().toISOString()
};

type ProfileListener = (profile: EducationProfile) => void;
const listeners = new Set<ProfileListener>();

class EducationProfileService {
  private currentProfile: EducationProfile | null = null;
  private currentUserId: string = 'default';

  constructor() {
    this.currentProfile = this.loadFromStorage('default');
  }

  public getProfile(userId?: string): EducationProfile {
    const targetId = userId || this.currentUserId || 'default';
    if (this.currentProfile && this.currentUserId === targetId) {
      return this.currentProfile;
    }
    this.currentUserId = targetId;
    this.currentProfile = this.loadFromStorage(targetId);
    return this.currentProfile;
  }

  private loadFromStorage(userId: string): EducationProfile {
    if (typeof window === 'undefined') return { ...DEFAULT_EDUCATION_PROFILE };
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EducationProfile>;
        return this.normalizeProfile(parsed);
      }
      // If specific user doesn't have it, check default
      if (userId !== 'default') {
        const defaultRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}default`);
        if (defaultRaw) {
          return this.normalizeProfile(JSON.parse(defaultRaw));
        }
      }
    } catch (e) {
      console.warn('Failed to load education profile from localStorage:', e);
    }
    return { ...DEFAULT_EDUCATION_PROFILE };
  }

  /**
   * Enforces strict integrity rules:
   * Rule 1: Stream must ONLY exist for Class 11 and Class 12.
   * Rule 2: For Class 1-10, stream MUST be undefined.
   * Rule 3: Validates board and subjects.
   */
  public normalizeProfile(profile: Partial<EducationProfile>): EducationProfile {
    const classLevel: ClassLevel = (profile.classLevel && profile.classLevel >= 1 && profile.classLevel <= 12)
      ? profile.classLevel
      : 12;

    let stream: StreamType | undefined = undefined;
    // CRITICAL STREAM RULE: Stream selection ONLY for Class 11 and 12!
    if (classLevel === 11 || classLevel === 12) {
      stream = (profile.stream === 'commerce' || profile.stream === 'arts') ? profile.stream : 'science';
    } else {
      stream = undefined; // Never allowed for Class 1-10!
    }

    let board: BoardId = profile.board || (classLevel >= 11 ? 'WBCHSE' : 'WBBSE');
    // If board is WBCHSE but class is <= 10, adapt to WBBSE or CBSE
    if (board === 'WBCHSE' && classLevel <= 10) {
      board = 'WBBSE';
    }

    const medium: MediumType = profile.medium || 'bengali';
    
    // Validate or auto-populate selected subjects
    const availableSubjects = getSubjectsForProfile(board, classLevel, stream);
    const validSubjectIds = new Set(availableSubjects.map(s => s.id));
    
    let selectedSubjects: string[] = [];
    if (Array.isArray(profile.selectedSubjects) && profile.selectedSubjects.length > 0) {
      selectedSubjects = profile.selectedSubjects.filter(id => validSubjectIds.has(id));
    }
    if (selectedSubjects.length === 0) {
      selectedSubjects = getDefaultSubjects(board, classLevel, stream);
    }

    return {
      country: 'India',
      board,
      classLevel,
      stream,
      medium,
      selectedSubjects,
      weakTopics: Array.isArray(profile.weakTopics) ? profile.weakTopics : [],
      dailyStudyGoalMinutes: typeof profile.dailyStudyGoalMinutes === 'number' ? profile.dailyStudyGoalMinutes : 120,
      targetExam: profile.targetExam || `${board} Class ${classLevel} Exam`,
      targetScorePercent: typeof profile.targetScorePercent === 'number' ? profile.targetScorePercent : 90,
      lastUpdated: new Date().toISOString()
    };
  }

  public async saveProfile(updated: Partial<EducationProfile>, userId?: string): Promise<EducationProfile> {
    const targetId = userId || this.currentUserId || 'default';
    const current = this.getProfile(targetId);
    
    const merged: Partial<EducationProfile> = {
      ...current,
      ...updated,
      lastUpdated: new Date().toISOString()
    };

    // If class level changed from 11-12 to <=10 or vice-versa, ensure subjects re-default if needed
    if (updated.classLevel && updated.classLevel !== current.classLevel) {
      const isNewHS = updated.classLevel === 11 || updated.classLevel === 12;
      const isOldHS = current.classLevel === 11 || current.classLevel === 12;
      if (isNewHS !== isOldHS || !updated.selectedSubjects) {
        const nextStream = isNewHS ? (updated.stream || current.stream || 'science') : undefined;
        merged.stream = nextStream;
        merged.selectedSubjects = getDefaultSubjects(merged.board || current.board, updated.classLevel, nextStream);
      }
    }

    const normalized = this.normalizeProfile(merged);
    this.currentProfile = normalized;
    this.currentUserId = targetId;

    // Save to LocalStorage
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${targetId}`, JSON.stringify(normalized));
      if (targetId !== 'default') {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}default`, JSON.stringify(normalized));
      }
    } catch (e) {
      console.warn('Failed to write education profile to localStorage:', e);
    }

    // Sync to Firestore if authenticated
    if (targetId && targetId !== 'default') {
      try {
        await setDoc(doc(db, 'users', targetId), {
          educationProfile: normalized,
          board: `${normalized.board} Class ${normalized.classLevel}${normalized.stream ? ` (${normalized.stream.toUpperCase()})` : ''}`,
          stream: normalized.stream || '',
          lastProfileUpdate: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore education profile sync warning:', err);
      }
    }

    // Notify listeners
    this.notify(normalized);
    return normalized;
  }

  public async syncFromFirestore(userId: string): Promise<EducationProfile> {
    if (!userId || userId === 'default') return this.getProfile('default');
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        const data = snap.data();
        if (data.educationProfile) {
          const normalized = this.normalizeProfile(data.educationProfile);
          this.currentProfile = normalized;
          this.currentUserId = userId;
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(normalized));
          this.notify(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Sync from Firestore failed:', e);
    }
    return this.getProfile(userId);
  }

  public subscribe(listener: ProfileListener): () => void {
    listeners.add(listener);
    if (this.currentProfile) {
      listener(this.currentProfile);
    }
    return () => listeners.delete(listener);
  }

  private notify(profile: EducationProfile) {
    listeners.forEach(fn => {
      try {
        fn(profile);
      } catch (err) {
        console.error('Error in education profile listener:', err);
      }
    });
  }

  /**
   * Generates a strict, high-precision AI prompt block representing the student's active education profile.
   * Guarantees that AI answers, explanations, study plans, questions, and notes strictly match the curriculum.
   */
  public getAIContextPrompt(profile?: EducationProfile): string {
    const prof = profile || this.getProfile();
    const boardInfo = INDIAN_BOARDS.find(b => b.id === prof.board) || INDIAN_BOARDS[0];
    const mediumInfo = MEDIUMS.find(m => m.id === prof.medium) || MEDIUMS[0];
    const streamInfo = prof.stream ? STREAMS.find(s => s.id === prof.stream) : null;
    const activeSubjects = getSubjectsForProfile(prof.board, prof.classLevel, prof.stream)
      .filter(s => prof.selectedSubjects.includes(s.id));

    const streamLine = (prof.classLevel === 11 || prof.classLevel === 12) && prof.stream
      ? `\n* STREAM: ${prof.stream.toUpperCase()} (${streamInfo?.nameBn || streamInfo?.name})`
      : '\n* STREAM: N/A (Standard General Curriculum for Class 1-10; No Stream separation)';

    return `
=== ACTIVE STUDENT EDUCATION PROFILE ===
* COUNTRY: India
* BOARD: ${boardInfo.name} (${boardInfo.shortName}) - ${boardInfo.state}
* CLASS: Class ${prof.classLevel}${streamLine}
* MEDIUM OF INSTRUCTION: ${mediumInfo.label} (${mediumInfo.nativeLabel})
* ACTIVE ENROLLED SUBJECTS (${activeSubjects.length}): ${activeSubjects.map(s => `${s.name} [${s.nativeName || ''}]`).join(', ')}
* TARGET GOAL: ${prof.targetExam || `Class ${prof.classLevel} Examination`} (Target: ${prof.targetScorePercent || 90}%)
* IDENTIFIED WEAK TOPICS: ${prof.weakTopics.length > 0 ? prof.weakTopics.join(', ') : 'None marked yet'}

CRITICAL AI ADAPTATION DIRECTIVES:
1. CURRICULUM STRICTNESS: All your explanations, teaching, question generation, study plans, formulas, and mock tests MUST strictly adhere to the academic standard of ${boardInfo.shortName} for Class ${prof.classLevel}${prof.stream ? ` (${prof.stream.toUpperCase()} Stream)` : ''}.
2. DO NOT MIX SYLLABUSES: Never combine CBSE topics into WBCHSE or ICSE unless specifically asked. Respect state and national council syllabi separately.
3. LANGUAGE & MEDIUM: Deliver rich, supportive explanations in ${prof.medium === 'bengali' ? 'sweet, culturally contextual Bengali and Bunglish (English terms with clear Bengali script and intuition)' : prof.medium === 'hindi' ? 'warm Hindi and Hinglish' : 'clear, elegant English'}.
4. ANTI-HALLUCINATION & SYLLABUS SAFETY (RULE #7): Never invent or guess syllabus requirements. If a particular niche topic or board sub-rule is uncertain or subject to recent government circulars, explicitly advise the student to verify with their official school/board syllabus textbook.
5. LEVEL APPROPRIATENESS:
   - For Class 1–5: Simple, encouraging, story-driven, visual, no complex formulas.
   - For Class 6–8: Clear fundamentals, real-life analogies, foundational math & science concepts.
   - For Class 9–10: Rigorous Secondary board exam level (Madhyamik / 10th Board standards).
   - For Class 11–12: Advanced higher secondary level with LaTeX formulas, deep conceptual derivations, reaction mechanisms, and board exam-oriented marking criteria.
========================================`;
  }
}

export const educationProfileService = new EducationProfileService();
