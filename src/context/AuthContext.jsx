import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
  logout as logoutUser
} from '../lib/auth';

/**
 * Authentication Context
 * Provides global authentication state and methods
 */
const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  register: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  sendPasswordReset: async () => {},
  updateUserProfile: async () => {},
  clearError: () => {}
});

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  /**
   * Register new user
   */
  const register = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await registerWithEmail(email, password, displayName);
      
      if (!result.success) {
        setError(result.error);
        return result;
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with email and password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signInWithEmail(email, password);
      
      if (!result.success) {
        setError(result.error);
        return result;
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Google
   */
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signInWithGoogle();
      
      if (!result.success && result.error) {
        setError(result.error);
        return result;
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'Google sign-in failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out
   */
  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await logoutUser();
      
      if (!result.success) {
        setError(result.error);
        return result;
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'Logout failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email
   */
  const sendPasswordReset = async (email) => {
    try {
      setError(null);
      
      const result = await resetPassword(email);
      
      if (!result.success) {
        setError(result.error);
        return result;
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Update user display name
   */
  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(auth.currentUser, updates);
      
      // Update local user state
      setUser(prevUser => ({
        ...prevUser,
        ...updates
      }));
      
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = 'Failed to update profile. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    sendPasswordReset,
    updateUserProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
