import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTheme } from '../App';

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
  const { colors } = useTheme();

  const handleUpdateName = async () => {
    if (!name.trim()) { setError('Name cannot be empty!'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      await axios.put(`${API}/api/auth/update-profile`, { name }, { headers: { authorization: token } });
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
    if (!currentPassword || !newPassword) { setError('Please fill both password fields!'); return; }
    if (newPassword.length < 8) { setError('New password must be at least 8 characters!'); return; }
    if (!/[A-Z]/.test(newPassword)) { setError('New password must have at least 1 uppercase letter!'); return; }
    if (!/[0-9]/.test(newPassword)) { setError('New password must have at least 1 number!'); return; }
    if (!/[!@#$%^&*]/.test(newPassword)) { setError('New password must have at least 1 special character!'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      await axios.put(`${API}/api/auth/change-password`, { currentPassword, newPassword }, { headers: { authorization: token } });
      setMessage('✅ Password changed successfully!');
      setCurrentPassword(''); setNewPassword('');
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.avatarSection}>
          <div style={{ ...styles.avatar, backgroundColor: colors.accent }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ color: colors.text, margin: 0, fontSize: '22px' }}>{user?.name}</h2>
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: '14px' }}>{user?.email}</p>
        </div>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>⚠️ {error}</p>}

        <div style={{ ...styles.card, backgroundColor: colors.card }}>
          <h3 style={{ color: colors.text, margin: 0, fontSize: '16px' }}>✏️ Update Name</h3>
          <input
            style={{ ...styles.input, backgroundColor: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
            type="text"
            placeholder="Enter new name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button style={{ ...styles.button, backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }} onClick={handleUpdateName} disabled={loading}>
            {loading ? 'Updating...' : 'Update Name'}
          </button>
        </div>

        <div style={{ ...styles.card, backgroundColor: colors.card }}>
          <h3 style={{ color: colors.text, margin: 0, fontSize: '16px' }}>🔒 Change Password</h3>
          <div style={styles.passwordWrapper}>
            <input
              style={{ ...styles.passwordInput, backgroundColor: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
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
              style={{ ...styles.passwordInput, backgroundColor: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
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
            style={{ ...styles.button, backgroundColor: colors.cardSecondary, color: colors.text, border: `2px solid ${colors.accent}`, opacity: loading ? 0.6 : 1 }}
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>

        <button style={{ ...styles.logoutButton, backgroundColor: colors.accent }} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  content: { padding: '30px 20px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: 'white' },
  card: { padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '14px', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  passwordInput: { padding: '14px', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%' },
  eyeIcon: { position: 'absolute', right: '12px', cursor: 'pointer', fontSize: '18px' },
  button: { padding: '12px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' },
  logoutButton: { padding: '14px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  success: { color: '#69f0ae', textAlign: 'center', fontSize: '14px', margin: 0 },
  error: { color: '#e94560', textAlign: 'center', fontSize: '14px', margin: 0 }
};

export default Profile;