import React from 'react';
import Button from './Button';

/**
 * Reusable Empty State Component
 * 
 * @param {React.ReactNode} icon - Icon to display
 * @param {string} title - Empty state title
 * @param {string} description - Empty state description
 * @param {string} actionLabel - Primary action button label
 * @param {function} onAction - Primary action handler
 * @param {string} secondaryActionLabel - Secondary action button label
 * @param {function} onSecondaryAction - Secondary action handler
 */
function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon */}
      {icon && (
        <div className="w-16 h-16 mb-4 text-gray-400 flex items-center justify-center bg-[#282828] rounded-full">
          {icon}
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-white mb-2">
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-300 mb-6 max-w-md">
          {description}
        </p>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="ghost" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
