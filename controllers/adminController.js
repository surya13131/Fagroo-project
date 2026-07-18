const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

const validateProductPayload = (payload) => {
  const { name, category, price, seller, location, availableQty, minimumQty, discount, image } = payload;

 
  if (!name || !category || !price || !seller || !location || availableQty === undefined || minimumQty === undefined) {
    const error = new Error('All required fields must be provided.');
    error.statusCode = 400;
    throw error;
  }
  if (Number(price) <= 0) {
    const error = new Error('Price must be greater than 0');
    error.statusCode = 400;
    throw error;
  }
  if (Number(discount) < 0 || Number(discount) > 100) {
    const error = new Error('Discount must be between 0 and 100');
    error.statusCode = 400;
    throw error;
  }
  if (Number(minimumQty) < 1) {
    const error = new Error('Minimum quantity must be at least 1');
    error.statusCode = 400;
    throw error;
  }
  if (Number(availableQty) < Number(minimumQty)) {
    const error = new Error('Available quantity cannot be less than minimum quantity');
    error.statusCode = 400;
    throw error;
  }

  if (image) {
    try {
      new URL(image);
    } catch (_) {
      const error = new Error("Invalid Image URL provided.");
      error.statusCode = 400;
      throw error;
    }
  }
};

const addProduct = async (req, res, next) => {
  try {
    
    validateProductPayload(req.body);

    const { name, description, category, seller, location, price, discount, availableQty, minimumQty, image } = req.body;

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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('products').add(newProduct);
    res.status(201).json({ success: true, data: { _id: docRef.id, id: docRef.id, ...newProduct } });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};


const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    validateProductPayload(req.body);

    const { name, description, category, seller, location, price, discount, availableQty, minimumQty, image } = req.body;

    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();
    
   
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
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.update(updatedProduct);
    res.status(200).json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error("Product not found");
    }

    const { availableQty } = req.body;
    const newQty = Number(availableQty);

    if (isNaN(newQty) || newQty < 0) {
      res.status(400);
      throw new Error("Invalid quantity provided. Must be a non-negative number.");
    }

    await docRef.update({ 
      availableQty: newQty,
      updatedAt: FieldValue.serverTimestamp()
    });
    res.status(200).json({ success: true, message: 'Stock updated' });
  } catch (error) {
    next(error);
  }
};


const updateDiscount = async (req, res, next) => {
  try {
    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error("Product not found");
    }

    const { discount } = req.body;
    const newDiscount = Number(discount);

    if (isNaN(newDiscount) || newDiscount < 0 || newDiscount > 100) {
      res.status(400);
      throw new Error("Invalid discount provided. Must be a number between 0 and 100.");
    }

    await docRef.update({ 
      discount: newDiscount,
      updatedAt: FieldValue.serverTimestamp()
    });
    res.status(200).json({ success: true, message: 'Discount updated' });
  } catch (error) {
    next(error);
  }
};


const deactivateProduct = async (req, res, next) => {
  try {
    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404);
      throw new Error("Product not found");
    }

    await docRef.update({
      active: false,
      updatedAt: FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: "Product deactivated",
    });
  } catch (error) {
    next(error);
  }
};

const activateProduct = async (req, res, next) => {
  try {
    const docRef = db.collection("products").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404);
      throw new Error("Product not found");
    }

    await docRef.update({
      active: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      success: true,
      message: "Product activated",
    });
  } catch (error) {
    next(error);
  }
};


const deleteProduct = async (req, res, next) => {
  try {
    const docRef = db.collection("products").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404);
      throw new Error("Product not found");
    }

    await docRef.delete();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


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
    

    res.status(200).json({ 
      success: true,
      data: { products: total, activeProducts: active, enquiries } 
    });
  } catch (error) {
    next(error);
  }
};


const getAllProducts = async (req, res, next) => {
  try {
    const snapshot = await db.collection("products").get();

    const products = [];

    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        _id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  updateProduct,
  updateStock,
  updateDiscount,
  activateProduct,
  deactivateProduct,
  deleteProduct,
  getDashboardStats,
  getAllProducts,
};