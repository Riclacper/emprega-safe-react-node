const mongoose = require("mongoose");

const signalSchema = new mongoose.Schema(
  {
    points: Number,
    reason: String,
    evidence: String,
  },
  { _id: false },
);

const analysisSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    fingerprint: { type: String, default: null },
    title: { type: String, required: true },
    company: { type: String, default: "" },
    salary: { type: Number, default: 0 },
    currency: {
      type: String,
      enum: ["BRL", "USD", "EUR"],
      default: "BRL",
    },
    contact: { type: String, default: "" },
    currency: {
      type: String,
      enum: ["BRL", "USD", "EUR"],
      default: "BRL",
    },
    contact: { type: String, default: "" },
    link: { type: String, default: "" },
    description: { type: String, required: true },
    score: { type: Number, required: true },
    classification: { type: String, required: true },
    badge: { type: String, required: true },
    analysisMode: { type: String, enum: ["rules", "hybrid"], default: "rules" },
    ruleScore: { type: Number, default: 0 },
    aiScore: { type: Number, default: null },
    scoreDifference: { type: Number, default: 0 },
    reasons: { type: [String], default: [] },
    signals: { type: [signalSchema], default: [] },
    recommendation: { type: String, required: true },
    ai: {
      enabled: { type: Boolean, default: false },
      score: { type: Number, default: null },
      classification: { type: String, default: null },
      reasons: { type: [String], default: [] },
      recommendation: { type: String, default: null },
    },
  },
  { timestamps: true },
);

analysisSchema.index(
  { user: 1, fingerprint: 1 },
  {
    unique: true,
    partialFilterExpression: {
      user: { $type: "objectId" },
      fingerprint: { $type: "string" },
    },
  },
);

module.exports = mongoose.model("Analysis", analysisSchema);
