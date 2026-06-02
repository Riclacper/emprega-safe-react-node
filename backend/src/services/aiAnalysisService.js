const { createAiClient } = require("../config/aiClient");

const aiClient = createAiClient();

async function analyzeWithAI(payload) {
  const enabled = String(process.env.AI_ENABLED || "false") === "true";
  const provider = String(
    process.env.AI_PROVIDER || "openrouter",
  ).toLowerCase();

  console.log("IA chamada:", {
    enabled,
    provider,
    hasClient: Boolean(aiClient),
    model:
      provider === "openrouter"
        ? process.env.OPENROUTER_MODEL
        : process.env.OPENAI_MODEL,
  });

  if (!enabled || !aiClient) return null;

  const prompt = `
Você é especialista em segurança digital, RH e prevenção de fraudes em vagas de emprego.
Analise a confiabilidade da vaga abaixo.

Escala obrigatória:
- 0 a 25: Confiável
- 26 a 55: Suspeita
- 56 a 80: Fraudulenta
- 81 a 100: Risco crítico

Regras importantes:
- Texto aleatório, incoerente ou sem informações verificáveis NÃO deve ser classificado como confiável.
- Vaga sem empresa, contato, link verificável ou descrição clara deve receber risco maior.
- Se a classificação for "Fraudulenta", o aiScore deve ser no mínimo 56.
- Se a classificação for "Risco crítico", o aiScore deve ser no mínimo 81.
- O aiScore representa risco, não confiabilidade.
- Não classifique como fraudulenta apenas por mencionar documentos, onboarding online ou trabalho remoto.
- Se a vaga informa que não solicita pagamento e que documentos só serão pedidos após proposta formal, isso deve reduzir o risco.
- E-mail corporativo e página oficial de carreiras são sinais positivos.
- Para classificar como Fraudulenta ou Risco crítico, deve haver sinais fortes como cobrança antecipada, dados bancários, documento antes da contratação, link encurtado, WhatsApp/Telegram obrigatório ou promessa irreal.

Retorne APENAS JSON válido no formato:
{
  "aiScore": number entre 0 e 100,
  "aiClassification": "Confiável" | "Suspeita" | "Fraudulenta" | "Risco crítico",
  "aiReasons": ["motivo 1", "motivo 2"],
  "aiRecommendation": "recomendação objetiva"
}

Dados da vaga:
Título: ${payload.title}
Empresa: ${payload.company || "Não informada"}
Salário: ${payload.salary || 0}
Contato: ${payload.contact || "Não informado"}
Link: ${payload.link || "Não informado"}
Descrição: ${payload.description}
`;

  try {
    const completion = await aiClient.chat.completions.create(
      {
        model:
          provider === "openrouter"
            ? process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct:free"
            : process.env.OPENAI_MODEL || "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "Responda somente JSON válido. Avalie golpes, phishing, cobrança indevida, engenharia social, solicitação de dados sensíveis e inconsistência do recrutador.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      },
      {
        timeout: Number(process.env.AI_TIMEOUT_MS || 45000),
        maxRetries: 0,
      },
    );

    const raw = completion.choices?.[0]?.message?.content || "";
    console.log("Resposta bruta da IA:", raw);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      aiScore: Math.max(0, Math.min(100, Number(parsed.aiScore || 0))),
      aiClassification: parsed.aiClassification || null,
      aiReasons: Array.isArray(parsed.aiReasons)
        ? parsed.aiReasons.slice(0, 6)
        : [],
      aiRecommendation: parsed.aiRecommendation || null,
    };
  } catch (error) {
    console.error("Erro na análise por IA:", {
      message: error.message,
      status: error.status,
      response: error.response?.data,
    });
    return null;
  }
}

module.exports = { analyzeWithAI };
