/**
 * Data Validators using Zod
 * Validates all data before writing to Firestore
 */

import { z } from 'zod';
import {
  REFERRAL_STATUS,
  CONVERSATION_DIRECTION,
  TASK_STATUS,
  LIMITS
} from '../utils/constants';

// Helper validators
const urlSchema = z.string().url().max(LIMITS.URL_MAX).optional().or(z.literal(''));
const timestampSchema = z.date().optional();

// Referral Validators
export const createReferralSchema = z.object({
  companyName: z.string()
    .min(1, 'Company name is required')
    .max(LIMITS.COMPANY_NAME_MAX, `Company name must be ${LIMITS.COMPANY_NAME_MAX} characters or less`)
    .trim(),
  
  jobTitle: z.string()
    .min(1, 'Job title is required')
    .max(LIMITS.JOB_TITLE_MAX, `Job title must be ${LIMITS.JOB_TITLE_MAX} characters or less`)
    .trim(),
  
  jobUrl: urlSchema,
  
  jobId: z.string()
    .max(100, 'Job ID must be 100 characters or less')
    .trim()
    .optional()
    .or(z.literal('')),
  
  employeeName: z.string()
    .min(1, 'Employee name is required')
    .max(LIMITS.EMPLOYEE_NAME_MAX, `Employee name must be ${LIMITS.EMPLOYEE_NAME_MAX} characters or less`)
    .trim(),
  
  employeeDesignation: z.string()
    .max(150, 'Designation must be 150 characters or less')
    .trim()
    .optional()
    .or(z.literal('')),
  
  employeeLinkedIn: urlSchema,
  
  contactNotes: z.string()
    .max(LIMITS.CONTACT_NOTES_MAX, `Notes must be ${LIMITS.CONTACT_NOTES_MAX} characters or less`)
    .trim()
    .optional()
    .or(z.literal('')),
  
  status: z.enum([
    REFERRAL_STATUS.NOT_CONTACTED,
    REFERRAL_STATUS.MESSAGE_SENT,
    REFERRAL_STATUS.WAITING_RESPONSE,
    REFERRAL_STATUS.EMPLOYEE_AGREED,
    REFERRAL_STATUS.DETAILS_REQUESTED,
    REFERRAL_STATUS.REFERRAL_SUBMITTED,
    REFERRAL_STATUS.REJECTED,
    REFERRAL_STATUS.SUCCESSFUL,
    REFERRAL_STATUS.CLOSED
  ]).default(REFERRAL_STATUS.NOT_CONTACTED)
});

export const updateReferralSchema = z.object({
  companyName: z.string()
    .max(LIMITS.COMPANY_NAME_MAX)
    .trim()
    .optional(),
  
  jobTitle: z.string()
    .max(LIMITS.JOB_TITLE_MAX)
    .trim()
    .optional(),
  
  jobUrl: urlSchema,
  
  jobId: z.string()
    .max(100)
    .trim()
    .optional(),
  
  employeeName: z.string()
    .max(LIMITS.EMPLOYEE_NAME_MAX)
    .trim()
    .optional(),
  
  employeeDesignation: z.string()
    .max(150)
    .trim()
    .optional(),
  
  employeeLinkedIn: urlSchema,
  
  contactNotes: z.string()
    .max(LIMITS.CONTACT_NOTES_MAX)
    .trim()
    .optional(),
  
  status: z.enum([
    REFERRAL_STATUS.NOT_CONTACTED,
    REFERRAL_STATUS.MESSAGE_SENT,
    REFERRAL_STATUS.WAITING_RESPONSE,
    REFERRAL_STATUS.EMPLOYEE_AGREED,
    REFERRAL_STATUS.DETAILS_REQUESTED,
    REFERRAL_STATUS.REFERRAL_SUBMITTED,
    REFERRAL_STATUS.REJECTED,
    REFERRAL_STATUS.SUCCESSFUL,
    REFERRAL_STATUS.CLOSED
  ]).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Conversation Validators
export const createConversationSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(LIMITS.MESSAGE_MAX, `Message must be ${LIMITS.MESSAGE_MAX} characters or less`)
    .trim(),
  
  direction: z.enum([
    CONVERSATION_DIRECTION.SENT,
    CONVERSATION_DIRECTION.RECEIVED
  ]),
  
  intent: z.string()
    .max(200, 'Intent must be 200 characters or less')
    .trim()
    .optional()
    .or(z.literal('')),
  
  suggestedAction: z.string()
    .max(500, 'Suggested action must be 500 characters or less')
    .trim()
    .optional()
    .or(z.literal(''))
});

export const updateConversationSchema = z.object({
  message: z.string()
    .max(LIMITS.MESSAGE_MAX)
    .trim()
    .optional(),
  
  direction: z.enum([
    CONVERSATION_DIRECTION.SENT,
    CONVERSATION_DIRECTION.RECEIVED
  ]).optional(),
  
  intent: z.string()
    .max(200)
    .trim()
    .optional(),
  
  suggestedAction: z.string()
    .max(500)
    .trim()
    .optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Task Validators
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Task title is required')
    .max(LIMITS.TASK_TITLE_MAX, `Title must be ${LIMITS.TASK_TITLE_MAX} characters or less`)
    .trim(),
  
  referralId: z.string()
    .min(1, 'Referral ID is required'),
  
  dueAt: z.date()
    .min(new Date(), 'Due date must be in the future')
    .optional()
    .nullable(),
  
  status: z.enum([
    TASK_STATUS.PENDING,
    TASK_STATUS.COMPLETED,
    TASK_STATUS.SNOOZED,
    TASK_STATUS.CANCELLED
  ]).default(TASK_STATUS.PENDING),
  
  snoozedUntil: z.date()
    .optional()
    .nullable()
});

export const updateTaskSchema = z.object({
  title: z.string()
    .max(LIMITS.TASK_TITLE_MAX)
    .trim()
    .optional(),
  
  referralId: z.string()
    .optional(),
  
  dueAt: z.date()
    .optional()
    .nullable(),
  
  status: z.enum([
    TASK_STATUS.PENDING,
    TASK_STATUS.COMPLETED,
    TASK_STATUS.SNOOZED,
    TASK_STATUS.CANCELLED
  ]).optional(),
  
  snoozedUntil: z.date()
    .optional()
    .nullable()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Helper function to validate data
export const validateData = (schema, data) => {
  try {
    return {
      success: true,
      data: schema.parse(data),
      error: null
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = {};
      error.errors.forEach((err) => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
      });
      
      return {
        success: false,
        data: null,
        error: {
          message: 'Validation failed',
          fields: fieldErrors
        }
      };
    }
    
    return {
      success: false,
      data: null,
      error: {
        message: error.message || 'Validation failed',
        fields: {}
      }
    };
  }
};

// Note: Type inference (z.infer) is only available in TypeScript
// For JavaScript projects, refer to the schema definitions above for data structure
