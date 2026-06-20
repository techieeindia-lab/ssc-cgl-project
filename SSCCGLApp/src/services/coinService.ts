// src/services/coinService.ts
import {
  doc, getDoc, updateDoc, increment, serverTimestamp, setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export type UserStats = {
  coins: number;
  xp: number;
  level: number;
  streak: number;
  lastQuizDate: string | null;
  totalTests: number;
  bestScore: number;
  lastTestDate: string | null;
};

export const LEVELS = [
  { level: 1, title: 'Beginner',     minXP: 0    },
  { level: 2, title: 'Aspirant',     minXP: 100  },
  { level: 3, title: 'Scholar',      minXP: 300  },
  { level: 4, title: 'Expert',       minXP: 600  },
  { level: 5, title: 'CGL Champion', minXP: 1000 },
];

export const getLevelFromXP = (xp: number) => {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) current = l;
  }
  const nextLevel = LEVELS.find((l) => l.minXP > xp);
  const progress = nextLevel
    ? ((xp - current.minXP) / (nextLevel.minXP - current.minXP)) * 100
    : 100;
  return { ...current, nextLevel, progress: Math.min(progress, 100) };
};

export const getUserStats = async (uid: string): Promise<UserStats> => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return {
      coins: 0, xp: 0, level: 1, streak: 0, lastQuizDate: null,
      totalTests: 0, bestScore: 0, lastTestDate: null,
    };
  }
  const d = snap.data();
  return {
    coins: d.coins ?? 0,
    xp: d.xp ?? 0,
    level: d.level ?? 1,
    streak: d.streak ?? 0,
    lastQuizDate: d.lastQuizDate ?? null,
    totalTests: d.totalTests ?? 0,
    bestScore: d.bestScore ?? 0,
    lastTestDate: d.lastTestDate ?? null,
  };
};

export type QuizReward = {
  coinsEarned: number;
  xpEarned: number;
  streakBonus: boolean;
  newLevel: number | null;
};

export const awardQuizCoins = async (
  uid: string,
  correct: number,
  total: number,
  isStreakDay: boolean,
): Promise<QuizReward> => {
  const base = correct * 10;
  const perfectBonus = correct === total ? 50 : 0;
  const streakBonus = isStreakDay ? 20 : 0;
  const coinsEarned = base + perfectBonus + streakBonus;
  const xpEarned = correct * 5 + (correct === total ? 25 : 0);

  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data() : {};

  const oldXP = current.xp ?? 0;
  const newXP = oldXP + xpEarned;
  const oldLevel = getLevelFromXP(oldXP).level;
  const newLevelInfo = getLevelFromXP(newXP);
  const leveledUp = newLevelInfo.level > oldLevel;

  const today = new Date().toISOString().split('T')[0];
  const lastDate = current.lastQuizDate ?? null;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = lastDate === yesterday ? (current.streak ?? 0) + 1
    : lastDate === today ? (current.streak ?? 0)
    : 1;

  await updateDoc(ref, {
    coins: increment(coinsEarned),
    xp: increment(xpEarned),
    level: newLevelInfo.level,
    streak: newStreak,
    lastQuizDate: today,
  });

  return {
    coinsEarned,
    xpEarned,
    streakBonus: streakBonus > 0,
    newLevel: leveledUp ? newLevelInfo.level : null,
  };
};

// ─── Mock / Sectional / PYQ test rewards ────────────────────────────
// Bigger rewards than quizzes because these are full-length exams.

export type ExamReward = {
  coinsEarned: number;
  xpEarned: number;
  accuracy: number;       // 0–100
  isNewBest: boolean;
  newLevel: number | null;
};

export const awardExamCoins = async (
  uid: string,
  score: number,
  maxScore: number,
  totalQuestions: number,
): Promise<ExamReward> => {
  const accuracy = totalQuestions === 0 ? 0 : Math.round((score / maxScore) * 100);

  // Reward curve:
  //   base = 25 coins per correct answer (rewards real performance)
  //   perfect-score bonus = +100
  //   high-accuracy bonus (>=80%) = +75
  //   completion bonus = +50 (you finished a full mock)
  //   xp = 10 per correct + 50 if perfect + 25 if high-accuracy
  const correctEstimate = Math.round(score / 2); // 2 marks per correct
  const baseCoins = correctEstimate * 25;
  const perfectBonus = accuracy >= 100 ? 100 : 0;
  const highAccBonus = accuracy >= 80 && accuracy < 100 ? 75 : 0;
  const completionBonus = 50;
  const coinsEarned = baseCoins + perfectBonus + highAccBonus + completionBonus;

  const xpEarned =
    correctEstimate * 10 +
    (accuracy >= 100 ? 50 : 0) +
    (accuracy >= 80 ? 25 : 0);

  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data() : {};

  const oldXP = current.xp ?? 0;
  const newXP = oldXP + xpEarned;
  const oldLevel = getLevelFromXP(oldXP).level;
  const newLevelInfo = getLevelFromXP(newXP);
  const leveledUp = newLevelInfo.level > oldLevel;

  const prevBest = current.bestScore ?? 0;
  const isNewBest = accuracy > prevBest;

  const today = new Date().toISOString().split('T')[0];

  await updateDoc(ref, {
    coins: increment(coinsEarned),
    xp: increment(xpEarned),
    level: newLevelInfo.level,
    totalTests: increment(1),
    bestScore: isNewBest ? accuracy : prevBest,
    lastTestDate: today,
  });

  return {
    coinsEarned,
    xpEarned,
    accuracy,
    isNewBest,
    newLevel: leveledUp ? newLevelInfo.level : null,
  };
};