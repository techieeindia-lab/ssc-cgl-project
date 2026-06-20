// src/services/studyService.ts
// Dynamic fetchers for the Study Hub (Flashcards / E-Books / Mind Maps /
// One-liners) and the `isPremium` gate used by EbookView.
//
// Firestore layout: one doc per (tool, section, tag):
//   study_flashcards/QA_percentage
//   study_ebooks/GA_current-affairs
//   study_mindmaps/EN_vocabulary
//   study_oneliners/GIR_analogy
//
// Doc id is deterministic (`${section}_${tag}`), so the client never
// needs a list query. If a doc is missing or the body array is empty,
// we fall back to the matching static entry in `src/data/studyContent.ts`
// so the app still works without seeding.

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  Flashcard, OneLiner, EbookChapter, MindMapNode,
  getFlashcards, getOneLiners, getEbookChapters, getMindmap,
} from '../data/studyContent';

type StudyDoc<TKey extends string> = {
  section: string;
  tag: string;
  updatedAt?: any;
} & Record<TKey, any>;

const withTimeout = <T,>(p: Promise<T>, ms = 5000): Promise<T | null> =>
  Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);

const docId = (section: string, tag: string) => `${section}_${tag}`;

// ── Fetchers ──────────────────────────────────────────────────────────────

export const fetchFlashcards = async (section: string, tag: string): Promise<Flashcard[]> => {
  try {
    const snap = await withTimeout(
      getDoc(doc(db, 'study_flashcards', docId(section, tag))),
    );
    const data = (snap?.data() as StudyDoc<'cards'> | undefined) ?? null;
    if (data && Array.isArray(data.cards) && data.cards.length > 0) {
      return data.cards as Flashcard[];
    }
  } catch (e) {
    console.warn('fetchFlashcards failed, falling back to static', e);
  }
  return getFlashcards(section, tag);
};

export const fetchOneLiners = async (section: string, tag: string): Promise<OneLiner[]> => {
  try {
    const snap = await withTimeout(
      getDoc(doc(db, 'study_oneliners', docId(section, tag))),
    );
    const data = (snap?.data() as StudyDoc<'items'> | undefined) ?? null;
    if (data && Array.isArray(data.items) && data.items.length > 0) {
      return data.items as OneLiner[];
    }
  } catch (e) {
    console.warn('fetchOneLiners failed, falling back to static', e);
  }
  return getOneLiners(section, tag);
};

export const fetchEbookChapters = async (
  section: string, tag: string,
): Promise<EbookChapter[]> => {
  try {
    const snap = await withTimeout(
      getDoc(doc(db, 'study_ebooks', docId(section, tag))),
    );
    const data = (snap?.data() as StudyDoc<'chapters'> | undefined) ?? null;
    if (data && Array.isArray(data.chapters) && data.chapters.length > 0) {
      return data.chapters as EbookChapter[];
    }
  } catch (e) {
    console.warn('fetchEbookChapters failed, falling back to static', e);
  }
  return getEbookChapters(section, tag);
};

export const fetchMindmap = async (
  section: string, tag: string,
): Promise<MindMapNode | null> => {
  try {
    const snap = await withTimeout(
      getDoc(doc(db, 'study_mindmaps', docId(section, tag))),
    );
    const data = (snap?.data() as StudyDoc<'tree'> | undefined) ?? null;
    if (data && data.tree) {
      return data.tree as MindMapNode;
    }
  } catch (e) {
    console.warn('fetchMindmap failed, falling back to static', e);
  }
  return getMindmap(section, tag);
};

// ── Premium gate ──────────────────────────────────────────────────────────
//
// `isPremium` lives as a boolean on `users/{uid}`. We cache the value
// per session; AuthContext clears the cache on sign-out.

const premiumCache = new Map<string, boolean>();

export const checkPremiumGate = async (uid: string | null | undefined): Promise<boolean> => {
  if (!uid) return false;
  if (premiumCache.has(uid)) return premiumCache.get(uid)!;
  try {
    const snap = await withTimeout(getDoc(doc(db, 'users', uid)));
    const isPremium = !!(snap?.data() as any)?.isPremium;
    premiumCache.set(uid, isPremium);
    return isPremium;
  } catch (e) {
    console.warn('checkPremiumGate failed, defaulting to false', e);
    return false;
  }
};

/** Clear the cached premium value for a uid (called on sign-out). */
export const clearPremiumCache = (uid: string | null | undefined) => {
  if (!uid) {
    premiumCache.clear();
    return;
  }
  premiumCache.delete(uid);
};