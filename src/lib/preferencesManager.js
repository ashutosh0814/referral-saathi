/**
 * Preferences Manager
 * 
 * Manages user preferences (non-authentication)
 * Stored in localStorage
 */

const PREFERENCES_KEY = 'referralsaathi_preferences';

/**
 * User preferences structure
 * @typedef {Object} UserPreferences
 * @property {string} dateFormat - 'relative' | 'absolute'
 * @property {string} aiMode - 'ai' | 'rules' | 'auto'
 * @property {string} theme - 'light' | 'dark' | 'system' (future)
 */

const DEFAULT_PREFERENCES = {
  dateFormat: 'relative',
  aiMode: 'auto', // auto = show consent modal when needed
  theme: 'light'
};

/**
 * Get stored preferences
 * @returns {UserPreferences}
 */
export function getPreferences() {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return { ...DEFAULT_PREFERENCES };

    const prefs = JSON.parse(stored);
    return { ...DEFAULT_PREFERENCES, ...prefs };
  } catch (error) {
    console.error('Failed to read preferences:', error);
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Save preferences
 * @param {Partial<UserPreferences>} prefs
 */
export function savePreferences(prefs) {
  try {
    const current = getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to save preferences:', error);
    return false;
  }
}

/**
 * Get date format preference
 * @returns {'relative'|'absolute'}
 */
export function getDateFormatPreference() {
  return getPreferences().dateFormat;
}

/**
 * Set date format preference
 * @param {'relative'|'absolute'} format
 */
export function setDateFormatPreference(format) {
  return savePreferences({ dateFormat: format });
}

/**
 * Get AI mode preference
 * @returns {'ai'|'rules'|'auto'}
 */
export function getAIModePreference() {
  return getPreferences().aiMode;
}

/**
 * Set AI mode preference
 * @param {'ai'|'rules'|'auto'} mode
 */
export function setAIModePreference(mode) {
  return savePreferences({ aiMode: mode });
}

/**
 * Clear all preferences
 */
export function clearPreferences() {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear preferences:', error);
    return false;
  }
}
