const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 1000 },
    rent: { type: Number, required: true },
    city: { type: String, required: true },
    locality: { type: String, required: true },
    bhkType: { type: String, enum: ['1BHK', '2BHK', '3BHK', 'Studio', 'PG'], required: true },
    availableFrom: { type: Date, required: true },
    genderPreference: { type: String, enum: ['Male', 'Female', 'Any'], default: 'Any' },
    images: [{ type: String }],
    amenities: [{
        type: String,
        enum: ['WiFi', 'AC', 'Washing Machine', 'Parking', 'Gym', 'Power Backup', 'Furnished', 'Semi-Furnished']
    }],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
