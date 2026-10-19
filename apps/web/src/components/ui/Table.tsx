import { useState, useEffect, type ReactNode, type CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** Label shown in card mode. Falls back to `header` when omitted. */
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

// ---------------------------------------------------------------------------
// useMediaQuery hook
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Design tokens (referenced as raw values so the component works even when
// CSS custom properties are not defined)
// ---------------------------------------------------------------------------

const tokens = {
  bgSurface: 'var(--color-bg-surface, #FFFFFF)',
  bg: 'var(--color-bg, #F5F2EC)',
  bgMuted: 'var(--color-bg-muted, #EDE9E0)',
  text: 'var(--color-text, #1C1F1D)',
  textMuted: 'var(--color-text-muted, #6B6860)',
  border: 'var(--color-border, #E2DCCF)',
  fontBody: 'var(--font-body, "Instrument Sans", sans-serif)',
  fontMono: 'var(--font-mono, "IBM Plex Mono", monospace)',
  textXs: 'var(--text-xs, 0.75rem)',
  textSm: 'var(--text-sm, 0.875rem)',
  radiusLg: 'var(--radius-lg, 12px)',
  radiusMd: 'var(--radius-md, 6px)',
  shadowSm: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
  durationFast: 'var(--duration-fast, 150ms)',
  easeDefault: 'var(--ease-default, ease)',
} as const;

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const emptyStateStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 24px',
  textAlign: 'center',
  fontFamily: tokens.fontBody,
  color: tokens.textMuted,
};

const emptyTitleStyle: CSSProperties = {
  margin: '12px 0 4px',
  fontSize: tokens.textSm,
  fontWeight: 600,
  color: tokens.text,
};

const emptyDescriptionStyle: CSSProperties = {
  margin: 0,
  fontSize: tokens.textXs,
  color: tokens.textMuted,
};

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

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
    <div style={emptyStateStyle}>
      {icon && <div style={{ marginBottom: 4 }}>{icon}</div>}
      {title && <p style={emptyTitleStyle}>{title}</p>}
      {description && <p style={emptyDescriptionStyle}>{description}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop table
// ---------------------------------------------------------------------------

function DesktopTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const wrapperStyle: CSSProperties = {
    background: tokens.bgSurface,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radiusLg,
    overflow: 'hidden',
    boxShadow: tokens.shadowSm,
  };

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: tokens.fontBody,
    fontSize: tokens.textSm,
    color: tokens.text,
  };

  const thStyle = (col: Column<T>): CSSProperties => ({
    padding: '12px 16px',
    textAlign: col.align ?? 'left',
    fontWeight: 600,
    fontSize: tokens.textXs,
    color: tokens.textMuted,
    background: tokens.bgMuted,
    borderBottom: `1px solid ${tokens.border}`,
    whiteSpace: 'nowrap',
    width: col.width,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  });

  const tdStyle = (col: Column<T>): CSSProperties => ({
    padding: '12px 16px',
    textAlign: col.align ?? 'left',
    borderBottom: `1px solid ${tokens.border}`,
    width: col.width,
  });

  const rowStyle = (key: string): CSSProperties => ({
    cursor: onRowClick ? 'pointer' : undefined,
    background: hoveredKey === key ? tokens.bgMuted : undefined,
    transition: `background ${tokens.durationFast} ${tokens.easeDefault}`,
  });

  if (data.length === 0) {
    return (
      <div style={wrapperStyle}>
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={thStyle(col)}>
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
                style={rowStyle(key)}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} style={tdStyle(col)}>
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

// ---------------------------------------------------------------------------
// Mobile card list
// ---------------------------------------------------------------------------

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

  const cardStyle: CSSProperties = {
    background: tokens.bgSurface,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radiusLg,
    padding: '16px',
    marginBottom: '12px',
    fontFamily: tokens.fontBody,
    fontSize: tokens.textSm,
    color: tokens.text,
    cursor: onRowClick ? 'pointer' : undefined,
    boxShadow: tokens.shadowSm,
  };

  const rowPairStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '6px 0',
  };

  const labelStyle: CSSProperties = {
    fontSize: tokens.textXs,
    color: tokens.textMuted,
    fontWeight: 500,
    flexShrink: 0,
    marginRight: '12px',
  };

  const valueStyle = (col: Column<T>): CSSProperties => ({
    textAlign: col.align ?? 'right',
    flex: 1,
    minWidth: 0,
  });

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
            style={cardStyle}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
          >
            {visibleColumns.map((col, idx) => (
              <div
                key={col.key}
                style={{
                  ...rowPairStyle,
                  borderBottom:
                    idx < visibleColumns.length - 1
                      ? `1px solid ${tokens.border}`
                      : undefined,
                }}
              >
                <span style={labelStyle}>{col.mobileLabel ?? col.header}</span>
                <span style={valueStyle(col)}>{col.render(item)}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DataTable (public component)
// ---------------------------------------------------------------------------

export function DataTable<T>(props: DataTableProps<T>) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isMobile) {
    return <MobileCardList {...props} />;
  }

  return <DesktopTable {...props} />;
}
