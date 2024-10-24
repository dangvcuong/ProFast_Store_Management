// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtZ1vhjaQHS-FZA4VfS4vZYHu9X6_9PFk",
    authDomain: "profast-e9fdf.firebaseapp.com",
    databaseURL: "https://profast-e9fdf-default-rtdb.firebaseio.com",
    projectId: "profast-e9fdf",
    storageBucket: "profast-e9fdf.appspot.com",
    messagingSenderId: "1053567433900",
    appId: "1:1053567433900:web:2c353877a34c1e435ef309",
    measurementId: "G-4ED0N08GKJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app); // Khởi tạo Firebase Storage

export { db, storage, app }; // Export Storage để sử dụng trong các tệp khác
