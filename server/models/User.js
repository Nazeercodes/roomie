const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 300 },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    preferences: {
        lifestyle: { type: String, enum: ['Student', 'Working Professional', 'Other'], default: 'Other' },
        sleepTime: { type: String, enum: ['Early Bird', 'Night Owl', 'Flexible'], default: 'Flexible' },
        smoking: { type: Boolean, default: false },
        pets: { type: Boolean, default: false },
        drinking: { type: Boolean, default: false },
    },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
