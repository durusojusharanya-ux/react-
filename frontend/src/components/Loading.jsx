// src/components/Loading.jsx
export default function Loading({ fullscreen = false, size = 'md', text = 'Loading...' }) {
  const spinner = (
    <div className={`loading-spinner loading-spinner--${size}`} aria-label="Loading" role="status">
      <div className="spinner-ring" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        {spinner}
      </div>
    );
  }
  return spinner;
}
