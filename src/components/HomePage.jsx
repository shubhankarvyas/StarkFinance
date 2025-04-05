import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    useTheme,
    Paper,
    Divider
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import InsightsIcon from '@mui/icons-material/Insights';

const HomePage = ({ onTabChange }) => {
    const theme = useTheme();

    const features = [
        {
            title: 'Market Analysis',
            description: 'Get real-time insights into market trends, sentiment analysis, and stock performance.',
            icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
            color: '#4CAF50',
            tabIndex: 0,
            subFeatures: [
                { text: 'Real-time Market Sentiment Analysis', icon: <InsightsIcon /> },
                { text: 'Live Stock Tracking', icon: <TimelineIcon /> },
                { text: 'Technical Analysis Tools', icon: <BarChartIcon /> },
                { text: 'Global Market Insights', icon: <ShowChartIcon /> }
            ]
        },
        {
            title: 'Financial Tools',
            description: 'Access comprehensive tools for investment tracking, tax planning, and expense management.',
            icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
            color: '#2196F3',
            tabIndex: 1,
            subFeatures: [
                { text: 'Investment Portfolio Tracker', icon: <ShowChartIcon /> },
                { text: 'Tax Planning Calculator', icon: <BarChartIcon /> },
                { text: 'Expense Management', icon: <TimelineIcon /> },
                { text: 'Financial Goal Setting', icon: <InsightsIcon /> }
            ]
        },
        {
            title: 'Educational Resources',
            description: 'Learn from curated content, tutorials, and courses on finance and investment.',
            icon: <SchoolIcon sx={{ fontSize: 40 }} />,
            color: '#FF9800',
            tabIndex: 2,
            subFeatures: [
                { text: 'Interactive Learning Modules', icon: <SchoolIcon /> },
                { text: 'Investment Strategies', icon: <InsightsIcon /> },
                { text: 'Market Analysis Guides', icon: <BarChartIcon /> },
                { text: 'Financial Planning Tips', icon: <TimelineIcon /> }
            ]
        }
    ];

    const handleGetStarted = () => {
        onTabChange(0); // Navigate to Market Analysis tab
    };

    const handleFeatureClick = (tabIndex) => {
        onTabChange(tabIndex);
    };

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary', pb: 6 }}>
            {/* Hero Section */}
            <Paper
                elevation={0}
                sx={{
                    position: 'relative',
                    bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'primary.main',
                    color: theme.palette.mode === 'dark' ? 'text.primary' : 'common.white',
                    py: 8,
                    mb: 6,
                    borderRadius: 0,
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}88 0%, ${theme.palette.primary.dark}88 100%)`,
                        zIndex: 1
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    fontFamily: '"Winky Sans", "Poppins", "Roboto", "Arial", sans-serif',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                Your Smart Financial
                                <br />
                                Companion
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                                Make informed investment decisions with real-time market analysis,
                                advanced financial tools, and educational resources.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleGetStarted}
                                sx={{
                                    bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'common.white',
                                    color: theme.palette.mode === 'dark' ? 'common.white' : 'primary.main',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'primary.light' : 'grey.100',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                                    }
                                }}
                            >
                                Get Started
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <TrendingUpIcon
                                sx={{
                                    fontSize: { xs: 200, md: 300 },
                                    opacity: 0.8,
                                    transform: 'rotate(-10deg)',
                                    filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.2))'
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Paper>

            {/* Features Section */}
            <Container maxWidth="lg">
                <Typography
                    variant="h3"
                    align="center"
                    sx={{
                        mb: 6,
                        fontWeight: 600,
                        fontSize: { xs: '2rem', md: '2.5rem' },
                        fontFamily: '"Winky Sans", "Poppins", "Roboto", "Arial", sans-serif',
                        background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    Powerful Features for Smart Investing
                </Typography>
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card
                                onClick={() => handleFeatureClick(feature.tabIndex)}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease-in-out',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                                        '&::after': {
                                            transform: 'rotate(30deg) translateX(0)'
                                        }
                                    },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: '-50%',
                                        right: '-50%',
                                        width: '200%',
                                        height: '200%',
                                        background: `linear-gradient(45deg, transparent 30%, ${feature.color}08 70%)`,
                                        transform: 'rotate(30deg) translateX(-100%)',
                                        transition: 'transform 0.5s ease-in-out'
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            p: 2,
                                            borderRadius: '50%',
                                            bgcolor: `${feature.color}15`,
                                            color: feature.color,
                                            mb: 2,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {feature.icon}
                                    </Box>
                                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                        {feature.description}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-start' }}>
                                        {feature.subFeatures.map((subFeature, idx) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    color: 'text.secondary',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        color: feature.color,
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ color: feature.color, fontSize: '1.2rem' }}>
                                                    {subFeature.icon}
                                                </Box>
                                                <Typography variant="body2">
                                                    {subFeature.text}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default HomePage;