// Manual CORS middleware — works on Vercel serverless
module.exports = (req, res, next) => {
  const origin = req.headers.origin;

  // Allow all origins (or restrict to specific ones in production)
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight OPTIONS request immediately
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
};
