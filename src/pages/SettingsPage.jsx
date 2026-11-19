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
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account, preferences, and data
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <ProfileSettings user={user} />

        {/* Preferences */}
        <Preferences />

        {/* Account Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <Shield className="inline w-5 h-5 mr-2" />
            Account Actions
          </h2>

          <div className="space-y-4">
            {/* Sign Out */}
            <div className="flex items-start justify-between p-4 border border-gray-200 rounded-md">
              <div>
                <div className="font-medium text-gray-900">Sign Out</div>
                <p className="text-sm text-gray-600 mt-1">
                  Sign out of your account on this device
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleLogout}
                loading={logoutLoading}
                className="ml-4"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Delete All Data */}
            <div className="border border-red-200 rounded-md p-4 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-red-900">Danger Zone</div>
                  <p className="text-sm text-red-700 mt-1">
                    Delete all your referrals, conversations, reminders, and preferences. This action cannot be undone.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <Button
                      variant="secondary"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All My Data
                    </Button>
                  ) : (
                    <div className="mt-3 p-3 bg-white border border-red-300 rounded-md">
                      <p className="text-sm font-medium text-red-900 mb-3">
                        Are you absolutely sure?
                      </p>
                      <p className="text-xs text-red-700 mb-3">
                        This will permanently delete:
                      </p>
                      <ul className="text-xs text-red-700 space-y-1 mb-4 ml-4 list-disc">
                        <li>All referral records</li>
                        <li>All conversation history</li>
                        <li>All reminders and tasks</li>
                        <li>All preferences and settings</li>
                      </ul>
                      <p className="text-xs text-red-700 mb-4">
                        Your account will remain active, but all data will be erased.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          onClick={handleDeleteAllData}
                          loading={deleteLoading}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Yes, Delete Everything
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleteLoading}
                        >
                          Cancel
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
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
