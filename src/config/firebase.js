// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpM-vIrc2xUs8sxCA0X38AeIScqtK4XGo",
  authDomain: "fenzo-9f075.firebaseapp.com",
  projectId: "fenzo-9f075",
  storageBucket: "fenzo-9f075.firebasestorage.app",
  messagingSenderId: "783781462137",
  appId: "1:783781462137:web:9c16d1800bbc908dda54a8",
  measurementId: "G-ZRZNRKQ6FW"
};

// Initialize Firebase
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
}

// Export everything for easy access
export { app, db, auth };
export default app;
