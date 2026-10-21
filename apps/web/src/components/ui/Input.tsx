import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type, id, className, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    const fieldClass = [
      'input-group__field',
      icon && 'input-group__field--has-icon',
      isPassword && 'input-group__field--has-toggle',
      error && 'input-group__field--error',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className="input-group">
        {label && (
          <label htmlFor={inputId} className="input-group__label">
            {label}
          </label>
        )}
        <div className="input-group__wrapper">
          {icon && (
            <span className="input-group__icon">{icon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? 'text' : type}
            className={fieldClass}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="input-group__toggle"
              aria-label={
                showPassword
                  ? 'Masquer le mot de passe'
                  : 'Afficher le mot de passe'
              }
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <span className="input-group__error">{error}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
