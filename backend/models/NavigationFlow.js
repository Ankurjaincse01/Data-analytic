const mongoose = require("mongoose");

const navigationFlowSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    count: { type: Number, default: 1 },
  },
  { timestamps: true }
);

navigationFlowSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model("NavigationFlow", navigationFlowSchema);
