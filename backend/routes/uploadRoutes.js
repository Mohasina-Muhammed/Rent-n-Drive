const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Cloudinary storage — images go directly to your Cloudinary account
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rent-n-drive/vehicles',      // Organises uploads in a folder
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
    // Use a unique public_id so duplicates are handled by Cloudinary
    public_id: (req, file) => {
      const name = path.parse(file.originalname).name.replace(/\s+/g, '-');
      return `${Date.now()}-${name}`;
    },
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Images only! Allowed: jpeg, jpg, png, webp'));
    }
  },
});

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary and return the secure URL
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary returns the hosted URL in req.file.path
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,   // Full Cloudinary HTTPS URL
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload error', error: error.message });
  }
});

module.exports = router;
