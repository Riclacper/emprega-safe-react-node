const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 465),
  secure: String(process.env.EMAIL_SECURE || "true") === "true",
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeEmailSubject(value) {
  return String(value || "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

async function sendVerificationEmail(to, code) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Código de acesso - EmpregaSafe",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>EmpregaSafe</h2>
        <p>Use o código abaixo para acessar a plataforma:</p>
        <h1 style="letter-spacing: 6px;">${code}</h1>
        <p>Este código expira em 10 minutos.</p>
        <p>Se você não tentou acessar o sistema, ignore este e-mail.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(to, code) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Código para redefinir senha - EmpregaSafe",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>EmpregaSafe</h2>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Use o código abaixo para criar uma nova senha:</p>
        <h1 style="letter-spacing: 6px;">${code}</h1>
        <p>Este código expira em 10 minutos.</p>
        <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
      </div>
    `,
  });
}

async function sendReportEmail(to, reportData) {
  const subjectCompany = sanitizeEmailSubject(
    reportData.company || "Empresa não informada",
  );
  const company = escapeHtml(reportData.company || "Empresa não informada");
  const title = escapeHtml(reportData.title || "Vaga não informada");
  const date = escapeHtml(reportData.date || "");
  const analysisId = escapeHtml(reportData.analysisId || "Não vinculada");
  const classification = escapeHtml(
    reportData.classification || "Não informada",
  );
  const score = escapeHtml(reportData.score || "Não informado");
  const reason = escapeHtml(reportData.reason || "Não informado");
  const details = escapeHtml(reportData.details || "Não informado");
  const link = escapeHtml(reportData.link || "");
  const safeLink = isSafeHttpUrl(reportData.link) ? link : "";

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `Denúncia de vaga suspeita - ${subjectCompany}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background: #f8fafc; padding: 24px;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 18px; overflow: hidden;">
          <div style="background: #eef2ff; padding: 22px 24px; border-bottom: 1px solid #c7d2fe;">
            <p style="margin: 0 0 6px; color: #243fd1; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;">EmpregaSafe</p>
            <h2 style="margin: 0; color: #0f172a;">Denúncia de vaga suspeita</h2>
            <p style="margin: 8px 0 0; color: #475569;">Segue o registro da ocorrência enviado pela plataforma.</p>
          </div>

          <div style="padding: 22px 24px;">
            <div style="border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; margin-bottom: 16px;">
              <h3 style="margin: 0 0 12px; color: #0f172a;">Resumo da ocorrência</h3>
              <p style="margin: 6px 0;"><strong>Empresa:</strong> ${company}</p>
              <p style="margin: 6px 0;"><strong>Vaga:</strong> ${title}</p>
              <p style="margin: 6px 0;"><strong>Data:</strong> ${date}</p>
              <p style="margin: 6px 0;"><strong>Análise vinculada:</strong> ${analysisId}</p>
              <p style="margin: 6px 0;"><strong>Classificação:</strong> ${classification}</p>
              <p style="margin: 6px 0;"><strong>Score:</strong> ${score}</p>
            </div>

            <div style="border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; margin-bottom: 16px;">
              <h3 style="margin: 0 0 12px; color: #0f172a;">Motivo e detalhes</h3>
              <p style="margin: 6px 0;"><strong>Motivo:</strong><br />${reason}</p>
              <p style="margin: 14px 0 0;"><strong>Detalhes:</strong><br />${details}</p>
            </div>

            ${
              link
                ? `<div style="border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; margin-bottom: 16px;">
                    <h3 style="margin: 0 0 12px; color: #0f172a;">Link informado</h3>
                    ${
                      safeLink
                        ? `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" style="color: #243fd1; word-break: break-all;">${link}</a>`
                        : `<p style="margin: 0; word-break: break-all;">${link}</p>`
                    }
                  </div>`
                : ""
            }

            <p style="font-size: 13px; color: #64748b; margin: 0;">
              E-mail enviado automaticamente pelo EmpregaSafe. Valide empresa, domínio, canal de contato e condições da vaga antes de compartilhar dados pessoais ou realizar pagamentos.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}

module.exports = {
  escapeHtml,
  sanitizeEmailSubject,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendReportEmail,
};
