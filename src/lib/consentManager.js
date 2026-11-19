/**
 * Consent Manager
 * 
 * Manages user consent for Gemini AI data sharing
 * Stores preferences in localStorage
 */

const CONSENT_KEY = 'referralsaathi_ai_consent';
const CONSENT_VERSION = '1.0'; // Increment if terms change

/**
 * Consent preferences structure
 * @typedef {Object} ConsentPreferences
 * @property {boolean} granted - Whether consent is granted
 * @property {string} version - Version of consent terms
 * @property {number} timestamp - When consent was given
 * @property {string} mode - 'ai' or 'rules' - preferred analysis mode
 */

/**
 * Get stored consent preferences
 * @returns {ConsentPreferences|null}
 */
export function getConsentPreferences() {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    const prefs = JSON.parse(stored);
    
    // Check if consent is for current version
    if (prefs.version !== CONSENT_VERSION) {
      // Terms changed, need new consent
      return null;
    }

    return prefs;
  } catch (error) {
    console.error('Failed to read consent preferences:', error);
    return null;
  }
}

/**
 * Check if user has given consent for AI analysis
 * @returns {boolean}
 */
export function hasAIConsent() {
  const prefs = getConsentPreferences();
  return prefs?.granted && prefs?.mode === 'ai';
}

/**
 * Check if user needs to be asked for consent
 * @returns {boolean}
 */
export function needsConsent() {
  return getConsentPreferences() === null;
}

/**
 * Store consent preference
 * @param {boolean} granted - Whether consent is granted
 * @param {string} mode - 'ai' or 'rules'
 */
export function setConsent(granted, mode = 'ai') {
  try {
    const prefs = {
      granted,
      mode,
      version: CONSENT_VERSION,
      timestamp: Date.now()
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    return true;
  } catch (error) {
    console.error('Failed to store consent preferences:', error);
    return false;
  }
}

/**
 * Grant AI consent
 */
export function grantAIConsent() {
  return setConsent(true, 'ai');
}

/**
 * Decline AI consent (use rules-based only)
 */
export function declineAIConsent() {
  return setConsent(false, 'rules');
}

/**
 * Clear consent preferences (user will be asked again)
 */
export function clearConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear consent preferences:', error);
    return false;
  }
}

/**
 * Get preferred analysis mode
 * @returns {'ai'|'rules'|null}
 */
export function getPreferredMode() {
  const prefs = getConsentPreferences();
  return prefs?.mode || null;
}

/**
 * Update preferred mode (requires existing consent)
 * @param {'ai'|'rules'} mode
 */
export function setPreferredMode(mode) {
  const prefs = getConsentPreferences();
  if (!prefs) {
    // No existing consent, can't update
    return false;
  }

  prefs.mode = mode;
  prefs.granted = (mode === 'ai');
  
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    return true;
  } catch (error) {
    console.error('Failed to update preferred mode:', error);
    return false;
  }
}
