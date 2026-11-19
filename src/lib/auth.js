import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

/**
 * Parse Firebase Auth errors into user-friendly messages
 */
const getAuthErrorMessage = (error) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in cancelled. Please try again.',
    'auth/popup-blocked': 'Pop-up blocked by browser. Please allow pop-ups for this site.'
  };

  return errorMessages[error.code] || error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Register a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} displayName - User's display name
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const registerWithEmail = async (email, password, displayName) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });
    }

    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.email.split('@')[0]
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error)
    };
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || userCredential.user.email.split('@')[0]
      }
    };
  } catch (error) {
    console.error('Sign-in error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error)
    };
  }
};

/**
 * Sign in with Google
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email.split('@')[0],
        photoURL: result.user.photoURL
      }
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    // Don't show error if user just closed the popup
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return {
        success: false,
        error: null // Silent fail for cancelled popups
      };
    }
    
    return {
      success: false,
      error: getAuthErrorMessage(error)
    };
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error)
    };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Failed to sign out. Please try again.'
    };
  }
};

/**
 * Get the current authenticated user
 * @returns {object|null} Current user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Update user profile
 * @param {object} updates - Profile updates (displayName, photoURL)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    await updateProfile(user, updates);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      error: 'Failed to update profile. Please try again.'
    };
  }
};

/**
 * Re-authenticate user with email and password
 * @param {string} password - User's current password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const reauthenticateUser = async (password) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user');
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Re-authentication error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error)
    };
  }
};

export default {
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
  logout,
  getCurrentUser,
  updateUserProfile,
  reauthenticateUser
};
