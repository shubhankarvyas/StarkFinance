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
    useTheme,
    LinearProgress,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { saveExpense, getExpenses } from '../services/firebaseStorage';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const ExpenseTracker = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState({});
    const [openDialog, setOpenDialog] = useState(false);
    const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [budgetFormData, setBudgetFormData] = useState({
        category: '',
        amount: ''
    });

    const expenseCategories = [
        'Housing',
        'Transportation',
        'Food',
        'Utilities',
        'Healthcare',
        'Entertainment',
        'Shopping',
        'Education',
        'Insurance',
        'Savings',
        'Other'
    ];

    const handleOpenDialog = (index = null) => {
        if (index !== null) {
            setFormData(expenses[index]);
            setEditIndex(index);
        } else {
            setFormData({
                category: '',
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0]
            });
            setEditIndex(null);
        }
        setOpenDialog(true);
    };

    const handleOpenBudgetDialog = () => {
        setOpenBudgetDialog(true);
    };

    const handleCloseBudgetDialog = () => {
        setOpenBudgetDialog(false);
        setBudgetFormData({
            category: '',
            amount: ''
        });
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({
            category: '',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0]
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

    const handleBudgetChange = (event) => {
        const { name, value } = event.target;
        setBudgetFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Load expenses from Firebase when component mounts
    useEffect(() => {
        const loadExpenses = async () => {
            if (user?.uid) {
                setLoading(true);
                try {
                    const userExpenses = await getExpenses(user.uid);
                    setExpenses(userExpenses);
                } catch (error) {
                    console.error('Error loading expenses:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadExpenses();
    }, [user?.uid]);

    const handleSubmit = async () => {
        if (!user?.uid) return;

        setLoading(true);
        try {
            const newExpense = {
                ...formData,
                amount: parseFloat(formData.amount)
            };

            if (editIndex !== null) {
                const updatedExpenses = [...expenses];
                updatedExpenses[editIndex] = newExpense;
                await saveExpense(user.uid, newExpense);
                setExpenses(updatedExpenses);
            } else {
                await saveExpense(user.uid, newExpense);
                setExpenses([...expenses, newExpense]);
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving expense:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBudgetSubmit = () => {
        setBudgets(prev => ({
            ...prev,
            [budgetFormData.category]: parseFloat(budgetFormData.amount)
        }));
        handleCloseBudgetDialog();
    };

    const handleDelete = (index) => {
        const updatedExpenses = expenses.filter((_, i) => i !== index);
        setExpenses(updatedExpenses);
    };

    const calculateTotalExpenses = () => {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    };

    const calculateCategoryExpenses = () => {
        const categoryExpenses = {};
        expenses.forEach(expense => {
            categoryExpenses[expense.category] = (categoryExpenses[expense.category] || 0) + expense.amount;
        });
        return categoryExpenses;
    };

    const getCategoryData = () => {
        const categoryExpenses = calculateCategoryExpenses();
        return Object.entries(categoryExpenses).map(([category, amount]) => ({
            name: category,
            value: amount
        }));
    };

    const getMonthlyData = () => {
        const monthlyData = {};
        expenses.forEach(expense => {
            const month = new Date(expense.date).toLocaleString('default', { month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
        });
        return Object.entries(monthlyData).map(([month, amount]) => ({
            name: month,
            amount: amount
        }));
    };

    const getBudgetProgress = (category) => {
        const categoryExpenses = calculateCategoryExpenses();
        const spent = categoryExpenses[category] || 0;
        const budget = budgets[category] || 0;
        return budget > 0 ? (spent / budget) * 100 : 0;
    };

    // Custom label renderer for the pie chart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
        // Don't show labels on the pie slices
        return null;
    };

    // Custom tooltip for the pie chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                }}>
                    <Typography variant="body2">{`${payload[0].name}: ₹${payload[0].value.toFixed(2)}`}</Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Paper elevation={3} sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    💰 Expense Tracker
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        onClick={handleOpenBudgetDialog}
                        sx={{
                            mr: 2,
                            borderRadius: 2,
                            textTransform: 'none'
                        }}
                    >
                        Set Budget
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': { transform: 'translateY(-2px)' }
                        }}
                    >
                        Add Expense
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Budget Progress</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {expenses.map((expense, index) => {
                                    const progress = getBudgetProgress(expense.category);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Chip
                                                    label={expense.category}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: COLORS[index % COLORS.length] + '20',
                                                        color: COLORS[index % COLORS.length],
                                                        fontWeight: 500,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell align="right">₹{expense.amount.toFixed(2)}</TableCell>
                                            <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title={`${progress.toFixed(1)}% of budget used`}>
                                                    <Box sx={{ width: '100%', mr: 1 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={Math.min(progress, 100)}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 4,
                                                                bgcolor: theme.palette.grey[200],
                                                                '& .MuiLinearProgress-bar': {
                                                                    bgcolor: progress > 100 ? 'error.main' : 'primary.main',
                                                                    borderRadius: 4
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(index)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(index)}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{
                        p: 3,
                        borderRadius: 2,
                        height: '100%',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-5px)'
                        }
                    }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Expense Summary
                        </Typography>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Total Expenses
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                ₹{calculateTotalExpenses().toFixed(2)}
                            </Typography>
                        </Box>
                        {getCategoryData().length > 0 && (
                            <Box sx={{ height: 200, mb: 4 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Expenses by Category
                                </Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={getCategoryData()}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                        >
                                            {getCategoryData().map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                    style={{
                                                        filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.3s ease-in-out',
                                                        ':hover': {
                                                            transform: 'scale(1.1)'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Pie>
                                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        )}
                        {getMonthlyData().length > 0 && (
                            <Box sx={{ height: 200 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Monthly Expenses
                                </Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getMonthlyData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                                        <Bar
                                            dataKey="amount"
                                            fill={theme.palette.primary.main}
                                            radius={[4, 4, 0, 0]}
                                            style={{
                                                transition: 'all 0.3s ease-in-out',
                                                ':hover': {
                                                    filter: 'brightness(1.1)',
                                                    cursor: 'pointer'
                                                }
                                            }}
                                        />
                                    </BarChart>
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
                    {editIndex !== null ? 'Edit Expense' : 'Add New Expense'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    label="Category"
                                >
                                    {expenseCategories.map((category) => (
                                        <MenuItem key={category} value={category}>{category}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Amount"
                                name="amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Date"
                                name="date"
                                type="date"
                                value={formData.date}
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

            <Dialog
                open={openBudgetDialog}
                onClose={handleCloseBudgetDialog}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    Set Category Budget
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={budgetFormData.category}
                                    onChange={handleBudgetChange}
                                    label="Category"
                                >
                                    {expenseCategories.map((category) => (
                                        <MenuItem key={category} value={category}>{category}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Budget Amount"
                                name="amount"
                                type="number"
                                value={budgetFormData.amount}
                                onChange={handleBudgetChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={handleCloseBudgetDialog} sx={{ borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleBudgetSubmit}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            minWidth: 100
                        }}
                    >
                        Set Budget
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default ExpenseTracker;