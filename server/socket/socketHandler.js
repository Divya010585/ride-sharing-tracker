module.exports = (io) => {
  const roomMembers = {};

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    socket.on('join-room', (data) => {
      socket.join(data.roomId);
      socket.userName = data.userName;
      socket.roomId = data.roomId;

      if (!roomMembers[data.roomId]) roomMembers[data.roomId] = {};
      roomMembers[data.roomId][socket.id] = { userName: data.userName, online: true };

      socket.to(data.roomId).emit('user-joined', {
        message: `${data.userName} joined the trip! 🚗`
      });

      io.to(data.roomId).emit('room-members', roomMembers[data.roomId]);
      io.to(data.roomId).emit('request-location-update');
    });

    socket.on('send-location', (data) => {
      io.to(data.roomId).emit('receive-location', {
        id: socket.id,
        lat: data.lat,
        lng: data.lng,
        userName: data.userName
      });
    });

    socket.on('send-message', (data) => {
      const msgId = Date.now().toString();
      io.to(data.roomId).emit('receive-message', {
        id: socket.id,
        msgId,
        userName: data.userName,
        message: data.message,
        type: 'text',
        time: new Date().toLocaleTimeString(),
        reactions: {}
      });
    });

    // Photo and Audio message - uses data.type
    socket.on('send-photo', (data) => {
      const msgId = Date.now().toString();
      io.to(data.roomId).emit('receive-message', {
        id: socket.id,
        msgId,
        userName: data.userName,
        message: data.photoUrl,
        type: data.type || 'photo',
        time: new Date().toLocaleTimeString(),
        reactions: {}
      });
    });

    socket.on('send-reaction', (data) => {
      io.to(data.roomId).emit('receive-reaction', {
        msgId: data.msgId,
        emoji: data.emoji,
        userName: data.userName
      });
    });

    socket.on('message-read', (data) => {
      socket.to(data.roomId).emit('receive-read', {
        msgId: data.msgId,
        userName: data.userName
      });
    });

    socket.on('set-meeting-point', (data) => {
      io.to(data.roomId).emit('receive-meeting-point', {
        lat: data.lat,
        lng: data.lng
      });
      socket.to(data.roomId).emit('meeting-point-alert', {
        message: `📍 ${data.userName} set a meeting point!`
      });
    });

    socket.on('send-sos', (data) => {
      io.to(data.roomId).emit('receive-sos', {
        userName: data.userName,
        lat: data.lat,
        lng: data.lng,
        message: `🆘 ${data.userName} needs help!`
      });
    });

    socket.on('end-trip', (data) => {
      io.to(data.roomId).emit('trip-ended', {
        message: `🏁 Trip has been ended by ${data.userName}!`
      });
    });

    socket.on('disconnect', () => {
      if (socket.roomId && socket.userName) {
        socket.to(socket.roomId).emit('user-left', {
          message: `${socket.userName} left the trip! 👋`
        });
        if (roomMembers[socket.roomId]) {
          delete roomMembers[socket.roomId][socket.id];
          io.to(socket.roomId).emit('room-members', roomMembers[socket.roomId]);
        }
      }
      io.emit('user-disconnected', socket.id);
      console.log('❌ User disconnected:', socket.id);
    });
  });
};