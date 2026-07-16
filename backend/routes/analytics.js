const express = require("express");
const router = express.Router();
const { trackEvent, endSession } = require("../controllers/analyticsController");

router.post("/event", trackEvent);
router.post("/session/end", endSession);

module.exports = router;
