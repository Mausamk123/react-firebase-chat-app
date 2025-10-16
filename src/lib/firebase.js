// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// src/lib/firebase.js (near top)
import {  setLogLevel } from "firebase/firestore";

setLogLevel('debug'); // <-- verbose Firestore client logs (temporary)

console.log('VITE_API_KEY present?', !!import.meta.env.VITE_API_KEY);
console.log('firebase projectId:', import.meta.env.VITE_PROJECT_ID || 'react-chat-3e2ed (fallback)');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-chat-3e2ed.firebaseapp.com",
  projectId: "react-chat-3e2ed",
  storageBucket: "react-chat-3e2ed.firebasestorage.app",
  messagingSenderId: "392249831407",
  appId: "1:392249831407:web:ede400fa565aab74ab101a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export const db=getFirestore(app);
export default app;