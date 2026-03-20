import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'https://ride-sharing-tracker-backend.onrender.com';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setSuccess('✅ Email verified successfully! Please login.');
    }
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address!');
      return;
    }
    if (!password) {
      setError('Please enter your password!');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.logoSection}>
          <h1 style={styles.logo}>🚗</h1>
          <h2 style={styles.title}>RideTracker</h2>
          <p style={styles.subtitle}>Track your rides in real time</p>
        </div>

        {error && <p style={styles.error}>⚠️ {error}</p>}
        {success && <p style={styles.successMsg}>✅ {success}</p>}

        <input
          style={styles.input}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={styles.passwordWrapper}>
          <input
            style={styles.passwordInput}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            style={styles.eyeIcon}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button
          style={loading ? styles.buttonLoading : styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        <p style={styles.link}>
          Don't have an account?{' '}
          <span style={styles.linkText} onClick={() => navigate('/register')}>
            Create Account
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#1a1a2e'
  },
  box: {
    backgroundColor: '#16213e',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    width: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '10px'
  },
  logo: {
    fontSize: '48px',
    margin: 0
  },
  title: {
    color: '#e94560',
    margin: '5px 0',
    fontSize: '24px'
  },
  subtitle: {
    color: '#888',
    margin: 0,
    fontSize: '14px'
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
    padding: '14px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  buttonLoading: {
    padding: '14px',
    backgroundColor: '#888',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'not-allowed',
    fontWeight: 'bold'
  },
  error: {
    color: '#e94560',
    textAlign: 'center',
    fontSize: '14px',
    margin: 0
  },
  successMsg: {
    color: '#69f0ae',
    textAlign: 'center',
    fontSize: '14px',
    margin: 0
  },
  link: {
    textAlign: 'center',
    color: '#888',
    fontSize: '14px'
  },
  linkText: {
    color: '#e94560',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Login;