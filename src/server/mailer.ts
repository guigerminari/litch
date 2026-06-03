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
const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";

function normalizedMailProvider() {
  return (process.env.EMAIL_PROVIDER ?? "").trim().toLowerCase();
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function envFlag(value: string | undefined) {
  return ["1", "true", "yes"].includes((value ?? "").toLowerCase());
}

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

function mailFrom() {
  return process.env.EMAIL_FROM ?? process.env.SMTP_FROM ?? process.env.SMTP_USER;
}

async function sendViaResend(payload: MailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = mailFrom();
  if (!apiKey || !from) {
    throw new Error("Envio de e-mail não configurado. Defina RESEND_API_KEY e EMAIL_FROM no Render.");
  }

  const response = await fetch(RESEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Falha ao enviar e-mail via Resend (${response.status}). ${details}`.trim());
  }
}

async function sendViaSmtp(payload: MailPayload) {
  const host = process.env.SMTP_HOST;
  const from = mailFrom();
  if (!host || !from) {
    throw new Error("Envio SMTP não configurado. Defina SMTP_HOST e SMTP_FROM/EMAIL_FROM.");
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

export async function sendGameEmail(payload: MailPayload) {
  const provider = normalizedMailProvider();

  if (provider === "resend" || process.env.RESEND_API_KEY) {
    await sendViaResend(payload);
    return;
  }

  if (provider === "smtp" || process.env.SMTP_HOST) {
    await sendViaSmtp(payload);
    return;
  }

  if (!isProduction() || provider === "outbox" || envFlag(process.env.EMAIL_ALLOW_OUTBOX)) {
    writeOutbox(payload);
    return;
  }

  throw new Error("Envio de e-mail não configurado em produção. Use RESEND_API_KEY + EMAIL_FROM ou configure SMTP.");
}
