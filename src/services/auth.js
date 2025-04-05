import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from './firebase.jsx';

const auth = getAuth(app);
const db = getFirestore(app);

// Sign up with email and password and additional user data
export const signUp = async (email, password, userData) => {
    try {
        // Validate input parameters
        if (!email || !password || !userData) {
            throw new Error('Email, password, and user data are required');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        // Validate password strength
        if (password.length < 6) {
            throw new Error('Password should be at least 6 characters long');
        }

        // Validate user data
        if (!userData.name || typeof userData.name !== 'string' || userData.name.trim() === '') {
            throw new Error('Valid name is required');
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile with display name
            await updateProfile(user, {
                displayName: userData.name.trim()
            });

            // Store additional user data in Firestore
            const userDocData = {
                email: user.email,
                name: userData.name.trim(),
                createdAt: new Date().toISOString(),
                ...userData
            };

            await setDoc(doc(db, 'users', user.uid), userDocData);
            return { user, error: null };

        } catch (firebaseError) {
            // Handle specific Firebase Auth errors
            let errorMessage;
            switch (firebaseError.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please use a stronger password.';
                    break;
                default:
                    errorMessage = 'Failed to create account. Please try again.';
            }
            throw new Error(errorMessage);
        }
    } catch (error) {
        return { user: null, error: error.message };
    }
};


// Sign in with email and password
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

// Sign out
export const signOutUser = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};

// Get current user
export const getCurrentUser = () => {
    return auth.currentUser;
};