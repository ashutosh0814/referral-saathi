/**
 * ReplyAssistantPage
 * Dedicated page for AI-powered reply assistance
 * Helps users craft professional responses to employee messages
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeft, 
  MessageSquare, 
  Copy, 
  Check,
  RefreshCw,
  AlertCircle,
  FileText,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getReferrals } from '../lib/firestore';
import Button from '../components/common/Button';
import { analyzeMessageWithAI, isAIAvailable, getErrorMessage, GeminiError } from '../lib/gemini';
import { analyzeMessage } from '../lib/replyRules';
import { 
  needsConsent, 
  hasAIConsent, 
  grantAIConsent, 
  declineAIConsent,
  getPreferredMode 
} from '../lib/consentManager';
import ConsentModal from '../components/assistant/ConsentModal';

function ReplyAssistantPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const referralIdFromUrl = searchParams.get('referralId');

  // State
  const [referrals, setReferrals] = useState([]);
  const [selectedReferralId, setSelectedReferralId] = useState(referralIdFromUrl || '');
  const [employeeMessage, setEmployeeMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [suggestedReply, setSuggestedReply] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [copiedReply, setCopiedReply] = useState(false);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Load referrals on mount
  useEffect(() => {
    const loadReferrals = async () => {
      if (!user) return;

      try {
        const result = await getReferrals(user.uid, {
          limitCount: 100,
          sortBy: 'updatedAt'
        });

        if (result.success) {
          // Filter active referrals
          const activeRefs = result.data.filter(r => 
            !['successful', 'rejected', 'closed'].includes(r.status)
          );
          setReferrals(activeRefs);
        }
      } catch (error) {
        console.error('Error loading referrals:', error);
      }
    };

    loadReferrals();
  }, [user]);

  const handleAnalyze = async () => {
    if (!employeeMessage.trim()) {
      setError('Please enter the employee\'s message');
      return;
    }

    // Check if we need consent for AI analysis
    const preferredMode = getPreferredMode();
    const shouldUseAI = preferredMode === 'ai' || (preferredMode === null && needsConsent());
    
    if (shouldUseAI && needsConsent()) {
      setShowConsentModal(true);
      return;
    }

    performAnalysis(preferredMode || 'rules');
  };

  const performAnalysis = async (mode) => {
    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);
    setSuggestedReply('');

    try {
      // Get selected referral context
      const selectedReferral = referrals.find(r => r.id === selectedReferralId);
      const context = selectedReferral ? {
        companyName: selectedReferral.companyName,
        jobTitle: selectedReferral.jobTitle,
        employeeName: selectedReferral.employeeName,
        status: selectedReferral.status
      } : null;

      let result;
      if (mode === 'ai' && hasAIConsent()) {
        // Use AI analysis
        result = await analyzeMessageWithAI(employeeMessage, context);
      } else {
        // Use rules-based analysis
        result = analyzeMessage(employeeMessage);
      }

      if (result.success) {
        setAnalysis({
          sentiment: result.sentiment,
          intent: result.intent,
          urgency: result.urgency,
          suggestedActions: result.suggestedActions || [],
          keyPoints: result.keyPoints || []
        });
        setSuggestedReply(result.suggestedReply || '');
      } else {
        setError(result.error || 'Failed to analyze message');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConsent = (rememberChoice) => {
    if (rememberChoice) {
      grantAIConsent();
    }
    setShowConsentModal(false);
    performAnalysis('ai');
  };

  const handleDeclineConsent = (rememberChoice) => {
    if (rememberChoice) {
      declineAIConsent();
    }
    setShowConsentModal(false);
    performAnalysis('rules');
  };

  const handleCopyReply = async () => {
    try {
      await navigator.clipboard.writeText(suggestedReply);
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAnalysis = async () => {
    if (!analysis) return;

    const analysisText = `
Sentiment: ${analysis.sentiment}
Intent: ${analysis.intent}
Urgency: ${analysis.urgency}

Key Points:
${analysis.keyPoints?.map(point => `• ${point}`).join('\n') || 'None'}

Suggested Actions:
${analysis.suggestedActions?.map(action => `• ${action}`).join('\n') || 'None'}
    `.trim();

    try {
      await navigator.clipboard.writeText(analysisText);
      setCopiedAnalysis(true);
      setTimeout(() => setCopiedAnalysis(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReset = () => {
    setEmployeeMessage('');
    setAnalysis(null);
    setSuggestedReply('');
    setError('');
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'negative':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'neutral':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onConsent={handleConsent}
        onDecline={handleDeclineConsent}
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Reply Assistant
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                AI-powered help to craft perfect responses
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Referral Selection */}
            <div className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-200 mb-3">
                <FileText className="inline w-4 h-4 mr-2" />
                Select Referral (Optional)
              </label>
              <select
                value={selectedReferralId}
                onChange={(e) => setSelectedReferralId(e.target.value)}
                className="w-full px-4 py-3 bg-[#121212] border border-[#282828] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              >
                <option value="">None - General reply</option>
                {referrals.map(ref => (
                  <option key={ref.id} value={ref.id}>
                    {ref.companyName} - {ref.jobTitle}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-2">
                Selecting a referral provides context for better suggestions
              </p>
            </div>

            {/* Employee Message Input */}
            <div className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-200 mb-3">
                <MessageSquare className="inline w-4 h-4 mr-2" />
                Employee's Message
              </label>
              <textarea
                value={employeeMessage}
                onChange={(e) => setEmployeeMessage(e.target.value)}
                placeholder="Paste the employee's message here..."
                className="w-full px-4 py-3 bg-[#121212] border border-[#282828] text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                rows={12}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">
                  {employeeMessage.length} characters
                </p>
                {employeeMessage && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={!employeeMessage.trim() || isAnalyzing}
                loading={isAnalyzing}
                leftIcon={<Zap className="w-4 h-4" />}
                className="flex-1"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze & Generate Reply'}
              </Button>
              {(analysis || suggestedReply) && (
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-400 font-medium">Analysis Failed</p>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Analysis Results */}
            {analysis && (
              <div className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Analysis</h3>
                  <button
                    onClick={handleCopyAnalysis}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    {copiedAnalysis ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Sentiment & Urgency */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Sentiment</p>
                      <div className={`inline-block px-3 py-1.5 rounded-lg border text-sm font-medium ${getSentimentColor(analysis.sentiment)}`}>
                        {analysis.sentiment}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Urgency</p>
                      <div className={`inline-block px-3 py-1.5 rounded-lg border text-sm font-medium ${getUrgencyColor(analysis.urgency)}`}>
                        {analysis.urgency}
                      </div>
                    </div>
                  </div>

                  {/* Intent */}
                  {analysis.intent && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Intent</p>
                      <p className="text-sm text-white bg-[#121212] p-3 rounded-lg">
                        {analysis.intent}
                      </p>
                    </div>
                  )}

                  {/* Key Points */}
                  {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Key Points</p>
                      <ul className="space-y-2">
                        {analysis.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-200">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Suggested Actions</p>
                      <ul className="space-y-2">
                        {analysis.suggestedActions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-200">
                            <span className="text-blue-500 mt-1">→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggested Reply */}
            {suggestedReply && (
              <div className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Suggested Reply</h3>
                  <button
                    onClick={handleCopyReply}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    {copiedReply ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#121212] border border-[#282828] rounded-lg p-4">
                  <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                    {suggestedReply}
                  </p>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  💡 Tip: Review and personalize this reply before sending
                </p>
              </div>
            )}

            {/* Empty State */}
            {!analysis && !suggestedReply && !isAnalyzing && (
              <div className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  Paste an employee's message and click "Analyze" to get AI-powered insights and a suggested reply.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-blue-400 mb-3">How Reply Assistant Works</h4>
          <ul className="space-y-2 text-sm text-blue-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">1.</span>
              <span>Optionally select a referral to provide context about the job and company</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">2.</span>
              <span>Paste the employee's message you received (email, LinkedIn, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">3.</span>
              <span>Get instant analysis of sentiment, intent, and urgency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">4.</span>
              <span>Receive a professionally crafted reply suggestion</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">5.</span>
              <span>Copy, customize, and send your response with confidence</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ReplyAssistantPage;
