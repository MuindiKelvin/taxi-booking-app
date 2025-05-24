// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAwlxfacUK8iH8h4w1iF3WlIgensG3iZQg",
  authDomain: "tax-booking-app-d1b99.firebaseapp.com",
  projectId: "tax-booking-app-d1b99",
  storageBucket: "tax-booking-app-d1b99.firebasestorage.app",
  messagingSenderId: "109489972980",
  appId: "1:109489972980:web:cb8487e7e1c35cba7b60a1",
  measurementId: "G-LLC0LPTLF7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
