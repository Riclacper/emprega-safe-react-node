require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("../src/config/database");
const Analysis = require("../src/models/Analysis");
const {
  createAnalysisFingerprint,
} = require("../src/utils/analysisFingerprint");

async function backfill() {
  const apply = process.argv.slice(2).includes("--apply");

  await connectDatabase();

  const analyses = await Analysis.find({})
    .select("_id user title company contact link description fingerprint")
    .sort({ createdAt: 1, _id: 1 })
    .lean();
  const occupiedFingerprints = new Set(
    analyses
      .filter((analysis) => analysis.user && analysis.fingerprint)
      .map((analysis) => `${analysis.user}:${analysis.fingerprint}`),
  );
  const updates = [];
  let historicalDuplicates = 0;

  for (const analysis of analyses) {
    if (!analysis.user || analysis.fingerprint) continue;

    const fingerprint = createAnalysisFingerprint(analysis);
    const scopedFingerprint = `${analysis.user}:${fingerprint}`;

    if (occupiedFingerprints.has(scopedFingerprint)) {
      historicalDuplicates += 1;
      continue;
    }

    occupiedFingerprints.add(scopedFingerprint);
    updates.push({
      updateOne: {
        filter: { _id: analysis._id, fingerprint: null },
        update: { $set: { fingerprint } },
      },
    });
  }

  console.log({
    mode: apply ? "apply" : "dry-run",
    analyses: analyses.length,
    fingerprintsToSet: updates.length,
    historicalDuplicates,
  });

  if (apply && updates.length) {
    const result = await Analysis.bulkWrite(updates);
    console.log({ updatedAnalyses: result.modifiedCount });
  }

  if (apply) {
    const indexName = await Analysis.collection.createIndex(
      { user: 1, fingerprint: 1 },
      {
        name: "user_1_fingerprint_1",
        unique: true,
        partialFilterExpression: {
          user: { $type: "objectId" },
          fingerprint: { $type: "string" },
        },
      },
    );
    console.log({ indexCreated: indexName });
  }
}

if (require.main === module) {
  backfill()
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
      console.error(error.message);
      await mongoose.disconnect();
      process.exitCode = 1;
    });
}
