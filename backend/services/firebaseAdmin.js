/**
 * Firebase Admin SDK initialization
 * Used for backend operations like approve/decline from email links
 */

const admin = require('firebase-admin');

let initialized = false;

const initFirebase = () => {
  if (initialized) return;

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!serviceAccount) {
    console.warn('[FirebaseAdmin] FIREBASE_SERVICE_ACCOUNT not set, Firebase Admin disabled');
    return;
  }

  try {
    // Railway may convert \n escape sequences in env vars to actual newlines,
    // which breaks JSON.parse (newlines inside JSON strings are invalid).
    // Fix by replacing actual newlines back to \n escape sequences before parsing.
    const fixed = serviceAccount.replace(/\n/g, '\\n');
    const parsed = JSON.parse(fixed);
    // Restore actual newlines in the private key (PEM format needs them)
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    admin.initializeApp({
      credential: admin.credential.cert(parsed),
      databaseURL: databaseURL || `https://${parsed.project_id}-default-rtdb.firebaseio.com`
    });
    initialized = true;
    console.log('[FirebaseAdmin] Initialized successfully');
  } catch (err) {
    console.error('[FirebaseAdmin] Failed to initialize:', err.message);
  }
};

const getDatabase = () => {
  if (!initialized) initFirebase();
  if (!initialized) return null;
  return admin.database();
};

module.exports = { initFirebase, getDatabase };
