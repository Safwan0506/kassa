import './Skeleton.css';

/* ---------- SkeletonBox ---------- */

interface SkeletonBoxProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export function SkeletonBox({
  width = '100%',
  height = '100%',
  borderRadius,
  className,
}: SkeletonBoxProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-box${className ? ` ${className}` : ''}`}
      style={{ width, height, borderRadius }}
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
    <div className="skeleton-text" style={{ width }}>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBox
          key={i}
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
          height={14}
        />
      ))}
    </div>
  );
}

SkeletonText.displayName = 'SkeletonText';

/* ---------- SkeletonCard ---------- */

export function SkeletonCard() {
  return (
    <div aria-hidden="true" className="skeleton-card">
      <SkeletonBox width="40%" height={16} />
      <SkeletonText lines={3} />
      <SkeletonBox width="30%" height={14} />
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
  return (
    <div aria-hidden="true" className="skeleton-table">
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, c) => (
              <th key={c}>
                <SkeletonBox width="70%" height={14} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}>
                  <SkeletonBox width="85%" height={14} />
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
