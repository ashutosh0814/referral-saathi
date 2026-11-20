/**
 * DashboardPage
 * Action-oriented overview showing what needs attention
 * Fully responsive with improved mobile layout
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getReferrals, getConversations } from '../lib/firestore';
import { useAllReminders } from '../hooks/useReminders';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ReferralForm from '../components/referrals/ReferralForm';
import RecentReferrals from '../components/dashboard/RecentReferrals';
import UpcomingReminders from '../components/dashboard/UpcomingReminders';

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [referrals, setReferrals] = useState([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);
  const [pendingConversations, setPendingConversations] = useState([]);
  const [showAddReferralModal, setShowAddReferralModal] = useState(false);

  // Reminders hook
  const {
    reminders,
    isLoading: isLoadingReminders,
    completeReminder,
    stats: reminderStats
  } = useAllReminders();

  // Load referrals
  useEffect(() => {
    const loadReferrals = async () => {
      if (!user) return;

      setIsLoadingReferrals(true);
      try {
        const result = await getReferrals(user.uid, {
          limitCount: 10,
          sortBy: 'updatedAt'
        });

        if (result.success) {
          // Get conversation counts for each referral
          const referralsWithCounts = await Promise.all(
            result.data.map(async (ref) => {
              const convResult = await getConversations(user.uid, ref.id, { limitCount: 100 });
              return {
                ...ref,
                conversationCount: convResult.success ? convResult.data.length : 0
              };
            })
          );
          setReferrals(referralsWithCounts);

          // Find pending conversations (waiting for response)
          const pending = referralsWithCounts.filter(r => 
            r.status === 'message_sent' || r.status === 'waiting_response'
          );
          setPendingConversations(pending);
        }
      } catch (error) {
        console.error('Error loading referrals:', error);
      } finally {
        setIsLoadingReferrals(false);
      }
    };

    loadReferrals();
  }, [user]);

  // Handle add referral
  const handleAddReferral = async (referralData) => {
    // This will be handled by ReferralForm
    navigate('/referrals');
  };

  // Calculate stats
  const activeReferrals = referrals.filter(r => 
    !['successful', 'rejected', 'closed'].includes(r.status)
  ).length;

  const isLoading = isLoadingReferrals || isLoadingReminders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome back! Here's what needs your attention.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Active Referrals</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {isLoading ? '-' : activeReferrals}
                </p>
              </div>
              <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Pending Replies</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {isLoading ? '-' : pendingConversations.length}
                </p>
              </div>
              <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Due Today</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {isLoading ? '-' : reminderStats?.dueToday || 0}
                </p>
              </div>
              <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Overdue</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {isLoading ? '-' : reminderStats?.overdue || 0}
                </p>
              </div>
              <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-5 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-white">
              <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Quick Actions</h2>
              <p className="text-amber-100 text-xs sm:text-sm">
                Jump right into your workflow
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAddReferralModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Add Referral
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/referrals')}
                leftIcon={<MessageSquare className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Reply Assistant
              </Button>
            </div>
          </div>
        </div>

        {/* Attention Needed */}
        {!isLoading && (pendingConversations.length > 0 || (reminderStats?.overdue || 0) > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-amber-900 mb-2">
                  Needs Attention
                </h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  {pendingConversations.length > 0 && (
                    <li className="break-words">
                      • {pendingConversations.length} {pendingConversations.length === 1 ? 'referral' : 'referrals'} waiting for employee response
                    </li>
                  )}
                  {(reminderStats?.overdue || 0) > 0 && (
                    <li className="break-words">
                      • {reminderStats.overdue} overdue {reminderStats.overdue === 1 ? 'reminder' : 'reminders'}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Recent Referrals */}
          <RecentReferrals 
            referrals={referrals}
            isLoading={isLoadingReferrals}
          />

          {/* Upcoming Reminders */}
          <UpcomingReminders 
            reminders={reminders}
            isLoading={isLoadingReminders}
            onComplete={completeReminder}
          />
        </div>

        {/* Pending Conversations Section */}
        {pendingConversations.length > 0 && (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Pending Conversations
              </h2>
              <Badge variant="warning" size="sm">{pendingConversations.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {pendingConversations.slice(0, 4).map((referral) => (
                <div
                  key={referral.id}
                  onClick={() => navigate(`/referrals/${referral.id}`)}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate mb-0.5">
                      {referral.companyName}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">
                      Waiting for {referral.employeeName}
                    </p>
                  </div>

                  {referral.conversationCount > 0 && (
                    <div className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                      <MessageSquare className="w-3 h-3" />
                      {referral.conversationCount}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pendingConversations.length > 4 && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/referrals')}
                >
                  View {pendingConversations.length - 4} more
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && referrals.length === 0 && (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to start tracking referrals?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
              Add your first referral to get started with tracking conversations and reminders
            </p>
            <Button
              variant="primary"
              onClick={() => setShowAddReferralModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Your First Referral
            </Button>
          </div>
        )}
      </div>

      {/* Add Referral Modal */}
      <Modal
        isOpen={showAddReferralModal}
        onClose={() => setShowAddReferralModal(false)}
        title="Add New Referral"
      >
        <ReferralForm
          onSubmit={handleAddReferral}
          onCancel={() => setShowAddReferralModal(false)}
        />
      </Modal>
    </div>
  );
}

export default DashboardPage;
