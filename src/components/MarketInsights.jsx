import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Grid,
    Box,
    Chip,
    LinearProgress,
    useTheme,
    Alert,
    Fade
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { fetchStockData } from '../services/api';
import { STOCK_UPDATE_INTERVAL } from '../config/api';

const MarketInsights = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [marketIndicators, setMarketIndicators] = useState([]);

    const fetchMarketData = async () => {
        try {
            setError(null);
            setLoading(true);

            const symbols = ['SPY', 'QQQ', 'DIA', 'VIX'];
            const results = await Promise.all(symbols.map(symbol => fetchStockData(symbol)));

            const formattedData = results.map((data, index) => ({
                name: symbols[index] === 'SPY' ? 'S&P 500' :
                    symbols[index] === 'QQQ' ? 'NASDAQ' :
                        symbols[index] === 'DIA' ? 'DOW JONES' : 'VIX',
                value: data ? data.price.toFixed(2) : '0.00',
                change: data ? `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%` : '0.00%',
                positive: data ? data.change >= 0 : false
            }));

            setMarketIndicators(formattedData);
        } catch (err) {
            console.error('Error fetching market data:', err);
            setError('Failed to fetch market data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchMarketData(), fetchSectorData()]);
        };

        fetchData();
        const interval = setInterval(fetchData, STOCK_UPDATE_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const [sectorPerformance, setSectorPerformance] = useState([]);

    const fetchSectorData = async () => {
        try {
            // Comprehensive market sectors with mock performance data
            const marketSectors = [
                { name: 'Technology', performance: 65 + Math.random() * 15 },
                { name: 'Healthcare', performance: 55 + Math.random() * 20 },
                { name: 'Finance', performance: 60 + Math.random() * 15 },
                { name: 'Energy', performance: 50 + Math.random() * 25 },
                { name: 'Consumer Discretionary', performance: 58 + Math.random() * 17 },
                { name: 'Consumer Staples', performance: 45 + Math.random() * 15 },
                { name: 'Industrials', performance: 52 + Math.random() * 18 },
                { name: 'Materials', performance: 48 + Math.random() * 22 },
                { name: 'Real Estate', performance: 42 + Math.random() * 18 },
                { name: 'Utilities', performance: 40 + Math.random() * 15 },
                { name: 'Communication Services', performance: 55 + Math.random() * 20 }
            ];

            setSectorPerformance(marketSectors.map(sector => ({
                name: sector.name,
                performance: parseFloat(sector.performance.toFixed(2))
            })));
        } catch (err) {
            console.error('Error fetching sector data:', err);
            setError('Failed to fetch sector performance data.');
        }
    };

    if (loading) {
        return (
            <Paper elevation={3} sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '500px',
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
                <LinearProgress sx={{ width: '50%' }} />
            </Paper>
        );
    }

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                height: '100%',
                height: '500px',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Market Insights
            </Typography>

            {error && (
                <Fade in={true}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                </Fade>
            )}

            <Grid container spacing={3} sx={{ height: '100%', alignItems: 'stretch' }}>
                <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                        Key Market Indicators
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        {marketIndicators.map((indicator) => (
                            <Paper
                                key={indicator.name}
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderRadius: 2,
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {indicator.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {indicator.value}
                                    </Typography>
                                    <Chip
                                        icon={indicator.positive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                        label={indicator.change}
                                        size="small"
                                        sx={{
                                            bgcolor: indicator.positive ? 'success.main' : 'error.main',
                                            color: 'white',
                                            '& .MuiChip-icon': { color: 'white' }
                                        }}
                                    />
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                </Grid>

                <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                        Sector Performance
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2, maxHeight: '350px', overflowY: 'auto', pr: 1 }}>
                        {sectorPerformance.map((sector) => (
                            <Box key={sector.name}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">{sector.name}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {sector.performance}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={sector.performance}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: sector.performance > 70 ? 'success.main' :
                                                sector.performance > 50 ? 'warning.main' : 'error.main',
                                            borderRadius: 4
                                        }
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default MarketInsights;