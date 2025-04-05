// API configuration for external services

export const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '';
export const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';

// API endpoints
export const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
export const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// API request configurations
export const STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NFLX', 'NVDA', 'META', 'AMD', 'PYPL', 'INTC', 'CRM', 'ADBE', 'CSCO', 'ORCL'];
export const NEWS_CATEGORY = 'business';
export const NEWS_COUNTRY = 'us';

// Update intervals (in milliseconds)
export const STOCK_UPDATE_INTERVAL = 60000; // 1 minute
export const NEWS_UPDATE_INTERVAL = 300000; // 5 minutes