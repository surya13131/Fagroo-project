const { auth, db } = require('../config/firebase');

// Helper to generate more user-friendly error messages from Firebase Auth errors
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/id-token-expired':
      return 'Your session has expired. Please log in again.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    default:
      return 'Unauthorized. Invalid token.';
  }
};

// Middleware to verify if a user is logged in via Firebase
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    const message = getAuthErrorMessage(error.code);

    return res.status(401).json({
      success: false,
      message,
      error: error.message,
    });
  }
};

// Middleware to check if the verified user has an 'admin' role
const isAdmin = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin access required.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking authorization privileges.',
    });
  }
};

module.exports = { verifyToken, isAdmin };