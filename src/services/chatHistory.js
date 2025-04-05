import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, deleteDoc, doc, getDoc, startAfter, writeBatch } from 'firebase/firestore';

// Collection name for chat history
const CHAT_HISTORY_COLLECTION = 'chatHistory';

/**
 * Save a new chat message to Firestore
 * @param {string} userId - The user's ID
 * @param {object} message - The message object containing type, content, and timestamp
 * @returns {Promise<string>} - Returns the ID of the saved message
 */
export const saveChatMessage = async (userId, message) => {
    try {
        const chatHistoryRef = collection(db, CHAT_HISTORY_COLLECTION);
        const retryAttempts = 3;
        let lastError = null;

        for (let attempt = 0; attempt < retryAttempts; attempt++) {
            try {
                const docRef = await addDoc(chatHistoryRef, {
                    userId,
                    ...message,
                    createdAt: new Date().toISOString(),
                    timestamp: Date.now() // For better sorting and querying
                });
                return docRef.id;
            } catch (error) {
                lastError = error;
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            }
        }

        throw lastError;
    } catch (error) {
        console.error('Error saving chat message:', error);
        throw error;
    }
};

/**
 * Get chat history for a user with pagination support
 * @param {string} userId - The user's ID
 * @param {number} pageSize - Number of messages per page (default: 50)
 * @param {string} lastMessageId - ID of the last message for pagination
 * @returns {Promise<{messages: Array, hasMore: boolean}>} - Object containing messages and pagination info
 */
export const getChatHistory = async (userId, pageSize = 50, lastMessageId = null) => {
    try {
        const chatHistoryRef = collection(db, CHAT_HISTORY_COLLECTION);
        let queryConstraints = [
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'), // Use timestamp for more reliable ordering
            limit(pageSize)
        ];

        // Add pagination constraint if lastMessageId is provided
        if (lastMessageId) {
            const lastDoc = await getDoc(doc(db, CHAT_HISTORY_COLLECTION, lastMessageId));
            if (lastDoc.exists()) {
                queryConstraints.push(startAfter(lastDoc));
            }
        }

        const q = query(chatHistoryRef, ...queryConstraints);
        const querySnapshot = await getDocs(q);
        const messages = [];

        querySnapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Check if there are more messages
        const hasMore = messages.length === pageSize;

        // Return messages in chronological order with pagination info
        return {
            messages: messages.reverse(),
            hasMore
        };
    } catch (error) {
        console.error('Error getting chat history:', error);
        throw error;
    }
};

/**
 * Delete a specific chat message
 * @param {string} userId - The user's ID
 * @param {string} messageId - The ID of the message to delete
 * @returns {Promise<void>}
 */
export const deleteChatMessage = async (userId, messageId) => {
    try {
        const messageRef = doc(db, CHAT_HISTORY_COLLECTION, messageId);
        const messageDoc = await getDoc(messageRef);

        if (!messageDoc.exists()) {
            throw new Error('Message not found');
        }

        // Verify the message belongs to the user
        if (messageDoc.data().userId !== userId) {
            throw new Error('Unauthorized to delete this message');
        }

        await deleteDoc(messageRef);
    } catch (error) {
        console.error('Error deleting chat message:', error);
        throw error;
    }
};

/**
 * Clear all chat history for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<void>}
 */
export const clearChatHistory = async (userId) => {
    try {
        const chatHistoryRef = collection(db, CHAT_HISTORY_COLLECTION);
        const q = query(chatHistoryRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        // Use batched writes for better performance
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    } catch (error) {
        console.error('Error clearing chat history:', error);
        throw error;
    }
};