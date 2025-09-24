import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDvPLOquzs5W5GJJgO9kAkVcvXnp4vQxhc",
  authDomain: "volunteer-app-428f3.firebaseapp.com",
  projectId: "volunteer-app-428f3",
  storageBucket: "volunteer-app-428f3.firebasestorage.app",
  messagingSenderId: "798364457722",
  appId: "1:798364457722:web:54fe9887dabb7e66898743",
  measurementId: "G-YEKS35ZY9C",
};

export const app: FirebaseApp = initializeApp(firebaseConfig);

export let analytics: Analytics | undefined;
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

// Initialize Analytics only when supported (browser) to avoid SSR/build issues
if (typeof window !== "undefined") {
  void isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export default app;


