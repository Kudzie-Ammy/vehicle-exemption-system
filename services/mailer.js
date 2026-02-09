// services/mailer.ts
const nodemailer = require("nodemailer");

let transporter;

// Call this once at startup to configure using env vars.
// It returns a transporter that may fall back to a console logger if email config is missing.
function getTransporter() {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  // prefer explicit SMTP config
  if (process.env.SMTP_HOST && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true" || false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    console.log("Mailer: using SMTP transporter");
    return transporter;
  }

  // If Gmail-specific env present (optional)
  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });
    console.log("Mailer: using Gmail transporter");
    return transporter;
  }

  // Fallback: fake transporter that logs the message (development)
  transporter = {
    sendMail: async (mailOpts) => {
      console.warn(
        "Mailer fallback: no SMTP configured — logging email to console."
      );
      console.log("MAIL (to):", mailOpts.to);
      console.log("MAIL (subject):", mailOpts.subject);
      console.log("MAIL (html):", mailOpts.html);
      return Promise.resolve({ accepted: [mailOpts.to] });
    },
  };
  return transporter;
}

module.exports = { getTransporter };
