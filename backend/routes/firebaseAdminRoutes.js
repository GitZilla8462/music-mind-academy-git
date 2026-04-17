const express = require('express');
const router = express.Router();
const { getAuth } = require('../services/firebaseAdmin');

const ADMIN_EMAILS = ['robtaube90@gmail.com', 'robtaube92@gmail.com'];
const SITE_URL = process.env.SITE_URL || 'https://musicmindacademy.com';

/**
 * Middleware: verify Firebase ID token and check admin email
 */
const requireFirebaseAdmin = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const idToken = authHeader.replace('Bearer ', '');
  const auth = getAuth();
  if (!auth) {
    return res.status(500).json({ error: 'Firebase Admin not initialized' });
  }

  try {
    const decoded = await auth.verifyIdToken(idToken);
    if (!ADMIN_EMAILS.includes(decoded.email?.toLowerCase())) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * POST /api/firebase-admin/generate-reset-link
 * Body: { email: "teacher@school.edu" }
 * Returns: { link: "https://..." }
 * For the "Get Reset Link" button (copy/paste manually)
 */
router.post('/generate-reset-link', requireFirebaseAdmin, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const auth = getAuth();
  try {
    const firebaseLink = await auth.generatePasswordResetLink(email.toLowerCase().trim());
    const url = new URL(firebaseLink);
    const oobCode = url.searchParams.get('oobCode');
    const origin = req.headers.origin || SITE_URL;
    const link = `${origin}/reset-password?oobCode=${oobCode}`;
    res.json({ link });
  } catch (err) {
    console.error('[FirebaseAdmin] Generate reset link failed:', err.message);
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'No account found with that email' });
    }
    res.status(500).json({ error: 'Failed to generate reset link' });
  }
});

/**
 * POST /api/firebase-admin/send-reset-link
 * Body: { email: "teacher@school.edu", name: "Ivy Cole" }
 * Generates a reset link, emails it to the teacher, CCs admin.
 */
router.post('/send-reset-link', requireFirebaseAdmin, async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const auth = getAuth();
  try {
    const firebaseLink = await auth.generatePasswordResetLink(email.toLowerCase().trim());
    const url = new URL(firebaseLink);
    const oobCode = url.searchParams.get('oobCode');
    const resetLink = `${SITE_URL}/reset-password?oobCode=${oobCode}`;

    const { sendPasswordResetLinkToTeacher } = require('../services/teacherEmailService');
    await sendPasswordResetLinkToTeacher(email, name, resetLink);

    res.json({ success: true });
  } catch (err) {
    console.error('[FirebaseAdmin] Send reset link failed:', err.message);
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'No account found with that email' });
    }
    res.status(500).json({ error: 'Failed to send reset link' });
  }
});

module.exports = router;
