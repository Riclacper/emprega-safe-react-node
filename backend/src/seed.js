require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDatabase = require("./config/database");
const User = require("./models/User");

async function seed() {
  await connectDatabase();

  const name = process.env.ADMIN_NAME || "Administrador";
  const email = (process.env.ADMIN_EMAIL || "admin@empregasafe.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "123456";

  const hash = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email },
    { name, email, password: hash, role: "admin", active: true },
    { upsert: true, new: true },
  );

  console.log(`Usuário admin pronto: ${email}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
