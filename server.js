const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

console.log('Starting server...');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Setting up routes...');

// Test route
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.send('FarfaraPop API Running');
});

// Simple test route
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Test route working!' });
});

// Test auth routes
app.post('/api/auth/login', (req, res) => {
  console.log('Login route hit with body:', req.body);
  res.json({ message: 'Login route working', token: 'test-token-123' });
});

app.post('/api/auth/signup', (req, res) => {
  console.log('Signup route hit with body:', req.body);
  res.json({ message: 'Signup route working', token: 'test-token-123' });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Routes available:`);
  console.log(`   GET  /`);
  console.log(`   GET  /test`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/signup`);
});
