import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  success: {
    backgroundColor: 'rgba(46,125,79,0.1)',
    color: '#2E7D4F',
  },
  warning: {
    backgroundColor: 'rgba(199,119,0,0.1)',
    color: '#C77700',
  },
  error: {
    backgroundColor: 'rgba(179,38,30,0.1)',
    color: '#B3261E',
  },
  neutral: {
    backgroundColor: 'var(--color-bg-muted)',
    color: 'var(--color-text-muted)',
  },
  info: {
    backgroundColor: 'rgba(18,97,79,0.08)',
    color: 'var(--color-accent)',
  },
};

const sizeStyles: Record<BadgeSize, CSSProperties> = {
  sm: {
    padding: '2px 8px',
    fontSize: 'var(--text-xs)',
  },
  md: {
    padding: '4px 12px',
    fontSize: 'var(--text-sm)',
  },
};

export function Badge({
  variant,
  size = 'sm',
  children,
  style,
  ...rest
}: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        borderRadius: 'var(--radius-full)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
