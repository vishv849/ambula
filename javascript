const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/ambulance_tracking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define Ambulance Schema
const ambulanceSchema = new mongoose.Schema({
  id: String,
  lat: Number,
  lng: Number
});

const Ambulance = mongoose.model('Ambulance', ambulanceSchema);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle ambulance location update
  socket.on('update-location', async (data) => {
    const { id, lat, lng } = data;
    await Ambulance.findOneAndUpdate({ id }, { lat, lng }, { upsert: true });
    io.emit('location-update', data); // Broadcast location update
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start server
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
