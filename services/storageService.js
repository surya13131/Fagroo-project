const { admin } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

const uploadImageToFirebase = async (file) => {
  if (!file) return null;

  const bucket = admin.storage().bucket();
  // Create a unique filename to prevent overwrites
  const fileName = `products/${uuidv4()}_${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  // Set file metadata
  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      reject(error);
    });

    stream.on('finish', async () => {
      // Make the file publicly accessible
      await fileUpload.makePublic();
      
      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      resolve(publicUrl);
    });

    // End the stream with the file buffer (provided by Multer memory storage)
    stream.end(file.buffer);
  });
};

module.exports = { uploadImageToFirebase };