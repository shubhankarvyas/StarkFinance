import axios from "axios";

// Service for fetching market sentiment, stock data, and news

class MarketService {
    async getMarketSentiment() {
        try {
            // Generate mock sentiment data since we're using Alpha Vantage
            const overallSentiment = Math.round(50 + Math.random() * 30);
            return {
                overallSentiment,
                trendDirection: overallSentiment > 65 ? 'up' : overallSentiment < 35 ? 'down' : 'flat',
                newsAnalysis: [
                    { title: 'Market Analysis Update', sentiment: 75, source: 'Financial Times', impact: 'high' },
                    { title: 'Economic Indicators Review', sentiment: 65, source: 'Bloomberg', impact: 'medium' },
                    { title: 'Global Market Trends', sentiment: 70, source: 'Reuters', impact: 'high' },
                    { title: 'Industry Sector Performance', sentiment: 60, source: 'WSJ', impact: 'medium' },
                    { title: 'Market Outlook Report', sentiment: 68, source: 'CNBC', impact: 'high' }
                ],
                socialMediaSentiment: Array.from({ length: 8 }, (_, i) => ({
                    time: `${9 + i}:00 AM`,
                    sentiment: Math.round(overallSentiment + (Math.random() * 20 - 10))
                })),
                topMentions: [
                    { symbol: 'AAPL', sentiment: 78, mentions: 1250 },
                    { symbol: 'TSLA', sentiment: 82, mentions: 980 },
                    { symbol: 'MSFT', sentiment: 75, mentions: 850 },
                    { symbol: 'GOOGL', sentiment: 70, mentions: 720 },
                    { symbol: 'AMZN', sentiment: 72, mentions: 690 }
                ]
            };
        } catch (error) {
            console.error("Error generating market sentiment:", error);
            return {
                overallSentiment: 65,
                trendDirection: 'up',
                newsAnalysis: [],
                socialMediaSentiment: [],
                topMentions: []
            };
        }
    }

    async getStockData(symbol) {
        try {
            if (!symbol) {
                throw new Error('Stock symbol is required');
            }

            // Generate mock OHLC data for the last 30 days
            const basePrices = {
                SPY: 520, QQQ: 440, DIA: 390, VIX: 15, AAPL: 190,
                MSFT: 420, GOOGL: 140, AMZN: 180, TSLA: 180, NFLX: 600,
                NVDA: 1200, META: 500, AMD: 160, PYPL: 70, INTC: 40,
                CRM: 300, ADBE: 500, CSCO: 50, ORCL: 120
            };

            const basePrice = basePrices[symbol];
            if (!basePrice) {
                throw new Error(`Stock data not available for symbol: ${symbol}`);
            }

            const now = new Date();
            const data = [];

            // Generate 30 days of OHLC data
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);

                // Generate realistic OHLC values with some randomness
                const volatility = basePrice * 0.02; // 2% volatility
                const open = basePrice + (Math.random() - 0.5) * volatility;
                const high = open + Math.random() * volatility;
                const low = open - Math.random() * volatility;
                const close = low + Math.random() * (high - low);
                const volume = Math.floor(1000000 + Math.random() * 5000000);

                data.push({
                    time: date.toISOString().split('T')[0],
                    open: parseFloat(open.toFixed(2)),
                    high: parseFloat(high.toFixed(2)),
                    low: parseFloat(low.toFixed(2)),
                    close: parseFloat(close.toFixed(2)),
                    volume: volume
                });
            }

            const lastPrice = data[data.length - 1].close;
            const previousClose = data[data.length - 2].close;
            const change = parseFloat((lastPrice - previousClose).toFixed(2));
            const changePercent = parseFloat(((change / previousClose) * 100).toFixed(2));

            return {
                success: true,
                data: {
                    symbol,
                    lastPrice,
                    change,
                    changePercent,
                    historicalData: data
                }
            };
        } catch (error) {
            console.error("Error generating mock stock data:", error);
            // Return mock data with a flat trend in case of error
            const mockData = Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                return {
                    time: date.toISOString().split('T')[0],
                    open: 100,
                    high: 102,
                    low: 98,
                    close: 100,
                    volume: 1000000
                };
            });

            return {
                symbol,
                data: mockData,
                lastPrice: 100,
                change: 0
            };
        }
    }

    async getNews() {
        try {
            const newsApiKey = process.env.VITE_NEWS_API_KEY;
            if (!newsApiKey) {
                throw new Error("NEWS_API_KEY is missing in environment variables.");
            }

            const response = await axios.get(
                `https://newsapi.org/v2/top-headlines?category=business&country=us&apiKey=${newsApiKey}`
            );

            return (response.data.articles || []).map(article => ({
                title: article.title,
                source: article.source?.name || 'Unknown',
                time: article.publishedAt || '',
                impact: 'neutral',
                category: article.category || 'Markets',
                snippet: article.description || '',
                trending: false
            }));
        } catch (error) {
            console.error("Error fetching news:", error?.response?.data || error.message);
            return [{
                title: 'Market News Temporarily Unavailable',
                source: 'System',
                time: new Date().toISOString(),
                impact: 'low',
                category: 'Markets',
                snippet: 'Unable to fetch market news at this time.',
                trending: false
            }];
        }
    }
}

export default new MarketService();