const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadVideo } = require('../controllers/uploadController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// ✅ Multer config
const upload = multer({
  storage,
  limits: { fileSize: Number.MAX_SAFE_INTEGER }, // practically unlimited
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4') cb(null, true);
    else cb(new Error('Only .mp4 files are allowed'));
  },
});

// ✅ Upload route (protected)
router.post('/video', protect, upload.single('video'), uploadVideo);

module.exports = router;
