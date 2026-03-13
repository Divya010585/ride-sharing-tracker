module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send-location', (data) => {
      io.to(data.roomId).emit('receive-location', {
        id: socket.id,
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