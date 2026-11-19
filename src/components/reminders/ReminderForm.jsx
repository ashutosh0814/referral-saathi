/**
 * ReminderForm Component
 * Form for creating and editing reminders with validation
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Tag } from 'lucide-react';
import Button from '../common/Button';
import {
  formatDateForInput,
  formatTimeForInput,
  combineDateAndTime,
  calculateDueDate
} from '../../utils/dateUtils';
import {
  REMINDER_ACTIONS,
  REMINDER_ACTION_LABELS,
  getSuggestedFollowUpDays
} from '../../lib/automation';

function ReminderForm({
  initialData = null,
  referralData = null,
  onSubmit,
  onCancel,
  isLoading = false
}) {
  const isEditMode = !!initialData;

  // Initialize form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    action: REMINDER_ACTIONS.FOLLOW_UP,
    dueDate: '',
    dueTime: '09:00',
    referralId: '',
    referralCompany: '',
    referralEmployee: ''
  });

  const [errors, setErrors] = useState({});
  const [quickDays, setQuickDays] = useState(null);

  // Initialize form when data changes
  useEffect(() => {
    if (initialData) {
      // Edit mode - populate from existing reminder
      const dueDate = initialData.dueDate?.toDate 
        ? initialData.dueDate.toDate() 
        : new Date(initialData.dueDate);

      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        action: initialData.action || REMINDER_ACTIONS.FOLLOW_UP,
        dueDate: formatDateForInput(dueDate),
        dueTime: formatTimeForInput(dueDate),
        referralId: initialData.referralId || '',
        referralCompany: initialData.referralCompany || '',
        referralEmployee: initialData.referralEmployee || ''
      });
    } else if (referralData) {
      // Create mode - populate from referral context
      const suggestedDays = getSuggestedFollowUpDays(referralData.status);
      const suggestedDate = calculateDueDate(suggestedDays);

      setFormData({
        title: `Follow up - ${referralData.companyName}`,
        description: '',
        action: REMINDER_ACTIONS.FOLLOW_UP,
        dueDate: formatDateForInput(suggestedDate),
        dueTime: '09:00',
        referralId: referralData.id || '',
        referralCompany: referralData.companyName || '',
        referralEmployee: referralData.employeeName || ''
      });

      setQuickDays(suggestedDays);
    } else {
      // Default empty form
      const tomorrow = calculateDueDate(1);
      setFormData(prev => ({
        ...prev,
        dueDate: formatDateForInput(tomorrow),
        dueTime: '09:00'
      }));
    }
  }, [initialData, referralData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleActionChange = (action) => {
    const actionLabel = REMINDER_ACTION_LABELS[action];
    const companyName = formData.referralCompany || referralData?.companyName;

    // Auto-generate title based on action
    let newTitle = actionLabel;
    if (companyName) {
      newTitle = `${actionLabel} - ${companyName}`;
    }

    setFormData(prev => ({
      ...prev,
      action,
      title: newTitle
    }));
  };

  const handleQuickDays = (days) => {
    const newDate = calculateDueDate(days);
    setFormData(prev => ({
      ...prev,
      dueDate: formatDateForInput(newDate)
    }));
    setQuickDays(days);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.action) {
      newErrors.action = 'Action is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.referralId && referralData) {
      newErrors.referralId = 'Referral ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Combine date and time
    const dueDateTime = combineDateAndTime(formData.dueDate, formData.dueTime);

    const reminderData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      action: formData.action,
      dueDate: dueDateTime,
      referralId: formData.referralId || referralData?.id,
      referralCompany: formData.referralCompany || referralData?.companyName,
      referralEmployee: formData.referralEmployee || referralData?.employeeName
    };

    if (onSubmit) {
      onSubmit(reminderData);
    }
  };

  const quickDaysOptions = [
    { label: 'Today', days: 0 },
    { label: 'Tomorrow', days: 1 },
    { label: '3 days', days: 3 },
    { label: '1 week', days: 7 },
    { label: '2 weeks', days: 14 }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Action Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Action Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(REMINDER_ACTION_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleActionChange(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                formData.action === key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.action && (
          <p className="mt-1 text-sm text-red-600">{errors.action}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="e.g., Send resume to John at Google"
          maxLength={100}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add notes or details about this reminder..."
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Quick Days Selector */}
      {!isEditMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Select
          </label>
          <div className="flex flex-wrap gap-2">
            {quickDaysOptions.map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => handleQuickDays(option.days)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                  quickDays === option.days
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.dueDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Time
          </label>
          <input
            type="time"
            id="dueTime"
            value={formData.dueTime}
            onChange={(e) => handleInputChange('dueTime', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Referral Context (if available) */}
      {(referralData || formData.referralCompany) && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">
              Linked Referral
            </span>
          </div>
          <div className="text-sm text-indigo-700">
            <div>
              <strong>Company:</strong> {formData.referralCompany || referralData?.companyName}
            </div>
            {(formData.referralEmployee || referralData?.employeeName) && (
              <div>
                <strong>Employee:</strong> {formData.referralEmployee || referralData?.employeeName}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          isLoading={isLoading}
          className="flex-1"
        >
          {isEditMode ? 'Update Reminder' : 'Create Reminder'}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default ReminderForm;
