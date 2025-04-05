import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Slider,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    useTheme
} from '@mui/material';
import { saveTaxPlan, getTaxPlans } from '../services/firebaseStorage';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const FinancialQuestionnaire = ({ userId }) => {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        income: '',
        financialGoals: '',
        monthlyInvestment: '',
        riskTolerance: 50,
        investmentHorizon: 'medium',
        existingInvestments: '',
        debtAmount: ''
    });

    const [activeStep, setActiveStep] = useState(0);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const responseCache = useRef(new Map());
    const debounceTimeout = useRef(null);

    const validateStep = useCallback((step) => {
        const newErrors = {};

        switch (step) {
            case 0: // Personal Info
                if (!formData.name) newErrors.name = 'Name is required';
                if (!formData.age || formData.age <= 0) newErrors.age = 'Please enter a valid age';
                break;
            case 1: // Financial Status
                if (!formData.income || formData.income <= 0) newErrors.income = 'Please enter a valid income';
                if (!formData.monthlyInvestment || formData.monthlyInvestment < 0) {
                    newErrors.monthlyInvestment = 'Please enter a valid investment amount';
                }
                break;
            // Add validation for other steps if needed
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.age || formData.age <= 0) newErrors.age = 'Please enter a valid age';
        if (!formData.income || formData.income <= 0) newErrors.income = 'Please enter a valid income';
        if (!formData.monthlyInvestment || formData.monthlyInvestment < 0) {
            newErrors.monthlyInvestment = 'Please enter a valid investment amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const steps = ['Personal Info', 'Financial Status', 'Investment Preferences', 'Review'];

    // Load previous questionnaire data if available
    useEffect(() => {
        const loadPreviousData = async () => {
            if (userId) {
                const taxPlans = await getTaxPlans(userId);
                if (taxPlans.length > 0) {
                    const latestPlan = taxPlans[0];
                    setFormData(latestPlan.formData);
                    if (latestPlan.recommendations) {
                        setAiResponse(latestPlan.recommendations);
                        setSubmitted(true);
                    }
                }
            }
        };
        loadPreviousData();
    }, [userId]);

    const handleChange = useCallback((event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }, []);

    const handleSliderChange = useCallback((event, newValue) => {
        setFormData(prev => ({
            ...prev,
            riskTolerance: newValue
        }));
    }, []);

    const handleNext = useCallback(() => {
        if (validateStep(activeStep)) {
            setActiveStep(prev => prev + 1);
        }
    }, [validateStep, activeStep]);

    const handleBack = useCallback(() => {
        setActiveStep(prev => prev - 1);
    }, []);

    const generatePortfolioAllocation = useCallback(async (riskTolerance, data) => {
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const prompt = `As a financial advisor, analyze this investor profile and suggest an optimal portfolio allocation:

Risk Tolerance: ${riskTolerance}%
Age: ${data.age}
Monthly Investment: ${data.monthlyInvestment}
Investment Horizon: ${data.investmentHorizon}

Provide allocation percentages for:
1. Stocks
2. Bonds
3. Cash

Respond with only the three numbers in order, separated by commas.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const [stocks, bonds, cash] = response.text().split(',').map(num => parseInt(num.trim()));

            return [
                { name: 'Stocks', value: stocks },
                { name: 'Bonds', value: bonds },
                { name: 'Cash', value: cash }
            ];
        } catch (error) {
            console.error('Error generating portfolio allocation:', error);
            return [
                { name: 'Stocks', value: 60 },
                { name: 'Bonds', value: 30 },
                { name: 'Cash', value: 10 }
            ];
        }
    }, []);

    const generateRecommendations = useCallback(async (data) => {
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const prompt = `As a financial advisor, provide personalized investment recommendations based on this profile:

Age: ${data.age}
Monthly Income: ${data.income}
Monthly Investment: ${data.monthlyInvestment}
Risk Tolerance: ${data.riskTolerance}%
Investment Horizon: ${data.investmentHorizon}
Financial Goals: ${data.financialGoals}
Existing Investments: ${data.existingInvestments}
Debt Amount: ${data.debtAmount}

Provide 3-4 specific, actionable recommendations focusing on:
1. Investment strategy
2. Risk management
3. Goal alignment
4. Debt management (if applicable)

Keep each recommendation concise and practical.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().split('\n').filter(line => line.trim());
        } catch (error) {
            console.error('Error generating recommendations:', error);
            return ['Unable to generate personalized recommendations at this time. Please try again later.'];
        }
    }, []);

    const getAIRecommendations = useCallback(async (data) => {
        try {
            const cacheKey = JSON.stringify(data);
            if (responseCache.current.has(cacheKey)) {
                return responseCache.current.get(cacheKey);
            }

            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }

            if (!data.age || !data.income || !data.monthlyInvestment) {
                throw new Error('Required data is missing');
            }

            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const monthlyIncome = data.income / 12;
            const debtToIncomeRatio = (data.debtAmount / data.income) * 100;
            const savingsRate = (data.monthlyInvestment / monthlyIncome) * 100;
            const emergencyFundTarget = monthlyIncome * 6;

            const prompt = `You are a sophisticated financial advisor providing a focused and actionable financial plan. Based on this client's profile:

🔍 CLIENT PROFILE
- Age: ${data.age} years
- Annual Income: $${data.income.toLocaleString()}
- Monthly Investment: $${data.monthlyInvestment.toLocaleString()}
- Risk Tolerance: ${data.riskTolerance}%
- Investment Horizon: ${data.investmentHorizon}
- Existing Investments: $${data.existingInvestments || 0}
- Debt Amount: $${data.debtAmount || 0}

KEY METRICS
- Monthly Income: $${monthlyIncome.toLocaleString()}
- Debt-to-Income Ratio: ${debtToIncomeRatio.toFixed(1)}%
- Current Savings Rate: ${savingsRate.toFixed(1)}%
- Emergency Fund Target: $${emergencyFundTarget.toLocaleString()}

Provide a detailed analysis focusing on:
1. Overall Financial Health Assessment
2. Investment Strategy Recommendations
3. Risk Management Approach
4. Action Steps (30-day, 90-day, 1-year goals)

Format the response with clear sections and bullet points. Include specific numbers and timelines.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text();

            if (!responseText || responseText.trim() === '') {
                throw new Error('Empty response received');
            }

            debounceTimeout.current = setTimeout(() => {
                responseCache.current.set(cacheKey, responseText);
                if (responseCache.current.size > 50) {
                    const firstKey = responseCache.current.keys().next().value;
                    responseCache.current.delete(firstKey);
                }
            }, 500);

            return responseText;
        } catch (error) {
            console.error('AI Error:', error);
            throw error;
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;

        setAiLoading(true);

        try {
            const [aiRecommendations, recommendations, portfolioAllocation] = await Promise.all([
                getAIRecommendations(formData),
                generateRecommendations(formData),
                generatePortfolioAllocation(formData.riskTolerance, formData)
            ]);

            const sections = aiRecommendations
                .split('\n')
                .reduce((acc, line) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return acc;

                    const sectionMatch = trimmedLine.match(/^(\d+\.\s*[📊💰🎯📈🔮].+)$/);
                    if (sectionMatch) {
                        acc.push({ title: sectionMatch[1], content: [] });
                    } else if (acc.length > 0) {
                        acc[acc.length - 1].content.push(trimmedLine);
                    }
                    return acc;
                }, [])
                .map(({ title, content }) => ({
                    title,
                    content: content.join('\n')
                }));

            sections.push({
                title: '🎯 Personalized Recommendations',
                content: recommendations.join('\n')
            });

            setAiResponse(sections);
            setSubmitted(true);

            // Save questionnaire data and recommendations to Firebase
            if (userId) {
                await saveTaxPlan(userId, {
                    formData,
                    recommendations: sections,
                    portfolioAllocation: await generatePortfolioAllocation(formData.riskTolerance, formData)
                });
            }
        } catch (error) {
            console.error('Submission Error:', error);
            setAiResponse([{
                title: 'Error',
                content: error.message || 'Unable to generate recommendations. Please try again.'
            }]);
        } finally {
            setAiLoading(false);
        }
    }, [formData, validateForm, generateRecommendations, generatePortfolioAllocation, getAIRecommendations]);

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ mt: 4 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Age"
                                    name="age"
                                    type="number"
                                    value={formData.age}
                                    onChange={handleChange}
                                    error={!!errors.age}
                                    helperText={errors.age}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Annual Income"
                                    name="income"
                                    type="number"
                                    value={formData.income}
                                    onChange={handleChange}
                                    error={!!errors.income}
                                    helperText={errors.income}
                                    required
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ mt: 4 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Monthly Investment Capacity"
                                    name="monthlyInvestment"
                                    type="number"
                                    value={formData.monthlyInvestment}
                                    onChange={handleChange}
                                    error={!!errors.monthlyInvestment}
                                    helperText={errors.monthlyInvestment}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Existing Investments"
                                    name="existingInvestments"
                                    type="number"
                                    value={formData.existingInvestments}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Outstanding Debt"
                                    name="debtAmount"
                                    type="number"
                                    value={formData.debtAmount}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ mt: 4 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography gutterBottom>Risk Tolerance</Typography>
                                <Slider
                                    value={formData.riskTolerance}
                                    onChange={handleSliderChange}
                                    valueLabelDisplay="auto"
                                    marks
                                    step={10}
                                    min={0}
                                    max={100}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Investment Horizon</FormLabel>
                                    <RadioGroup
                                        name="investmentHorizon"
                                        value={formData.investmentHorizon}
                                        onChange={handleChange}
                                    >
                                        <FormControlLabel value="short" control={<Radio />} label="Short Term (1-3 years)" />
                                        <FormControlLabel value="medium" control={<Radio />} label="Medium Term (3-7 years)" />
                                        <FormControlLabel value="long" control={<Radio />} label="Long Term (7+ years)" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Financial Goals"
                                    name="financialGoals"
                                    multiline
                                    rows={4}
                                    value={formData.financialGoals}
                                    onChange={handleChange}
                                    placeholder="Describe your financial goals and objectives..."
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 3:
                return (
                    <Box sx={{ mt: 4 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Review Your Information
                                </Typography>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Personal Information
                                        </Typography>
                                        <Typography>Name: {formData.name}</Typography>
                                        <Typography>Age: {formData.age}</Typography>
                                        <Typography>Annual Income: ${formData.income}</Typography>
                                    </CardContent>
                                </Card>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Financial Status
                                        </Typography>
                                        <Typography>Monthly Investment: ${formData.monthlyInvestment}</Typography>
                                        <Typography>Existing Investments: ${formData.existingInvestments || 0}</Typography>
                                        <Typography>Outstanding Debt: ${formData.debtAmount || 0}</Typography>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Investment Preferences
                                        </Typography>
                                        <Typography>Risk Tolerance: {formData.riskTolerance}%</Typography>
                                        <Typography>Investment Horizon: {formData.investmentHorizon}</Typography>
                                        <Typography>Financial Goals: {formData.financialGoals}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                );

            default:
                return null;
        }
    };

    const renderAIResponse = () => {
        if (!aiResponse || !Array.isArray(aiResponse)) return null;

        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

        return (
            <Box sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                    {aiResponse.map((section, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {section.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {section.content}
                                    </Typography>
                                    {section.title.includes('Investment Strategy') && (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={portfolioAllocation}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    label
                                                >
                                                    {portfolioAllocation.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    return (
        <Paper elevation={3} sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    📋 Financial Profile Builder
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Let's create your personalized financial profile to get tailored recommendations.
                </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    variant="outlined"
                    sx={{ mr: 1 }}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={aiLoading}
                >
                    {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                    {aiLoading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                </Button>
            </Box>

            {submitted && aiResponse && (
                <Box sx={{ mt: 4 }}>
                    {aiResponse.map((section, index) => (
                        <Card key={index} sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {section.title}
                                </Typography>
                                <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
                                    {section.content}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Paper>
    );
};

export default FinancialQuestionnaire;