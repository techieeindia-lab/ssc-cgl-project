// src/services/analyticsService.ts
// Per-section mastery aggregation. Reads the user's most recent testResults
// from `users/{uid}/testResults` and folds their `sectionStats` into a
// unified {bySection, recentAccuracy, totals} summary that the Progress
// tab renders.

import {
  collection, getDocs, orderBy, query, limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Section } from './questionService';

export type SectionMastery = {
  section: Section;
  attempted: number;   // total questions (correct + wrong + skipped)
  correct: number;
  wrong: number;
  accuracy: number;    // 0..100, rounded
  testsContributing: number;
};

export type ProgressSummary = {
  bySection: SectionMastery[];
  recentAccuracy: number; // 0..100, weighted by total over last 5
  totalQuestions: number;
  totalCorrect: number;
};

type SectionStat = {
  section?: string;
  correct?: number;
  wrong?: number;
  skipped?: number;
  total?: number;
  score?: number;
};

type TestResult = {
  sectionStats?: Record<string, SectionStat>;
  total?: number;
  correct?: number;
  score?: number;
  createdAt?: { seconds: number } | null;
};

const EMPTY_ACC = (s: Section): SectionMastery => ({
  section: s,
  attempted: 0,
  correct: 0,
  wrong: 0,
  accuracy: 0,
  testsContributing: 0,
});

/**
 * Compute per-section mastery + overall recent accuracy for a user.
 *
 * Aggregation window: last 50 test results (caps latency, current-mastery
 * signal is what users care about).
 */
export const computeSectionMastery = async (
  uid: string,
): Promise<ProgressSummary> => {
  const ref = collection(db, 'users', uid, 'testResults');
  const snap = await getDocs(query(ref, orderBy('createdAt', 'desc'), limit(50)));

  const sections: Section[] = ['QA', 'GIR', 'GA', 'EN'];
  const acc: Record<Section, SectionMastery> = {
    QA: EMPTY_ACC('QA'),
    GIR: EMPTY_ACC('GIR'),
    GA: EMPTY_ACC('GA'),
    EN: EMPTY_ACC('EN'),
  };

  const docs: TestResult[] = snap.docs.map((d) => d.data() as TestResult);

  for (const r of docs) {
    if (!r.sectionStats) continue;
    for (const sec of sections) {
      const s = r.sectionStats[sec];
      if (!s) continue;
      const correct = s.correct ?? 0;
      const wrong = s.wrong ?? 0;
      const skipped = s.skipped ?? 0;
      const total = s.total ?? correct + wrong + skipped;
      if (total <= 0) continue;
      const bucket = acc[sec];
      bucket.attempted += total;
      bucket.correct += correct;
      bucket.wrong += wrong;
      bucket.testsContributing += 1;
    }
  }

  const bySection: SectionMastery[] = sections.map((s) => {
    const a = acc[s];
    const denom = a.correct + a.wrong;
    const accuracy = denom > 0 ? Math.round((a.correct / denom) * 100) : 0;
    return { ...a, accuracy };
  });

  // recentAccuracy: weighted average across the 5 most recent results.
  const recent = docs.slice(0, 5);
  let rC = 0, rT = 0;
  for (const r of recent) {
    rC += r.correct ?? 0;
    rT += r.total ?? 0;
  }
  const recentAccuracy = rT > 0 ? Math.round((rC / rT) * 100) : 0;

  const totalQuestions = bySection.reduce((s, b) => s + b.attempted, 0);
  const totalCorrect = bySection.reduce((s, b) => s + b.correct, 0);

  return { bySection, recentAccuracy, totalQuestions, totalCorrect };
};