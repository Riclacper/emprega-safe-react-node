const crypto = require("crypto");
const Analysis = require("../models/Analysis");
const Report = require("../models/Report");
const { validateReportPayload } = require("../utils/validators");
const { sendEmail } = require("../services/emailService");
const User = require("../models/User");
const { sendReportEmail } = require("../services/emailService");
const mongoose = require("mongoose");

const DUPLICATE_REPORT_MESSAGE = "Esta vaga já foi denunciada por este usuário.";

async function listReports(req, res) {
  try {
    const reports = await Report.find({ user: req.user._id })
      .populate("analysis", "externalId title company classification score")
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json(reports);
  } catch (error) {
    console.error("Erro ao listar denúncias:", error);
    return res.status(500).json({
      message: "Erro ao listar denúncias.",
    });
  }
}

async function createReport(req, res) {
  try {
    const validation = validateReportPayload(req.body);

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    let analysis = null;

    if (validation.payload.analysisId) {
      const analysisId = validation.payload.analysisId;

      const query = mongoose.Types.ObjectId.isValid(analysisId)
        ? {
            $or: [{ externalId: analysisId }, { _id: analysisId }],
          }
        : { externalId: analysisId };

      analysis = await Analysis.findOne({
        ...query,
        user: req.user._id,
      });
    }

    if (validation.payload.analysisId && !analysis) {
      return res.status(404).json({
        message: "Análise vinculada não encontrada.",
      });
    }

    if (
      analysis &&
      (await Report.exists({
        user: req.user._id,
        analysis: analysis._id,
      }))
    ) {
      return res.status(409).json({
        message: DUPLICATE_REPORT_MESSAGE,
      });
    }

    const reason =
      validation.payload.reason ||
      `Denúncia vinculada à análise ${validation.payload.analysisId}`;

    const report = await Report.create({
      externalId: `REP-${crypto.randomUUID()}`,
      user: req.user?._id || null,
      analysis: analysis?._id || null,
      company:
        validation.payload.company ||
        analysis?.company ||
        analysis?.title ||
        "Não informada",
      link: validation.payload.link || analysis?.link || "",
      reason,
      details: validation.payload.details || "",
    });

    const populatedReport = await Report.findById(report._id).populate(
      "analysis",
      "externalId title company classification score",
    );

    return res.status(201).json(populatedReport);
  } catch (error) {
    console.error("Erro ao registrar denúncia:", {
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
    });

    if (error.code === 11000) {
      return res.status(409).json({
        message: DUPLICATE_REPORT_MESSAGE,
      });
    }

    return res.status(500).json({
      message: "Erro ao registrar denúncia.",
    });
  }
}

async function sendReportByEmail(req, res) {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("analysis", "externalId title company classification score link");

    if (!report) {
      return res.status(404).json({
        message: "Denúncia não encontrada.",
      });
    }

    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(400).json({
        message: "Usuário logado não possui e-mail cadastrado.",
      });
    }

    const company =
      report.company || report.analysis?.company || "Empresa não informada";

    const reportData = {
      company,
      title: report.analysis?.title || "Vaga não informada",
      date: new Date(report.createdAt).toLocaleDateString("pt-BR"),
      analysisId:
        report.analysis?.externalId ||
        report.analysis?._id?.toString() ||
        "Não vinculada",
      classification: report.analysis?.classification || "Não informada",
      score:
        report.analysis?.score !== undefined
          ? `${report.analysis.score}/100`
          : "Não informado",
      reason: report.reason || "Não informado",
      details: report.details || "Não informado",
      link: report.link || report.analysis?.link || "",
    };
    await sendReportEmail(userEmail, reportData);

    return res.json({
      message: "E-mail enviado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao enviar denúncia por e-mail:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: "Não foi possível enviar o e-mail da denúncia.",
    });
  }
}

module.exports = { listReports, createReport, sendReportByEmail };
