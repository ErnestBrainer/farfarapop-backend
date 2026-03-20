const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

// 📌 Get all videos (DB first, fallback to uploads folder)
exports.getAllVideos = async (req, res) => {
  try {
    // 1️⃣ Fetch from MongoDB
    const videos = await Video.find().sort({ uploadedAt: -1 });

    if (videos.length > 0) {
      return res.json(videos);
    }

    // 2️⃣ If DB empty → check uploads folder
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      return res.json([]); // No uploads folder found
    }

    const files = fs.readdirSync(uploadsPath)
      .filter(file => file.toLowerCase().endsWith('.mp4'));

    const fileVideos = files.map(file => ({
      _id: file, // fake ID for frontend mapping
      title: file,
      url: `/uploads/${file}`,
      artist: 'Unknown Artist',
      likes: 0,
      views: 0,
      uploadedAt: fs.statSync(path.join(uploadsPath, file)).ctime
    }));

    return res.json(fileVideos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

// 📌 Upload a new video (file + DB record)
exports.uploadVideo = async (req, res) => {
  try {
    // If using Multer for file upload
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { title, artist } = req.body;

    const newVideo = new Video({
      title: title || req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      artist: artist || 'Unknown Artist',
      likes: 0,
      views: 0,
      uploadedAt: new Date()
    });

    const saved = await newVideo.save();
    res.status(201).json({ message: 'Video uploaded', video: saved });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

// 📌 Get a single video by ID
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving video' });
  }
};

// 📌 Increment likes on a video
exports.likeVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json({ message: 'Video liked', likes: video.likes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like video' });
  }
};

// 📌 Increment views on a video
exports.addView = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json({ message: 'View counted', views: video.views });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count view' });
  }
};

// 📌 Get comments for a video
exports.getComments = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).select('comments');
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json({ comments: video.comments || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// 📌 Add a comment to a video
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    video.comments = video.comments || [];
    video.comments.push({ 
      text: text.trim(),
      createdAt: new Date()
    });
    await video.save();

    res.status(201).json({ comments: video.comments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};
