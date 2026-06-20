import Constants from 'expo-constants';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = (Constants.expoConfig?.extra?.firebase ?? {}) as {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

// Make sure all required fields are present before initializing.
// Falls back to nothing if `.env` was not set up (the app will throw clearly at first use).
const missing = Object.entries(firebaseConfig)
  .filter(([k, v]) => !v && k !== 'measurementId')
  .map(([k]) => k);

if (missing.length > 0) {
  console.warn(
    `[firebase] Missing config keys: ${missing.join(', ')}. ` +
      `Copy .env.example to .env and fill in your Firebase values.`,
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;