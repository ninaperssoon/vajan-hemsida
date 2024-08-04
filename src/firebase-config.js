// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

import {getAuth, GoogleAuthProvider, onAuthStateChanged} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDN2xbVgUiBSFI5b9dLI3XVCO8m5iilOs",
  authDomain: "vajan-hemsida.firebaseapp.com",
  projectId: "vajan-hemsida",
  storageBucket: "vajan-hemsida.appspot.com",
  messagingSenderId: "5867663205",
  appId: "1:5867663205:web:e89bf4552e3b614614fb8c",
  measurementId: "G-LELFB9X254"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Connections to Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
