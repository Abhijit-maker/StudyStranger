import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeMentorGestureFromDialogue,
  evaluateGoalClaimEligibility,
  validatePdfFileForUpload,
  calculateStudentLevelInfo,
  MAX_PDF_UPLOAD_SIZE_MB,
  VerifiedDailyGoal,
  DailyActivityMetrics
} from "./studyCoreLogic";

test("3D Mentor Gesture Engine triggers wave and smile on greeting or wave command", () => {
  const res1 = analyzeMentorGestureFromDialogue("Hello Anjali, হাত নাড়াও!", "", "speaking");
  assert.equal(res1.gesture, "wave");
  assert.equal(res1.expression, "smile");
  assert.ok(res1.smileIntensity >= 0.9);

  const res2 = analyzeMentorGestureFromDialogue("একটু হাসো please smile", "", "speaking");
  assert.equal(res2.gesture, "smiling");
  assert.equal(res2.expression, "grin");
});

test("3D Mentor Gesture Engine triggers nodding when listening or affirming", () => {
  const listeningPlan = analyzeMentorGestureFromDialogue("", "", "listening");
  assert.equal(listeningPlan.gesture, "nodding");
  assert.ok(listeningPlan.nodIntensity >= 0.7);

  const nodPlan = analyzeMentorGestureFromDialogue("হ্যাঁ ঠিক বুঝেছি, nod your head", "", "speaking");
  assert.equal(nodPlan.gesture, "nodding");
  assert.ok(nodPlan.nodIntensity >= 0.9);
});

test("3D Mentor Gesture Engine triggers explaining hand gestures on academic explanations", () => {
  const explainPlan = analyzeMentorGestureFromDialogue(
    "Explain ZP3 receptor in human reproduction",
    "ZP3 is a glycoprotein receptor in the zona pellucida that binds sperm acrosome.",
    "speaking"
  );
  assert.equal(explainPlan.gesture, "explaining");
  assert.ok(explainPlan.handGestureSpeed > 1.2);
});

test("Verified Daily Streak blocks claiming incomplete goals and allows claiming only after completion", () => {
  const mockGoal: VerifiedDailyGoal = {
    id: "g-1",
    titleBn: "১টি WBCHSE মক টেস্ট সম্পূর্ণ করা",
    titleEn: "Complete 1 Mock Test",
    xp: 50,
    metricKey: "mockTestsCompleted",
    targetValue: 1,
    unitBn: "টি টেস্ট",
    actionRoute: "/app/mock",
    actionLabelBn: "মক টেস্ট দিন",
    claimed: false
  };

  const emptyMetrics: DailyActivityMetrics = {
    date: "2026-10-23",
    mockTestsCompleted: 0,
    flashcardsReviewed: 0,
    mistakesReviewed: 0,
    focusMinutesCompleted: 0,
    voiceMentorInteractions: 0,
    pdfsUploadedOrGenerated: 0
  };

  // Must NOT allow claiming when 0/1 completed
  const checkIncomplete = evaluateGoalClaimEligibility(mockGoal, emptyMetrics);
  assert.equal(checkIncomplete.canClaim, false);
  assert.equal(checkIncomplete.progressPercent, 0);

  // Must allow claiming once 1/1 completed
  const completedMetrics: DailyActivityMetrics = {
    ...emptyMetrics,
    mockTestsCompleted: 1
  };
  const checkCompleted = evaluateGoalClaimEligibility(mockGoal, completedMetrics);
  assert.equal(checkCompleted.canClaim, true);
  assert.equal(checkCompleted.progressPercent, 100);

  // Must block double-claiming once already claimed
  const checkAlreadyClaimed = evaluateGoalClaimEligibility({ ...mockGoal, claimed: true }, completedMetrics);
  assert.equal(checkAlreadyClaimed.canClaim, false);
  assert.equal(checkAlreadyClaimed.alreadyClaimed, true);
});

test("1000MB PDF Upload Validator accepts up to 1000MB PDFs and rejects >1000MB or non-PDFs", () => {
  assert.equal(MAX_PDF_UPLOAD_SIZE_MB, 1000);

  // 850 MB PDF -> Valid, chunked mode
  const size850MB = 850 * 1024 * 1024;
  const validLarge = validatePdfFileForUpload("wbchse_full_biology_book.pdf", "application/pdf", size850MB);
  assert.equal(validLarge.valid, true);
  assert.equal(validLarge.isLargeFileMode, true);
  assert.ok(validLarge.chunkCount >= 50);

  // 1000 MB exact PDF -> Valid
  const size1000MB = 1000 * 1024 * 1024;
  const validMax = validatePdfFileForUpload("complete_archive.pdf", "application/pdf", size1000MB);
  assert.equal(validMax.valid, true);

  // 1050 MB PDF -> Invalid (exceeds 1000MB)
  const size1050MB = 1050 * 1024 * 1024;
  const tooLarge = validatePdfFileForUpload("too_big.pdf", "application/pdf", size1050MB);
  assert.equal(tooLarge.valid, false);

  // Non-PDF -> Invalid
  const wrongType = validatePdfFileForUpload("video.mp4", "video/mp4", 1024 * 1024);
  assert.equal(wrongType.valid, false);
});

test("Student Level progression calculates accurate levels", () => {
  assert.equal(calculateStudentLevelInfo(120).level, 1);
  assert.equal(calculateStudentLevelInfo(350).level, 2);
  assert.equal(calculateStudentLevelInfo(2500).level, 5);
});
