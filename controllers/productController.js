const { db, admin } = require('../config/firebase');


const calculateDiscount = (price, discount, qty) => {
  const discountedPrice = price - (price * discount) / 100;

  return {
    basePrice: price,
    discountApplied: discount,
    discountedPricePerUnit: discountedPrice,
    totalOrderValue: discountedPrice * qty,
  };
};


const getProducts = async (req, res, next) => {
  try {
    const { search, category, seller, location } = req.query;
    let productsRef = db.collection('products').where('active', '==', true);

    if (category) productsRef = productsRef.where('category', '==', category);
    if (seller) productsRef = productsRef.where('seller', '==', seller);
    if (location) productsRef = productsRef.where('location', '==', location);

    const snapshot = await productsRef.get();
    let products = [];
    
    snapshot.forEach(doc => {
      products.push({ _id: doc.id, id: doc.id, ...doc.data() });
    });

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

module.exports = { 
  getProducts, getProductById, calculatePrice
};