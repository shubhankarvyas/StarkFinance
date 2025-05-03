import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, ListItemText, CircularProgress, TextField, Autocomplete, Chip, Fade, Slide, useTheme } from '@mui/material';
import { fetchAllStocks, fetchStockData } from '../services/api';
import { STOCK_UPDATE_INTERVAL } from '../config/api';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';

const LiveStocks = ({ filteredStocks }) => {
  const theme = useTheme();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [searchedStocks, setSearchedStocks] = useState([]);

  useEffect(() => {
    let isMounted = true;

    // Debounced fetch functions
    const debouncedFetchStocks = debounce(async () => {
      try {
        const data = await fetchAllStocks();
        if (isMounted && data && data.length > 0) {
          setStocks(prevStocks => {
            const updatedStocks = data.map(newStock => ({
              ...newStock,
              previousPrice: (prevStocks.find(p => p.symbol === newStock.symbol) || {}).price || newStock.price
            }));
            return updatedStocks;
          });
        }
      } catch (error) {
        console.error('Error fetching all stocks:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 300);

    const debouncedFetchSearchedStocks = debounce(async () => {
      if (selectedStocks.length > 0) {
        try {
          const existingSymbols = new Set([...stocks, ...searchedStocks].map(s => s.symbol));
          const uniqueSymbols = selectedStocks.filter(symbol => !existingSymbols.has(symbol));

          if (uniqueSymbols.length > 0) {
            setLoading(true);
            const promises = uniqueSymbols.map(symbol => fetchStockData(symbol));
            const results = await Promise.all(promises);
            const validResults = results.filter(result => result !== null);

            if (isMounted && validResults.length > 0) {
              setSearchedStocks(prevSearched => {
                const updatedStocks = [...prevSearched];

                validResults.forEach(newStock => {
                  const existingIndex = updatedStocks.findIndex(s => s.symbol === newStock.symbol);

                  if (existingIndex !== -1) {
                    updatedStocks[existingIndex] = {
                      ...newStock,
                      previousPrice: updatedStocks[existingIndex].price
                    };
                  } else {
                    updatedStocks.push({
                      ...newStock,
                      previousPrice: newStock.price
                    });
                  }
                });
                return updatedStocks.filter(stock => selectedStocks.includes(stock.symbol));
              });
            }
          }
        } catch (error) {
          console.error('Error fetching searched stocks:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setSearchedStocks([]);
      }
    }, 300);

    debouncedFetchStocks();
    debouncedFetchSearchedStocks();

    const interval = setInterval(() => {
      debouncedFetchStocks();
      debouncedFetchSearchedStocks();
    }, STOCK_UPDATE_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(interval);
      debouncedFetchStocks.cancel();
      debouncedFetchSearchedStocks.cancel();
    };
  }, [selectedStocks]);

  if (loading) {
    return (
      <Paper elevation={3} sx={{
        p: 3,
        mb: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '500px',
        background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{
      p: 3,
      mb: 3,
      borderRadius: 3,
      background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
        <Autocomplete
          fullWidth
          freeSolo
          options={[
            ...stocks.map(stock => stock.symbol),
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA',
            'TSLA', 'META', 'NFLX', 'ADBE', 'INTC',
            'AMD', 'PYPL', 'CSCO', 'ORCL', 'IBM',
            'UBER', 'CRM', 'QCOM', 'COIN', 'SQ',
            'SHOP', 'ZM', 'SNOW', 'NET', 'PLTR'
          ].filter((value, index, self) => self.indexOf(value) === index)}
          value={searchInput}
          onChange={(event, newValue) => {
            if (newValue && !selectedStocks.includes(newValue)) {
              setSelectedStocks([...selectedStocks, newValue]);
            }
            setSearchInput('');
          }}
          inputValue={searchInput}
          onInputChange={(event, newInputValue) => {
            setSearchInput(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Search for stocks..."
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                  }
                }
              }}
            />
          )}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {selectedStocks.map((symbol) => (
          <Chip
            key={symbol}
            label={symbol}
            onDelete={() => setSelectedStocks(selectedStocks.filter(s => s !== symbol))}
            sx={{
              borderRadius: 1,
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-1px)' }
            }}
          />
        ))}
      </Box>

      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Live Stocks
      </Typography>
      <Box sx={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
          maxHeight: '400px',
          pr: 2,
          '::-webkit-scrollbar': {
            width: 8,
            borderRadius: 4
          },
          '::-webkit-scrollbar-track': {
            background: theme.palette.background.default,
            borderRadius: 4
          },
          '::-webkit-scrollbar-thumb': {
            background: theme.palette.primary.main,
            borderRadius: 4,
            '&:hover': {
              background: theme.palette.primary.dark
            }
          }
        }}>
          {[...stocks, ...searchedStocks]
            .filter((stock, index, self) =>
              self.findIndex(s => s.symbol === stock.symbol) === index)
            .filter(stock => selectedStocks.length === 0 || selectedStocks.includes(stock.symbol))
            .map((stock) => (
              <Slide direction="down" in={true} key={stock.symbol} timeout={300}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    width: '100%',
                    transition: 'all 0.3s',
                    backgroundColor: stock.price !== stock.previousPrice
                      ? `${theme.palette.primary.main}15`
                      : theme.palette.background.paper,
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      backgroundColor: `${theme.palette.primary.main}08`
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
                            {stock.symbol}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date().toLocaleTimeString()}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Fade in={true} timeout={300}>
                            <Typography
                              variant="h6"
                              component="div"
                              sx={{
                                fontWeight: 'bold',
                                mb: 0.5,
                                color: stock.price > stock.previousPrice
                                  ? theme.palette.success.main
                                  : stock.price < stock.previousPrice
                                    ? theme.palette.error.main
                                    : 'inherit',
                                transition: 'all 0.3s ease-in-out',
                                transform: stock.price !== stock.previousPrice ? 'scale(1.05)' : 'scale(1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end'
                              }}
                            >
                              <span style={{ fontSize: '0.7em', opacity: 0.7, marginRight: '4px' }}>$</span>
                              {stock.price.toFixed(2)}
                            </Typography>
                          </Fade>
                          <Slide direction="left" in={true} timeout={400}>
                            <Typography
                              variant="body2"
                              component="div"
                              sx={{
                                color: stock.change >= 0 ? theme.palette.success.main : theme.palette.error.main,
                                background: stock.change >= 0
                                  ? `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.success.light}40)`
                                  : `linear-gradient(135deg, ${theme.palette.error.light}20, ${theme.palette.error.light}40)`,
                                px: 2,
                                py: 0.75,
                                borderRadius: 2,
                                display: 'inline-flex',
                                alignItems: 'center',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }
                              }}
                            >
                              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                            </Typography>
                          </Slide>
                        </Box>
                      </Box>
                    }
                  />
                </Paper>
              </Slide>
            ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default LiveStocks;