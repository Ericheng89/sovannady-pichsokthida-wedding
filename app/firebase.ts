import { initializeApp } from "firebase/app";

import {
  getFirestore
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCavLarue-pDu6QGDUy5aN041MO71tV-po",
  authDomain: "dy-thida-wedding.firebaseapp.com",
  projectId: "dy-thida-wedding",
  storageBucket: "dy-thida-wedding.firebasestorage.app",
  messagingSenderId: "371851732903",
  appId: "1:371851732903:web:aaa5f6b3b15f1d1cf67882"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);