import { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal = ({
  open,
  onOpenChange,
  onClose,
  title,
  description,
  children,
  maxWidth = '480px',
}: ModalProps) => {
  const handleOpenChange = (value: boolean) => {
    onOpenChange?.(value);
    if (!value) onClose?.();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal-content"
          style={{ maxWidth }}
        >
          <Dialog.Title className="modal-title">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="modal-description">
              {description}
            </Dialog.Description>
          )}

          <div className="modal-body">{children}</div>

          <Dialog.Close asChild>
            <button aria-label="Fermer" className="modal-close">
              <X size={18} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

Modal.displayName = 'Modal';
