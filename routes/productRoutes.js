const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  calculatePrice,
  getDashboardStats,
  addProduct,
  updateProduct,
  updateStock,
  updateDiscount,
  deactivateProduct
} = require('../controllers/productController');

// ==========================================
// PUBLIC ROUTES
// ==========================================

// @route   GET /api/products
// @desc    Get all active products (Supports search & filtering)
router.get('/', getProducts);

// @route   POST /api/products/calculate
// @desc    Validate quantity and calculate final discounted price
router.post('/calculate', calculatePrice);


// ==========================================
// ADMIN ROUTES
// ==========================================

// @route   GET /api/products/admin/dashboard
// @desc    Get dashboard statistics for the admin panel
router.get('/admin/dashboard', getDashboardStats);

// @route   POST /api/products/admin/products
// @desc    Create a new product using an image URL string
router.post('/admin/products', addProduct);

// @route   PUT /api/products/admin/products/:id
// @desc    Update all details of a specific product
router.put('/admin/products/:id', updateProduct);

// @route   PATCH /api/products/admin/products/:id/stock
// @desc    Quickly update available stock from the admin table
router.patch('/admin/products/:id/stock', updateStock);

// @route   PATCH /api/products/admin/products/:id/discount
// @desc    Quickly update discount percentage from the admin table
router.patch('/admin/products/:id/discount', updateDiscount);

// @route   PATCH /api/products/admin/products/:id/deactivate
// @desc    Toggle product active/inactive status
router.patch('/admin/products/:id/deactivate', deactivateProduct);


// ==========================================
// DYNAMIC PUBLIC ROUTE (MUST BE AT THE BOTTOM)
// ==========================================

// @route   GET /api/products/:id
// @desc    Get a single product's details
// Note: Kept at the bottom so it doesn't accidentally intercept '/calculate' or '/admin/...'
router.get('/:id', getProductById);

module.exports = router;