const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  sessionId:     { type: String, required: true, unique: true },
  entrySource:   { type: String, default: "direct" },
  referrer:      { type: String, default: "" },
  navigationPath:{ type: [String], default: [] },
  pageVisits: [
    {
      page:      { type: String },
      timeSpent: { type: Number, default: 0 },
      visitedAt: { type: Date,   default: Date.now },
    },
  ],
  startTime:     { type: Date,    default: Date.now },
  endTime:       { type: Date },
  totalDuration: { type: Number,  default: 0 },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Session", SessionSchema);
