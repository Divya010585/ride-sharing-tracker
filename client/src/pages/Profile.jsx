import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const API = 'https://ride-sharing-tracker-backend.onrender.com';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleUpdateName = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty!');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.put(`${API}/api/auth/update-profile`,
        { name },
        { headers: { authorization: token } }
      );
      const updatedUser = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage('✅ Name updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setError('Please fill both password fields!');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters!');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('New password must have at least 1 uppercase letter!');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError('New password must have at least 1 number!');
      return;
    }
    if (!/[!@#$%^&*]/.test(newPassword)) {
      setError('New password must have at least 1 special character!');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.put(`${API}/api/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { authorization: token } }
      );
      setMessage('✅ Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>

        {/* Avatar */}
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {getInitials(user?.name)}
          </div>
          <h2 style={styles.userName}>{user?.name}</h2>
          <p style={styles.userEmail}>{user?.email}</p>
        </div>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>⚠️ {error}</p>}

        {/* Update Name */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>✏️ Update Name</h3>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter new name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            style={loading ? styles.buttonLoading : styles.button}
            onClick={handleUpdateName}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Name'}
          </button>
        </div>

        {/* Change Password */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔒 Change Password</h3>
          <div style={styles.passwordWrapper}>
            <input
              style={styles.passwordInput}
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <span style={styles.eyeIcon} onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
              {showCurrentPassword ? '🙈' : '👁️'}
            </span>
          </div>
          <div style={styles.passwordWrapper}>
            <input
              style={styles.passwordInput}
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span style={styles.eyeIcon} onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? '🙈' : '👁️'}
            </span>
          </div>
          <button
            style={loading ? styles.buttonLoading : styles.dangerButton}
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>

        {/* Logout */}
        <button style={styles.logoutButton} onClick={handleLogout}>
          🚪 Logout
        </button>

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a2e'
  },
  content: {
    padding: '30px 20px',
    maxWidth: '500px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#e94560',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white'
  },
  userName: {
    color: 'white',
    margin: 0,
    fontSize: '22px'
  },
  userEmail: {
    color: '#888',
    margin: 0,
    fontSize: '14px'
  },
  card: {
    backgroundColor: '#16213e',
    padding: '20px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardTitle: {
    color: 'white',
    margin: 0,
    fontSize: '16px'
  },
  input: {
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #0f3460',
    backgroundColor: '#0f3460',
    color: 'white',
    fontSize: '14px',
    outline: 'none'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #0f3460',
    backgroundColor: '#0f3460',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    width: '100%'
  },
  eyeIcon: {
    position: 'absolute',
    right: '12px',
    cursor: 'pointer',
    fontSize: '18px'
  },
  button: {
    padding: '12px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  dangerButton: {
    padding: '12px',
    backgroundColor: '#0f3460',
    color: 'white',
    border: '2px solid #e94560',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  buttonLoading: {
    padding: '12px',
    backgroundColor: '#888',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'not-allowed',
    fontWeight: 'bold'
  },
  logoutButton: {
    padding: '14px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  success: {
    color: '#69f0ae',
    textAlign: 'center',
    fontSize: '14px',
    margin: 0
  },
  error: {
    color: '#e94560',
    textAlign: 'center',
    fontSize: '14px',
    margin: 0
  }
};

export default Profile;