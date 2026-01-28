import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Finalized Web App configuration from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA3DV-46XlPHorT_0EG29tul61eMYKut0E",
  authDomain: "my-track-expenses.firebaseapp.com",
  projectId: "my-track-expenses",
  storageBucket: "my-track-expenses.firebasestorage.app",
  messagingSenderId: "640825514836",
  appId: "1:640825514836:web:8014f4c03e5b06592fc6c1",
  measurementId: "G-GVQBJ21S4C",
};

// Initialize Firebase App
const apps = getApps();
const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);

/**
 * Robust Auth Initialization
 */
const initAuth = () => {
  try {
    // 1. ATTEMPT PERISTENCE FIRST
    // We try to initialize with AsyncStorage immediately.
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    // 2. FALLBACK
    // If 'auth/already-initialized' (e.g. hot reload), we use the existing instance.
    return getAuth(app);
  }
};

const auth = initAuth();
const db = getFirestore(app);

export { auth, db };
