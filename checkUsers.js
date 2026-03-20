require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to ${conn.connection.host}`);

    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema, 'users');

    const users = await User.find();
    console.log('Users in DB:', users);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connectDB();
