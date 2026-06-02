const mongoose = require("mongoose");

const configuredRetentionDays = Number(
  process.env.REGISTRATION_AUDIT_RETENTION_DAYS || 90,
);
const retentionDays =
  Number.isFinite(configuredRetentionDays) && configuredRetentionDays >= 1
    ? configuredRetentionDays
    : 90;

const registrationAuditSchema = new mongoose.Schema(
  {
    outcome: {
      type: String,
      enum: ["accepted", "rejected", "error"],
      required: true,
    },
    reason: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    maskedEmail: { type: String, default: "" },
    emailHash: { type: String, required: true },
    maskedIp: { type: String, default: "" },
    ipHash: { type: String, required: true },
    userAgent: { type: String, default: "" },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: retentionDays * 24 * 60 * 60,
    },
  },
  {
    versionKey: false,
  },
);

registrationAuditSchema.index({ emailHash: 1, createdAt: -1 });
registrationAuditSchema.index({ ipHash: 1, createdAt: -1 });
registrationAuditSchema.index({ outcome: 1, createdAt: -1 });

module.exports = mongoose.model("RegistrationAudit", registrationAuditSchema);
