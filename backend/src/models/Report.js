const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      unique: true,
      sparse: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    analysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      default: null,
    },
    company: { type: String, default: "Não informada" },
    link: { type: String, default: "" },
    reason: { type: String, required: true },
    details: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
