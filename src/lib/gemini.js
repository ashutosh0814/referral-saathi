/**
 * Gemini AI Integration Module
 * 
 * Handles secure communication with the Cloudflare Worker proxy
 * for Gemini API analysis with Firebase authentication.
 */

import { auth } from './firebase';

const WORKER_URL = import.meta.env.VITE_AI_WORKER_URL;
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Error types for better error handling
 */
export class GeminiError extends Error {
  constructor(message, type = 'UNKNOWN', details = null) {
    super(message);
    this.name = 'GeminiError';
    this.type = type;
    this.details = details;
  }
}

/**
 * Get the current user's Firebase ID token
 */
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new GeminiError('User not authenticated', 'AUTH_REQUIRED');
  }

  try {
    return await user.getIdToken();
  } catch (error) {
    throw new GeminiError('Failed to get authentication token', 'AUTH_FAILED', error);
  }
}

/**
 * Validate worker URL is configured
 */
function validateConfig() {
  if (!WORKER_URL || WORKER_URL.includes('your-worker')) {
    throw new GeminiError(
      'AI Worker URL not configured. Please check your .env file.',
      'CONFIG_ERROR'
    );
  }
}

/**
 * Validate Gemini API response structure
 */
function validateResponse(data) {
  const requiredFields = [
    'intent',
    'confidence',
    'evidence',
    'recommendedAction',
    'suggestedReply',
    'followUpDays'
  ];

  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    throw new GeminiError(
      `Invalid API response: missing fields ${missingFields.join(', ')}`,
      'INVALID_RESPONSE',
      { missingFields }
    );
  }

  // Validate data types
  if (typeof data.intent !== 'string' || data.intent.length === 0) {
    throw new GeminiError('Invalid intent value', 'INVALID_RESPONSE');
  }

  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 100) {
    throw new GeminiError('Invalid confidence value', 'INVALID_RESPONSE');
  }

  if (typeof data.suggestedReply !== 'string') {
    throw new GeminiError('Invalid suggestedReply value', 'INVALID_RESPONSE');
  }

  return true;
}

/**
 * Analyze a message using Gemini AI via Cloudflare Worker
 * 
 * @param {string} message - The message to analyze
 * @param {Object} context - Additional context for analysis
 * @param {string} context.referralStatus - Current referral status
 * @param {string} context.companyName - Company name
 * @param {string} context.jobTitle - Job title
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeMessageWithAI(message, context = {}) {
  // Validate configuration
  validateConfig();

  // Get auth token
  const token = await getAuthToken();

  // Prepare request payload (minimal data)
  const payload = {
    message: message.trim(),
    context: {
      referralStatus: context.referralStatus || 'unknown',
      companyName: context.companyName || '',
      jobTitle: context.jobTitle || ''
    }
  };

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${WORKER_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      switch (response.status) {
        case 401:
          throw new GeminiError('Authentication failed', 'AUTH_FAILED', errorData);
        case 403:
          throw new GeminiError('Access forbidden', 'FORBIDDEN', errorData);
        case 429:
          throw new GeminiError('Too many requests. Please try again later.', 'RATE_LIMIT', errorData);
        case 500:
          throw new GeminiError('Server error. Please try again.', 'SERVER_ERROR', errorData);
        default:
          throw new GeminiError(
            errorData.error || 'Failed to analyze message',
            'API_ERROR',
            errorData
          );
      }
    }

    // Parse response
    const data = await response.json();

    // Validate response structure
    validateResponse(data);

    return {
      success: true,
      source: 'ai',
      ...data
    };

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (error.name === 'AbortError') {
      throw new GeminiError(
        'Request timed out. Please try again.',
        'TIMEOUT'
      );
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new GeminiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        error
      );
    }

    // Re-throw GeminiError instances
    if (error instanceof GeminiError) {
      throw error;
    }

    // Wrap unknown errors
    throw new GeminiError(
      'An unexpected error occurred',
      'UNKNOWN',
      error
    );
  }
}

/**
 * Check if AI analysis is available
 * 
 * @returns {boolean} True if AI is properly configured
 */
export function isAIAvailable() {
  try {
    validateConfig();
    return !!auth.currentUser;
  } catch {
    return false;
  }
}

/**
 * Get user-friendly error message
 * 
 * @param {GeminiError} error - The error object
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
  if (!(error instanceof GeminiError)) {
    return 'An unexpected error occurred. Please try again.';
  }

  switch (error.type) {
    case 'AUTH_REQUIRED':
      return 'Please sign in to use AI analysis.';
    case 'AUTH_FAILED':
      return 'Authentication failed. Please sign in again.';
    case 'CONFIG_ERROR':
      return 'AI analysis is not configured. Please contact support.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection and try again.';
    case 'TIMEOUT':
      return 'Request timed out. Please try again.';
    case 'RATE_LIMIT':
      return 'Too many requests. Please wait a moment and try again.';
    case 'SERVER_ERROR':
      return 'Server error. Please try again in a moment.';
    case 'INVALID_RESPONSE':
      return 'Received invalid response from AI. Please try again.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
}
