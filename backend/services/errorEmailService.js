/**
 * Error Email Notification Service
 * Sends email alerts for critical/high severity errors
 */

const nodemailer = require('nodemailer');

// Email configuration from environment variables
const ALERT_EMAIL = process.env.ERROR_ALERT_EMAIL || 'rob@musicmindacademy.com';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// Rate limiting - don't spam emails
const emailCooldown = new Map(); // Track last email time per error message
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes between duplicate errors

// Create transporter (lazy init to allow env vars to load)
let transporter = null;

const getTransporter = () => {
  if (!transporter && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }
  return transporter;
};

/**
 * Check if we should send an email for this error
 * (rate limiting to prevent email spam)
 */
const shouldSendEmail = (error) => {
  // Only send for critical or high severity
  if (!['critical', 'high'].includes(error.severity)) {
    return false;
  }

  // Check cooldown
  const key = `${error.message}:${error.page}`;
  const lastSent = emailCooldown.get(key);

  if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
    return false;
  }

  emailCooldown.set(key, Date.now());
  return true;
};

/**
 * Format breadcrumbs for email
 */
const formatBreadcrumbs = (breadcrumbs) => {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return 'No breadcrumbs recorded';
  }

  return breadcrumbs.map(b => {
    const time = new Date(b.timestamp).toLocaleTimeString();
    return `[${time}] ${b.type}: ${b.message}`;
  }).join('\n');
};

/**
 * Format console logs for email
 */
const formatConsoleLogs = (logs) => {
  if (!logs || logs.length === 0) {
    return 'No console logs captured';
  }

  return logs.map(log => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    return `[${time}] ${log.level.toUpperCase()}: ${log.message}`;
  }).join('\n');
};

/**
 * Send error alert email
 */
const sendErrorAlert = async (error) => {
  const transport = getTransporter();

  if (!transport) {
    console.log('[ErrorEmailService] SMTP not configured, skipping email');
    return false;
  }

  if (!shouldSendEmail(error)) {
    console.log('[ErrorEmailService] Rate limited or low severity, skipping email');
    return false;
  }

  const severityEmoji = error.severity === 'critical' ? '🚨' : '⚠️';
  const siteLabel = error.siteMode === 'academy' ? 'Music Mind Academy' :
                    error.siteMode === 'tools' ? 'Music Room Tools' : 'Unknown Site';

  const subject = `${severityEmoji} [${error.severity.toUpperCase()}] ${siteLabel} Error: ${error.message.substring(0, 50)}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${error.severity === 'critical' ? '#dc2626' : '#f59e0b'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 18px;">${severityEmoji} ${error.severity.toUpperCase()} Error</h1>
        <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">${siteLabel}</p>
      </div>

      <div style="background: #1f2937; color: #e5e7eb; padding: 20px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #f59e0b; font-size: 16px; margin: 0 0 15px;">Error Details</h2>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; width: 100px;">Message:</td>
            <td style="padding: 8px 0; color: #f87171; font-family: monospace;">${error.message}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af;">Type:</td>
            <td style="padding: 8px 0;">${error.errorType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af;">Page:</td>
            <td style="padding: 8px 0;">${error.page}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af;">Component:</td>
            <td style="padding: 8px 0;">${error.component || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af;">Device:</td>
            <td style="padding: 8px 0;">${error.device} / ${error.browser}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af;">Screen:</td>
            <td style="padding: 8px 0;">${error.screenSize || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af;">Online:</td>
            <td style="padding: 8px 0;">${error.online ? 'Yes' : 'No'}</td>
          </tr>
          ${error.lesson ? `
          <tr>
            <td style="padding: 8px 0; color: #9ca3af;">Lesson:</td>
            <td style="padding: 8px 0;">${error.lesson}</td>
          </tr>` : ''}
          ${error.activity ? `
          <tr>
            <td style="padding: 8px 0; color: #9ca3af;">Activity:</td>
            <td style="padding: 8px 0;">${error.activity}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; color: #9ca3af;">Time:</td>
            <td style="padding: 8px 0;">${error.localTime || new Date(error.createdAt).toLocaleString()}</td>
          </tr>
        </table>

        ${error.stack ? `
        <h3 style="color: #f59e0b; font-size: 14px; margin: 20px 0 10px;">Stack Trace</h3>
        <pre style="background: #111827; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #9ca3af; white-space: pre-wrap; word-break: break-all;">${error.stack}</pre>
        ` : ''}

        <h3 style="color: #f59e0b; font-size: 14px; margin: 20px 0 10px;">User Actions (Breadcrumbs)</h3>
        <pre style="background: #111827; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #9ca3af; white-space: pre-wrap;">${formatBreadcrumbs(error.breadcrumbs)}</pre>

        <h3 style="color: #f59e0b; font-size: 14px; margin: 20px 0 10px;">Console Output</h3>
        <pre style="background: #111827; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #9ca3af; white-space: pre-wrap;">${formatConsoleLogs(error.consoleLogs)}</pre>

        <p style="color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #374151;">
          View all errors in the <a href="https://musicmindacademy.com/pilot-admin" style="color: #60a5fa;">Pilot Admin Dashboard</a>
        </p>
      </div>
    </div>
  `;

  const text = `
${error.severity.toUpperCase()} Error - ${siteLabel}

Message: ${error.message}
Type: ${error.errorType}
Page: ${error.page}
Component: ${error.component || 'Unknown'}
Device: ${error.device} / ${error.browser}
Screen: ${error.screenSize || 'Unknown'}
Online: ${error.online ? 'Yes' : 'No'}
${error.lesson ? `Lesson: ${error.lesson}` : ''}
${error.activity ? `Activity: ${error.activity}` : ''}
Time: ${error.localTime || new Date(error.createdAt).toLocaleString()}

Stack Trace:
${error.stack || 'No stack trace'}

User Actions (Breadcrumbs):
${formatBreadcrumbs(error.breadcrumbs)}

Console Output:
${formatConsoleLogs(error.consoleLogs)}

View all errors: https://musicmindacademy.com/pilot-admin
  `;

  try {
    await transport.sendMail({
      from: `"Music Mind Academy Errors" <${SMTP_USER}>`,
      to: ALERT_EMAIL,
      subject,
      text,
      html
    });

    console.log(`[ErrorEmailService] Sent alert email for: ${error.message.substring(0, 50)}`);
    return true;
  } catch (err) {
    console.error('[ErrorEmailService] Failed to send email:', err.message);
    return false;
  }
};

module.exports = {
  sendErrorAlert
};
