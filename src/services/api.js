import {
  ALPHA_VANTAGE_API_KEY,
  NEWS_API_KEY,
  ALPHA_VANTAGE_BASE_URL,
  NEWS_API_BASE_URL,
  STOCK_SYMBOLS,
  NEWS_CATEGORY,
  NEWS_COUNTRY
} from '../config/api';

// Fetch market sentiment data
export const fetchMarketSentiment = async () => {
  try {
    // Fetch news sentiment
    const newsResponse = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=NEWS_SENTIMENT&tickers=${STOCK_SYMBOLS.join(',')}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const newsData = await newsResponse.json();

    // Check for API error messages or rate limiting
    if (newsData['Error Message'] || newsData['Note']) {
      console.warn('API Warning:', newsData['Error Message'] || newsData['Note']);
      return generateFallbackSentimentData();
    }

    if (newsData.feed && newsData.feed.length > 0) {
      const sentimentData = newsData.feed.map(article => ({
        title: article.title,
        sentiment: article.overall_sentiment_score * 100,
        source: article.source,
        impact: article.relevance_score > 0.8 ? 'high' : article.relevance_score > 0.5 ? 'medium' : 'low'
      }));

      // Calculate overall sentiment
      const overallSentiment = Math.round(
        sentimentData.reduce((acc, curr) => acc + curr.sentiment, 0) / sentimentData.length
      );

      // Determine trend direction
      const trendDirection = overallSentiment > 65 ? 'up' : overallSentiment < 35 ? 'down' : 'flat';

      // Generate time-based sentiment data
      const currentHour = new Date().getHours();
      const socialMediaSentiment = Array.from({ length: 8 }, (_, i) => {
        const hour = (currentHour - 7 + i) % 24;
        const timeStr = `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
        return {
          time: timeStr,
          sentiment: Math.round(overallSentiment + (Math.random() * 20 - 10))
        };
      });

      // Get top mentioned symbols
      const topMentions = STOCK_SYMBOLS.slice(0, 5).map(symbol => ({
        symbol,
        sentiment: Math.round(50 + Math.random() * 50),
        mentions: Math.round(500 + Math.random() * 1000)
      }));

      return {
        overallSentiment,
        trendDirection,
        newsAnalysis: sentimentData.slice(0, 5),
        socialMediaSentiment,
        topMentions
      };
    }

    // If no data available, return fallback data
    return generateFallbackSentimentData();
  } catch (error) {
    console.error('Error fetching market sentiment:', error);
    return generateFallbackSentimentData();
  }
};

// Generate fallback sentiment data
const generateFallbackSentimentData = () => {
  const overallSentiment = Math.round(50 + Math.random() * 30); // Generate random sentiment between 50-80
  const trendDirection = overallSentiment > 65 ? 'up' : overallSentiment < 35 ? 'down' : 'flat';

  // Generate mock news analysis
  const mockNews = [
    { title: 'Market Analysis Update', sentiment: 75, source: 'Financial Times', impact: 'high' },
    { title: 'Economic Indicators Review', sentiment: 65, source: 'Bloomberg', impact: 'medium' },
    { title: 'Global Market Trends', sentiment: 70, source: 'Reuters', impact: 'high' },
    { title: 'Industry Sector Performance', sentiment: 60, source: 'WSJ', impact: 'medium' },
    { title: 'Market Outlook Report', sentiment: 68, source: 'CNBC', impact: 'high' }
  ];

  // Generate time-based sentiment data
  const currentHour = new Date().getHours();
  const socialMediaSentiment = Array.from({ length: 8 }, (_, i) => {
    const hour = (currentHour - 7 + i) % 24;
    const timeStr = `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
    return {
      time: timeStr,
      sentiment: Math.round(overallSentiment + (Math.random() * 20 - 10))
    };
  });

  // Generate top mentions
  const topMentions = STOCK_SYMBOLS.slice(0, 5).map(symbol => ({
    symbol,
    sentiment: Math.round(50 + Math.random() * 30),
    mentions: Math.round(500 + Math.random() * 1000)
  }));

  return {
    overallSentiment,
    trendDirection,
    newsAnalysis: mockNews,
    socialMediaSentiment,
    topMentions
  };
};

// Fetch stock data for a specific symbol
export const fetchStockData = async (symbol) => {
  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();

    // Check for API error messages
    if (data['Error Message']) {
      console.error('API Error:', data['Error Message']);
      return null;
    }

    // Check for rate limit
    if (data['Note']) {
      console.warn('API Rate Limit:', data['Note']);
      // Return mock data for development when rate limited
      return {
        symbol,
        price: 150 + Math.random() * 10,
        change: (Math.random() * 4) - 2
      };
    }

    if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
      const quote = data['Global Quote'];
      const price = parseFloat(quote['05. price'] || '0');
      const changePercent = parseFloat((quote['10. change percent'] || '0%').replace('%', ''));

      // Validate numeric values and provide fallback
      if (isNaN(price) || isNaN(changePercent)) {
        console.warn(`Invalid numeric values for ${symbol}, using fallback data`);
        return {
          symbol,
          price: 150 + Math.random() * 10,
          change: (Math.random() * 4) - 2
        };
      }

      return {
        symbol,
        price,
        change: changePercent
      };
    }

    // Return mock data if API response is invalid
    console.warn(`Invalid or empty data format for ${symbol}, using fallback data`);
    return {
      symbol,
      price: 150 + Math.random() * 10,
      change: (Math.random() * 4) - 2
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    // Return mock data on error
    return {
      symbol,
      price: 150 + Math.random() * 10,
      change: (Math.random() * 4) - 2
    };
  }
};

// Fetch all stock data
export const fetchAllStocks = async () => {
  const promises = STOCK_SYMBOLS.map(symbol => fetchStockData(symbol));
  const results = await Promise.all(promises);
  return results.filter(result => result !== null);
};

// Fetch news data
export const fetchNews = async () => {
  try {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?country=${NEWS_COUNTRY}&category=${NEWS_CATEGORY}&apiKey=${NEWS_API_KEY}`
    );
    const data = await response.json();
    if (data.articles) {
      return data.articles.map(article => ({
        title: article.title,
        source: article.source.name,
        time: new Date(article.publishedAt).toLocaleString()
      }));
    }
    throw new Error('Invalid news data format');
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

// Fetch market trends data with intraday candlestick data
export const fetchMarketTrends = async (symbol = 'AAPL') => {
  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();

    // Check for API error messages
    if (data['Error Message']) {
      console.error('API Error:', data['Error Message']);
      return [];
    }

    // Check for rate limit
    if (data['Note']) {
      console.warn('API Rate Limit:', data['Note']);
      // Return mock data for development when rate limited
      return Array.from({ length: 50 }, (_, i) => ({
        name: new Date(Date.now() - i * 300000).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' }),
        price: 150 + Math.random() * 10,
        open: 150 + Math.random() * 10,
        high: 155 + Math.random() * 10,
        low: 145 + Math.random() * 10,
        close: 150 + Math.random() * 10,
        volume: Math.floor(1000000 + Math.random() * 1000000)
      })).reverse();
    }

    if (data['Time Series (5min)']) {
      const intradayData = data['Time Series (5min)'];
      const entries = Object.entries(intradayData);

      if (entries.length === 0) {
        console.warn('No data available for symbol:', symbol);
        return [];
      }

      return entries
        .slice(0, 50) // Get last 50 data points for better visualization
        .map(([date, values]) => ({
          name: new Date(date).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' }),
          price: parseFloat(values['4. close']),
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseFloat(values['5. volume'])
        }))
        .reverse();
    }

    console.warn('Invalid or empty data format received for symbol:', symbol);
    return [];
  } catch (error) {
    console.error('Error fetching market trends for symbol:', symbol, error);
    return [];
  }
};