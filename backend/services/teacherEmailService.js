/**
 * Teacher Email Service
 * Sends automated survey emails when teachers reach lesson milestones
 */

const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SITE_URL = process.env.SITE_URL || 'https://musicmindacademy.com';

// Lazy-init transporter (same pattern as errorEmailService)
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
 * Send mid-pilot survey email (after Lesson 3)
 */
const sendMidPilotSurveyEmail = async (email, displayName) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('[TeacherEmail] SMTP not configured, skipping mid-pilot survey email');
    return { success: false, error: 'SMTP not configured' };
  }

  const firstName = (displayName || '').split(' ')[0] || 'Teacher';
  const surveyUrl = `${SITE_URL}/survey/mid-pilot?email=${encodeURIComponent(email)}`;

  const subject = "You're halfway through the pilot! Quick survey inside";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #7c3aed; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">Mid-Pilot Check-In</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Music Mind Academy Pilot Program</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151;">Hi ${firstName},</p>
        <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
          Congrats on finishing Lesson 3! You're halfway through the unit. We'd love to hear how it's going so far.
        </p>
        <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
          This quick survey takes about 2 minutes and helps us make the platform better for you and your students.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${surveyUrl}" style="background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">Take the Mid-Pilot Survey</a>
        </div>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          Music Mind Academy &middot; <a href="${SITE_URL}" style="color: #7c3aed;">musicroomtools.org</a>
        </p>
      </div>
    </div>
  `;

  const text = `Hi ${firstName},\n\nCongrats on finishing Lesson 3! You're halfway through the unit.\n\nPlease take our quick mid-pilot survey (2 minutes):\n${surveyUrl}\n\nThanks!\nMusic Mind Academy`;

  try {
    const info = await transport.sendMail({
      from: `"Music Mind Academy" <${SMTP_USER}>`,
      to: email,
      subject,
      text,
      html
    });
    console.log(`[TeacherEmail] Mid-pilot survey sent to ${email} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[TeacherEmail] Failed to send mid-pilot survey to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send final pilot survey email (after Lesson 5)
 */
const sendFinalPilotSurveyEmail = async (email, displayName) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('[TeacherEmail] SMTP not configured, skipping final survey email');
    return { success: false, error: 'SMTP not configured' };
  }

  const firstName = (displayName || '').split(' ')[0] || 'Teacher';
  const surveyUrl = `${SITE_URL}/survey/final?email=${encodeURIComponent(email)}`;

  const subject = "You finished the pilot! Final survey inside";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #059669; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">You Did It!</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Music Mind Academy Pilot Program</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151;">Hi ${firstName},</p>
        <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
          Amazing work completing all 5 lessons! Your students are lucky to have you.
        </p>
        <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
          We'd love your final feedback on the pilot. This survey takes about 5 minutes and your responses directly shape what we build next.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${surveyUrl}" style="background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">Take the Final Survey</a>
        </div>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          Music Mind Academy &middot; <a href="${SITE_URL}" style="color: #059669;">musicroomtools.org</a>
        </p>
      </div>
    </div>
  `;

  const text = `Hi ${firstName},\n\nAmazing work completing all 5 lessons!\n\nPlease take our final pilot survey (5 minutes):\n${surveyUrl}\n\nThanks!\nMusic Mind Academy`;

  try {
    const info = await transport.sendMail({
      from: `"Music Mind Academy" <${SMTP_USER}>`,
      to: email,
      subject,
      text,
      html
    });
    console.log(`[TeacherEmail] Final survey sent to ${email} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[TeacherEmail] Failed to send final survey to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendMidPilotSurveyEmail,
  sendFinalPilotSurveyEmail
};
