module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    socket.on('join-room', (data) => {
      socket.join(data.roomId);
      socket.userName = data.userName;
      console.log(`User ${socket.id} joined room ${data.roomId}`);

      // Notify others that a new user joined
      socket.to(data.roomId).emit('user-joined', {
        message: `${data.userName} joined the trip! 🚗`
      });

      // Ask all users to re-send their location
      io.to(data.roomId).emit('request-location-update');
    });

    // Handle live location
    socket.on('send-location', (data) => {
      io.to(data.roomId).emit('receive-location', {
        id: socket.id,
        lat: data.lat,
        lng: data.lng
      });
    });

    // Handle chat messages
    socket.on('send-message', (data) => {
      io.to(data.roomId).emit('receive-message', {
        id: socket.id,
        userName: data.userName,
        message: data.message,
        time: new Date().toLocaleTimeString()
      });
    });

    // Handle meeting point — io.to sends to EVERYONE including sender
    socket.on('set-meeting-point', (data) => {
      io.to(data.roomId).emit('receive-meeting-point', {
        lat: data.lat,
        lng: data.lng
      });
    });

    socket.on('disconnect', () => {
      io.emit('user-disconnected', socket.id);
      console.log('❌ User disconnected:', socket.id);
    });
  });
};