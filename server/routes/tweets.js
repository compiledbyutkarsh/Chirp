const router = require('express').Router();
const Tweet = require('../models/Tweet');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all tweets
router.get('/', auth, async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .populate('author', 'name username avatar')
      .populate('comments.user', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(tweets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create tweet
router.post('/', auth, async (req, res) => {
  try {
    const { content, image } = req.body;
    if (!content && !image) return res.status(400).json({ message: 'Tweet cannot be empty' });
    const tweet = await Tweet.create({ content, image, author: req.user.id });
    await tweet.populate('author', 'name username avatar');
    res.status(201).json(tweet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like / Unlike
router.put('/:id/like', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    const liked = tweet.likes.includes(req.user.id);
    if (liked) tweet.likes.pull(req.user.id);
    else {
      tweet.likes.push(req.user.id);
      // Notification
      if (tweet.author.toString() !== req.user.id) {
        await User.findByIdAndUpdate(tweet.author, {
          $push: { notifications: { type: 'like', from: req.user.id, tweet: tweet._id } }
        });
      }
    }
    await tweet.save();
    res.json(tweet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Retweet
router.put('/:id/retweet', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    const retweeted = tweet.retweets.includes(req.user.id);
    if (retweeted) tweet.retweets.pull(req.user.id);
    else {
      tweet.retweets.push(req.user.id);
      if (tweet.author.toString() !== req.user.id) {
        await User.findByIdAndUpdate(tweet.author, {
          $push: { notifications: { type: 'retweet', from: req.user.id, tweet: tweet._id } }
        });
      }
    }
    await tweet.save();
    res.json(tweet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bookmark
router.put('/:id/bookmark', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const bookmarked = user.bookmarks.includes(req.params.id);
    if (bookmarked) user.bookmarks.pull(req.params.id);
    else user.bookmarks.push(req.params.id);
    await user.save();
    res.json({ bookmarked: !bookmarked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get bookmarks
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'name username avatar' }
    });
    res.json(user.bookmarks.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    tweet.comments.push({ user: req.user.id, text: req.body.text });
    await tweet.save();
    if (tweet.author.toString() !== req.user.id) {
      await User.findByIdAndUpdate(tweet.author, {
        $push: { notifications: { type: 'comment', from: req.user.id, tweet: tweet._id } }
      });
    }
    await tweet.populate('comments.user', 'name username avatar');
    res.json(tweet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete tweet
router.delete('/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (tweet.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    await tweet.deleteOne();
    res.json({ message: 'Tweet deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
