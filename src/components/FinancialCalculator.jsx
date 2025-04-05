import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Grid,
    Box,
    TextField,
    Button,
    Tabs,
    Tab,
    Card,
    CardContent,
    Slider,
    useTheme,
    Alert,
    Tooltip,
    IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

const FinancialCalculator = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [sipData, setSipData] = useState({
        amount: '',
        years: 5,
        returnRate: 12,
        inflationRate: 6
    });
    const [emiData, setEmiData] = useState({
        loanAmount: '',
        interestRate: 8.5,
        tenure: 20,
        downPayment: ''
    });

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSipChange = (name) => (event) => {
        setSipData(prev => ({
            ...prev,
            [name]: event.target.value
        }));
    };

    const handleEmiChange = (name) => (event) => {
        setEmiData(prev => ({
            ...prev,
            [name]: event.target.value
        }));
    };

    // Custom slider marks for better visual guidance
    const yearMarks = [
        { value: 1, label: '1' },
        { value: 10, label: '10' },
        { value: 20, label: '20' },
        { value: 30, label: '30' }
    ];

    const returnRateMarks = [
        { value: 5, label: '5%' },
        { value: 10, label: '10%' },
        { value: 15, label: '15%' },
        { value: 20, label: '20%' }
    ];

    const interestRateMarks = [
        { value: 4, label: '4%' },
        { value: 8, label: '8%' },
        { value: 12, label: '12%' },
        { value: 16, label: '16%' },
        { value: 20, label: '20%' }
    ];

    const calculateSIP = () => {
        const monthlyInvestment = parseFloat(sipData.amount) || 0;
        const years = parseFloat(sipData.years) || 0;
        const returnRate = parseFloat(sipData.returnRate) || 0;
        const monthlyRate = returnRate / 12 / 100;
        const months = years * 12;

        const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const totalInvestment = monthlyInvestment * months;
        const totalReturns = futureValue - totalInvestment;

        return {
            futureValue,
            totalInvestment,
            totalReturns
        };
    };

    const calculateEMI = () => {
        const principal = parseFloat(emiData.loanAmount) || 0;
        const downPayment = parseFloat(emiData.downPayment) || 0;
        const loanAmount = principal - downPayment;
        const rate = (parseFloat(emiData.interestRate) || 0) / 12 / 100;
        const tenure = (parseFloat(emiData.tenure) || 0) * 12;

        const emi = loanAmount * rate * Math.pow(1 + rate, tenure) / (Math.pow(1 + rate, tenure) - 1);
        const totalPayment = emi * tenure;
        const totalInterest = totalPayment - loanAmount;

        return {
            emi,
            totalPayment,
            totalInterest,
            loanAmount
        };
    };

    const generateSipProjection = () => {
        const data = [];
        const monthlyInvestment = parseFloat(sipData.amount) || 0;
        const returnRate = parseFloat(sipData.returnRate) || 0;
        const monthlyRate = returnRate / 12 / 100;

        for (let year = 0; year <= sipData.years; year++) {
            const months = year * 12;
            const invested = monthlyInvestment * months;
            const value = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);

            data.push({
                year: `Year ${year}`,
                invested: Math.round(invested),
                value: Math.round(value)
            });
        }

        return data;
    };

    const generateEmiBreakdown = () => {
        const { emi, loanAmount } = calculateEMI();
        const rate = (parseFloat(emiData.interestRate) || 0) / 12 / 100;
        const data = [];
        let remainingPrincipal = loanAmount;

        for (let year = 0; year <= Math.min(5, emiData.tenure); year++) {
            const yearlyPrincipal = emi * 12 - (remainingPrincipal * rate * 12);
            const yearlyInterest = (emi * 12) - yearlyPrincipal;
            remainingPrincipal -= yearlyPrincipal;

            data.push({
                year: `Year ${year}`,
                principal: Math.round(yearlyPrincipal),
                interest: Math.round(yearlyInterest)
            });
        }

        return data;
    };

    const sipResults = calculateSIP();
    const emiResults = calculateEMI();

    // Common slider styles
    const sliderStyles = {
        '& .MuiSlider-thumb': {
            height: 24,
            width: 24,
            backgroundColor: '#fff',
            border: '2px solid currentColor',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)'
            },
            '&::after': {
                width: 8,
                height: 8,
                backgroundColor: 'currentColor',
                borderRadius: '50%'
            }
        },
        '& .MuiSlider-track': {
            height: 8,
            borderRadius: 4
        },
        '& .MuiSlider-rail': {
            height: 8,
            borderRadius: 4,
            opacity: 0.3,
            backgroundColor: '#bdbdbd'
        },
        '& .MuiSlider-mark': {
            backgroundColor: 'transparent'
        },
        '& .MuiSlider-markLabel': {
            fontSize: '0.75rem',
            fontWeight: '500',
            marginTop: '8px',
            color: theme.palette.text.secondary,
            '&.MuiSlider-markLabelActive': {
                color: theme.palette.text.primary
            }
        },
        '& .MuiSlider-valueLabel': {
            fontSize: '0.75rem',
            fontWeight: 'bold',
            background: 'transparent',
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            borderRadius: '8px',
            padding: '2px 8px',
            '&:before': {
                display: 'none'
            }
        }
    };

    return (
        <Paper elevation={3} sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                🧮 Financial Calculator
            </Typography>

            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ mb: 3 }}
                TabIndicatorProps={{
                    sx: { height: 3, borderRadius: '3px 3px 0 0' }
                }}
            >
                <Tab label="SIP Calculator" />
                <Tab label="EMI Calculator" />
            </Tabs>

            {activeTab === 0 ? (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    SIP Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Monthly Investment Amount"
                                            type="number"
                                            value={sipData.amount}
                                            onChange={handleSipChange('amount')}
                                            InputProps={{ startAdornment: '₹' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="500">Investment Period</Typography>
                                            <Typography variant="body1" fontWeight="bold" color="primary.main">
                                                {sipData.years} {sipData.years === 1 ? 'year' : 'years'}
                                            </Typography>
                                        </Box>
                                        <Slider
                                            value={sipData.years}
                                            onChange={(e, value) => setSipData(prev => ({ ...prev, years: value }))}
                                            min={1}
                                            max={30}
                                            marks={yearMarks}
                                            valueLabelDisplay="auto"
                                            valueLabelFormat={x => `${x} years`}
                                            sx={{
                                                ...sliderStyles,
                                                color: theme.palette.primary.main
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="500">Expected Return Rate</Typography>
                                            <Typography variant="body1" fontWeight="bold" color="success.main">
                                                {sipData.returnRate}%
                                            </Typography>
                                        </Box>
                                        <Slider
                                            value={sipData.returnRate}
                                            onChange={(e, value) => setSipData(prev => ({ ...prev, returnRate: value }))}
                                            min={1}
                                            max={30}
                                            step={0.5}
                                            marks={returnRateMarks}
                                            valueLabelDisplay="auto"
                                            valueLabelFormat={x => `${x}%`}
                                            sx={{
                                                ...sliderStyles,
                                                color: theme.palette.success.main,
                                                '& .MuiSlider-valueLabel': {
                                                    ...sliderStyles['& .MuiSlider-valueLabel'],
                                                    backgroundColor: theme.palette.success.main,
                                                },
                                                '& .MuiSlider-markLabel': {
                                                    ...sliderStyles['& .MuiSlider-markLabel'],
                                                    fontSize: '0.8rem',
                                                    mt: 1,
                                                },
                                                '& .MuiSlider-thumb:hover, & .MuiSlider-thumb.Mui-focusVisible': {
                                                    boxShadow: '0 0 0 8px rgba(76, 175, 80, 0.16)'
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        <Card sx={{ mt: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    SIP Results
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Total Investment
                                        </Typography>
                                        <Typography variant="h6">
                                            ₹{Math.round(sipResults.totalInvestment).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Expected Returns
                                        </Typography>
                                        <Typography variant="h6" color="success.main">
                                            ₹{Math.round(sipResults.totalReturns).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Future Value
                                        </Typography>
                                        <Typography variant="h6">
                                            ₹{Math.round(sipResults.futureValue).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Card sx={{
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <CardContent sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    EMI Breakdown
                                </Typography>
                                <Box sx={{
                                    height: { xs: 300, md: 400 },
                                    mt: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={generateEmiBreakdown()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="principal"
                                                name="Principal"
                                                stroke={theme.palette.primary.main}
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="interest"
                                                name="Interest"
                                                stroke={theme.palette.error.main}
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>

                        <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                            The projected values are based on assumed constant returns. Actual returns may vary based on market conditions.
                        </Alert>
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    Loan Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Loan Amount"
                                            type="number"
                                            value={emiData.loanAmount}
                                            onChange={handleEmiChange('loanAmount')}
                                            InputProps={{ startAdornment: '₹' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Down Payment (Optional)"
                                            type="number"
                                            value={emiData.downPayment}
                                            onChange={handleEmiChange('downPayment')}
                                            InputProps={{ startAdornment: '₹' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="500">Interest Rate</Typography>
                                            <Typography variant="body1" fontWeight="bold" color="error.main">
                                                {emiData.interestRate}%
                                            </Typography>
                                        </Box>
                                        <Slider
                                            value={emiData.interestRate}
                                            onChange={(e, value) => setEmiData(prev => ({ ...prev, interestRate: value }))}
                                            min={4}
                                            max={20}
                                            step={0.1}
                                            marks={interestRateMarks}
                                            valueLabelDisplay="auto"
                                            valueLabelFormat={x => `${x}%`}
                                            sx={{
                                                ...sliderStyles,
                                                color: theme.palette.error.main,
                                                '& .MuiSlider-valueLabel': {
                                                    ...sliderStyles['& .MuiSlider-valueLabel'],
                                                    backgroundColor: theme.palette.error.main,
                                                },
                                                '& .MuiSlider-thumb:hover, & .MuiSlider-thumb.Mui-focusVisible': {
                                                    boxShadow: '0 0 0 8px rgba(211, 47, 47, 0.16)'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="500">Loan Tenure</Typography>
                                            <Typography variant="body1" fontWeight="bold" color="primary.main">
                                                {emiData.tenure} {emiData.tenure === 1 ? 'year' : 'years'}
                                            </Typography>
                                        </Box>
                                        <Slider
                                            value={emiData.tenure}
                                            onChange={(e, value) => setEmiData(prev => ({ ...prev, tenure: value }))}
                                            min={1}
                                            max={30}
                                            marks={yearMarks}
                                            valueLabelDisplay="auto"
                                            valueLabelFormat={x => `${x} years`}
                                            sx={{
                                                ...sliderStyles,
                                                color: theme.palette.primary.main
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        <Card sx={{ mt: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    EMI Results
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Monthly EMI
                                        </Typography>
                                        <Typography variant="h6">
                                            ₹{Math.round(emiResults.emi).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Total Interest
                                        </Typography>
                                        <Typography variant="h6" color="error.main">
                                            ₹{Math.round(emiResults.totalInterest).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Total Payment
                                        </Typography>
                                        <Typography variant="h6">
                                            ₹{Math.round(emiResults.totalPayment).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    Payment Breakdown
                                </Typography>
                                <Box sx={{ height: 300, mt: 2 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={generateEmiBreakdown()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="principal"
                                                name="Principal"
                                                stroke={theme.palette.primary.main}
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="interest"
                                                name="Interest"
                                                stroke={theme.palette.error.main}
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>

                        <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                            EMI calculations are based on reducing balance method. Actual EMI may vary based on bank's terms and conditions.
                        </Alert>
                    </Grid>
                </Grid>
            )}
        </Paper>
    );
};

export default FinancialCalculator;