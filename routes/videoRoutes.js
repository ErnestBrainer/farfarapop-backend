const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const protect = require('../middleware/authMiddleware'); // JWT auth
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Accept only video files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only video files allowed'), false);
};

const upload = multer({ storage, fileFilter });

// Routes
router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);
router.post('/:id/like', videoController.likeVideo);
router.post('/:id/view', videoController.addView);
router.get('/:id/comments', videoController.getComments);
router.post('/:id/comments', videoController.addComment);

// ✅ Upload video route (protected + multer)
router.post('/', protect, upload.single('video'), videoController.uploadVideo);

module.exports = router;
