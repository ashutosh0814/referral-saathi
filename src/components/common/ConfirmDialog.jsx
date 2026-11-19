import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * Reusable Confirmation Dialog Component
 * 
 * @param {boolean} isOpen - Controls dialog visibility
 * @param {function} onClose - Close handler
 * @param {function} onConfirm - Confirm action handler
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {string} confirmLabel - Confirm button text
 * @param {string} cancelLabel - Cancel button text
 * @param {string} variant - 'danger' | 'warning' | 'info'
 * @param {boolean} isLoading - Loading state for confirm button
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false
}) {
  const iconClasses = {
    danger: 'text-red-600 bg-red-50',
    warning: 'text-amber-600 bg-amber-50',
    info: 'text-blue-600 bg-blue-50'
  };

  const buttonVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${iconClasses[variant]} flex items-center justify-center`}>
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-600 mb-0">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
