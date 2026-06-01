const OpenAI = require("openai");

function createAiClient() {
  const enabled = String(process.env.AI_ENABLED || "false") === "true";
  const provider = String(
    process.env.AI_PROVIDER || "openrouter",
  ).toLowerCase();

  if (!enabled) return null;

  if (provider === "openrouter") {
    if (!process.env.OPENROUTER_API_KEY) return null;

    return new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL:
        process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      timeout: 30000,
      maxRetries: 1,
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || "http://localhost:5173",
        "X-Title": "EmpregaSafe",
      },
    });
  }

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) return null;

    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
      maxRetries: 1,
    });
  }

  return null;
}

module.exports = { createAiClient };
