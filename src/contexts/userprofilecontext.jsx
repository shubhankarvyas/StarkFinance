import { createContext, useContext, useState } from 'react';

const UserProfileContext = createContext();

export function UserProfileProvider({ children }) {
    const [userProfile, setUserProfile] = useState({
        name: '',
        email: '',
        displayName: '',
        photoURL: '',
        preferences: {
            theme: 'light',
            notifications: true,
            currency: 'USD',
            language: 'en'
        },
        lastLogin: null,
        createdAt: null,
        isOnboarded: false
    });

    const updateProfile = (newProfile) => {
        setUserProfile(prevProfile => ({
            ...prevProfile,
            ...newProfile,
            lastLogin: new Date().toISOString()
        }));
    };

    const updatePreferences = (newPreferences) => {
        setUserProfile(prevProfile => ({
            ...prevProfile,
            preferences: {
                ...prevProfile.preferences,
                ...newPreferences
            }
        }));
    };

    const completeOnboarding = () => {
        setUserProfile(prevProfile => ({
            ...prevProfile,
            isOnboarded: true
        }));
    };

    const resetProfile = () => {
        setUserProfile({
            name: '',
            email: '',
            displayName: '',
            photoURL: '',
            preferences: {
                theme: 'light',
                notifications: true,
                currency: 'USD',
                language: 'en'
            },
            lastLogin: null,
            createdAt: null,
            isOnboarded: false
        });
    };

    return (
        <UserProfileContext.Provider value={{
            userProfile,
            updateProfile,
            updatePreferences,
            completeOnboarding,
            resetProfile
        }}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
}