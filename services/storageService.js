const { bucket } = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");

const uploadImageToFirebase = async (file) => {
  if (!file) return null;

  const fileName = `products/${uuidv4()}_${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on("error", reject);

    stream.on("finish", async () => {
      await fileUpload.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      resolve(publicUrl);
    });

    stream.end(file.buffer);
  });
};

module.exports = { uploadImageToFirebase };