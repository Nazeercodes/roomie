import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './ListingDetail.css';

export default function ListingDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        api.get(`/listings/${id}`)
            .then(res => {
                setListing(res.data);
                // Check if already saved
                if (user) {
                    api.get('/users/saved/listings').then(savedRes => {
                        setSaved(savedRes.data.some(l => l._id === res.data._id));
                    }).catch(() => { });
                }
            })
            .catch(() => navigate('/browse'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSave = async () => {
        if (!user) return navigate('/login');
        const res = await api.post(`/users/save/${id}`);
        setSaved(res.data.saved);
    };

    const handleContact = () => {
        if (!user) return navigate('/login');
        navigate(`/chat/${listing.postedBy._id}`);
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this listing? This cannot be undone.')) return;
        setDeleting(true);
        await api.delete(`/listings/${id}`);
        navigate('/browse');
    };

    if (loading) return <div className="detail-loading"><div className="spinner" />Loading listing...</div>;
    if (!listing) return null;

    const { title, description, rent, city, locality, bhkType, genderPreference,
        availableFrom, images, amenities, postedBy } = listing;

    const isOwner = user?._id === postedBy?._id;

    return (
        <div className="detail-page">
            <div className="detail-container">
                {/* Gallery */}
                <div className="detail-gallery">
                    <div className="gallery-main">
                        {images?.length > 0
                            ? <img src={images[activeImage]} alt={title} />
                            : <div className="detail-placeholder">🏠</div>}
                        <span className="detail-badge">{bhkType}</span>
                        {isOwner && (
                            <div className="owner-actions">
                                <Link to={`/edit/${id}`} className="edit-btn">✏️ Edit</Link>
                                <button onClick={handleDelete} className="delete-btn" disabled={deleting}>
                                    {deleting ? 'Deleting...' : '🗑️ Delete'}
                                </button>
                            </div>
                        )}
                    </div>
                    {images?.length > 1 && (
                        <div className="gallery-thumbs">
                            {images.map((img, i) => (
                                <button key={i}
                                    className={`thumb ${i === activeImage ? 'active' : ''}`}
                                    onClick={() => setActiveImage(i)}>
                                    <img src={img} alt={`view ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="detail-layout">
                    {/* Main Info */}
                    <div className="detail-main">
                        <div className="detail-header">
                            <div>
                                <h1>{title}</h1>
                                <p className="detail-location">📍 {locality}, {city}</p>
                            </div>
                            <div className="detail-rent">
                                <span>₹{rent.toLocaleString()}</span>
                                <small>/month</small>
                            </div>
                        </div>

                        <div className="detail-chips">
                            <span className="chip">👥 {genderPreference} Only</span>
                            <span className="chip">📅 From {new Date(availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>

                        <div className="detail-section">
                            <h3>About this room</h3>
                            <p>{description}</p>
                        </div>

                        {amenities?.length > 0 && (
                            <div className="detail-section">
                                <h3>Amenities</h3>
                                <div className="amenity-list">
                                    {amenities.map(a => <span key={a} className="amenity-tag">✅ {a}</span>)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="detail-sidebar">
                        <div className="poster-card">
                            <div className="poster-avatar-lg">{postedBy?.name?.[0]?.toUpperCase()}</div>
                            <h4>{postedBy?.name}</h4>
                            {postedBy?.city && <p>📍 {postedBy.city}</p>}
                            <Link to={`/profile/${postedBy?._id}`} className="view-profile-btn">View Profile</Link>
                        </div>

                        {!isOwner && (
                            <div className="sidebar-actions">
                                <button onClick={handleContact} className="contact-btn">💬 Send Message</button>
                                <button onClick={handleSave} className={`save-btn ${saved ? 'saved' : ''}`}>
                                    {saved ? '❤️ Saved' : '🤍 Save Listing'}
                                </button>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
