const Session = require("../models/Session");
const PageView = require("../models/Pageview");
const NavigationFlow = require("../models/NavigationFlow");

const getPageTime = async (req, res) => {
  try {
    const data = await PageView.find({}).sort({ totalTimeSpent: -1 });
    const result = data.map((pv) => ({
      page: pv.page,
      totalSeconds: Math.round(pv.totalTimeSpent / 1000),
      avgSeconds: Math.round(pv.avgTimeSpent / 1000),
      visits: pv.totalVisits,
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMostVisited = async (req, res) => {
  try {
    const data = await PageView.find({}).sort({ totalVisits: -1 }).limit(10);
    const result = data.map((pv) => ({ page: pv.page, totalVisits: pv.totalVisits }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getNavigationFlow = async (req, res) => {
  try {
    const flows = await NavigationFlow.find({}).sort({ count: -1 }).limit(30);

    const nodeSet = new Set();
    flows.forEach((f) => { nodeSet.add(f.from); nodeSet.add(f.to); });
    const nodes = Array.from(nodeSet).map((name) => ({ name }));

    const links = flows.map((f) => ({
      source: nodes.findIndex((n) => n.name === f.from),
      target: nodes.findIndex((n) => n.name === f.to),
      value: f.count,
    }));

    res.json({ success: true, data: { nodes, links } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEntrySources = async (req, res) => {
  try {
    const result = await Session.aggregate([
      { $group: { _id: "$entrySource", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const data = result.map((r) => ({ source: r._id || "direct", count: r.count }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOverview = async (req, res) => {
  try {
    const [sessions, pageViews] = await Promise.all([
      Session.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgDuration: {
              $avg: {
                $cond: [
                  { $eq: ["$isActive", false] },
                  "$totalDuration",
                  null
                ]
              }
            },
            active: { $sum: { $cond: ["$isActive", 1, 0] } },
          },
        },
      ]),
      PageView.aggregate([
        { $group: { _id: null, totalViews: { $sum: "$totalVisits" } } },
      ]),
    ]);

    const s = sessions[0] || {};
    res.json({
      success: true,
      data: {
        totalSessions: s.total || 0,
        activeSessions: s.active || 0,
        avgDurationSeconds: Math.round((s.avgDuration || 0) / 1000),
        totalPageViews: pageViews[0]?.totalViews || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPageTime, getMostVisited, getNavigationFlow, getEntrySources, getOverview };
