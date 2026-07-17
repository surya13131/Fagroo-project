const express = require('express');
const router = express.Router();
const { createEnquiry, getAdminEnquiries } = require('../controllers/enquiryController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Post an enquiry - Requires the user to be logged in
router.post('/', verifyToken, createEnquiry);

// View all enquiries - Requires user to be logged in AND have an admin role
router.get('/admin', verifyToken, isAdmin, getAdminEnquiries);

module.exports = router;