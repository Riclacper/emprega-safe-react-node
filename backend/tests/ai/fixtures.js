module.exports = [
  {
    id: "formal-corporate-role",
    expected: { maxScore: 25, classification: "Confiável" },
    payload: {
      title: "Analista de suporte",
      company: "Empresa Exemplo",
      salary: 3500,
      currency: "BRL",
      contact: "talentos@empresaexemplo.com.br",
      link: "https://empresaexemplo.com.br/carreiras",
      description:
        "Responsabilidades: atender clientes, documentar chamados e acompanhar indicadores. Requisitos: organização, comunicação e experiência com suporte. Benefícios: plano de saúde e vale alimentação. A candidatura ocorre na página oficial e não solicita pagamentos.",
    },
  },
  {
    id: "advance-payment-scam",
    expected: { minScore: 81, classification: "Risco crítico" },
    payload: {
      title: "Trabalho remoto urgente",
      company: "Empresa confidencial",
      salary: 18000,
      currency: "BRL",
      contact: "recrutador@gmail.com",
      link: "https://bit.ly/vaga-imediata",
      description:
        "Contratação imediata. Envie CPF e RG pelo WhatsApp e pague uma taxa via Pix para liberar seu acesso ainda hoje.",
    },
  },
  {
    id: "missing-verifiable-data",
    expected: { minScore: 35 },
    payload: {
      title: "Assistente",
      company: "",
      salary: 0,
      currency: "BRL",
      contact: "",
      link: "",
      description: "Entre em contato para saber detalhes da oportunidade.",
    },
  },
  {
    id: "generic-email-short-link",
    expected: { minScore: 25 },
    payload: {
      title: "Auxiliar administrativo",
      company: "Seleção RH",
      salary: 2200,
      currency: "BRL",
      contact: "selecao@gmail.com",
      link: "https://tinyurl.com/vaga",
      description:
        "Atividades: atendimento e organização de documentos. Requisitos: ensino médio e disponibilidade de horário.",
    },
  },
  {
    id: "formal-remote-onboarding",
    expected: { maxScore: 35 },
    payload: {
      title: "Desenvolvedor remoto",
      company: "Tecnologia Exemplo",
      salary: 7000,
      currency: "BRL",
      contact: "carreiras@tecnologiaexemplo.com.br",
      link: "https://tecnologiaexemplo.com.br/carreiras",
      description:
        "Responsabilidades: desenvolver aplicações e revisar código. Requisitos: experiência com JavaScript. A candidatura ocorre no site oficial. Não solicita pagamento. Documentos são solicitados somente após proposta formal.",
    },
  },
];
