import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import EducationalHub from './components/EducationalHub';
import MarketSentimentAnalysis from './components/MarketSentimentAnalysis';
import FinancialCalculator from './components/FinancialCalculator';
import TaxPlanner from './components/TaxPlanner';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />
    },
    {
        path: '/education',
        element: <EducationalHub />
    },
    {
        path: '/market',
        element: <MarketSentimentAnalysis />
    },
    {
        path: '/tools',
        element: <FinancialCalculator />
    },
    {
        path: '/tax',
        element: <TaxPlanner />
    }
]);

export default router;