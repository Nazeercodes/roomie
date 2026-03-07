import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';
import './Browse.css';

const BHK_TYPES = ['1BHK', '2BHK', '3BHK', 'Studio', 'PG'];
const GENDERS = ['Male', 'Female', 'Any'];
const EMPTY_FILTERS = { city: '', bhkType: '', genderPreference: '', minRent: '', maxRent: '' };

export default function Browse() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const fetchListings = useCallback(async (activeFilters) => {
        setLoading(true);
        try {
            const params = Object.fromEntries(Object.entries(activeFilters).filter(([, v]) => v));
            const res = await api.get('/listings', { params });
            setListings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchListings(EMPTY_FILTERS); }, []);

    const handleFilter = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSearch = (e) => { e.preventDefault(); fetchListings(filters); };

    const handleReset = () => {
        setFilters(EMPTY_FILTERS);
        fetchListings(EMPTY_FILTERS);
    };

    return (
        <div className="browse-page">
            <div className="browse-header">
                <h1>Browse Rooms</h1>
                <p>{loading ? 'Searching...' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}</p>
            </div>

            <div className="browse-layout">
                {/* Filter Sidebar */}
                <aside className="filter-sidebar">
                    <form onSubmit={handleSearch}>
                        <h3>🔍 Filters</h3>

                        <label>City</label>
                        <input name="city" value={filters.city} onChange={handleFilter} placeholder="e.g. Bangalore" />

                        <label>BHK Type</label>
                        <select name="bhkType" value={filters.bhkType} onChange={handleFilter}>
                            <option value="">All Types</option>
                            {BHK_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>

                        <label>Gender Preference</label>
                        <select name="genderPreference" value={filters.genderPreference} onChange={handleFilter}>
                            <option value="">All</option>
                            {GENDERS.map(g => <option key={g}>{g}</option>)}
                        </select>

                        <label>Min Rent (₹)</label>
                        <input name="minRent" type="number" value={filters.minRent} onChange={handleFilter} placeholder="0" />

                        <label>Max Rent (₹)</label>
                        <input name="maxRent" type="number" value={filters.maxRent} onChange={handleFilter} placeholder="50000" />

                        <button type="submit" className="btn-filter">Search</button>
                        <button type="button" className="btn-reset" onClick={handleReset}>Reset Filters</button>
                    </form>
                </aside>

                {/* Listings Grid */}
                <main className="listings-grid">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="listing-skeleton">
                                <div className="skeleton-img" />
                                <div className="skeleton-body">
                                    <div className="skeleton-line wide" />
                                    <div className="skeleton-line" />
                                    <div className="skeleton-line short" />
                                </div>
                            </div>
                        ))
                    ) : listings.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔎</div>
                            <h3>No listings found</h3>
                            <p>Try adjusting your filters or clearing them to see all rooms.</p>
                            <button className="btn-reset" onClick={handleReset} style={{ marginTop: 12 }}>Clear Filters</button>
                        </div>
                    ) : (
                        listings.map(listing => <ListingCard key={listing.id} listing={listing} />)
                    )}
                </main>
            </div>
        </div>
    );
}
