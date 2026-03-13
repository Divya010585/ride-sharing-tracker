import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password
      });
      alert('✅ Registered successfully! Please login.');
      navigate('/');
    } catch (err) {
      setError(err.response.data.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.logoSection}>
          <h1 style={styles.logo}>🚗</h1>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join RideTracker today</p>
        </div>

        {error && <p style={styles.error}>⚠️ {error}</p>}

        <input
          style={styles.input}
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={styles.input}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          style={loading ? styles.buttonLoading : styles.button}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account →'}
        </button>

        <p style={styles.link}>
          Already have an account?{' '}
          <span style={styles.linkText} onClick={() => navigate('/')}>
            Login
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

export default Register;