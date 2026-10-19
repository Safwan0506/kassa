import { useEffect, type CSSProperties } from 'react';

const SHIMMER_STYLE_ID = 'kassa-shimmer-keyframes';

function injectShimmerKeyframes(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SHIMMER_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = SHIMMER_STYLE_ID;
  style.textContent = `
@keyframes kassa-shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}`;
  document.head.appendChild(style);
}

/* ---------- SkeletonBox ---------- */

interface SkeletonBoxProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: CSSProperties;
}

export function SkeletonBox({
  width = '100%',
  height = '100%',
  borderRadius = 'var(--radius-md)',
  style,
}: SkeletonBoxProps) {
  useEffect(() => {
    injectShimmerKeyframes();
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        background:
          'linear-gradient(90deg, #EDE9E0 25%, #E2DCCF 50%, #EDE9E0 75%)',
        backgroundSize: '400px 100%',
        animation: 'kassa-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

SkeletonBox.displayName = 'SkeletonBox';

/* ---------- SkeletonText ---------- */

interface SkeletonTextProps {
  width?: string;
  lines?: number;
}

export function SkeletonText({
  width = '100%',
  lines = 1,
}: SkeletonTextProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width,
      }}
    >
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBox
          key={i}
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
          height={14}
          borderRadius="var(--radius-md)"
        />
      ))}
    </div>
  );
}

SkeletonText.displayName = 'SkeletonText';

/* ---------- SkeletonCard ---------- */

export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <SkeletonBox width="40%" height={16} borderRadius="var(--radius-md)" />
      <SkeletonText lines={3} />
      <SkeletonBox width="30%" height={14} borderRadius="var(--radius-md)" />
    </div>
  );
}

SkeletonCard.displayName = 'SkeletonCard';

/* ---------- SkeletonTable ---------- */

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export function SkeletonTable({ rows = 5, cols = 4 }: SkeletonTableProps) {
  const cellStyle: CSSProperties = {
    padding: '12px 16px',
  };

  const headerCellStyle: CSSProperties = {
    ...cellStyle,
    borderBottom: '2px solid var(--color-border)',
  };

  const bodyCellStyle: CSSProperties = {
    ...cellStyle,
    borderBottom: '1px solid var(--color-border)',
  };

  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, c) => (
              <th key={c} style={headerCellStyle}>
                <SkeletonBox
                  width="70%"
                  height={14}
                  borderRadius="var(--radius-md)"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c} style={bodyCellStyle}>
                  <SkeletonBox
                    width="85%"
                    height={14}
                    borderRadius="var(--radius-md)"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

SkeletonTable.displayName = 'SkeletonTable';
