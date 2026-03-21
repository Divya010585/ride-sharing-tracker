import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../App';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const { theme, toggleTheme, colors } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav style={{ ...styles.navbar, backgroundColor: colors.navbar, boxShadow: `0 2px 10px rgba(0,0,0,0.1)` }}>
      <div style={{ ...styles.logo, color: colors.accent }} onClick={() => navigate('/dashboard')}>
        🚗 RideTracker
      </div>
      {user && (
        <div style={styles.right}>
          <div style={{ ...styles.avatar, backgroundColor: colors.accent }} onClick={() => navigate('/profile')}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span style={{ ...styles.username, color: colors.text }}>👋 {user.name}</span>
          <button style={{ ...styles.themeBtn }} onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button style={{ ...styles.profileBtn, backgroundColor: colors.cardSecondary, color: colors.text, border: `2px solid ${colors.accent}` }} onClick={() => navigate('/profile')}>
            👤 Profile
          </button>
          <button style={{ ...styles.logoutBtn, backgroundColor: colors.accent }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  avatar: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    cursor: 'pointer'
  },
  username: {
    fontSize: '14px'
  },
  themeBtn: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '2px solid #e94560',
    borderRadius: '20px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  profileBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  logoutBtn: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default Navbar;