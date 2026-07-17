const { db, admin } = require('../config/firebase');

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
      // Adding _id to maintain compatibility with MERN frontend patterns
      products.push({ _id: doc.id, id: doc.id, ...doc.data() });
    });

    // Apply text search on the backend
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
    
    if (!doc.exists || doc.data().active === false) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    res.status(200).json({ success: true, data: { _id: doc.id, id: doc.id, ...doc.data() } });
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
    
    if (!doc.exists || doc.data().active === false) {
      res.status(404);
      throw new Error('Product not found');
    }

    const product = doc.data();

    if (reqQty < product.minimumQty) {
      res.status(400);
      throw new Error(`Minimum order is ${product.minimumQty}`);
    }
    if (reqQty > product.availableQty) {
      res.status(400);
      throw new Error(`Only ${product.availableQty} available in stock`);
    }

    const result = calculateDiscount(product.price, product.discount, reqQty);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN DASHBOARD CONTROLLERS
// ==========================================

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    let total = 0;
    let active = 0;
    
    productsSnapshot.forEach(doc => {
      total++;
      if (doc.data().active !== false) active++;
    });

    const enquiriesSnapshot = await db.collection('enquiries').get();
    const enquiries = enquiriesSnapshot.size;

    res.status(200).json({ success: true, data: { total, active, enquiries } });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a product (Admin)
// @route   POST /api/admin/products
const addProduct = async (req, res, next) => {
  try {
    const { name, description, category, seller, location, price, discount, availableQty, minimumQty, image } = req.body;

    if (!name || !category || !price) {
      res.status(400);
      throw new Error('Name, category, and price are required.');
    }

    const newProduct = {
      name,
      description: description || '',
      category,
      seller,
      location,
      price: Number(price),
      discount: Number(discount || 0),
      availableQty: Number(availableQty),
      minimumQty: Number(minimumQty),
      image: image || '', // Direct URL string assignment
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('products').add(newProduct);
    res.status(201).json({ success: true, data: { _id: docRef.id, id: docRef.id, ...newProduct } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update entire product (Admin)
// @route   PUT /api/admin/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, seller, location, price, discount, availableQty, minimumQty, image } = req.body;

    const updatedProduct = {
      name,
      description: description || '',
      category,
      seller,
      location,
      price: Number(price),
      discount: Number(discount || 0),
      availableQty: Number(availableQty),
      minimumQty: Number(minimumQty),
      image: image || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('products').doc(id).update(updatedProduct);
    res.status(200).json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Product Stock
// @route   PATCH /api/admin/products/:id/stock
const updateStock = async (req, res, next) => {
  try {
    const { availableQty } = req.body;
    await db.collection('products').doc(req.params.id).update({ 
      availableQty: Number(availableQty),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(200).json({ success: true, message: 'Stock updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Product Discount
// @route   PATCH /api/admin/products/:id/discount
const updateDiscount = async (req, res, next) => {
  try {
    const { discount } = req.body;
    await db.collection('products').doc(req.params.id).update({ 
      discount: Number(discount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(200).json({ success: true, message: 'Discount updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Product Deactivation
// @route   PATCH /api/admin/products/:id/deactivate
const deactivateProduct = async (req, res, next) => {
  try {
    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Product not found');
    }

    const currentStatus = doc.data().active;
    await docRef.update({ 
      active: !currentStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    });
    
    res.status(200).json({ success: true, message: `Product ${!currentStatus ? 'activated' : 'deactivated'}` });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getProducts, 
  getProductById, 
  calculatePrice,
  getDashboardStats,
  addProduct,
  updateProduct,
  updateStock,
  updateDiscount,
  deactivateProduct
};