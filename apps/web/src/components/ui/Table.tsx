import { useState, useEffect, type ReactNode } from 'react';
import './Table.css';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  mobileLabel?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <div className="datatable__empty">
      {icon && <div className="datatable__empty-icon">{icon}</div>}
      {title && <p className="datatable__empty-title">{title}</p>}
      {description && <p className="datatable__empty-desc">{description}</p>}
    </div>
  );
}

function DesktopTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="datatable">
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="datatable">
      <table className="datatable__table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="datatable__th"
                style={{ textAlign: col.align, width: col.width }}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const key = keyExtractor(item);
            return (
              <tr
                key={key}
                className={`datatable__row${onRowClick ? ' datatable__row--clickable' : ''}`}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="datatable__td"
                    style={{ textAlign: col.align, width: col.width }}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MobileCardList<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  const visibleColumns = columns.filter((col) => !col.hideOnMobile);

  if (data.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div>
      {data.map((item) => {
        const key = keyExtractor(item);
        return (
          <div
            key={key}
            className={`datatable-cards__item${onRowClick ? ' datatable-cards__item--clickable' : ''}`}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
          >
            {visibleColumns.map((col) => (
              <div key={col.key} className="datatable-cards__row">
                <span className="datatable-cards__label">
                  {col.mobileLabel ?? col.header}
                </span>
                <span style={{ textAlign: col.align ?? 'right', flex: 1, minWidth: 0 }}>
                  {col.render(item)}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function DataTable<T>(props: DataTableProps<T>) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  return isMobile ? <MobileCardList {...props} /> : <DesktopTable {...props} />;
}
