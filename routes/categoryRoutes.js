// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { getCategories, addCategory } = require('../controllers/categoryController');

// ==========================================
// PUBLIC ROUTES
// Base Path: /api/categories
// ==========================================

// Anyone can view categories (needed for the frontend product filter/dropdown)
router.get('/', getCategories);

// ==========================================
// ADMIN ROUTES
// Base Path: /api/categories/admin/*
// ==========================================

// Only admins can create new categories
router.post('/admin/categories', verifyToken, isAdmin, addCategory);

module.exports = router;