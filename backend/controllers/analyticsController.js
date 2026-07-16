const Session = require("../models/Session");
const PageView = require("../models/Pageview");
const NavigationFlow = require("../models/NavigationFlow");

const trackEvent = async (req, res) => {
  try {
    const { sessionId, page, from, timeSpent, entrySource, referrer, userAgent } = req.body;

    if (!sessionId || !page) {
      return res.status(400).json({ error: "sessionId and page are required" });
    }

    let session = await Session.findOne({ sessionId });
    const isNewSession = !session;

    if (!session) {
      session = new Session({
        sessionId,
        entrySource: entrySource || "direct",
        referrer: referrer || "",
        userAgent: userAgent || "",
        navigationPath: [page],
      });
    } else {
      const lastPage = session.navigationPath[session.navigationPath.length - 1];
      if (lastPage !== page) session.navigationPath.push(page);
    }

    // Track ARRIVAL on current page immediately so dashboard shows it right away
    await PageView.findOneAndUpdate(
      { page },
      { $inc: { totalVisits: 1 }, $set: { lastVisited: new Date() } },
      { upsert: true }
    );

    // Track TIME SPENT on the previous page
    if (from && timeSpent > 0) {
      session.pageVisits.push({ page: from, timeSpent });

      const pv = await PageView.findOneAndUpdate(
        { page: from },
        { $inc: { totalTimeSpent: timeSpent }, $set: { lastVisited: new Date() } },
        { upsert: true, returnDocument: "after" }
      );
      if (pv && pv.totalVisits > 0) {
        pv.avgTimeSpent = Math.round(pv.totalTimeSpent / pv.totalVisits);
        await pv.save();
      }

      if (from !== page) {
        await NavigationFlow.findOneAndUpdate(
          { from, to: page },
          { $inc: { count: 1 } },
          { upsert: true }
        );
      }
    }

    await session.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const endSession = async (req, res) => {
  try {
    const { sessionId, page, timeSpent } = req.body;

    if (!sessionId) return res.status(400).json({ error: "sessionId is required" });

    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (page && timeSpent > 0) {
      session.pageVisits.push({ page, timeSpent });

      const pv = await PageView.findOneAndUpdate(
        { page },
        { $inc: { totalTimeSpent: timeSpent }, $set: { lastVisited: new Date() } },
        { upsert: true, returnDocument: "after" }
      );
      if (pv && pv.totalVisits > 0) {
        pv.avgTimeSpent = Math.round(pv.totalTimeSpent / pv.totalVisits);
        await pv.save();
      }
    }

    session.endTime = new Date();
    session.isActive = false;
    session.totalDuration = session.endTime - session.startTime;
    await session.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { trackEvent, endSession };
