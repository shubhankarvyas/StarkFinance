import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const aiController = {
    async chat(req, res) {
        try {
            const { message } = req.body;
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const prompt = `You are a helpful financial advisor. Please respond to: ${message}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;

            res.json({
                reply: response.text(),
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to process chat request' });
        }
    },

    async analyzeInvestment(req, res) {
        try {
            const { investment_type, amount, timeframe, risk_tolerance } = req.body;
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const prompt = `As an investment analysis expert, analyze this investment opportunity:\n\nType: ${investment_type}\nAmount: $${amount}\nTimeframe: ${timeframe}\nRisk Tolerance: ${risk_tolerance}\n\nProvide a detailed analysis including potential risks and rewards.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;

            res.json({
                analysis: response.text(),
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to analyze investment' });
        }
    },
};

export default aiController;