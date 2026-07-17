const express = require('express');
const router = express.Router();
const { addProduct } = require('../controllers/productController');
const { 
  updateProduct, 
  updateStock, 
  updateDiscount, 
  deactivateProduct,
  getDashboardStats 
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protect all routes in this file: User must be logged in AND have admin role
router.use(verifyToken, isAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get Admin Dashboard Stats
router.get('/dashboard', getDashboardStats);

// @route   POST /api/admin/products
// @desc    Add a new product (Requires form-data with an 'image' file)
router.post('/products', upload.single('image'), addProduct);

// @route   PUT /api/admin/products/:id
// @desc    Update general product details (name, category, seller, etc.)
router.put('/products/:id', updateProduct);

// @route   PATCH /api/admin/products/:id/stock
// @desc    Update only the available stock quantity
router.patch('/products/:id/stock', updateStock);

// @route   PATCH /api/admin/products/:id/discount
// @desc    Update only the discount percentage
router.patch('/products/:id/discount', updateDiscount);

// @route   PATCH /api/admin/products/:id/deactivate
// @desc    Soft delete a product by setting active to false
router.patch('/products/:id/deactivate', deactivateProduct);

module.exports = router;