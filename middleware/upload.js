const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fabric-inventory",

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],

    public_id: (req, file) => {
      return `${Date.now()}-${file.originalname.split(".")[0]}`;
    },
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;