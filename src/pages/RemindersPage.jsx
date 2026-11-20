/**
 * RemindersPage
 * Main page for viewing and managing all reminders
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Plus,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2,
  Filter,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAllReminders } from '../hooks/useReminders';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ReminderCard from '../components/reminders/ReminderCard';
import ReminderForm from '../components/reminders/ReminderForm';

function RemindersPage() {
  const navigate = useNavigate();
  const {
    reminders,
    isLoading,
    error,
    stats,
    createReminder,
    completeReminder,
    snoozeReminder,
    updateReminder,
    deleteReminder,
    refreshReminders,
    getRemindersByState
  } = useAllReminders();

  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('active'); // active, completed, all
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Get reminders by state
  const overdueReminders = getRemindersByState('overdue');
  const dueTodayReminders = getRemindersByState('due_today');
  const upcomingReminders = getRemindersByState('upcoming');
  const completedReminders = getRemindersByState('completed');

  // Filter reminders based on selection
  const getFilteredReminders = () => {
    if (filter === 'completed') {
      return completedReminders;
    } else if (filter === 'active') {
      return reminders.filter(r => !r.isCompleted);
    }
    return reminders;
  };

  // Handle create reminder
  const handleCreateReminder = async (reminderData) => {
    setIsActionLoading(true);
    const result = await createReminder(reminderData);
    setIsActionLoading(false);

    if (result.success) {
      setShowCreateModal(false);
    } else {
      alert(result.error || 'Failed to create reminder');
    }
  };

  // Handle edit reminder
  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
  };

  const handleUpdateReminder = async (reminderData) => {
    if (!editingReminder) return;

    setIsActionLoading(true);
    const result = await updateReminder(editingReminder.id, reminderData);
    setIsActionLoading(false);

    if (result.success) {
      setEditingReminder(null);
    } else {
      alert(result.error || 'Failed to update reminder');
    }
  };

  // Handle complete reminder
  const handleCompleteReminder = async (reminderId) => {
    setIsActionLoading(true);
    const result = await completeReminder(reminderId);
    setIsActionLoading(false);

    if (!result.success) {
      alert(result.error || 'Failed to complete reminder');
    }
  };

  // Handle snooze reminder
  const handleSnoozeReminder = async (reminderId, newDueDate) => {
    setIsActionLoading(true);
    const result = await snoozeReminder(reminderId, newDueDate);
    setIsActionLoading(false);

    if (!result.success) {
      alert(result.error || 'Failed to snooze reminder');
    }
  };

  // Handle delete reminder
  const handleDeleteReminder = async (reminderId) => {
    setDeleteConfirm(reminderId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsActionLoading(true);
    const result = await deleteReminder(deleteConfirm);
    setIsActionLoading(false);

    if (result.success) {
      setDeleteConfirm(null);
    } else {
      alert(result.error || 'Failed to delete reminder');
    }
  };

  // Handle reminder click
  const handleReminderClick = (reminder) => {
    if (reminder.referralId) {
      navigate(`/referrals/${reminder.referralId}`);
    }
  };

  // Loading state
  if (isLoading && reminders.length === 0) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-200">Loading reminders...</p>
        </div>
      </div>
    );
  }

  const filteredReminders = getFilteredReminders();
  const hasActiveReminders = filter === 'active' && filteredReminders.length > 0;
  const hasOverdue = overdueReminders.length > 0;
  const hasDueToday = dueTodayReminders.length > 0;

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Reminders
            </h1>
            <p className="text-gray-200">
              Manage your follow-up reminders and never miss an important task
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={refreshReminders}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Reminder
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300 mb-1">Total Active</p>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-400 mb-1">Overdue</p>
                  <p className="text-2xl font-bold text-red-300">{stats.overdue}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-400 mb-1">Due Today</p>
                  <p className="text-2xl font-bold text-yellow-300">{stats.dueToday}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-300">{stats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-gray-300" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-300 border border-[#282828] hover:bg-[#282828]'
              }`}
            >
              Active ({stats?.active || 0})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-300 border border-[#282828] hover:bg-[#282828]'
              }`}
            >
              Completed ({stats?.completed || 0})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-300 border border-[#282828] hover:bg-[#282828]'
              }`}
            >
              All ({stats?.total || 0})
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-900 font-semibold mb-1">Error Loading Reminders</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reminders Sections */}
        {filter === 'active' && hasActiveReminders && (
          <>
            {/* Overdue Section */}
            {hasOverdue && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Overdue
                  </h2>
                  <Badge variant="error">{overdueReminders.length}</Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {overdueReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onComplete={handleCompleteReminder}
                      onSnooze={handleSnoozeReminder}
                      onEdit={handleEditReminder}
                      onDelete={handleDeleteReminder}
                      onClick={handleReminderClick}
                      isLoading={isActionLoading}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Due Today Section */}
            {hasDueToday && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Due Today
                  </h2>
                  <Badge variant="warning">{dueTodayReminders.length}</Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {dueTodayReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onComplete={handleCompleteReminder}
                      onSnooze={handleSnoozeReminder}
                      onEdit={handleEditReminder}
                      onDelete={handleDeleteReminder}
                      onClick={handleReminderClick}
                      isLoading={isActionLoading}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Section */}
            {upcomingReminders.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-semibold text-white">
                    Upcoming
                  </h2>
                  <Badge variant="default">{upcomingReminders.length}</Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {upcomingReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onComplete={handleCompleteReminder}
                      onSnooze={handleSnoozeReminder}
                      onEdit={handleEditReminder}
                      onDelete={handleDeleteReminder}
                      onClick={handleReminderClick}
                      isLoading={isActionLoading}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Completed or All Filter */}
        {(filter === 'completed' || filter === 'all') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={handleCompleteReminder}
                onSnooze={handleSnoozeReminder}
                onEdit={handleEditReminder}
                onDelete={handleDeleteReminder}
                onClick={handleReminderClick}
                isLoading={isActionLoading}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredReminders.length === 0 && !isLoading && (
          <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {filter === 'completed' 
                ? 'No completed reminders yet'
                : filter === 'active'
                  ? 'No active reminders'
                  : 'No reminders yet'}
            </h3>
            <p className="text-gray-300 mb-6">
              {filter === 'completed'
                ? 'Completed reminders will appear here'
                : 'Create your first reminder to stay on top of your referral follow-ups'}
            </p>
            {filter !== 'completed' && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Reminder
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Reminder Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Reminder"
      >
        <ReminderForm
          onSubmit={handleCreateReminder}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isActionLoading}
        />
      </Modal>

      {/* Edit Reminder Modal */}
      <Modal
        isOpen={!!editingReminder}
        onClose={() => setEditingReminder(null)}
        title="Edit Reminder"
      >
        <ReminderForm
          initialData={editingReminder}
          onSubmit={handleUpdateReminder}
          onCancel={() => setEditingReminder(null)}
          isLoading={isActionLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity"
            onClick={() => setDeleteConfirm(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-[#1a1a1a] border border-[#282828] rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Delete Reminder?
                  </h3>
                  <p className="text-sm text-gray-300">
                    This action cannot be undone. The reminder will be permanently removed.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                  disabled={isActionLoading}
                  isLoading={isActionLoading}
                  className="flex-1"
                >
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isActionLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RemindersPage;
