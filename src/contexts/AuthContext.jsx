import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges, signOutUser } from '../services/auth';
import { useUserProfile } from './userprofilecontext';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '../services/firebase.jsx';

const AuthContext = createContext();
const db = getFirestore(app);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { updateProfile, completeOnboarding, resetProfile } = useUserProfile();

    useEffect(() => {
        console.log('AuthProvider mounted');

        const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // Retry logic for Firestore user document fetch
                    let retryCount = 0;
                    const maxRetries = 3;
                    let userDoc;

                    while (retryCount < maxRetries) {
                        try {
                            userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                            break;
                        } catch (error) {
                            retryCount++;
                            console.warn(`Firestore attempt ${retryCount}/${maxRetries} failed: ${error.message}`);
                            if (retryCount === maxRetries) {
                                console.warn('Operating in offline mode');
                                return;
                            }
                            await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000)));
                        }
                    }

                    const userData = userDoc?.data() || {};

                    const userProfile = {
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || '',
                        displayName: firebaseUser.displayName || '',
                        photoURL: firebaseUser.photoURL || '',
                        ...userData,
                        lastLogin: new Date().toISOString()
                    };

                    // Save user profile with last login
                    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile, { merge: true });

                    setUser(firebaseUser);
                    updateProfile(userProfile);

                    if (userData?.isOnboarded) {
                        completeOnboarding();
                    }
                } else {
                    // User signed out or not authenticated
                    setUser(null);
                    resetProfile();
                    updateProfile({
                        email: '',
                        name: '',
                        displayName: '',
                        photoURL: '',
                        preferences: {
                            theme: 'light',
                            notifications: true,
                            currency: 'USD',
                            language: 'en'
                        }
                    });
                }
            } catch (err) {
                setError(err.message);
                console.error('Error in AuthProvider:', err);
            } finally {
                setLoading(false);
            }
        });

        return () => {
            console.log('AuthProvider unmounted');
            unsubscribe();
        };
    }, []); // ✅ Empty dependency array to prevent re-running effect

    const handleSignOut = async () => {
        try {
            await signOutUser();
            setUser(null);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const value = {
        user,
        loading,
        error,
        signOut: handleSignOut,
        isAuthenticated: !!user,
        userId: user?.uid
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
