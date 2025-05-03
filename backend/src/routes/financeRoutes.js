import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Expense tracking endpoints
router.post('/expenses', async (req, res) => {
    try {
        const { category, amount, description, date } = req.body;
        // Here you would typically save to a database
        res.json({ message: 'Expense saved successfully' });
    } catch (error) {
        console.error('Expense Tracking Error:', error);
        res.status(500).json({ error: 'Failed to save expense' });
    }
});

router.get('/expenses', async (req, res) => {
    try {
        // Here you would typically fetch from a database
        res.json({ expenses: [] });
    } catch (error) {
        console.error('Expense Fetching Error:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Tax planning endpoints
router.post('/tax-calculation', async (req, res) => {
    try {
        const { income, deductions } = req.body;
        // Implement tax calculation logic here
        const taxableIncome = income - (deductions.total || 0);
        const estimatedTax = calculateTax(taxableIncome);
        res.json({ taxableIncome, estimatedTax });
    } catch (error) {
        console.error('Tax Calculation Error:', error);
        res.status(500).json({ error: 'Failed to calculate tax' });
    }
});

// Financial planning endpoints
router.post('/investment-recommendation', async (req, res) => {
    try {
        const { riskTolerance, investmentGoals, timeHorizon } = req.body;
        // Implement investment recommendation logic here
        const recommendations = generateRecommendations(riskTolerance, investmentGoals, timeHorizon);
        res.json({ recommendations });
    } catch (error) {
        console.error('Investment Recommendation Error:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

// Helper functions
function calculateTax(taxableIncome) {
    // Implement tax calculation logic based on tax slabs
    let tax = 0;
    if (taxableIncome <= 250000) {
        tax = 0;
    } else if (taxableIncome <= 500000) {
        tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 750000) {
        tax = 12500 + (taxableIncome - 500000) * 0.10;
    } else if (taxableIncome <= 1000000) {
        tax = 37500 + (taxableIncome - 750000) * 0.15;
    } else if (taxableIncome <= 1250000) {
        tax = 75000 + (taxableIncome - 1000000) * 0.20;
    } else if (taxableIncome <= 1500000) {
        tax = 125000 + (taxableIncome - 1250000) * 0.25;
    } else {
        tax = 187500 + (taxableIncome - 1500000) * 0.30;
    }
    return tax;
}

function generateRecommendations(riskTolerance, goals, timeHorizon) {
    // Implement recommendation logic based on user profile
    const recommendations = {
        assetAllocation: {
            stocks: riskTolerance > 7 ? 70 : 50,
            bonds: riskTolerance > 7 ? 20 : 40,
            cash: 10
        },
        suggestions: [
            'Consider diversifying your portfolio across multiple asset classes',
            'Regular review and rebalancing of your portfolio is recommended',
            'Maintain an emergency fund of 3-6 months of expenses'
        ]
    };
    return recommendations;
}

export default router;