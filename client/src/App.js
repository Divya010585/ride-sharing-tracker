import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trip from './pages/Trip';
import TripHistory from './pages/TripHistory';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const themes = {
  dark: {
    bg: '#1a1a2e',
    card: '#16213e',
    cardSecondary: '#0f3460',
    text: 'white',
    textSecondary: '#888',
    accent: '#e94560',
    navbar: '#1a1a2e',
    input: '#0f3460',
    border: '#0f3460',
  },
  light: {
    bg: '#f0f2f5',
    card: '#ffffff',
    cardSecondary: '#e8eaf6',
    text: '#1a1a2e',
    textSecondary: '#555',
    accent: '#e94560',
    navbar: '#ffffff',
    input: '#e8eaf6',
    border: '#ddd',
  }
};

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: themes[theme] }}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/trip/:roomCode" element={<PrivateRoute><Trip /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><TripHistory /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;