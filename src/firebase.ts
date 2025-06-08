// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDHbMrHh2j-O86t7B-GYjHObmkXknFp2b8",
    authDomain: "torneo-be5fc.firebaseapp.com",
    projectId: "torneo-be5fc",
    storageBucket: "torneo-be5fc.firebasestorage.app",
    messagingSenderId: "877880976754",
    appId: "1:877880976754:web:d200a7dba94a1e663229eb"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export the Firebase app and services
export { app, db, firebaseConfig };
