import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBYIMCH-mRXwO9GzqVyI12klO0V2Mne12Q",
    authDomain: "volunteeringapp-19352.firebaseapp.com",
    projectId: "volunteeringapp-19352",
    storageBucket: "volunteeringapp-19352.firebasestorage.app",
    messagingSenderId: "873586301097",
    appId: "1:873586301097:web:f5949f6cc170e6509731b8",
    measurementId: "G-C9BXFWSHVS"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };
