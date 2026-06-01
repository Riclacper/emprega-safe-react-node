const Analysis = require("../models/Analysis");
const { buildAnalysis } = require("../services/analysisService");
const { validateAnalysisPayload } = require("../utils/validators");

async function listAnalyses(req, res) {
  try {
    const analyses = await Analysis.find().sort({ createdAt: -1 }).limit(200);
    return res.json(analyses);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar análises.",
    });
  }
}

async function createAnalysis(req, res) {
  try {
    const validation = validateAnalysisPayload(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    const analysis = await buildAnalysis(validation.payload, req.user?._id);
    const saved = await Analysis.create(analysis);

    return res.status(201).json(saved);
  } catch (error) {
    console.error("Erro ao criar análise:", {
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
    });

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Não foi possível salvar a análise por conflito de índice no banco de dados.",
      });
    }

    return res.status(500).json({
      message: "Erro ao criar análise.",
    });
  }
}

async function getAnalysis(req, res) {
  try {
    const analysis = await Analysis.findOne({
      externalId: req.params.externalId,
    });

    if (!analysis) {
      return res.status(404).json({
        message: "Análise não encontrada.",
      });
    }

    return res.json(analysis);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar análise.",
    });
  }
}

module.exports = {
  listAnalyses,
  createAnalysis,
  getAnalysis,
};
