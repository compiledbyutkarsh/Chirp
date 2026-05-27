const router = require('express').Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get conversations list
router.get('/conversations', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    }).populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar')
      .sort({ createdAt: -1 });

    const conversations = {};
    messages.forEach(msg => {
      const other = msg.sender._id.toString() === req.user.id
        ? msg.receiver : msg.sender;
      if (!conversations[other._id]) {
        conversations[other._id] = { user: other, lastMessage: msg };
      }
    });
    res.json(Object.values(conversations));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages with a user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).populate('sender', 'name username avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post('/:userId', auth, async (req, res) => {
  try {
    const message = await Message.create({
      sender: req.user.id,
      receiver: req.params.userId,
      text: req.body.text
    });
    await message.populate('sender', 'name username avatar');
    await User.findByIdAndUpdate(req.params.userId, {
      $push: { notifications: { type: 'message', from: req.user.id } }
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
