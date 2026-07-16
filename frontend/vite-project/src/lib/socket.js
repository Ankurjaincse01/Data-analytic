import { io } from "socket.io-client";

const socketUrl = window.location.hostname === "localhost" && !["5000", "8000"].includes(window.location.port)
  ? "http://localhost:5000"
  : "/";

const socket = io(socketUrl);

export default socket;
