import { db } from './firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    deleteDoc,
    doc,
    getDoc,
    startAfter,
    writeBatch
} from 'firebase/firestore';

const CHAT_HISTORY_COLLECTION = 'chatHistory';

/**
 * Save a new chat message to Firestore for the Financial Assistant
 */
export const saveChatMessage = async (userId, message) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

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
                    timestamp: Date.now()
                });
                return docRef.id;
            } catch (error) {
                lastError = error;
                await new Promise(resolve =>
                    setTimeout(resolve, 1000 * Math.pow(2, attempt))
                );
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
 * This is used by the Financial Assistant component
 */
export const getChatHistory = async (userId, pageSize = 50, lastMessageId = null) => {
    console.log("🔍 getChatHistory called with userId:", userId);

    // Strict validation to prevent Firebase errors with undefined values
    if (userId === undefined || userId === null) {
        console.warn('⚠️ Undefined or null userId provided to getChatHistory');
        return { messages: [], hasMore: false };
    }

    if (typeof userId !== 'string') {
        console.warn(`⚠️ Invalid userId type provided to getChatHistory: ${typeof userId}`);
        return { messages: [], hasMore: false };
    }

    // Ensure userId is properly trimmed and validated before using in queries
    const validatedUserId = userId.trim();

    if (validatedUserId === '') {
        console.warn('⚠️ Empty userId after trimming provided to getChatHistory');
        return { messages: [], hasMore: false };
    }

    // Validate pageSize
    let validatedPageSize = pageSize;
    if (typeof validatedPageSize !== 'number' || validatedPageSize <= 0) {
        console.warn('⚠️ Invalid pageSize provided to getChatHistory, using default value');
        validatedPageSize = 50;
    }

    try {
        const chatHistoryRef = collection(db, CHAT_HISTORY_COLLECTION);
        let queryConstraints = [
            where('userId', '==', validatedUserId),
            limit(validatedPageSize)
        ];

        const maxRetries = 3;
        let retryCount = 0;
        let querySnapshot;

        while (retryCount < maxRetries) {
            try {
                // Validate lastMessageId if provided
                if (lastMessageId && typeof lastMessageId === 'string') {
                    try {
                        const lastDoc = await getDoc(doc(db, CHAT_HISTORY_COLLECTION, lastMessageId));
                        if (lastDoc.exists()) {
                            queryConstraints = [
                                ...queryConstraints.filter(c => c.type !== 'startAfter'),
                                startAfter(lastDoc)
                            ];
                        } else {
                            console.warn(`⚠️ Last message document with ID ${lastMessageId} does not exist`);
                        }
                    } catch (docError) {
                        console.error('Error fetching last message document:', docError);
                        // Continue without the startAfter constraint
                    }
                }

                const q = query(chatHistoryRef, ...queryConstraints);
                querySnapshot = await getDocs(q);
                break;
            } catch (error) {
                // Check specifically for missing index error
                if (error.code === 'failed-precondition' && error.message.includes('index')) {
                    console.error('Missing Firebase index error:', error.message);
                    console.info('To fix this error, you need to create a composite index for the chatHistory collection.');
                    console.info('Please go to the Firebase console and create the following index:');
                    console.info('Collection: chatHistory');
                    console.info('Fields to index: userId (Ascending), timestamp (Descending)');
                    console.info('Query scope: Collection');

                    // Extract the index creation URL if present in the error message
                    const urlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com\/[^\s]+/);
                    const indexUrl = urlMatch ? urlMatch[0] : 'https://console.firebase.google.com/v1/r/project/financial-assistant-beb2e/firestore/indexes?create_composite=Cl1wcm9qZWN0cy9maW5hbmNpYWwtYXNzaXN0YW50LWJlYjJlL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9jaGF0SGlzdG9yeS9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgl0aW1lc3RhbXAQAhoMCghfX25hbWVfXxAC';

                    // Return empty result with error information and index URL
                    return {
                        messages: [],
                        hasMore: false,
                        indexError: true,
                        errorMessage: 'Missing required index. Please check the console for instructions.',
                        indexUrl: indexUrl,
                        indexCreationSteps: [
                            '1. Click the URL below to open the Firebase console',
                            '2. Sign in with your Firebase account if prompted',
                            '3. Review the index configuration (Collection: chatHistory, Fields: userId ASC, timestamp DESC)',
                            '4. Click "Create index" to create the required index',
                            '5. Wait for the index to finish building (this may take a few minutes)',
                            '6. Return to this application and try again'
                        ]
                    };
                }

                retryCount++;
                console.warn(`Retry ${retryCount}/${maxRetries} failed:`, error.message);

                if (retryCount === maxRetries) {
                    console.error('❌ Failed to fetch chat history after multiple attempts');
                    return { messages: [], hasMore: false };
                }

                await new Promise(resolve =>
                    setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000))
                );
            }
        }

        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });

        const hasMore = messages.length === validatedPageSize;

        return {
            messages: messages.reverse(),
            hasMore
        };
    } catch (error) {
        // Check for missing index error at the outer try/catch level as well
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
            console.error('Missing Firebase index error:', error.message);
            console.info('To fix this error, you need to create a composite index for the chatHistory collection.');
            console.info('Please go to the Firebase console and create the following index:');
            console.info('Collection: chatHistory');
            console.info('Fields to index: userId (Ascending), timestamp (Descending)');
            console.info('Query scope: Collection');

            // Extract the index creation URL if present in the error message
            const urlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com\/[^\s]+/);
            const indexUrl = urlMatch ? urlMatch[0] : 'https://console.firebase.google.com/v1/r/project/financial-assistant-beb2e/firestore/indexes?create_composite=Cl1wcm9qZWN0cy9maW5hbmNpYWwtYXNzaXN0YW50LWJlYjJlL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9jaGF0SGlzdG9yeS9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgl0aW1lc3RhbXAQAhoMCghfX25hbWVfXxAC';

            return {
                messages: [],
                hasMore: false,
                indexError: true,
                errorMessage: 'Missing required index. Please check the console for instructions.',
                indexUrl: indexUrl
            };
        }

        console.error('Error getting chat history:', error);
        return { messages: [], hasMore: false };
    }
};

/**
 * Delete a specific chat message from the Financial Assistant
 */
export const deleteChatMessage = async (userId, messageId) => {
    if (!userId || !messageId) {
        throw new Error('User ID and message ID are required');
    }

    try {
        const messageRef = doc(db, CHAT_HISTORY_COLLECTION, messageId);
        const messageDoc = await getDoc(messageRef);

        if (!messageDoc.exists()) {
            throw new Error('Message not found');
        }

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
 * Clear all chat history for a user from the Financial Assistant
 */
export const clearChatHistory = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    try {
        const chatHistoryRef = collection(db, CHAT_HISTORY_COLLECTION);
        const q = query(chatHistoryRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

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
