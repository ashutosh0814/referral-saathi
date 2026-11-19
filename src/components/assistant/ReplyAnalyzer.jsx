/**
 * ReplyAnalyzer Component
 * Input area for pasting employee responses and triggering analysis
 * Supports both AI-powered and rule-based analysis modes
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, Zap, Book } from 'lucide-react';
import Button from '../common/Button';
import { analyzeMessage } from '../../lib/replyRules';
import { analyzeMessageWithAI, isAIAvailable, getErrorMessage, GeminiError } from '../../lib/gemini';
import ConsentModal from './ConsentModal';
import { 
  needsConsent, 
  hasAIConsent, 
  grantAIConsent, 
  declineAIConsent,
  getPreferredMode 
} from '../../lib/consentManager';

function ReplyAnalyzer({ onAnalysisComplete, referralContext }) {
  const [message, setMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('rules'); // 'ai' or 'rules'
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);

  // Initialize mode based on stored preferences
  useEffect(() => {
    const available = isAIAvailable();
    setAiAvailable(available);

    if (available) {
      const preferredMode = getPreferredMode();
      if (preferredMode === 'ai' && hasAIConsent()) {
        setAnalysisMode('ai');
      }
    }
  }, []);

  const handleAnalyze = async () => {
    // Clear previous error
    setError(null);

    // Validate input
    if (!message.trim()) {
      setError('Please paste or type the employee\'s message first.');
      return;
    }

    if (message.trim().length < 5) {
      setError('Message is too short to analyze. Please provide more context.');
      return;
    }

    // If AI mode is selected but no consent yet, show consent modal
    if (analysisMode === 'ai' && needsConsent()) {
      setShowConsentModal(true);
      return;
    }

    // Start analysis
    setIsAnalyzing(true);
    setError(null);

    try {
      let result;

      if (analysisMode === 'ai') {
        // Try AI analysis
        try {
          result = await analyzeMessageWithAI(message, referralContext);
          result.source = 'ai';
        } catch (aiError) {
          console.error('AI analysis failed:', aiError);
          
          // Show error to user
          const errorMsg = getErrorMessage(aiError);
          setError(`AI analysis failed: ${errorMsg}. Falling back to rule-based analysis...`);
          
          // Fallback to rules
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = analyzeMessage(message);
          result.source = 'rules-fallback';
        }
      } else {
        // Use rule-based analysis
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
        result = analyzeMessage(message);
        result.source = 'rules';
      }

      onAnalysisComplete(result, message);
      setIsAnalyzing(false);

    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze message. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setMessage('');
    setError(null);
  };

  const handleKeyDown = (e) => {
    // Allow Ctrl+Enter or Cmd+Enter to trigger analysis
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleModeChange = (mode) => {
    setAnalysisMode(mode);
    setError(null);
  };

  const handleConsent = (rememberChoice) => {
    if (rememberChoice) {
      grantAIConsent();
    }
    setShowConsentModal(false);
    setAnalysisMode('ai');
    // Automatically trigger analysis after consent
    handleAnalyze();
  };

  const handleDeclineConsent = (rememberChoice) => {
    if (rememberChoice) {
      declineAIConsent();
    }
    setShowConsentModal(false);
    setAnalysisMode('rules');
    // Automatically trigger analysis with rules
    handleAnalyze();
  };

  const characterCount = message.length;
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onConsent={handleConsent}
        onDecline={handleDeclineConsent}
      />

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Reply Assistant
          </h3>
          <p className="text-sm text-gray-600">
            Paste the employee's response below to get intent analysis and suggested replies.
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      {aiAvailable && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <label className="block text-xs font-medium text-slate-700 mb-2">
            Analysis Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange('ai')}
              disabled={isAnalyzing}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                analysisMode === 'ai'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
            </button>
            <button
              onClick={() => handleModeChange('rules')}
              disabled={isAnalyzing}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                analysisMode === 'rules'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Book className="w-4 h-4" />
                <span>Rule-Based</span>
              </div>
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {analysisMode === 'ai' 
              ? '🤖 AI mode uses Gemini for intelligent analysis (requires consent)'
              : '📋 Rule-based mode uses pattern matching (runs locally, no API calls)'}
          </p>
        </div>
      )}

      {/* Input Area */}
      <div className="mb-4">
        <label htmlFor="employee-message" className="block text-sm font-medium text-gray-700 mb-2">
          Employee's Message
        </label>
        <textarea
          id="employee-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnalyzing}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors min-h-[140px] resize-y ${
            error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-200 bg-white'
          } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="Paste the employee's message here...&#10;&#10;Example: 'Sure, I'd be happy to help! Can you send me your resume?'"
        />

        {/* Character/Word Count */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500">
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {characterCount} {characterCount === 1 ? 'character' : 'characters'}
          </div>
          
          {/* Keyboard Shortcut Hint */}
          {message.trim() && (
            <div className="text-xs text-gray-400">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-600">Ctrl+Enter</kbd> to analyze
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !message.trim()}
          isLoading={isAnalyzing}
          leftIcon={!isAnalyzing && (analysisMode === 'ai' ? <Zap className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />)}
          className="flex-1"
        >
          {isAnalyzing 
            ? 'Analyzing...' 
            : analysisMode === 'ai' 
              ? 'Analyze with AI' 
              : 'Analyze Response'}
        </Button>

        {message.trim() && !isAnalyzing && (
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={isAnalyzing}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Tips */}
      {!message.trim() && (
        <div className="mt-4 p-4 bg-violet-50 border border-violet-100 rounded-lg">
          <h4 className="text-sm font-medium text-violet-900 mb-2">
            💡 {analysisMode === 'ai' ? 'AI Analysis Tips:' : 'Tips for best results:'}
          </h4>
          <ul className="text-sm text-violet-700 space-y-1">
            <li>• Paste the complete message from the employee</li>
            <li>• Include the full context for accurate detection</li>
            <li>• Works best with messages longer than 5 words</li>
            {analysisMode === 'ai' ? (
              <>
                <li>• AI provides deeper insights and context-aware suggestions</li>
                <li>• Requires internet connection and consent to use Gemini API</li>
              </>
            ) : (
              <li>• Detects 12 different intents automatically using pattern matching</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ReplyAnalyzer;
