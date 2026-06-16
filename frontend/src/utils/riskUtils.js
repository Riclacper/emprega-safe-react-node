export function badgeClass(badge) {
  return `badge badge-${badge || "baixo"}`;
}

export function scoreLabel(score, t) {
  const value = Number(score || 0);
  if (value <= 25) return t ? t("risk.lowRisk") : "Baixo risco";
  if (value <= 55) return t ? t("risk.attention") : "Atenção";
  if (value <= 80) return t ? t("risk.highRisk") : "Alto risco";
  return t ? t("risk.critical") : "Risco crítico";
}
