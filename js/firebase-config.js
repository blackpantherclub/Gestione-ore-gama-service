import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCp7WCI9wWBH1hLNXdYA0LTvRmKYjVo53o",
  authDomain: "gama-service.firebaseapp.com",
  projectId: "gama-service",
  storageBucket: "gama-service.firebasestorage.app",
  messagingSenderId: "440236038955",
  appId: "1:440236038955:web:24eaa8dca617b54b1b836e",
  measurementId: "G-VHEXPTJFWX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
