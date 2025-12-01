import * as firebaseApp from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following config with your actual Firebase project configuration
// You can get this from the Firebase Console -> Project Settings -> General -> "Your apps"
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3S3G801HfMsBu_UAgElEIbAb6_CvhVBQ",
  authDomain: "luxstay-8533c.firebaseapp.com",
  projectId: "luxstay-8533c",
  storageBucket: "luxstay-8533c.firebasestorage.app",
  messagingSenderId: "906239787106",
  appId: "1:906239787106:web:535e96e10a45792812913b",
  measurementId: "G-XPMRF4YWPS"
};
// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
