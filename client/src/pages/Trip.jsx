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

const colors = ['blue', 'green', 'orange', 'yellow', 'violet', 'grey', 'black'];

const getColorIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const meetingIcon = getColorIcon('red');
const sosIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  popupAnchor: [1, -34],
});

const MapClickHandler = ({ onMapClick, settingMeetingPoint }) => {
  useMapEvents({
    click: (e) => {
      if (settingMeetingPoint) onMapClick(e.latlng);
    }
  });
  return null;
};

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢'];

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
  const [sosAlert, setSosAlert] = useState(null);
  const [sosLocation, setSosLocation] = useState(null);
  const [tripCreator, setTripCreator] = useState(false);
  const [weather, setWeather] = useState(null);
  const [showSosCountdown, setShowSosCountdown] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(30);
  const [allETAs, setAllETAs] = useState({});
  const [activeReactionMsg, setActiveReactionMsg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const lastMovementRef = useRef(Date.now());
  const countdownRef = useRef(null);
  const colorMapRef = useRef({});
  const colorIndexRef = useRef(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getUserColor = (id) => {
    if (!colorMapRef.current[id]) {
      colorMapRef.current[id] = colors[colorIndexRef.current % colors.length];
      colorIndexRef.current++;
    }
    return colorMapRef.current[id];
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`https://ride-sharing-tracker-backend.onrender.com/api/trips/${roomCode}`, {
      headers: { authorization: token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.trip && data.trip.created_by === user?.id) setTripCreator(true);
      })
      .catch(err => console.log(err));

    socket.connect();
    socket.emit('join-room', { roomId: roomCode, userName: user?.name });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        lastMovementRef.current = Date.now();
        if (!isGhost) {
          socket.emit('send-location', { roomId: roomCode, lat: latitude, lng: longitude, userName: user?.name });
        }
      },
      (error) => console.log('Location error:', error),
      { enableHighAccuracy: true }
    );

    socket.on('receive-location', (data) => {
      setOtherUsers((prev) => {
        const updated = { ...prev, [data.id]: { lat: data.lat, lng: data.lng, userName: data.userName } };
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
      setMessages((prev) => [...prev, { ...data, reactions: {} }]);
      setUnreadCount((prev) => prev + 1);
      socket.emit('message-read', { roomId: roomCode, msgId: data.msgId, userName: user?.name });
    });

    socket.on('receive-reaction', (data) => {
      setMessages((prev) => prev.map(msg => {
        if (msg.msgId === data.msgId) {
          const reactions = { ...msg.reactions };
          if (!reactions[data.emoji]) reactions[data.emoji] = [];
          if (!reactions[data.emoji].includes(data.userName)) {
            reactions[data.emoji] = [...reactions[data.emoji], data.userName];
          }
          return { ...msg, reactions };
        }
        return msg;
      }));
    });

    socket.on('receive-read', (data) => {
      setMessages((prev) => prev.map(msg => {
        if (msg.msgId === data.msgId) {
          return { ...msg, readBy: [...(msg.readBy || []), data.userName] };
        }
        return msg;
      }));
    });

    socket.on('user-joined', (data) => {
      setMessages((prev) => [...prev, { id: 'system', userName: 'System', message: data.message, time: new Date().toLocaleTimeString(), isSystem: true }]);
    });

    socket.on('user-left', (data) => {
      setMessages((prev) => [...prev, { id: 'system', userName: 'System', message: data.message, time: new Date().toLocaleTimeString(), isSystem: true }]);
    });

    socket.on('receive-meeting-point', (data) => {
      setMeetingPoint({ lat: data.lat, lng: data.lng });
    });

    socket.on('meeting-point-alert', (data) => {
      setMessages((prev) => [...prev, { id: 'system', userName: 'System', message: data.message, time: new Date().toLocaleTimeString(), isSystem: true }]);
    });

    socket.on('receive-sos', (data) => {
      setSosAlert(data.message);
      setSosLocation({ lat: data.lat, lng: data.lng });
      setTimeout(() => { setSosAlert(null); setSosLocation(null); }, 10000);
    });

    socket.on('trip-ended', (data) => {
      alert(data.message);
      socket.disconnect();
      navigate('/dashboard');
    });

    socket.on('request-location-update', () => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        if (!isGhost) {
          socket.emit('send-location', { roomId: roomCode, lat: latitude, lng: longitude, userName: user?.name });
        }
      });
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off('receive-location');
      socket.off('user-disconnected');
      socket.off('receive-message');
      socket.off('receive-reaction');
      socket.off('receive-read');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('receive-meeting-point');
      socket.off('meeting-point-alert');
      socket.off('receive-sos');
      socket.off('trip-ended');
      socket.off('request-location-update');
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, isGhost]);

  // Auto SOS
  useEffect(() => {
    const movementInterval = setInterval(() => {
      const timeSinceMovement = Date.now() - lastMovementRef.current;
      if (timeSinceMovement > 300000 && !showSosCountdown) {
        setShowSosCountdown(true);
        setSosCountdown(30);
      }
    }, 30000);
    return () => clearInterval(movementInterval);
  }, [showSosCountdown]);

  useEffect(() => {
    if (showSosCountdown) {
      countdownRef.current = setInterval(() => {
        setSosCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setShowSosCountdown(false);
            if (myLocation) {
              socket.emit('send-sos', { roomId: roomCode, userName: user?.name, lat: myLocation.lat, lng: myLocation.lng });
            }
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSosCountdown]);

  // All ETAs
  useEffect(() => {
    if (meetingPoint) {
      const etas = {};
      if (myLocation) {
        const dist = getDistance({ latitude: myLocation.lat, longitude: myLocation.lng }, { latitude: meetingPoint.lat, longitude: meetingPoint.lng });
        const km = (dist / 1000).toFixed(2);
        const mins = Math.ceil((km / 40) * 60);
        etas['me'] = { userName: user?.name, distance: km, minutes: mins };
        setMyETA({ distance: km, minutes: mins });
      }
      Object.entries(otherUsers).forEach(([id, loc]) => {
        const dist = getDistance({ latitude: loc.lat, longitude: loc.lng }, { latitude: meetingPoint.lat, longitude: meetingPoint.lng });
        const km = (dist / 1000).toFixed(2);
        const mins = Math.ceil((km / 40) * 60);
        etas[id] = { userName: loc.userName || 'Member', distance: km, minutes: mins };
      });
      setAllETAs(etas);
    }
  }, [myLocation, otherUsers, meetingPoint]);

  // Weather
  useEffect(() => {
    if (meetingPoint) {
      fetch(`https://wttr.in/${meetingPoint.lat},${meetingPoint.lng}?format=3`)
        .then(res => res.text())
        .then(data => setWeather(data))
        .catch(() => setWeather(null));
    }
  }, [meetingPoint]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (showChat) setUnreadCount(0);
  }, [showChat]);

  const handleMapClick = (latlng) => {
    setMeetingPoint({ lat: latlng.lat, lng: latlng.lng });
    setSettingMeetingPoint(false);
    socket.emit('set-meeting-point', { roomId: roomCode, lat: latlng.lat, lng: latlng.lng, userName: user?.name });
    alert('📍 Meeting point set! All users can see it!');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit('send-message', { roomId: roomCode, userName: user?.name, message: newMessage });
    setNewMessage('');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch('https://ride-sharing-tracker-backend.onrender.com/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      socket.emit('send-photo', { roomId: roomCode, userName: user?.name, photoUrl: data.photoUrl });
    } catch (err) {
      alert('Failed to upload photo!');
    }
    setUploading(false);
  };

  const handleReaction = (msgId, emoji) => {
    socket.emit('send-reaction', { roomId: roomCode, msgId, emoji, userName: user?.name });
    setActiveReactionMsg(null);
  };

  const handleSOS = () => {
    if (myLocation) {
      if (window.confirm('🆘 Send SOS alert to all trip members?')) {
        socket.emit('send-sos', { roomId: roomCode, userName: user?.name, lat: myLocation.lat, lng: myLocation.lng });
      }
    } else {
      alert('❌ Location not available yet!');
    }
  };

  const handleEndTrip = () => {
    if (window.confirm('🏁 Are you sure you want to end the trip for everyone?')) {
      socket.emit('end-trip', { roomId: roomCode, userName: user?.name });
    }
  };

  const handleLeave = () => { socket.disconnect(); navigate('/dashboard'); };
  const handleGhostMode = () => { setIsGhost(!isGhost); alert(isGhost ? '👁️ Ghost mode OFF!' : '👻 Ghost mode ON!'); };
  const handleCopyCode = () => { navigator.clipboard.writeText(roomCode); alert('✅ Room code copied!'); };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🚗 Live Trip</h2>
        <div style={styles.info}>
          <p style={styles.roomCode}>
            Room Code: <strong>{roomCode}</strong>
            <button style={styles.copyButton} onClick={handleCopyCode}>📋 Copy</button>
          </p>
          <p style={styles.status}>🟢 Connected · 👥 {participantCount} participant(s)</p>
        </div>
        <div style={styles.buttons}>
          <button style={settingMeetingPoint ? styles.etaButtonOn : styles.etaButtonOff} onClick={() => setSettingMeetingPoint(!settingMeetingPoint)}>
            {settingMeetingPoint ? '📍 Click map...' : '📍 Set Meeting Point'}
          </button>
          <button style={isGhost ? styles.ghostButtonOn : styles.ghostButtonOff} onClick={handleGhostMode}>
            {isGhost ? '👻 Ghost ON' : '👁️ Ghost OFF'}
          </button>
          <button style={styles.chatButton} onClick={() => setShowChat(!showChat)}>
            💬 Chat {unreadCount > 0 && !showChat && <span style={styles.badge}>{unreadCount}</span>}
          </button>
          <button style={styles.sosButton} onClick={handleSOS}>🆘 SOS</button>
          {tripCreator && <button style={styles.endTripButton} onClick={handleEndTrip}>🏁 End Trip</button>}
          <button style={styles.leaveButton} onClick={handleLeave}>🚪 Leave</button>
        </div>
      </div>

      {sosAlert && <div style={styles.sosBanner}>🆘 {sosAlert}</div>}

      {showSosCountdown && (
        <div style={styles.sosCountdownBanner}>
          <p style={styles.sosCountdownText}>⚠️ No movement detected! Are you okay?</p>
          <p style={styles.sosCountdownNumber}>{sosCountdown}</p>
          <button style={styles.imOkButton} onClick={() => {
            setShowSosCountdown(false);
            lastMovementRef.current = Date.now();
            clearInterval(countdownRef.current);
          }}>✅ I'm OK!</button>
        </div>
      )}

      {myETA && (
        <div style={styles.etaBanner}>
          📍 Meeting Point Set · 🚗 {myETA.distance} km away · ⏱️ ETA: {myETA.minutes} min
          {weather && <span style={styles.weatherText}> · 🌤️ {weather}</span>}
        </div>
      )}

      {Object.keys(allETAs).length > 0 && (
        <div style={styles.etaPanel}>
          <p style={styles.etaPanelTitle}>⏱️ All Members ETA:</p>
          <div style={styles.etaList}>
            {Object.entries(allETAs).map(([id, eta]) => (
              <span key={id} style={styles.etaItem}>👤 {eta.userName}: {eta.distance}km · {eta.minutes}min</span>
            ))}
          </div>
        </div>
      )}

      <div style={styles.mainContent}>
        <div style={{ flex: 1 }}>
          {myLocation ? (
            <MapContainer center={[myLocation.lat, myLocation.lng]} zoom={15} style={{ height: 'calc(100vh - 160px)', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
              <MapClickHandler onMapClick={handleMapClick} settingMeetingPoint={settingMeetingPoint} />
              {!isGhost && (
                <Marker position={[myLocation.lat, myLocation.lng]} icon={getColorIcon('blue')}>
                  <Popup>📍 You ({user?.name})</Popup>
                </Marker>
              )}
              {Object.entries(otherUsers).map(([id, location]) => (
                <Marker key={id} position={[location.lat, location.lng]} icon={getColorIcon(getUserColor(id))}>
                  <Popup>
                    👤 {location.userName || 'Member'}
                    {allETAs[id] && <><br />📍 {allETAs[id].distance} km<br />⏱️ ETA: {allETAs[id].minutes} min</>}
                  </Popup>
                </Marker>
              ))}
              {meetingPoint && <Marker position={[meetingPoint.lat, meetingPoint.lng]} icon={meetingIcon}><Popup>📍 Meeting Point</Popup></Marker>}
              {sosLocation && <Marker position={[sosLocation.lat, sosLocation.lng]} icon={sosIcon}><Popup>🆘 SOS Location!</Popup></Marker>}
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
              <button style={styles.closeChat} onClick={() => setShowChat(false)}>✕</button>
            </div>
            <div style={styles.messagesContainer}>
              {messages.length === 0 && <p style={styles.noMessages}>No messages yet — say hi! 👋</p>}
              {messages.map((msg, index) => (
                <div key={index}>
                  <div
                    style={msg.isSystem ? styles.systemMessage : msg.id === socket.id ? styles.myMessage : styles.otherMessage}
                    onDoubleClick={() => !msg.isSystem && setActiveReactionMsg(activeReactionMsg === msg.msgId ? null : msg.msgId)}
                  >
                    {!msg.isSystem && <p style={styles.messageName}>{msg.userName}</p>}
                    {msg.type === 'photo' ? (
                      <img src={msg.message} alt="shared" style={styles.chatPhoto} />
                    ) : (
                      <p style={styles.messageText}>{msg.message}</p>
                    )}
                    <div style={styles.messageFooter}>
                      <p style={styles.messageTime}>{msg.time}</p>
                      {msg.id === socket.id && (
                        <span style={styles.readReceipt}>
                          {msg.readBy && msg.readBy.length > 0 ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reactions display */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div style={msg.id === socket.id ? styles.reactionsRight : styles.reactionsLeft}>
                      {Object.entries(msg.reactions).map(([emoji, users]) => (
                        <span key={emoji} style={styles.reactionBubble} title={users.join(', ')}>
                          {emoji} {users.length}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reaction picker */}
                  {activeReactionMsg === msg.msgId && (
                    <div style={msg.id === socket.id ? styles.reactionPickerRight : styles.reactionPickerLeft}>
                      {REACTIONS.map(emoji => (
                        <span key={emoji} style={styles.reactionOption} onClick={() => handleReaction(msg.msgId, emoji)}>
                          {emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={styles.chatInput}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              <button style={styles.photoButton} onClick={() => fileInputRef.current.click()} disabled={uploading}>
                {uploading ? '⏳' : '📷'}
              </button>
              <input
                style={styles.messageInput}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button style={styles.sendButton} onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a2e' },
  header: { backgroundColor: '#16213e', padding: '15px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 },
  title: { margin: 0, color: 'white', fontSize: '18px' },
  info: { textAlign: 'center' },
  roomCode: { margin: 0, color: 'white', fontSize: '14px' },
  copyButton: { marginLeft: '10px', padding: '4px 10px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  status: { margin: 0, fontSize: '12px', color: '#888' },
  buttons: { display: 'flex', gap: '10px', alignItems: 'center' },
  etaButtonOff: { padding: '8px 16px', backgroundColor: '#0f3460', color: 'white', border: '2px solid #ff9800', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  etaButtonOn: { padding: '8px 16px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  ghostButtonOff: { padding: '8px 16px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  ghostButtonOn: { padding: '8px 16px', backgroundColor: '#673ab7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  chatButton: { padding: '8px 16px', backgroundColor: '#0f3460', color: 'white', border: '2px solid #e94560', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', position: 'relative' },
  badge: { backgroundColor: '#e94560', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px', marginLeft: '5px' },
  sosButton: { padding: '8px 16px', backgroundColor: '#ff0000', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' },
  endTripButton: { padding: '8px 16px', backgroundColor: '#ff6600', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' },
  leaveButton: { padding: '8px 16px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  sosBanner: { backgroundColor: '#ff0000', color: 'white', padding: '12px 20px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' },
  sosCountdownBanner: { backgroundColor: '#ff6600', color: 'white', padding: '15px 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' },
  sosCountdownText: { margin: 0, fontSize: '16px', fontWeight: 'bold' },
  sosCountdownNumber: { margin: 0, fontSize: '28px', fontWeight: 'bold' },
  imOkButton: { padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' },
  etaBanner: { backgroundColor: '#ff9800', color: 'white', padding: '8px 20px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' },
  weatherText: { fontSize: '12px', opacity: 0.9 },
  etaPanel: { backgroundColor: '#16213e', padding: '8px 20px', borderBottom: '1px solid #0f3460' },
  etaPanelTitle: { color: '#888', margin: '0 0 5px 0', fontSize: '12px' },
  etaList: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  etaItem: { color: 'white', fontSize: '12px', backgroundColor: '#0f3460', padding: '4px 10px', borderRadius: '20px' },
  mainContent: { display: 'flex', flex: 1, overflow: 'hidden' },
  loading: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', height: 'calc(100vh - 80px)' },
  loadingText: { fontSize: '24px', color: 'white' },
  loadingSubtext: { fontSize: '16px', color: '#888' },
  chatSidebar: { width: '320px', backgroundColor: '#16213e', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #0f3460', height: 'calc(100vh - 80px)' },
  chatHeader: { padding: '15px', borderBottom: '1px solid #0f3460', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatTitle: { margin: 0, color: 'white', fontSize: '16px' },
  closeChat: { backgroundColor: 'transparent', border: 'none', color: '#888', fontSize: '16px', cursor: 'pointer' },
  messagesContainer: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
  noMessages: { color: '#888', textAlign: 'center', fontSize: '14px', marginTop: '20px' },
  myMessage: { backgroundColor: '#e94560', padding: '10px', borderRadius: '10px 10px 0 10px', alignSelf: 'flex-end', maxWidth: '80%', cursor: 'pointer' },
  otherMessage: { backgroundColor: '#0f3460', padding: '10px', borderRadius: '10px 10px 10px 0', alignSelf: 'flex-start', maxWidth: '80%', cursor: 'pointer' },
  systemMessage: { backgroundColor: '#333', padding: '8px', borderRadius: '8px', alignSelf: 'center', maxWidth: '90%' },
  messageName: { margin: '0 0 4px 0', color: '#aaa', fontSize: '11px', fontWeight: 'bold' },
  messageText: { margin: 0, color: 'white', fontSize: '14px' },
  chatPhoto: { maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', cursor: 'pointer' },
  messageFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },
  messageTime: { margin: 0, color: '#aaa', fontSize: '10px' },
  readReceipt: { color: '#aaa', fontSize: '11px' },
  reactionsRight: { display: 'flex', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' },
  reactionsLeft: { display: 'flex', gap: '4px', justifyContent: 'flex-start', marginTop: '2px' },
  reactionBubble: { backgroundColor: '#0f3460', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' },
  reactionPickerRight: { display: 'flex', gap: '8px', justifyContent: 'flex-end', backgroundColor: '#16213e', padding: '8px', borderRadius: '20px', marginTop: '4px' },
  reactionPickerLeft: { display: 'flex', gap: '8px', justifyContent: 'flex-start', backgroundColor: '#16213e', padding: '8px', borderRadius: '20px', marginTop: '4px' },
  reactionOption: { fontSize: '20px', cursor: 'pointer' },
  chatInput: { padding: '15px', borderTop: '1px solid #0f3460', display: 'flex', gap: '10px' },
  photoButton: { padding: '10px', backgroundColor: '#0f3460', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
  messageInput: { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #0f3460', backgroundColor: '#0f3460', color: 'white', fontSize: '14px', outline: 'none' },
  sendButton: { padding: '10px 16px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }
};

export default Trip;