/**
 * ReferralForm Component
 * Modal form for adding or editing referrals with comprehensive validation
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import StatusSelector from './StatusSelector';
import { createReferralSchema, validateData } from '../../lib/validators';
import { REFERRAL_STATUS } from '../../utils/constants';

function ReferralForm({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) {
  const isEditMode = !!initialData;
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobUrl: '',
    jobId: '',
    employeeName: '',
    employeeDesignation: '',
    employeeLinkedIn: '',
    contactNotes: '',
    status: REFERRAL_STATUS.NOT_CONTACTED
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');

  // Initialize form with data if editing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          companyName: initialData.companyName || '',
          jobTitle: initialData.jobTitle || '',
          jobUrl: initialData.jobUrl || '',
          jobId: initialData.jobId || '',
          employeeName: initialData.employeeName || '',
          employeeDesignation: initialData.employeeDesignation || '',
          employeeLinkedIn: initialData.employeeLinkedIn || '',
          contactNotes: initialData.contactNotes || '',
          status: initialData.status || REFERRAL_STATUS.NOT_CONTACTED
        });
      } else {
        // Reset form for new referral
        setFormData({
          companyName: '',
          jobTitle: '',
          jobUrl: '',
          jobId: '',
          employeeName: '',
          employeeDesignation: '',
          employeeLinkedIn: '',
          contactNotes: '',
          status: REFERRAL_STATUS.NOT_CONTACTED
        });
      }
      setErrors({});
      setTouched({});
      setFormError('');
    }
  }, [isOpen, initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear form-level error
    if (formError) {
      setFormError('');
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Perform inline validation for better UX
    if (formData[field]) {
      validateField(field, formData[field]);
    }
  };

  const validateField = (field, value) => {
    // Basic URL validation for URL fields
    if ((field === 'jobUrl' || field === 'employeeLinkedIn') && value) {
      try {
        new URL(value);
        // Valid URL, clear any error
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      } catch {
        setErrors(prev => ({
          ...prev,
          [field]: 'Please enter a valid URL (e.g., https://example.com)'
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form data
    const validation = validateData(createReferralSchema, formData);
    
    if (!validation.success) {
      setErrors(validation.error.fields);
      setFormError('Please fix the errors below before submitting.');
      
      // Scroll to first error (if modal content is scrollable)
      const firstErrorField = Object.keys(validation.error.fields)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      return;
    }

    // Submit the form
    onSubmit(validation.data);
  };

  const handleCancel = () => {
    setFormData({
      companyName: '',
      jobTitle: '',
      jobUrl: '',
      jobId: '',
      employeeName: '',
      employeeDesignation: '',
      employeeLinkedIn: '',
      contactNotes: '',
      status: REFERRAL_STATUS.NOT_CONTACTED
    });
    setErrors({});
    setTouched({});
    setFormError('');
    onClose();
  };

  const renderField = (field, label, type = 'text', required = false, multiline = false, placeholder = null) => {
    const hasError = touched[field] && errors[field];
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <div>
        <label htmlFor={field} className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <InputComponent
          id={field}
          type={type}
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          disabled={isLoading}
          className={`${multiline ? 'textarea' : 'input'} ${
            hasError ? 'input-error' : ''
          }`}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          rows={multiline ? 4 : undefined}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${field}-error` : undefined}
        />
        {hasError && (
          <p id={`${field}-error`} className="input-error-message">
            {errors[field]}
          </p>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditMode ? 'Edit Referral' : 'Add New Referral'}
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            type="submit"
          >
            {isEditMode ? 'Save Changes' : 'Add Referral'}
          </Button>
        </>
      }
    >
      {/* Form-level error */}
      {formError && (
        <div className="alert alert-error mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company & Job Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Job Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('companyName', 'Company Name', 'text', true, false, 'e.g., Google')}
            {renderField('jobTitle', 'Job Title', 'text', true, false, 'e.g., Software Engineer')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('jobUrl', 'Job URL', 'url', false, false, 'https://example.com/jobs/123')}
            {renderField('jobId', 'Job ID', 'text', false, false, 'e.g., JOB-12345')}
          </div>
        </div>

        {/* Employee Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Employee Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('employeeName', 'Employee Name', 'text', true, false, 'e.g., John Doe')}
            {renderField('employeeDesignation', 'Designation', 'text', false, false, 'e.g., Senior Engineer')}
          </div>

          {renderField('employeeLinkedIn', 'LinkedIn Profile URL', 'url', false, false, 'https://linkedin.com/in/johndoe')}
        </div>

        {/* Status & Notes Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Additional Information
          </h3>
          
          <div>
            <label htmlFor="status" className="label">
              Status
              <span className="text-red-500 ml-1">*</span>
            </label>
            <StatusSelector
              value={formData.status}
              onChange={(value) => handleChange('status', value)}
              disabled={isLoading}
            />
          </div>

          {renderField('contactNotes', 'Contact Notes', 'text', false, true, 'Add any notes about this referral...')}
        </div>

        {/* Hidden submit button for Enter key */}
        <button type="submit" className="hidden" aria-hidden="true" />
      </form>
    </Modal>
  );
}

export default ReferralForm;
