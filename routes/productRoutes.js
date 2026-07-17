const express = require('express');
const router = express.Router();

const { 
  getProducts, 
  getProductById, 
  calculatePrice
} = require('../controllers/productController');

// ==========================================
// PUBLIC ROUTES
// Base Path: /api/products (as defined in index.js)
// ==========================================

router.get('/', getProducts);
router.post('/calculate', calculatePrice);
router.get('/:id', getProductById); // Kept below specific paths to prevent hijacking

module.exports = router;