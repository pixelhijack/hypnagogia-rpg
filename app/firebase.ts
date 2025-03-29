import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCYb8wAiSuxQFusRuF87ki_fPT2Pr15j7w",
  authDomain: "lapozgatos.firebaseapp.com",
  projectId: "lapozgatos",
  storageBucket: "lapozgatos.firebasestorage.app",
  messagingSenderId: "562510625053",
  appId: "1:562510625053:web:c3508fb64303e6f53589f4",
  measurementId: "G-2RFKZCZ1FS"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };