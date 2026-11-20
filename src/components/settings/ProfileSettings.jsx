import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { User, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

/**
 * ProfileSettings Component
 * Allows users to view and update their profile information
 */
export default function ProfileSettings({ user }) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Display name cannot be empty' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim()
      });

      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = displayName !== (user?.displayName || '');

  return (
    <div className="bg-green-50/40 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="inline w-4 h-4 mr-1" />
            Email Address
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-sm">
            {user?.email || 'No email'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            <User className="inline w-4 h-4 mr-1" />
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your display name"
            maxLength={50}
          />
          <p className="text-xs text-gray-500 mt-1">
            This is how your name will appear in the app
          </p>
        </div>

        {/* Email Verification Status */}
        {user?.emailVerified !== undefined && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Verification
            </label>
            <div className="flex items-center gap-2">
              {user.emailVerified ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Email verified</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-600">Email not verified</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Account ID (for support) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account ID
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-xs font-mono break-all">
            {user?.uid || 'Unknown'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use this ID when contacting support
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`flex items-start gap-2 p-3 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={!hasChanges || loading}
            loading={loading}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
