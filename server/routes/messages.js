const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:userId — get conversation between two users
router.get('/:userId', protect, async (req, res) => {
    try {
        const conversationId = [req.user.id, req.params.userId].sort().join('_');
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/messages — send a message
router.post('/', protect, async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        const conversationId = [req.user.id, receiverId].sort().join('_');
        const message = await Message.create({
            conversationId,
            sender: req.user.id,
            receiver: receiverId,
            text,
        });
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/messages/conversations/list — list all conversations for current user
router.get('/conversations/list', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }],
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar');

        // Get unique conversations
        const seen = new Set();
        const conversations = messages.filter((msg) => {
            const key = msg.conversationId;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
