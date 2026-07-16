import { io } from "socket.io-client";
import { socket_url } from "./config";

const socket = io(socket_url);
export default socket;
