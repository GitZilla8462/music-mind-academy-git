/**
 * Teacher Email Service
 * Sends automated survey emails, drip emails, and admin notifications
 * Supports custom templates stored in MongoDB with {{variable}} placeholders
 */

const nodemailer = require('nodemailer');
const EmailTemplate = require('../models/EmailTemplate');

const SMTP_USER = process.env.SMTP_USER || 'rob@musicmindacademy.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SMTP_PASS = process.env.SMTP_PASS;
const SITE_URL = process.env.SITE_URL || 'https://musicmindacademy.com';
const RAILWAY_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : (process.env.RAILWAY_URL || `http://localhost:${process.env.PORT || 5000}`);
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const ADMIN_EMAIL = 'rob@musicmindacademy.com';

// Lazy-init transporter (same pattern as errorEmailService)
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
 * Replace {{variable}} placeholders in a template string
 */
const renderTemplate = (html, vars) => {
  return html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match;
  });
};

/**
 * Try to load a custom template from MongoDB, fall back to default
 */
const getCustomOrDefaultHtml = async (type, vars) => {
  try {
    const custom = await EmailTemplate.findOne({ type });
    if (custom) {
      return {
        subject: renderTemplate(custom.subject, vars),
        html: renderTemplate(custom.htmlContent, vars),
        isCustom: true
      };
    }
  } catch (err) {
    console.warn(`[TeacherEmail] MongoDB template lookup failed for ${type}, using default:`, err.message);
  }
  return null;
};

// =============================================
// DEFAULT TEMPLATES (with {{variable}} syntax)
// Used for preview, editing baseline, and fallback
// =============================================

const getDefaultTemplates = () => ({
  'drip-1': {
    subject: "You're in! Music Mind Academy pilot access is ready",
    from: `"Rob Taube - Music Mind Academy" <${SMTP_USER}>`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0c4a6e; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">Welcome to the Pilot!</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Music Mind Academy</p>
  </div>
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; color: #374151;">Hi {{firstName}},</p>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
      I am sending this message to you because you signed up for my pilot for general music lessons. I am unlocking my pilot now so you can see the lessons and website before you teach with your students.
    </p>
    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: 600; color: #0c4a6e;">Key Details:</p>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
        <li><strong>Pilot Start:</strong> March 15, 2026</li>
        <li><strong>Access Through:</strong> June 30, 2026</li>
      </ul>
    </div>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6; font-weight: 600;">Here's what to do:</p>
    <ol style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
      <li>Go to <a href="{{siteUrl}}" style="color: #0ea5e9; font-weight: 600;">musicmindacademy.com</a> and log in with your teacher email</li>
      <li>Explore the lessons and poke around</li>
      <li>Reply to this email to let me know you're in</li>
    </ol>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">I'm excited to have you as part of this pilot. Don't hesitate to reach out if you have any questions!</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{loginUrl}}" style="background: #0ea5e9; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">Log In Now</a>
    </div>
    <p style="font-size: 15px; color: #4b5563;">Best,<br><strong>Rob Taube</strong><br><span style="color: #6b7280;">Music Mind Academy</span></p>
    <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">Music Mind Academy &middot; <a href="{{siteUrl}}" style="color: #0ea5e9;">musicmindacademy.com</a></p>
  </div>
</div>`
  },
  'drip-2': {
    subject: 'Just checking in - have you had a chance to log in?',
    from: `"Rob Taube - Music Mind Academy" <${SMTP_USER}>`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
    <p style="font-size: 16px; color: #374151;">Hi {{firstName}},</p>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">I wanted to check in - I approved your Music Mind Academy pilot access about a week ago. Have you had a chance to log in and explore?</p>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">If you ran into any issues logging in, just reply to this email and I'll help you get set up. The pilot runs through June 30, so there's still plenty of time.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{loginUrl}}" style="background: #0ea5e9; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">Log In Now</a>
    </div>
    <p style="font-size: 15px; color: #4b5563;">Best,<br><strong>Rob Taube</strong><br><span style="color: #6b7280;">Music Mind Academy</span></p>
    <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">Music Mind Academy &middot; <a href="{{siteUrl}}" style="color: #0ea5e9;">musicmindacademy.com</a></p>
  </div>
</div>`
  },
  'drip-3': {
    subject: 'Last reminder - your pilot access is waiting',
    from: `"Rob Taube - Music Mind Academy" <${SMTP_USER}>`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
    <p style="font-size: 16px; color: #374151;">Hi {{firstName}},</p>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">This is my last reminder - your free pilot access to Music Mind Academy is still waiting for you. I'd love for you to try it out before the pilot ends on June 30.</p>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">It only takes a minute to log in and start exploring the lessons. Everything is ready to go - no setup needed.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{loginUrl}}" style="background: #0ea5e9; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">Log In Now</a>
    </div>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">If you're no longer interested or have any questions, just reply to this email. No worries either way!</p>
    <p style="font-size: 15px; color: #4b5563;">Best,<br><strong>Rob Taube</strong><br><span style="color: #6b7280;">Music Mind Academy</span></p>
    <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">Music Mind Academy &middot; <a href="{{siteUrl}}" style="color: #0ea5e9;">musicmindacademy.com</a></p>
  </div>
</div>`
  },
  'survey-l3': {
    subject: "You're halfway through the pilot! Quick survey inside",
    from: `"Music Mind Academy" <${SMTP_USER}>`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #7c3aed; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">Mid-Pilot Check-In</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Music Mind Academy Pilot Program</p>
  </div>
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; color: #374151;">Hi {{firstName}},</p>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Congrats on finishing Lesson 3! You're halfway through the unit. We'd love to hear how it's going so far.</p>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">This quick survey takes about 2 minutes and helps us make the platform better for you and your students.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{surveyUrl}}" style="background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">Take the Mid-Pilot Survey</a>
    </div>
    <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">Music Mind Academy &middot; <a href="{{siteUrl}}" style="color: #7c3aed;">musicroomtools.org</a></p>
  </div>
</div>`
  },
  'survey-l5': {
    subject: 'You finished the pilot! Final survey inside',
    from: `"Music Mind Academy" <${SMTP_USER}>`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #059669; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">You Did It!</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Music Mind Academy Pilot Program</p>
  </div>
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; color: #374151;">Hi {{firstName}},</p>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Amazing work completing all 5 lessons! Your students are lucky to have you.</p>
    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">We'd love your final feedback on the pilot. This survey takes about 5 minutes and your responses directly shape what we build next.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{surveyUrl}}" style="background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">Take the Final Survey</a>
    </div>
    <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">Music Mind Academy &middot; <a href="{{siteUrl}}" style="color: #059669;">musicroomtools.org</a></p>
  </div>
</div>`
  },
  'application-notify': {
    subject: 'New pilot application: {{fullName}}',
    from: `"Music Mind Academy" <${SMTP_USER}>`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0ea5e9; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">New Pilot Application</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Music Mind Academy</p>
  </div>
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
    {{applicationTable}}
    {{applicationDetails}}
    <div style="text-align: center; margin: 28px 0; display: flex; gap: 16px; justify-content: center;">
      <a href="{{approveUrl}}" style="background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">Approve</a>
      <a href="{{declineUrl}}" style="background: #6b7280; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">Decline</a>
    </div>
  </div>
  <div style="padding: 16px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; background: #f9fafb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">Approving will add their school email to the approved list and send a welcome email.</p>
  </div>
</div>`
  }
});

// =============================================
// SEND FUNCTIONS
// Each checks MongoDB for custom template first
// =============================================

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
  const vars = { firstName, surveyUrl, siteUrl: SITE_URL, loginUrl: `${SITE_URL}/login` };

  // Check for custom template
  const custom = await getCustomOrDefaultHtml('survey-l3', vars);
  const subject = custom ? custom.subject : "You're halfway through the pilot! Quick survey inside";
  const html = custom ? custom.html : renderTemplate(getDefaultTemplates()['survey-l3'].html, vars);
  const text = `Hi ${firstName},\n\nCongrats on finishing Lesson 3! You're halfway through the unit.\n\nPlease take our quick mid-pilot survey (2 minutes):\n${surveyUrl}\n\nThanks!\nMusic Mind Academy`;

  try {
    const info = await transport.sendMail({
      from: `"Music Mind Academy" <${SMTP_USER}>`,
      replyTo: ADMIN_EMAIL,
      to: email,
      bcc: ADMIN_EMAIL,
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
  const vars = { firstName, surveyUrl, siteUrl: SITE_URL, loginUrl: `${SITE_URL}/login` };

  const custom = await getCustomOrDefaultHtml('survey-l5', vars);
  const subject = custom ? custom.subject : "You finished the pilot! Final survey inside";
  const html = custom ? custom.html : renderTemplate(getDefaultTemplates()['survey-l5'].html, vars);
  const text = `Hi ${firstName},\n\nAmazing work completing all 5 lessons!\n\nPlease take our final pilot survey (5 minutes):\n${surveyUrl}\n\nThanks!\nMusic Mind Academy`;

  try {
    const info = await transport.sendMail({
      from: `"Music Mind Academy" <${SMTP_USER}>`,
      replyTo: ADMIN_EMAIL,
      to: email,
      bcc: ADMIN_EMAIL,
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

/**
 * Send admin notification email when a new pilot application is submitted
 */
const sendApplicationNotificationEmail = async (applicationData, applicationId) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('[TeacherEmail] SMTP not configured, skipping application notification');
    return { success: false, error: 'SMTP not configured' };
  }

  const { firstName, lastName, schoolEmail, schoolName, personalEmail } = applicationData;
  const approveUrl = `${RAILWAY_URL}/api/applications/approve/${applicationId}?token=${ADMIN_SECRET}`;
  const declineUrl = `${RAILWAY_URL}/api/applications/decline/${applicationId}?token=${ADMIN_SECRET}`;

  // Build the dynamic application table HTML
  const applicationTable = `<table style="width: 100%; border-collapse: collapse; font-size: 15px;">
      <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Name</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${firstName} ${lastName}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">School Email</td><td style="padding: 8px 0; color: #1e293b;">${schoolEmail}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Personal Email</td><td style="padding: 8px 0; color: #1e293b;">${personalEmail || '-'}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">School</td><td style="padding: 8px 0; color: #1e293b;">${schoolName}</td></tr>
      ${applicationData.city ? `<tr><td style="padding: 8px 0; color: #6b7280;">Location</td><td style="padding: 8px 0; color: #1e293b;">${applicationData.city}${applicationData.state ? ', ' + applicationData.state : ''}</td></tr>` : ''}
      ${applicationData.grades?.length ? `<tr><td style="padding: 8px 0; color: #6b7280;">Grades</td><td style="padding: 8px 0; color: #1e293b;">${applicationData.grades.join(', ')}</td></tr>` : ''}
      ${applicationData.devices?.length ? `<tr><td style="padding: 8px 0; color: #6b7280;">Devices</td><td style="padding: 8px 0; color: #1e293b;">${applicationData.devices.join(', ')}</td></tr>` : ''}
      ${applicationData.classSize ? `<tr><td style="padding: 8px 0; color: #6b7280;">Class Size</td><td style="padding: 8px 0; color: #1e293b;">${applicationData.classSize}</td></tr>` : ''}
    </table>`;

  const applicationDetails = [
    applicationData.biggestChallenge && `<div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px;"><p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Biggest Challenge</p><p style="margin: 0; font-size: 14px; color: #374151;">${applicationData.biggestChallenge}</p></div>`,
    applicationData.whyPilot && `<div style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 8px;"><p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Why Pilot</p><p style="margin: 0; font-size: 14px; color: #374151;">${applicationData.whyPilot}</p></div>`,
    applicationData.toolsUsed?.length && `<div style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 8px;"><p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Tools Used Before</p><p style="margin: 0; font-size: 14px; color: #374151;">${applicationData.toolsUsed.join(', ')}</p></div>`,
    applicationData.anythingElse && `<div style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 8px;"><p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Anything Else</p><p style="margin: 0; font-size: 14px; color: #374151;">${applicationData.anythingElse}</p></div>`
  ].filter(Boolean).join('');

  const vars = {
    fullName: `${firstName} ${lastName}`,
    approveUrl, declineUrl,
    applicationTable, applicationDetails,
    siteUrl: SITE_URL
  };

  const custom = await getCustomOrDefaultHtml('application-notify', vars);
  const subject = custom ? custom.subject : `New pilot application: ${firstName} ${lastName}`;
  const html = custom ? custom.html : renderTemplate(getDefaultTemplates()['application-notify'].html, vars);
  const text = `New pilot application from ${firstName} ${lastName}\nSchool Email: ${schoolEmail}\nSchool: ${schoolName}\n\nApprove: ${approveUrl}\nDecline: ${declineUrl}`;

  try {
    const info = await transport.sendMail({
      from: `"Music Mind Academy" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject,
      text,
      html
    });
    console.log(`[TeacherEmail] Application notification sent for ${schoolEmail} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[TeacherEmail] Failed to send application notification:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Drip Email 1: Welcome email (sent immediately on approval)
 */
const sendDripWelcomeEmail = async (email, firstName) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('[TeacherEmail] SMTP not configured, skipping drip welcome email');
    return { success: false, error: 'SMTP not configured' };
  }

  const name = firstName || 'Teacher';
  const vars = { firstName: name, siteUrl: SITE_URL, loginUrl: `${SITE_URL}/login` };

  const custom = await getCustomOrDefaultHtml('drip-1', vars);
  const subject = custom ? custom.subject : "You're in! Music Mind Academy pilot access is ready";
  const html = custom ? custom.html : renderTemplate(getDefaultTemplates()['drip-1'].html, vars);
  const text = `Hi ${name},\n\nI am sending this message to you because you signed up for my pilot for general music lessons. I am unlocking my pilot now so you can see the lessons and website before you teach with your students.\n\nKey Details:\n- Pilot Start: March 15, 2026\n- Access Through: June 30, 2026\n\nHere's what to do:\n1. Go to musicmindacademy.com and log in with your teacher email\n2. Explore the lessons and poke around\n3. Reply to this email to let me know you're in\n\nBest,\nRob Taube\nMusic Mind Academy`;

  try {
    const info = await transport.sendMail({
      from: `"Rob Taube - Music Mind Academy" <${SMTP_USER}>`,
      replyTo: ADMIN_EMAIL,
      to: email,
      bcc: ADMIN_EMAIL,
      subject,
      text,
      html
    });
    console.log(`[TeacherEmail] Drip welcome sent to ${email} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[TeacherEmail] Failed to send drip welcome to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Drip Email 2: Follow-up (sent 7 days after approval if no login)
 */
const sendDripFollowup1Email = async (email, firstName) => {
  const transport = getTransporter();
  if (!transport) {
    return { success: false, error: 'SMTP not configured' };
  }

  const name = firstName || 'Teacher';
  const vars = { firstName: name, siteUrl: SITE_URL, loginUrl: `${SITE_URL}/login` };

  const custom = await getCustomOrDefaultHtml('drip-2', vars);
  const subject = custom ? custom.subject : "Just checking in - have you had a chance to log in?";
  const html = custom ? custom.html : renderTemplate(getDefaultTemplates()['drip-2'].html, vars);
  const text = `Hi ${name},\n\nI wanted to check in - I approved your Music Mind Academy pilot access about a week ago. Have you had a chance to log in and explore?\n\nIf you ran into any issues logging in, just reply to this email and I'll help you get set up. The pilot runs through June 30, so there's still plenty of time.\n\nLog in: ${SITE_URL}/login\n\nBest,\nRob Taube\nMusic Mind Academy`;

  try {
    const info = await transport.sendMail({
      from: `"Rob Taube - Music Mind Academy" <${SMTP_USER}>`,
      replyTo: ADMIN_EMAIL,
      to: email,
      bcc: ADMIN_EMAIL,
      subject,
      text,
      html
    });
    console.log(`[TeacherEmail] Drip followup-1 sent to ${email} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[TeacherEmail] Failed to send drip followup-1 to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Drip Email 3: Final reminder (sent 14 days after approval if no login)
 */
const sendDripFollowup2Email = async (email, firstName) => {
  const transport = getTransporter();
  if (!transport) {
    return { success: false, error: 'SMTP not configured' };
  }

  const name = firstName || 'Teacher';
  const vars = { firstName: name, siteUrl: SITE_URL, loginUrl: `${SITE_URL}/login` };

  const custom = await getCustomOrDefaultHtml('drip-3', vars);
  const subject = custom ? custom.subject : "Last reminder - your pilot access is waiting";
  const html = custom ? custom.html : renderTemplate(getDefaultTemplates()['drip-3'].html, vars);
  const text = `Hi ${name},\n\nThis is my last reminder - your free pilot access to Music Mind Academy is still waiting for you. I'd love for you to try it out before the pilot ends on June 30.\n\nIt only takes a minute to log in and start exploring the lessons. Everything is ready to go - no setup needed.\n\nLog in: ${SITE_URL}/login\n\nIf you're no longer interested or have any questions, just reply to this email. No worries either way!\n\nBest,\nRob Taube\nMusic Mind Academy`;

  try {
    const info = await transport.sendMail({
      from: `"Rob Taube - Music Mind Academy" <${SMTP_USER}>`,
      replyTo: ADMIN_EMAIL,
      to: email,
      bcc: ADMIN_EMAIL,
      subject,
      text,
      html
    });
    console.log(`[TeacherEmail] Drip followup-2 sent to ${email} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[TeacherEmail] Failed to send drip followup-2 to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Get sample variables for preview rendering
 */
const getSampleVars = (type) => {
  const vars = {
    firstName: 'Jane',
    siteUrl: SITE_URL,
    loginUrl: `${SITE_URL}/login`,
    surveyUrl: `${SITE_URL}/survey/mid-pilot?email=jane.smith%40school.edu`,
    fullName: 'Jane Smith',
    approveUrl: '#',
    declineUrl: '#',
    applicationTable: `<table style="width: 100%; border-collapse: collapse; font-size: 15px;">
      <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Name</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">Jane Smith</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">School Email</td><td style="padding: 8px 0; color: #1e293b;">jane.smith@school.edu</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">School</td><td style="padding: 8px 0; color: #1e293b;">Lincoln Middle School</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;">Grades</td><td style="padding: 8px 0; color: #1e293b;">6th, 7th, 8th</td></tr>
    </table>`,
    applicationDetails: `<div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px;"><p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Why Pilot</p><p style="margin: 0; font-size: 14px; color: #374151;">I want to bring more technology into my music classroom.</p></div>`
  };

  if (type === 'survey-l5') {
    vars.surveyUrl = `${SITE_URL}/survey/final?email=jane.smith%40school.edu`;
  }

  return vars;
};

/**
 * Render any HTML string with sample preview data for a given type
 * Used by the preview route for both default and custom templates
 */
const renderPreviewHtml = (type, html) => {
  return renderTemplate(html, getSampleVars(type));
};

/**
 * Get rendered HTML preview for a specific email type (no sending)
 * Used by the preview endpoint - renders with sample data
 */
const getEmailPreview = (type) => {
  const defaults = getDefaultTemplates();
  const template = defaults[type];
  if (!template) return null;

  const sampleVars = getSampleVars(type);

  return {
    subject: renderTemplate(template.subject, sampleVars),
    html: renderTemplate(template.html, sampleVars),
    from: template.from
  };
};

module.exports = {
  sendMidPilotSurveyEmail,
  sendFinalPilotSurveyEmail,
  sendApplicationNotificationEmail,
  sendDripWelcomeEmail,
  sendDripFollowup1Email,
  sendDripFollowup2Email,
  getEmailPreview,
  getDefaultTemplates,
  renderTemplate,
  renderPreviewHtml
};
