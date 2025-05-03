const calculatorController = {
    calculateCompoundInterest(req, res) {
        try {
            const { principal, rate, time, compoundingFrequency } = req.body;
            const r = rate / 100;
            const n = compoundingFrequency || 1;
            const t = time;
            const amount = principal * Math.pow(1 + r / n, n * t);
            const interest = amount - principal;

            res.json({
                principal: principal,
                totalAmount: amount.toFixed(2),
                interestEarned: interest.toFixed(2),
                annualRate: rate,
                timeInYears: time,
                compoundingFrequency: n
            });
        } catch (error) {
            res.status(400).json({ error: 'Invalid calculation parameters' });
        }
    },

    calculateLoan(req, res) {
        try {
            const { principal, rate, term, loanType } = req.body;
            const monthlyRate = (rate / 100) / 12;
            const numberOfPayments = term * 12;

            // Monthly payment calculation using the PMT formula
            const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)
                / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

            const totalPayment = monthlyPayment * numberOfPayments;
            const totalInterest = totalPayment - principal;

            res.json({
                loanAmount: principal,
                monthlyPayment: monthlyPayment.toFixed(2),
                totalPayment: totalPayment.toFixed(2),
                totalInterest: totalInterest.toFixed(2),
                annualRate: rate,
                termInYears: term,
                loanType: loanType
            });
        } catch (error) {
            res.status(400).json({ error: 'Invalid loan calculation parameters' });
        }
    },

    calculateRetirement(req, res) {
        try {
            const { currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn, inflationRate } = req.body;

            const yearsToRetirement = retirementAge - currentAge;
            const monthlyRate = (expectedReturn / 100) / 12;
            const totalMonths = yearsToRetirement * 12;

            // Future value calculation including monthly contributions
            let futureValue = currentSavings * Math.pow(1 + monthlyRate, totalMonths);
            const monthlyGrowth = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
            futureValue += monthlyGrowth;

            // Adjust for inflation
            const realValue = futureValue / Math.pow(1 + (inflationRate / 100), yearsToRetirement);

            res.json({
                futureValue: futureValue.toFixed(2),
                realValue: realValue.toFixed(2),
                yearsToRetirement,
                totalContributions: (monthlyContribution * totalMonths + currentSavings).toFixed(2),
                expectedReturn,
                inflationAdjusted: inflationRate
            });
        } catch (error) {
            res.status(400).json({ error: 'Invalid retirement calculation parameters' });
        }
    }
};

export default calculatorController;