const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Token não informado." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "name email role active passwordChangedAt",
    );

    if (!user || !user.active) {
      return res.status(401).json({ message: "Usuário inválido ou inativo." });
    }

    if (user.passwordChangedAt) {
      const tokenPasswordChangedAt =
        decoded.passwordChangedAt === undefined ? null : decoded.passwordChangedAt;
      const currentPasswordChangedAt = new Date(user.passwordChangedAt).getTime();

      if (tokenPasswordChangedAt !== currentPasswordChangedAt) {
        return res.status(401).json({ message: "Sessão expirada ou inválida." });
      }
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Sessão expirada ou inválida." });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Acesso restrito ao administrador." });
  }
  return next();
}

module.exports = { authRequired, adminOnly };
