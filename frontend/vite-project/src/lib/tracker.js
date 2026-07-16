// Generates or retrieves a unique session ID from localStorage
export const getSessionId = () => {
  let id = localStorage.getItem("sessionId");
  if (!id) {
    id = "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("sessionId", id);
  }
  return id;
};

// Detects where the user came from
export const getEntrySource = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("utm_source")) return "campaign";
  if (!document.referrer) return "direct";
  if (document.referrer.includes(window.location.hostname)) return "internal";
  return "referral";
};

// Sends a page visit event to the backend
export const sendEvent = (data) => {
  fetch("http://localhost:8000/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).catch(() => {});
};

// Sends session-end event (called when tab closes)
export const sendSessionEnd = (sessionId, page, timeSpent) => {
  const blob = new Blob(
    [JSON.stringify({ sessionId, page, timeSpent })],
    { type: "application/json" }
  );
  navigator.sendBeacon("http://localhost:8000/api/analytics/session/end", blob);
};
