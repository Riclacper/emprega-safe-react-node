function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function sanitizeText(value, maxLength = 5000) {
  return String(value || "").trim().slice(0, maxLength);
}

function isValidUrl(url) {
  if (!url) return true;

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

module.exports = { normalize, sanitizeText, isValidUrl };
