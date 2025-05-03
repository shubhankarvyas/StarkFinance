import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper, Typography, List, ListItem, ListItemText, Box, CircularProgress,
  Avatar, Chip, Divider, IconButton, Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { fetchNews } from '../services/api';
import { NEWS_UPDATE_INTERVAL } from '../config/api';

// Updated news data to match the screenshot
const enhancedInitialNews = [
  {
    title: "Stock markets tumble in response to Trump's sweeping tariffs",
    source: 'ABC News',
    time: '4/3/2025, 12:09:46 PM',
    impact: 'negative',
    category: 'Markets',
    snippet: '',
    trending: false
  },
  {
    title: "Dow futures tumble over 800 points on fear Trump's tariffs will spark trade war: Live updates",
    source: 'CNBC',
    time: '4/3/2025, 9:50:00 AM',
    impact: 'negative',
    category: 'Markets',
    snippet: '',
    trending: false
  },
  {
    title: "Tesla deliveries decline as analysts see fallout from Musk's politics",
    source: 'The Washington Post',
    time: '4/3/2025, 8:33:39 AM',
    impact: 'negative',
    category: 'Automotive',
    snippet: '',
    trending: false
  },
  {
    title: "Chinese Stocks in Hong Kong Slide as US Imposes New Tariffs",
    source: 'Bloomberg',
    time: '4/3/2025, 8:15:00 AM',
    impact: 'negative',
    category: 'Global',
    snippet: '',
    trending: false
  }
];

const GlobalNews = () => {
  const [news, setNews] = useState(enhancedInitialNews);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch news data function with useCallback
  const fetchNewsData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchNews();
      if (data && data.length > 0) {
        setNews(data);
      } else {
        setNews(enhancedInitialNews);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNews(enhancedInitialNews);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsData();

    // Set up interval for periodic updates
    const interval = setInterval(fetchNewsData, NEWS_UPDATE_INTERVAL);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [fetchNewsData]);

  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get impact icon based on market impact
  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'positive':
        return <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'negative':
        return <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />;
      default:
        return <TrendingFlatIcon sx={{ color: 'text.secondary', fontSize: 16 }} />;
    }
  };

  // Get source avatar with memoization for better performance
  const getSourceAvatar = useCallback((source) => {
    // Color based on source name for consistent but different colors
    const getColorFromString = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash % 360);
      return `hsl(${hue}, 70%, 50%)`;
    };

    // Get the first letter from each word in the source name
    const getInitials = (name) => {
      if (typeof name !== 'string') {
        if (name && typeof name.name === 'string') {
          name = name.name;
        } else if (name && typeof name.id === 'string') {
          name = name.id;
        } else {
          name = 'N/A';
        }
      }
      return name.split(' ').map(word => word[0]).join('');
    };

    return (
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: getColorFromString(source),
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}
      >
        {getInitials(source)}
      </Avatar>
    );
  }, []);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 3, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mt: 3,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header with title and refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Global News
          {refreshing && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1, display: 'inline' }}>
            Updated: {formatLastUpdated()}
          </Typography>
          <Tooltip title="Refresh news">
            <IconButton size="small" onClick={fetchNewsData} disabled={refreshing}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* News list */}
      <List sx={{
        maxHeight: '400px',
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.05)', borderRadius: '4px' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.2)', borderRadius: '4px' },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,0,0,0.3)' },
        mx: -2,
        px: 2
      }}>
        {news.length > 0 ? (
          news.map((item, idx) => (
            <ListItem key={idx} alignItems="flex-start" sx={{ mb: 1, borderRadius: 1, bgcolor: 'background.paper', boxShadow: 1 }}>
              {getSourceAvatar(item.source)}
              <Box sx={{ ml: 2, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                    {typeof item.title === 'object' ? JSON.stringify(item.title) : item.title}
                  </Typography>
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 500 }}
                  />
                  <Box sx={{ ml: 1 }}>{getImpactIcon(item.impact)}</Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  {typeof item.source === 'object' ? (item.source.name || item.source.id || JSON.stringify(item.source)) : item.source} &bull; {item.time}
                </Typography>
                {item.snippet && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {typeof item.snippet === 'object' ? JSON.stringify(item.snippet) : item.snippet}
                  </Typography>
                )}
              </Box>
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No news available." />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default GlobalNews;
