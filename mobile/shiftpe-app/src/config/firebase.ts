import { FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const requiredConfigKeys: (keyof FirebaseOptions)[] = ["apiKey", "projectId", "appId"];

export const assertFirebaseConfig = () => {
  const missingKeys = requiredConfigKeys.filter((key) => !firebaseConfig[key]);

  if (missingKeys.length) {
    throw new Error(
      `Missing Firebase mobile config: ${missingKeys
        .map((key) => `EXPO_PUBLIC_FIREBASE_${String(key).replace(/[A-Z]/g, (match) => `_${match}`).toUpperCase()}`)
        .join(", ")}`
    );
  }
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

const getFirebaseCompatAuth = () => {
  const compatApp = firebase.apps.length
    ? firebase.app()
    : firebase.initializeApp(firebaseConfig);

  return firebase.auth(compatApp);
};

export const getPhoneAuthProvider = () =>
  new firebase.auth.PhoneAuthProvider(getFirebaseCompatAuth());

export const getFirebaseIdTokenFromOtp = async (
  verificationId: string,
  otp: string
) => {
  const credential = PhoneAuthProvider.credential(verificationId, otp);
  const userCredential = await signInWithCredential(firebaseAuth, credential);
  return userCredential.user.getIdToken();
};
