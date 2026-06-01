function classificationByScore(score) {
  const value = Math.max(0, Math.min(100, Number(score || 0)));

  if (value <= 25) {
    return { classification: "Confiável", badge: "baixo" };
  }

  if (value <= 55) {
    return { classification: "Suspeita", badge: "medio" };
  }

  if (value <= 80) {
    return { classification: "Fraudulenta", badge: "alto" };
  }

  return { classification: "Risco crítico", badge: "critico" };
}

function recommendationByScore(score) {
  const value = Number(score || 0);

  if (value <= 25) {
    return "Mesmo com baixo risco, confirme CNPJ, domínio oficial e dados da empresa antes de enviar documentos.";
  }

  if (value <= 55) {
    return "Valide a empresa em canais oficiais e evite compartilhar dados sensíveis antes de confirmar a legitimidade.";
  }

  if (value <= 80) {
    return "Evite avançar no contato, não realize pagamentos e confirme a vaga em canais oficiais da empresa.";
  }

  return "Interrompa o contato, não envie documentos, não realize pagamentos e considere registrar denúncia.";
}

module.exports = { classificationByScore, recommendationByScore };
