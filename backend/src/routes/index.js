import express from 'express';
import marketController from '../controllers/marketController.js';
import aiController from '../controllers/aiController.js';
import calculatorController from '../controllers/calculatorController.js';
import taxController from '../controllers/taxController.js';
import educationController from '../controllers/educationController.js';

const router = express.Router();

// Market Data Routes
router.get('/market/sentiment', marketController.getMarketSentiment);
router.get('/market/stock/:symbol', marketController.getStockData);
router.get('/market/news', marketController.getNews);

// AI Assistant Routes
router.post('/ai/chat', aiController.chat);
router.post('/ai/analyze', aiController.analyzeInvestment);

// Financial Calculator Routes
router.post('/calculator/compound-interest', calculatorController.calculateCompoundInterest);
router.post('/calculator/loan', calculatorController.calculateLoan);
router.post('/calculator/retirement', calculatorController.calculateRetirement);

// Tax Planning Routes
router.post('/tax/estimate', taxController.estimateTax);
router.post('/tax/deductions', taxController.calculateDeductions);
router.get('/tax/brackets', taxController.getTaxBrackets);

// Educational Content Routes
router.get('/education/topics', educationController.getTopics);
router.get('/education/article/:id', educationController.getArticle);
router.get('/education/courses', educationController.getCourses);

export default router;