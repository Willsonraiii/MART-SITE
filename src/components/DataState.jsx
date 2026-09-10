import './DataState.css'

export default function DataState({
  loading,
  error,
  empty,
  emptyTitle = 'Nothing here yet',
  emptyText = 'Try another aisle or clear a filter.',
  onRetry,
  children,
}) {
  if (loading) {
    return (
      <div className="data-state" role="status">
        <span className="spinner" aria-hidden="true" />
        <p>Loading the racks…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="data-state">
        <p className="eyebrow">Connection</p>
        <h2>We couldn’t reach the store.</h2>
        <p>{error}</p>
        {onRetry && (
          <button className="btn" type="button" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    )
  }

  if (empty) {
    return (
      <div className="data-state">
        <p className="eyebrow">Empty aisle</p>
        <h2>{emptyTitle}</h2>
        <p>{emptyText}</p>
      </div>
    )
  }

  return children
}
