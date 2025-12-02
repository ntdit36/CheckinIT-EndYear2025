import firebase from "firebase/compat/app";
import "firebase/database";

// --- QUAN TRỌNG: THAY THẾ BẰNG THÔNG TIN TỪ FIREBASE CONSOLE CỦA BẠN ---
// Bước 1: Vào console.firebase.google.com -> Project Settings -> General -> Your apps
// Bước 2: Copy object config dán vào dưới đây
const firebaseConfig = {
  apiKey: "AIzaSyAXtnsgM2cu7IdOOq5ZMPuNHpcUtTc_93g",
  authDomain: "it2025-c6ed8.firebaseapp.com",
  projectId: "it2025-c6ed8",
  storageBucket: "it2025-c6ed8.firebasestorage.app",
  messagingSenderId: "784468579580",
  appId: "1:784468579580:web:1b981ba6370aa7cf1b7379",
  measurementId: "G-ERVN4JE01P"
};

// Khởi tạo Firebase (kiểm tra để tránh duplicate app initialization)
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Xuất Database để dùng trong App.tsx
export const db = app.database();