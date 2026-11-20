import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import {
  getPreferences,
  savePreferences,
  getDateFormatPreference,
  getAIModePreference
} from '../../lib/preferencesManager';
import {
  getConsentPreferences,
  setPreferredMode,
  clearConsent
} from '../../lib/consentManager';

/**
 * Preferences Component
 * Allows users to configure app preferences
 */
export default function Preferences() {
  const [preferences, setPreferences] = useState(getPreferences());
  const [consent, setConsent] = useState(getConsentPreferences());
  const [message, setMessage] = useState(null);

  // Load preferences on mount
  useEffect(() => {
    setPreferences(getPreferences());
    setConsent(getConsentPreferences());
  }, []);

  const handleDateFormatChange = (format) => {
    savePreferences({ dateFormat: format });
    setPreferences({ ...preferences, dateFormat: format });
    showSuccessMessage('Date format updated');
  };

  const handleAIModeChange = (mode) => {
    savePreferences({ aiMode: mode });
    setPreferences({ ...preferences, aiMode: mode });

    // Also update consent manager if mode is explicit
    if (mode === 'ai') {
      setPreferredMode('ai');
      setConsent(getConsentPreferences());
    } else if (mode === 'rules') {
      setPreferredMode('rules');
      setConsent(getConsentPreferences());
    }

    showSuccessMessage('AI mode preference updated');
  };

  const handleResetConsent = () => {
    if (window.confirm('Are you sure you want to reset your AI consent? You will be asked again when using AI features.')) {
      clearConsent();
      setConsent(null);
      savePreferences({ aiMode: 'auto' });
      setPreferences({ ...preferences, aiMode: 'auto' });
      showSuccessMessage('AI consent reset');
    }
  };

  const showSuccessMessage = (text) => {
    setMessage({ type: 'success', text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-amber-50/40 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        <Settings className="inline w-5 h-5 mr-2" />
        Preferences
      </h2>

      <div className="space-y-6">
        {/* Date Format Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Date Display Format
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="dateFormat"
                value="relative"
                checked={preferences.dateFormat === 'relative'}
                onChange={() => handleDateFormatChange('relative')}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Relative dates</div>
                <div className="text-xs text-gray-500">
                  e.g., "2 days ago", "in 3 hours"
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="dateFormat"
                value="absolute"
                checked={preferences.dateFormat === 'absolute'}
                onChange={() => handleDateFormatChange('absolute')}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Absolute dates</div>
                <div className="text-xs text-gray-500">
                  e.g., "Nov 19, 2026", "Nov 19, 2026 14:30"
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* AI Mode Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Sparkles className="inline w-4 h-4 mr-1" />
            AI Assistant Mode
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="aiMode"
                value="auto"
                checked={preferences.aiMode === 'auto'}
                onChange={() => handleAIModeChange('auto')}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Ask me each time</div>
                <div className="text-xs text-gray-500">
                  Show consent modal when using AI features
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="aiMode"
                value="ai"
                checked={preferences.aiMode === 'ai'}
                onChange={() => handleAIModeChange('ai')}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Always use AI</div>
                <div className="text-xs text-gray-500">
                  Use Gemini AI for reply analysis (shares data with Google)
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="aiMode"
                value="rules"
                checked={preferences.aiMode === 'rules'}
                onChange={() => handleAIModeChange('rules')}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Rules-based only</div>
                <div className="text-xs text-gray-500">
                  Use local pattern matching (no data sharing)
                </div>
              </div>
            </label>
          </div>

          {/* Current Consent Status */}
          {consent && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Current consent: {consent.mode === 'ai' ? 'AI enabled' : 'Rules only'}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    Granted {new Date(consent.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleResetConsent}
                className="mt-2 text-xs text-blue-700 hover:text-blue-800 underline"
              >
                Reset consent
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {message && message.type === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">About AI Features</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• AI mode uses Google Gemini to analyze conversations</li>
            <li>• Message content is sent to Google's API for analysis</li>
            <li>• Rules mode works completely offline with pattern matching</li>
            <li>• You can change your preference at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
