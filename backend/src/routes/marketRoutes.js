import express from 'express';
import marketController from '../controllers/marketController.js';

const router = express.Router();

// Market sentiment endpoint
router.get('/sentiment', marketController.getMarketSentiment);

// Stock data endpoint
router.get('/stock/:symbol', marketController.getStockData);

// News endpoint
router.get('/news', marketController.getNews);

export default router;