import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
// Configure CORS for Vercel frontend
app.use(cors({
    origin: ['https://stark-finance.vercel.app', 'http://localhost:5001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 15 * 60 * 1000, // 15 minutes by default
    max: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) : 100 // default 100 requests per windowMs
});
app.use(limiter);

// Import routes
import marketRoutes from './routes/marketRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import educationRoutes from './routes/educationRoutes.js';

// API routes
app.get('/', (req, res) => {
    res.json({ message: 'StarkFinance API is running' });
});

// Add /api root endpoint handler
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the StarkFinance API!',
        availableEndpoints: [
            '/api/market/sentiment',
            '/api/market/stock/:symbol',
            '/api/market/news',
            '/api/ai/chat',
            '/api/ai/financial-advice',
            '/api/finance/expenses',
            '/api/finance/tax-calculation',
            '/api/finance/investment-recommendation',
            '/api/education/articles',
            '/api/education/courses',
            '/api/education/market-sentiment',
            '/api/education/market-trends'
        ]
    });
});

// Mount routes
app.use('/api/market', marketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/education', educationRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});