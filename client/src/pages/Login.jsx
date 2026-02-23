import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await api.post('/auth/login', form);
            login(res.data);
            navigate('/browse');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🏠 RoomiE</div>
                <h1>Welcome back</h1>
                <p className="auth-subtitle">Login to find your perfect roommate</p>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    <label>Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="auth-switch">Don't have an account? <Link to="/register">Sign up</Link></p>
            </div>
        </div>
    );
}
