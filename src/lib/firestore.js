/**
 * Firestore Database Functions
 * Reusable CRUD operations for referrals, conversations, and tasks
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  validateData,
  createReferralSchema,
  updateReferralSchema,
  createConversationSchema,
  updateConversationSchema,
  createTaskSchema,
  updateTaskSchema
} from './validators';
import { COLLECTIONS, DEFAULT_PAGE_SIZE } from '../utils/constants';

/**
 * Error handling wrapper
 */
const handleError = (error, operation) => {
  console.error(`[Firestore ${operation}]:`, error);
  return {
    success: false,
    error: error.message || `Failed to ${operation}`,
    data: null
  };
};

/**
 * Convert Firestore document to plain object
 */
const docToObject = (docSnap) => {
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    // Convert Firestore Timestamps to Date objects
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    dueAt: data.dueAt?.toDate?.() || data.dueAt,
    snoozedUntil: data.snoozedUntil?.toDate?.() || data.snoozedUntil
  };
};

// ==================== REFERRALS ====================

/**
 * Create a new referral
 * @param {string} userId - Authenticated user ID
 * @param {Object} referralData - Referral data
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const createReferral = async (userId, referralData) => {
  try {
    // Validate input
    const validation = validateData(createReferralSchema, referralData);
    if (!validation.success) {
      return { success: false, error: validation.error.message, data: null };
    }

    // Prepare document with timestamps
    const docData = {
      ...validation.data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add to Firestore
    const referralsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.REFERRALS);
    const docRef = await addDoc(referralsRef, docData);

    // Fetch the created document
    const docSnap = await getDoc(docRef);
    
    return {
      success: true,
      data: docToObject(docSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'create referral');
  }
};

/**
 * Get a single referral by ID
 * @param {string} userId - Authenticated user ID
 * @param {string} referralId - Referral ID
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const getReferral = async (userId, referralId) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.REFERRALS, referralId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Referral not found', data: null };
    }

    return {
      success: true,
      data: docToObject(docSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'get referral');
  }
};

/**
 * Get all referrals for a user
 * @param {string} userId - Authenticated user ID
 * @param {Object} options - Query options { status, orderByField, limitCount, lastDoc }
 * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>}
 */
export const getReferrals = async (userId, options = {}) => {
  try {
    const {
      status = null,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      limitCount = DEFAULT_PAGE_SIZE,
      lastDoc = null
    } = options;

    const referralsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.REFERRALS);
    
    // Build query
    let q = query(referralsRef);
    
    // Filter by status if provided
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    // Order by field
    q = query(q, orderBy(orderByField, orderDirection));
    
    // Pagination
    q = query(q, limit(limitCount));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const referrals = querySnapshot.docs.map(docToObject);

    return {
      success: true,
      data: referrals,
      error: null,
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
  } catch (error) {
    return handleError(error, 'get referrals');
  }
};

/**
 * Update a referral
 * @param {string} userId - Authenticated user ID
 * @param {string} referralId - Referral ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const updateReferral = async (userId, referralId, updates) => {
  try {
    // Validate input
    const validation = validateData(updateReferralSchema, updates);
    if (!validation.success) {
      return { success: false, error: validation.error.message, data: null };
    }

    const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.REFERRALS, referralId);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'Referral not found', data: null };
    }

    // Update with timestamp
    await updateDoc(docRef, {
      ...validation.data,
      updatedAt: serverTimestamp()
    });

    // Fetch updated document
    const updatedSnap = await getDoc(docRef);

    return {
      success: true,
      data: docToObject(updatedSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'update referral');
  }
};

/**
 * Delete a referral (and all its subcollections)
 * @param {string} userId - Authenticated user ID
 * @param {string} referralId - Referral ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteReferral = async (userId, referralId) => {
  try {
    // Note: This only deletes the referral document.
    // Subcollections (conversations) must be deleted separately or via Cloud Functions
    const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.REFERRALS, referralId);
    
    // Check if exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'Referral not found' };
    }

    await deleteDoc(docRef);

    return {
      success: true,
      error: null
    };
  } catch (error) {
    return handleError(error, 'delete referral');
  }
};

// ==================== CONVERSATIONS ====================

/**
 * Create a new conversation for a referral
 * @param {string} userId - Authenticated user ID
 * @param {string} referralId - Referral ID
 * @param {Object} conversationData - Conversation data
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const createConversation = async (userId, referralId, conversationData) => {
  try {
    // Validate input
    const validation = validateData(createConversationSchema, conversationData);
    if (!validation.success) {
      return { success: false, error: validation.error.message, data: null };
    }

    // Check if referral exists
    const referralRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.REFERRALS, referralId);
    const referralSnap = await getDoc(referralRef);
    if (!referralSnap.exists()) {
      return { success: false, error: 'Referral not found', data: null };
    }

    // Prepare document with timestamp
    const docData = {
      ...validation.data,
      referralId,
      createdAt: serverTimestamp()
    };

    // Add to Firestore
    const conversationsRef = collection(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.REFERRALS,
      referralId,
      COLLECTIONS.CONVERSATIONS
    );
    const docRef = await addDoc(conversationsRef, docData);

    // Fetch the created document
    const docSnap = await getDoc(docRef);

    return {
      success: true,
      data: docToObject(docSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'create conversation');
  }
};

/**
 * Get all conversations for a referral
 * @param {string} userId - Authenticated user ID
 * @param {string} referralId - Referral ID
 * @param {Object} options - Query options { limitCount, lastDoc }
 * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>}
 */
export const getConversations = async (userId, referralId, options = {}) => {
  try {
    const {
      limitCount = DEFAULT_PAGE_SIZE,
      lastDoc = null
    } = options;

    const conversationsRef = collection(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.REFERRALS,
      referralId,
      COLLECTIONS.CONVERSATIONS
    );

    // Build query - without ordering to avoid index requirement
    // Ordering will be done client-side in the component
    let q = query(conversationsRef, limit(limitCount));
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(docToObject);

    return {
      success: true,
      data: conversations,
      error: null,
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
  } catch (error) {
    return handleError(error, 'get conversations');
  }
};

/**
 * Update a conversation
 * @param {string} userId - Authenticated user ID
 * @param {string} referralId - Referral ID
 * @param {string} conversationId - Conversation ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const updateConversation = async (userId, referralId, conversationId, updates) => {
  try {
    // Validate input
    const validation = validateData(updateConversationSchema, updates);
    if (!validation.success) {
      return { success: false, error: validation.error.message, data: null };
    }

    const docRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.REFERRALS,
      referralId,
      COLLECTIONS.CONVERSATIONS,
      conversationId
    );

    // Check if exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'Conversation not found', data: null };
    }

    // Update
    await updateDoc(docRef, validation.data);

    // Fetch updated document
    const updatedSnap = await getDoc(docRef);

    return {
      success: true,
      data: docToObject(updatedSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'update conversation');
  }
};

/**
 * Delete a conversation
 * @param {string} userId - Authenticated user ID
 * @param {string} referralId - Referral ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteConversation = async (userId, referralId, conversationId) => {
  try {
    const docRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.REFERRALS,
      referralId,
      COLLECTIONS.CONVERSATIONS,
      conversationId
    );

    // Check if exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'Conversation not found' };
    }

    await deleteDoc(docRef);

    return {
      success: true,
      error: null
    };
  } catch (error) {
    return handleError(error, 'delete conversation');
  }
};

// ==================== TASKS ====================

/**
 * Create a new task
 * @param {string} userId - Authenticated user ID
 * @param {Object} taskData - Task data
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const createTask = async (userId, taskData) => {
  try {
    // Validate input
    const validation = validateData(createTaskSchema, taskData);
    if (!validation.success) {
      return { success: false, error: validation.error.message, data: null };
    }

    // Prepare document with timestamps
    const docData = {
      ...validation.data,
      userId,
      // Convert Date to Timestamp if provided
      dueAt: validation.data.dueAt ? Timestamp.fromDate(validation.data.dueAt) : null,
      snoozedUntil: validation.data.snoozedUntil ? Timestamp.fromDate(validation.data.snoozedUntil) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add to Firestore
    const tasksRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TASKS);
    const docRef = await addDoc(tasksRef, docData);

    // Fetch the created document
    const docSnap = await getDoc(docRef);

    return {
      success: true,
      data: docToObject(docSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'create task');
  }
};

/**
 * Get all tasks for a user
 * @param {string} userId - Authenticated user ID
 * @param {Object} options - Query options { status, referralId, orderByField, limitCount, lastDoc }
 * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>}
 */
export const getTasks = async (userId, options = {}) => {
  try {
    const {
      status = null,
      referralId = null,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      limitCount = DEFAULT_PAGE_SIZE,
      lastDoc = null
    } = options;

    const tasksRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TASKS);

    // Build query
    let q = query(tasksRef);

    // Filter by status if provided
    if (status) {
      q = query(q, where('status', '==', status));
    }

    // Filter by referralId if provided
    if (referralId) {
      q = query(q, where('referralId', '==', referralId));
    }

    // Order by field
    q = query(q, orderBy(orderByField, orderDirection));

    // Pagination
    q = query(q, limit(limitCount));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(docToObject);

    return {
      success: true,
      data: tasks,
      error: null,
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
  } catch (error) {
    return handleError(error, 'get tasks');
  }
};

/**
 * Get a single task by ID
 * @param {string} userId - Authenticated user ID
 * @param {string} taskId - Task ID
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const getTask = async (userId, taskId) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.TASKS, taskId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Task not found', data: null };
    }

    return {
      success: true,
      data: docToObject(docSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'get task');
  }
};

/**
 * Update a task
 * @param {string} userId - Authenticated user ID
 * @param {string} taskId - Task ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const updateTask = async (userId, taskId, updates) => {
  try {
    // Validate input
    const validation = validateData(updateTaskSchema, updates);
    if (!validation.success) {
      return { success: false, error: validation.error.message, data: null };
    }

    const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.TASKS, taskId);

    // Check if exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'Task not found', data: null };
    }

    // Prepare updates with timestamps
    const updateData = {
      ...validation.data,
      updatedAt: serverTimestamp()
    };

    // Convert Date to Timestamp if provided
    if (validation.data.dueAt !== undefined) {
      updateData.dueAt = validation.data.dueAt ? Timestamp.fromDate(validation.data.dueAt) : null;
    }
    if (validation.data.snoozedUntil !== undefined) {
      updateData.snoozedUntil = validation.data.snoozedUntil ? Timestamp.fromDate(validation.data.snoozedUntil) : null;
    }

    // Update
    await updateDoc(docRef, updateData);

    // Fetch updated document
    const updatedSnap = await getDoc(docRef);

    return {
      success: true,
      data: docToObject(updatedSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'update task');
  }
};

/**
 * Delete a task
 * @param {string} userId - Authenticated user ID
 * @param {string} taskId - Task ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteTask = async (userId, taskId) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.TASKS, taskId);

    // Check if exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'Task not found' };
    }

    await deleteDoc(docRef);

    return {
      success: true,
      error: null
    };
  } catch (error) {
    return handleError(error, 'delete task');
  }
};
// ==========================================
// REMINDER OPERATIONS
// ==========================================

/**
 * Get all reminders for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>}
 */
export const getReminders = async (userId, options = {}) => {
  try {
    const {
      limitCount = 100,
      onlyActive = false,
      referralId = null
    } = options;

    const remindersRef = collection(db, COLLECTIONS.USERS, userId, 'reminders');
    
    let constraints = [];
    
    // Filter by referral if specified
    if (referralId) {
      constraints.push(where('referralId', '==', referralId));
    }
    
    // Filter active reminders
    if (onlyActive) {
      constraints.push(where('isCompleted', '==', false));
    }
    
    // Order by due date
    constraints.push(orderBy('dueDate', 'asc'));
    constraints.push(limit(limitCount));

    const q = query(remindersRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const reminders = [];
    querySnapshot.forEach((doc) => {
      reminders.push(docToObject(doc));
    });

    return {
      success: true,
      data: reminders,
      error: null
    };
  } catch (error) {
    return handleError(error, 'get reminders');
  }
};

/**
 * Get a single reminder by ID
 * @param {string} userId - User ID
 * @param {string} reminderId - Reminder ID
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const getReminder = async (userId, reminderId) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId, 'reminders', reminderId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Reminder not found',
        data: null
      };
    }

    return {
      success: true,
      data: docToObject(docSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'get reminder');
  }
};

/**
 * Create a new reminder
 * @param {string} userId - User ID
 * @param {Object} reminderData - Reminder data
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const createReminder = async (userId, reminderData) => {
  try {
    // Validate required fields
    const requiredFields = ['title', 'action', 'referralId', 'dueDate'];
    for (const field of requiredFields) {
      if (!reminderData[field]) {
        return {
          success: false,
          error: `Missing required field: ${field}`,
          data: null
        };
      }
    }

    const remindersRef = collection(db, COLLECTIONS.USERS, userId, 'reminders');

    // Prepare data with timestamps
    const data = {
      ...reminderData,
      dueDate: reminderData.dueDate instanceof Date 
        ? Timestamp.fromDate(reminderData.dueDate)
        : Timestamp.fromDate(new Date(reminderData.dueDate)),
      isCompleted: reminderData.isCompleted || false,
      completedAt: null,
      snoozedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(remindersRef, data);
    const docSnap = await getDoc(docRef);

    return {
      success: true,
      data: docToObject(docSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'create reminder');
  }
};

/**
 * Update a reminder
 * @param {string} userId - User ID
 * @param {string} reminderId - Reminder ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const updateReminder = async (userId, reminderId, updates) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId, 'reminders', reminderId);

    // Check if exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Reminder not found',
        data: null
      };
    }

    // Prepare updates
    const data = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Convert date if provided
    if (updates.dueDate) {
      data.dueDate = updates.dueDate instanceof Date
        ? Timestamp.fromDate(updates.dueDate)
        : Timestamp.fromDate(new Date(updates.dueDate));
    }

    await updateDoc(docRef, data);

    // Fetch updated document
    const updatedSnap = await getDoc(docRef);

    return {
      success: true,
      data: docToObject(updatedSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'update reminder');
  }
};

/**
 * Complete a reminder
 * @param {string} userId - User ID
 * @param {string} reminderId - Reminder ID
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const completeReminder = async (userId, reminderId) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId, 'reminders', reminderId);

    // Check if exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Reminder not found',
        data: null
      };
    }

    const data = {
      isCompleted: true,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, data);

    // Fetch updated document
    const updatedSnap = await getDoc(docRef);

    return {
      success: true,
      data: docToObject(updatedSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'complete reminder');
  }
};

/**
 * Snooze a reminder (update due date)
 * @param {string} userId - User ID
 * @param {string} reminderId - Reminder ID
 * @param {Date} newDueDate - New due date
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const snoozeReminder = async (userId, reminderId, newDueDate) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId, 'reminders', reminderId);

    // Check if exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Reminder not found',
        data: null
      };
    }

    const currentData = docSnap.data();
    const snoozedCount = (currentData.snoozedCount || 0) + 1;

    const data = {
      dueDate: newDueDate instanceof Date
        ? Timestamp.fromDate(newDueDate)
        : Timestamp.fromDate(new Date(newDueDate)),
      snoozedCount,
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, data);

    // Fetch updated document
    const updatedSnap = await getDoc(docRef);

    return {
      success: true,
      data: docToObject(updatedSnap),
      error: null
    };
  } catch (error) {
    return handleError(error, 'snooze reminder');
  }
};

/**
 * Delete a reminder
 * @param {string} userId - User ID
 * @param {string} reminderId - Reminder ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteReminder = async (userId, reminderId) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId, 'reminders', reminderId);

    // Check if exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'Reminder not found' };
    }

    await deleteDoc(docRef);

    return {
      success: true,
      error: null
    };
  } catch (error) {
    return handleError(error, 'delete reminder');
  }
};

/**
 * Bulk update reminders (e.g., auto-complete)
 * @param {string} userId - User ID
 * @param {Array<string>} reminderIds - Array of reminder IDs
 * @param {Object} updates - Updates to apply
 * @returns {Promise<{success: boolean, updated: number, error: string|null}>}
 */
export const bulkUpdateReminders = async (userId, reminderIds, updates) => {
  try {
    let updated = 0;

    for (const reminderId of reminderIds) {
      const result = await updateReminder(userId, reminderId, updates);
      if (result.success) {
        updated++;
      }
    }

    return {
      success: true,
      updated,
      error: null
    };
  } catch (error) {
    return handleError(error, 'bulk update reminders');
  }
};

// ==================== BULK DELETE OPERATIONS ====================

/**
 * Delete all referrals for a user
 * WARNING: This is destructive and cannot be undone
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, deleted: number, error: string|null}>}
 */
export const deleteAllReferrals = async (userId) => {
  try {
    const referralsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.REFERRALS);
    const snapshot = await getDocs(referralsRef);
    
    let deleted = 0;
    const deletePromises = [];

    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(docSnap.ref));
      deleted++;
    });

    await Promise.all(deletePromises);

    return {
      success: true,
      deleted,
      error: null
    };
  } catch (error) {
    return handleError(error, 'delete all referrals');
  }
};

/**
 * Delete all tasks for a user
 * WARNING: This is destructive and cannot be undone
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, deleted: number, error: string|null}>}
 */
export const deleteAllTasks = async (userId) => {
  try {
    const tasksRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TASKS);
    const snapshot = await getDocs(tasksRef);
    
    let deleted = 0;
    const deletePromises = [];

    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(docSnap.ref));
      deleted++;
    });

    await Promise.all(deletePromises);

    return {
      success: true,
      deleted,
      error: null
    };
  } catch (error) {
    return handleError(error, 'delete all tasks');
  }
};

/**
 * Delete all reminders for a user
 * WARNING: This is destructive and cannot be undone
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, deleted: number, error: string|null}>}
 */
export const deleteAllReminders = async (userId) => {
  try {
    const remindersRef = collection(db, COLLECTIONS.USERS, userId, 'reminders');
    const snapshot = await getDocs(remindersRef);
    
    let deleted = 0;
    const deletePromises = [];

    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(docSnap.ref));
      deleted++;
    });

    await Promise.all(deletePromises);

    return {
      success: true,
      deleted,
      error: null
    };
  } catch (error) {
    return handleError(error, 'delete all reminders');
  }
};
