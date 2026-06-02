require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("../src/config/database");
const RegistrationAudit = require("../src/models/RegistrationAudit");
const {
  hashIdentifier,
} = require("../src/services/registrationAuditService");

function parseArgs(args) {
  const options = {
    days: 7,
    limit: 50,
    email: "",
  };

  for (const arg of args) {
    if (arg.startsWith("--days=")) options.days = Number(arg.slice(7));
    if (arg.startsWith("--limit=")) options.limit = Number(arg.slice(8));
    if (arg.startsWith("--email=")) options.email = arg.slice(8).trim();
  }

  if (!Number.isInteger(options.days) || options.days < 1) {
    throw new Error("--days precisa ser um número inteiro positivo.");
  }

  if (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > 200) {
    throw new Error("--limit precisa ser um inteiro entre 1 e 200.");
  }

  return options;
}

async function inspect() {
  const options = parseArgs(process.argv.slice(2));
  const createdAt = {
    $gte: new Date(Date.now() - options.days * 24 * 60 * 60 * 1000),
  };
  const query = { createdAt };

  if (options.email) {
    query.emailHash = hashIdentifier(options.email);
  }

  await connectDatabase();

  const [summary, events] = await Promise.all([
    RegistrationAudit.aggregate([
      { $match: query },
      {
        $group: {
          _id: { outcome: "$outcome", reason: "$reason" },
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]),
    RegistrationAudit.find(query)
      .select("outcome reason maskedEmail emailHash maskedIp ipHash userAgent createdAt")
      .sort({ createdAt: -1 })
      .limit(options.limit)
      .lean(),
  ]);

  console.log({
    filters: options,
    summary,
    events: events.map((event) => ({
      createdAt: event.createdAt,
      outcome: event.outcome,
      reason: event.reason,
      maskedEmail: event.maskedEmail,
      emailHash: event.emailHash.slice(0, 12),
      maskedIp: event.maskedIp,
      ipHash: event.ipHash.slice(0, 12),
      userAgent: event.userAgent,
    })),
  });
}

if (require.main === module) {
  inspect()
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
      console.error(error.message);
      await mongoose.disconnect();
      process.exitCode = 1;
    });
}

module.exports = { parseArgs };
