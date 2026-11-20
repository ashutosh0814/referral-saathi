/**
 * RecentReferrals Component
 * Displays recent referrals with quick actions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  User, 
  MessageSquare, 
  ArrowRight,
  Clock
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { 
  REFERRAL_STATUS_LABELS, 
  STATUS_BADGE_VARIANTS 
} from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';

function RecentReferrals({ referrals, isLoading }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Referrals</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-[#282828] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!referrals || referrals.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Referrals</h2>
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-200 mb-4">No referrals yet</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/referrals')}
          >
            Add Your First Referral
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Referrals</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/referrals')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {referrals.slice(0, 5).map((referral) => {
          const statusLabel = REFERRAL_STATUS_LABELS[referral.status] || referral.status;
          const statusVariant = STATUS_BADGE_VARIANTS[referral.status] || 'default';

          return (
            <div
              key={referral.id}
              onClick={() => navigate(`/referrals/${referral.id}`)}
              className="flex items-center gap-3 p-3 border border-[#282828] rounded-lg hover:bg-[#282828] hover:border-[#3e3e3e] transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {referral.companyName}
                  </h3>
                  <Badge variant={statusVariant} size="sm">
                    {statusLabel}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-200">
                  <span className="flex items-center gap-1 truncate">
                    <User className="w-3 h-3 flex-shrink-0" />
                    {referral.employeeName}
                  </span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDate(referral.updatedAt || referral.createdAt)}
                  </span>
                </div>
              </div>

              {referral.conversationCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-200 flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                  {referral.conversationCount}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {referrals.length > 5 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/referrals')}
          >
            View {referrals.length - 5} more
          </Button>
        </div>
      )}
    </div>
  );
}

export default RecentReferrals;
