const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

// Direct upload setup (bypass import issues)
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: Number.MAX_SAFE_INTEGER },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4') cb(null, true);
    else cb(new Error('Only .mp4 files are allowed'));
  },
});

console.log('🚀 Server starting...');
console.log('📁 Current directory:', __dirname);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('🔧 Setting up routes...');

// Test route
app.get('/', (req, res) => {
  console.log('✅ Root route hit');
  res.send('FarfaraPop API Running - Updated!');
});

// Simple test route
app.get('/test', (req, res) => {
  console.log('✅ Test route hit');
  res.json({ message: 'Test route working - Updated!' });
});

// Test auth routes
app.post('/api/auth/login', (req, res) => {
  console.log('✅ Login route hit with body:', req.body);
  res.json({ message: 'Login route working - Updated!', token: 'test-token-123' });
});

app.post('/api/auth/signup', (req, res) => {
  console.log('✅ Signup route hit with body:', req.body);
  res.json({ message: 'Signup route working - Updated!', token: 'test-token-123' });
});

// Temporary videos endpoint for testing
app.get('/api/videos', (req, res) => {
  console.log('✅ Videos route hit');
  res.json([
    {
      _id: '1',
      title: 'Test Video 1',
      artist: 'Test Artist',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    {
      _id: '2', 
      title: 'Test Video 2',
      artist: 'Another Artist',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'
    }
  ]);
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Direct upload route (no auth for testing)
app.post('/api/upload/video', upload.single('video'), (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎉 Server running on port ${PORT}`);
  console.log(`🛣️  Routes available:`);
  console.log(`   GET  /`);
  console.log(`   GET  /test`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/signup`);
  console.log(`   GET  /api/videos`);
  console.log(`   POST /api/upload/video (direct)`);
});
