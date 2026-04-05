const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage for hashing before saving
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images Only! Allowed types: jpeg, jpg, png, webp'));
    }
  }
});

// @route   POST /api/upload
// @desc    Upload an image and get URL (DEDUPED)
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Calculate SHA-256 hash of the file content for deduplication
    const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${hash}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const imageUrl = `/uploads/${filename}`;

    // Check if the exact same image content already exists as a file
    if (fs.existsSync(filePath)) {
      return res.status(200).json({
        message: 'Image already exists, re-using existing file',
        imageUrl
      });
    }

    // Write buffer to disk since it's a new unique file
    fs.writeFileSync(filePath, req.file.buffer);

    // Return relative URL to the uploaded file
    res.status(200).json({
      message: 'New image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server upload error', error: error.message });
  }
});

module.exports = router;
