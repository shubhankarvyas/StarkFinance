import {
  NEWS_API_KEY,
  NEWS_API_BASE_URL,
  STOCK_SYMBOLS,
  NEWS_CATEGORY,
  NEWS_COUNTRY
} from '../config/api';

// Get the backend URL dynamically from environment variables
const backendUrl = import.meta.env.VITE_BACKEND_URL;  // Get the URL based on the environment

// Fetch market sentiment data
export const fetchMarketSentiment = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/market/sentiment`);
    if (!response.ok) throw new Error("Failed to fetch market sentiment");
    return await response.json();
  } catch (error) {
    console.error("Error fetching market sentiment:", error);
    return null;
  }
};

// Fetch stock data for a specific symbol
export const fetchStockData = async (symbol) => {
  try {
    // Fetch from backend API, which now uses Yahoo Finance
    const response = await fetch(`${backendUrl}/api/market/stock/${symbol}`);
    const data = await response.json();
    if (data.error) {
      console.error("Backend API error:", data.error);
      throw new Error(data.error);
    }
    // Format data for frontend compatibility
    return {
      symbol: data.symbol,
      currentPrice: data.price?.toFixed(2) ?? '0.00',
      priceChange: data.change?.toFixed(2) ?? '0.00',
      percentChange: data.change?.toFixed(2) ?? '0.00',
      data: data.data || [], // Use the data array directly from backend
      price: data.price ?? 0,
      change: data.change ?? 0
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return createMockStockData(symbol);
  }
};

// Function to create mock stock data when API fails
function createMockStockData(symbol) {
  console.log(`Creating mock data for ${symbol}...`);

  const now = new Date();
  const formattedData = [];

  // Generate 24 hours of mock hourly data
  for (let i = 0; i < 100; i++) {
    const time = new Date(now);
    time.setHours(time.getHours() - (100 - i));

    // Base price that varies by symbol to make different stocks look different
    const symbolValue = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const basePrice = 100 + (symbolValue % 400);

    // Daily sine wave pattern with some randomness
    const hoursOffset = i % 24;
    const baseSine = Math.sin((hoursOffset / 24) * Math.PI * 2);
    const priceOffset = baseSine * 5 + (Math.random() * 2 - 1);

    const close = basePrice + priceOffset;
    const open = close - (Math.random() * 1 - 0.5);
    const high = Math.max(open, close) + (Math.random() * 0.5);
    const low = Math.min(open, close) - (Math.random() * 0.5);
    const volume = Math.floor(100000 + Math.random() * 900000);

    formattedData.push({
      time: time.getTime(),
      open,
      high,
      low,
      close,
      volume
    });
  }

  // Calculate moving averages
  const ma20 = calculateMovingAverage(20, formattedData);
  const ma50 = calculateMovingAverage(50, formattedData);

  // Get current price info from latest data point
  const latestData = formattedData[formattedData.length - 1];
  const previousData = formattedData[formattedData.length - 2];

  const currentPrice = latestData.close;
  const previousClose = previousData.close;
  const priceChange = currentPrice - previousClose;
  const percentChange = (priceChange / previousClose) * 100;

  return {
    symbol,
    currentPrice: currentPrice.toFixed(2),
    priceChange: priceChange.toFixed(2),
    percentChange: percentChange.toFixed(2),
    data: {
      ohlc: formattedData,
      volume: formattedData,
      ma20,
      ma50
    }
  };
}

// Calculate moving average helper function
function calculateMovingAverage(period, data) {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({
        time: data[i].time,
        value: null
      });
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }

    result.push({
      time: data[i].time,
      value: parseFloat((sum / period).toFixed(2))
    });
  }

  return result;
}

// Fetch all stock data
export const fetchAllStocks = async () => {
  try {
    const symbols = STOCK_SYMBOLS;
    const promises = symbols.map(symbol => fetchStockData(symbol));

    // Handle individual failures without failing the entire batch
    const results = await Promise.allSettled(promises);

    return results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);
  } catch (error) {
    console.error("Error fetching all stocks:", error);
    return [];
  }
};

// Fetch news data
export const fetchNews = async () => {
  try {
    const url = `${NEWS_API_BASE_URL}/top-headlines?country=${NEWS_COUNTRY}&category=${NEWS_CATEGORY}&apiKey=${NEWS_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};

// Fetch market trends data
export const fetchMarketTrends = async (symbol = 'AAPL') => {
  try {
    return await fetchStockData(symbol);
  } catch (error) {
    console.error('Error fetching market trends for symbol:', symbol, error);
    return null;
  }
};
