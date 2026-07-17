const { db, admin } = require('../config/firebase');

// @desc    Add a product (Admin)
const addProduct = async (req, res, next) => {
  try {
    const { name, description, category, seller, location, price, discount, availableQty, minimumQty, image } = req.body;

    // Point 2: Comprehensive validation
    if (!name || !category || !price || !seller || !location || availableQty === undefined || minimumQty === undefined) {
      res.status(400);
      throw new Error('All required fields must be provided.');
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

    // Point 7: Image URL validation
    if (image && !image.startsWith("http")) {
      res.status(400);
      throw new Error("Invalid Image URL");
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
      image: image || '',
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
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, seller, location, price, discount, availableQty, minimumQty, image } = req.body;

    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();
    
    // Point 3: Explicit existence check before updating
    if (!doc.exists) {
      res.status(404);
      throw new Error("Product not found");
    }

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

    await docRef.update(updatedProduct);
    res.status(200).json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Product Stock
const updateStock = async (req, res, next) => {
  try {
    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error("Product not found");
    }

    const { availableQty } = req.body;
    await docRef.update({ 
      availableQty: Number(availableQty),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(200).json({ success: true, message: 'Stock updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Product Discount
const updateDiscount = async (req, res, next) => {
  try {
    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error("Product not found");
    }

    const { discount } = req.body;
    await docRef.update({ 
      discount: Number(discount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(200).json({ success: true, message: 'Discount updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Product Deactivation
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

// @desc    Get Admin Dashboard Stats
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
    
    // Point 4: Matches frontend keys perfectly
    res.status(200).json({ 
      success: true,
      data: { products: total, activeProducts: active, enquiries } 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addProduct, updateProduct, updateStock, updateDiscount, deactivateProduct, getDashboardStats };