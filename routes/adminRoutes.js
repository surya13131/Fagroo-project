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

router.use(verifyToken, isAdmin);

router.get('/dashboard', getDashboardStats);

router.get('/products', getAllProducts);

router.post('/products', addProduct);

router.put('/products/:id', updateProduct);


router.patch('/products/:id/stock', updateStock);


router.patch('/products/:id/discount', updateDiscount);


router.patch('/products/:id/activate', activateProduct);

router.patch('/products/:id/deactivate', deactivateProduct);

router.delete('/products/:id', deleteProduct);

module.exports = router;