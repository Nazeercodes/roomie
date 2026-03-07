import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';
import './Browse.css'; // reuse browse grid styles

export default function SavedListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/saved/listings')
            .then(res => setListings(res.data))
            .finally(() => setLoading(false));
    }, []);

    const handleUnsave = async (id) => {
        await api.post(`/users/save/${id}`);
        setListings(prev => prev.filter(l => l.id !== id));
    };

    return (
        <div className="browse-page">
            <div className="browse-header">
                <h1>❤️ Saved Listings</h1>
                <p>{listings.length} saved room{listings.length !== 1 ? 's' : ''}</p>
            </div>
            <div style={{ maxWidth: 1100, margin: '32px auto', padding: '0 24px' }}>
                {loading ? (
                    <div className="listings-grid">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="listing-skeleton">
                                <div className="skeleton-img" />
                                <div className="skeleton-body">
                                    <div className="skeleton-line wide" />
                                    <div className="skeleton-line" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : listings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🤍</div>
                        <h3>No saved listings yet</h3>
                        <p>Browse rooms and tap "Save Listing" to keep track of your favourites.</p>
                        <Link to="/browse" className="btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>
                            Browse Rooms
                        </Link>
                    </div>
                ) : (
                    <div className="listings-grid">
                        {listings.map(listing => (
                            <div key={listing._id} style={{ position: 'relative' }}>
                                <ListingCard listing={listing} />
                                <button
                                    onClick={() => handleUnsave(listing._id)}
                                    style={{
                                        width: '100%', marginTop: 8, padding: '8px',
                                        background: '#fff', border: '1px solid #fecaca',
                                        borderRadius: 8, color: '#ef4444', fontSize: '0.85rem',
                                        fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    ✕ Remove from saved
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
