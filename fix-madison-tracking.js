/**
 * One-time script: Mark drip-2 as sent for 23mstone@gmail.com
 *
 * Run from the repo root:
 *   node fix-madison-tracking.js
 *
 * Requires the backend .env with FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,
 * FIREBASE_PRIVATE_KEY (and optionally FIREBASE_DATABASE_URL).
 */

// Load env vars from backend/.env
require('./backend/node_modules/dotenv').config({ path: __dirname + '/backend/.env' });

const admin = require('./backend/node_modules/firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const databaseURL = process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in backend/.env');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey.replace(/\\n/g, '\n')
  }),
  databaseURL
});

const db = admin.database();

// Firebase key format: dots replaced with commas
const emailKey = '23mstone@gmail,com';

async function main() {
  const data = {
    sentAt: Date.now(),
    subject: 'Just checking in - have you had a chance to log in?',
    type: 'drip-2'
  };

  console.log(`Writing to emailsSent/${emailKey}/drip-2 ...`);
  await db.ref(`emailsSent/${emailKey}/drip-2`).set(data);
  console.log('Done:', data);

  // Verify
  const snapshot = await db.ref(`emailsSent/${emailKey}/drip-2`).once('value');
  console.log('Verified:', snapshot.val());

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
