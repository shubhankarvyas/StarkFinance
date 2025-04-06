import React, { useState, useMemo } from 'react';
import App from './App';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { UserProfileProvider } from './contexts/userprofilecontext';
import { AuthProvider } from './contexts/AuthContext';

const Root = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#7C3AED' : '#6366F1',
        dark: darkMode ? '#6D28D9' : '#4F46E5',
        light: darkMode ? '#8B5CF6' : '#818CF8'
      },
      secondary: {
        main: darkMode ? '#10B981' : '#059669',
        dark: darkMode ? '#059669' : '#047857',
        light: darkMode ? '#34D399' : '#34D399'
      },
      background: {
        default: darkMode ? '#111827' : '#F9FAFB',
        paper: darkMode ? '#1F2937' : '#FFFFFF'
      },
      text: {
        primary: darkMode ? '#F9FAFB' : '#111827',
        secondary: darkMode ? '#9CA3AF' : '#4B5563'
      },
      error: {
        main: darkMode ? '#EF4444' : '#DC2626',
        light: darkMode ? '#F87171' : '#EF4444',
        dark: darkMode ? '#DC2626' : '#B91C1C'
      },
      warning: {
        main: darkMode ? '#F59E0B' : '#D97706',
        light: darkMode ? '#FBBF24' : '#F59E0B',
        dark: darkMode ? '#D97706' : '#B45309'
      },
      success: {
        main: darkMode ? '#10B981' : '#059669',
        light: darkMode ? '#34D399' : '#10B981',
        dark: darkMode ? '#059669' : '#047857'
      },
      divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
    }
  }), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProfileProvider>
        <AuthProvider>
          <BrowserRouter>
            <App darkMode={darkMode} onDarkModeChange={toggleDarkMode} />
          </BrowserRouter>
        </AuthProvider>
      </UserProfileProvider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
