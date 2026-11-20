/**
 * UpcomingReminders Component
 * Displays upcoming and overdue reminders
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  AlertCircle, 
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { 
  getReminderState,
  formatRelativeTime 
} from '../../utils/dateUtils';
import { REMINDER_ACTION_LABELS } from '../../lib/automation';

function UpcomingReminders({ reminders, isLoading, onComplete }) {
  const navigate = useNavigate();

  // Filter and sort
  const activeReminders = reminders?.filter(r => !r.isCompleted) || [];
  const overdueReminders = activeReminders.filter(r => 
    getReminderState(r.dueDate, r.isCompleted) === 'overdue'
  );
  const dueTodayReminders = activeReminders.filter(r => 
    getReminderState(r.dueDate, r.isCompleted) === 'due_today'
  );
  const upcomingReminders = activeReminders.filter(r => 
    getReminderState(r.dueDate, r.isCompleted) === 'upcoming'
  ).slice(0, 3);

  const displayReminders = [
    ...overdueReminders,
    ...dueTodayReminders,
    ...upcomingReminders
  ].slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming Reminders</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-[#282828] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayReminders.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming Reminders</h2>
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-sm text-gray-200">All caught up!</p>
          <p className="text-xs text-gray-300 mt-1">No pending reminders</p>
        </div>
      </div>
    );
  }

  const getStateConfig = (reminder) => {
    const state = getReminderState(reminder.dueDate, reminder.isCompleted);

    const configs = {
      overdue: {
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
        icon: AlertCircle,
        iconColor: 'text-red-500',
        badgeVariant: 'error'
      },
      due_today: {
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-400',
        icon: Clock,
        iconColor: 'text-yellow-500',
        badgeVariant: 'warning'
      },
      upcoming: {
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        textColor: 'text-blue-400',
        icon: Bell,
        iconColor: 'text-blue-500',
        badgeVariant: 'default'
      }
    };

    return configs[state] || configs.upcoming;
  };

  const handleComplete = (e, reminderId) => {
    e.stopPropagation();
    if (onComplete) {
      onComplete(reminderId);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Upcoming Reminders</h2>
          {overdueReminders.length > 0 && (
            <Badge variant="error">{overdueReminders.length} overdue</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/reminders')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {displayReminders.map((reminder) => {
          const config = getStateConfig(reminder);
          const Icon = config.icon;
          const actionLabel = REMINDER_ACTION_LABELS[reminder.action] || reminder.action;

          return (
            <div
              key={reminder.id}
              onClick={() => {
                if (reminder.referralId) {
                  navigate(`/referrals/${reminder.referralId}`);
                } else {
                  navigate('/reminders');
                }
              }}
              className={`flex items-start gap-3 p-3 border ${config.borderColor} ${config.bgColor} rounded-lg hover:shadow-sm transition-all cursor-pointer`}
            >
              <div className={`w-8 h-8 ${config.bgColor} border ${config.borderColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${config.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white line-clamp-1">
                    {reminder.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleComplete(e, reminder.id)}
                    className="flex-shrink-0 h-6 px-2 text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={config.textColor}>
                    {formatRelativeTime(reminder.dueDate)}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300">{actionLabel}</span>
                  {reminder.referralCompany && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-300 truncate">
                        {reminder.referralCompany}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeReminders.length > 5 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/reminders')}
          >
            View {activeReminders.length - 5} more
          </Button>
        </div>
      )}
    </div>
  );
}

export default UpcomingReminders;
