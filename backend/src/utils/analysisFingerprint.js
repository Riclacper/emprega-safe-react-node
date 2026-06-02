const crypto = require("node:crypto");

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeLink(value) {
  const link = normalizeText(value);

  if (!link) return "";

  try {
    const parsed = new URL(link);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";

    return parsed.toString();
  } catch {
    return link;
  }
}

function createAnalysisFingerprint(payload) {
  const title = normalizeText(payload.title);
  const company = normalizeText(payload.company);
  const link = normalizeLink(payload.link);
  const fallbackDetails = link
    ? ""
    : [normalizeText(payload.contact), normalizeText(payload.description)].join(
        "|",
      );
  const identity = [title, company, link, fallbackDetails].join("|");

  return crypto.createHash("sha256").update(identity).digest("hex");
}

module.exports = { createAnalysisFingerprint, normalizeLink, normalizeText };
