const express = require('express');
const router = express.Router();
const { getAuth } = require('../services/firebaseAdmin');

const ADMIN_EMAILS = ['robtaube90@gmail.com', 'robtaube92@gmail.com'];

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
 */
router.post('/generate-reset-link', requireFirebaseAdmin, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const auth = getAuth();
  try {
    const link = await auth.generatePasswordResetLink(email.toLowerCase().trim());
    res.json({ link });
  } catch (err) {
    console.error('[FirebaseAdmin] Generate reset link failed:', err.message);
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'No account found with that email' });
    }
    res.status(500).json({ error: 'Failed to generate reset link' });
  }
});

module.exports = router;
