const cloudinary = require("../config/cloudinary");
const path = require("path");
const fs = require("fs");

const isSkipUpload = () =>
  (process.env.SKIP_UPLOAD || "").trim().toLowerCase() === "true";

// Save base64 image to local /public/uploads folder and return a localhost URL
function saveLocally(base64, folder, publicId) {
  const dir = path.join(__dirname, "../public/uploads", folder);
  fs.mkdirSync(dir, { recursive: true });

  // Strip data:image/...;base64, prefix
  const data = base64.includes(",") ? base64.split(",")[1] : base64;
  const ext = base64.startsWith("data:image/png") ? "png" : "jpg";
  const fileName = `${publicId}.${ext}`;
  const filePath = path.join(dir, fileName);

  fs.writeFileSync(filePath, Buffer.from(data, "base64"));

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/uploads/${folder}/${fileName}`;
}

async function uploadBase64Image(base64, folder, publicId) {
  // In dev mode, save locally instead of uploading to Cloudinary
  if (isSkipUpload()) {
    console.log(`📁 [DEV] Saving image locally: ${folder}/${publicId}`);
    return saveLocally(base64, folder, publicId);
  }

  const result = await cloudinary.uploader.upload(base64, {
    folder,
    public_id: publicId,
    overwrite: true,
  });

  return result.secure_url;
}

module.exports = {
  uploadBase64Image,
};
