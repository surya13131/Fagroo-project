const { db, admin } = require('../config/firebase');

// @desc    Edit a product (General details)
// @route   PUT /api/admin/products/:id
// @access  Private (Admin Only)
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, seller, location, price, minimumQty } = req.body;
    
    const productRef = db.collection('products').doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Strict field selection to prevent injection of unwanted fields
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (seller) updateData.seller = seller;
    if (location) updateData.location = location;
    if (price) updateData.price = Number(price);
    if (minimumQty) updateData.minimumQty = Number(minimumQty);

    await productRef.update(updateData);
    res.status(200).json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update available stock
// @route   PATCH /api/admin/products/:id/stock
// @access  Private (Admin Only)
const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availableQty } = req.body;

    if (availableQty === undefined || availableQty < 0) {
      res.status(400);
      throw new Error('Valid stock quantity is required');
    }

    const productRef = db.collection('products').doc(id);
    
    // Check if product exists before updating
    const doc = await productRef.get();
    if (!doc.exists) {
      res.status(404);
      throw new Error('Product not found');
    }

    await productRef.update({ 
      availableQty: Number(availableQty),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Configure discount percentage
// @route   PATCH /api/admin/products/:id/discount
// @access  Private (Admin Only)
const updateDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { discount } = req.body;

    if (discount === undefined || discount < 0 || discount > 100) {
      res.status(400);
      throw new Error('Valid discount percentage (0-100) is required');
    }

    const productRef = db.collection('products').doc(id);
    
    // Check if product exists before updating
    const doc = await productRef.get();
    if (!doc.exists) {
      res.status(404);
      throw new Error('Product not found');
    }

    await productRef.update({ 
      discount: Number(discount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ success: true, message: 'Discount configured successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate (Soft Delete) a product
// @route   PATCH /api/admin/products/:id/deactivate
// @access  Private (Admin Only)
const deactivateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productRef = db.collection('products').doc(id);
    
    // Check if product exists before updating
    const doc = await productRef.get();
    if (!doc.exists) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Soft delete by setting active to false
    await productRef.update({ 
      active: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ success: true, message: 'Product deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin Only)
const getDashboardStats = async (req, res, next) => {
  try {
    // Firestore count() is highly optimized and doesn't read all documents
    const totalProducts = await db.collection('products').count().get();
    const activeProducts = await db.collection('products').where('active', '==', true).count().get();
    const totalEnquiries = await db.collection('enquiries').count().get();
    
    res.status(200).json({
      success: true,
      data: {
        products: totalProducts.data().count,
        activeProducts: activeProducts.data().count,
        enquiries: totalEnquiries.data().count
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProduct, updateStock, updateDiscount, deactivateProduct, getDashboardStats };