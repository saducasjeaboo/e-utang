// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbC6ezeXmBOqlHDIkGySkhGIvnE_3V99o",
  authDomain: "e-debt-91a77.firebaseapp.com",
  projectId: "e-debt-91a77",
  storageBucket: "e-debt-91a77.firebasestorage.app",
  messagingSenderId: "734768863433",
  appId: "1:734768863433:web:90ac8b1dd9ca20e3be1518",
  measurementId: "G-DRRFJHGNMK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);