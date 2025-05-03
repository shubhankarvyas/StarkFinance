import marketService from '../services/marketService.js';

class MarketController {
    async getMarketSentiment(req, res) {
        try {
            const sentimentData = await marketService.getMarketSentiment();
            res.json(sentimentData);
        } catch (error) {
            console.error('Error in getMarketSentiment controller:', error);
            res.status(500).json({ error: 'Failed to fetch market sentiment' });
        }
    }

    async getStockData(req, res) {
        try {
            const { symbol } = req.params;
            if (!symbol) {
                return res.status(400).json({
                    success: false,
                    error: 'Stock symbol is required'
                });
            }
            const stockData = await marketService.getStockData(symbol);
            res.json(stockData);
        } catch (error) {
            console.error('Error in getStockData controller:', error);
            res.status(error.message.includes('not available') ? 404 : 500).json({
                success: false,
                error: error.message || 'Failed to fetch stock data'
            });
        }
    }

    async getNews(req, res) {
        try {
            const newsData = await marketService.getNews();
            res.json(newsData);
        } catch (error) {
            console.error('Error in getNews controller:', error);
            res.status(500).json({ error: 'Failed to fetch news' });
        }
    }
}

export default new MarketController();