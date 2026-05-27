const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tweet' }],
  notifications: [{
    type: { type: String, enum: ['like', 'retweet', 'follow', 'comment', 'message'] },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tweet: { type: mongoose.Schema.Types.ObjectId, ref: 'Tweet' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
