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
import ApexCharts from 'react-apexcharts';
import { fetchMarketTrends } from '../services/api';
import { STOCK_SYMBOLS } from '../config/api';

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
        console.log("Fetched trendsData:", trendsData);
        // Use the data array directly from the backend
        const stockData = trendsData && trendsData.data && Array.isArray(trendsData.data) ? trendsData.data : [];
        console.log("Received stock data:", stockData);
        if (stockData.length > 0) {
          const validData = stockData.filter(item => (
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

  // Prepare data for ApexCharts
  const barSeries = [{
    name: 'Close',
    data: data && data.length > 0 ? data.map(d => { return { x: new Date(d.time).getTime(), y: d.close }; }) : [{ x: new Date().getTime(), y: 0 }]
  }];

  const candleSeries = [{
    data: data && data.length > 0 ? data.map(d => { return { x: new Date(d.time).getTime(), y: [d.open, d.high, d.low, d.close] }; }) : [{ x: new Date().getTime(), y: [0, 0, 0, 0] }]
  }];

  const barOptions = {
    chart: {
      type: 'line',
      toolbar: { show: true },
      zoom: { enabled: true }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: true,
        rotate: -45,
        formatter: function (val) {
          return new Date(val).toLocaleTimeString();
        }
      },
      axisBorder: { show: true },
      axisTicks: { show: true }
    },
    yaxis: {
      labels: {
        show: true,
        formatter: val => val.toFixed(2)
      },
      axisBorder: { show: true },
      axisTicks: { show: true }
    },
    grid: {
      show: true,
      borderColor: '#90A4AE',
      strokeDashArray: 0,
      position: 'back'
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      x: {
        format: 'HH:mm:ss'
      }
    },
    colors: ['#00bcd4']
  };

  const candleOptions = {
    chart: {
      type: 'candlestick',
      toolbar: { show: true },
      zoom: { enabled: true }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: true,
        rotate: -45,
        formatter: function (val) {
          return new Date(val).toLocaleTimeString();
        }
      },
      axisBorder: { show: true },
      axisTicks: { show: true }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        show: true,
        formatter: val => val.toFixed(2)
      },
      axisBorder: { show: true },
      axisTicks: { show: true }
    },
    grid: {
      show: true,
      borderColor: '#90A4AE',
      strokeDashArray: 0,
      position: 'back'
    },
    tooltip: {
      enabled: true,
      theme: 'dark'
    }
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
        <Typography variant="h6"> Stock Market Trends</Typography>
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
            <ApexCharts options={barOptions} series={barSeries} type="bar" height={300} />
            {(!data || data.length === 0) && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                No data available for this stock.
              </Typography>
            )}
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
            <ApexCharts options={candleOptions} series={candleSeries} type="candlestick" height={300} />
            {(!data || data.length === 0) && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                No data available for this stock.
              </Typography>
            )}
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
