import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div style={{
            paddingTop: 120, minHeight: '100vh', textAlign: 'center',
            background: 'var(--bg)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '64px 24px'
        }}>
            <div style={{ fontSize: '5rem', marginBottom: 24 }}>🏚️</div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12 }}>404</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: 32, maxWidth: 360 }}>
                Looks like this room doesn't exist. It may have been deleted or the URL is wrong.
            </p>
            <Link to="/" style={{
                background: 'var(--purple)', color: '#fff', padding: '12px 28px',
                borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem'
            }}>
                ← Back to Home
            </Link>
        </div>
    );
}
