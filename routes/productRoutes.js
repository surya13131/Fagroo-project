const express = require('express');
const router = express.Router();
const { getProducts, getProductById, calculatePrice } = require('../controllers/productController');

// @route   GET /api/products
// @desc    Get all active products (Supports search & filtering)
router.get('/', getProducts);

// @route   POST /api/products/calculate
// @desc    Validate quantity and calculate final discounted price
router.post('/calculate', calculatePrice);

// @route   GET /api/products/:id
// @desc    Get a single product's details
router.get('/:id', getProductById);

module.exports = router;