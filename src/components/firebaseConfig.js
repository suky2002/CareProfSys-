// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWmy6khAEXFHsVaoRRmNQ-46Z5J_Z5grQ",
  authDomain: "careprofsys.firebaseapp.com",
  projectId: "careprofsys",
  storageBucket: "careprofsys.firebasestorage.app",
  messagingSenderId: "865645532065",
  appId: "1:865645532065:web:cf37b5d93fac5d9026f1e0",
  measurementId: "G-L7HZ95C2JZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);