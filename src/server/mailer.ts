import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import nodemailer from "nodemailer";

interface MailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const DEFAULT_OUTBOX_FILE = join(process.cwd(), "data", "email-outbox.log");

function smtpPort() {
  return Number(process.env.SMTP_PORT ?? 587);
}

function smtpSecure() {
  const value = process.env.SMTP_SECURE?.toLowerCase();
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return smtpPort() === 465;
}

function writeOutbox(payload: MailPayload) {
  const outboxFile = process.env.EMAIL_OUTBOX_FILE ?? DEFAULT_OUTBOX_FILE;
  mkdirSync(dirname(outboxFile), { recursive: true });
  appendFileSync(
    outboxFile,
    [
      `--- ${new Date().toISOString()} ---`,
      `To: ${payload.to}`,
      `Subject: ${payload.subject}`,
      payload.text,
      ""
    ].join("\n"),
    "utf8"
  );
  console.log(`[mail:outbox] ${payload.subject} -> ${payload.to}. Veja ${outboxFile}`);
}

export async function sendGameEmail(payload: MailPayload) {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  if (!host || !from) {
    writeOutbox(payload);
    return;
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const transporter = nodemailer.createTransport({
    host,
    port: smtpPort(),
    secure: smtpSecure(),
    auth: user && pass ? { user, pass } : undefined
  });

  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  });
}
