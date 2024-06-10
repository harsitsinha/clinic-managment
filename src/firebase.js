// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCC-1oE91QltMebUa4w-XEec2Msu_8mmkw",
//   authDomain: "clinic-managment-30930.firebaseapp.com",
//   projectId: "clinic-managment-30930",
//   storageBucket: "clinic-managment-30930.appspot.com",
//   messagingSenderId: "948906151606",
//   appId: "1:948906151606:web:ddd569380f1b17b1abe017",
//   measurementId: "G-YYFWWK0QLS"
// };

// //Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCC-1oE91QltMebUa4w-XEec2Msu_8mmkw",
  authDomain: "clinic-managment-30930.firebaseapp.com",
  projectId: "clinic-managment-30930",
  storageBucket: "clinic-managment-30930.appspot.com",
  messagingSenderId: "948906151606",
  appId: "1:948906151606:web:ddd569380f1b17b1abe017",
  measurementId: "G-YYFWWK0QLS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
