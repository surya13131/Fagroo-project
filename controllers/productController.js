const { db, admin } = require('../config/firebase');
const { uploadImageToFirebase } = require('../services/storageService');

// Internal Helper: Calculate discount directly in the controller
const calculateDiscount = (price, discount, qty) => {
  const discountedPrice = price - (price * discount) / 100;

  return {
    originalPrice: price,
    discountPercentage: discount,
    discountedPrice,
    requestedQuantity: qty,
    totalOrderValue: discountedPrice * qty,
  };
};

// @desc    Get all products (with Search & Filter)
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { search, category, seller, location } = req.query;
    let productsRef = db.collection('products').where('active', '==', true);

    // Apply exact match filters
    if (category) productsRef = productsRef.where('category', '==', category);
    if (seller) productsRef = productsRef.where('seller', '==', seller);
    if (location) productsRef = productsRef.where('location', '==', location);

    const snapshot = await productsRef.get();
    let products = [];
    
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    // Apply text search on the backend (since Firestore native text search is limited)
    if (search) {
      const lowerSearch = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.category.toLowerCase().includes(lowerSearch)
      );
    }

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const doc = await db.collection('products').doc(req.params.id).get();
    
    // Check if it exists AND if it is active (soft delete check)
    if (!doc.exists || doc.data().active === false) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a product (Admin)
// @route   POST /api/admin/products
const addProduct = async (req, res, next) => {
  try {
    // 1. Strict Destructuring
    const { name, category, seller, location, price, discount, availableQty, minimumQty } = req.body;

    // 2. Strict Validation
    if (!name || !category || !price) {
      res.status(400);
      throw new Error('Name, category, and price are required.');
    }
    if (Number(price) <= 0) {
      res.status(400);
      throw new Error('Price must be greater than 0');
    }
    if (Number(discount) < 0 || Number(discount) > 100) {
      res.status(400);
      throw new Error('Discount must be between 0 and 100');
    }
    if (Number(minimumQty) < 1) {
      res.status(400);
      throw new Error('Minimum quantity must be at least 1');
    }
    if (Number(availableQty) < Number(minimumQty)) {
      res.status(400);
      throw new Error('Available quantity cannot be less than minimum quantity');
    }

    // 3. Image Upload via Firebase Storage
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImageToFirebase(req.file);
    }

    // 4. Create Object with Server Timestamp
    const newProduct = {
      name,
      category,
      seller,
      location,
      price: Number(price),
      discount: Number(discount || 0),
      availableQty: Number(availableQty),
      minimumQty: Number(minimumQty),
      image: imageUrl,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('products').add(newProduct);
    res.status(201).json({ success: true, data: { id: docRef.id, ...newProduct } });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate backend discount logic
// @route   POST /api/products/calculate
const calculatePrice = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const reqQty = Number(quantity);

    const doc = await db.collection('products').doc(productId).get();
    
    // Ensure product exists and is active before calculating price
    if (!doc.exists || doc.data().active === false) {
      res.status(404);
      throw new Error('Product not found');
    }

    const product = doc.data();

    // Validate quantities strictly on the backend
    if (reqQty < product.minimumQty) {
      res.status(400);
      throw new Error(`Minimum order is ${product.minimumQty}`);
    }
    if (reqQty > product.availableQty) {
      res.status(400);
      throw new Error(`Only ${product.availableQty} available in stock`);
    }

    // Call the internal helper function
    const result = calculateDiscount(product.price, product.discount, reqQty);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, addProduct, calculatePrice };