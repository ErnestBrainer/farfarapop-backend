const path = require('path');

const uploadVideo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Optional: log file info
  console.log('Uploaded file:', req.file);

  // Return URL relative to static folder
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    message: 'Video uploaded successfully',
    video: {
      url: fileUrl,
      filename: req.file.originalname,
    },
  });
};

module.exports = { uploadVideo };
