import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  className,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200",
          maxWidth,
          className
        )}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
              {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const Dialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
    <p className="text-sm text-slate-600 mb-6">{message}</p>
    <div className="flex items-center justify-end gap-3">
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
        {confirmText}
      </Button>
    </div>
  </Modal>
);
