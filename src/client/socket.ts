import { io } from "socket.io-client";

const serverUrl = import.meta.env.VITE_GAME_SERVER_URL ?? `${window.location.protocol}//${window.location.hostname}:3001`;

export const socket = io(serverUrl, {
  autoConnect: true,
  transports: ["websocket"]
});
