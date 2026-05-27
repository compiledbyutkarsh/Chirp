const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get notifications
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('notifications.from', 'name username avatar');
    res.json(user.notifications.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all read
router.put('/read', auth, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { $set: { 'notifications.$[].read': true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
