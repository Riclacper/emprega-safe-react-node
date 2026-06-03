const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");
const { validateEmail } = require("../utils/emailValidation");
const {
  recordRegistrationAudit,
} = require("../services/registrationAuditService");
function generateCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordChangedAt: user.passwordChangedAt
        ? new Date(user.passwordChangedAt).getTime()
        : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
  );
}

async function register(req, res) {
  let auditEmail = "";

  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .toLowerCase()
      .trim();
    const password = String(req.body.password || "");
    auditEmail = email;

    async function rejectRegistration(status, message, reason) {
      await recordRegistrationAudit(req, {
        email,
        outcome: "rejected",
        reason,
      });

      return res.status(status).json({ message });
    }

    if (!name || !email || !password) {
      return rejectRegistration(
        400,
        "Informe nome, e-mail e senha.",
        "missing_required_fields",
      );
    }

    const emailValidation = validateEmail(email);

    if (!emailValidation.valid) {
      return rejectRegistration(
        400,
        emailValidation.message,
        "invalid_email",
      );
    }

    if (password.length < 6) {
      return rejectRegistration(
        400,
        "A senha deve ter pelo menos 6 caracteres.",
        "weak_password",
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return rejectRegistration(
        409,
        "Este e-mail já está cadastrado.",
        "email_already_registered",
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      active: true,
      verificationCode: null,
      verificationExpires: null,
    });

    await recordRegistrationAudit(req, {
      email,
      outcome: "accepted",
      reason: "account_created",
      user,
    });

    return res.status(201).json({
      message: "Conta criada com sucesso.",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    await recordRegistrationAudit(req, {
      email: auditEmail,
      outcome: "error",
      reason: "internal_error",
    });

    return res.status(500).json({
      message: "Erro ao criar conta.",
    });
  }
}

async function login(req, res) {
  const email = String(req.body.email || "")
    .toLowerCase()
    .trim();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Informe e-mail e senha." });
  }

  const user = await User.findOne({ email, active: true });
  if (!user) {
    return res.status(401).json({ message: "E-mail ou senha inválidos." });
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    return res.status(401).json({ message: "E-mail ou senha inválidos." });
  }

  const emailEnabled = String(process.env.EMAIL_ENABLED || "false") === "true";

  if (!emailEnabled) {
    const token = generateToken(user);

    return res.json({
      message: "Login realizado em modo desenvolvimento.",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      requiresVerification: false,
    });
  }

  const code = generateCode();

  user.verificationCode = code;
  user.verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  try {
    await sendVerificationEmail(user.email, code);
  } catch (error) {
    console.error("Falha ao enviar código de verificação:", error.message);

    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    return res.status(503).json({
      message:
        "Não foi possível enviar o código por e-mail. Tente novamente em alguns instantes.",
    });
  }

  return res.json({
    message: "Código enviado para o e-mail cadastrado.",
    requiresVerification: true,
  });
}

async function verify(req, res) {
  const email = String(req.body.email || "")
    .toLowerCase()
    .trim();
  const code = String(req.body.code || "").trim();

  const user = await User.findOne({ email, active: true });
  if (!user) {
    return res.status(401).json({ message: "Usuário não encontrado." });
  }

  if (!user.verificationCode || !user.verificationExpires) {
    return res.status(401).json({ message: "Nenhum código ativo." });
  }

  if (user.verificationExpires < new Date()) {
    return res.status(401).json({ message: "Código expirado." });
  }

  if (user.verificationCode !== code) {
    return res.status(401).json({ message: "Código inválido." });
  }

  user.verificationCode = null;
  user.verificationExpires = null;

  await user.save();

  const token = generateToken(user);

  return res.json({
    message: "Acesso validado com sucesso.",
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

async function me(req, res) {
  return res.json({
    user: {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

async function forgotPassword(req, res) {
  try {
    const email = String(req.body.email || "")
      .toLowerCase()
      .trim();

    if (!email) {
      return res.status(400).json({
        message: "Informe o e-mail cadastrado.",
      });
    }

    const user = await User.findOne({ email, active: true });

    /*
      Por segurança, não informamos se o e-mail existe ou não.
      Isso evita exposição de contas cadastradas.
    */
    if (!user) {
      return res.json({
        message: "Código de redefinição enviado para o e-mail cadastrado.",
      });
    }

    const code = generateCode();

    user.passwordResetCode = code;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendPasswordResetEmail(user.email, code);

    return res.json({
      message: "Código de redefinição enviado para o e-mail cadastrado.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao solicitar redefinição de senha.",
    });
  }
}

async function resetPassword(req, res) {
  try {
    const email = String(req.body.email || "")
      .toLowerCase()
      .trim();

    const code = String(req.body.code || "").trim();
    const password = String(req.body.password || "");

    if (!email || !code || !password) {
      return res.status(400).json({
        message: "Informe e-mail, código e nova senha.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "A nova senha deve ter pelo menos 6 caracteres.",
      });
    }

    const user = await User.findOne({ email, active: true });

    if (!user) {
      return res.status(401).json({
        message: "Código inválido ou expirado.",
      });
    }

    if (!user.passwordResetCode || !user.passwordResetExpires) {
      return res.status(401).json({
        message: "Nenhum código de redefinição ativo.",
      });
    }

    if (user.passwordResetExpires < new Date()) {
      return res.status(401).json({
        message: "Código expirado. Solicite um novo código.",
      });
    }

    if (user.passwordResetCode !== code) {
      return res.status(401).json({
        message: "Código inválido.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    user.verificationCode = null;
    user.verificationExpires = null;
    user.passwordChangedAt = new Date();

    await user.save();

    return res.json({
      message: "Senha redefinida com sucesso. Faça login para acessar.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao redefinir senha.",
    });
  }
}

module.exports = {
  register,
  login,
  verify,
  me,
  forgotPassword,
  resetPassword,
  generateToken,
};
