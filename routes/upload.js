const express = require('express');
const multer = require('multer');
const path = require('path');
const protect = require('../middleware/authMiddleware');
const Video = require('../models/Video');

const router = express.Router();

// Get backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'https://farfarapop-backend-1.onrender.com';

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

// ✅ Test route (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Upload routes working!' });
});

// ✅ Simple upload route (saves to database)
router.post('/video', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('Uploaded file:', req.file);

  const fileUrl = `${BACKEND_URL}/uploads/${req.file.filename}`;

  try {
    // Save to database
    const video = await Video.create({
      title: req.body.title || 'Untitled Video',
      artist: req.body.artist || 'Unknown Artist',
      url: fileUrl,
      likes: 0,
      views: 0,
      comments: []
    });

    console.log('Video saved to database:', video);

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        url: fileUrl,
        filename: req.file.originalname,
        title: video.title,
        artist: video.artist
      },
    });
  } catch (error) {
    console.error('Error saving video:', error);
    res.status(500).json({ error: 'Failed to save video' });
  }
});

// ✅ Protected upload route (for when auth is working)
router.post('/video-protected', protect, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('Uploaded file:', req.file);

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    message: 'Video uploaded successfully',
    video: {
      url: fileUrl,
      filename: req.file.originalname,
    },
  });
});

module.exports = router;
