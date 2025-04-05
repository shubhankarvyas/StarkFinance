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
    apiKey: "AIzaSyATIji2xNVr6dLPoMMPdFryyHZpevv9nYQ",
    authDomain: "financial-assistant-beb2e.firebaseapp.com",
    projectId: "financial-assistant-beb2e",
    storageBucket: "financial-assistant-beb2e.appspot.com",  // ✅ fixed typo from 'firebasestorage.app'
    messagingSenderId: "701029629133",
    appId: "1:701029629133:web:4ab001b938c19118447d84",
    measurementId: "G-4DBQ2Z48WH"
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
