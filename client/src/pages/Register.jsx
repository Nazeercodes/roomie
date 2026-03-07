import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🔵 Register form submitted', form);
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true); setError('');
        try {
            console.log('🔵 Sending request to:', api.defaults.baseURL + '/auth/register');
            const res = await api.post('/auth/register', form);
            console.log('✅ Registration success:', res.data);
            login(res.data);
            navigate('/browse');
        } catch (err) {
            console.error('❌ Registration error:', err);
            const msg = err.response?.data?.message || err.message || 'Registration failed. Try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🏠 RoomiE</div>
                <h1>Create account</h1>
                <p className="auth-subtitle">Join RoomiE and find your perfect room partner</p>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label>Full Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Nazeer Ahmed" required />
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    <label>Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Creating account...' : 'Get Started'}
                    </button>
                </form>
                <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
}
