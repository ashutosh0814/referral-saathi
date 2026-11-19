/**
 * Automation Rules Engine
 * Manages reminder creation rules, duplicate prevention, and state validation
 */

import { getReminderState, isOverdue, calculateDueDate } from '../utils/dateUtils';
import { REFERRAL_STATUS } from '../utils/constants';

/**
 * Reminder action types
 */
export const REMINDER_ACTIONS = {
  SEND_RESUME: 'send_resume',
  SEND_JOB_DETAILS: 'send_job_details',
  FOLLOW_UP: 'follow_up',
  CHECK_STATUS: 'check_status',
  SEND_THANK_YOU: 'send_thank_you',
  UPDATE_RESUME: 'update_resume',
  SCHEDULE_CALL: 'schedule_call',
  CUSTOM: 'custom'
};

/**
 * Action labels for display
 */
export const REMINDER_ACTION_LABELS = {
  [REMINDER_ACTIONS.SEND_RESUME]: 'Send Resume',
  [REMINDER_ACTIONS.SEND_JOB_DETAILS]: 'Send Job Details',
  [REMINDER_ACTIONS.FOLLOW_UP]: 'Follow Up',
  [REMINDER_ACTIONS.CHECK_STATUS]: 'Check Status',
  [REMINDER_ACTIONS.SEND_THANK_YOU]: 'Send Thank You',
  [REMINDER_ACTIONS.UPDATE_RESUME]: 'Update Resume',
  [REMINDER_ACTIONS.SCHEDULE_CALL]: 'Schedule Call',
  [REMINDER_ACTIONS.CUSTOM]: 'Custom Action'
};

/**
 * Statuses that should not have active reminders
 */
const CLOSED_STATUSES = [
  'rejected',
  'successful',
  'closed'
];

/**
 * Statuses that indicate completed actions
 */
const COMPLETED_STATUSES = [
  'referral_submitted',
  'successful'
];

/**
 * Check if a referral status allows new reminders
 * @param {string} status - Referral status
 * @returns {boolean}
 */
export function canCreateReminderForStatus(status) {
  return !CLOSED_STATUSES.includes(status);
}

/**
 * Check if an action is already completed based on referral status
 * @param {string} action - Reminder action type
 * @param {string} status - Referral status
 * @returns {boolean}
 */
export function isActionCompleted(action, status) {
  // Resume sent -> details_requested or later
  if (action === REMINDER_ACTIONS.SEND_RESUME) {
    return ['details_requested', 'referral_submitted', 'successful'].includes(status);
  }
  
  // Details sent -> employee_agreed or later
  if (action === REMINDER_ACTIONS.SEND_JOB_DETAILS) {
    return ['employee_agreed', 'referral_submitted', 'successful'].includes(status);
  }
  
  // Referral submitted
  if (action === REMINDER_ACTIONS.FOLLOW_UP && status === 'referral_submitted') {
    return true;
  }
  
  return COMPLETED_STATUSES.includes(status);
}

/**
 * Check if a duplicate active reminder exists
 * @param {Array} existingReminders - Array of existing reminders
 * @param {string} action - Action to check
 * @param {string} referralId - Referral ID
 * @returns {boolean}
 */
export function hasDuplicateActiveReminder(existingReminders, action, referralId) {
  return existingReminders.some(reminder => 
    reminder.referralId === referralId &&
    reminder.action === action &&
    !reminder.isCompleted &&
    reminder.dueDate // Has a due date
  );
}

/**
 * Validate reminder creation
 * @param {Object} reminderData - Reminder data to validate
 * @param {string} referralStatus - Current referral status
 * @param {Array} existingReminders - Existing reminders
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateReminderCreation(reminderData, referralStatus, existingReminders = []) {
  const { action, referralId, title, dueDate } = reminderData;
  
  // Check required fields
  if (!action) {
    return { valid: false, error: 'Action is required' };
  }
  
  if (!referralId) {
    return { valid: false, error: 'Referral ID is required' };
  }
  
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  
  if (!dueDate) {
    return { valid: false, error: 'Due date is required' };
  }
  
  // Check if referral status allows reminders
  if (!canCreateReminderForStatus(referralStatus)) {
    return { 
      valid: false, 
      error: `Cannot create reminders for ${referralStatus} referrals` 
    };
  }
  
  // Check if action is already completed
  if (isActionCompleted(action, referralStatus)) {
    return { 
      valid: false, 
      error: 'This action appears to be already completed' 
    };
  }
  
  // Check for duplicate active reminders
  if (hasDuplicateActiveReminder(existingReminders, action, referralId)) {
    return { 
      valid: false, 
      error: 'An active reminder for this action already exists' 
    };
  }
  
  return { valid: true };
}

/**
 * Suggest reminder based on AI analysis
 * @param {Object} analysis - AI analysis result
 * @param {string} referralId - Referral ID
 * @returns {Object|null} - Suggested reminder data or null
 */
export function suggestReminderFromAnalysis(analysis, referralId) {
  if (!analysis || !analysis.followUpDays) {
    return null;
  }
  
  const { intent, followUpDays } = analysis;
  
  let action = REMINDER_ACTIONS.FOLLOW_UP;
  let title = 'Follow up on referral request';
  
  // Map intents to actions
  switch (intent) {
    case 'resume_requested':
    case 'details_requested':
      action = REMINDER_ACTIONS.SEND_RESUME;
      title = 'Send resume to employee';
      break;
      
    case 'employee_agrees':
      action = REMINDER_ACTIONS.SEND_JOB_DETAILS;
      title = 'Send job details and resume';
      break;
      
    case 'will_check':
      action = REMINDER_ACTIONS.CHECK_STATUS;
      title = 'Check status with employee';
      break;
      
    case 'referral_submitted':
      action = REMINDER_ACTIONS.SEND_THANK_YOU;
      title = 'Send thank you message';
      break;
      
    default:
      action = REMINDER_ACTIONS.FOLLOW_UP;
      title = 'Follow up on conversation';
  }
  
  return {
    action,
    title,
    description: `Suggested based on AI analysis: ${intent}`,
    referralId,
    dueDate: calculateDueDate(followUpDays),
    isCompleted: false,
    createdFrom: 'ai_suggestion'
  };
}

/**
 * Auto-complete reminders based on referral status change
 * @param {Array} reminders - Array of reminders
 * @param {string} newStatus - New referral status
 * @returns {Array} - IDs of reminders to auto-complete
 */
export function getRemindersToAutoComplete(reminders, newStatus) {
  const toComplete = [];
  
  reminders.forEach(reminder => {
    if (reminder.isCompleted) return;
    
    // Auto-complete if action is now done
    if (isActionCompleted(reminder.action, newStatus)) {
      toComplete.push(reminder.id);
    }
  });
  
  return toComplete;
}

/**
 * Calculate reminder priority based on state and days until due
 * @param {Object} reminder - Reminder object
 * @returns {number} - Priority score (higher = more urgent)
 */
export function calculateReminderPriority(reminder) {
  if (reminder.isCompleted) return 0;
  
  const state = getReminderState(reminder.dueDate, reminder.isCompleted);
  
  switch (state) {
    case 'overdue':
      return 100;
    case 'due_today':
      return 50;
    case 'upcoming':
      return 10;
    default:
      return 0;
  }
}

/**
 * Sort reminders by priority
 * @param {Array} reminders - Array of reminders
 * @returns {Array} - Sorted reminders (highest priority first)
 */
export function sortRemindersByPriority(reminders) {
  return [...reminders].sort((a, b) => {
    const priorityA = calculateReminderPriority(a);
    const priorityB = calculateReminderPriority(b);
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    
    // If same priority, sort by due date
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Get reminder statistics for display
 * @param {Array} reminders - Array of reminders
 * @returns {Object} - Statistics object
 */
export function getReminderStatistics(reminders) {
  const stats = {
    total: reminders.length,
    active: 0,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    upcoming: 0
  };
  
  reminders.forEach(reminder => {
    if (reminder.isCompleted) {
      stats.completed++;
    } else {
      stats.active++;
      
      const state = getReminderState(reminder.dueDate, reminder.isCompleted);
      
      if (state === 'overdue') {
        stats.overdue++;
      } else if (state === 'due_today') {
        stats.dueToday++;
      } else if (state === 'upcoming') {
        stats.upcoming++;
      }
    }
  });
  
  return stats;
}

/**
 * Check reminders on app focus/open
 * Returns reminders that need attention
 * @param {Array} reminders - Array of all reminders
 * @returns {Object} - { overdue: [], dueToday: [], needsAttention: boolean }
 */
export function checkRemindersOnFocus(reminders) {
  const activeReminders = reminders.filter(r => !r.isCompleted);
  
  const overdue = activeReminders.filter(r => 
    isOverdue(r.dueDate, r.isCompleted)
  );
  
  const dueToday = activeReminders.filter(r => {
    const state = getReminderState(r.dueDate, r.isCompleted);
    return state === 'due_today';
  });
  
  return {
    overdue: sortRemindersByPriority(overdue),
    dueToday: sortRemindersByPriority(dueToday),
    needsAttention: overdue.length > 0 || dueToday.length > 0
  };
}

/**
 * Generate default reminder title based on action
 * @param {string} action - Reminder action
 * @param {Object} referralData - Referral data (optional)
 * @returns {string}
 */
export function generateReminderTitle(action, referralData = {}) {
  const { companyName, employeeName } = referralData;
  
  const base = REMINDER_ACTION_LABELS[action] || 'Reminder';
  
  if (companyName && employeeName) {
    return `${base} - ${companyName} (${employeeName})`;
  }
  
  if (companyName) {
    return `${base} - ${companyName}`;
  }
  
  return base;
}

/**
 * Validate snooze operation
 * @param {Object} reminder - Reminder object
 * @param {Date} newDueDate - New due date after snooze
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateSnooze(reminder, newDueDate) {
  if (reminder.isCompleted) {
    return { 
      valid: false, 
      error: 'Cannot snooze a completed reminder' 
    };
  }
  
  if (!newDueDate) {
    return { 
      valid: false, 
      error: 'New due date is required' 
    };
  }
  
  const now = new Date();
  if (newDueDate <= now) {
    return { 
      valid: false, 
      error: 'Snooze date must be in the future' 
    };
  }
  
  return { valid: true };
}

/**
 * Get suggested follow-up days based on referral status
 * @param {string} status - Referral status
 * @returns {number} - Suggested days
 */
export function getSuggestedFollowUpDays(status) {
  const mapping = {
    'not_contacted': 1, // Follow up quickly
    'message_sent': 3, // Give them time to respond
    'waiting_response': 5, // Wait a bit longer
    'employee_agreed': 2, // Act quickly when agreed
    'details_requested': 1, // Respond fast
    'referral_submitted': 7, // Wait for hiring process
    'rejected': 0, // No follow-up needed
    'successful': 0, // No follow-up needed
    'closed': 0 // No follow-up needed
  };
  
  return mapping[status] || 3; // Default to 3 days
}
