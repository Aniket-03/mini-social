import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDJsUlpSY1SkrBm6VTe7KzNj8uweH-Wlzg",
  authDomain: "social-media-app-c3f66.firebaseapp.com",
  projectId: "social-media-app-c3f66",
  storageBucket: "social-media-app-c3f66.appspot.com",
  messagingSenderId: "21968047078",
  appId: "1:21968047078:web:0ab573c8d629425b0ae427"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
