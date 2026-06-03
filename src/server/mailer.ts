import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import nodemailer from "nodemailer";
import { Resend } from 'resend';

interface MailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const DEFAULT_OUTBOX_FILE = join(process.cwd(), "data", "email-outbox.log");
const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";

function cleanEnv(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function normalizedMailProvider() {
  return (cleanEnv(process.env.EMAIL_PROVIDER) ?? "").toLowerCase();
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function envFlag(value: string | undefined) {
  return ["1", "true", "yes"].includes((cleanEnv(value) ?? "").toLowerCase());
}

function smtpPort() {
  return Number(cleanEnv(process.env.SMTP_PORT) ?? 587);
}

function smtpSecure() {
  const value = cleanEnv(process.env.SMTP_SECURE)?.toLowerCase();
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return smtpPort() === 465;
}

function writeOutbox(payload: MailPayload) {
  const outboxFile = cleanEnv(process.env.EMAIL_OUTBOX_FILE) ?? DEFAULT_OUTBOX_FILE;
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
  return cleanEnv(process.env.EMAIL_FROM) ?? cleanEnv(process.env.SMTP_FROM) ?? cleanEnv(process.env.SMTP_USER);
}

async function sendViaResend(payload: MailPayload) {
  const apiKey = cleanEnv(process.env.RESEND_API_KEY);
  const from = mailFrom();
  if (!apiKey || !from) {
    throw new Error("Envio de e-mail nao configurado. Defina RESEND_API_KEY e EMAIL_FROM no Render.");
  }
  if (!apiKey.startsWith("re_")) {
    throw new Error("RESEND_API_KEY invalida. Use uma API key da Resend que comeca com re_; nao use token do PostHog.");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html
  });

  if (error) {
    throw new Error(`Falha ao enviar e-mail via Resend. ${error.message}`.trim());
  }
}

async function sendViaSmtp(payload: MailPayload) {
  const host = cleanEnv(process.env.SMTP_HOST);
  const from = mailFrom();
  if (!host || !from) {
    throw new Error("Envio SMTP nao configurado. Defina SMTP_HOST e SMTP_FROM/EMAIL_FROM.");
  }

  const user = cleanEnv(process.env.SMTP_USER);
  const pass = cleanEnv(process.env.SMTP_PASS);
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

  if (provider === "resend" || cleanEnv(process.env.RESEND_API_KEY)) {
    await sendViaResend(payload);
    return;
  }

  if (provider === "smtp" || cleanEnv(process.env.SMTP_HOST)) {
    await sendViaSmtp(payload);
    return;
  }

  if (!isProduction() || provider === "outbox" || envFlag(process.env.EMAIL_ALLOW_OUTBOX)) {
    writeOutbox(payload);
    return;
  }

  throw new Error("Envio de e-mail nao configurado em producao. Use RESEND_API_KEY + EMAIL_FROM ou configure SMTP.");
}
