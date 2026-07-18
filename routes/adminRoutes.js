const express = require('express');
const router = express.Router();

const {
  addProduct,
  updateProduct,
  updateStock,
  updateDiscount,
  activateProduct,
  deactivateProduct,
  deleteProduct,
  getDashboardStats,
  getAllProducts,
} = require('../controllers/adminController');

const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(verifyToken, isAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Get all products
router.get('/products', getAllProducts);

// Add a new product
// Frontend sends an image URL in req.body.image
router.post('/products', addProduct);

// Update a product
router.put('/products/:id', updateProduct);

// Update stock
router.patch('/products/:id/stock', updateStock);

// Update discount
router.patch('/products/:id/discount', updateDiscount);

// Activate product
router.patch('/products/:id/activate', activateProduct);

// Deactivate product
router.patch('/products/:id/deactivate', deactivateProduct);

// Delete product
router.delete('/products/:id', deleteProduct);

module.exports = router;