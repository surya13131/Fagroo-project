const express = require('express');
const router = express.Router();
const { createEnquiry, getAdminEnquiries } = require('../controllers/enquiryController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
router.post('/', verifyToken, createEnquiry);
router.get('/admin', verifyToken, isAdmin, getAdminEnquiries);

module.exports = router;