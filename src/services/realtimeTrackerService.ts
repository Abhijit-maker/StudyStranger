/**
 * Real-Time User Activity & Statistics Tracker Service
 * Automatically calculates active time spent, tracks current study action,
 * and maintains continuous presence heartbeat with Firestore.
 */

import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface UserRealtimeStats {
  totalStudyTimeMinutes: number;
  sessionMinutes: number;
  currentActivity: string;
  isOnline: boolean;
  questionsSolved: number;
  accuracy: number;
  lastActive: string;
}

class RealtimeTrackerService {
  private userUid: string | null = null;
  private currentActivity: string = "Exploring Study Stranger";
  private sessionStart: number = Date.now();
  private totalStudySeconds: number = 0;
  private sessionSeconds: number = 0;
  private questionsSolved: number = 0;
  private correctQuestions: number = 0;
  private intervalTimer: any = null;
  private heartbeatTimer: any = null;
  private isWindowFocused: boolean = true;
  private listeners: Set<(stats: UserRealtimeStats) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("focus", () => {
        this.isWindowFocused = true;
      });
      window.addEventListener("blur", () => {
        this.isWindowFocused = false;
      });
      document.addEventListener("visibilitychange", () => {
        this.isWindowFocused = document.visibilityState === "visible";
      });
      window.addEventListener("beforeunload", () => {
        this.syncPresence(false);
      });
    }
  }

  public initUser(uid: string, initialStats?: Partial<UserRealtimeStats>) {
    if (this.userUid === uid && this.intervalTimer) return;
    this.userUid = uid;
    this.sessionStart = Date.now();
    this.sessionSeconds = 0;

    // Load persisted study time from localStorage or initial user stats
    const todayKey = `study_seconds_${new Date().toISOString().slice(0, 10)}_${uid}`;
    const savedSeconds = parseInt(localStorage.getItem(todayKey) || "0", 10);
    this.totalStudySeconds = (initialStats?.totalStudyTimeMinutes ? initialStats.totalStudyTimeMinutes * 60 : 0) || savedSeconds;
    this.questionsSolved = initialStats?.questionsSolved || 0;
    this.currentActivity = initialStats?.currentActivity || "Studying WBCHSE Semester 3";

    this.startTimers();
    this.syncPresence(true);
    this.notifyListeners();
  }

  public stopUser() {
    this.syncPresence(false);
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.intervalTimer = null;
    this.heartbeatTimer = null;
    this.userUid = null;
  }

  private startTimers() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);

    // 1-second ticker for local reactive stats
    this.intervalTimer = setInterval(() => {
      if (this.isWindowFocused && this.userUid) {
        this.sessionSeconds += 1;
        this.totalStudySeconds += 1;

        // Persist local daily seconds every 10 seconds
        if (this.sessionSeconds % 10 === 0) {
          const todayKey = `study_seconds_${new Date().toISOString().slice(0, 10)}_${this.userUid}`;
          localStorage.setItem(todayKey, this.totalStudySeconds.toString());
          this.notifyListeners();
        }
      }
    }, 1000);

    // 30-second heartbeat to Firestore
    this.heartbeatTimer = setInterval(() => {
      if (this.userUid) {
        this.syncPresence(this.isWindowFocused);
      }
    }, 30000);
  }

  public setActivity(activity: string) {
    if (this.currentActivity === activity) return;
    this.currentActivity = activity;
    this.notifyListeners();
    // Prompt immediate sync on major task transitions
    if (this.userUid) {
      this.syncPresence(true);
    }
  }

  public recordQuestionSolved(isCorrect: boolean) {
    this.questionsSolved += 1;
    if (isCorrect) this.correctQuestions += 1;
    this.notifyListeners();
    if (this.userUid) {
      this.syncPresence(true);
    }
  }

  public async syncPresence(isOnline: boolean = true) {
    if (!this.userUid) return;
    const nowIso = new Date().toISOString();
    const totalMinutes = Math.round(this.totalStudySeconds / 60);
    const accuracy = this.questionsSolved > 0 ? Math.round((this.correctQuestions / this.questionsSolved) * 100) : 100;

    try {
      const userRef = doc(db, "users", this.userUid);
      await setDoc(userRef, {
        isOnline,
        lastActive: nowIso,
        currentActivity: this.currentActivity,
        totalStudyTimeMinutes: totalMinutes,
        questionsSolved: this.questionsSolved,
        accuracy: accuracy,
        lastAction: `Active: ${this.currentActivity}`
      }, { merge: true });
    } catch (err) {
      // Non-blocking catch
      console.warn("[RealtimeTracker] Presence sync notice:", err);
    }
  }

  public getStats(): UserRealtimeStats {
    const totalMinutes = Math.round(this.totalStudySeconds / 60);
    const sessionMinutes = Math.round(this.sessionSeconds / 60);
    const accuracy = this.questionsSolved > 0 ? Math.round((this.correctQuestions / this.questionsSolved) * 100) : 100;

    return {
      totalStudyTimeMinutes: totalMinutes,
      sessionMinutes,
      currentActivity: this.currentActivity,
      isOnline: this.isWindowFocused,
      questionsSolved: this.questionsSolved,
      accuracy,
      lastActive: new Date().toISOString()
    };
  }

  public subscribe(fn: (stats: UserRealtimeStats) => void) {
    this.listeners.add(fn);
    fn(this.getStats());
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notifyListeners() {
    const stats = this.getStats();
    for (const listener of this.listeners) {
      listener(stats);
    }
  }
}

export const realtimeTracker = new RealtimeTrackerService();
