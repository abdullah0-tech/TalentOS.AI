import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

let socketInstance = null;

export const socketService = {
  connect(companyId) {
    if (socketInstance) return socketInstance;

    console.log(`🔌 Connecting to WebSocket server at: ${SOCKET_URL}`);
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('✅ WebSocket connected successfully!');
      if (companyId) {
        this.joinCompanyRoom(companyId);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    return socketInstance;
  },

  joinCompanyRoom(companyId) {
    if (!socketInstance) return;
    console.log(`👤 Joining company WebSocket room: ${companyId}`);
    socketInstance.emit('join_company', companyId);
  },

  on(event, callback) {
    if (!socketInstance) return;
    socketInstance.on(event, callback);
  },

  off(event, callback) {
    if (!socketInstance) return;
    socketInstance.off(event, callback);
  },

  disconnect() {
    if (!socketInstance) return;
    socketInstance.disconnect();
    socketInstance = null;
    console.log('🔌 WebSocket connection closed explicitly');
  }
};
