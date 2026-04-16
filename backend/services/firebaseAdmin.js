/**
 * Firebase Admin SDK initialization
 * Used for backend operations like approve/decline from email links
 *
 * Uses 3 separate env vars (recommended for Railway/Heroku):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY  (paste the key as-is, Railway handles newlines)
 *   FIREBASE_DATABASE_URL  (optional)
 */

const admin = require('firebase-admin');

let initialized = false;

const initFirebase = () => {
  if (initialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[FirebaseAdmin] Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY');
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        project_id: projectId,
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n')
      }),
      databaseURL: databaseURL || `https://${projectId}-default-rtdb.firebaseio.com`
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

const getAuth = () => {
  if (!initialized) initFirebase();
  if (!initialized) return null;
  return admin.auth();
};

module.exports = { initFirebase, getDatabase, getAuth };
