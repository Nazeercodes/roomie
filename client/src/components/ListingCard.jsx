import { Link } from 'react-router-dom';
import './ListingCard.css';

export default function ListingCard({ listing }) {
    const { id, title, rent, city, locality, bhk_type, gender_preference, images, posted_by } = listing;

    return (
        <article className="listing-card">
            <div className="card-image">
                {images?.length > 0 ? (
                    <img src={images[0]} alt={title} />
                ) : (
                    <div className="card-image-placeholder">🏠</div>
                )}
                <span className="card-badge">{bhkType}</span>
            </div>
            <div className="card-body">
                <div className="card-header">
                    <h3 className="card-title">{title}</h3>
                    <span className="card-rent">₹{rent.toLocaleString()}/mo</span>
                </div>
                <p className="card-location">📍 {locality}, {city}</p>
                <div className="card-tags">
                    <span className="tag">{genderPreference} only</span>
                </div>
                <div className="card-footer">
                    <div className="card-poster">
                        <div className="poster-avatar">{posted_by?.name?.[0]}</div>
                        <span>{posted_by?.name}</span>
                    </div>
                    <Link to={`/listing/${id}`} className="card-btn">View Details</Link>
                </div>
            </div>
        </article>
    );
}
