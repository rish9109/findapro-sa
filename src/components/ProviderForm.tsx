// File: src/components/ProviderForm.tsx
'use client'

import { memo, useCallback } from 'react'
import { Award, MapPin, Shield, Clock, CreditCard, AlertCircle, FileText, CheckCircle, Star } from 'lucide-react'
import Link from 'next/link'

// Types
export interface ServiceCategory {
  id: string
  name: string
  description?: string
  icon?: string
}

export interface SelectedAccreditation {
  id: string
  accreditation_id?: string
  custom_name?: string
  custom_description?: string
  is_custom: boolean
  position: number
}

export interface SelectedBusinessFeature {
  id: string
  feature_id?: string
  feature?: any
  custom_name?: string
  custom_description?: string
  is_custom: boolean
  position: number
}

export interface ProviderFormData {
  // Business Information
  business_name: string
  
  // Contact Information
  contact_person: string
  contact_email: string
  contact_phone: string
  alternate_phone: string
  primary_has_whatsapp?: boolean
  alternate_has_whatsapp?: boolean
  
  // Service Information
  main_service: string
  main_service_id: string
  details: string
  experience_years: string
  
  // Pricing & Payment
  fees_pricing: string
  
  // Terms (only for new listings)
  accept_terms?: boolean
  
  // Status (for edit mode)
  status?: string
}

interface ProviderFormProps {
  // Data
  initialData?: Partial<ProviderFormData>
  serviceCategories: ServiceCategory[]
  userEmail: string
  existingBusinessName?: string // For locked business name in new listings
  
  // Selection states (passed from parent)
  selectedAccreditations: SelectedAccreditation[]
  onAccreditationsChange: (accreditations: SelectedAccreditation[]) => void
  
  selectedBusinessFeatures?: SelectedBusinessFeature[] // Optional
  onBusinessFeaturesChange: (features: SelectedBusinessFeature[]) => void
  
  serviceAreas: {
    primaryArea: string
    additionalAreas: string[]
  }
  onServiceAreasChange: (areas: { primaryArea: string; additionalAreas: string[] }) => void
  
  // Form state
  formData: ProviderFormData
  onFormChange: (data: ProviderFormData) => void
  formErrors: Record<string, string>
  setFormErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>  
  
  // Drawer controls (passed from parent)
  onOpenServiceDrawer: () => void
  onOpenAreaDrawer: () => void
  onOpenAccreditationDrawer: () => void
  onOpenBusinessFeatureDrawer: () => void // New drawer control
  
  // Mode
  mode: 'create' | 'edit'
  
  // Optional status info for edit mode
  statusInfo?: {
    icon: any
    color: string
    bgColor: string
    borderColor: string
    label: string
  }
  
  // Disabled fields (for edit mode)
  disabledFields?: string[]
}

function ProviderForm({
  initialData = {},
  serviceCategories,
  userEmail,
  existingBusinessName,
  selectedAccreditations,
  onAccreditationsChange,
  selectedBusinessFeatures = [], // Default to empty array
  onBusinessFeaturesChange,
  serviceAreas,
  onServiceAreasChange,
  formData,
  onFormChange,
  formErrors,
  setFormErrors,
  onOpenServiceDrawer,
  onOpenAreaDrawer,
  onOpenAccreditationDrawer,
  onOpenBusinessFeatureDrawer,
  mode,
  statusInfo,
  disabledFields = []
}: ProviderFormProps) {
  
  // Phone number formatting helper
  const formatPhoneNumber = useCallback((value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as "XXX XXX XXXX" (3 digits space 3 digits space 4 digits)
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
    }
  }, []);

  // Phone number validation helper
  const validatePhoneNumber = useCallback((phone: string, isOptional = false) => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (isOptional && !digitsOnly) {
      return ''; // No error for empty optional field
    }
    
    if (!isOptional && !digitsOnly) {
      return 'Phone number is required';
    }
    
    if (digitsOnly.length < 10) {
      return 'Phone number must have at least 10 digits';
    }
    
    if (digitsOnly.length > 10) {
      return 'Phone number cannot exceed 10 digits';
    }
    
    return ''; // No error
  }, []);

  // Validate and format phone on blur
  const handlePhoneBlur = useCallback((e: React.FocusEvent<HTMLInputElement>, fieldName: string, isOptional = false) => {
    const { value } = e.target;
    
    // Validate
    const error = validatePhoneNumber(value, isOptional);
    
    // Update form errors if setFormErrors is provided
    if (setFormErrors) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
    
    // Format the number if it has content
    if (value) {
      const formattedValue = formatPhoneNumber(value);
      
      // Only update if the formatted value is different
      if (formattedValue !== value) {
        onFormChange({ ...formData, [fieldName]: formattedValue });
      }
    }
  }, [formData, onFormChange, setFormErrors, formatPhoneNumber, validatePhoneNumber]);

  // Optimized handleChange with value comparison to prevent unnecessary re-renders
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    // Stop event propagation to prevent any parent handlers from interfering
    e.stopPropagation()
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      // Only update if the value actually changed
      if (formData[name as keyof ProviderFormData] !== checked) {
        onFormChange({ ...formData, [name]: checked })
      }
    } else {
      // Special handling for phone fields - allow only digits and format
      if (name === 'contact_phone' || name === 'alternate_phone') {
        // Allow only digits (no letters, no special chars)
        const digitsOnly = value.replace(/\D/g, '');
        
        // Limit to 10 digits
        if (digitsOnly.length <= 10) {
          const formatted = formatPhoneNumber(digitsOnly);
          
          // Only update if the value actually changed
          if (formData[name as keyof ProviderFormData] !== formatted) {
            onFormChange({ ...formData, [name]: formatted });
          }
          
          // Clear error while typing if it exists
          if (setFormErrors && formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
          }
        }
      } else {
        // Only update if the value actually changed
        if (formData[name as keyof ProviderFormData] !== value) {
          onFormChange({ ...formData, [name]: value })
        }
      }
    }
  }

  const StatusIcon = statusInfo?.icon

  // Check if business name should be locked (either in create mode with existingBusinessName, or in edit mode with disabledFields)
  const isBusinessNameLocked = (mode === 'create' && existingBusinessName) || 
                               (mode === 'edit' && disabledFields.includes('business_name'))

  return (
    <form 
      className="space-y-10"
      onSubmit={(e) => e.preventDefault()} // Prevent form submission on Enter key
      noValidate // Disable browser validation
    >
      {/* ==================== HEADER (Varies by mode) ==================== */}
      {mode === 'edit' && statusInfo && (
        <div className="flex items-center gap-4 mb-6">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
            {StatusIcon && <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />}
            <span className={`text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      )}

      {/* ==================== SECTION 1: BUSINESS INFORMATION ==================== */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">1</div>
          <h2 className="text-xl font-bold text-white">Business Information</h2>
        </div>
        
        <div className="space-y-6">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
              <span>Business Name</span>
              <span className="text-red-500">*</span>
            </label>
            
            {isBusinessNameLocked ? (
              <div className="relative">
                <input
                  type="text"
                  value={mode === 'create' ? existingBusinessName : formData.business_name}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">
                    Locked
                  </span>
                </div>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  required
                  disabled={disabledFields.includes('business_name')}
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.business_name ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${disabledFields.includes('business_name') ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="Enter your business name"
                />
                {formErrors.business_name && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.business_name}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ==================== SECTION 2: CONTACT INFORMATION ==================== */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">2</div>
          <h2 className="text-xl font-bold text-white">Contact Information</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Person */}
          <div>
            <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
              <span>Contact Person</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              required
              disabled={disabledFields.includes('contact_person')}
              className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.contact_person ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${disabledFields.includes('contact_person') ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="Full name"
            />
            {formErrors.contact_person && (
              <p className="mt-1 text-sm text-red-400">{formErrors.contact_person}</p>
            )}
          </div>
          
{/* Email - Always Locked */}
<div>
  <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
    <span>Email Address</span>
    <span className="text-red-500">*</span>
  </label>
  <div className="relative">
    <input
      type="email"
      value={userEmail}
      readOnly
      disabled
      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 cursor-not-allowed"
      style={{ 
        paddingRight: '80px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}
    />
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ zIndex: 1 }}>
      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">
        Locked
      </span>
    </div>
  </div>
</div>
          {/* Primary Phone */}
          <div>
            <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
              <span>Primary Phone</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              onBlur={(e) => handlePhoneBlur(e, 'contact_phone', false)}
              required
              disabled={disabledFields.includes('contact_phone')}
              className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.contact_phone ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${disabledFields.includes('contact_phone') ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="123 456 7890"
              maxLength={12}
              inputMode="numeric"
              pattern="[0-9\s]*"
            />
            {formErrors.contact_phone && (
              <p className="mt-1 text-sm text-red-400">{formErrors.contact_phone}</p>
            )}
            
            {/* WhatsApp Checkbox for Primary Phone */}
            {formData.contact_phone && formData.contact_phone.replace(/\D/g, '').length >= 10 && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg border border-gray-700">
                <input
                  type="checkbox"
                  id="primary_has_whatsapp"
                  name="primary_has_whatsapp"
                  checked={formData.primary_has_whatsapp || false}
                  onChange={handleChange}
                  disabled={disabledFields.includes('primary_has_whatsapp')}
                  className="w-4 h-4 accent-green-500 rounded cursor-pointer"
                />
                <label htmlFor="primary_has_whatsapp" className="text-sm text-gray-300 flex items-center gap-1.5 cursor-pointer">
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.349 0-9.703 4.352-9.706 9.702 0 1.703.444 3.371 1.286 4.836L2 22l5.539-1.504c1.414.783 3.004 1.196 4.64 1.197h.004c5.347 0 9.701-4.353 9.704-9.703.001-2.598-1.01-5.041-2.897-6.928zM12.018 20.06h-.003c-1.446 0-2.864-.389-4.082-1.12l-.293-.174-3.288.875.88-3.2-.19-.305c-.758-1.215-1.158-2.617-1.158-4.064.003-4.445 3.619-8.06 8.067-8.06 2.153 0 4.178.841 5.699 2.368 1.521 1.527 2.358 3.553 2.357 5.71-.002 4.446-3.618 8.062-8.064 8.062zM16.247 14.28c-.245-.123-1.453-.717-1.678-.798-.225-.082-.388-.123-.552.122-.164.245-.636.798-.78.962-.143.164-.287.185-.532.062-.926-.403-1.719-.917-2.402-1.527-.901-.803-1.51-1.771-1.686-2.082-.164-.29-.018-.447.124-.592.128-.128.286-.334.429-.501.143-.167.191-.287.287-.479.095-.192.048-.36-.024-.503-.071-.143-.552-1.329-.756-1.818-.199-.479-.4-.414-.552-.422a9.96 9.96 0 0 0-.47-.008c-.166.005-.398.057-.608.287-.21.23-.802.784-.802 1.913 0 1.128.822 2.218.937 2.372.115.154 1.56 2.456 3.856 3.34 2.296.884 2.296.589 2.71.552.414-.037 1.337-.546 1.525-1.074.188-.528.188-.98.132-1.075-.057-.095-.21-.154-.456-.277z"/>
                  </svg>
                  This number has WhatsApp
                </label>
              </div>
            )}
          </div>
          
          {/* Alternate Phone */}
          <div>
            <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
              Alternate Phone
              <span className="text-xs text-gray-400 ml-2">(Optional)</span>
            </label>
            <input
              type="tel"
              name="alternate_phone"
              value={formData.alternate_phone}
              onChange={handleChange}
              onBlur={(e) => handlePhoneBlur(e, 'alternate_phone', true)}
              disabled={disabledFields.includes('alternate_phone')}
              className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.alternate_phone ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${disabledFields.includes('alternate_phone') ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="123 456 7890"
              maxLength={12}
              inputMode="numeric"
              pattern="[0-9\s]*"
            />
            {formErrors.alternate_phone && (
              <p className="mt-1 text-sm text-red-400">{formErrors.alternate_phone}</p>
            )}
            
            {/* WhatsApp Checkbox for Alternate Phone */}
            {formData.alternate_phone && formData.alternate_phone.replace(/\D/g, '').length >= 10 && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg border border-gray-700">
                <input
                  type="checkbox"
                  id="alternate_has_whatsapp"
                  name="alternate_has_whatsapp"
                  checked={formData.alternate_has_whatsapp || false}
                  onChange={handleChange}
                  disabled={disabledFields.includes('alternate_has_whatsapp')}
                  className="w-4 h-4 accent-green-500 rounded cursor-pointer"
                />
                <label htmlFor="alternate_has_whatsapp" className="text-sm text-gray-300 flex items-center gap-1.5 cursor-pointer">
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.349 0-9.703 4.352-9.706 9.702 0 1.703.444 3.371 1.286 4.836L2 22l5.539-1.504c1.414.783 3.004 1.196 4.64 1.197h.004c5.347 0 9.701-4.353 9.704-9.703.001-2.598-1.01-5.041-2.897-6.928zM12.018 20.06h-.003c-1.446 0-2.864-.389-4.082-1.12l-.293-.174-3.288.875.88-3.2-.19-.305c-.758-1.215-1.158-2.617-1.158-4.064.003-4.445 3.619-8.06 8.067-8.06 2.153 0 4.178.841 5.699 2.368 1.521 1.527 2.358 3.553 2.357 5.71-.002 4.446-3.618 8.062-8.064 8.062zM16.247 14.28c-.245-.123-1.453-.717-1.678-.798-.225-.082-.388-.123-.552.122-.164.245-.636.798-.78.962-.143.164-.287.185-.532.062-.926-.403-1.719-.917-2.402-1.527-.901-.803-1.51-1.771-1.686-2.082-.164-.29-.018-.447.124-.592.128-.128.286-.334.429-.501.143-.167.191-.287.287-.479.095-.192.048-.36-.024-.503-.071-.143-.552-1.329-.756-1.818-.199-.479-.4-.414-.552-.422a9.96 9.96 0 0 0-.47-.008c-.166.005-.398.057-.608.287-.21.23-.802.784-.802 1.913 0 1.128.822 2.218.937 2.372.115.154 1.56 2.456 3.856 3.34 2.296.884 2.296.589 2.71.552.414-.037 1.337-.546 1.525-1.074.188-.528.188-.98.132-1.075-.057-.095-.21-.154-.456-.277z"/>
                  </svg>
                  This number has WhatsApp
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== SECTION 3: SERVICE INFORMATION ==================== */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">3</div>
          <h2 className="text-xl font-bold text-white">Service Information</h2>
        </div>
        
        <div className="space-y-6">
          {/* Main Service Category */}
          <div>
            <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
              <span>Main Service Category</span>
              <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={onOpenServiceDrawer}
              disabled={disabledFields.includes('main_service')}
              className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.main_service ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white text-left flex justify-between items-center hover:border-orange-500 transition-colors ${disabledFields.includes('main_service') ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className={formData.main_service ? "text-white" : "text-gray-500"}>
                {formData.main_service || "Select service category"}
              </span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {formErrors.main_service && (
              <p className="mt-1 text-sm text-red-400">{formErrors.main_service}</p>
            )}
          </div>
          
          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
              <span>Years of Experience</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              onKeyDown={(e) => {
                // Prevent 'e', 'E', '+', '-', '.' from being entered
                if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-' || e.key === '.') {
                  e.preventDefault();
                }
              }}
              required
              min="0"
              max="100"
              step="1"
              disabled={disabledFields.includes('experience_years')}
              className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.experience_years ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${disabledFields.includes('experience_years') ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="e.g., 5"
            />
            {formErrors.experience_years && (
              <p className="mt-1 text-sm text-red-400">{formErrors.experience_years}</p>
            )}
          </div>
          
          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
              Details
              <span className="text-xs text-gray-400 ml-2">(Optional)</span>
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={10}
              disabled={disabledFields.includes('details')}
              className={`w-full px-4 py-5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${disabledFields.includes('details') ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="Enter your service details...(Enter services separated by commas or on separate lines. Will display as a bullet list.)"
            />
          </div>

          {/* Accreditations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#FF7A45] flex items-center gap-1">
                <span>Accreditations
                <span className="text-xs text-gray-400 ml-2">(Optional)</span>
                </span>
              </label>
              <span className="text-xs text-gray-500">
                {selectedAccreditations.length}/10 selected
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenAccreditationDrawer}
              disabled={disabledFields.includes('accreditations')}
              className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-left flex justify-between items-center hover:border-orange-500 transition-colors ${disabledFields.includes('accreditations') ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <div className="flex-1">
                <span className={selectedAccreditations.length > 0 ? "text-white" : "text-gray-500"}>
                  {selectedAccreditations.length > 0 
                    ? `${selectedAccreditations.length} accreditation${selectedAccreditations.length !== 1 ? 's' : ''} selected`
                    : "Add your accreditations"}
                </span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Selected accreditations preview */}
            {selectedAccreditations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedAccreditations.slice(0, 3).map(acc => (
                  <span key={acc.id} className="px-3 py-1.5 bg-orange-500/20 text-orange-300 text-xs rounded-lg border border-orange-500/30 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {acc.is_custom ? acc.custom_name?.substring(0, 10) : 'Certified'}
                  </span>
                ))}
                {selectedAccreditations.length > 3 && (
                  <span className="px-3 py-1.5 bg-gray-700 text-gray-400 text-xs rounded-lg border border-gray-600">
                    +{selectedAccreditations.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

   {/* ==================== SECTION 4: SERVICE AREAS ==================== */}
<div className="mb-10">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">4</div>
    <h2 className="text-xl font-bold text-white">Service Areas</h2>
  </div>
  
  <div className="space-y-6">
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-[#FF7A45] flex items-center gap-1">
          <span>Service Areas</span>
          <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-gray-500">
          {serviceAreas.primaryArea ? 1 + (serviceAreas.additionalAreas?.length || 0) : 0}/20 selected
        </span>
      </div>
      
      <button
        type="button"
        onClick={onOpenAreaDrawer}
        disabled={disabledFields.includes('service_areas')}
        className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.primaryArea ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white text-left flex justify-between items-center hover:border-orange-500 transition-colors ${disabledFields.includes('service_areas') ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <div className="flex-1">
          <span className={serviceAreas.primaryArea || (serviceAreas.additionalAreas?.length || 0) > 0 ? "text-white" : "text-gray-500"}>
            {serviceAreas.primaryArea 
              ? `${serviceAreas.primaryArea}${(serviceAreas.additionalAreas?.length || 0) > 0 ? ` + ${serviceAreas.additionalAreas?.length} more` : ''}`
              : "Select your service areas"}
          </span>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {formErrors.primaryArea && (
        <p className="mt-1 text-sm text-red-400">{formErrors.primaryArea}</p>
      )}
      
      {/* Selected areas preview */}
      {(serviceAreas.primaryArea || (serviceAreas.additionalAreas?.length || 0) > 0) && (
        <div className="mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {serviceAreas.primaryArea && (
              <span className="px-3 py-2 bg-orange-500/30 text-orange-300 rounded-lg text-sm border border-orange-500/50 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {serviceAreas.primaryArea} (Primary)
              </span>
            )}
            {serviceAreas.additionalAreas?.slice(0, 3).map((area, index) => (
              <span key={index} className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {area}
              </span>
            ))}
            {(serviceAreas.additionalAreas?.length || 0) > 3 && (
              <span className="px-3 py-2 bg-gray-700 text-gray-400 text-sm rounded-lg border border-gray-600">
                +{(serviceAreas.additionalAreas?.length || 0) - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
</div>

      {/* ==================== SECTION 5: BUSINESS DETAILS ==================== */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">5</div>
          <h2 className="text-xl font-bold text-white">Business Details</h2>
        </div>
        
        <div className="space-y-6">
          {/* Fees & Pricing */}
          <div>
            <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
              Fees & Pricing
              <span className="text-xs text-gray-400 ml-2">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="fees_pricing"
                value={formData.fees_pricing}
                onChange={handleChange}
                disabled={disabledFields.includes('fees_pricing')}
                className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${disabledFields.includes('fees_pricing') ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="e.g: R 450 P/Hr , blank = Contact for price"
              />
            </div>
          </div>

          {/* Business Features - New section (optional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#FF7A45] flex items-center gap-1">
                <span>Business Features</span>
                <span className="text-xs text-gray-400 ml-2">(Optional)</span>
              </label>
              <span className="text-xs text-gray-500">
                {selectedBusinessFeatures.length}/10 selected
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenBusinessFeatureDrawer}
              disabled={disabledFields.includes('business_features')}
              className={`w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-left flex justify-between items-center hover:border-orange-500 transition-colors ${disabledFields.includes('business_features') ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <div className="flex-1">
                <span className={selectedBusinessFeatures.length > 0 ? "text-white" : "text-gray-500"}>
                  {selectedBusinessFeatures.length > 0 
                    ? `${selectedBusinessFeatures.length} feature${selectedBusinessFeatures.length !== 1 ? 's' : ''} selected`
                    : "Add business features (optional)"}
                </span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Selected business features preview */}
            {selectedBusinessFeatures.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedBusinessFeatures.slice(0, 3).map(feat => (
                  <span key={feat.id} className="px-3 py-1.5 bg-orange-500/20 text-orange-300 text-xs rounded-lg border border-orange-500/30 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {feat.is_custom ? feat.custom_name?.substring(0, 10) : feat.feature?.name}
                  </span>
                ))}
                {selectedBusinessFeatures.length > 3 && (
                  <span className="px-3 py-1.5 bg-gray-700 text-gray-400 text-xs rounded-lg border border-gray-600">
                    +{selectedBusinessFeatures.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== SECTION 6: TERMS (Create mode only) ==================== */}
      {mode === 'create' && (
        <div className="pt-6 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">6</div>
            <h2 className="text-xl font-bold text-white">Terms & Submission</h2>
          </div>
          
          <div className="space-y-6">
            {/* Terms Agreement */}
            <div className={`flex items-start p-4 rounded-xl border ${formErrors.accept_terms ? 'border-red-500/30 bg-red-500/5' : 'bg-gray-900/50 border-gray-700'}`}>
              <input
                type="checkbox"
                name="accept_terms"
                checked={formData.accept_terms || false}
                onChange={handleChange}
                required
                className={`mt-1 mr-3 ${formErrors.accept_terms ? 'accent-red-500' : 'accent-orange-500'} w-5 h-5`}
              />
              <div>
                <label className="text-sm text-gray-300 font-medium block">
                  <span className="block sm:inline">I agree to the </span>
                  <span className="block sm:inline space-x-1">
                    <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                      Terms of Service
                    </Link>
                    <span> and </span>
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  By checking this box, you confirm all information provided is accurate
                </p>
                {formErrors.accept_terms && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.accept_terms}</p>
                )}
              </div>
            </div>
            
            {/* Review Info */}
            <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-700">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">What happens next?</h4>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Our team reviews your listing within 24-48 hours</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>You'll receive email notification when approved</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Track status in your Provider Dashboard</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ProviderForm)