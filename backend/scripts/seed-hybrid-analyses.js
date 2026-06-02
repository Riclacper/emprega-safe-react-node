require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("../src/config/database");
const Analysis = require("../src/models/Analysis");
const User = require("../src/models/User");
const { buildAnalysis } = require("../src/services/analysisService");
const {
  parseTargets,
  stableUserKey,
  templates,
} = require("./seed-professional-analyses");

const BATCH_ID = "professional-hybrid-v1";
const MAX_ATTEMPTS = 3;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function buildPayload(index) {
  const template = templates[index % templates.length];

  return {
    ...template,
    currency: "BRL",
    title: `${template.title} HÍBRIDA`,
  };
}

function externalIdFor(email, index) {
  return `ANL-SEED-${BATCH_ID}-${stableUserKey(email)}-${String(index + 1).padStart(3, "0")}`;
}

async function buildHybridAnalysis(payload, userId) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const analysis = await buildAnalysis(payload, userId);

    if (analysis.analysisMode === "hybrid" && analysis.ai?.enabled) {
      return analysis;
    }

    if (attempt < MAX_ATTEMPTS) {
      await delay(1500 * attempt);
    }
  }

  throw new Error("A IA não retornou uma resposta válida após 3 tentativas.");
}

async function seed() {
  if (String(process.env.AI_ENABLED || "false") !== "true") {
    throw new Error("AI_ENABLED precisa estar definido como true.");
  }

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
    let inserted = 0;
    let skipped = 0;

    for (let index = 0; index < target.quantity; index += 1) {
      const externalId = externalIdFor(target.email, index);
      const exists = await Analysis.exists({ externalId });

      if (exists) {
        skipped += 1;
        continue;
      }

      const analysis = await buildHybridAnalysis(buildPayload(index), user._id);
      const createdAt = new Date(Date.now() - index * 18 * 60 * 60 * 1000);

      await Analysis.create({
        ...analysis,
        externalId,
        createdAt,
        updatedAt: createdAt,
      });

      inserted += 1;
      console.log(
        `[${target.email}] ${inserted + skipped}/${target.quantity}: ${analysis.classification} (${analysis.score})`,
      );
    }

    const after = await Analysis.countDocuments({ user: user._id });
    const hybrid = await Analysis.countDocuments({
      user: user._id,
      analysisMode: "hybrid",
    });

    console.log({
      email: target.email,
      before,
      requested: target.quantity,
      inserted,
      skipped,
      after,
      hybrid,
    });
  }
}

seed()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
