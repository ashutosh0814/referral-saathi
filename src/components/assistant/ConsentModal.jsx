import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';

/**
 * ConsentModal Component
 * 
 * Displays a one-time consent dialog explaining Gemini API data usage
 * and allows users to opt-in or use rule-based analysis instead.
 */
export default function ConsentModal({ isOpen, onConsent, onDecline }) {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onDecline}
      title="AI-Powered Analysis Consent"
    >
      <div className="space-y-4">
        {/* Main explanation */}
        <div className="text-sm text-slate-700">
          <p className="mb-3">
            ReferralSaathi can use <strong>Google's Gemini AI</strong> to analyze messages 
            and provide intelligent suggestions.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What gets shared with Gemini AI:
            </h4>
            <ul className="text-sm text-amber-800 space-y-1 ml-7">
              <li>• The message text you paste for analysis</li>
              <li>• Basic referral context (company name, job title, status)</li>
              <li>• Your request is authenticated but anonymous to Gemini</li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3">
            <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              What does NOT get shared:
            </h4>
            <ul className="text-sm text-slate-700 space-y-1 ml-7">
              <li>• Your name or email address</li>
              <li>• Your full conversation history</li>
              <li>• Employee contact information</li>
              <li>• Any data you don't explicitly send for analysis</li>
            </ul>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded p-3">
            <strong>Note:</strong> Gemini API (free tier) may use your data to improve 
            Google's services according to{' '}
            <a 
              href="https://ai.google.dev/gemini-api/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 underline"
            >
              Google's API Terms
            </a>. 
            Your data is transmitted securely through our authenticated proxy and is never 
            stored by ReferralSaathi.
          </p>
        </div>

        {/* Alternative option */}
        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-700 mb-3">
            <strong>Prefer privacy?</strong> You can use our rule-based analysis instead, 
            which runs entirely in your browser with no external API calls.
          </p>
        </div>

        {/* Don't ask again checkbox */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dontAskAgain}
            onChange={(e) => setDontAskAgain(e.target.checked)}
            className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700">
            Remember my choice and don't ask again
          </span>
        </label>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => onConsent(dontAskAgain)}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Use AI Analysis
          </Button>
          <Button
            variant="secondary"
            onClick={() => onDecline(dontAskAgain)}
            className="flex-1"
          >
            Use Rule-Based Only
          </Button>
        </div>

        <p className="text-xs text-center text-slate-500">
          You can change this preference anytime in settings
        </p>
      </div>
    </Modal>
  );
}
