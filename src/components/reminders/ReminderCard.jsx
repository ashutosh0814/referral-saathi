/**
 * ReminderCard Component
 * Displays a reminder with complete, snooze, edit, and delete actions
 * Fully responsive with improved mobile layout
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Bell,
  BellOff,
  Calendar
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  getReminderState,
  formatRelativeTime,
  formatDisplayDateTime,
  getSnoozeOptions
} from '../../utils/dateUtils';
import { REMINDER_ACTION_LABELS } from '../../lib/automation';

function ReminderCard({
  reminder,
  onComplete,
  onSnooze,
  onEdit,
  onDelete,
  onClick,
  showReferralInfo = true,
  isLoading = false
}) {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const snoozeMenuRef = useRef(null);
  const actionMenuRef = useRef(null);

  const state = getReminderState(reminder.dueDate, reminder.isCompleted);
  const actionLabel = REMINDER_ACTION_LABELS[reminder.action] || reminder.action;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSnoozeMenu && snoozeMenuRef.current && !snoozeMenuRef.current.contains(e.target)) {
        setShowSnoozeMenu(false);
      }
      if (showActionMenu && actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setShowActionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSnoozeMenu, showActionMenu]);

  // State-based styling
  const stateConfig = {
    overdue: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      badgeVariant: 'error',
      icon: AlertCircle,
      label: 'Overdue'
    },
    due_today: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      badgeVariant: 'warning',
      icon: Clock,
      label: 'Due Today'
    },
    upcoming: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      badgeVariant: 'info',
      icon: Calendar,
      label: 'Upcoming'
    },
    completed: {
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      badgeVariant: 'success',
      icon: CheckCircle2,
      label: 'Completed'
    }
  };

  const config = stateConfig[state] || stateConfig.upcoming;
  const StateIcon = config.icon;

  const handleComplete = (e) => {
    e.stopPropagation();
    if (onComplete) onComplete(reminder.id);
  };

  const handleSnooze = (e, snoozeOption) => {
    e.stopPropagation();
    setShowSnoozeMenu(false);
    if (onSnooze) onSnooze(reminder.id, snoozeOption.value);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowActionMenu(false);
    if (onEdit) onEdit(reminder);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowActionMenu(false);
    if (onDelete) onDelete(reminder.id);
  };

  const handleCardClick = () => {
    if (onClick) onClick(reminder);
  };

  const snoozeOptions = getSnoozeOptions();

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 sm:p-5 transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* State Icon */}
          <div className={`w-10 h-10 ${config.bgColor} border ${config.borderColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <StateIcon className={`w-5 h-5 ${config.textColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 break-words">
                {reminder.title}
              </h3>
              <Badge variant={config.badgeVariant} size="sm">
                {config.label}
              </Badge>
            </div>

            {reminder.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2 break-words">
                {reminder.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                {formatRelativeTime(reminder.dueDate)}
              </span>
              
              {reminder.snoozedCount > 0 && (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <BellOff className="w-3 h-3 flex-shrink-0" />
                  Snoozed {reminder.snoozedCount}x
                </span>
              )}

              {showReferralInfo && reminder.referralCompany && (
                <span className="truncate">
                  {reminder.referralCompany}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {!reminder.isCompleted && (
          <div className="relative" ref={actionMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActionMenu(!showActionMenu);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              aria-label="More options"
              aria-expanded={showActionMenu}
              aria-haspopup="true"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>

            {showActionMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionMenu(false);
                  }}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden animate-slide-in-down">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Tag */}
      <div className="mb-3">
        <span className="inline-flex items-center px-2.5 py-1 bg-white/60 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
          {actionLabel}
        </span>
      </div>

      {/* Due Date Display */}
      {!reminder.isCompleted && (
        <div className={`text-xs ${config.textColor} font-medium mb-3`}>
          {formatDisplayDateTime(reminder.dueDate)}
        </div>
      )}

      {/* Completed Info */}
      {reminder.isCompleted && reminder.completedAt && (
        <div className="text-xs text-emerald-600 font-medium mb-3">
          Completed {formatRelativeTime(reminder.completedAt)}
        </div>
      )}

      {/* Action Buttons */}
      {!reminder.isCompleted && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {onComplete && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleComplete}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Complete
            </Button>
          )}

          {onSnooze && (
            <div className="relative flex-1 sm:flex-none" ref={snoozeMenuRef}>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSnoozeMenu(!showSnoozeMenu);
                }}
                leftIcon={<Bell className="w-4 h-4" />}
                disabled={isLoading}
                className="w-full sm:w-auto"
                aria-expanded={showSnoozeMenu}
                aria-haspopup="true"
              >
                Snooze
              </Button>

              {showSnoozeMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSnoozeMenu(false);
                    }}
                    aria-hidden="true"
                  />
                  <div className="absolute left-0 bottom-full mb-2 w-full sm:w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden animate-slide-in-down">
                    {snoozeOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleSnooze(e, option)}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReminderCard;
