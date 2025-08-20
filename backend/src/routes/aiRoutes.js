import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Assistant endpoint
router.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

        const context = messages
            .map(msg => `${msg.type}: ${msg.content}`)
            .join('\n');

        const prompt = `You are a helpful AI assistant. Based on this conversation:\n${context}\n\nProvide a concise and helpful response.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        res.json({ response: response.text() });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});

// Financial advice endpoint
router.post('/financial-advice', async (req, res) => {
    try {
        const { query, financialContext } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

        const prompt = `As a financial advisor, provide advice for this query:\n\nContext: ${financialContext}\nQuery: ${query}\n\nProvide specific, actionable recommendations.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        res.json({ advice: response.text() });
    } catch (error) {
        console.error('Financial Advice Error:', error);
        res.status(500).json({ error: 'Failed to generate financial advice' });
    }
});

export default router;