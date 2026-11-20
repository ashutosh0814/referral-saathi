import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, AlertTriangle, Shield, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import ProfileSettings from '../components/settings/ProfileSettings';
import Preferences from '../components/settings/Preferences';
import { deleteAllReferrals, deleteAllTasks, deleteAllReminders } from '../lib/firestore';
import { clearPreferences } from '../lib/preferencesManager';
import { clearConsent } from '../lib/consentManager';

/**
 * SettingsPage Component
 * User profile, preferences, and account management
 */
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    const result = await logout();
    if (result.success) {
      navigate('/auth');
    }
    setLogoutLoading(false);
  };

  const handleDeleteAllData = async () => {
    if (!user?.uid) return;

    setDeleteLoading(true);

    try {
      // Delete all referrals (this cascades to conversations)
      await deleteAllReferrals(user.uid);
      
      // Delete all tasks
      await deleteAllTasks(user.uid);
      
      // Delete all reminders
      await deleteAllReminders(user.uid);

      // Clear local preferences
      clearPreferences();
      clearConsent();

      setShowDeleteConfirm(false);
      
      // Show success and redirect to dashboard
      alert('All your data has been deleted successfully. Starting fresh!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete data:', error);
      alert('Failed to delete some data. Please try again or contact support.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="text-sm sm:text-base text-gray-200 mt-1 sm:mt-2">
          Manage your account, preferences, and data
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6">
        {/* Profile Settings */}
        <ProfileSettings user={user} />

        {/* Preferences */}
        <Preferences />

        {/* Account Actions */}
        <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            <Shield className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Account Actions
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {/* Sign Out */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 sm:p-4 border border-[#282828] rounded-md gap-3 bg-[#121212]">
              <div className="flex-1">
                <div className="font-medium text-sm sm:text-base text-white">Sign Out</div>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  Sign out of your account on this device
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleLogout}
                loading={logoutLoading}
                className="w-full sm:w-auto sm:ml-4"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Delete All Data */}
            <div className="border border-red-500/30 rounded-md p-3 sm:p-4 bg-red-500/10">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-sm sm:text-base text-red-400">Danger Zone</div>
                  <p className="text-xs sm:text-sm text-red-300 mt-1">
                    Delete all your referrals, conversations, reminders, and preferences. This action cannot be undone.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <Button
                      variant="secondary"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="mt-3 w-full sm:w-auto border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All My Data
                    </Button>
                  ) : (
                    <div className="mt-3 p-3 bg-[#121212] border border-red-500/30 rounded-md">
                      <p className="text-xs sm:text-sm font-medium text-red-400 mb-2 sm:mb-3">
                        Are you absolutely sure?
                      </p>
                      <p className="text-xs text-red-300 mb-3">
                        This will permanently delete:
                      </p>
                      <ul className="text-xs text-red-300 space-y-1 mb-4 ml-4 list-disc">
                        <li>All referral records</li>
                        <li>All conversation history</li>
                        <li>All reminders and tasks</li>
                        <li>All preferences and settings</li>
                      </ul>
                      <p className="text-xs text-red-300 mb-4">
                        Your account will remain active, but all data will be erased.
                      </p>
                      <div className="flex flex-col-reverse sm:flex-row gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleteLoading}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleDeleteAllData}
                          loading={deleteLoading}
                          className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Yes, Delete Everything
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Data Privacy</h3>
              <p className="text-xs text-blue-700 mt-1">
                Your data is stored securely in Firebase Firestore. Only you can access your referrals and conversations. 
                When using AI features, message content is sent to Google Gemini API for analysis. 
                No API keys or credentials are exposed to the client.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
