import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get('https://ride-sharing-tracker-backend.onrender.com/api/trips/history', {
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
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.title}>📋 Trip History</h2>

        {loading ? (
          <p style={styles.loading}>Loading trips...</p>
        ) : trips.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>🚗 No trips yet!</p>
            <p style={styles.emptySubtext}>Create or join a trip to see history here</p>
            <button style={styles.button} onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div style={styles.tripList}>
            {trips.map((trip) => (
              <div key={trip.id} style={styles.tripCard}>
                <div style={styles.tripHeader}>
                  <h3 style={styles.tripTitle}>🚗 Trip</h3>
                  <span style={
                    trip.status === 'completed'
                      ? styles.statusCompleted
                      : styles.statusActive
                  }>
                    {trip.status === 'completed' ? '✅ Completed' : '🟢 Active'}
                  </span>
                </div>
                <div style={styles.tripDetails}>
                  <p style={styles.tripDetail}>
                    🔑 Room Code: <strong style={styles.roomCode}>{trip.room_code}</strong>
                  </p>
                  <p style={styles.tripDetail}>
                    📅 Date: {formatDate(trip.created_at)}
                  </p>
                </div>
                {trip.status === 'active' && (
                  <button
                    style={styles.rejoinButton}
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
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a2e'
  },
  content: {
    padding: '30px 20px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  title: {
    color: 'white',
    fontSize: '24px',
    marginBottom: '20px'
  },
  loading: {
    color: '#888',
    textAlign: 'center'
  },
  emptyBox: {
    backgroundColor: '#16213e',
    padding: '40px',
    borderRadius: '16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center'
  },
  emptyText: {
    color: 'white',
    fontSize: '24px',
    margin: 0
  },
  emptySubtext: {
    color: '#888',
    fontSize: '14px',
    margin: 0
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  tripList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  tripCard: {
    backgroundColor: '#16213e',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  tripHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tripTitle: {
    color: 'white',
    margin: 0,
    fontSize: '18px'
  },
  statusCompleted: {
    backgroundColor: '#1b5e20',
    color: '#69f0ae',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  statusActive: {
    backgroundColor: '#0d47a1',
    color: '#82b1ff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  tripDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  tripDetail: {
    color: '#888',
    margin: 0,
    fontSize: '14px'
  },
  roomCode: {
    color: '#e94560',
    letterSpacing: '2px'
  },
  rejoinButton: {
    padding: '10px',
    backgroundColor: '#0f3460',
    color: 'white',
    border: '2px solid #e94560',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    alignSelf: 'flex-start'
  }
};

export default TripHistory;