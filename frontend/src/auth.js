import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let auth;

function getFirebaseAuth() {
  if (auth) return auth;

  const missingConfig = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingConfig.length) {
    throw new Error(
      'QuickRoom is not configured on this device yet. Add the Firebase Web app values to frontend/.env, then restart the frontend server.'
    );
  }

  auth = getAuth(initializeApp(firebaseConfig));
  return auth;
}

/**
 * Firebase Authentication is used only to establish the anonymous identity
 * required by the Worker. The browser never reads or writes Firebase Database
 * or Storage directly.
 */
export async function getAnonymousIdToken() {
  const firebaseAuth = getFirebaseAuth();
  const user = firebaseAuth.currentUser ?? (await signInAnonymously(firebaseAuth)).user;
  return user.getIdToken();
}
