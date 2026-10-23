// src/components/ErrorMessage.jsx
export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="alert alert-danger" role="alert">
      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600 }}>Error</p>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-outline btn-sm"
          style={{ borderColor: 'var(--danger-text)', color: 'var(--danger-text)' }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
