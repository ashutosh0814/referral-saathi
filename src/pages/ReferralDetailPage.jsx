/**
 * ReferralDetailPage
 * Complete referral details with conversation timeline and LinkedIn actions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Briefcase, 
  User, 
  ExternalLink, 
  Copy, 
  Linkedin,
  Calendar,
  Hash,
  MessageSquare,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getReferral } from '../lib/firestore';
import { 
  getConversations, 
  createConversation, 
  updateConversation, 
  deleteConversation 
} from '../lib/firestore';
import { useReferralReminders } from '../hooks/useReminders';
import { suggestReminderFromAnalysis } from '../lib/automation';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConversationTimeline from '../components/referrals/ConversationTimeline';
import ConversationComposer from '../components/referrals/ConversationComposer';
import StatusSelector from '../components/referrals/StatusSelector';
import ReplyAnalyzer from '../components/assistant/ReplyAnalyzer';
import AnalysisResult from '../components/assistant/AnalysisResult';
import SuggestedReply from '../components/assistant/SuggestedReply';
import ReminderCard from '../components/reminders/ReminderCard';
import ReminderForm from '../components/reminders/ReminderForm';
import { updateReferral } from '../lib/firestore';
import { 
  REFERRAL_STATUS_LABELS, 
  STATUS_BADGE_VARIANTS 
} from '../utils/constants';

function ReferralDetailPage() {
  const { referralId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Referral state
  const [referral, setReferral] = useState(null);
  const [isLoadingReferral, setIsLoadingReferral] = useState(true);
  const [referralError, setReferralError] = useState(null);

  // Conversations state
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState(null);

  // UI state
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [editingConversation, setEditingConversation] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Reply Assistant state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzedMessage, setAnalyzedMessage] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);

  // Reminder state
  const [showCreateReminderModal, setShowCreateReminderModal] = useState(false);
  const [suggestedReminder, setSuggestedReminder] = useState(null);
  
  // Reminder hook
  const {
    reminders,
    createReminder,
    completeReminder,
    snoozeReminder,
    deleteReminder,
    isLoading: isLoadingReminders
  } = useReferralReminders(referralId);

  // Fetch referral details
  useEffect(() => {
    const fetchReferral = async () => {
      if (!user || !referralId) return;

      try {
        setIsLoadingReferral(true);
        setReferralError(null);

        const result = await getReferral(user.uid, referralId);

        if (result.success) {
          setReferral(result.data);
        } else {
          setReferralError(result.error || 'Failed to load referral');
        }
      } catch (error) {
        console.error('Error fetching referral:', error);
        setReferralError('An unexpected error occurred');
      } finally {
        setIsLoadingReferral(false);
      }
    };

    fetchReferral();
  }, [user, referralId]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || !referralId) return;

      try {
        setIsLoadingConversations(true);
        setConversationsError(null);

        const result = await getConversations(user.uid, referralId);

        if (result.success) {
          setConversations(result.data || []);
        } else {
          setConversationsError(result.error || 'Failed to load conversations');
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversationsError('An unexpected error occurred');
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user, referralId]);

  // Handle add message
  const handleAddMessage = async (messageData) => {
    if (!user || !referralId) return;

    setIsSubmittingMessage(true);

    try {
      const result = await createConversation(user.uid, referralId, messageData);

      if (result.success) {
        // Add to local state
        setConversations(prev => [...prev, result.data]);
        setEditingConversation(null);
      } else {
        alert(`Error: ${result.error || 'Failed to add message'}`);
      }
    } catch (error) {
      console.error('Error adding message:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  // Handle edit message
  const handleEditMessage = async (messageData) => {
    if (!user || !referralId || !editingConversation) return;

    setIsSubmittingMessage(true);

    try {
      const result = await updateConversation(
        user.uid, 
        referralId, 
        editingConversation.id, 
        messageData
      );

      if (result.success) {
        // Update local state
        setConversations(prev =>
          prev.map(conv => conv.id === editingConversation.id ? result.data : conv)
        );
        setEditingConversation(null);
      } else {
        alert(`Error: ${result.error || 'Failed to update message'}`);
      }
    } catch (error) {
      console.error('Error updating message:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  // Handle delete message
  const handleDeleteMessage = (conversation) => {
    setDeleteConfirm(conversation);
  };

  const confirmDelete = async () => {
    if (!user || !referralId || !deleteConfirm) return;

    try {
      const result = await deleteConversation(user.uid, referralId, deleteConfirm.id);

      if (result.success) {
        // Remove from local state
        setConversations(prev => prev.filter(conv => conv.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        alert(`Error: ${result.error || 'Failed to delete message'}`);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('An unexpected error occurred');
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    if (!user || !referralId || !referral) return;

    setIsUpdatingStatus(true);

    try {
      const result = await updateReferral(user.uid, referralId, { status: newStatus });

      if (result.success) {
        setReferral(result.data);
      } else {
        alert(`Error: ${result.error || 'Failed to update status'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Copy LinkedIn URL
  const handleCopyLinkedIn = async () => {
    if (!referral?.employeeLinkedIn) return;

    try {
      await navigator.clipboard.writeText(referral.employeeLinkedIn);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy URL');
    }
  };

  // Open LinkedIn in new tab
  const handleOpenLinkedIn = () => {
    if (!referral?.employeeLinkedIn) return;
    window.open(referral.employeeLinkedIn, '_blank', 'noopener,noreferrer');
  };

  // Reply Assistant handlers
  const handleAnalysisComplete = (result, message) => {
    setAnalysisResult(result);
    setAnalyzedMessage(message);
  };

  const handleConfirmSuggestedReply = async (payload) => {
    if (!user || !referralId) return;

    // Extract message and status update from payload
    const replyText = typeof payload === 'string' ? payload : payload.message;
    const shouldUpdateStatus = payload.applyStatusUpdate && payload.statusSuggestion;

    setIsSubmittingMessage(true);

    try {
      // Add the employee's received message first
      const receivedResult = await createConversation(user.uid, referralId, {
        message: analyzedMessage,
        direction: 'received'
      });

      if (receivedResult.success) {
        setConversations(prev => [...prev, receivedResult.data]);
      }

      // Add our sent reply
      const sentResult = await createConversation(user.uid, referralId, {
        message: replyText,
        direction: 'sent'
      });

      if (sentResult.success) {
        setConversations(prev => [...prev, sentResult.data]);
        
        // Update referral status if requested
        if (shouldUpdateStatus) {
          const statusUpdateResult = await updateReferral(user.uid, referralId, { 
            status: payload.statusSuggestion 
          });
          
          if (statusUpdateResult.success) {
            // Refresh referral data
            const updatedReferral = await getReferral(user.uid, referralId);
            if (updatedReferral.success) {
              setReferral(updatedReferral.data);
            }
          }
        }

        // Clear assistant
        setAnalysisResult(null);
        setAnalyzedMessage('');
        setShowAssistant(false);
      } else {
        alert(`Error: ${sentResult.error || 'Failed to add reply'}`);
      }
    } catch (error) {
      console.error('Error confirming reply:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleCancelAssistant = () => {
    setAnalysisResult(null);
    setAnalyzedMessage('');
  };

  // Reminder handlers
  const handleCreateReminderFromAI = () => {
    if (!analysisResult || !referral) return;

    const suggested = suggestReminderFromAnalysis(analysisResult, referralId);
    if (suggested) {
      setSuggestedReminder(suggested);
      setShowCreateReminderModal(true);
    }
  };

  const handleCreateReminder = async (reminderData) => {
    if (!user || !referralId) return;

    const result = await createReminder(reminderData, referral.status, reminders);

    if (result.success) {
      setShowCreateReminderModal(false);
      setSuggestedReminder(null);
    } else {
      alert(result.error || 'Failed to create reminder');
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    const result = await completeReminder(reminderId);
    if (!result.success) {
      alert(result.error || 'Failed to complete reminder');
    }
  };

  const handleSnoozeReminder = async (reminderId, newDueDate) => {
    const result = await snoozeReminder(reminderId, newDueDate);
    if (!result.success) {
      alert(result.error || 'Failed to snooze reminder');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    
    const result = await deleteReminder(reminderId);
    if (!result.success) {
      alert(result.error || 'Failed to delete reminder');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Loading state
  if (isLoadingReferral) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading referral details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (referralError || !referral) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft />}
            onClick={() => navigate('/referrals')}
            className="mb-6"
          >
            Back to Referrals
          </Button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-900 font-semibold mb-1">
                  Error Loading Referral
                </h3>
                <p className="text-red-700 text-sm">
                  {referralError || 'Referral not found'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusLabel = REFERRAL_STATUS_LABELS[referral.status] || referral.status;
  const statusVariant = STATUS_BADGE_VARIANTS[referral.status] || 'default';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft />}
          onClick={() => navigate('/referrals')}
          className="mb-6"
        >
          Back to Referrals
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Referral Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company & Job Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    {referral.companyName}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">{referral.jobTitle}</span>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                {referral.jobUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Job Posting</p>
                    <a
                      href={referral.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Job Posting
                    </a>
                  </div>
                )}

                {referral.jobId && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Job ID</p>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Hash className="w-3.5 h-3.5" />
                      {referral.jobId}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(referral.updatedAt || referral.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Employee Contact
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {referral.employeeName}
                  </p>
                </div>

                {referral.employeeDesignation && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Designation</p>
                    <p className="text-sm text-gray-700">
                      {referral.employeeDesignation}
                    </p>
                  </div>
                )}

                {referral.employeeLinkedIn && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">LinkedIn Profile</p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleOpenLinkedIn}
                        leftIcon={<Linkedin className="w-4 h-4" />}
                        className="flex-1"
                      >
                        Open Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyLinkedIn}
                        className="px-3"
                      >
                        {copySuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {copySuccess && (
                      <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Referral Status
              </h2>
              <StatusSelector
                value={referral.status}
                onChange={handleStatusChange}
                disabled={isUpdatingStatus}
              />
            </div>

            {/* Contact Notes */}
            {referral.contactNotes && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  Notes
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {referral.contactNotes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Conversation Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Conversation Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Conversation History
                </h2>
              </div>
              <p className="text-sm text-gray-600">
                Track all your interactions with {referral.employeeName}
              </p>
            </div>

            {/* Reminders Section */}
            {reminders.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Active Reminders
                  </h3>
                  <Badge variant="default">{reminders.length}</Badge>
                </div>
                <div className="space-y-3">
                  {reminders.slice(0, 3).map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onComplete={handleCompleteReminder}
                      onSnooze={handleSnoozeReminder}
                      onDelete={handleDeleteReminder}
                      showReferralInfo={false}
                      isLoading={isLoadingReminders}
                    />
                  ))}
                  {reminders.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/reminders')}
                      className="w-full"
                    >
                      View all {reminders.length} reminders
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {conversationsError ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    {conversationsError}
                  </p>
                </div>
              ) : (
                <ConversationTimeline
                  conversations={conversations}
                  onEdit={setEditingConversation}
                  onDelete={handleDeleteMessage}
                  isLoading={isLoadingConversations}
                />
              )}
            </div>

            {/* Reply Assistant */}
            {showAssistant ? (
              <div className="space-y-6">
                <ReplyAnalyzer 
                  onAnalysisComplete={handleAnalysisComplete}
                  referralContext={{
                    referralStatus: referral.status,
                    companyName: referral.companyName,
                    jobTitle: referral.jobTitle
                  }}
                />
                
                {analysisResult && (
                  <>
                    <AnalysisResult 
                      analysis={analysisResult} 
                      originalMessage={analyzedMessage}
                    />

                    {/* AI Suggested Reminder */}
                    {analysisResult.followUpDays && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-indigo-900 mb-1">
                              💡 Suggested Follow-up Reminder
                            </h4>
                            <p className="text-sm text-indigo-700">
                              AI suggests following up in {analysisResult.followUpDays} {analysisResult.followUpDays === 1 ? 'day' : 'days'}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCreateReminderFromAI}
                          >
                            Create Reminder
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {analysisResult.suggestedReply && (
                      <SuggestedReply
                        suggestedReply={analysisResult.suggestedReply}
                        analysis={analysisResult}
                        onConfirm={handleConfirmSuggestedReply}
                        onCancel={handleCancelAssistant}
                        isConfirming={isSubmittingMessage}
                        onStatusUpdate={updateReferral}
                      />
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Need help replying?
                      </h3>
                      <p className="text-sm text-gray-600">
                        Use the Reply Assistant to analyze employee responses and get suggested replies with intent detection.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setShowAssistant(true)}
                  >
                    Open Assistant
                  </Button>
                </div>
              </div>
            )}

            {/* Composer */}
            <ConversationComposer
              onSubmit={editingConversation ? handleEditMessage : handleAddMessage}
              onCancel={editingConversation ? () => setEditingConversation(null) : null}
              initialData={editingConversation}
              isLoading={isSubmittingMessage}
              isEditMode={!!editingConversation}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity"
            onClick={() => setDeleteConfirm(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Delete Message
                  </h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this message? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
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

      {/* Create Reminder Modal */}
      <Modal
        isOpen={showCreateReminderModal}
        onClose={() => {
          setShowCreateReminderModal(false);
          setSuggestedReminder(null);
        }}
        title="Create Reminder"
      >
        <ReminderForm
          initialData={suggestedReminder}
          referralData={{
            id: referralId,
            companyName: referral?.companyName,
            employeeName: referral?.employeeName,
            status: referral?.status
          }}
          onSubmit={handleCreateReminder}
          onCancel={() => {
            setShowCreateReminderModal(false);
            setSuggestedReminder(null);
          }}
          isLoading={isLoadingReminders}
        />
      </Modal>
    </div>
  );
}

export default ReferralDetailPage;
