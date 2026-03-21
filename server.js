const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

console.log('Server starting...');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Setting up routes...');
// Test route
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.send('FarfaraPop API Running - Updated!');
});

// Simple test route
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Test route working - Updated!' });
});
// Test auth routes
app.post('/api/auth/login', (req, res) => {
  console.log('Login route hit');
  res.json({ message: 'Login route working - Updated!', token: 'test-token-123' });
});

app.post('/api/auth/signup', (req, res) => {
  console.log('Signup route hit');
  res.json({ message: 'Signup route working - Updated!', token: 'test-token-123' });
});
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
