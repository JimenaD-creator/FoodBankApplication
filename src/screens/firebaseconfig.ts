import { 
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';


import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB12zFtAIKFe2ZReDSkCR73o3iGpfuPvtc",
  authDomain: "foodbankapplication.firebaseapp.com",
  projectId: "foodbankapplication",
  storageBucket: "foodbankapplication.firebasestorage.app",
  messagingSenderId: "184539179466",
  appId: "1:184539179466:web:095426a9df9991dcd54733",
  measurementId: "G-1VZQWBF4RK"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);