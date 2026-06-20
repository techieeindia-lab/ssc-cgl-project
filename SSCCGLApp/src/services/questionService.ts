// src/services/questionService.ts
// ── FULL REPLACEMENT — adds getQuizQuestions & getTopicWiseQuestions ──
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

const toQuestion = (doc: DocumentData): Question => ({
  id: doc.id,
  ...doc.data(),
});

// ── existing helpers (unchanged) ─────────────────────────────────────────────

export const getMockTestQuestions = async (): Promise<Question[]> => {
  const sections: Section[] = ['QA', 'GIR', 'GA', 'EN'];
  const all: Question[] = [];
  
  // Attempt to query mock questions
  for (const section of sections) {
    const q = query(
      collection(db, 'questions'),
      where('type', '==', 'mock'),
      where('section', '==', section),
      limit(25)
    );
    const snap = await getDocs(q);
    snap.forEach((doc) => all.push(toQuestion(doc)));
  }

  // Fallback to any questions of these sections if no 'mock' type questions exist
  if (all.length === 0) {
    for (const section of sections) {
      const q = query(collection(db, 'questions'), where('section', '==', section), limit(25));
      const snap = await getDocs(q);
      snap.forEach((doc) => all.push(toQuestion(doc)));
    }
  }
  return all;
};

export const getQuestionsBySection = async (
  section: Section, count = 25, type?: 'quiz' | 'mock' | 'pyq'
): Promise<Question[]> => {
  const constraints: any[] = [where('section', '==', section)];
  if (type) {
    constraints.push(where('type', '==', type));
  }
  const q = query(collection(db, 'questions'), ...constraints, limit(count));
  const snap = await getDocs(q);

  if (snap.empty && type) {
    // Fallback without type check
    const fallbackQ = query(collection(db, 'questions'), where('section', '==', section), limit(count));
    const fallbackSnap = await getDocs(fallbackQ);
    return fallbackSnap.docs.map(toQuestion);
  }
  return snap.docs.map(toQuestion);
};

export const getQuestionsByPaper = async (
  paperId: string, section?: Section,
): Promise<Question[]> => {
  const constraints: any[] = [where('paperId', '==', paperId)];
  if (section) constraints.push(where('section', '==', section));
  const q = query(collection(db, 'questions'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(toQuestion);
};

export const getQuestionsByDifficulty = async (
  difficulty: 'easy' | 'medium' | 'hard', count = 10,
): Promise<Question[]> => {
  const q = query(collection(db, 'questions'), where('difficulty', '==', difficulty), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(toQuestion);
};

export const getDailyQuizQuestions = async (): Promise<Question[]> => {
  const sections: Section[] = ['QA', 'GIR', 'GA', 'EN'];
  const all: Question[] = [];
  for (const section of sections) {
    const q = query(
      collection(db, 'questions'),
      where('type', '==', 'quiz'),
      where('section', '==', section),
      limit(5)
    );
    const snap = await getDocs(q);
    snap.forEach((doc) => all.push(toQuestion(doc)));
  }

  // Fallback if no quiz questions exist
  if (all.length === 0) {
    for (const section of sections) {
      const q = query(collection(db, 'questions'), where('section', '==', section), limit(3));
      const snap = await getDocs(q);
      snap.forEach((doc) => all.push(toQuestion(doc)));
    }
  }
  return all.sort(() => Math.random() - 0.5).slice(0, 10);
};

// ── NEW: Quiz helpers ─────────────────────────────────────────────────────────

/**
 * Mix Quiz — random questions from all sections
 * @param count number of questions (default 10)
 */
export const getMixQuizQuestions = async (count = 10): Promise<Question[]> => {
  const sections: Section[] = ['QA', 'GIR', 'GA', 'EN'];
  const all: Question[] = [];
  const perSection = Math.ceil(count / sections.length);
  for (const section of sections) {
    const q = query(
      collection(db, 'questions'),
      where('type', '==', 'quiz'),
      where('section', '==', section),
      limit(perSection + 5)
    );
    const snap = await getDocs(q);
    snap.forEach((doc) => all.push(toQuestion(doc)));
  }

  // Fallback
  if (all.length === 0) {
    for (const section of sections) {
      const q = query(collection(db, 'questions'), where('section', '==', section), limit(perSection + 5));
      const snap = await getDocs(q);
      snap.forEach((doc) => all.push(toQuestion(doc)));
    }
  }
  return all.sort(() => Math.random() - 0.5).slice(0, count);
};

/**
 * Subject-wise Quiz — all questions from one section
 */
export const getSubjectQuizQuestions = async (
  section: Section, count = 10,
): Promise<Question[]> => {
  const q = query(
    collection(db, 'questions'),
    where('type', '==', 'quiz'),
    where('section', '==', section),
    limit(count + 10),
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    const fallbackQ = query(collection(db, 'questions'), where('section', '==', section), limit(count + 10));
    const fallbackSnap = await getDocs(fallbackQ);
    return fallbackSnap.docs.map(toQuestion).sort(() => Math.random() - 0.5).slice(0, count);
  }
  return snap.docs.map(toQuestion).sort(() => Math.random() - 0.5).slice(0, count);
};

/**
 * Topic-wise Quiz — filtered by tag
 */
export const getTopicQuizQuestions = async (
  section: Section, tag: string, count = 10,
): Promise<Question[]> => {
  const q = query(
    collection(db, 'questions'),
    where('type', '==', 'quiz'),
    where('section', '==', section),
    where('tags', 'array-contains', tag),
    limit(count),
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    const fallbackQ = query(
      collection(db, 'questions'),
      where('section', '==', section),
      where('tags', 'array-contains', tag),
      limit(count),
    );
    const fallbackSnap = await getDocs(fallbackQ);
    return fallbackSnap.docs.map(toQuestion).sort(() => Math.random() - 0.5);
  }
  return snap.docs.map(toQuestion).sort(() => Math.random() - 0.5);
};