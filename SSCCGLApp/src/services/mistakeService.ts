// src/services/mistakeService.ts
// Persistent mistake tracking for the Revision Mode feature.
//
// Collection: users/{uid}/mistakes/{questionId}
//   Doc id = questionId so we can upsert without a separate query.
//
// We denormalize a small `snapshot` of the question body into the mistake
// doc so the revision runner doesn't have to fan out across three question
// collections (quiz_questions, mock_tests/{id}/questions, pyq_papers/{id}/questions).
// If the source question is later edited, the snapshot drifts — acceptable
// since revision is a "did you learn this?" check, not a fidelity check.

import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, query, where, orderBy, limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Question, Section } from './questionService';

export type MistakeSource = 'quiz' | 'mock' | 'pyq' | 'pyst' | 'sectional';

export type MistakeSnapshot = {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  section: Section;
  topicTag: string | null;
};

export type MistakeDoc = {
  questionId: string;
  section: Section;
  topicTag: string | null;
  source: MistakeSource;
  sourceId: string | null;
  timesWrong: number;
  resolved: boolean;
  wrongAt: any;     // Firestore Timestamp
  lastSeen: any;    // Firestore Timestamp
  snapshot: MistakeSnapshot;
};

const buildSnapshot = (q: Question): MistakeSnapshot => ({
  text: q.text ?? '',
  options: q.options ?? [],
  correct: q.correct ?? 0,
  explanation: q.explanation ?? '',
  section: q.section,
  topicTag: q.tags?.[0] ?? null,
});

/**
 * Upsert a wrong answer into the user's mistakes collection. Idempotent
 * on the same questionId: increments `timesWrong`, refreshes `lastSeen`,
 * and re-marks `resolved: false`.
 */
export const recordMistake = async (
  uid: string,
  q: Question,
  source: MistakeSource,
  sourceId: string | null = null,
): Promise<void> => {
  try {
    const ref = doc(db, 'users', uid, 'mistakes', q.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, {
        timesWrong: (snap.data().timesWrong ?? 1) + 1,
        lastSeen: serverTimestamp(),
        resolved: false,
        // Refresh the snapshot in case the source question was updated.
        snapshot: buildSnapshot(q),
      });
    } else {
      await setDoc(ref, {
        questionId: q.id,
        section: q.section,
        topicTag: q.tags?.[0] ?? null,
        source,
        sourceId,
        timesWrong: 1,
        resolved: false,
        wrongAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        snapshot: buildSnapshot(q),
      });
    }
  } catch (e) {
    // Fire-and-forget. Failures are logged but never thrown to the UI.
    console.warn('recordMistake failed', e);
  }
};

/** Mark a single mistake as resolved (after the user answered it right). */
export const markResolved = async (uid: string, questionId: string): Promise<void> => {
  try {
    const ref = doc(db, 'users', uid, 'mistakes', questionId);
    await updateDoc(ref, { resolved: true });
  } catch (e) {
    console.warn('markResolved failed', e);
  }
};

/**
 * Return up to `limit` unresolved mistakes as Question[] for the revision
 * runner. Each doc's `snapshot` is merged into a Question shape.
 */
export const getRevisionQuestions = async (
  uid: string,
  max = 10,
): Promise<Question[]> => {
  try {
    const ref = collection(db, 'users', uid, 'mistakes');
    const q = query(
      ref,
      where('resolved', '==', false),
      orderBy('lastSeen', 'desc'),
      limit(max),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as MistakeDoc;
      return {
        id: data.questionId,
        text: data.snapshot.text,
        options: data.snapshot.options,
        correct: data.snapshot.correct,
        section: data.snapshot.section,
        year: null,
        explanation: data.snapshot.explanation,
        difficulty: 'medium' as const,
        tags: data.snapshot.topicTag ? [data.snapshot.topicTag] : [],
      };
    });
  } catch (e) {
    console.error('getRevisionQuestions failed', e);
    return [];
  }
};

/** Quick count of unresolved mistakes for the Progress badge. */
export const getMistakesCount = async (uid: string): Promise<number> => {
  try {
    const ref = collection(db, 'users', uid, 'mistakes');
    const q = query(ref, where('resolved', '==', false));
    const snap = await getDocs(q);
    return snap.size;
  } catch (e) {
    console.warn('getMistakesCount failed', e);
    return 0;
  }
};