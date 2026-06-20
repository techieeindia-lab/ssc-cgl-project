import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// ─── Save user to Firestore ──────────────────────────────────────────────────
async function saveUserToFirestore(uid: string, data: {
  name: string;
  email: string;
  photoURL?: string;
}) {
  try {
    console.log('💾 Saving user to Firestore...', uid);
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid,
        name: data.name,
        email: data.email,
        photoURL: data.photoURL || null,
        streak: 0,
        totalTests: 0,
        bestScore: 0,
        createdAt: serverTimestamp(),
      });
      console.log('✅ User saved to Firestore!');
    } else {
      console.log('ℹ️ User already exists in Firestore');
    }
  } catch (error) {
    console.error('❌ Firestore save error:', error);
    throw error;
  }
}

// ─── Register with Email ─────────────────────────────────────────────────────
export async function registerWithEmail(
  name: string,
  email: string,
  password: string
) {
  try {
    console.log('📝 Registering user...', email);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Auth user created:', result.user.uid);

    await updateProfile(result.user, { displayName: name });
    console.log('✅ Profile updated');

    await saveUserToFirestore(result.user.uid, { name, email });
    return result.user;
  } catch (error: any) {
    console.error('❌ Registration error:', error.code, error.message);
    throw error;
  }
}

// ─── Login with Email ────────────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string) {
  try {
    console.log('🔑 Logging in...', email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login success:', result.user.uid);
    return result.user;
  } catch (error: any) {
    console.error('❌ Login error:', error.code, error.message);
    throw error;
  }
}

// ─── Sign in with Google credential ─────────────────────────────────────────
export async function signInWithGoogleCredential(idToken: string) {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;
    await saveUserToFirestore(user.uid, {
      name: user.displayName || 'Student',
      email: user.email || '',
      photoURL: user.photoURL || undefined,
    });
    return user;
  } catch (error: any) {
    console.error('❌ Google sign-in error:', error.code, error.message);
    throw error;
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────
export async function logout() {
  await signOut(auth);
}