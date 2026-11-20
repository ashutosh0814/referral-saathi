import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, AlertCircle, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { user, login, register, loginWithGoogle, sendPasswordReset, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    clearError();
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (mode === 'reset') {
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Registration-specific validation
    if (mode === 'register') {
      if (!formData.displayName) {
        errors.displayName = 'Name is required';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'reset') {
        const result = await sendPasswordReset(formData.email);
        if (result.success) {
          setResetEmailSent(true);
        }
      } else if (mode === 'register') {
        const result = await register(formData.email, formData.password, formData.displayName);
        if (result.success) {
          navigate('/dashboard');
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    clearError();
    setIsSubmitting(true);
    
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch mode
  const switchMode = (newMode) => {
    setMode(newMode);
    setFormErrors({});
    setResetEmailSent(false);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20 mb-4 sm:mb-5">
            <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            ReferralSaathi
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            {mode === 'reset' 
              ? 'Reset your password' 
              : mode === 'register'
              ? 'Create your account'
              : 'Welcome back'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="card p-5 sm:p-8 shadow-lg">
          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Success Message for Password Reset */}
          {resetEmailSent && (
            <div className="alert alert-success mb-6">
              <p className="leading-relaxed">
                Password reset email sent! Check your inbox.
              </p>
            </div>
          )}

          {/* Google Sign In */}
          {mode !== 'reset' && (
            <>
              <Button
                type="button"
                variant="secondary"
                className="w-full mb-6"
                leftIcon={<Chrome />}
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
              >
                Continue with Google
              </Button>

              <div className="relative my-6 sm:my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-amber-50/80 text-gray-500 font-medium">Or continue with email</span>
                </div>
              </div>
            </>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="label">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`input pl-12 ${formErrors.displayName ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.displayName && (
                  <p className="input-error-message">{formErrors.displayName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="label">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`input pl-12 ${formErrors.email ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {formErrors.email && (
                <p className="input-error-message">{formErrors.email}</p>
              )}
            </div>

            {/* Password (Not for reset) */}
            {mode !== 'reset' && (
              <div>
                <label className="label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input pl-12 ${formErrors.password ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.password && (
                  <p className="input-error-message">{formErrors.password}</p>
                )}
              </div>
            )}

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="label">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input pl-12 ${formErrors.confirmPassword ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="input-error-message">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Forgot Password Link */}
            {mode === 'login' && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {mode === 'reset' 
                  ? 'Send Reset Email' 
                  : mode === 'register'
                  ? 'Create Account'
                  : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 sm:mt-8 text-center">
            {mode === 'reset' ? (
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            ) : mode === 'register' ? (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs text-gray-500 leading-relaxed px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
