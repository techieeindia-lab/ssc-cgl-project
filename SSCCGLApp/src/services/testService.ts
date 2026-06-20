// src/services/testService.ts
import {
  collection, addDoc, getDocs, query,
  orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type TestResult = {
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  maxScore: number;
  timeTaken: number;
  testType: string;
  sectionStats: Record<string, any>;
  answers: Record<string, number | null>;
  questionIds: string[];
};

// Save a test result for a user
export const saveTestResult = async (uid: string, result: TestResult) => {
  const ref = collection(db, 'users', uid, 'testResults');
  await addDoc(ref, {
    ...result,
    createdAt: serverTimestamp(),
  });
};

// Get last N test results for a user
export const getTestHistory = async (uid: string, count = 10) => {
  const ref = collection(db, 'users', uid, 'testResults');
  const q = query(ref, orderBy('createdAt', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};