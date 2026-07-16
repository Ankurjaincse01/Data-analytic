const socket_url = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API = `${socket_url}/api/dashboard`;

export { socket_url, API };
