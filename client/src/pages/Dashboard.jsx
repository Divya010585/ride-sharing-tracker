import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleCreateTrip = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/trips/create',
        {},
        { headers: { authorization: token } }
      );
      navigate(`/trip/${res.data.roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
    setLoading(false);
  };

  const handleJoinTrip = async () => {
    if (!roomCode) {
      setError('Please enter a room code!');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/trips/join',
        { roomCode },
        { headers: { authorization: token } }
      );
      navigate(`/trip/${roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🚗 Start a New Trip</h2>
          <p style={styles.cardSubtitle}>
            Create a trip and share the room code with others
          </p>
          <button
            style={loading ? styles.buttonLoading : styles.createButton}
            onClick={handleCreateTrip}
            disabled={loading}
          >
            {loading ? 'Creating...' : '+ Create New Trip'}
          </button>
        </div>

        <div style={styles.divider}>— OR —</div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔗 Join a Trip</h2>
          <p style={styles.cardSubtitle}>
            Enter the room code shared by your friend
          </p>
          {error && <p style={styles.error}>⚠️ {error}</p>}
          <input
            style={styles.input}
            type="text"
            placeholder="Enter Room Code (e.g. A1B2C3D4)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />
          <button
            style={loading ? styles.buttonLoading : styles.joinButton}
            onClick={handleJoinTrip}
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Trip →'}
          </button>
        </div>

        <button
          style={styles.historyButton}
          onClick={() => navigate('/history')}
        >
          📋 View Trip History
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '20px',
    minHeight: 'calc(100vh - 60px)'
  },
  card: {
    backgroundColor: '#16213e',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  cardTitle: {
    color: 'white',
    margin: 0,
    fontSize: '20px'
  },
  cardSubtitle: {
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
    outline: 'none',
    letterSpacing: '2px'
  },
  createButton: {
    padding: '14px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  joinButton: {
    padding: '14px',
    backgroundColor: '#0f3460',
    color: 'white',
    border: '2px solid #e94560',
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
  historyButton: {
    padding: '14px 30px',
    backgroundColor: 'transparent',
    color: '#e94560',
    border: '2px solid #e94560',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    maxWidth: '420px'
  },
  divider: {
    color: '#888',
    fontSize: '14px'
  },
  error: {
    color: '#e94560',
    fontSize: '14px',
    margin: 0
  }
};

export default Dashboard;