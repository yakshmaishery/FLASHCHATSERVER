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
   // broadcast Connect to all clients
   socket.on('CreateConnection', (data) => {
      let socketID = socket.id
      data["socketID"]=socketID
      io.emit('CreateConnection_BROADCAST', data);
   });

   // broadcast Connect Callback to all clients
   socket.on('CreateConnection_CallbackServer', (data) => {
      let socketID = socket.id
      data["socketID"]=socketID
      io.emit('CreateConnection_Callback', data); 
   });

   // Leave connection
   socket.on('LeaveConnection', (data) => {
      io.emit('LeaveConnection_BROADCAST', data); 
   });

   // Chat Messages
   socket.on('SocketChat', (data) => {
      io.emit('SocketChat_BROADCAST', data); 
   });

   // Start Sharing File
   socket.on("startFileTransfer", ({ type, name, size, AnotherID }) => {
      socket.broadcast.emit("startFileTransferAnother", { type, name, size, AnotherID })
   })

   // Sharing Chunk File
   socket.on("chunkFileTransfer", ({ type, name, size, data, offset, AnotherID }) => {
      socket.broadcast.emit("chunkFileTransferAnother", { type, name, size, data, offset, AnotherID })
   })

   // End Sharing File
   socket.on("endFileTransfer", ({ type, name, AnotherID }) => {
      socket.broadcast.emit("endFileTransferAnother", { type, name, AnotherID })
   })

   // End Sharing File Callback
   socket.on("endFileTransferAnotherCALLBACK", ({ msg, UserID, AnotherID }) => {
      socket.broadcast.emit("endFileTransferUserCALLBACK", { msg, UserID, AnotherID })
   })

   // Start Sharing Video call
   socket.on('VideoCallStart', (data) => {
      io.emit('VideoCallStart_BROADCAST', data);
   });

   // Image base64 Sharing Video call
   socket.on('VideoCalldataURL', (data) => {
      io.emit('VideoCalldataURL_BROADCAST', data);
   });

   // End Sharing Video call
   socket.on('VideoCallStops', (data) => {
      io.emit('VideoCallStops_BROADCAST', data);
   });
   
   // Start Sharing Screen Share
   socket.on('VideoCallScreenStart', (data) => {
      io.emit('VideoCallScreenStart_BROADCAST', data);
   });

   // Image base64 Sharing Screen Share
   socket.on('VideoCallScreendataURL', (data) => {
      io.emit('VideoCallScreendataURL_BROADCAST', data);
   });

   // End Sharing Screen Share
   socket.on('VideoCallScreenStops', (data) => {
      io.emit('VideoCallScreenStops_BROADCAST', data);
   });

   // Disconnect an User by force
   socket.on('DisconnectCurrentConnect', (data) => {
      const targetId = io.sockets.sockets.get(data.socketID)
      if(targetId){
         targetId.disconnect(true)
      }
   });

   socket.on('disconnect', () => {
      io.emit('SOCKETdisconnect', {socketID:socket.id});
   });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
   console.log(`Socket.IO server running at http://localhost:${PORT}/`);
});
