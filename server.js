const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db'); // ✅ MongoDB connection

dotenv.config();
connectDB(); // ✅ Connect to MongoDB

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded video files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
const videoRoutes = require('./routes/videoRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/upload'); // ✅ Local upload route

app.use('/api/videos', videoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes); // ✅ Use upload route

app.get('/', (req, res) => res.send('FarfaraPop API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
