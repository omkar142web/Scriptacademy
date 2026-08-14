import { Link } from 'react-router-dom';

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="state" role="status">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function NotFoundState({
  title = 'Not Found',
  message,
  backTo,
  backLabel,
}) {
  return (
    <div className="state state--not-found">
      <h1>{title}</h1>
      <p>{message}</p>
      {backTo && (
        <Link to={backTo} className="btn">
          &larr; {backLabel || 'Go Back'}
        </Link>
      )}
    </div>
  );
}

export function BackendErrorState({ onRetry }) {
  return (
    <div className="state state--error">
      <h1>Backend Unavailable</h1>
      <p>
        The content service is not responding. Make sure the
        backend is running, then try again.
      </p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
