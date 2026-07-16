const express = require("express");
const router = express.Router();
const {
  getPageTime,
  getMostVisited,
  getNavigationFlow,
  getEntrySources,
  getOverview,
} = require("../controllers/dashboardController");

router.get("/page-time", getPageTime);
router.get("/most-visited", getMostVisited);
router.get("/navigation-flow", getNavigationFlow);
router.get("/entry-sources", getEntrySources);
router.get("/overview", getOverview);

module.exports = router;
