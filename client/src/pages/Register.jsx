import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'https://ride-sharing-tracker-backend.onrender.com';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('At least 1 number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('At least 1 special character (!@#$%^&*)');
    return errors;
  };

  const handleRegister = async () => {
    setError('');

    if (!name.trim()) {
      setError('Please enter your name!');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address!');
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError('Password must have: ' + passwordErrors.join(', '));
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/register`, {
        name,
        email,
        password
      });
      setSuccess(res.data.message);
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
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join RideTracker today</p>
        </div>

        {error && <p style={styles.error}>⚠️ {error}</p>}

        {success ? (
          <div style={styles.successBox}>
            <p style={styles.successText}>📧 {success}</p>
            <p style={styles.successSubtext}>Check your email inbox and click the verify link!</p>
            <button style={styles.button} onClick={() => navigate('/')}>
              Go to Login →
            </button>
          </div>
        ) : (
          <>
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
              placeholder="Email Address (e.g. name@gmail.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div style={styles.passwordWrapper}>
              <input
                style={styles.passwordInput}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 8 chars, 1 uppercase, 1 number, 1 special)"
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

            <div style={styles.passwordRules}>
              <p style={password.length >= 8 ? styles.rulePass : styles.ruleFail}>
                {password.length >= 8 ? '✅' : '❌'} At least 8 characters
              </p>
              <p style={/[A-Z]/.test(password) ? styles.rulePass : styles.ruleFail}>
                {/[A-Z]/.test(password) ? '✅' : '❌'} At least 1 uppercase letter
              </p>
              <p style={/[0-9]/.test(password) ? styles.rulePass : styles.ruleFail}>
                {/[0-9]/.test(password) ? '✅' : '❌'} At least 1 number
              </p>
              <p style={/[!@#$%^&*]/.test(password) ? styles.rulePass : styles.ruleFail}>
                {/[!@#$%^&*]/.test(password) ? '✅' : '❌'} At least 1 special character (!@#$%^&*)
              </p>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
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
  passwordRules: {
    backgroundColor: '#0f3460',
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  rulePass: {
    color: '#69f0ae',
    fontSize: '12px',
    margin: 0
  },
  ruleFail: {
    color: '#888',
    fontSize: '12px',
    margin: 0
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
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
    textAlign: 'center'
  },
  successText: {
    color: '#69f0ae',
    fontSize: '16px',
    margin: 0
  },
  successSubtext: {
    color: '#888',
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