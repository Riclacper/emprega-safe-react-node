require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("../src/config/database");
const Report = require("../src/models/Report");
const User = require("../src/models/User");

function parseArgs(args) {
  const apply = args.includes("--apply");
  const emails = args
    .filter((arg) => arg !== "--apply")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!emails.length) {
    throw new Error("Informe ao menos um e-mail para verificar.");
  }

  return { apply, emails: [...new Set(emails)] };
}

async function findDuplicateGroups(userIds) {
  return Report.aggregate([
    {
      $match: {
        user: { $in: userIds },
        analysis: { $type: "objectId" },
      },
    },
    { $sort: { createdAt: 1, _id: 1 } },
    {
      $group: {
        _id: { user: "$user", analysis: "$analysis" },
        reportIds: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);
}

async function cleanup() {
  const { apply, emails } = parseArgs(process.argv.slice(2));

  await connectDatabase();

  const users = await User.find({ email: { $in: emails } })
    .select("_id email")
    .lean();
  const usersByEmail = new Map(users.map((user) => [user.email, user]));
  const missingEmails = emails.filter((email) => !usersByEmail.has(email));

  if (missingEmails.length) {
    throw new Error(`Usuários não encontrados: ${missingEmails.join(", ")}`);
  }

  const userIds = users.map((user) => user._id);
  const emailByUserId = new Map(
    users.map((user) => [user._id.toString(), user.email]),
  );
  const duplicateGroups = await findDuplicateGroups(userIds);
  const idsToDelete = duplicateGroups.flatMap((group) =>
    group.reportIds.slice(1),
  );

  const summary = duplicateGroups.map((group) => ({
    email: emailByUserId.get(group._id.user.toString()),
    analysis: group._id.analysis.toString(),
    keptReport: group.reportIds[0].toString(),
    duplicateReports: group.reportIds.slice(1).map((id) => id.toString()),
  }));

  console.log({
    mode: apply ? "apply" : "dry-run",
    users: emails,
    duplicateGroups: duplicateGroups.length,
    reportsToDelete: idsToDelete.length,
    summary,
  });

  if (apply && idsToDelete.length) {
    const result = await Report.deleteMany({ _id: { $in: idsToDelete } });
    console.log({ deletedReports: result.deletedCount });
  }

  if (apply) {
    await Report.syncIndexes();
    console.log({ indexesSynchronized: true });
  }
}

if (require.main === module) {
  cleanup()
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
      console.error(error.message);
      await mongoose.disconnect();
      process.exitCode = 1;
    });
}

module.exports = { findDuplicateGroups, parseArgs };
