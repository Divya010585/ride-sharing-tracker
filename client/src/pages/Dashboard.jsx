import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTheme } from '../App';

const API = 'https://ride-sharing-tracker-backend.onrender.com';

const Dashboard = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { colors } = useTheme();

  const handleCreateTrip = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/trips/create`, {}, { headers: { authorization: token } });
      navigate(`/trip/${res.data.roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
    setLoading(false);
  };

  const handleJoinTrip = async () => {
    if (!roomCode) { setError('Please enter a room code!'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/trips/join`, { roomCode }, { headers: { authorization: token } });
      navigate(`/trip/${roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
      <Navbar />
      <div style={styles.content}>
        <div style={{ ...styles.card, backgroundColor: colors.card }}>
          <h2 style={{ ...styles.cardTitle, color: colors.text }}>🚗 Start a New Trip</h2>
          <p style={{ ...styles.cardSubtitle, color: colors.textSecondary }}>Create a trip and share the room code with others</p>
          <button
            style={{ ...styles.createButton, backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }}
            onClick={handleCreateTrip}
            disabled={loading}
          >
            {loading ? 'Creating...' : '+ Create New Trip'}
          </button>
        </div>

        <div style={{ color: colors.textSecondary, fontSize: '14px' }}>— OR —</div>

        <div style={{ ...styles.card, backgroundColor: colors.card }}>
          <h2 style={{ ...styles.cardTitle, color: colors.text }}>🔗 Join a Trip</h2>
          <p style={{ ...styles.cardSubtitle, color: colors.textSecondary }}>Enter the room code shared by your friend</p>
          {error && <p style={styles.error}>⚠️ {error}</p>}
          <input
            style={{ ...styles.input, backgroundColor: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
            type="text"
            placeholder="Enter Room Code (e.g. A1B2C3D4)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />
          <button
            style={{ ...styles.joinButton, backgroundColor: colors.cardSecondary, color: colors.text, border: `2px solid ${colors.accent}`, opacity: loading ? 0.6 : 1 }}
            onClick={handleJoinTrip}
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Trip →'}
          </button>
        </div>

        <button
          style={{ ...styles.historyButton, color: colors.accent, border: `2px solid ${colors.accent}` }}
          onClick={() => navigate('/history')}
        >
          📋 View Trip History
        </button>
      </div>
    </div>
  );
};

const styles = {
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
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  cardTitle: { margin: 0, fontSize: '20px' },
  cardSubtitle: { margin: 0, fontSize: '14px' },
  input: {
    padding: '14px',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    letterSpacing: '2px'
  },
  createButton: {
    padding: '14px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  joinButton: {
    padding: '14px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  historyButton: {
    padding: '14px 30px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    maxWidth: '420px'
  },
  error: { color: '#e94560', fontSize: '14px', margin: 0 }
};

export default Dashboard;