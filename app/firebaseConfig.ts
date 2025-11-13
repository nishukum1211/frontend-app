// firebaseConfig.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase web config
const firebaseConfig = {
  apiKey: "AIzaSyDMWM98Npqj-YjkoPvoYfnPNnDWD8r0VZ0",
  authDomain: "farmer-app-2d096.firebaseapp.com",
  projectId: "farmer-app-2d096",
  storageBucket: "farmer-app-2d096.firebasestorage.app",
  messagingSenderId: "770535423499",
  appId: "1:770535423499:web:b2138931a8978cec0cd10e",
  measurementId: "G-PWKSVK45FH",
};

// 🧠 Prevent "No Firebase App" or duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Always get auth from the initialized app
const auth = getAuth(app);

export { app, auth };
