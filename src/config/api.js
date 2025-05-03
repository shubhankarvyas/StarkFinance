// API configuration for external services

export const TWELVE_DATA_API_KEY = 'c2094890fd204aae97d190f35a94e095';
export const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';

// API endpoints
export const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com';
export const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// API request configurations
export const STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NFLX', 'NVDA', 'META', 'AMD', 'PYPL', 'INTC', 'CRM', 'ADBE', 'CSCO', 'ORCL'];
export const NEWS_CATEGORY = 'business';
export const NEWS_COUNTRY = 'us';

// Update intervals (in milliseconds)
export const STOCK_UPDATE_INTERVAL = 60000; // 1 minute
export const NEWS_UPDATE_INTERVAL = 300000; // 5 minutes