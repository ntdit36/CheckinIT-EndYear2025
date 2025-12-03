import firebase from "firebase/compat/app";
import "firebase/database";

// --- QUAN TRỌNG: THAY THẾ BẰNG THÔNG TIN TỪ FIREBASE CONSOLE CỦA BẠN ---
// Bước 1: Vào console.firebase.google.com -> Project Settings -> General -> Your apps
// Bước 2: Copy object config dán vào dưới đây
const firebaseConfig = {
  apiKey: "AIzaSyBtudfLFqWZvBKZ5cr2ofzaULsz8MdOsaI",
  authDomain: "itendyear.firebaseapp.com",
  projectId: "itendyear",
  storageBucket: "itendyear.firebasestorage.app",
  messagingSenderId: "760502534464",
  appId: "1:760502534464:web:2cb7195bae919cbcc17aa5",
  measurementId: "G-JHNN75QZVL"
};

// Khởi tạo Firebase (kiểm tra để tránh duplicate app initialization)
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Xuất Database để dùng trong App.tsx

export const db = app.database();



