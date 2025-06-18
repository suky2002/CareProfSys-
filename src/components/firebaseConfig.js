
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

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