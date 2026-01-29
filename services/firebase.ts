import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAgvvAkmLzOdt8WV-wlUxLrSrvI3ftih8g",
  authDomain: "compliq-4673d.firebaseapp.com",
  projectId: "compliq-4673d",
  storageBucket: "compliq-4673d.firebasestorage.app",
  messagingSenderId: "994176820391",
  appId: "1:994176820391:web:0da0b0a7ae10fd4ad4e782",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app)