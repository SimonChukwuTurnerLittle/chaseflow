import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-5xl',
};

export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
}) {
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus first focusable element in panel
      requestAnimationFrame(() => {
        const focusable = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable?.length) focusable[0].focus();
      });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative w-full mx-4 bg-white rounded-2xl shadow-modal',
          'animate-in fade-in zoom-in-95 duration-200',
          'flex flex-col',
          size === 'xl' ? 'max-h-[90vh]' : 'max-h-[85vh]',
          sizeStyles[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta/50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
