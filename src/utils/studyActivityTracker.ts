/**
 * Global Verified Study Activity Tracker
 * Records real student completions (mock tests, flashcards, mistake bank, voice mentor, PDF vault)
 * so Daily Streak Goals can only be collected after genuine completion.
 */

import { DailyActivityMetrics } from "./studyCoreLogic";

const METRICS_STORAGE_KEY_PREFIX = "ss_verified_metrics_";

function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayVerifiedActivityMetrics(): DailyActivityMetrics {
  const today = getTodayDateKey();
  if (typeof window === "undefined") {
    return {
      date: today,
      mockTestsCompleted: 0,
      flashcardsReviewed: 0,
      mistakesReviewed: 0,
      focusMinutesCompleted: 0,
      voiceMentorInteractions: 0,
      pdfsUploadedOrGenerated: 0,
    };
  }

  const key = `${METRICS_STORAGE_KEY_PREFIX}${today}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        date: today,
        mockTestsCompleted: Number(parsed.mockTestsCompleted) || 0,
        flashcardsReviewed: Number(parsed.flashcardsReviewed) || 0,
        mistakesReviewed: Number(parsed.mistakesReviewed) || 0,
        focusMinutesCompleted: Number(parsed.focusMinutesCompleted) || 0,
        voiceMentorInteractions: Number(parsed.voiceMentorInteractions) || 0,
        pdfsUploadedOrGenerated: Number(parsed.pdfsUploadedOrGenerated) || 0,
      };
    } catch {
      // fall through
    }
  }

  return {
    date: today,
    mockTestsCompleted: 0,
    flashcardsReviewed: 0,
    mistakesReviewed: 0,
    focusMinutesCompleted: 0,
    voiceMentorInteractions: 0,
    pdfsUploadedOrGenerated: 0,
  };
}

export function recordVerifiedStudyActivity(
  metricKey: keyof Omit<DailyActivityMetrics, "date">,
  incrementBy: number = 1
): DailyActivityMetrics {
  const current = getTodayVerifiedActivityMetrics();
  const updated: DailyActivityMetrics = {
    ...current,
    [metricKey]: Math.max(0, (current[metricKey] || 0) + incrementBy),
  };

  if (typeof window !== "undefined") {
    const key = `${METRICS_STORAGE_KEY_PREFIX}${current.date}`;
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ss-study-activity-updated", { detail: updated }));
  }

  return updated;
}
