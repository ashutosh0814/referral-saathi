/**
 * SuggestedReply Component
 * Displays suggested response with copy, edit, and confirm actions
 * Supports AI-generated replies with confidence and status suggestions
 */

import React, { useState } from 'react';
import { Copy, CheckCircle2, Edit2, Send, X, Zap, Book, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

function SuggestedReply({ 
  suggestedReply, 
  onConfirm, 
  onCancel,
  isConfirming = false,
  analysis = null, // Full analysis object for additional context
  onStatusUpdate = null // Optional callback for status updates
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReply, setEditedReply] = useState(suggestedReply || '');
  const [copySuccess, setCopySuccess] = useState(false);
  const [applyStatusUpdate, setApplyStatusUpdate] = useState(false);

  // Extract analysis details
  const source = analysis?.source || 'rules';
  const confidence = analysis?.confidence;
  const confidenceScore = analysis?.confidenceScore;
  const statusSuggestion = analysis?.statusSuggestion;

  // Determine if this is an AI-generated reply
  const isAIGenerated = source === 'ai';

  // Update edited reply when suggested reply changes
  React.useEffect(() => {
    if (suggestedReply) {
      setEditedReply(suggestedReply);
    }
  }, [suggestedReply]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedReply);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedReply(suggestedReply);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleConfirm = () => {
    const payload = {
      message: editedReply,
      applyStatusUpdate: applyStatusUpdate && statusSuggestion,
      statusSuggestion: statusSuggestion || null
    };
    onConfirm(payload);
  };

  // Determine confidence color
  const getConfidenceColor = () => {
    if (!isAIGenerated) return null;
    
    const score = typeof confidenceScore === 'number' 
      ? confidenceScore 
      : confidence === 'high' ? 85 : confidence === 'medium' ? 60 : 35;
    
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!suggestedReply) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-500 text-center">
          No suggested reply available for this intent.
        </p>
      </div>
    );
  }

  const hasBeenEdited = editedReply !== suggestedReply;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Suggested Reply
              </h3>
              
              {/* Source Badge */}
              {isAIGenerated ? (
                <Badge variant="default" size="sm" className="bg-indigo-600 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Generated
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">
                  <Book className="w-3 h-3 mr-1" />
                  Rule-Based
                </Badge>
              )}

              {/* Edited Badge */}
              {hasBeenEdited && !isEditing && (
                <Badge variant="warning" size="sm">
                  Modified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <p className="text-sm text-violet-600">
                {isEditing ? 'Edit and customize your response' : 'Review and send this response'}
              </p>
              
              {/* AI Confidence Score */}
              {isAIGenerated && confidenceScore && !isEditing && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Confidence:</span>
                  <span className={`font-semibold ${getConfidenceColor()}`}>
                    {confidenceScore}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Warning for Low Confidence */}
        {isAIGenerated && confidenceScore < 50 && !isEditing && (
          <div className="mt-3 flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Low confidence reply:</strong> Please review carefully and consider editing before sending.
            </span>
          </div>
        )}
      </div>

      {/* Reply Content */}
      <div className="p-6">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-reply" className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply
              </label>
              <textarea
                id="edit-reply"
                value={editedReply}
                onChange={(e) => setEditedReply(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors min-h-[140px] resize-y"
                placeholder="Enter your customized reply..."
              />
              <p className="mt-2 text-xs text-gray-500">
                {editedReply.length} characters
              </p>
            </div>

            {/* Edit Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                disabled={!editedReply.trim()}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Save Changes
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {editedReply}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                leftIcon={copySuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                className={copySuccess ? 'text-green-600' : ''}
              >
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                leftIcon={<Edit2 className="w-4 h-4" />}
              >
                Edit Reply
              </Button>
            </div>
          </div>
        )}

        {/* Helper Text */}
        {!isEditing && (
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700">
                <span className="font-medium">💡 Tip:</span> You can edit this reply before confirming to add specific details 
                like job IDs, URLs, or personalize the message.
              </p>
            </div>

            {/* Status Update Option (AI only) */}
            {statusSuggestion && onStatusUpdate && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyStatusUpdate}
                    onChange={(e) => setApplyStatusUpdate(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-indigo-900 font-medium">
                      <RefreshCw className="w-3 h-3 inline mr-1" />
                      Update referral status to "{statusSuggestion.replace(/_/g, ' ')}"
                    </p>
                    <p className="text-xs text-indigo-700 mt-1">
                      AI suggests updating the status based on the employee's response
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Actions */}
      {!isEditing && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Confirm to add this message to the conversation timeline
              </p>
              {applyStatusUpdate && statusSuggestion && (
                <p className="text-xs text-indigo-600 mt-1">
                  ✓ Status will be updated after confirmation
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {onCancel && (
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isConfirming}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={isConfirming || !editedReply.trim()}
                isLoading={isConfirming}
                leftIcon={!isConfirming && <Send className="w-4 h-4" />}
              >
                {isConfirming ? 'Adding...' : 'Confirm & Add to Timeline'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuggestedReply;
