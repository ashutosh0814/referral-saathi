/**
 * useReminders Hook
 * Manages reminder state, CRUD operations, and automation rules
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getReminders,
  createReminder as createReminderFirestore,
  updateReminder as updateReminderFirestore,
  completeReminder as completeReminderFirestore,
  snoozeReminder as snoozeReminderFirestore,
  deleteReminder as deleteReminderFirestore,
  bulkUpdateReminders
} from '../lib/firestore';
import {
  validateReminderCreation,
  checkRemindersOnFocus,
  getReminderStatistics,
  sortRemindersByPriority
} from '../lib/automation';
import {
  filterRemindersByState,
  sortRemindersByDueDate
} from '../utils/dateUtils';

/**
 * Custom hook for reminder management
 */
export const useReminders = (options = {}) => {
  const { user } = useAuth();
  const { referralId = null, onlyActive = false, autoLoad = true } = options;

  // State
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  /**
   * Load reminders from Firestore
   */
  const loadReminders = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getReminders(user.uid, {
        referralId,
        onlyActive,
        limitCount: 100
      });

      if (result.success) {
        setReminders(result.data);
        setStats(getReminderStatistics(result.data));
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading reminders:', err);
      setError('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  }, [user, referralId, onlyActive]);

  /**
   * Create a new reminder
   */
  const createReminder = useCallback(
    async (reminderData, referralStatus = null, existingReminders = null) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      // Use existing reminders or current state
      const remindersToCheck = existingReminders || reminders;

      // Validate if referral status provided
      if (referralStatus) {
        const validation = validateReminderCreation(
          reminderData,
          referralStatus,
          remindersToCheck
        );

        if (!validation.valid) {
          return { success: false, error: validation.error };
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await createReminderFirestore(user.uid, reminderData);

        if (result.success) {
          // Add to local state
          setReminders((prev) => {
            const updated = [...prev, result.data];
            setStats(getReminderStatistics(updated));
            return updated;
          });
        }

        return result;
      } catch (err) {
        console.error('Error creating reminder:', err);
        return { success: false, error: 'Failed to create reminder' };
      } finally {
        setIsLoading(false);
      }
    },
    [user, reminders]
  );

  /**
   * Update a reminder
   */
  const updateReminder = useCallback(
    async (reminderId, updates) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      setIsLoading(true);
      setError(null);

      try {
        const result = await updateReminderFirestore(user.uid, reminderId, updates);

        if (result.success) {
          // Update local state
          setReminders((prev) => {
            const updated = prev.map((r) =>
              r.id === reminderId ? result.data : r
            );
            setStats(getReminderStatistics(updated));
            return updated;
          });
        }

        return result;
      } catch (err) {
        console.error('Error updating reminder:', err);
        return { success: false, error: 'Failed to update reminder' };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Complete a reminder
   */
  const completeReminder = useCallback(
    async (reminderId) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      setIsLoading(true);
      setError(null);

      try {
        const result = await completeReminderFirestore(user.uid, reminderId);

        if (result.success) {
          // Update local state
          setReminders((prev) => {
            const updated = prev.map((r) =>
              r.id === reminderId ? result.data : r
            );
            setStats(getReminderStatistics(updated));
            return updated;
          });
        }

        return result;
      } catch (err) {
        console.error('Error completing reminder:', err);
        return { success: false, error: 'Failed to complete reminder' };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Snooze a reminder
   */
  const snoozeReminder = useCallback(
    async (reminderId, newDueDate) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      setIsLoading(true);
      setError(null);

      try {
        const result = await snoozeReminderFirestore(user.uid, reminderId, newDueDate);

        if (result.success) {
          // Update local state
          setReminders((prev) => {
            const updated = prev.map((r) =>
              r.id === reminderId ? result.data : r
            );
            setStats(getReminderStatistics(updated));
            return updated;
          });
        }

        return result;
      } catch (err) {
        console.error('Error snoozing reminder:', err);
        return { success: false, error: 'Failed to snooze reminder' };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Delete a reminder
   */
  const deleteReminder = useCallback(
    async (reminderId) => {
      if (!user) return { success: false, error: 'User not authenticated' };

      setIsLoading(true);
      setError(null);

      try {
        const result = await deleteReminderFirestore(user.uid, reminderId);

        if (result.success) {
          // Remove from local state
          setReminders((prev) => {
            const updated = prev.filter((r) => r.id !== reminderId);
            setStats(getReminderStatistics(updated));
            return updated;
          });
        }

        return result;
      } catch (err) {
        console.error('Error deleting reminder:', err);
        return { success: false, error: 'Failed to delete reminder' };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Auto-complete reminders in bulk
   */
  const autoCompleteReminders = useCallback(
    async (reminderIds) => {
      if (!user || !reminderIds.length) return { success: false };

      try {
        const result = await bulkUpdateReminders(user.uid, reminderIds, {
          isCompleted: true,
          completedAt: new Date()
        });

        if (result.success) {
          // Reload reminders
          await loadReminders();
        }

        return result;
      } catch (err) {
        console.error('Error auto-completing reminders:', err);
        return { success: false, error: 'Failed to auto-complete reminders' };
      }
    },
    [user, loadReminders]
  );

  /**
   * Refresh reminders
   */
  const refreshReminders = useCallback(() => {
    loadReminders();
  }, [loadReminders]);

  /**
   * Check reminders on focus
   */
  const checkOnFocus = useCallback(() => {
    if (reminders.length === 0) return null;
    return checkRemindersOnFocus(reminders);
  }, [reminders]);

  /**
   * Get reminders by state
   */
  const getRemindersByState = useCallback(
    (state) => {
      return filterRemindersByState(reminders, state);
    },
    [reminders]
  );

  /**
   * Get sorted reminders
   */
  const getSortedReminders = useCallback(
    (sortBy = 'priority') => {
      if (sortBy === 'priority') {
        return sortRemindersByPriority(reminders);
      } else if (sortBy === 'dueDate') {
        return sortRemindersByDueDate(reminders);
      }
      return reminders;
    },
    [reminders]
  );

  // Auto-load reminders on mount and when dependencies change
  useEffect(() => {
    if (autoLoad && user) {
      loadReminders();
    }
  }, [autoLoad, user, loadReminders]);

  // Check reminders on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (user && reminders.length > 0) {
        // Refresh reminders when app regains focus
        loadReminders();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, reminders.length, loadReminders]);

  return {
    // State
    reminders,
    isLoading,
    error,
    stats,

    // CRUD operations
    createReminder,
    updateReminder,
    completeReminder,
    snoozeReminder,
    deleteReminder,
    autoCompleteReminders,

    // Utility functions
    loadReminders,
    refreshReminders,
    checkOnFocus,
    getRemindersByState,
    getSortedReminders
  };
};

/**
 * Hook for reminders on a specific referral
 */
export const useReferralReminders = (referralId) => {
  return useReminders({
    referralId,
    onlyActive: true,
    autoLoad: true
  });
};

/**
 * Hook for all active reminders
 */
export const useActiveReminders = () => {
  return useReminders({
    referralId: null,
    onlyActive: true,
    autoLoad: true
  });
};

/**
 * Hook for all reminders (including completed)
 */
export const useAllReminders = () => {
  return useReminders({
    referralId: null,
    onlyActive: false,
    autoLoad: true
  });
};
