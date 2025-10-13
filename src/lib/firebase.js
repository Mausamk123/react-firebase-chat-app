// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { get } from "mongoose";

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
export const db=getFirestore();
export default app;