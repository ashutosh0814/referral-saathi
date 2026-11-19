/**
 * Application Constants
 * Centralized enums and constants for the application
 */

// Referral Status
export const REFERRAL_STATUS = {
  NOT_CONTACTED: 'not_contacted',
  MESSAGE_SENT: 'message_sent',
  WAITING_RESPONSE: 'waiting_response',
  EMPLOYEE_AGREED: 'employee_agreed',
  DETAILS_REQUESTED: 'details_requested',
  REFERRAL_SUBMITTED: 'referral_submitted',
  REJECTED: 'rejected',
  SUCCESSFUL: 'successful',
  CLOSED: 'closed'
};

export const REFERRAL_STATUS_LABELS = {
  [REFERRAL_STATUS.NOT_CONTACTED]: 'Not Contacted',
  [REFERRAL_STATUS.MESSAGE_SENT]: 'Message Sent',
  [REFERRAL_STATUS.WAITING_RESPONSE]: 'Waiting for Response',
  [REFERRAL_STATUS.EMPLOYEE_AGREED]: 'Employee Agreed',
  [REFERRAL_STATUS.DETAILS_REQUESTED]: 'Details Requested',
  [REFERRAL_STATUS.REFERRAL_SUBMITTED]: 'Referral Submitted',
  [REFERRAL_STATUS.REJECTED]: 'Rejected',
  [REFERRAL_STATUS.SUCCESSFUL]: 'Successful',
  [REFERRAL_STATUS.CLOSED]: 'Closed'
};

// Conversation Direction
export const CONVERSATION_DIRECTION = {
  SENT: 'sent',
  RECEIVED: 'received'
};

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  SNOOZED: 'snoozed',
  CANCELLED: 'cancelled'
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'Pending',
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.SNOOZED]: 'Snoozed',
  [TASK_STATUS.CANCELLED]: 'Cancelled'
};

// Database Collections
export const COLLECTIONS = {
  USERS: 'users',
  REFERRALS: 'referrals',
  CONVERSATIONS: 'conversations',
  TASKS: 'tasks'
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// Validation limits
export const LIMITS = {
  COMPANY_NAME_MAX: 100,
  JOB_TITLE_MAX: 150,
  EMPLOYEE_NAME_MAX: 100,
  CONTACT_NOTES_MAX: 5000,
  MESSAGE_MAX: 10000,
  TASK_TITLE_MAX: 200,
  URL_MAX: 2000
};

// Badge variants mapping
export const STATUS_BADGE_VARIANTS = {
  [REFERRAL_STATUS.NOT_CONTACTED]: 'neutral',
  [REFERRAL_STATUS.MESSAGE_SENT]: 'info',
  [REFERRAL_STATUS.WAITING_RESPONSE]: 'warning',
  [REFERRAL_STATUS.EMPLOYEE_AGREED]: 'primary',
  [REFERRAL_STATUS.DETAILS_REQUESTED]: 'primary',
  [REFERRAL_STATUS.REFERRAL_SUBMITTED]: 'primary',
  [REFERRAL_STATUS.REJECTED]: 'error',
  [REFERRAL_STATUS.SUCCESSFUL]: 'success',
  [REFERRAL_STATUS.CLOSED]: 'neutral'
};

export const TASK_BADGE_VARIANTS = {
  [TASK_STATUS.PENDING]: 'warning',
  [TASK_STATUS.COMPLETED]: 'success',
  [TASK_STATUS.SNOOZED]: 'info',
  [TASK_STATUS.CANCELLED]: 'neutral'
};
