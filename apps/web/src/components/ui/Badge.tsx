import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

export function Badge({
  variant,
  size = 'sm',
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`badge badge--${variant} badge--${size}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </span>
  );
}
