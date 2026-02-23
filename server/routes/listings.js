const express = require('express');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/listings — browse with optional filters
router.get('/', async (req, res) => {
    try {
        const { city, bhkType, genderPreference, minRent, maxRent } = req.query;
        const filter = { isActive: true };

        if (city) filter.city = { $regex: city, $options: 'i' };
        if (bhkType) filter.bhkType = bhkType;
        if (genderPreference) filter.genderPreference = genderPreference;
        if (minRent || maxRent) {
            filter.rent = {};
            if (minRent) filter.rent.$gte = Number(minRent);
            if (maxRent) filter.rent.$lte = Number(maxRent);
        }

        const listings = await Listing.find(filter)
            .populate('postedBy', 'name avatar city')
            .sort({ createdAt: -1 });

        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/listings/:id — single listing
router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('postedBy', 'name avatar bio city phone gender age preferences');
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/listings — create (auth required)
router.post('/', protect, async (req, res) => {
    try {
        const listing = await Listing.create({ ...req.body, postedBy: req.user.id });
        res.status(201).json(listing);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /api/listings/:id — update (owner only)
router.put('/:id', protect, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        if (listing.postedBy.toString() !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });

        const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /api/listings/:id — delete (owner only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        if (listing.postedBy.toString() !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });

        await listing.deleteOne();
        res.json({ message: 'Listing deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
