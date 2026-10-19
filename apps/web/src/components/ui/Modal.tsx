import { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(28,31,29,0.4)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  animation: 'modal-overlay-fade-in var(--duration-normal) var(--ease-default)',
};

const contentBaseStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'var(--color-bg-surface)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  maxHeight: '85vh',
  overflowY: 'auto',
  width: 'calc(100% - 32px)',
  boxShadow: 'var(--shadow-lg)',
  animation: 'modal-content-fade-in var(--duration-normal) var(--ease-default)',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--text-xl)',
  fontWeight: 600,
  color: 'var(--color-text)',
  margin: 0,
  paddingRight: '32px',
};

const descriptionStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-body)',
  margin: 0,
  marginTop: '4px',
  lineHeight: 1.5,
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  padding: 0,
  transition: `background-color var(--duration-normal) var(--ease-default), color var(--duration-normal) var(--ease-default)`,
};

const keyframesInjected = typeof document !== 'undefined' && (() => {
  const id = 'modal-keyframes';
  if (document.getElementById(id)) return true;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    @keyframes modal-overlay-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modal-content-fade-in {
      from { opacity: 0; transform: translate(-50%, -48%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }
  `;
  document.head.appendChild(style);
  return true;
})();

// Ensure the variable is referenced so it is not tree-shaken.
void keyframesInjected;

export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = '480px',
}: ModalProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay style={overlayStyle} />
      <Dialog.Content
        style={{
          ...contentBaseStyle,
          maxWidth,
        }}
      >
        <Dialog.Title style={titleStyle}>{title}</Dialog.Title>
        {description && (
          <Dialog.Description style={descriptionStyle}>
            {description}
          </Dialog.Description>
        )}

        <div style={{ marginTop: '20px' }}>{children}</div>

        <Dialog.Close asChild>
          <button
            aria-label="Fermer"
            style={closeButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg)';
              e.currentTarget.style.color = 'var(--color-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            <X size={18} />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

Modal.displayName = 'Modal';
