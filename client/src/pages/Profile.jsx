import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import './Profile.css';

const LIFESTYLE = ['Night Owl', 'Early Bird', 'Flexible'];
const SLEEP_TIMES = ['Before 10pm', '10pm-12am', 'After 12am'];

export default function Profile() {
    const { id } = useParams();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const isOwn = user?._id === id;

    useEffect(() => {
        api.get(`/users/${id}`)
            .then(res => {
                setProfile(res.data.user);
                setListings(res.data.listings);
                setEditForm({
                    name: res.data.user.name || '',
                    city: res.data.user.city || '',
                    bio: res.data.user.bio || '',
                    age: res.data.user.age || '',
                    gender: res.data.user.gender || '',
                    phone: res.data.user.phone || '',
                    preferences: {
                        lifestyle: res.data.user.preferences?.lifestyle || '',
                        sleepTime: res.data.user.preferences?.sleepTime || '',
                        smoking: res.data.user.preferences?.smoking || false,
                        pets: res.data.user.preferences?.pets || false,
                    }
                });
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('pref_')) {
            const key = name.replace('pref_', '');
            setEditForm(f => ({ ...f, preferences: { ...f.preferences, [key]: type === 'checkbox' ? checked : value } }));
        } else {
            setEditForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/users/profile', editForm);
            setProfile(res.data);
            updateUser({ name: res.data.name, city: res.data.city });
            setEditOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (!window.confirm('Delete this listing?')) return;
        await api.delete(`/listings/${listingId}`);
        setListings(l => l.filter(x => x._id !== listingId));
    };

    if (loading) return <div className="profile-loading"><div className="spinner" />Loading profile...</div>;
    if (!profile) return <div className="profile-loading">User not found</div>;

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Header */}
                <div className="profile-header">
                    <div className="profile-avatar">{profile.name?.[0]?.toUpperCase()}</div>
                    <div className="profile-info">
                        <h1>{profile.name}</h1>
                        {profile.city && <p className="profile-city">📍 {profile.city}</p>}
                        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                        <div className="profile-chips">
                            {profile.gender && <span className="chip">{profile.gender}</span>}
                            {profile.age && <span className="chip">{profile.age} yrs</span>}
                            {profile.phone && <span className="chip">📞 {profile.phone}</span>}
                            {profile.preferences?.lifestyle && <span className="chip">☀️ {profile.preferences.lifestyle}</span>}
                            {profile.preferences?.sleepTime && <span className="chip">🌙 {profile.preferences.sleepTime}</span>}
                            {profile.preferences?.smoking && <span className="chip">🚬 Smoker</span>}
                            {profile.preferences?.pets && <span className="chip">🐾 Pet-friendly</span>}
                        </div>
                    </div>
                    <div className="profile-actions">
                        {isOwn && (
                            <>
                                <button onClick={() => setEditOpen(true)} className="btn-edit-profile">✏️ Edit Profile</button>
                                <Link to="/create" className="profile-post-btn">+ Post Room</Link>
                            </>
                        )}
                        {!isOwn && <Link to={`/chat/${id}`} className="profile-chat-btn">💬 Message</Link>}
                    </div>
                </div>

                {/* Listings */}
                {listings.length > 0 && (
                    <div className="profile-listings">
                        <h2>{isOwn ? 'Your Listings' : `${profile.name}'s Listings`}</h2>
                        <div className="profile-listings-grid">
                            {listings.map(l => (
                                <div key={l._id} className="profile-listing-wrap">
                                    <ListingCard listing={l} />
                                    {isOwn && (
                                        <button className="delete-listing-btn" onClick={() => handleDeleteListing(l._id)}>
                                            🗑️ Delete
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isOwn && listings.length === 0 && (
                    <div className="no-listings">
                        <p>You haven't posted any listings yet.</p>
                        <Link to="/create" className="btn-primary">Post Your First Room</Link>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editOpen && (
                <div className="modal-overlay" onClick={() => setEditOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Profile</h2>
                            <button onClick={() => setEditOpen(false)} className="modal-close">✕</button>
                        </div>
                        <form onSubmit={handleSaveProfile} className="edit-form">
                            <div className="edit-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input name="name" value={editForm.name} onChange={handleEditChange} required />
                                </div>
                                <div className="form-group">
                                    <label>City</label>
                                    <input name="city" value={editForm.city} onChange={handleEditChange} placeholder="Bangalore" />
                                </div>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input name="age" type="number" value={editForm.age} onChange={handleEditChange} placeholder="24" />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={editForm.gender} onChange={handleEditChange}>
                                        <option value="">Prefer not to say</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input name="phone" value={editForm.phone} onChange={handleEditChange} placeholder="+91 98765 43210" />
                                </div>
                                <div className="form-group">
                                    <label>Lifestyle</label>
                                    <select name="pref_lifestyle" value={editForm.preferences?.lifestyle} onChange={handleEditChange}>
                                        <option value="">Select</option>
                                        {LIFESTYLE.map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Sleep Time</label>
                                    <select name="pref_sleepTime" value={editForm.preferences?.sleepTime} onChange={handleEditChange}>
                                        <option value="">Select</option>
                                        {SLEEP_TIMES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group full">
                                <label>Bio</label>
                                <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows={3} placeholder="Tell potential roommates about yourself..." />
                            </div>
                            <div className="checkbox-row">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="pref_smoking" checked={editForm.preferences?.smoking} onChange={handleEditChange} />
                                    I smoke
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" name="pref_pets" checked={editForm.preferences?.pets} onChange={handleEditChange} />
                                    I have / am ok with pets
                                </label>
                            </div>
                            <button type="submit" className="btn-save" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
