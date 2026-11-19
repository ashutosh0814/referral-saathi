import React from 'react';

/**
 * Reusable Badge Component
 * 
 * @param {string} variant - 'default' | 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'primary'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} children - Badge content
 * @param {React.ReactNode} icon - Optional icon before text
 * @param {string} className - Additional classes
 */
function Badge({
  variant = 'default',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}) {
  const baseClasses = 'inline-flex items-center gap-1 font-medium rounded-lg whitespace-nowrap';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    neutral: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    primary: 'bg-violet-100 text-violet-700'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && <span className={`${iconSizeClasses[size]} inline-flex items-center justify-center flex-shrink-0`}>{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
