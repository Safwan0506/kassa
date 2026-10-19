import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-accent)',
    color: '#FFFFFF',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  danger: {
    backgroundColor: 'var(--color-error)',
    color: '#FFFFFF',
    border: 'none',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted)',
    border: 'none',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: '6px 12px',
    fontSize: 'var(--text-sm)',
    borderRadius: 'var(--radius-sm)',
    gap: '6px',
  },
  md: {
    padding: '10px 20px',
    fontSize: 'var(--text-sm)',
    borderRadius: 'var(--radius-md)',
    gap: '8px',
  },
  lg: {
    padding: '14px 28px',
    fontSize: 'var(--text-base)',
    borderRadius: 'var(--radius-md)',
    gap: '8px',
  },
};

const Spinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="animate-spin"
    style={{ flexShrink: 0 }}
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth="2"
    />
    <path
      d="M14 8a6 6 0 00-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      disabled,
      style,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: `all var(--duration-fast) var(--ease-default)`,
          opacity: isDisabled ? 0.6 : 1,
          whiteSpace: 'nowrap',
          lineHeight: 1,
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            const target = e.currentTarget;
            if (variant === 'primary') {
              target.style.backgroundColor = 'var(--color-accent-hover)';
            } else if (variant === 'secondary') {
              target.style.backgroundColor = 'var(--color-bg-muted)';
            } else if (variant === 'danger') {
              target.style.backgroundColor = '#9C1F17';
            } else if (variant === 'ghost') {
              target.style.backgroundColor = 'var(--color-bg-muted)';
            }
          }
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget;
          target.style.backgroundColor =
            variantStyles[variant].backgroundColor as string;
          onMouseLeave?.(e);
        }}
        {...rest}
      >
        {loading ? <Spinner /> : icon ? icon : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
