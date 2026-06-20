// src/services/questionService.ts
import {
  collection, query, where, getDocs, orderBy, limit, DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

export type Section = 'QA' | 'GIR' | 'GA' | 'EN';

export type Question = {
  id: string;
  text: string;
  options: string[];
  correct: number;
  section: Section;
  year: number | null;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  paperId?: string | null;

  // Image properties
  questionImg?: string | null;
  optionImgs?: (string | null)[] | null;
  explanationImg?: string | null;

  // Question category type
  type?: 'quiz' | 'mock' | 'pyq' | null;
};

/**
 * Typed result for paper-level loaders. Used by app/exam/[id].tsx to
 * distinguish an empty paper (show "no questions") from a Firestore error
 * (show "retry"). The quiz helpers continue to return Question[] directly
 * since a missing quiz falls through to the static-content screens.
 */
export type QuestionResult =
  | { ok: true; questions: Question[] }
  | { ok: false; error: 'empty' | 'firestore'; message?: string };

const toQuestion = (doc: DocumentData): Question => ({
  id: doc.id,
  ...doc.data(),
});

// ── Subcollection query helpers ──────────────────────────────────────────

/**
 * Fetch questions for a specific mock test from /mock_tests/{testId}/questions.
 * Returns a QuestionResult so callers can distinguish empty from error.
 */
export const getQuestionsByMockTest = async (testId: string): Promise<QuestionResult> => {
  try {
    const q = query(collection(db, 'mock_tests', testId, 'questions'), orderBy('qNumber', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) return { ok: false, error: 'empty' };
    return { ok: true, questions: snap.docs.map(toQuestion) };
  } catch (e: any) {
    console.error('getQuestionsByMockTest failed', e);
    return { ok: false, error: 'firestore', message: e?.message };
  }
};

/**
 * Fetch questions for a specific PYQ paper from /pyq_papers/{paperId}/questions.
 */
export const getQuestionsByPyqPaper = async (paperId: string): Promise<QuestionResult> => {
  try {
    const q = query(collection(db, 'pyq_papers', paperId, 'questions'), orderBy('qNumber', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) return { ok: false, error: 'empty' };
    return { ok: true, questions: snap.docs.map(toQuestion) };
  } catch (e: any) {
    console.error('getQuestionsByPyqPaper failed', e);
    return { ok: false, error: 'firestore', message: e?.message };
  }
};

// ── Existing helpers updated for isolated collections ───────────────────

/**
 * Full mock-test loader. Tries the subcollection first; on empty/error,
 * falls back to per-section queries against quiz_questions as a pool.
 */
export const getMockTestQuestions = async (
  testId = 'mock_test_01',
): Promise<Question[]> => {
  const sub = await getQuestionsByMockTest(testId);
  if (sub.ok) return sub.questions;

  // Fallback to per-section queries (using quiz_questions as pool)
  const sections: Section[] = ['QA', 'GIR', 'GA', 'EN'];
  const all: Question[] = [];
  for (const section of sections) {
    const q = query(
      collection(db, 'quiz_questions'),
      where('section', '==', section),
      limit(25),
    );
    const snap = await getDocs(q);
    snap.forEach((doc) => all.push(toQuestion(doc)));
  }
  return all;
};

/**
 * Section-scoped loader. Supports subcollection paths for mock/pyq when
 * both `type` and `testOrPaperId` are supplied; otherwise falls back to
 * quiz_questions. Returns Question[] (legacy contract for quiz screens).
 */
export const getQuestionsBySection = async (
  section: Section,
  count = 25,
  type?: 'quiz' | 'mock' | 'pyq',
  testOrPaperId?: string,
): Promise<Question[]> => {
  if (type === 'mock' && testOrPaperId) {
    try {
      const q = query(
        collection(db, 'mock_tests', testOrPaperId, 'questions'),
        where('section', '==', section),
        limit(count),
      );
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs.map(toQuestion);
    } catch (e) {
      console.error('getQuestionsBySection(mock) failed', e);
    }
  } else if (type === 'pyq' && testOrPaperId) {
    try {
      const q = query(
        collection(db, 'pyq_papers', testOrPaperId, 'questions'),
        where('section', '==', section),
        limit(count),
      );
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs.map(toQuestion);
    } catch (e) {
      console.error('getQuestionsBySection(pyq) failed', e);
    }
  }

  const q = query(
    collection(db, 'quiz_questions'),
    where('section', '==', section),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map(toQuestion);
};

/**
 * Paper loader used by app/exam/[id].tsx. Auto-detects PYQ vs mock from
 * the paperId prefix. Returns QuestionResult so the exam screen can show
 * a useful error on empty/firestore failures.
 *
 * Naming conventions:
 *   `pyq_<year>_<shift>`     → /pyq_papers/pyq_<year>_<shift>/questions
 *   `pyst_<section>_<yr>_<sh>` → /pyq_papers/pyq_<yr>_<sh>/questions (filtered by section)
 *   `full`                   → /mock_tests/mock_test_01/questions (legacy default)
 *   anything else            → /mock_tests/<id>/questions
 */
export const getQuestionsByPaper = async (
  paperId: string,
  section?: Section,
): Promise<QuestionResult> => {
  const isPyq = paperId.startsWith('pyq_') || paperId.startsWith('pyst_');

  let actualPaperId = paperId;
  let actualSection = section;

  if (paperId.startsWith('pyst_')) {
    // pyst_QA_2023_s1 → pyq_2023_s1, section=QA
    const parts = paperId.split('_'); // ["pyst", "QA", "2023", "s1"]
    const sec = parts[1] as Section;
    const year = parts[2];
    const shift = parts[3];
    actualPaperId = `pyq_${year}_${shift}`;
    actualSection = sec;
  }

  try {
    if (isPyq) {
      if (actualSection) {
        const q = query(
          collection(db, 'pyq_papers', actualPaperId, 'questions'),
          where('section', '==', actualSection),
        );
        const snap = await getDocs(q);
        if (snap.empty) return { ok: false, error: 'empty' };
        return { ok: true, questions: snap.docs.map(toQuestion) };
      }
      return await getQuestionsByPyqPaper(actualPaperId);
    }

    // Mock test
    const testId = paperId === 'full' ? 'mock_test_01' : paperId;
    if (actualSection) {
      const q = query(
        collection(db, 'mock_tests', testId, 'questions'),
        where('section', '==', actualSection),
      );
      const snap = await getDocs(q);
      if (snap.empty) return { ok: false, error: 'empty' };
      return { ok: true, questions: snap.docs.map(toQuestion) };
    }
    return await getQuestionsByMockTest(testId);
  } catch (e: any) {
    console.error('getQuestionsByPaper failed', e);
    return { ok: false, error: 'firestore', message: e?.message };
  }
};

export const getQuestionsByDifficulty = async (
  difficulty: 'easy' | 'medium' | 'hard',
  count = 10,
): Promise<Question[]> => {
  const q = query(
    collection(db, 'quiz_questions'),
    where('difficulty', '==', difficulty),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map(toQuestion);
};

export const getDailyQuizQuestions = async (): Promise<Question[]> => {
  const sections: Section[] = ['QA', 'GIR', 'GA', 'EN'];
  const all: Question[] = [];
  for (const section of sections) {
    const q = query(
      collection(db, 'quiz_questions'),
      where('section', '==', section),
      limit(3),
    );
    const snap = await getDocs(q);
    snap.forEach((doc) => all.push(toQuestion(doc)));
  }
  return all.sort(() => Math.random() - 0.5).slice(0, 10);
};

// ── Quiz helpers (use quiz_questions) ───────────────────────────────────

export const getMixQuizQuestions = async (count = 10): Promise<Question[]> => {
  const sections: Section[] = ['QA', 'GIR', 'GA', 'EN'];
  const all: Question[] = [];
  const perSection = Math.ceil(count / sections.length);
  for (const section of sections) {
    const q = query(
      collection(db, 'quiz_questions'),
      where('section', '==', section),
      limit(perSection + 5),
    );
    const snap = await getDocs(q);
    snap.forEach((doc) => all.push(toQuestion(doc)));
  }
  return all.sort(() => Math.random() - 0.5).slice(0, count);
};

export const getSubjectQuizQuestions = async (
  section: Section,
  count = 10,
): Promise<Question[]> => {
  const q = query(
    collection(db, 'quiz_questions'),
    where('section', '==', section),
    limit(count + 10),
  );
  const snap = await getDocs(q);
  return snap.docs.map(toQuestion).sort(() => Math.random() - 0.5).slice(0, count);
};

export const getTopicQuizQuestions = async (
  section: Section,
  tag: string,
  count = 10,
): Promise<Question[]> => {
  const q = query(
    collection(db, 'quiz_questions'),
    where('section', '==', section),
    where('tags', 'array-contains', tag),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map(toQuestion).sort(() => Math.random() - 0.5);
};