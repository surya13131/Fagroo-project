const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const app = initializeApp({
  credential: cert(serviceAccount),
  // storageBucket is no longer needed!
});

const db = getFirestore(app);
const auth = getAuth(app);

module.exports = {
  db,
  auth,
};