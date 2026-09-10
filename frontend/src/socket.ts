import { io } from "socket.io-client";

// Connect to your backend server
export const socket = io(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  {
    transports: ["websocket"], // ensures WebSocket transport
  },
);
