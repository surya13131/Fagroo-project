const { db, admin } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// @desc    Submit a new buyer enquiry
// @route   POST /api/enquiries
// @access  Protected (Logged-in users)
const createEnquiry = async (req, res, next) => {
  try {
    const { buyerName, mobile, email, deliveryLocation, requiredQuantity, message, productId } = req.body;
    const userId = req.user.uid; // Retrieved from the verifyToken middleware

    // Validate fields
    if (!buyerName || !mobile || !email || !deliveryLocation || !requiredQuantity || !productId) {
      res.status(400);
      throw new Error('Please provide all required fields.');
    }

    // 1. Verify the product exists and double-check stock limits on the backend
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      res.status(404);
      throw new Error('Product not found.');
    }

    const product = productDoc.data();
    const qty = Number(requiredQuantity);

    if (qty < product.minimumQty) {
      res.status(400);
      throw new Error(`Order quantity cannot be less than the minimum of ${product.minimumQty}.`);
    }
    if (qty > product.availableQty) {
      res.status(400);
      throw new Error(`Requested quantity exceeds available stock (${product.availableQty}).`);
    }

    // 2. Generate a clean, structured unique reference number (e.g., ENQ-20260717-XXXX)
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uniqueShortId = uuidv4().split('-')[0].toUpperCase();
    const referenceNumber = `ENQ-${today}-${uniqueShortId}`;

    // 3. Construct the enquiry object
    const newEnquiry = {
      referenceNumber,
      userId,
      buyerName,
      mobile,
      email,
      deliveryLocation,
      requiredQty: qty,
      message: message || '',
      productId,
      productName: product.name,
      status: 'Pending', // Default status
      createdAt: admin.firestore.FieldValue.serverTimestamp() // Updated to server timestamp
    };

    // 4. Save to Firestore
    const docRef = await db.collection('enquiries').add(newEnquiry);

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully!',
      data: { id: docRef.id, ...newEnquiry }
    });
  } catch (error) {
    next(error); // Passes error to the global errorHandler
  }
};

// @desc    Get all buyer enquiries (Admin feature)
// @route   GET /api/enquiries/admin
// @access  Private (Admin Only)
const getAdminEnquiries = async (req, res, next) => {
  try {
    const enquiriesRef = db.collection('enquiries');
    const snapshot = await enquiriesRef.orderBy('createdAt', 'desc').get();

    const enquiries = [];
    snapshot.forEach(doc => {
      enquiries.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    next(error); // Passes error to the global errorHandler
  }
};

module.exports = { createEnquiry, getAdminEnquiries };