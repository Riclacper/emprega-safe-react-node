const mongoose = require("mongoose");

function health(req, res) {
  res.json({
    ok: true,
    message: "EmpregaSafe API em execução.",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    ai: String(process.env.AI_ENABLED || "false") === "true" ? `enabled:${process.env.AI_PROVIDER || "openrouter"}` : "disabled",
  });
}

module.exports = { health };
