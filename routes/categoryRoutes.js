const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { getCategories, addCategory } = require('../controllers/categoryController');
router.get('/', getCategories);

router.post('/admin/categories', verifyToken, isAdmin, addCategory);

module.exports = router;