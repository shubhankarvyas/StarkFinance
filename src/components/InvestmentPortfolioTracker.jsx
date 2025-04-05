import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Grid,
    Box,
    Button,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    useTheme
} from '@mui/material';
import { savePortfolio, getPortfolio } from '../services/firebaseStorage';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const InvestmentPortfolioTracker = ({ userId }) => {
    const theme = useTheme();
    const [investments, setInvestments] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    // Load portfolio data from Firebase when component mounts
    useEffect(() => {
        const loadPortfolio = async () => {
            if (userId) {
                setLoading(true);
                try {
                    const portfolioData = await getPortfolio(userId);
                    if (portfolioData && portfolioData.investments) {
                        setInvestments(portfolioData.investments);
                    }
                } catch (error) {
                    console.error('Error loading portfolio:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadPortfolio();
    }, [userId]);
    const [formData, setFormData] = useState({
        assetType: '',
        name: '',
        quantity: '',
        purchasePrice: '',
        currentPrice: '',
        purchaseDate: ''
    });

    const assetTypes = [
        'Stocks',
        'Mutual Funds',
        'Cryptocurrency',
        'Bonds',
        'Real Estate',
        'Gold',
        'Fixed Deposits'
    ];

    const handleOpenDialog = (index = null) => {
        if (index !== null) {
            setFormData(investments[index]);
            setEditIndex(index);
        } else {
            setFormData({
                assetType: '',
                name: '',
                quantity: '',
                purchasePrice: '',
                currentPrice: '',
                purchaseDate: ''
            });
            setEditIndex(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({
            assetType: '',
            name: '',
            quantity: '',
            purchasePrice: '',
            currentPrice: '',
            purchaseDate: ''
        });
        setEditIndex(null);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateInvestmentMetrics = (investment) => {
        const totalInvestment = investment.quantity * investment.purchasePrice;
        const currentValue = investment.quantity * investment.currentPrice;
        const profitLoss = currentValue - totalInvestment;
        const profitLossPercentage = (profitLoss / totalInvestment) * 100;

        return {
            totalInvestment: totalInvestment.toFixed(2),
            currentValue: currentValue.toFixed(2),
            profitLoss: profitLoss.toFixed(2),
            profitLossPercentage: profitLossPercentage.toFixed(2)
        };
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const newInvestment = {
                ...formData,
                quantity: parseFloat(formData.quantity),
                purchasePrice: parseFloat(formData.purchasePrice),
                currentPrice: parseFloat(formData.currentPrice)
            };

            if (editIndex !== null) {
                const updatedInvestments = [...investments];
                updatedInvestments[editIndex] = newInvestment;
                setInvestments(updatedInvestments);
                await savePortfolio(userId, { investments: updatedInvestments });
            } else {
                const newInvestments = [...investments, newInvestment];
                setInvestments(newInvestments);
                await savePortfolio(userId, { investments: newInvestments });
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (index) => {
        try {
            const updatedInvestments = investments.filter((_, i) => i !== index);
            setInvestments(updatedInvestments);
            await savePortfolio(userId, { investments: updatedInvestments });
        } catch (error) {
            console.error('Error deleting investment:', error);
        }
    };

    const calculatePortfolioMetrics = () => {
        return investments.reduce((acc, investment) => {
            const metrics = calculateInvestmentMetrics(investment);
            return {
                totalInvestment: acc.totalInvestment + parseFloat(metrics.totalInvestment),
                currentValue: acc.currentValue + parseFloat(metrics.currentValue),
                profitLoss: acc.profitLoss + parseFloat(metrics.profitLoss)
            };
        }, { totalInvestment: 0, currentValue: 0, profitLoss: 0 });
    };

    const getPortfolioAllocation = () => {
        const allocation = {};
        investments.forEach(investment => {
            const { currentValue } = calculateInvestmentMetrics(investment);
            allocation[investment.assetType] = (allocation[investment.assetType] || 0) + parseFloat(currentValue);
        });

        return Object.entries(allocation).map(([name, value]) => ({
            name,
            value: parseFloat(value)
        }));
    };

    const portfolioMetrics = calculatePortfolioMetrics();
    const portfolioAllocation = getPortfolioAllocation();

    return (
        <Paper elevation={3} sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
            }
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    📊 Investment Portfolio Tracker
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .3)'
                        }
                    }}
                >
                    Add Investment
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <TableContainer component={Paper} sx={{
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        '& .MuiTableRow-root': {
                            transition: 'background-color 0.3s ease'
                        },
                        '& .MuiTableRow-root:hover': {
                            backgroundColor: theme.palette.action.hover
                        }
                    }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Asset Type</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Purchase Price</TableCell>
                                    <TableCell align="right">Current Price</TableCell>
                                    <TableCell align="right">Profit/Loss</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {investments.map((investment, index) => {
                                    const metrics = calculateInvestmentMetrics(investment);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Chip
                                                    label={investment.assetType}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: COLORS[index % COLORS.length] + '20',
                                                        color: COLORS[index % COLORS.length],
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{investment.name}</TableCell>
                                            <TableCell align="right">{investment.quantity}</TableCell>
                                            <TableCell align="right">₹{investment.purchasePrice}</TableCell>
                                            <TableCell align="right">₹{investment.currentPrice}</TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    color={parseFloat(metrics.profitLoss) >= 0 ? 'success.main' : 'error.main'}
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    ₹{metrics.profitLoss} ({metrics.profitLossPercentage}%)
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(index)}
                                                    sx={{ mr: 1 }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(index)}
                                                    color="error"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Portfolio Summary
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Total Investment
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                ₹{portfolioMetrics.totalInvestment.toFixed(2)}
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Current Value
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                ₹{portfolioMetrics.currentValue.toFixed(2)}
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Total Profit/Loss
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 600 }}
                                color={portfolioMetrics.profitLoss >= 0 ? 'success.main' : 'error.main'}
                            >
                                ₹{portfolioMetrics.profitLoss.toFixed(2)}
                            </Typography>
                        </Box>
                        {portfolioAllocation.length > 0 && (
                            <Box sx={{ height: 200 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Asset Allocation
                                </Typography>
                                <ResponsiveContainer width="100%" height="100%">
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
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                    style={{
                                                        filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.3s ease-in-out'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'scale(1)';
                                                    }}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    {editIndex !== null ? 'Edit Investment' : 'Add New Investment'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Asset Type</InputLabel>
                                <Select
                                    name="assetType"
                                    value={formData.assetType}
                                    onChange={handleChange}
                                    label="Asset Type"
                                >
                                    {assetTypes.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Investment Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                name="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Purchase Price"
                                name="purchasePrice"
                                type="number"
                                value={formData.purchasePrice}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Current Price"
                                name="currentPrice"
                                type="number"
                                value={formData.currentPrice}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Purchase Date"
                                name="purchaseDate"
                                type="date"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            minWidth: 100,
                            position: 'relative'
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : editIndex !== null ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default InvestmentPortfolioTracker;