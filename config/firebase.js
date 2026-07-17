const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require("./serviceAccountKey.json");

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "fagrro.firebasestorage.app", // verify this bucket name in Firebase Console
});

const db = getFirestore(app);
const auth = getAuth(app);
const bucket = getStorage(app).bucket();

module.exports = {
  app,
  db,
  auth,
  bucket,
};