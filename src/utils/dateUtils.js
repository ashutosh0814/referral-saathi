/**
 * Date Utilities for Reminder Management
 * Uses date-fns for all date calculations
 */

import {
  addDays,
  addHours,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  parseISO,
  isValid
} from 'date-fns';

/**
 * Get reminder state based on due date
 * @param {Date|string} dueDate - Due date
 * @returns {'overdue'|'due_today'|'upcoming'|'completed'}
 */
export function getReminderState(dueDate, isCompleted = false) {
  if (isCompleted) return 'completed';

  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (!isValid(date)) return 'upcoming';

  const now = new Date();
  
  if (isBefore(date, startOfDay(now))) {
    return 'overdue';
  }
  
  if (isToday(date)) {
    return 'due_today';
  }
  
  return 'upcoming';
}

/**
 * Check if a reminder is overdue
 * @param {Date|string} dueDate - Due date
 * @param {boolean} isCompleted - Whether reminder is completed
 * @returns {boolean}
 */
export function isOverdue(dueDate, isCompleted = false) {
  if (isCompleted) return false;
  
  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (!isValid(date)) return false;
  
  return isBefore(date, startOfDay(new Date()));
}

/**
 * Check if a reminder is due today
 * @param {Date|string} dueDate - Due date
 * @returns {boolean}
 */
export function isDueToday(dueDate) {
  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (!isValid(date)) return false;
  
  return isToday(date);
}

/**
 * Check if a reminder is upcoming (future, not today)
 * @param {Date|string} dueDate - Due date
 * @returns {boolean}
 */
export function isUpcoming(dueDate) {
  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (!isValid(date)) return false;
  
  return isFuture(date) && !isToday(date);
}

/**
 * Calculate due date from now
 * @param {number} days - Number of days from now
 * @returns {Date}
 */
export function calculateDueDate(days) {
  return addDays(new Date(), days);
}

/**
 * Get snooze date options
 * @returns {Array<{label: string, value: Date, days?: number, hours?: number}>}
 */
export function getSnoozeOptions() {
  const now = new Date();
  
  return [
    {
      label: '1 hour',
      value: addHours(now, 1),
      hours: 1
    },
    {
      label: '3 hours',
      value: addHours(now, 3),
      hours: 3
    },
    {
      label: 'Tomorrow',
      value: addDays(startOfDay(now), 1),
      days: 1
    },
    {
      label: '3 days',
      value: addDays(now, 3),
      days: 3
    },
    {
      label: '1 week',
      value: addDays(now, 7),
      days: 7
    }
  ];
}

/**
 * Format relative time for display
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';

  const now = new Date();
  
  // For overdue
  if (isPast(dateObj) && !isToday(dateObj)) {
    const daysDiff = Math.abs(differenceInDays(dateObj, now));
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff < 7) return `${daysDiff} days ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
    return format(dateObj, 'MMM d, yyyy');
  }
  
  // For today
  if (isToday(dateObj)) {
    const hoursDiff = differenceInHours(dateObj, now);
    const minutesDiff = differenceInMinutes(dateObj, now);
    
    if (minutesDiff < 0) {
      // Past today
      return `Today at ${format(dateObj, 'h:mm a')}`;
    } else if (hoursDiff < 1) {
      return `In ${minutesDiff} minutes`;
    } else if (hoursDiff < 24) {
      return `Today at ${format(dateObj, 'h:mm a')}`;
    }
  }
  
  // For tomorrow
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${format(dateObj, 'h:mm a')}`;
  }
  
  // For upcoming
  const daysDiff = differenceInDays(dateObj, now);
  if (daysDiff < 7) {
    return `In ${daysDiff} days`;
  }
  if (daysDiff < 30) {
    return `In ${Math.floor(daysDiff / 7)} weeks`;
  }
  
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export function formatDateForInput(date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Format time for input field (HH:mm)
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export function formatTimeForInput(date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '09:00';
  
  return format(dateObj, 'HH:mm');
}

/**
 * Combine date and time strings into a Date object
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @param {string} timeString - Time string (HH:mm)
 * @returns {Date}
 */
export function combineDateAndTime(dateString, timeString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * Get days until due date
 * @param {Date|string} dueDate - Due date
 * @returns {number} - Negative if overdue, 0 if today, positive if future
 */
export function getDaysUntilDue(dueDate) {
  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (!isValid(date)) return 0;
  
  return differenceInDays(date, startOfDay(new Date()));
}

/**
 * Check if two dates are on the same day
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean}
 */
export function isSameDay(date1, date2) {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  
  if (!isValid(d1) || !isValid(d2)) return false;
  
  return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd');
}

/**
 * Sort reminders by due date (earliest first)
 * @param {Array} reminders - Array of reminder objects
 * @returns {Array} - Sorted reminders
 */
export function sortRemindersByDueDate(reminders) {
  return [...reminders].sort((a, b) => {
    const dateA = typeof a.dueDate === 'string' ? parseISO(a.dueDate) : a.dueDate;
    const dateB = typeof b.dueDate === 'string' ? parseISO(b.dueDate) : b.dueDate;
    
    if (!isValid(dateA)) return 1;
    if (!isValid(dateB)) return -1;
    
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Filter reminders by state
 * @param {Array} reminders - Array of reminder objects
 * @param {'overdue'|'due_today'|'upcoming'|'completed'} state - State to filter by
 * @returns {Array} - Filtered reminders
 */
export function filterRemindersByState(reminders, state) {
  return reminders.filter(reminder => {
    const reminderState = getReminderState(reminder.dueDate, reminder.isCompleted);
    return reminderState === state;
  });
}

/**
 * Get count of reminders by state
 * @param {Array} reminders - Array of reminder objects
 * @returns {Object} - Count by state
 */
export function getRemindersCountByState(reminders) {
  const counts = {
    overdue: 0,
    due_today: 0,
    upcoming: 0,
    completed: 0,
    total: reminders.length
  };
  
  reminders.forEach(reminder => {
    const state = getReminderState(reminder.dueDate, reminder.isCompleted);
    counts[state] = (counts[state] || 0) + 1;
  });
  
  return counts;
}

/**
 * Format display date and time
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export function formatDisplayDateTime(date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${format(dateObj, 'h:mm a')}`;
  }
  
  return format(dateObj, 'MMM d, yyyy \'at\' h:mm a');
}
