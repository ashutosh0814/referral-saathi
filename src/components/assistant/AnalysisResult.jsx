/**
 * AnalysisResult Component
 * Displays detected intent, confidence, evidence, and recommended next action
 * Supports both AI and rule-based analysis results with source indicators
 */

import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Target, 
  Quote,
  TrendingUp,
  Calendar,
  Info,
  Zap,
  Book,
  Sparkles
} from 'lucide-react';
import Badge from '../common/Badge';
import { getIntentLabel, getConfidenceColor, CONFIDENCE } from '../../lib/replyRules';

function AnalysisResult({ analysis, originalMessage }) {
  if (!analysis) return null;

  const {
    intent,
    confidence,
    confidenceScore,
    evidence,
    matchedPhrase,
    nextAction,
    recommendedAction,
    followUpDays,
    multipleIntentsDetected,
    alternativeIntents,
    source = 'rules',
    statusSuggestion
  } = analysis;

  // Normalize confidence to standard format
  const normalizedConfidence = typeof confidence === 'string' 
    ? confidence 
    : confidenceScore >= 75 
      ? CONFIDENCE.HIGH 
      : confidenceScore >= 50 
        ? CONFIDENCE.MEDIUM 
        : CONFIDENCE.LOW;

  const normalizedScore = typeof confidenceScore === 'number' 
    ? confidenceScore 
    : confidence === CONFIDENCE.HIGH 
      ? 85 
      : confidence === CONFIDENCE.MEDIUM 
        ? 60 
        : 35;

  // Use AI's recommendedAction if available, otherwise nextAction
  const actionText = recommendedAction || nextAction;

  // Get display properties
  const intentLabel = getIntentLabel(intent);

  // Source badge configuration
  const sourceConfig = {
    'ai': {
      icon: Zap,
      label: 'AI Analysis',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      textColor: 'text-white'
    },
    'rules': {
      icon: Book,
      label: 'Rule-Based',
      color: 'bg-slate-600',
      textColor: 'text-white'
    },
    'rules-fallback': {
      icon: Sparkles,
      label: 'Fallback Analysis',
      color: 'bg-amber-600',
      textColor: 'text-white'
    }
  };

  const sourceInfo = sourceConfig[source] || sourceConfig['rules'];
  const SourceIcon = sourceInfo.icon;

  // Confidence icon and color mapping
  const confidenceConfig = {
    [CONFIDENCE.HIGH]: {
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      badgeVariant: 'success'
    },
    [CONFIDENCE.MEDIUM]: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      badgeVariant: 'warning'
    },
    [CONFIDENCE.LOW]: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      badgeVariant: 'error'
    }
  };

  const config = confidenceConfig[normalizedConfidence] || confidenceConfig[CONFIDENCE.LOW];
  const ConfidenceIcon = config.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Source Indicator Badge */}
      <div className={`${sourceInfo.color} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <SourceIcon className={`w-4 h-4 ${sourceInfo.textColor}`} />
          <span className={`text-sm font-medium ${sourceInfo.textColor}`}>
            {sourceInfo.label}
          </span>
        </div>
        {source === 'rules-fallback' && (
          <span className="text-xs text-white/90 bg-white/20 px-2 py-1 rounded">
            AI unavailable
          </span>
        )}
      </div>
      {/* Header with Confidence */}
      <div className={`${config.bgColor} ${config.borderColor} border-b px-6 py-4`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <ConfidenceIcon className={`w-5 h-5 ${config.textColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {intentLabel}
                </h3>
                <Badge variant={config.badgeVariant} size="sm">
                  {confidence.toUpperCase()}
                </Badge>
              </div>
              <p className={`text-sm ${config.textColor}`}>
                {evidence}
              </p>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold text-gray-900">
              {normalizedScore}%
            </div>
            <div className="text-xs text-gray-500">
              Confidence
            </div>
          </div>
        </div>

        {/* Status Suggestion (AI only) */}
        {statusSuggestion && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-indigo-900">
                <span className="font-medium">Status Update Suggested:</span> Consider changing 
                referral status to <span className="font-semibold">{statusSuggestion.replace(/_/g, ' ')}</span>
              </p>
            </div>
          </div>
        )}

        {/* Multiple Intents Warning */}
        {multipleIntentsDetected && alternativeIntents && alternativeIntents.length > 0 && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-white border border-yellow-200 rounded-lg">
            <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Note:</span> Multiple intents detected. 
                Also found: {alternativeIntents.map(i => getIntentLabel(i)).join(', ')}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Details */}
      <div className="p-6 space-y-5">
        {/* Matched Phrase (Evidence) */}
        {matchedPhrase && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Quote className="w-4 h-4 text-violet-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Matched Phrase
              </h4>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
              <p className="text-sm text-violet-900 italic">
                "{matchedPhrase}"
              </p>
            </div>
          </div>
        )}

        {/* Original Message Context */}
        {originalMessage && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Full Message
              </h4>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {originalMessage}
              </p>
            </div>
          </div>
        )}

        {/* Next Action */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900">
              Recommended Next Action
            </h4>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">
              {actionText}
            </p>
          </div>
        </div>

        {/* Follow-up Interval */}
        {followUpDays !== null && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Suggested Follow-up
              </h4>
            </div>
            <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {followUpDays}
              </div>
              <div className="text-sm text-indigo-900">
                <span className="font-medium">
                  {followUpDays === 1 ? 'day' : 'days'}
                </span>
                <p className="text-indigo-700">
                  Check back on {new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confidence Interpretation */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            {source === 'ai' ? 'AI Confidence Interpretation' : 'Confidence Interpretation'}
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            {normalizedConfidence === CONFIDENCE.HIGH && (
              <p>
                ✓ <span className="font-medium text-green-600">High confidence:</span> The intent is clear and unambiguous. 
                The suggested reply is likely appropriate.
              </p>
            )}
            {normalizedConfidence === CONFIDENCE.MEDIUM && (
              <p>
                ⚠ <span className="font-medium text-yellow-600">Medium confidence:</span> The intent seems likely but review 
                the suggested reply before sending. Consider the context carefully.
              </p>
            )}
            {normalizedConfidence === CONFIDENCE.LOW && (
              <p>
                ⚠ <span className="font-medium text-red-600">Low confidence:</span> The message is ambiguous or unclear. 
                Review carefully and consider asking for clarification.
              </p>
            )}
            
            {source === 'rules-fallback' && (
              <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                ℹ️ This analysis used rule-based fallback because AI analysis was unavailable.
              </p>
            )}
            
            {source === 'ai' && (
              <p className="mt-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-2 py-1">
                🤖 This analysis was generated by AI and considers context beyond pattern matching.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisResult;
