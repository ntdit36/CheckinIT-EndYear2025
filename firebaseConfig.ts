import firebase from "firebase/compat/app";
import "firebase/database";

// --- QUAN TRỌNG: THAY THẾ BẰNG THÔNG TIN TỪ FIREBASE CONSOLE CỦA BẠN ---
// Bước 1: Vào console.firebase.google.com -> Project Settings -> General -> Your apps
// Bước 2: Copy object config dán vào dưới đây
const firebaseConfig = {
  apiKey: "AIzaSyDQYFb4jU4GM6jvNeoI2_ruaL2l40KE1-E",
  authDomain: "eddy-2d7b9.firebaseapp.com",
  projectId: "eddy-2d7b9",
  storageBucket: "eddy-2d7b9.firebasestorage.app",
  messagingSenderId: "457973266884",
  appId: "1:457973266884:web:b07d771635523c70860c91",
  measurementId: "G-EBGZ0TZL66"
};

// Khởi tạo Firebase (kiểm tra để tránh duplicate app initialization)
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Xuất Database để dùng trong App.tsx

export const db = app.database();


