const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  artist: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Video", videoSchema);
