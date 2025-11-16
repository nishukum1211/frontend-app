// lib/firebaseConfig.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth/react-native"; // 👈 this is the CRUCIAL FIX for Expo
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAThHNbGWmmdIhnlzMJWeQ4gZWIRaIbjBE",
  authDomain: "dev-kishanbhai-app.firebaseapp.com",
  projectId: "dev-kishanbhai-app",
  storageBucket: "dev-kishanbhai-app.firebasestorage.app",
  messagingSenderId: "23809827867",
  appId: "1:23809827867:web:e36b3a8ae317197da7c4be",
};

// ✅ Prevent duplicate initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export const db = getFirestore(app);

export { app, auth };
