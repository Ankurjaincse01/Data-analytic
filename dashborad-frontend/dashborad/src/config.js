const socket_url = window.location.hostname === "localhost" && !["5000", "8000"].includes(window.location.port)
  ? "http://localhost:5000"
  : "";

const API = `${socket_url}/api/dashboard`;

export { socket_url, API };
