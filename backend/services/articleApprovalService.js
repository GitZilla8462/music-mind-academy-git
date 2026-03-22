/**
 * Article Approval Service
 * Generates articles as unapproved, sends a weekly digest email
 * with approve/skip links for each article.
 */

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Article = require('../models/Article');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SMTP_PASS = process.env.SMTP_PASS;
const APPROVAL_EMAIL = 'rob@musicmindacademy.com';
const FROM_EMAIL = process.env.SMTP_USER || 'rob@musicmindacademy.com';

const RAILWAY_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : (process.env.RAILWAY_URL || `http://localhost:${process.env.PORT || 5000}`);

// Simple token for approval links (not full auth, just prevents random access)
const APPROVAL_SECRET = process.env.ADMIN_SECRET || process.env.JWT_SECRET || 'article-approval-fallback';

let transporter = null;

const getTransporter = () => {
  if (!transporter && (RESEND_API_KEY || SMTP_PASS)) {
    transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: RESEND_API_KEY || SMTP_PASS
      }
    });
  }
  return transporter;
};

/**
 * Generate a simple approval token for an article
 */
const generateToken = (articleId, action) => {
  const data = `${articleId}:${action}:${APPROVAL_SECRET}`;
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 32);
};

/**
 * Verify an approval token
 */
const verifyToken = (articleId, action, token) => {
  return generateToken(articleId, action) === token;
};

/**
 * Send the weekly approval digest email
 */
const sendApprovalDigest = async (articles) => {
  const transport = getTransporter();
  if (!transport) {
    console.error('[Approval] No email transport configured (missing RESEND_API_KEY)');
    return false;
  }

  if (!articles.length) {
    console.log('[Approval] No articles to review — skipping email');
    return true;
  }

  const articleRows = articles.map(article => {
    const approveToken = generateToken(article._id.toString(), 'approve');
    const skipToken = generateToken(article._id.toString(), 'skip');
    const readUrl = `${RAILWAY_URL}/api/news/preview/${article._id}?token=${approveToken}`;
    const approveUrl = `${RAILWAY_URL}/api/news/approve/${article._id}?token=${approveToken}`;
    const skipUrl = `${RAILWAY_URL}/api/news/skip/${article._id}?token=${skipToken}`;

    const genre = article.genres?.length ? article.genres.join(', ') : 'general';
    const source = article.source_name || 'Unknown';
    const preview = (article.body_standard || '').replace(/^[^\n]*\n?[^\n]*\n?/, '').slice(0, 120).trim();

    return `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
        <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #111827;">
          ${article.generated_headline}
        </p>
        <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
          ${source} &middot; ${genre}
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; color: #374151; line-height: 1.5;">
          ${preview}...
        </p>
        <div>
          <a href="${readUrl}" style="display: inline-block; padding: 8px 16px; background: #f3f4f6; color: #374151; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; margin-right: 8px;">
            Read Full Article
          </a>
          <a href="${approveUrl}" style="display: inline-block; padding: 8px 16px; background: #059669; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; margin-right: 8px;">
            Approve
          </a>
          <a href="${skipUrl}" style="display: inline-block; padding: 8px 16px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">
            Skip
          </a>
        </div>
      </td>
    </tr>`;
  }).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
    <h1 style="margin: 0 0 4px; font-size: 20px; color: #111827;">
      Music News — Weekly Review
    </h1>
    <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">
      ${articles.length} new article${articles.length !== 1 ? 's' : ''} ready for review. Approve the ones you want students to see.
    </p>

    <table style="width: 100%; border-collapse: collapse;">
      ${articleRows}
    </table>

    <p style="margin: 24px 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
      Music Mind Academy &middot; Articles are hidden from students until you approve them.
    </p>
  </div>
</body>
</html>`;

  try {
    await transport.sendMail({
      from: `Music Mind Academy <${FROM_EMAIL}>`,
      to: APPROVAL_EMAIL,
      subject: `Music News Review — ${articles.length} article${articles.length !== 1 ? 's' : ''} ready`,
      html
    });
    console.log(`[Approval] Digest sent to ${APPROVAL_EMAIL} with ${articles.length} articles`);
    return true;
  } catch (error) {
    console.error('[Approval] Failed to send digest:', error.message);
    return false;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  sendApprovalDigest
};
