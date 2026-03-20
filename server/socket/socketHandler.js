module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    socket.on('join-room', (data) => {
      socket.join(data.roomId);
      socket.userName = data.userName;
      socket.roomId = data.roomId;
      console.log(`User ${socket.id} joined room ${data.roomId}`);

      socket.to(data.roomId).emit('user-joined', {
        message: `${data.userName} joined the trip! 🚗`
      });

      io.to(data.roomId).emit('request-location-update');
    });

    socket.on('send-location', (data) => {
      io.to(data.roomId).emit('receive-location', {
        id: socket.id,
        lat: data.lat,
        lng: data.lng
      });
    });

    socket.on('send-message', (data) => {
      io.to(data.roomId).emit('receive-message', {
        id: socket.id,
        userName: data.userName,
        message: data.message,
        time: new Date().toLocaleTimeString()
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

    // End Trip
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
      }
      io.emit('user-disconnected', socket.id);
      console.log('❌ User disconnected:', socket.id);
    });
  });
};