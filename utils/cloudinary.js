const cloudinary = require("../config/cloudinary");

const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    const parts = imageUrl.split("/");
    const fileName = parts[parts.length - 1];

    const publicId =
      "fabric-inventory/" +
      fileName.substring(0, fileName.lastIndexOf("."));

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Cloudinary Delete Error:", error.message);
  }
};

module.exports = {
  deleteImage,
};