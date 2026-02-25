const cloudinary = require("../config/cloudinary");

async function uploadBase64Image(base64, folder, publicId) {
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    public_id: publicId,
    overwrite: true,   // optional
  });

  return result.secure_url;
}

module.exports = {
  uploadBase64Image,
};
