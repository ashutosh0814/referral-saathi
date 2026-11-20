/**
 * ReferralCard Component
 * Displays referral information in a card format with quick actions
 */

import React from 'react';
import { Building2, Briefcase, User, Calendar, ExternalLink, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import { REFERRAL_STATUS_LABELS, STATUS_BADGE_VARIANTS } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';

function ReferralCard({ referral, onEdit, onDelete, onClick }) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const formatLastInteraction = (timestamp) => {
    if (!timestamp) return 'No interaction yet';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(referral);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(referral);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const statusLabel = REFERRAL_STATUS_LABELS[referral.status] || referral.status;
  const statusVariant = STATUS_BADGE_VARIANTS[referral.status] || 'default';

  return (
    <div
      onClick={() => onClick(referral)}
      className="bg-green-50/40 border border-green-200/60 rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
        {/* Company & Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate group-hover:text-green-600 transition-colors">
                {referral.companyName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mt-1">
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{referral.jobTitle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={handleMenuToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden animate-slide-in-down">
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Employee Info */}
      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
        <User className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{referral.employeeName}</span>
        {referral.employeeDesignation && (
          <>
            <span className="text-gray-300">•</span>
            <span className="truncate">{referral.employeeDesignation}</span>
          </>
        )}
      </div>

      {/* Status & Last Interaction */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <Badge variant={statusVariant} size="sm">
          {statusLabel}
        </Badge>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">{formatLastInteraction(referral.updatedAt || referral.createdAt)}</span>
        </div>
      </div>

      {/* Job URL Indicator (if available) */}
      {referral.jobUrl && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={referral.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View Job Posting
          </a>
        </div>
      )}
    </div>
  );
}

export default ReferralCard;
