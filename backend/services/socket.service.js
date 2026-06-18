let ioInstance = null;

const init = (server) => {
  const { Server } = require('socket.io');
  ioInstance = new Server(server, {
    cors: {
      origin: '*', // Allow development clients
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room for company workspace isolation
    socket.on('join_company', (companyId) => {
      if (companyId) {
        socket.join(companyId);
        console.log(`👤 Client ${socket.id} joined room/company: ${companyId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

const getIo = () => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized. Please call init() first.');
  }
  return ioInstance;
};

/**
 * Emit an event only to users in a specific company's room.
 */
const emitToCompany = (companyId, event, data) => {
  try {
    const io = getIo();
    io.to(companyId).emit(event, data);
    console.log(`📡 Broadcasted event "${event}" to company: ${companyId}`);
  } catch (error) {
    console.error('Socket broadcast error:', error.message);
  }
};

module.exports = {
  init,
  getIo,
  emitToCompany
};
