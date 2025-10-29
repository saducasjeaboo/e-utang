// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbC6ezeXmBOqlHDIkGySkhGIvnE_3V99o",
  authDomain: "e-debt-91a77.firebaseapp.com",
  projectId: "e-debt-91a77",
  storageBucket: "e-debt-91a77.firebasestorage.app",
  messagingSenderId: "734768863433",
  appId: "1:734768863433:web:90ac8b1dd9ca20e3be1518",
  measurementId: "G-DRRFJHGNMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);