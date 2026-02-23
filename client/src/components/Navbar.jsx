import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';
    const close = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo" onClick={close}>🏠 RoomiE</Link>

                <button
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(o => !o)}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>

                <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/browse" className={isActive('/browse')} onClick={close}>Browse Rooms</Link>
                    {user ? (
                        <>
                            <Link to="/create" className={`btn-post ${isActive('/create')}`} onClick={close}>+ Post Room</Link>
                            <Link to="/saved" className={isActive('/saved')} onClick={close}>Saved</Link>
                            <Link to={`/profile/${user._id}`} className={`nav-avatar-link ${isActive(`/profile/${user._id}`)}`} onClick={close}>
                                <div className="nav-avatar">{user.name?.[0]?.toUpperCase()}</div>
                                <span>{user.name?.split(' ')[0]}</span>
                            </Link>
                            <button onClick={handleLogout} className="btn-logout">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={isActive('/login')} onClick={close}>Login</Link>
                            <Link to="/register" className="btn-register" onClick={close}>Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
