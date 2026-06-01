export function badgeClass(badge) {
  return `badge badge-${badge || "baixo"}`;
}

export function scoreLabel(score) {
  const value = Number(score || 0);
  if (value <= 25) return "Baixo risco";
  if (value <= 55) return "Atenção";
  if (value <= 80) return "Alto risco";
  return "Risco crítico";
}
