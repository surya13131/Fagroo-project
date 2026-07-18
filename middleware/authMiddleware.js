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
    return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Validate the token against Firebase Auth
    const decodedToken = await auth.verifyIdToken(token);

    // 2. Check for 24-hour session expiry
  const SESSION_DURATION = 30 * 1000; // 24 hours in milliseconds
    const loginTime = decodedToken.loginTime;

    if (loginTime && Date.now() - loginTime > SESSION_DURATION) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    // 3. Fallback check using Firestore (covers edge cases where token hasn't been refreshed)
    if (!loginTime) {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (
          userData.loginTime &&
          Date.now() - userData.loginTime > SESSION_DURATION
        ) {
          return res.status(401).json({
            success: false,
            message: 'Session expired. Please log in again.',
          });
        }
      } else {
        // If no user doc, they can't have a valid session.
        return res.status(401).json({ success: false, message: 'User not found.' });
      }
    }

    // 4. Attach user info to the request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role, // Pass role from token if set
    };
    
    next();
  } catch (error) {
    const message = getAuthErrorMessage(error.code);
    return res.status(401).json({ success: false, message, error: error.message });
  }
};

// Middleware to check if the verified user has an 'admin' role in Firestore
const isAdmin = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error checking authorization privileges.' });
  }
};

module.exports = { verifyToken, isAdmin };