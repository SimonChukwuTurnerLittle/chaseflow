import { clsx } from 'clsx';

function getPageNumbers(page, totalPages) {
  const pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  // Always show first page
  pages.push(1);

  let start = Math.max(2, page - 1);
  let end = Math.min(totalPages - 1, page + 1);

  // Adjust range if near boundaries
  if (page <= 3) {
    end = Math.min(4, totalPages - 1);
  }
  if (page >= totalPages - 2) {
    start = Math.max(totalPages - 3, 2);
  }

  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('...');

  // Always show last page
  pages.push(totalPages);

  return pages;
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  const btnBase = clsx(
    'inline-flex items-center justify-center min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg',
    'transition-colors duration-200 cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta/50'
  );

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={clsx(
          btnBase,
          'text-slate-600 hover:bg-slate-100',
          page <= 1 && 'opacity-50 pointer-events-none'
        )}
      >
        Previous
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-slate-400 select-none">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={clsx(
              btnBase,
              p === page
                ? 'bg-cta text-white'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={clsx(
          btnBase,
          'text-slate-600 hover:bg-slate-100',
          page >= totalPages && 'opacity-50 pointer-events-none'
        )}
      >
        Next
      </button>
    </nav>
  );
}
