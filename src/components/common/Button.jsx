import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Shows loading spinner (alias for isLoading)
 * @param {boolean} isLoading - Shows loading spinner
 * @param {boolean} disabled - Disabled state
 * @param {React.ReactNode} children - Button content
 * @param {React.ReactNode} leftIcon - Icon before text
 * @param {React.ReactNode} rightIcon - Icon after text
 * @param {string} className - Additional classes
 */
function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  disabled = false,
  children,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}) {
  // Support both 'loading' and 'isLoading' props
  const showLoading = loading || isLoading;

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transition-all'
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      type={type}
      disabled={disabled || showLoading}
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      aria-busy={showLoading}
      aria-disabled={disabled || showLoading}
      {...props}
    >
      {showLoading ? (
        <>
          <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
          {children && <span>Loading...</span>}
        </>
      ) : (
        <>
          {leftIcon && <span className={`${iconSizeClasses[size]} inline-flex items-center justify-center`}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={`${iconSizeClasses[size]} inline-flex items-center justify-center`}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

export default Button;
