// src/services/currentAffairsService.ts
// Current Affairs feature: monthly digests + weekly quizzes.
//
// Firestore layout: flat `/current_affairs/{articleId}` with year/month/
// week fields. Auto-id is fine. The client groups articles by weekKey for
// the home feed; querying by `orderBy('publishedAt','desc')` is trivial.

import {
  collection, doc, getDoc, getDocs, query, orderBy, limit, where,
} from 'firebase/firestore';
import { db } from './firebase';
import { Question, Section, getQuestionsByPyqPaper, getQuestionsByMockTest, QuestionResult } from './questionService';

export type CurrentAffairsArticle = {
  id: string;
  title: string;
  summary: string;
  body: string;
  section: Section;          // defaults to 'GA'
  topicTag: string;          // defaults to 'current-affairs'
  publishedAt: any;          // Firestore Timestamp
  year: number;
  month: number;             // 1..12
  week: number;              // 1..5, week-of-month
  weekKey: string;           // e.g. "2026-W23"
  source: string | null;
  important: boolean;
  quizId: string | null;
  updatedAt?: any;
};

const withTimeout = <T,>(p: Promise<T>, ms = 5000): Promise<T | null> =>
  Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);

const toArticle = (d: any): CurrentAffairsArticle => ({
  id: d.id,
  ...(d.data() as Omit<CurrentAffairsArticle, 'id'>),
});

export const fetchRecentArticles = async (count = 20): Promise<CurrentAffairsArticle[]> => {
  try {
    const q = query(collection(db, 'current_affairs'), orderBy('publishedAt', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(toArticle);
  } catch (e) {
    console.error('fetchRecentArticles failed', e);
    return [];
  }
};

export const fetchArticle = async (id: string): Promise<CurrentAffairsArticle | null> => {
  try {
    const snap = await getDoc(doc(db, 'current_affairs', id));
    if (!snap.exists()) return null;
    return toArticle(snap);
  } catch (e) {
    console.error('fetchArticle failed', e);
    return null;
  }
};

export const fetchWeeklyDigest = async (
  year: number, week: number,
): Promise<CurrentAffairsArticle[]> => {
  try {
    const q = query(
      collection(db, 'current_affairs'),
      where('year', '==', year),
      where('week', '==', week),
      orderBy('publishedAt', 'desc'),
      limit(20),
    );
    const snap = await getDocs(q);
    return snap.docs.map(toArticle);
  } catch (e) {
    console.error('fetchWeeklyDigest failed', e);
    return [];
  }
};

/**
 * If the article links to a quiz (`quizId`), load its questions from
 * either the mock-tests or pyq-papers subcollection. Returns null when
 * the article has no quiz link.
 */
export const fetchArticleQuiz = async (
  article: CurrentAffairsArticle,
): Promise<Question[] | null> => {
  if (!article.quizId) return null;
  const paperId = article.quizId;
  // Heuristic: if id starts with `pyq_` it lives in pyq_papers; otherwise
  // it's a mock test.
  let res: QuestionResult;
  if (paperId.startsWith('pyq_')) {
    res = await getQuestionsByPyqPaper(paperId);
  } else {
    res = await getQuestionsByMockTest(paperId);
  }
  return res.ok ? res.questions : [];
};

// ── Helpers for week bucketing ──────────────────────────────────────────

/** ISO week number for a given Date (1..53). */
export const isoWeek = (d: Date): { year: number; week: number; key: string } => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (t.getUTCDay() + 6) % 7; // Mon=0
  t.setUTCDate(t.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((t.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7,
  );
  return { year: t.getUTCFullYear(), week, key: `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}` };
};

/** Group articles by weekKey in the order they appear. */
export const groupByWeek = (articles: CurrentAffairsArticle[]) => {
  const out: { weekKey: string; items: CurrentAffairsArticle[] }[] = [];
  const idx = new Map<string, number>();
  for (const a of articles) {
    const k = a.weekKey || isoWeek(new Date()).key;
    if (!idx.has(k)) {
      idx.set(k, out.length);
      out.push({ weekKey: k, items: [] });
    }
    out[idx.get(k)!].items.push(a);
  }
  return out;
};