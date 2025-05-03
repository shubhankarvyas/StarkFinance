# StarkFinance Backend

This is the backend server for the StarkFinance application. It provides secure API endpoints for market data, news, and financial information.

## Features

- Secure API key management
- Rate limiting for API protection
- CORS configuration for frontend access
- Market data endpoints
- News data endpoints

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Add your API keys to `.env` file:
   - ALPHA_VANTAGE_API_KEY
   - NEWS_API_KEY

## Development

Run the development server:
```bash
npm run dev
```

## Production Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables from `.env`

## API Endpoints

- `GET /api/market/sentiment` - Get market sentiment data
- `GET /api/stock/:symbol` - Get stock data for a specific symbol
- `GET /api/news` - Get latest business news

## Frontend Integration

Update the frontend API service to use the backend endpoints:

1. Create a `.env` file in the frontend project
2. Add the backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:5001
   ```

3. Update API calls to use the backend URL instead of calling external APIs directly