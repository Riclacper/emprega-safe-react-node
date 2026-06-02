const crypto = require("node:crypto");
const RegistrationAudit = require("../models/RegistrationAudit");

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function hashIdentifier(value) {
  const salt =
    process.env.REGISTRATION_AUDIT_HASH_SECRET ||
    process.env.JWT_SECRET ||
    "empregasafe-registration-audit";

  return crypto
    .createHmac("sha256", salt)
    .update(normalizeValue(value) || "unknown")
    .digest("hex");
}

function maskEmail(value) {
  const email = normalizeValue(value);
  const [localPart = "", domain = ""] = email.split("@");

  if (!domain) return localPart ? `${localPart.slice(0, 1)}***` : "";

  return `${localPart.slice(0, 1) || "*"}***@${domain}`;
}

function maskIp(value) {
  const ip = String(value || "").trim();

  if (!ip) return "";

  if (ip.includes(":")) {
    return `${ip.split(":").slice(0, 4).join(":")}::`;
  }

  const parts = ip.split(".");

  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.***` : "***";
}

function getRequestIp(req) {
  return req.ip || req.socket?.remoteAddress || "";
}

async function recordRegistrationAudit(req, { email, outcome, reason, user }) {
  try {
    if (RegistrationAudit.db.readyState !== 1) {
      return;
    }

    const ip = getRequestIp(req);

    await RegistrationAudit.create({
      outcome,
      reason,
      user: user?._id || null,
      maskedEmail: maskEmail(email),
      emailHash: hashIdentifier(email),
      maskedIp: maskIp(ip),
      ipHash: hashIdentifier(ip),
      userAgent: String(req.get?.("user-agent") || "").slice(0, 300),
    });
  } catch (error) {
    console.error("Erro ao registrar auditoria de cadastro:", error.message);
  }
}

module.exports = {
  getRequestIp,
  hashIdentifier,
  maskEmail,
  maskIp,
  recordRegistrationAudit,
};
