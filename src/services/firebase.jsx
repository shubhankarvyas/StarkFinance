// firebase.jsx

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    initializeFirestore,
    persistentLocalCache
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// ✅ Your actual Firebase config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Use new Firestore persistence API
const db = initializeFirestore(app, {
    localCache: persistentLocalCache()
});

// ✅ Initialize other Firebase services
const auth = getAuth(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

// ✅ Export them for use in your app
export { app, db, auth, analytics, storage };
