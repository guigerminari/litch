import { io } from "socket.io-client";

const serverUrl = import.meta.env.VITE_GAME_SERVER_URL?.trim() || window.location.origin;

export const socket = io(serverUrl, {
  autoConnect: true,
  transports: ["websocket"]
});
