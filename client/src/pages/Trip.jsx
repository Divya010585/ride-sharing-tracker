import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getDistance } from 'geolib';
import socket from '../socket';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const meetingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapClickHandler = ({ onMapClick, settingMeetingPoint }) => {
  useMapEvents({
    click: (e) => {
      if (settingMeetingPoint) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
};

const Trip = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [myLocation, setMyLocation] = useState(null);
  const [otherUsers, setOtherUsers] = useState({});
  const [isGhost, setIsGhost] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [meetingPoint, setMeetingPoint] = useState(null);
  const [settingMeetingPoint, setSettingMeetingPoint] = useState(false);
  const [myETA, setMyETA] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.emit('join-room', {
      roomId: roomCode,
      userName: user?.name
    });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMyLocation({ lat: latitude, lng: longitude });

        if (!isGhost) {
          socket.emit('send-location', {
            roomId: roomCode,
            lat: latitude,
            lng: longitude
          });
        }
      },
      (error) => console.log('Location error:', error),
      { enableHighAccuracy: true }
    );

    socket.on('receive-location', (data) => {
      setOtherUsers((prev) => {
        const updated = {
          ...prev,
          [data.id]: { lat: data.lat, lng: data.lng }
        };
        setParticipantCount(Object.keys(updated).length + 1);
        return updated;
      });
    });

    socket.on('user-disconnected', (id) => {
      setOtherUsers((prev) => {
        const updated = { ...prev };
        delete updated[id];
        setParticipantCount(Object.keys(updated).length + 1);
        return updated;
      });
    });

    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('user-joined', (data) => {
      setMessages((prev) => [...prev, {
        id: 'system',
        userName: 'System',
        message: data.message,
        time: new Date().toLocaleTimeString(),
        isSystem: true
      }]);
    });

    socket.on('receive-meeting-point', (data) => {
      setMeetingPoint({ lat: data.lat, lng: data.lng });
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off('receive-location');
      socket.off('user-disconnected');
      socket.off('receive-message');
      socket.off('user-joined');
      socket.off('receive-meeting-point');
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, isGhost]);

  useEffect(() => {
    if (myLocation && meetingPoint) {
      const distanceInMeters = getDistance(
        { latitude: myLocation.lat, longitude: myLocation.lng },
        { latitude: meetingPoint.lat, longitude: meetingPoint.lng }
      );
      const distanceInKm = (distanceInMeters / 1000).toFixed(2);
      const timeInMinutes = Math.ceil((distanceInKm / 40) * 60);
      setMyETA({ distance: distanceInKm, minutes: timeInMinutes });
    }
  }, [myLocation, meetingPoint]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (showChat) setUnreadCount(0);
  }, [showChat]);

  const handleMapClick = (latlng) => {
    setMeetingPoint({ lat: latlng.lat, lng: latlng.lng });
    setSettingMeetingPoint(false);
    socket.emit('set-meeting-point', {
      roomId: roomCode,
      lat: latlng.lat,
      lng: latlng.lng
    });
    alert('📍 Meeting point set! All users can see it!');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit('send-message', {
      roomId: roomCode,
      userName: user?.name,
      message: newMessage
    });
    setNewMessage('');
  };

  const handleLeave = () => {
    socket.disconnect();
    navigate('/dashboard');
  };

  const handleGhostMode = () => {
    setIsGhost(!isGhost);
    alert(isGhost ? '👁️ Ghost mode OFF!' : '👻 Ghost mode ON!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('✅ Room code copied!');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🚗 Live Trip</h2>
        <div style={styles.info}>
          <p style={styles.roomCode}>
            Room Code: <strong>{roomCode}</strong>
            <button style={styles.copyButton} onClick={handleCopyCode}>
              📋 Copy
            </button>
          </p>
          <p style={styles.status}>
            🟢 Connected · 👥 {participantCount} participant(s)
          </p>
        </div>
        <div style={styles.buttons}>
          <button
            style={settingMeetingPoint ? styles.etaButtonOn : styles.etaButtonOff}
            onClick={() => setSettingMeetingPoint(!settingMeetingPoint)}
          >
            {settingMeetingPoint ? '📍 Click map...' : '📍 Set Meeting Point'}
          </button>
          <button
            style={isGhost ? styles.ghostButtonOn : styles.ghostButtonOff}
            onClick={handleGhostMode}
          >
            {isGhost ? '👻 Ghost ON' : '👁️ Ghost OFF'}
          </button>
          <button
            style={styles.chatButton}
            onClick={() => setShowChat(!showChat)}
          >
            💬 Chat {unreadCount > 0 && !showChat && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </button>
          <button style={styles.leaveButton} onClick={handleLeave}>
            🚪 Leave
          </button>
        </div>
      </div>

      {myETA && (
        <div style={styles.etaBanner}>
          📍 Meeting Point Set · 🚗 {myETA.distance} km away · ⏱️ ETA: {myETA.minutes} min
        </div>
      )}

      <div style={styles.mainContent}>
        <div style={{ flex: 1 }}>
          {myLocation ? (
            <MapContainer
              center={[myLocation.lat, myLocation.lng]}
              zoom={15}
              style={{ height: myETA ? 'calc(100vh - 120px)' : 'calc(100vh - 80px)', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              <MapClickHandler
                onMapClick={handleMapClick}
                settingMeetingPoint={settingMeetingPoint}
              />
              {!isGhost && (
                <Marker position={[myLocation.lat, myLocation.lng]}>
                  <Popup>📍 You ({user?.name})</Popup>
                </Marker>
              )}
              {Object.entries(otherUsers).map(([id, location]) => (
                <Marker key={id} position={[location.lat, location.lng]}>
                  <Popup>👤 Another User</Popup>
                </Marker>
              ))}
              {meetingPoint && (
                <Marker
                  position={[meetingPoint.lat, meetingPoint.lng]}
                  icon={meetingIcon}
                >
                  <Popup>📍 Meeting Point</Popup>
                </Marker>
              )}
            </MapContainer>
          ) : (
            <div style={styles.loading}>
              <p style={styles.loadingText}>📍 Getting your location...</p>
              <p style={styles.loadingSubtext}>Please allow location access!</p>
            </div>
          )}
        </div>

        {showChat && (
          <div style={styles.chatSidebar}>
            <div style={styles.chatHeader}>
              <h3 style={styles.chatTitle}>💬 Trip Chat</h3>
              <button style={styles.closeChat} onClick={() => setShowChat(false)}>
                ✕
              </button>
            </div>
            <div style={styles.messagesContainer}>
              {messages.length === 0 && (
                <p style={styles.noMessages}>No messages yet — say hi! 👋</p>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={
                    msg.isSystem
                      ? styles.systemMessage
                      : msg.id === socket.id
                      ? styles.myMessage
                      : styles.otherMessage
                  }
                >
                  {!msg.isSystem && (
                    <p style={styles.messageName}>{msg.userName}</p>
                  )}
                  <p style={styles.messageText}>{msg.message}</p>
                  <p style={styles.messageTime}>{msg.time}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={styles.chatInput}>
              <input
                style={styles.messageInput}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button style={styles.sendButton} onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1a1a2e'
  },
  header: {
    backgroundColor: '#16213e',
    padding: '15px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000
  },
  title: {
    margin: 0,
    color: 'white',
    fontSize: '18px'
  },
  info: {
    textAlign: 'center'
  },
  roomCode: {
    margin: 0,
    color: 'white',
    fontSize: '14px'
  },
  copyButton: {
    marginLeft: '10px',
    padding: '4px 10px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  status: {
    margin: 0,
    fontSize: '12px',
    color: '#888'
  },
  buttons: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  etaButtonOff: {
    padding: '8px 16px',
    backgroundColor: '#0f3460',
    color: 'white',
    border: '2px solid #ff9800',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  etaButtonOn: {
    padding: '8px 16px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  ghostButtonOff: {
    padding: '8px 16px',
    backgroundColor: '#9e9e9e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  ghostButtonOn: {
    padding: '8px 16px',
    backgroundColor: '#673ab7',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  chatButton: {
    padding: '8px 16px',
    backgroundColor: '#0f3460',
    color: 'white',
    border: '2px solid #e94560',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    position: 'relative'
  },
  badge: {
    backgroundColor: '#e94560',
    color: 'white',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '11px',
    marginLeft: '5px'
  },
  leaveButton: {
    padding: '8px 16px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  etaBanner: {
    backgroundColor: '#ff9800',
    color: 'white',
    padding: '8px 20px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  loading: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    height: 'calc(100vh - 80px)'
  },
  loadingText: {
    fontSize: '24px',
    color: 'white'
  },
  loadingSubtext: {
    fontSize: '16px',
    color: '#888'
  },
  chatSidebar: {
    width: '320px',
    backgroundColor: '#16213e',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid #0f3460',
    height: 'calc(100vh - 80px)'
  },
  chatHeader: {
    padding: '15px',
    borderBottom: '1px solid #0f3460',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chatTitle: {
    margin: 0,
    color: 'white',
    fontSize: '16px'
  },
  closeChat: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '16px',
    cursor: 'pointer'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  noMessages: {
    color: '#888',
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '20px'
  },
  myMessage: {
    backgroundColor: '#e94560',
    padding: '10px',
    borderRadius: '10px 10px 0 10px',
    alignSelf: 'flex-end',
    maxWidth: '80%'
  },
  otherMessage: {
    backgroundColor: '#0f3460',
    padding: '10px',
    borderRadius: '10px 10px 10px 0',
    alignSelf: 'flex-start',
    maxWidth: '80%'
  },
  systemMessage: {
    backgroundColor: '#333',
    padding: '8px',
    borderRadius: '8px',
    alignSelf: 'center',
    maxWidth: '90%'
  },
  messageName: {
    margin: '0 0 4px 0',
    color: '#aaa',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  messageText: {
    margin: 0,
    color: 'white',
    fontSize: '14px'
  },
  messageTime: {
    margin: '4px 0 0 0',
    color: '#aaa',
    fontSize: '10px',
    textAlign: 'right'
  },
  chatInput: {
    padding: '15px',
    borderTop: '1px solid #0f3460',
    display: 'flex',
    gap: '10px'
  },
  messageInput: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #0f3460',
    backgroundColor: '#0f3460',
    color: 'white',
    fontSize: '14px',
    outline: 'none'
  },
  sendButton: {
    padding: '10px 16px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};

export default Trip;