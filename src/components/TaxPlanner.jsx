import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Grid,
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useTheme,
    Card,
    CardContent,
    Tooltip,
    IconButton,
    Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TaxPlanner = () => {
    const theme = useTheme();
    const [income, setIncome] = useState('');
    const [deductions, setDeductions] = useState({
        section80C: '',
        section80D: '',
        section80G: '',
        hra: '',
        lta: '',
        nps: ''
    });

    const taxSlabs = [
        { range: '₹0 - ₹2.5L', rate: '0%' },
        { range: '₹2.5L - ₹5L', rate: '5%' },
        { range: '₹5L - ₹7.5L', rate: '10%' },
        { range: '₹7.5L - ₹10L', rate: '15%' },
        { range: '₹10L - ₹12.5L', rate: '20%' },
        { range: '₹12.5L - ₹15L', rate: '25%' },
        { range: 'Above ₹15L', rate: '30%' }
    ];

    const taxSavingInvestments = [
        {
            name: 'ELSS Mutual Funds',
            description: 'Equity Linked Saving Scheme with 3-year lock-in period',
            maxLimit: 150000,
            section: '80C'
        },
        {
            name: 'PPF',
            description: 'Public Provident Fund with 15-year tenure',
            maxLimit: 150000,
            section: '80C'
        },
        {
            name: 'NPS',
            description: 'National Pension System',
            maxLimit: 50000,
            section: '80CCD(1B)'
        },
        {
            name: 'Health Insurance',
            description: 'Medical insurance premium',
            maxLimit: 25000,
            section: '80D'
        },
        {
            name: 'Home Loan',
            description: 'Interest paid on home loan',
            maxLimit: 200000,
            section: '24(b)'
        }
    ];

    const handleIncomeChange = (event) => {
        setIncome(event.target.value);
    };

    const handleDeductionChange = (name) => (event) => {
        setDeductions(prev => ({
            ...prev,
            [name]: event.target.value
        }));
    };

    const calculateTotalDeductions = () => {
        return Object.values(deductions).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    };

    const calculateTaxableIncome = () => {
        const totalIncome = parseFloat(income) || 0;
        const totalDeductions = calculateTotalDeductions();
        return Math.max(totalIncome - totalDeductions, 0);
    };

    const calculateTax = () => {
        const taxableIncome = calculateTaxableIncome();
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
    };

    const getTaxSavings = () => {
        const taxWithoutDeductions = calculateTax();
        const taxWithDeductions = calculateTax() - (calculateTotalDeductions() * 0.3);
        return Math.max(taxWithoutDeductions - taxWithDeductions, 0);
    };

    const getDeductionsData = () => {
        return Object.entries(deductions)
            .filter(([_, value]) => parseFloat(value) > 0)
            .map(([key, value]) => ({
                name: key,
                value: parseFloat(value)
            }));
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
                📊 Tax Planning & Savings Calculator
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Income Details
                            </Typography>
                            <TextField
                                fullWidth
                                label="Annual Income"
                                type="number"
                                value={income}
                                onChange={handleIncomeChange}
                                sx={{ mb: 2 }}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Section 80C Investments"
                                        type="number"
                                        value={deductions.section80C}
                                        onChange={handleDeductionChange('section80C')}
                                        helperText="ELSS, PPF, EPF, etc."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Section 80D (Health Insurance)"
                                        type="number"
                                        value={deductions.section80D}
                                        onChange={handleDeductionChange('section80D')}
                                        helperText="Medical Insurance Premium"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="HRA Exemption"
                                        type="number"
                                        value={deductions.hra}
                                        onChange={handleDeductionChange('hra')}
                                        helperText="House Rent Allowance"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="LTA"
                                        type="number"
                                        value={deductions.lta}
                                        onChange={handleDeductionChange('lta')}
                                        helperText="Leave Travel Allowance"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="NPS Investment"
                                        type="number"
                                        value={deductions.nps}
                                        onChange={handleDeductionChange('nps')}
                                        helperText="National Pension Scheme"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Section 80G Donations"
                                        type="number"
                                        value={deductions.section80G}
                                        onChange={handleDeductionChange('section80G')}
                                        helperText="Charitable Donations"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            Tax Saving Investment Options
                        </Typography>
                        {taxSavingInvestments.map((investment, index) => (
                            <Accordion key={index} sx={{ mb: 1, borderRadius: 1, '&:before': { display: 'none' } }}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{ bgcolor: 'background.default' }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                                        <Typography sx={{ fontWeight: 500 }}>{investment.name}</Typography>
                                        <Chip
                                            label={`Section ${investment.section}`}
                                            size="small"
                                            sx={{
                                                bgcolor: COLORS[index % COLORS.length] + '20',
                                                color: COLORS[index % COLORS.length],
                                                fontWeight: 500
                                            }}
                                        />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography color="text.secondary" paragraph>
                                        {investment.description}
                                    </Typography>
                                    <Typography variant="body2">
                                        Maximum Deduction Limit: ₹{investment.maxLimit.toLocaleString()}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Tax Summary
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Gross Income
                                </Typography>
                                <Typography variant="h6">
                                    ₹{parseFloat(income || 0).toLocaleString()}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Total Deductions
                                </Typography>
                                <Typography variant="h6" color="success.main">
                                    ₹{calculateTotalDeductions().toLocaleString()}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Taxable Income
                                </Typography>
                                <Typography variant="h6">
                                    ₹{calculateTaxableIncome().toLocaleString()}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Estimated Tax
                                </Typography>
                                <Typography variant="h6" color="error.main">
                                    ₹{calculateTax().toLocaleString()}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Tax Savings
                                </Typography>
                                <Typography variant="h6" color="success.main">
                                    ₹{getTaxSavings().toLocaleString()}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Tax Slabs
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Income Range</TableCell>
                                            <TableCell align="right">Tax Rate</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {taxSlabs.map((slab, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{slab.range}</TableCell>
                                                <TableCell align="right">{slab.rate}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    {getDeductionsData().length > 0 && (
                        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    Deductions Breakdown
                                </Typography>
                                <Box sx={{ height: 200 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={getDeductionsData()}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                label
                                            >
                                                {getDeductionsData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Legend />
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                This tax calculator is for illustration purposes only. Please consult with a tax professional for accurate tax planning.
            </Alert>
        </Paper>
    );
};

export default TaxPlanner;