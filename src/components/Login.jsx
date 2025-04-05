import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Stack,
    useTheme,
    Collapse,
    CircularProgress,
    Avatar,
    IconButton,
    Snackbar,
} from '@mui/material';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { signIn, signUp } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { updateProfile } = useUserProfile();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors = {};
        const { email, password, name, confirmPassword } = formData;

        if (!email) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Invalid email format';
        }

        if (!password) errors.password = 'Password is required';
        else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!isLogin) {
            if (!name) errors.name = 'Name is required';
            if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
            else if (password !== confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }

        return errors;
    };

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});
        setSuccessMessage('');

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setLoading(true);
        const { email, password, name } = formData;

        try {
            const { user, error: authError } = await (isLogin
                ? signIn(email, password)
                : signUp(email, password, { name }));

            if (authError) {
                setError(authError);
            } else if (user) {
                const message = isLogin ? 'Welcome back!' : 'Account created successfully!';
                setSuccessMessage(message);

                if (!isLogin) {
                    // Update user profile in context for new users
                    updateProfile({
                        email: user.email,
                        name: name || user.displayName || '',
                        displayName: name || user.displayName || '',
                        createdAt: new Date().toISOString(),
                        isOnboarded: false
                    });
                }

                // Immediately navigate to home page after successful login
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccessMessage('');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: theme.palette.background.default,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 2,
                    background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom align="center">
                    {isLogin ? '🔐 Login' : '✨ Sign Up'}
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        {error && <Alert severity="error">{error}</Alert>}

                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            error={!!validationErrors.email}
                            helperText={validationErrors.email}
                            disabled={loading}
                        />

                        <Collapse in={!isLogin}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required={!isLogin}
                                sx={{ mb: 2 }}
                            />
                        </Collapse>

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            error={!!validationErrors.password}
                            helperText={validationErrors.password}
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                ),
                            }}
                        />

                        <Collapse in={!isLogin}>
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required={!isLogin}
                            />
                        </Collapse>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                            {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login' : 'Sign Up')}
                        </Button>

                        <Button
                            variant="text"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin
                                ? "Don't have an account? Sign Up"
                                : 'Already have an account? Login'}
                        </Button>
                    </Stack>
                </form>
                <Snackbar
                    open={!!successMessage}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    message={successMessage}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </Paper>
        </Box>
    );
};

export default Login;