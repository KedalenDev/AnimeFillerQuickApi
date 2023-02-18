// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvv2lOhT_5VG4nc18ftRXBtSnHrVyuo8A",
  authDomain: "anime-flv-companion.firebaseapp.com",
  projectId: "anime-flv-companion",
  storageBucket: "anime-flv-companion.appspot.com",
  messagingSenderId: "416422881975",
  appId: "1:416422881975:web:75c6ab15a3224a02f17b32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const fb = getFirestore(app);