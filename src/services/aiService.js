// AI Service for handling AI-related functionalities and data persistence

// Base URL for AI backend services
const AI_SERVICE_BASE_URL = '/api/ai';

// AIAssistant service functions
export const aiAssistantService = {
    // Save conversation history
    saveConversation: async (conversationData) => {
        try {
            const response = await fetch(`${AI_SERVICE_BASE_URL}/conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(conversationData),
            });
            if (!response.ok) throw new Error('Failed to save conversation');
            return await response.json();
        } catch (error) {
            console.error('Error saving conversation:', error);
            return null;
        }
    },

    // Get conversation history
    getConversationHistory: async (userId) => {
        try {
            const response = await fetch(`${AI_SERVICE_BASE_URL}/conversation/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch conversation history');
            return await response.json();
        } catch (error) {
            console.error('Error fetching conversation history:', error);
            return [];
        }
    },
};

// FinancialAssistant service functions
export const financialAssistantService = {
    // Save financial advice
    saveFinancialAdvice: async (adviceData) => {
        try {
            const response = await fetch(`${AI_SERVICE_BASE_URL}/financial-advice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(adviceData),
            });
            if (!response.ok) throw new Error('Failed to save financial advice');
            return await response.json();
        } catch (error) {
            console.error('Error saving financial advice:', error);
            return null;
        }
    },

    // Get financial advice history
    getFinancialAdviceHistory: async (userId) => {
        try {
            const response = await fetch(`${AI_SERVICE_BASE_URL}/financial-advice/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch financial advice history');
            return await response.json();
        } catch (error) {
            console.error('Error fetching financial advice history:', error);
            return [];
        }
    },
};

// EducationalHub service functions
export const educationalHubService = {
    // Get educational content
    getEducationalContent: async (category) => {
        try {
            const response = await fetch(`${AI_SERVICE_BASE_URL}/educational-content/${category}`);
            if (!response.ok) throw new Error('Failed to fetch educational content');
            return await response.json();
        } catch (error) {
            console.error('Error fetching educational content:', error);
            return [];
        }
    },

    // Save user progress
    saveUserProgress: async (progressData) => {
        try {
            const response = await fetch(`${AI_SERVICE_BASE_URL}/user-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(progressData),
            });
            if (!response.ok) throw new Error('Failed to save user progress');
            return await response.json();
        } catch (error) {
            console.error('Error saving user progress:', error);
            return null;
        }
    },

    // Get user progress
    getUserProgress: async (userId) => {
        try {
            const response = await fetch(`${AI_SERVICE_BASE_URL}/user-progress/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user progress');
            return await response.json();
        } catch (error) {
            console.error('Error fetching user progress:', error);
            return null;
        }
    },
};