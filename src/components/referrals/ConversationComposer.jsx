/**
 * ConversationComposer Component
 * Form for adding sent or received messages with optional metadata
 */

import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../common/Button';
import { CONVERSATION_DIRECTION } from '../../utils/constants';
import { validateData, createConversationSchema } from '../../lib/validators';

function ConversationComposer({ 
  onSubmit, 
  onCancel = null,
  initialData = null, 
  isLoading = false,
  isEditMode = false 
}) {
  const [formData, setFormData] = useState({
    message: '',
    direction: CONVERSATION_DIRECTION.SENT,
    intent: '',
    suggestedAction: ''
  });

  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        message: initialData.message || '',
        direction: initialData.direction || CONVERSATION_DIRECTION.SENT,
        intent: initialData.intent || '',
        suggestedAction: initialData.suggestedAction || ''
      });
      // Show advanced if there's intent or suggestedAction
      if (initialData.intent || initialData.suggestedAction) {
        setShowAdvanced(true);
      }
    } else {
      // Reset form
      setFormData({
        message: '',
        direction: CONVERSATION_DIRECTION.SENT,
        intent: '',
        suggestedAction: ''
      });
      setShowAdvanced(false);
    }
    setErrors({});
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    const validation = validateData(createConversationSchema, formData);
    
    if (!validation.success) {
      setErrors(validation.error.fields);
      return;
    }

    // Submit
    onSubmit(validation.data);

    // Reset form if not in edit mode
    if (!isEditMode) {
      setFormData({
        message: '',
        direction: CONVERSATION_DIRECTION.SENT,
        intent: '',
        suggestedAction: ''
      });
      setShowAdvanced(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      message: '',
      direction: CONVERSATION_DIRECTION.SENT,
      intent: '',
      suggestedAction: ''
    });
    setErrors({});
    setShowAdvanced(false);
    if (onCancel) onCancel();
  };

  const isSent = formData.direction === CONVERSATION_DIRECTION.SENT;

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-5">
      {/* Direction Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleChange('direction', CONVERSATION_DIRECTION.SENT)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
            isSent
              ? 'bg-violet-50 border-violet-200 text-violet-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          disabled={isLoading}
        >
          <Send className="w-4 h-4" />
          <span className="font-medium">Sent Message</span>
        </button>
        <button
          type="button"
          onClick={() => handleChange('direction', CONVERSATION_DIRECTION.RECEIVED)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
            !isSent
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          disabled={isLoading}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium">Received Message</span>
        </button>
      </div>

      {/* Message Input */}
      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors min-h-[100px] resize-y ${
            errors.message 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-200 bg-white'
          }`}
          placeholder={isSent 
            ? "Enter the message you sent to the employee..." 
            : "Enter the message you received from the employee..."
          }
          rows={4}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message}</p>
        )}
      </div>

      {/* Advanced Fields Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 mb-3 transition-colors"
      >
        {showAdvanced ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide additional details
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Add intent & next action (optional)
          </>
        )}
      </button>

      {/* Advanced Fields */}
      {showAdvanced && (
        <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          {/* Intent */}
          <div>
            <label htmlFor="intent" className="block text-sm font-medium text-gray-700 mb-1.5">
              Intent
            </label>
            <input
              id="intent"
              type="text"
              value={formData.intent}
              onChange={(e) => handleChange('intent', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white transition-colors"
              placeholder="e.g., Request for referral, Follow-up on application..."
            />
            {errors.intent && (
              <p className="mt-1 text-sm text-red-600">{errors.intent}</p>
            )}
          </div>

          {/* Suggested Action */}
          <div>
            <label htmlFor="suggestedAction" className="block text-sm font-medium text-gray-700 mb-1.5">
              Next Action
            </label>
            <input
              id="suggestedAction"
              type="text"
              value={formData.suggestedAction}
              onChange={(e) => handleChange('suggestedAction', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white transition-colors"
              placeholder="e.g., Wait for response, Send resume, Schedule call..."
            />
            {errors.suggestedAction && (
              <p className="mt-1 text-sm text-red-600">{errors.suggestedAction}</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {(isEditMode || onCancel) && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading || !formData.message.trim()}
          leftIcon={isSent ? <Send className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
        >
          {isEditMode ? 'Update Message' : 'Add Message'}
        </Button>
      </div>
    </form>
  );
}

export default ConversationComposer;
