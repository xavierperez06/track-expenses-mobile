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
// We check getApps() to avoid "App already exists" errors during hot-reloads
const apps = getApps();
const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);

/**
 * Robust Auth Initialization
 * Handles React Native persistence and environment-specific restrictions.
 */
const initAuth = () => {
  try {
    // Try to get an existing Auth instance
    const existingAuth = getAuth(app);
    if (existingAuth) return existingAuth;
  } catch (e) {
    // Auth not initialized yet, proceed to initialize
  }

  try {
    // Initialize with AsyncStorage persistence for mobile session management
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    // Fallback if already initialized or if restricted by environment (e.g., Simulator/API Key restrictions)
    if (
      error.code === "auth/already-initialized" ||
      error.code === "auth/admin-restricted-operation"
    ) {
      return getAuth(app);
    }

    // Default fallback
    return getAuth(app);
  }
};

const auth = initAuth();
const db = getFirestore(app);

export { auth, db };
