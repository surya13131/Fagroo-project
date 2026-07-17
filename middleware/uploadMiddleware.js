const multer = require('multer');

// 1. Use memory storage (Required for Firebase Storage uploads)
const storage = multer.memoryStorage();

// 2. Strict validation: Only accept image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload an image file.'), false);
  }
};

// 3. Initialize Multer with strict limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit to prevent abuse
  },
});

module.exports = upload;