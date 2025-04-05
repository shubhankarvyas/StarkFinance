import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Grid,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    IconButton,
    Tab,
    Tabs,
    Button,
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Alert
} from '@mui/material';

// Import local images
import stockMarketImg from '../assets/images/stock-market.svg';
import financeImg from '../assets/images/finance.svg';
import taxImg from '../assets/images/tax.svg';
import retirementImg from '../assets/images/retirement.svg';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';
import SchoolIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import TabPanel from './TabPanel';

const EducationalHub = () => {
    const theme = useTheme();
    const [savedContent, setSavedContent] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const articles = [
        {
            id: 1,
            title: 'Bloomberg Asia: Global Financial Markets',
            description: 'Stay updated with the latest financial news, market trends, and economic insights from Asia and beyond.',
            category: 'Global Markets',
            readTime: '10 min',
            url: 'https://www.bloomberg.com/asia',
            image: stockMarketImg
        },
        {
            id: 2,
            title: 'Personal Finance Essentials',
            description: 'Master your financial decisions with expert guidance on savings, investments, and wealth management.',
            category: 'Personal Finance',
            readTime: '12 min',
            url: 'https://www.etmoney.com/learn/personal-finance/financial-decisions/',
            image: financeImg
        },
        {
            id: 3,
            title: 'Top 50 Finance & Investing Blogs',
            description: 'Discover the best finance and investing blogs for market insights, investment strategies, and wealth building tips.',
            category: 'Investment Resources',
            readTime: '15 min',
            url: 'https://www.sharesight.com/blog/top-50-finance-and-investing-blogs/',
            image: taxImg
        },
        {
            id: 4,
            title: 'Economic Times: Market News & Analysis',
            description: 'Get comprehensive coverage of Indian and global markets, business news, and economic developments.',
            category: 'Market News',
            readTime: '10 min',
            url: 'https://economictimes.indiatimes.com/',
            image: retirementImg
        }
    ];

    const videos = [
        {
            id: 1,
            title: 'Investing in Stocks: A Beginner\'s Guide',
            description: 'Learn the fundamentals of stock market investing and how to get started with your investment journey.',
            duration: '10:03',
            category: 'Stock Market',
            thumbnail: 'https://img.youtube.com/vi/Izw-xaVkO0g/maxresdefault.jpg',
            url: 'https://www.youtube.com/watch?v=Izw-xaVkO0g'
        },
        {
            id: 2,
            title: 'Understanding Market Cycles',
            description: 'Discover how market cycles work and their impact on your investment decisions.',
            duration: '8:45',
            category: 'Market Analysis',
            thumbnail: 'https://img.youtube.com/vi/zVcwvCL2C2c/maxresdefault.jpg',
            url: 'https://www.youtube.com/watch?v=zVcwvCL2C2c'
        },
        {
            id: 3,
            title: 'Technical Analysis Explained',
            description: 'Master the basics of technical analysis and chart patterns for better trading decisions.',
            duration: '12:30',
            category: 'Trading',
            thumbnail: 'https://img.youtube.com/vi/5rhHm6WWOIs/maxresdefault.jpg',
            url: 'https://www.youtube.com/watch?v=5rhHm6WWOIs'
        }
    ];

    const courses = [
        {
            id: 3,
            title: 'The Beginner\'s Guide to the Stock Market',
            description: 'A comprehensive guide for beginners to understand stock market fundamentals and start investing.',
            duration: '4 weeks',
            level: 'Beginner',
            url: 'https://www.udemy.com/course/the-beginners-guide-to-the-stock-market/?couponCode=ST15MT20425G3',
            modules: [
                'Stock Market Basics',
                'Understanding Stock Prices',
                'Investment Strategies',
                'Portfolio Management',
                'Market Analysis'
            ]
        },
        {
            id: 2,
            title: 'The Complete Financial Analyst Training & Investing Course',
            description: 'Learn financial analysis and investing from scratch with practical examples and case studies.',
            duration: '10 weeks',
            level: 'Beginner',
            url: 'https://www.udemy.com/course/the-complete-financial-analyst-training-and-investing-course/?couponCode=ST15MT20425G3',
            modules: [
                'Financial Analysis Fundamentals',
                'Investment Strategies',
                'Portfolio Management',
                'Risk Management',
                'Market Analysis'
            ]
        },
        {
            id: 1,
            title: 'The Complete Financial Analyst Course',
            description: 'Master financial analysis, modeling, and valuation with real-world case studies.',
            duration: '12 weeks',
            level: 'Intermediate',
            url: 'https://www.udemy.com/course/the-complete-financial-analyst-course/',
            modules: [
                'Financial Statements Analysis',
                'Financial Modeling',
                'Company Valuation',
                'Investment Decision Making',
                'Risk Assessment'
            ]
        }
    ];

    useEffect(() => {
        const loadContent = async () => {
            try {
                setLoading(true);
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setLoading(false);
            } catch (err) {
                setError('Failed to load content. Please try again later.');
                setLoading(false);
            }
        };
        loadContent();
    }, []);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const toggleSaved = (contentId) => {
        if (savedContent.includes(contentId)) {
            setSavedContent(savedContent.filter(id => id !== contentId));
        } else {
            setSavedContent([...savedContent, contentId]);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        📚 Financial Education Hub
                    </Typography>
                </Box>

                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    sx={{
                        mb: 3,
                        '& .MuiTab-root': {
                            minWidth: 120,
                            textTransform: 'none',
                            fontSize: '1rem'
                        }
                    }}
                >
                    <Tab label="Articles" icon={<ArticleIcon />} />
                    <Tab label="Videos" icon={<PlayCircleOutlineIcon />} />
                    <Tab label="Courses" icon={<SchoolIcon />} />
                </Tabs>

                <TabPanel value={currentTab} index={0}>
                    <Grid container spacing={3}>
                        {articles.map((article) => (
                            <Grid item xs={12} md={6} key={article.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                        '&:hover': { transform: 'translateY(-4px)' }
                                    }}
                                    onClick={() => window.open(article.url, '_blank')}
                                >
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={article.image}
                                        alt={article.title}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Typography variant="h6" gutterBottom>
                                                {article.title}
                                            </Typography>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSaved(article.id);
                                                }}
                                                color={savedContent.includes(article.id) ? 'primary' : 'default'}
                                            >
                                                {savedContent.includes(article.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                            </IconButton>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {article.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Chip label={article.category} size="small" />
                                            <Typography variant="caption" color="text.secondary">
                                                {article.readTime} read
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    <Grid container spacing={3}>
                        {videos.map((video) => (
                            <Grid item xs={12} md={6} key={video.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                                        }
                                    }}
                                    onClick={() => window.open(video.url, '_blank')}
                                >
                                    <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                                        <CardMedia
                                            component="img"
                                            image={video.thumbnail}
                                            alt={video.title}
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 8,
                                                right: 8,
                                                bgcolor: 'rgba(0,0,0,0.75)',
                                                color: 'white',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {video.duration}
                                        </Box>
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                {video.title}
                                            </Typography>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSaved(video.id);
                                                }}
                                                color={savedContent.includes(video.id) ? 'primary' : 'default'}
                                                sx={{ p: 0.5 }}
                                            >
                                                {savedContent.includes(video.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                            </IconButton>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                                            {video.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Chip
                                                label={video.category}
                                                size="small"
                                                sx={{
                                                    bgcolor: theme.palette.primary.main + '15',
                                                    color: theme.palette.primary.main,
                                                    fontWeight: 500
                                                }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                    <Grid container spacing={3}>
                        {courses.map((course) => (
                            <Grid item xs={12} key={course.id}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                            <Typography variant="h6">{course.title}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Chip label={course.level} size="small" color="primary" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {course.duration}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography paragraph>{course.description}</Typography>
                                        <Typography variant="subtitle2" gutterBottom>Course Modules:</Typography>
                                        <List>
                                            {course.modules.map((module, index) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <SchoolIcon color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={module} />
                                                </ListItem>
                                            ))}
                                        </List>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 2 }}
                                            onClick={() => {
                                                toggleSaved(course.id);
                                                window.open(course.url, '_blank');
                                            }}
                                        >
                                            {savedContent.includes(course.id) ? 'Go to Course' : 'Enroll Now'}
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        ))}
                    </Grid>
                </TabPanel>
            </Box>
        </Paper>
    );
};

export default EducationalHub;