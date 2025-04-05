import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from './firebase.jsx';

const db = getFirestore(app);

// Expense Tracking Storage
export const saveExpense = async (userId, expenseData) => {
    try {
        const expenseRef = collection(db, 'expenses');
        await addDoc(expenseRef, {
            userId,
            ...expenseData,
            timestamp: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error saving expense:', error);
        return false;
    }
};

export const getExpenses = async (userId) => {
    try {
        const expenseRef = collection(db, 'expenses');
        const q = query(
            expenseRef,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }
};

// Portfolio Tracking Storage - Only stores latest state
export const savePortfolio = async (userId, portfolioData) => {
    try {
        const portfolioRef = doc(db, 'portfolios', userId);
        await setDoc(portfolioRef, {
            ...portfolioData,
            lastUpdated: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error saving portfolio:', error);
        return false;
    }
};

export const getPortfolio = async (userId) => {
    try {
        const portfolioRef = doc(db, 'portfolios', userId);
        const docSnap = await getDoc(portfolioRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return null;
    }
};

// Chat History Storage - DEPRECATED
// These functions are deprecated in favor of the implementations in chatHistory.js
// Keeping them here for reference but they should not be used
/*
export const saveChatHistory = async (userId, messages) => {
    try {
        const chatHistoryRef = collection(db, 'chatHistory');
        await addDoc(chatHistoryRef, {
            userId,
            messages,
            timestamp: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error saving chat history:', error);
        return false;
    }
};

export const getChatHistory = async (userId) => {
    try {
        const chatHistoryRef = collection(db, 'chatHistory');
        const q = query(
            chatHistoryRef,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
};
*/

// Tax Planning Storage
export const saveTaxPlan = async (userId, taxPlanData) => {
    try {
        const taxPlanRef = collection(db, 'taxPlans');
        await addDoc(taxPlanRef, {
            userId,
            ...taxPlanData,
            timestamp: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error saving tax plan:', error);
        return false;
    }
};

export const getTaxPlans = async (userId) => {
    try {
        const taxPlanRef = collection(db, 'taxPlans');
        const q = query(
            taxPlanRef,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching tax plans:', error);
        return [];
    }
};