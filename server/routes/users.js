const router = require('express').Router();
const User = require('../models/User');
const Tweet = require('../models/Tweet');
const auth = require('../middleware/auth');

// Search users
router.get('/search/users', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ]
    }).select('-password').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put('/profile/update', auth, async (req, res) => {
  try {
    const { name, bio, avatar, coverImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar, coverImage },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user profile
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'name username avatar')
      .populate('following', 'name username avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const tweets = await Tweet.find({ author: user._id })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 });
    res.json({ user, tweets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow / Unfollow
router.put('/:id/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: 'Cannot follow yourself' });
    const isFollowing = currentUser.following.includes(req.params.id);
    if (isFollowing) {
      currentUser.following.pull(req.params.id);
      userToFollow.followers.pull(req.user.id);
    } else {
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);
      await User.findByIdAndUpdate(req.params.id, {
        $push: { notifications: { type: 'follow', from: req.user.id } }
      });
    }
    await currentUser.save();
    await userToFollow.save();
    res.json({ following: !isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
