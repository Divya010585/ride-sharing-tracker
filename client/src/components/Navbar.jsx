import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo} onClick={() => navigate('/dashboard')}>
        🚗 RideTracker
      </div>
      {user && (
        <div style={styles.right}>
          <span style={styles.username}>👋 {user.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#1a1a2e',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  logo: {
    color: '#e94560',
    fontSize: '22px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  username: {
    color: 'white',
    fontSize: '14px'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default Navbar;