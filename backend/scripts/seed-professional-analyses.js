require("dotenv").config();

const crypto = require("node:crypto");
const mongoose = require("mongoose");
const connectDatabase = require("../src/config/database");
const Analysis = require("../src/models/Analysis");
const User = require("../src/models/User");
const { analyzeByRules } = require("../src/services/riskRulesService");

const BATCH_ID = "professional-demo-v1";

const templates = [
  {
    title: "Desenvolvedor Full Stack",
    company: "Nexa Tecnologia",
    salary: 7200,
    contact: "talentos@nexatecnologia.com.br",
    link: "https://nexatecnologia.com.br/carreiras",
    description:
      "Responsabilidades: desenvolver aplicações web e revisar código. Requisitos: experiência com JavaScript e APIs. Benefícios: plano de saúde e vale-refeição. A candidatura ocorre na página oficial e não solicita pagamentos.",
  },
  {
    title: "Analista Administrativo",
    company: "Grupo Horizonte",
    salary: 3100,
    contact: "recrutamento@grupohorizonte.com.br",
    link: "https://grupohorizonte.com.br/vagas",
    description:
      "Atividades: apoiar rotinas administrativas, elaborar relatórios e organizar documentos. Requisitos: ensino médio completo e conhecimento de planilhas. Benefícios informados no canal oficial. A empresa não cobra taxas.",
  },
  {
    title: "Assistente de Atendimento Remoto",
    company: "Conecta Serviços",
    salary: 2400,
    contact: "selecao.conecta@gmail.com",
    link: "https://bit.ly/processo-conecta",
    description:
      "Atividades: atendimento remoto e suporte ao cliente. Requisitos: boa comunicação e disponibilidade de horário. Benefícios serão detalhados durante a entrevista.",
  },
  {
    title: "Representante Comercial",
    company: "Empresa confidencial",
    salary: 15500,
    contact: "oportunidade@gmail.com",
    link: "https://wa.me/5581999999999",
    description:
      "Contratação imediata com ganhos garantidos. Para liberar o acesso, envie CPF, RG e comprovante do pagamento da taxa inicial via Pix. Clique agora para participar!!!",
  },
  {
    title: "Auxiliar de Cadastro",
    company: "",
    salary: 1800,
    contact: "",
    link: "",
    description:
      "Vaga para cadastro de informações. Entre em contato para conhecer detalhes.",
  },
  {
    title: "Operador de Suporte",
    company: "Central Mais",
    salary: 900,
    contact: "vagas@centralmais.com.br",
    link: "",
    description:
      "Atividades: registrar chamados e orientar clientes. Requisitos: comunicação clara e conhecimento básico de informática. Horário comercial e benefícios apresentados na entrevista.",
  },
  {
    title: "Especialista Financeiro",
    company: "Atlas Consultoria",
    salary: 13000,
    contact: "carreiras@atlasconsultoria.com.br",
    link: "https://atlasconsultoria.com.br/trabalhe-conosco",
    description:
      "Responsabilidades: elaborar projeções financeiras e apoiar decisões executivas. Requisitos: experiência comprovada e formação superior. Benefícios competitivos. Inscrição exclusivamente pelo site oficial, sem cobrança.",
  },
  {
    title: "Digitador Home Office",
    company: "Renda Digital",
    salary: 4800,
    contact: "rendadigital@hotmail.com",
    link: "https://tinyurl.com/vaga-digitador",
    description:
      "Renda extra garantida sem entrevista. Últimas vagas, aprovação imediata. Faça um investimento inicial para receber o material e começar hoje.",
  },
];

function parseTargets(args) {
  return args.map((arg) => {
    const separator = arg.lastIndexOf("=");
    const email = arg.slice(0, separator).trim().toLowerCase();
    const quantity = Number(arg.slice(separator + 1));

    if (separator <= 0 || !email.includes("@") || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Destino inválido: "${arg}". Use email=quantidade.`);
    }

    return { email, quantity };
  });
}

function stableUserKey(email) {
  return crypto.createHash("sha256").update(email).digest("hex").slice(0, 12);
}

function buildSeedAnalysis(userId, email, index) {
  const template = templates[index % templates.length];
  const payload = {
    ...template,
    currency: "BRL",
  };
  const result = analyzeByRules(payload);
  const createdAt = new Date(Date.now() - index * 36 * 60 * 60 * 1000);

  return {
    externalId: `ANL-SEED-${BATCH_ID}-${stableUserKey(email)}-${String(index + 1).padStart(3, "0")}`,
    user: userId,
    ...payload,
    score: result.score,
    classification: result.classification,
    badge: result.badge,
    analysisMode: "rules",
    ruleScore: result.score,
    aiScore: null,
    scoreDifference: 0,
    reasons: result.reasons,
    signals: result.signals,
    recommendation: result.recommendation,
    ai: {
      enabled: false,
      score: null,
      classification: null,
      reasons: [],
      recommendation: null,
    },
    createdAt,
    updatedAt: createdAt,
  };
}

async function seed() {
  const targets = parseTargets(process.argv.slice(2));

  if (!targets.length) {
    throw new Error("Informe ao menos um destino no formato email=quantidade.");
  }

  await connectDatabase();

  const users = await User.find({
    email: { $in: targets.map(({ email }) => email) },
  }).lean();
  const usersByEmail = new Map(users.map((user) => [user.email, user]));
  const missingUsers = targets.filter(({ email }) => !usersByEmail.has(email));

  if (missingUsers.length) {
    throw new Error(
      `Usuários não encontrados: ${missingUsers.map(({ email }) => email).join(", ")}`,
    );
  }

  for (const target of targets) {
    const user = usersByEmail.get(target.email);
    const before = await Analysis.countDocuments({ user: user._id });
    const analyses = Array.from({ length: target.quantity }, (_, index) =>
      buildSeedAnalysis(user._id, target.email, index),
    );

    const result = await Analysis.bulkWrite(
      analyses.map((analysis) => ({
        updateOne: {
          filter: { externalId: analysis.externalId },
          update: { $setOnInsert: analysis },
          upsert: true,
        },
      })),
      { timestamps: false },
    );

    const after = await Analysis.countDocuments({ user: user._id });
    const classifications = await Analysis.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: "$classification", total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log({
      email: target.email,
      before,
      requested: target.quantity,
      inserted: result.upsertedCount,
      after,
      classifications,
    });
  }
}

if (require.main === module) {
  seed()
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
      console.error(error.message);
      await mongoose.disconnect();
      process.exitCode = 1;
    });
}

module.exports = { parseTargets, stableUserKey, templates };
