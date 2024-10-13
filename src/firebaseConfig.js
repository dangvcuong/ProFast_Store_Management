// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries\
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBtZ1vhjaQHS-FZA4VfS4vZYHu9X6_9PFk",
    authDomain: "profast-e9fdf.firebaseapp.com",
    projectId: "profast-e9fdf",
    storageBucket: "profast-e9fdf.appspot.com",
    messagingSenderId: "1053567433900",
    appId: "1:1053567433900:web:2c353877a34c1e435ef309",
    measurementId: "G-4ED0N08GKJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
export { analytics, database };