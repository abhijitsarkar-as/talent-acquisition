import nodemailer, { Transporter } from 'nodemailer';
import { env, isSmtpConfigured } from '../../config/env';
import { logger } from '../../utils/logger';

let transporter: Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendNotificationEmail(to: string, subject: string, text: string) {
  if (!isSmtpConfigured) {
    logger.warn('[notify] SMTP not configured, skipping email notification');
    return { attempted: false };
  }
  await getTransporter().sendMail({ from: env.SMTP_FROM, to, subject, text });
  return { attempted: true };
}
