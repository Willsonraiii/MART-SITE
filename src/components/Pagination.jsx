export default function Pagination({ page, pageCount, onPage }) {
  if (pageCount <= 1) return null

  const pages = []
  for (let i = 1; i <= pageCount; i += 1) pages.push(i)

  return (
    <nav className="pagination" aria-label="Product pages">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Prev
      </button>
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          className={n === page ? 'is-active' : ''}
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onPage(n)}
        >
          {n}
        </button>
      ))}
      <button type="button" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </nav>
  )
}
