const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/saved/listings — get saved listings (MUST be before /:id)
router.get('/saved/listings', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'savedListings',
            populate: { path: 'postedBy', select: 'name avatar city' }
        });
        res.json(user.savedListings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/users/my/listings — get listings posted by the logged-in user
router.get('/my/listings', protect, async (req, res) => {
    try {
        const listings = await Listing.find({ postedBy: req.user.id })
            .sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        const listings = await Listing.find({ postedBy: req.params.id, isActive: true })
            .sort({ createdAt: -1 });
        res.json({ user, listings });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /api/users/profile — update own profile
router.put('/profile', protect, async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password; // never allow password update here
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/users/save/:listingId — save/unsave a listing
router.post('/save/:listingId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const listingId = req.params.listingId;
        const isSaved = user.savedListings.map(id => id.toString()).includes(listingId);

        if (isSaved) {
            user.savedListings = user.savedListings.filter(id => id.toString() !== listingId);
        } else {
            user.savedListings.push(listingId);
        }

        await user.save();
        res.json({ saved: !isSaved, savedListings: user.savedListings });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
