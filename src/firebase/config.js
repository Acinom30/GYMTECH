// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDF96OErZ90kNmGVjIyFgZfZxg8aTpNOrY",
  authDomain: "gymtech-6487d.firebaseapp.com",
  projectId: "gymtech-6487d",
  storageBucket: "gymtech-6487d.appspot.com",
  messagingSenderId: "97380422642",
  appId: "1:97380422642:web:8579fe5ce15821ab28116b",
  measurementId: "G-VGCCZDWSD6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);