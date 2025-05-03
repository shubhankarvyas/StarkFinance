import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Educational content endpoints
router.get('/articles', async (req, res) => {
    try {
        // Here you would typically fetch from a database or CMS
        const articles = [
            {
                id: 1,
                title: 'Understanding Stock Market Basics',
                content: 'Introduction to stock market investing...',
                category: 'Investing'
            },
            // Add more articles
        ];
        res.json({ articles });
    } catch (error) {
        console.error('Articles Fetching Error:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

router.get('/courses', async (req, res) => {
    try {
        const courses = [
            {
                id: 1,
                title: 'Financial Planning 101',
                description: 'Learn the basics of financial planning',
                modules: ['Budgeting', 'Saving', 'Investing']
            },
            // Add more courses
        ];
        res.json({ courses });
    } catch (error) {
        console.error('Courses Fetching Error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Market analysis endpoints
router.get('/market-sentiment', async (req, res) => {
    try {
        const sentiment = {
            overallSentiment: 65,
            trendDirection: 'up',
            newsAnalysis: [],
            socialMediaSentiment: [],
            topMentions: []
        };
        res.json(sentiment);
    } catch (error) {
        console.error('Market Sentiment Error:', error);
        res.status(500).json({ error: 'Failed to fetch market sentiment' });
    }
});

router.get('/market-trends', async (req, res) => {
    try {
        const trends = {
            trends: [],
            analysis: 'Market showing positive momentum',
            recommendations: ['Consider defensive stocks', 'Monitor interest rates']
        };
        res.json(trends);
    } catch (error) {
        console.error('Market Trends Error:', error);
        res.status(500).json({ error: 'Failed to fetch market trends' });
    }
});

export default router;