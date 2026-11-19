/**
 * StatusSelector Component
 * Dropdown for selecting referral status with color-coded badges
 */

import React from 'react';
import { Check } from 'lucide-react';
import { REFERRAL_STATUS, REFERRAL_STATUS_LABELS, STATUS_BADGE_VARIANTS } from '../../utils/constants';
import Badge from '../common/Badge';

function StatusSelector({ value, onChange, disabled = false, className = '' }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (status) => {
    onChange(status);
    setIsOpen(false);
  };

  const currentLabel = REFERRAL_STATUS_LABELS[value] || 'Select Status';
  const currentVariant = STATUS_BADGE_VARIANTS[value] || 'neutral';

  return (
    <div className={`relative ${className}`}>
      {/* Selected Value Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Badge variant={currentVariant}>{currentLabel}</Badge>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Options */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="max-h-64 overflow-y-auto py-1">
              {Object.entries(REFERRAL_STATUS).map(([key, status]) => {
                const label = REFERRAL_STATUS_LABELS[status];
                const variant = STATUS_BADGE_VARIANTS[status];
                const isSelected = value === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleSelect(status)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-violet-50' : ''
                    }`}
                  >
                    <Badge variant={variant}>{label}</Badge>
                    {isSelected && (
                      <Check className="w-4 h-4 text-violet-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StatusSelector;
