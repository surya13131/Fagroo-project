const express = require('express');
const router = express.Router();

const { 
  getProducts, 
  getProductById, 
  calculatePrice
} = require('../controllers/productController');
router.get('/', getProducts);
router.post('/calculate', calculatePrice);
router.get('/:id', getProductById); 

module.exports = router;