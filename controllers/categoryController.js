// controllers/categoryController.js
const { db, admin } = require('../config/firebase');

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const snapshot = await db.collection('categories').get();
    let categories = [];
    
    snapshot.forEach(doc => {
      categories.push({ _id: doc.id, id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new category (Admin)
// @route   POST /api/categories/admin/categories
const addCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Category name is required');
    }

    // Check if category already exists to prevent duplicates
    const existing = await db.collection('categories').where('name', '==', name).get();
    if (!existing.empty) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const newCategory = {
      name,
      description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('categories').add(newCategory);
    res.status(201).json({ 
      success: true, 
      data: { _id: docRef.id, id: docRef.id, ...newCategory } 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, addCategory };