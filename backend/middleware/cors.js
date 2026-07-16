const cors = require("cors");

module.exports = cors({
  origin: true,
  methods: ["GET", "POST"],
  credentials: true,
});
