import { io } from "socket.io-client";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

export const socket = io(BACKEND_URL, {
  autoConnect: false,

  transports: ["polling", "websocket"],

  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,

  timeout: 10000,
});

export const connectSocket = () => {
  if (!socket.connected) {
    console.log("🔌 Connecting to:", BACKEND_URL);
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;