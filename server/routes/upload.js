const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — no temp files on disk
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

// POST /api/upload — upload one image, return secure URL
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image file provided' });

        // Upload to Cloudinary from buffer
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'roomie/listings', transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }] },
                (error, result) => { if (error) reject(error); else resolve(result); }
            ).end(req.file.buffer);
        });

        res.json({ url: result.secure_url, publicId: result.public_id });
    } catch (err) {
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

module.exports = router;
