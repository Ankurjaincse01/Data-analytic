const mongoose = require("mongoose");

const PageViewSchema = new mongoose.Schema({
  page:           { type: String, required: true, unique: true },
  totalVisits:    { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  avgTimeSpent:   { type: Number, default: 0 },
  lastVisited:    { type: Date,   default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("PageView", PageViewSchema);
