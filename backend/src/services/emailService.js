const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `Denúncia de vaga suspeita - ${reportData.company}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>EmpregaSafe</h2>

        <p>Olá,</p>

        <p>Segue a denúncia registrada no EmpregaSafe.</p>

        <hr />

        <p><strong>Empresa:</strong> ${reportData.company}</p>
        <p><strong>Vaga:</strong> ${reportData.title}</p>
        <p><strong>Data:</strong> ${reportData.date}</p>
        <p><strong>Análise vinculada:</strong> ${reportData.analysisId}</p>
        <p><strong>Classificação:</strong> ${reportData.classification}</p>
        <p><strong>Score:</strong> ${reportData.score}</p>

        <p><strong>Motivo:</strong><br />${reportData.reason}</p>

        <p><strong>Detalhes:</strong><br />${reportData.details}</p>

        ${
          reportData.link
            ? `<p><strong>Link da vaga:</strong><br /><a href="${reportData.link}" target="_blank">${reportData.link}</a></p>`
            : ""
        }

        <hr />

        <p style="font-size: 13px; color: #64748b;">
          Relatório enviado automaticamente pelo EmpregaSafe.
        </p>
      </div>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendReportEmail,
};
