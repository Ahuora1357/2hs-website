import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { EmptyState, Skeleton } from './Misc.jsx';

/**
 * DataTable — accessible, sortable, responsive table.
 * columns: [{ key, header, align, width, sortable, render(row), className }]
 */
export default function DataTable({
  columns = [],
  rows = [],
  sort,
  onSort,
  rowKey = 'id',
  onRowClick,
  loading = false,
  emptyTitle = 'موردی یافت نشد',
  emptyMessage = 'با تغییر فیلترها یا افزودن رکورد جدید دوباره تلاش کنید.',
  emptyAction,
  skeletonRows = 6,
  caption,
}) {
  const showEmpty = !loading && rows.length === 0;

  return (
    <div className="table-wrap">
      <table className="table">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={`table__th table__th--${col.align || 'start'} ${
                    col.sortable ? 'is-sortable' : ''
                  }`}
                  aria-sort={isSorted ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="table__sort"
                      onClick={() => onSort?.(col.key, isSorted && sort.dir === 'asc' ? 'desc' : 'asc')}
                    >
                      {col.header}
                      <span className="table__sort-icon" aria-hidden="true">
                        {isSorted && sort.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={`sk-${i}`} className="table__row">
                  {columns.map((col) => (
                    <td key={col.key} className={`table__td table__td--${col.align || 'start'}`}>
                      <Skeleton width={col.key === 'actions' ? 90 : '80%'} height={14} />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={row[rowKey]}
                  className={`table__row ${onRowClick ? 'is-clickable' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter') onRowClick(row);
                        }
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`table__td table__td--${col.align || 'start'} ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          {showEmpty ? (
            <tr>
              <td className="table__empty" colSpan={columns.length || 1}>
                <EmptyState
                  icon={Inbox}
                  title={emptyTitle}
                  message={emptyMessage}
                  action={emptyAction}
                  compact
                />
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

/** Windowed pagination with Persian labels. */
export function Pagination({ page = 1, pages = 1, from = 0, to = 0, total = 0, onPage }) {
  if (total === 0) return null;

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(pages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const numbers = [];
  for (let i = start; i <= end; i += 1) numbers.push(i);

  return (
    <nav className="pagination" aria-label="صفحه‌بندی">
      <p className="pagination__info">
        نمایش <span className="num">{to === 0 ? 0 : from}</span> تا{' '}
        <span className="num">{to}</span> از <span className="num">{total}</span> مورد
      </p>
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPage?.(page - 1)}
          disabled={page <= 1}
          aria-label="صفحه قبل"
        >
          <ChevronRight size={16} />
        </button>
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            className={`pagination__btn ${n === page ? 'is-active' : ''}`}
            onClick={() => onPage?.(n)}
            aria-current={n === page ? 'page' : undefined}
          >
            <span className="num">{n}</span>
          </button>
        ))}
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPage?.(page + 1)}
          disabled={page >= pages}
          aria-label="صفحه بعد"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    </nav>
  );
}
