import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTheme } from '../App';

const API = 'https://ride-sharing-tracker-backend.onrender.com';

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { colors } = useTheme();

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/trips/history`, {
        headers: { authorization: token }
      });
      setTrips(res.data.trips);
    } catch (err) {
      console.log('Error fetching history:', err);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={{ ...styles.title, color: colors.text }}>📋 Trip History</h2>

        {loading ? (
          <p style={{ color: colors.textSecondary }}>Loading trips...</p>
        ) : trips.length === 0 ? (
          <div style={{ ...styles.emptyBox, backgroundColor: colors.card }}>
            <p style={{ color: colors.text, fontSize: '24px', margin: 0 }}>🚗 No trips yet!</p>
            <p style={{ color: colors.textSecondary, fontSize: '14px', margin: 0 }}>Create or join a trip to see history here</p>
            <button style={{ ...styles.button, backgroundColor: colors.accent }} onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div style={styles.tripList}>
            {trips.map((trip) => (
              <div key={trip.id} style={{ ...styles.tripCard, backgroundColor: colors.card }}>
                <div style={styles.tripHeader}>
                  <h3 style={{ color: colors.text, margin: 0, fontSize: '18px' }}>🚗 Trip</h3>
                  <span style={trip.status === 'completed' ? styles.statusCompleted : styles.statusActive}>
                    {trip.status === 'completed' ? '✅ Completed' : '🟢 Active'}
                  </span>
                </div>
                <p style={{ color: colors.textSecondary, margin: 0, fontSize: '14px' }}>
                  🔑 Room Code: <strong style={{ color: colors.accent, letterSpacing: '2px' }}>{trip.room_code}</strong>
                </p>
                <p style={{ color: colors.textSecondary, margin: 0, fontSize: '14px' }}>
                  📅 Date: {formatDate(trip.created_at)}
                </p>
                {trip.status === 'active' && (
                  <button
                    style={{ ...styles.rejoinButton, backgroundColor: colors.cardSecondary, color: colors.text, border: `2px solid ${colors.accent}` }}
                    onClick={() => navigate(`/trip/${trip.room_code}`)}
                  >
                    🔗 Rejoin Trip
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  content: { padding: '30px 20px', maxWidth: '600px', margin: '0 auto' },
  title: { fontSize: '24px', marginBottom: '20px' },
  emptyBox: {
    padding: '40px', borderRadius: '16px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center'
  },
  button: {
    padding: '12px 24px', color: 'white', border: 'none',
    borderRadius: '8px', fontSize: '14px', cursor: 'pointer', marginTop: '10px'
  },
  tripList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  tripCard: {
    padding: '20px', borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex', flexDirection: 'column', gap: '10px'
  },
  tripHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusCompleted: {
    backgroundColor: '#1b5e20', color: '#69f0ae',
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px'
  },
  statusActive: {
    backgroundColor: '#0d47a1', color: '#82b1ff',
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px'
  },
  rejoinButton: {
    padding: '10px', borderRadius: '8px',
    fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start'
  }
};

export default TripHistory;