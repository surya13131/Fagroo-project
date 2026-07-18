const { auth, db } = require('../config/firebase');

// @desc    Set user login time as a custom claim after they sign in
// @route   POST /api/auth/session-login
// @access  Protected (Logged-in users)
const sessionLogin = async (req, res, next) => {
  try {
    const uid = req.user.uid; // From verifyToken middleware

    // Set the login time as a custom claim on the user's token
    const loginTime = Date.now();
    await auth.setCustomUserClaims(uid, { loginTime });

    // For the 24-hour check, we also need to store it in Firestore
    // This is because custom claims only refresh when the ID token is refreshed (typically hourly)
    await db.collection('users').doc(uid).set(
      {
        loginTime: loginTime,
      },
      { merge: true }
    );

    res.status(200).json({ success: true, message: 'Session initialized.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sessionLogin };