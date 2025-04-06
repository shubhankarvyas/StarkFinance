// App.jsx
import React from 'react';
import {
  Container, Box, Tabs, Tab, Typography, IconButton, useTheme,
  Grid, TextField, Autocomplete, AppBar, Toolbar, Avatar,
  Menu, MenuItem, Divider
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import ShowChartIcon from '@mui/icons-material/ShowChart';

import { UserProfileProvider } from './contexts/userprofilecontext';
import { useUserProfile } from './contexts/userprofilecontext';
import { AuthProvider, useAuth } from './contexts/AuthContext';


import Login from './components/Login';
import Footer from './components/Footer';
import MarketSentimentAnalysis from './components/MarketSentimentAnalysis';
import StockMarketTrends from './components/StockMarketTrends';
import LiveStocks from './components/LiveStocks';
import GlobalNews from './components/GlobalNews';
import MarketInsights from './components/MarketInsights';
import FinancialAssistant from './components/FinancialAssistant';
import EducationalHub from './components/EducationalHub';
import FinancialCalculator from './components/FinancialCalculator';
import ExpenseTracker from './components/ExpenseTracker';
import InvestmentPortfolioTracker from './components/InvestmentPortfolioTracker';
import FinancialQuestionnaire from './components/FinancialQuestionnaire';
import AIAssistant from './components/AIAssistant';
import HomePage from './components/HomePage';
import TaxPlanner from './components/TaxPlanner';
import ProfileSettings from './components/ProfileSettings';

const AppContent = ({ darkMode, onDarkModeChange }) => {
  const { user, signOut } = useAuth();
  const { userProfile } = useUserProfile();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const theme = useTheme();
  const [currentTab, setCurrentTab] = React.useState(-1);
  const [searchQuery, setSearchQuery] = React.useState('');

  const allItems = [
    { text: 'Financial Calculator', icon: <CalculateIcon />, component: FinancialCalculator },
    { text: 'Expense Tracker', icon: <AccountBalanceWalletIcon />, component: ExpenseTracker },
    { text: 'Financial Profile Builder', icon: <PersonIcon /> },
    { text: 'Investment Portfolio Tracker', icon: <ShowChartIcon />, component: InvestmentPortfolioTracker }
  ];

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const TabPanel = React.memo(({ children, value, index }) => {
    if (value !== index) return null;
    return (
      <div role="tabpanel" id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
        <Box sx={{ p: 3 }}>{children}</Box>
      </div>
    );
  });

  if (!user) return <Login />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? '#0F3D3E' : '#E0F7FA',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ height: 80, display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.mode === 'light' ? 'primary.main' : 'inherit',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'scale(1.05)' }
            }}
            onClick={() => setCurrentTab(-1)}
          >
            StarkFinance
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, mx: 4 }}>
            <Autocomplete
              freeSolo
              options={allItems}
              getOptionLabel={(option) => option.text}
              inputValue={searchQuery}
              onInputChange={(event, newValue) => setSearchQuery(newValue)}
              onChange={(event, newValue) => {
                if (newValue) {
                  setCurrentTab(1);
                  setTimeout(() => {
                    const componentElement = document.getElementById(newValue.text.replace(/\s+/g, ''));
                    if (componentElement) {
                      componentElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }
              }}
              sx={{ width: '500px' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search features..."
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '42px',
                      borderRadius: '20px',
                      backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid',
                      borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.07)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: theme.palette.mode === 'light' ? '#fff' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: theme.palette.mode === 'light' ? 'primary.main' : 'rgba(255, 255, 255, 0.3)'
                      }
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '1.3rem' }} />
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: 120,
                  mx: 0.5,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600
                  }
                }
              }}
            >
              <Tab label="Home" value={-1} />
              <Tab label="Market Analysis" value={0} />
              <Tab label="Financial Tools" value={1} />
              <Tab label="Education" value={2} />
            </Tabs>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar src={userProfile.photoURL} alt={userProfile.displayName || 'User'} sx={{ width: 35, height: 35 }}>
                {(userProfile.displayName || 'U')[0].toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1">{userProfile.displayName || 'User'}</Typography>
                <Typography variant="body2" color="text.secondary">{userProfile.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); setCurrentTab(3); }}>Profile Settings</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); signOut(); }}>Sign Out</MenuItem>
            </Menu>

            <IconButton onClick={onDarkModeChange}>
              {theme.palette.mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: { xs: 12, sm: 14 } }}>
        <TabPanel value={currentTab} index={-1}>
          <HomePage onTabChange={setCurrentTab} />
        </TabPanel>
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ mb: 3 }}><MarketSentimentAnalysis /></Box>
          <Box sx={{ mb: 3 }}><StockMarketTrends /></Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}><LiveStocks /></Grid>
            <Grid item xs={12} md={8}><MarketInsights /></Grid>
          </Grid>
          <Box sx={{ mb: 3 }}><GlobalNews /></Box>
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ mb: 3 }}><FinancialAssistant /></Box>
          <Box sx={{ mb: 3 }} id="FinancialCalculator"><FinancialCalculator /></Box>
          <Box sx={{ mb: 3 }} id="ExpenseTracker"><ExpenseTracker /></Box>
          <Box sx={{ mb: 3 }}><FinancialQuestionnaire /></Box>
          <Box sx={{ mb: 3 }} id="InvestmentPortfolioTracker">
            <InvestmentPortfolioTracker userId={user.uid} />
          </Box>
          <Box sx={{ mb: 3 }} id="TaxPlanner"><TaxPlanner /></Box>
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <EducationalHub />
        </TabPanel>
        <TabPanel value={currentTab} index={3}>
          <ProfileSettings onClose={() => setCurrentTab(-1)} />
        </TabPanel>
      </Container>

      <AIAssistant />
      <Footer />
    </Box>
  );
};

const App = ({ darkMode, onDarkModeChange }) => (
  <UserProfileProvider>
    <AuthProvider>
      <AppContent darkMode={darkMode} onDarkModeChange={onDarkModeChange} />
    </AuthProvider>
  </UserProfileProvider>
);

export default App;
