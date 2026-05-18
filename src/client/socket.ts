import { io } from "socket.io-client";

const serverUrl = import.meta.env.VITE_GAME_SERVER_URL ?? "http://127.0.0.1:3001";

export const socket = io(serverUrl, {
  autoConnect: true,
  transports: ["websocket"]
});
