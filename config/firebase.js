const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "fagrro.firebasestorage.app",
});

const db = getFirestore(app);
const auth = getAuth(app);
const bucket = getStorage(app).bucket();

module.exports = {
  db,
  auth,
  bucket,
};