/**
 * ReferralFilters Component
 * Search and filter UI for referrals list
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { REFERRAL_STATUS, REFERRAL_STATUS_LABELS } from '../../utils/constants';

function ReferralFilters({ 
  searchQuery, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange,
  totalCount,
  filteredCount 
}) {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company, job title, or employee name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            {Object.entries(REFERRAL_STATUS).map(([key, value]) => (
              <option key={value} value={value}>
                {REFERRAL_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredCount}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalCount}</span> referrals
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                onSearchChange('');
                onStatusFilterChange('all');
              }}
              className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ReferralFilters;
