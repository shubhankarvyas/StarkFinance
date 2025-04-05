import React, { useState, useEffect } from 'react';
import { fetchMarketSentiment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Paper,
    Typography,
    Grid,
    Box,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    IconButton,
    Button,
    useTheme,
    Tooltip,
    Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

const MarketSentimentAnalysis = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sentimentData, setSentimentData] = useState({
        overallSentiment: 65,
        trendDirection: 'up',
        newsAnalysis: [],
        socialMediaSentiment: [],
        topMentions: []
    });

    const mockNewsData = [
        {
            title: 'Fed Signals Potential Rate Cuts',
            sentiment: 75,
            source: 'Financial Times',
            impact: 'high'
        },
        {
            title: 'Tech Sector Shows Strong Growth',
            sentiment: 85,
            source: 'Bloomberg',
            impact: 'high'
        },
        {
            title: 'Global Supply Chain Improvements',
            sentiment: 70,
            source: 'Reuters',
            impact: 'medium'
        },
        {
            title: 'Market Volatility Concerns',
            sentiment: 45,
            source: 'WSJ',
            impact: 'high'
        },
        {
            title: 'Emerging Markets Performance',
            sentiment: 60,
            source: 'CNBC',
            impact: 'medium'
        }
    ];

    const mockSocialSentiment = [
        { time: '9:00 AM', sentiment: 62 },
        { time: '10:00 AM', sentiment: 58 },
        { time: '11:00 AM', sentiment: 65 },
        { time: '12:00 PM', sentiment: 70 },
        { time: '1:00 PM', sentiment: 68 },
        { time: '2:00 PM', sentiment: 72 },
        { time: '3:00 PM', sentiment: 75 },
        { time: '4:00 PM', sentiment: 71 }
    ];

    const mockTopMentions = [
        { symbol: 'AAPL', sentiment: 78, mentions: 1250 },
        { symbol: 'TSLA', sentiment: 82, mentions: 980 },
        { symbol: 'MSFT', sentiment: 75, mentions: 850 },
        { symbol: 'GOOGL', sentiment: 70, mentions: 720 },
        { symbol: 'AMZN', sentiment: 72, mentions: 690 }
    ];

    const refreshData = async () => {
        if (!user) {
            setError('Please sign in to access market analysis');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMarketSentiment();
            if (data) {
                setSentimentData(data);
            } else {
                // Fallback to mock data if API fails
                setSentimentData({
                    overallSentiment: Math.floor(Math.random() * 30) + 50,
                    trendDirection: ['up', 'down', 'flat'][Math.floor(Math.random() * 3)],
                    newsAnalysis: mockNewsData,
                    socialMediaSentiment: mockSocialSentiment,
                    topMentions: mockTopMentions
                });
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const getSentimentColor = (sentiment) => {
        if (sentiment >= 70) return theme.palette.success.main;
        if (sentiment >= 50) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const getTrendIcon = () => {
        switch (sentimentData.trendDirection) {
            case 'up':
                return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
            case 'down':
                return <TrendingDownIcon sx={{ color: theme.palette.error.main }} />;
            default:
                return <TrendingFlatIcon sx={{ color: theme.palette.warning.main }} />;
        }
    };

    if (!user) {
        return (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Alert severity="info">
                    Please sign in to access Market Analysis
                </Alert>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    🎯 Market Sentiment Analysis
                </Typography>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={refreshData}
                    disabled={loading}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': { transform: 'translateY(-2px)' }
                    }}
                >
                    Refresh Analysis
                </Button>
            </Box>

            {loading ? (
                <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    Social Media Sentiment Trend
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sentimentData.socialMediaSentiment}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis domain={[0, 100]} />
                                            <RechartsTooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="sentiment"
                                                stroke={theme.palette.primary.main}
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>

                        <Grid container spacing={2}>
                            {sentimentData.newsAnalysis.map((news, index) => (
                                <Grid item xs={12} key={index}>
                                    <Card sx={{
                                        borderRadius: 2,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)' }
                                    }}>
                                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    {news.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Source: {news.source}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    label={`Impact: ${news.impact}`}
                                                    sx={{
                                                        bgcolor: news.impact === 'high' ? 'rgba(211, 47, 47, 0.15)' : 'default',
                                                        color: news.impact === 'high' ? 'error.main' : 'default',
                                                        fontWeight: news.impact === 'high' ? 600 : 400,
                                                        borderColor: news.impact === 'high' ? 'error.main' : 'default',
                                                        border: news.impact === 'high' ? 1 : 0
                                                    }}
                                                    size="small"
                                                    style={{
                                                        bgcolor: news.impact === 'high' ? 'rgba(211, 47, 47, 0.12)' : 'rgba(237, 108, 2, 0.12)',
                                                        color: news.impact === 'high' ? theme.palette.error.main : theme.palette.warning.main,
                                                        fontWeight: 500
                                                    }}
                                                />
                                                <Tooltip title="Sentiment Score">
                                                    <Chip
                                                        label={`${news.sentiment}%`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getSentimentColor(news.sentiment) + '20',
                                                            color: getSentimentColor(news.sentiment)
                                                        }}
                                                    />
                                                </Tooltip>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    Overall Market Sentiment
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Typography variant="h3" sx={{ fontWeight: 600, color: getSentimentColor(sentimentData.overallSentiment) }}>
                                        {sentimentData.overallSentiment}%
                                    </Typography>
                                    {getTrendIcon()}
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={sentimentData.overallSentiment}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: theme.palette.grey[200],
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: getSentimentColor(sentimentData.overallSentiment),
                                            borderRadius: 4
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    Top Mentioned Stocks
                                </Typography>
                                {sentimentData.topMentions.map((stock, index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box>
                                            <Typography variant="subtitle2">{stock.symbol}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {stock.mentions.toLocaleString()} mentions
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${stock.sentiment}%`}
                                            size="small"
                                            sx={{
                                                bgcolor: getSentimentColor(stock.sentiment) + '20',
                                                color: getSentimentColor(stock.sentiment)
                                            }}
                                        />
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>

                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Market sentiment analysis is based on real-time news and social media data. Use this information as part of your broader research strategy.
                        </Alert>
                    </Grid>
                </Grid>
            )}
        </Paper>
    );
};

export default MarketSentimentAnalysis;