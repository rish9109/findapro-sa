// File: src/components/ProviderForm.tsx
'use client'

import { memo, useCallback } from 'react'
import { Award, MapPin, Shield, Clock, CreditCard, AlertCircle, FileText, CheckCircle } from 'lucide-react'
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

export interface ProviderFormData {
  // Business Information
  business_name: string
  
  // Contact Information
  contact_person: string
  contact_email: string
  contact_phone: string
  alternate_phone: string
  
  // Service Information
  main_service: string
  main_service_id: string
  details: string
  experience_years: string
  
  // Pricing & Payment
  fees_pricing: string
  accepts_card: boolean
  accepts_cash: boolean
  deposit_required: boolean
  
  // Business Details
  emergency_service: boolean
  callout_fee: string
  insurance: boolean
  
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
  serviceAreas,
  onServiceAreasChange,
  formData,
  onFormChange,
  formErrors,
  setFormErrors,
  onOpenServiceDrawer,
  onOpenAreaDrawer,
  onOpenAccreditationDrawer,
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
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
              maxLength={12} // 3 digits + space + 3 digits + space + 4 digits = 12 chars
              inputMode="numeric"
              pattern="[0-9\s]*"
            />
            {formErrors.contact_phone && (
              <p className="mt-1 text-sm text-red-400">{formErrors.contact_phone}</p>
            )}
          </div>
          
          {/* Alternate Phone */}
          <div>
            <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
              Alternate Phone
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
              <span className="text-gray-300 text-xs ml-2"><span className="text-orange-400">💡</span>Enter services separated by commas or on separate lines. Will display as a bullet list.</span>
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={10}
              disabled={disabledFields.includes('details')}
              className={`w-full px-4 py-5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${disabledFields.includes('details') ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="Enter your service details..."
            />
          </div>
          
          {/* Accreditations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#FF7A45] flex items-center gap-1">
                <span>Accreditations</span>
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
                    {acc.is_custom ? acc.custom_name?.substring(0, 20) : 'Certified'}
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
            <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
              <span>Service Areas</span>
              <span className="text-red-500">*</span>
            </label>
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
          
          {/* Checkboxes Grid */}
          <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Accepts Cash */}
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <input
                  type="checkbox"
                  name="accepts_cash"
                  checked={formData.accepts_cash}
                  onChange={handleChange}
                  disabled={disabledFields.includes('accepts_cash')}
                  className={`mr-3 accent-orange-500 w-5 h-5 ${disabledFields.includes('accepts_cash') ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
                <div className="flex items-center gap-2">
                  <label className="text-gray-300 text-sm font-medium">Accepts Cash</label>
                </div>
              </div>
              
              {/* Accepts Card */}
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <input
                  type="checkbox"
                  name="accepts_card"
                  checked={formData.accepts_card}
                  onChange={handleChange}
                  disabled={disabledFields.includes('accepts_card')}
                  className={`mr-3 accent-orange-500 w-5 h-5 ${disabledFields.includes('accepts_card') ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <label className="text-gray-300 text-sm font-medium">Accepts Card</label>
                </div>
              </div>
              
              {/* Deposit Required */}
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <input
                  type="checkbox"
                  name="deposit_required"
                  checked={formData.deposit_required}
                  onChange={handleChange}
                  disabled={disabledFields.includes('deposit_required')}
                  className={`mr-3 accent-orange-500 w-5 h-5 ${disabledFields.includes('deposit_required') ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <label className="text-gray-300 text-sm font-medium">Requires Deposit</label>
                </div>
              </div>
              
              {/* Emergency Service */}
              <div className={`flex flex-col p-3 rounded-lg border transition-colors ${formData.emergency_service ? 'bg-orange-500/10 border-orange-500/30' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="emergency_service"
                    checked={formData.emergency_service}
                    onChange={handleChange}
                    disabled={disabledFields.includes('emergency_service')}
                    className={`mr-3 accent-orange-500 w-5 h-5 ${disabledFields.includes('emergency_service') ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <label className="text-gray-300 text-sm font-medium">Emergency Service</label>
                  </div>
                </div>
                
                {/* Callout fee appears below emergency service checkbox */}
                {formData.emergency_service && (
                  <div className="mt-3 pl-8">
                    <div className="relative">
                      <input
                        type="text"
                        name="callout_fee"
                        value={formData.callout_fee}
                        onChange={handleChange}
                        disabled={disabledFields.includes('callout_fee')}
                        className={`w-full px-4 py-2 bg-gray-900 border ${formErrors.callout_fee ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm ${disabledFields.includes('callout_fee') ? 'opacity-70 cursor-not-allowed' : ''}`}
                        placeholder="Emergency callout fee (e.g., 300)"
                      />
                    </div>
                    {formErrors.callout_fee && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.callout_fee}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Insurance */}
              <div className={`flex flex-col p-3 rounded-lg border transition-colors ${formData.insurance ? 'bg-orange-500/10 border-orange-500/30' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="insurance"
                    checked={formData.insurance}
                    onChange={handleChange}
                    disabled={disabledFields.includes('insurance')}
                    className={`mr-3 accent-orange-500 w-5 h-5 ${disabledFields.includes('insurance') ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <label className="text-gray-300 text-sm font-medium">Insurance Approved</label>
                  </div>
                </div>
              </div>
            </div>
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