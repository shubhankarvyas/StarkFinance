const taxController = {
    // 2023 US Tax Brackets (example data)
    taxBrackets: {
        single: [
            { rate: 10, limit: 11000 },
            { rate: 12, limit: 44725 },
            { rate: 22, limit: 95375 },
            { rate: 24, limit: 182100 },
            { rate: 32, limit: 231250 },
            { rate: 35, limit: 578125 },
            { rate: 37, limit: Infinity }
        ],
        married: [
            { rate: 10, limit: 22000 },
            { rate: 12, limit: 89450 },
            { rate: 22, limit: 190750 },
            { rate: 24, limit: 364200 },
            { rate: 32, limit: 462500 },
            { rate: 35, limit: 693750 },
            { rate: 37, limit: Infinity }
        ]
    },

    estimateTax(req, res) {
        try {
            const { income, filingStatus, deductions = 0 } = req.body;
            const taxableIncome = Math.max(income - deductions, 0);
            const brackets = this.taxBrackets[filingStatus.toLowerCase()] || this.taxBrackets.single;

            let totalTax = 0;
            let remainingIncome = taxableIncome;
            let previousLimit = 0;

            for (const bracket of brackets) {
                const taxableInBracket = Math.min(remainingIncome, bracket.limit - previousLimit);
                if (taxableInBracket <= 0) break;

                totalTax += (taxableInBracket * bracket.rate) / 100;
                remainingIncome -= taxableInBracket;
                previousLimit = bracket.limit;
            }

            res.json({
                grossIncome: income,
                taxableIncome,
                totalTax: totalTax.toFixed(2),
                effectiveRate: ((totalTax / income) * 100).toFixed(2),
                takeHomePay: (income - totalTax).toFixed(2)
            });
        } catch (error) {
            res.status(400).json({ error: 'Invalid tax calculation parameters' });
        }
    },

    calculateDeductions(req, res) {
        try {
            const {
                mortgageInterest = 0,
                propertyTax = 0,
                charitableContributions = 0,
                studentLoanInterest = 0,
                retirementContributions = 0,
                healthcareCosts = 0
            } = req.body;

            const itemizedDeductions = {
                mortgageInterest,
                propertyTax: Math.min(propertyTax, 10000), // SALT cap
                charitableContributions,
                studentLoanInterest: Math.min(studentLoanInterest, 2500), // Student loan interest cap
                healthcareCosts: Math.max(healthcareCosts - (req.body.agi * 0.075), 0) // 7.5% AGI threshold
            };

            const totalItemized = Object.values(itemizedDeductions).reduce((sum, val) => sum + val, 0);
            const standardDeduction = req.body.filingStatus === 'married' ? 27700 : 13850; // 2023 values

            res.json({
                itemizedDeductions,
                totalItemized: totalItemized.toFixed(2),
                standardDeduction,
                recommendedDeduction: Math.max(totalItemized, standardDeduction),
                retirementContributions
            });
        } catch (error) {
            res.status(400).json({ error: 'Invalid deduction calculation parameters' });
        }
    },

    getTaxBrackets(req, res) {
        try {
            const { filingStatus = 'single' } = req.query;
            res.json(this.taxBrackets[filingStatus.toLowerCase()] || this.taxBrackets.single);
        } catch (error) {
            res.status(400).json({ error: 'Invalid filing status' });
        }
    }
};

export default taxController;