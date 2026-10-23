// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="main-content" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      <div style={{ fontSize: '5rem', lineHeight: 1, marginBottom: 'var(--space-md)' }}>
        404
      </div>
      <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
        Page Not Found
      </h1>
      <p
        style={{
          color: 'var(--text-secondary)',
          maxWidth: '480px',
          margin: '0 auto var(--space-xl)',
          fontSize: 'var(--font-size-base)',
        }}
      >
        The page you are looking for doesn't exist or has been moved. Check the URL or return to home.
      </p>
      <Link
        to={isAuthenticated ? '/dashboard' : '/login'}
        className="btn btn-primary btn-lg"
      >
        {isAuthenticated ? '← Return to Dashboard' : '← Go to Login'}
      </Link>
    </div>
  );
}
