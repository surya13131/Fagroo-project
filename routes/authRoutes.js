const express = require('express');
const router = express.Router();
const { sessionLogin } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   POST /api/auth/session-login
// @desc    Initializes the user's session by setting a custom claim
router.post('/session-login', verifyToken, sessionLogin);

module.exports = router;