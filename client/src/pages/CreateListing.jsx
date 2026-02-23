import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './CreateListing.css';

const BHK_TYPES = ['1BHK', '2BHK', '3BHK', 'Studio', 'PG'];
const GENDERS = ['Male', 'Female', 'Any'];
const AMENITIES = ['WiFi', 'AC', 'Washing Machine', 'Parking', 'Gym', 'Power Backup', 'Furnished', 'Semi-Furnished'];

export default function CreateListing() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '', description: '', rent: '',
        city: '', locality: '', bhkType: '1BHK',
        availableFrom: '', genderPreference: 'Any',
        amenities: [], images: []
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const toggleAmenity = (amenity) => {
        setForm(p => ({
            ...p,
            amenities: p.amenities.includes(amenity)
                ? p.amenities.filter(a => a !== amenity)
                : [...p.amenities, amenity]
        }));
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        if (form.images.length + files.length > 4) return setError('Max 4 images allowed');

        setUploading(true); setError('');
        try {
            const uploaded = await Promise.all(files.map(async (file) => {
                // Show local preview immediately
                const preview = URL.createObjectURL(file);
                const formData = new FormData();
                formData.append('image', file);
                const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return { url: res.data.url, preview };
            }));

            setPreviewUrls(p => [...p, ...uploaded.map(u => u.preview)]);
            setForm(p => ({ ...p, images: [...p.images, ...uploaded.map(u => u.url)] }));
        } catch (err) {
            setError('Image upload failed. Check your Cloudinary credentials.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setPreviewUrls(p => p.filter((_, i) => i !== index));
        setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.rent || !form.city || !form.locality)
            return setError('Please fill all required fields');
        setLoading(true); setError('');
        try {
            const res = await api.post('/listings', { ...form, rent: Number(form.rent) });
            navigate(`/listing/${res.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-page">
            <div className="create-container">
                <h1>Post Your Room</h1>
                <p>Fill in the details to find your perfect roommate</p>
                {error && <div className="form-error">{error}</div>}
                <form onSubmit={handleSubmit} className="create-form">
                    <div className="form-grid">
                        <div className="form-group full">
                            <label>Listing Title *</label>
                            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Cozy 1BHK in Koramangala" required />
                        </div>
                        <div className="form-group full">
                            <label>Description *</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the room, neighbourhood, house rules..." required />
                        </div>
                        <div className="form-group">
                            <label>Monthly Rent (₹) *</label>
                            <input name="rent" type="number" value={form.rent} onChange={handleChange} placeholder="8000" required />
                        </div>
                        <div className="form-group">
                            <label>BHK Type *</label>
                            <select name="bhkType" value={form.bhkType} onChange={handleChange}>
                                {BHK_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>City *</label>
                            <input name="city" value={form.city} onChange={handleChange} placeholder="Bangalore" required />
                        </div>
                        <div className="form-group">
                            <label>Locality *</label>
                            <input name="locality" value={form.locality} onChange={handleChange} placeholder="Koramangala" required />
                        </div>
                        <div className="form-group">
                            <label>Available From *</label>
                            <input name="availableFrom" type="date" value={form.availableFrom} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Gender Preference</label>
                            <select name="genderPreference" value={form.genderPreference} onChange={handleChange}>
                                {GENDERS.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="form-group full" style={{ marginBottom: '20px' }}>
                        <label>Room Photos (up to 4)</label>
                        <div className="image-upload-area">
                            {previewUrls.map((url, i) => (
                                <div key={i} className="image-preview">
                                    <img src={url} alt={`preview ${i}`} />
                                    <button type="button" className="remove-image" onClick={() => removeImage(i)}>✕</button>
                                </div>
                            ))}
                            {form.images.length < 4 && (
                                <label className={`upload-btn ${uploading ? 'uploading' : ''}`}>
                                    {uploading ? '⏳ Uploading...' : '+ Add Photo'}
                                    <input type="file" accept="image/*" multiple onChange={handleImageChange} hidden disabled={uploading} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="form-group full">
                        <label>Amenities</label>
                        <div className="amenity-grid">
                            {AMENITIES.map(a => (
                                <button type="button" key={a}
                                    className={`amenity-btn ${form.amenities.includes(a) ? 'selected' : ''}`}
                                    onClick={() => toggleAmenity(a)}>
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading || uploading}>
                        {loading ? 'Posting...' : '🚀 Post Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
}
