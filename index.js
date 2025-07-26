const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const app = express();

// Enable CORS for all origins
app.use(cors());

const server = http.createServer(app);

// Create Socket.IO server with CORS enabled
const io = new Server(server, {
   cors: {
      origin: '*', // Allow all origins. You can restrict to specific domains
      methods: ['GET', 'POST']
   }
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/Index.html'));
});

// Listen for client connections
io.on('connection', (socket) => {
   //   console.log('A user connected:', socket.id);
   socket.on('CreateConnection', (data) => {
      io.emit('CreateConnection_BROADCAST', data); // broadcast message to all clients
   });

   socket.on('CreateConnection_CallbackServer', (data) => {
      io.emit('CreateConnection_Callback', data); // broadcast message to all clients
   });

   socket.on('LeaveConnection', (data) => {
      io.emit('LeaveConnection_BROADCAST', data); // broadcast message to all clients
   });

   socket.on('SocketChat', (data) => {
      io.emit('SocketChat_BROADCAST', data); // broadcast message to all clients
   });

   socket.on("startFileTransfer", ({ type, name, size, AnotherID }) => {
      socket.broadcast.emit("startFileTransferAnother", { type, name, size, AnotherID })
   })
   socket.on("chunkFileTransfer", ({ type, name, size, data, offset, AnotherID }) => {
      socket.broadcast.emit("chunkFileTransferAnother", { type, name, size, data, offset, AnotherID })
   })
   socket.on("endFileTransfer", ({ type, name, AnotherID }) => {
      socket.broadcast.emit("endFileTransferAnother", { type, name, AnotherID })
   })
   socket.on("endFileTransferAnotherCALLBACK", ({ msg, UserID, AnotherID }) => {
      socket.broadcast.emit("endFileTransferUserCALLBACK", { msg, UserID, AnotherID })
   })
   socket.on('VideoCallStart', (data) => {
      io.emit('VideoCallStart_BROADCAST', data); // broadcast message to all clients
   });
   socket.on('VideoCalldataURL', (data) => {
      io.emit('VideoCalldataURL_BROADCAST', data); // broadcast message to all clients
   });
   socket.on('VideoCallStops', (data) => {
      io.emit('VideoCallStops_BROADCAST', data); // broadcast message to all clients
   });

   socket.on('disconnect', () => {
      //  console.log('User disconnected:', socket.id);
   });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
   console.log(`Socket.IO server running at http://localhost:${PORT}/`);
});
