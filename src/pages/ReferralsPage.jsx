/**
 * ReferralsPage - My Referrals Feature  
 * Complete referral management with CRUD operations, search, and filters
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ReferralCard from '../components/referrals/ReferralCard';
import ReferralForm from '../components/referrals/ReferralForm';
import ReferralFilters from '../components/referrals/ReferralFilters';
import { useReferrals } from '../hooks/useReferrals';

function ReferralsPage() {
  const navigate = useNavigate();
  const {
    referrals,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    addReferral,
    editReferral,
    removeReferral
  } = useReferrals();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Handle add referral
  const handleAddClick = () => {
    setEditingReferral(null);
    setIsFormOpen(true);
  };

  // Handle edit referral
  const handleEdit = (referral) => {
    setEditingReferral(referral);
    setIsFormOpen(true);
  };

  // Handle form submit (add or edit)
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);

    try {
      let result;
      if (editingReferral) {
        // Update existing referral
        result = await editReferral(editingReferral.id, formData);
      } else {
        // Create new referral
        result = await addReferral(formData);
      }

      if (result.success) {
        setIsFormOpen(false);
        setEditingReferral(null);
      } else {
        // Show error (you could use a toast notification here)
        alert(`Error: ${result.error || 'Failed to save referral'}`);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete referral
  const handleDelete = (referral) => {
    setDeleteConfirm(referral);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const result = await removeReferral(deleteConfirm.id);
      
      if (result.success) {
        setDeleteConfirm(null);
      } else {
        alert(`Error: ${result.error || 'Failed to delete referral'}`);
      }
    } catch (err) {
      console.error('Error deleting referral:', err);
      alert('An unexpected error occurred');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Handle card click (navigate to detail page)
  const handleCardClick = (referral) => {
    navigate(`/referrals/${referral.id}`);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              My Referrals
            </h1>
            <p className="text-gray-600">
              Manage and track all your referral opportunities
            </p>
          </div>
          <Button 
            leftIcon={<Plus />} 
            size="lg"
            onClick={handleAddClick}
          >
            Add Referral
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <ReferralFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            resultCount={referrals.length}
          />
        </div>

        {/* Content Area */}
        {error ? (
          // Error State
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-900 font-semibold mb-1">
                  Error Loading Referrals
                </h3>
                <p className="text-red-700 text-sm">
                  {error || 'An unexpected error occurred. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading your referrals...</p>
          </div>
        ) : referrals.length > 0 ? (
          // Referrals Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {referrals.map((referral) => (
              <ReferralCard
                key={referral.id}
                referral={referral}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          // Empty State
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title={searchQuery || statusFilter !== 'all' 
              ? "No referrals found" 
              : "No referrals yet"
            }
            description={searchQuery || statusFilter !== 'all'
              ? "Try adjusting your search or filter criteria."
              : "Start tracking your referral opportunities by adding your first referral."
            }
            actionLabel={searchQuery || statusFilter !== 'all' 
              ? "Clear Filters" 
              : "Add Your First Referral"
            }
            onAction={searchQuery || statusFilter !== 'all' 
              ? () => { setSearchQuery(''); setStatusFilter('all'); }
              : handleAddClick
            }
          />
        )}
      </div>

      {/* Add/Edit Referral Form Modal */}
      <ReferralForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReferral(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingReferral}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity"
            onClick={cancelDelete}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Delete Referral
                  </h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete the referral for{' '}
                    <strong>{deleteConfirm.jobTitle}</strong> at{' '}
                    <strong>{deleteConfirm.companyName}</strong>? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={cancelDelete}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReferralsPage;
