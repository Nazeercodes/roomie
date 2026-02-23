import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <main className="home">
            {/* Hero */}
            <section className="hero">
                <div className="hero-content">
                    <span className="hero-badge">🏠 India's Roommate Finder</span>
                    <h1>Find Your Perfect <span>Room Partner</span></h1>
                    <p>Split the rent, find your people. Connect with compatible roommates in your city and make living affordable.</p>
                    <div className="hero-actions">
                        <Link to="/browse" className="btn-primary">Browse Rooms →</Link>
                        <Link to="/register" className="btn-outline">Post Your Room</Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat"><strong>2,400+</strong><span>Active Listings</span></div>
                        <div className="stat"><strong>50+</strong><span>Cities</span></div>
                        <div className="stat"><strong>8,000+</strong><span>Happy Roommates</span></div>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card floating">
                        <div className="hc-badge">1BHK</div>
                        <h4>Cozy Room in Koramangala</h4>
                        <p>₹8,500/mo · Bangalore</p>
                        <div className="hc-tags"><span>Any Gender</span><span>WiFi</span><span>Furnished</span></div>
                    </div>
                    <div className="hero-card floating-2">
                        <div className="hc-badge" style={{ background: '#10b981' }}>2BHK</div>
                        <h4>Spacious Flat in Andheri</h4>
                        <p>₹12,000/mo · Mumbai</p>
                        <div className="hc-tags"><span>Female Only</span><span>AC</span></div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="how-it-works">
                <h2>How RoomiE Works</h2>
                <div className="steps">
                    <div className="step">
                        <div className="step-icon">📝</div>
                        <h3>Create Profile</h3>
                        <p>Tell us about your lifestyle, habits, and what you're looking for</p>
                    </div>
                    <div className="step">
                        <div className="step-icon">🔍</div>
                        <h3>Browse Listings</h3>
                        <p>Filter by city, price, BHK type and gender preference</p>
                    </div>
                    <div className="step">
                        <div className="step-icon">💬</div>
                        <h3>Connect & Chat</h3>
                        <p>Message potential roommates directly and find your perfect match</p>
                    </div>
                    <div className="step">
                        <div className="step-icon">🤝</div>
                        <h3>Move In</h3>
                        <p>Split the rent, save money, and enjoy life with your new roommate</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta">
                <h2>Ready to find your roommate?</h2>
                <p>Join thousands of people saving money by sharing their space</p>
                <Link to="/register" className="btn-primary">Get Started for Free</Link>
            </section>
        </main>
    );
}
