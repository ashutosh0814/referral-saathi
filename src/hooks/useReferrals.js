/**
 * useReferrals Hook
 * Manages referral data fetching, state, and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getReferrals,
  createReferral,
  updateReferral,
  deleteReferral
} from '../lib/firestore';

export const useReferrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch referrals from Firestore
  const fetchReferrals = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await getReferrals(user.uid, {
        orderByField: 'updatedAt',
        orderDirection: 'desc'
      });

      if (result.success) {
        setReferrals(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError(err.message || 'Failed to fetch referrals');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  // Filter and search referrals
  useEffect(() => {
    let filtered = [...referrals];

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(ref => ref.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(ref => {
        return (
          ref.companyName?.toLowerCase().includes(query) ||
          ref.jobTitle?.toLowerCase().includes(query) ||
          ref.employeeName?.toLowerCase().includes(query) ||
          ref.employeeDesignation?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredReferrals(filtered);
  }, [referrals, searchQuery, statusFilter]);

  // Add a new referral
  const addReferral = async (referralData) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await createReferral(user.uid, referralData);
      
      if (result.success) {
        // Add to local state immediately for better UX
        setReferrals(prev => [result.data, ...prev]);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error adding referral:', err);
      return { success: false, error: err.message || 'Failed to add referral' };
    }
  };

  // Update an existing referral
  const editReferral = async (referralId, updates) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await updateReferral(user.uid, referralId, updates);
      
      if (result.success) {
        // Update local state
        setReferrals(prev =>
          prev.map(ref => ref.id === referralId ? result.data : ref)
        );
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error updating referral:', err);
      return { success: false, error: err.message || 'Failed to update referral' };
    }
  };

  // Delete a referral
  const removeReferral = async (referralId) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await deleteReferral(user.uid, referralId);
      
      if (result.success) {
        // Remove from local state
        setReferrals(prev => prev.filter(ref => ref.id !== referralId));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error deleting referral:', err);
      return { success: false, error: err.message || 'Failed to delete referral' };
    }
  };

  // Refresh data from server
  const refresh = useCallback(() => {
    return fetchReferrals();
  }, [fetchReferrals]);

  // Get stats for dashboard
  const stats = {
    total: referrals.length,
    byStatus: referrals.reduce((acc, ref) => {
      acc[ref.status] = (acc[ref.status] || 0) + 1;
      return acc;
    }, {})
  };

  return {
    // Data
    referrals: filteredReferrals,
    allReferrals: referrals,
    
    // State
    isLoading,
    error,
    
    // Search & Filter
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    
    // Actions
    addReferral,
    editReferral,
    removeReferral,
    refresh,
    
    // Stats
    stats
  };
};
