import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  CircularProgress,
  TextField,
  Autocomplete
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Rectangle
} from 'recharts';
import { fetchMarketTrends } from '../services/api';
import { STOCK_SYMBOLS } from '../config/api';

const CustomCandle = (props) => {
  const { x, y, width, payload } = props;
  const isRise = payload.close > payload.open;
  const color = isRise ? '#4caf50' : '#f44336';
  const top = Math.min(payload.open, payload.close);
  const bottom = Math.max(payload.open, payload.close);
  const candleHeight = Math.max(2, Math.abs(payload.close - payload.open));
  const centerX = x + width / 2;
  const candleY = y + (bottom - payload.low);

  return (
    <g>
      <line
        x1={centerX}
        x2={centerX}
        y1={y + (payload.high - payload.low)}
        y2={y}
        stroke={color}
        strokeWidth={1.5}
      />
      <Rectangle
        x={centerX - width / 3}
        y={candleY}
        width={width / 1.5}
        height={candleHeight || 2}
        fill={color}
        stroke={color}
      />
    </g>
  );
};

const CandleChart = ({ data }) => {
  const minLow = Math.min(...data.map(d => d.low));
  const maxHigh = Math.max(...data.map(d => d.high));
  const range = maxHigh - minLow;
  const buffer = range * 0.1;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          domain={[minLow - buffer, maxHigh + buffer]}
          tickFormatter={(value) => value.toFixed(2)}
        />
        <Tooltip />
        <Bar dataKey="close" shape={<CustomCandle />} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const StockMarketTrends = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(STOCK_SYMBOLS[0]);
  const [searchInput, setSearchInput] = useState('');
  const [stockData, setStockData] = useState({
    symbol: null,
    startPrice: null,
    currentPrice: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setData([]);
        setStockData({ symbol: null, startPrice: null, currentPrice: null });

        const trendsData = await fetchMarketTrends(selectedStock);

        if (trendsData && Array.isArray(trendsData) && trendsData.length > 0) {
          const validData = trendsData.filter(item => (
            item && typeof item.close === 'number' && typeof item.open === 'number'
            && typeof item.high === 'number' && typeof item.low === 'number'
          ));

          if (validData.length > 0) {
            setData(validData);
            setStockData({
              symbol: selectedStock,
              startPrice: validData[0].close,
              currentPrice: validData[validData.length - 1].close
            });
          }
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [selectedStock]);

  const calculateGainLoss = () => {
    const { startPrice, currentPrice } = stockData;
    if (!startPrice || !currentPrice) return '0.00';
    const absoluteChange = currentPrice - startPrice;
    const percentageChange = (absoluteChange / Math.abs(startPrice)) * 100;
    if (isNaN(percentageChange)) return '0.00';
    const sign = percentageChange >= 0 ? '+' : '';
    return `${sign}${percentageChange.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">📊 Stock Market Trends</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <Autocomplete
            fullWidth
            freeSolo
            options={STOCK_SYMBOLS}
            value={selectedStock}
            onChange={(event, newValue) => {
              if (newValue) setSelectedStock(newValue);
              setSearchInput('');
            }}
            inputValue={searchInput}
            onInputChange={(event, newInputValue) => setSearchInput(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Search for stocks..."
                size="small"
              />
            )}
          />
        </Box>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>Stock Prices Over Time</Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Bar dataKey="close" fill="#00bcd4" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="body2" color={parseFloat(calculateGainLoss()) >= 0 ? 'success.main' : 'error.main'}>
              {calculateGainLoss()}%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>Candlestick Chart</Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <CandleChart data={data} />
          </Box>
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="body2" color={parseFloat(calculateGainLoss()) >= 0 ? 'success.main' : 'error.main'}>
              {calculateGainLoss()}%
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StockMarketTrends;
