'use client'

import { motion } from 'framer-motion'

interface WhatsAppButtonProps {
  phoneNumber: string
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'minimal'
  showIcon?: boolean
  showLabel?: boolean
  className?: string
}

export default function WhatsAppButton({
  phoneNumber,
  message = "Hello, I'm interested in your services.",
  size = 'md',
  variant = 'primary',
  showIcon = true,
  showLabel = true,
  className = ''
}: WhatsAppButtonProps) {
  
  // Clean phone number (remove spaces, dashes, etc)
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg'
  }
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border border-green-400/30',
    secondary: 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30',
    minimal: 'bg-transparent hover:bg-green-500/10 text-green-400 border border-green-500/30'
  }
  
  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-all
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      onClick={(e) => {
        // Prevent if it's a test number or invalid
        if (cleanNumber.length < 10) {
          e.preventDefault()
          console.warn('Invalid phone number for WhatsApp')
        }
      }}
    >
      {showIcon && (
        <svg 
          className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}`} 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.349 0-9.703 4.352-9.706 9.702 0 1.703.444 3.371 1.286 4.836L2 22l5.539-1.504c1.414.783 3.004 1.196 4.64 1.197h.004c5.347 0 9.701-4.353 9.704-9.703.001-2.598-1.01-5.041-2.897-6.928zM12.018 20.06h-.003c-1.446 0-2.864-.389-4.082-1.12l-.293-.174-3.288.875.88-3.2-.19-.305c-.758-1.215-1.158-2.617-1.158-4.064.003-4.445 3.619-8.06 8.067-8.06 2.153 0 4.178.841 5.699 2.368 1.521 1.527 2.358 3.553 2.357 5.71-.002 4.446-3.618 8.062-8.064 8.062zM16.247 14.28c-.245-.123-1.453-.717-1.678-.798-.225-.082-.388-.123-.552.122-.164.245-.636.798-.78.962-.143.164-.287.185-.532.062-.926-.403-1.719-.917-2.402-1.527-.901-.803-1.51-1.771-1.686-2.082-.164-.29-.018-.447.124-.592.128-.128.286-.334.429-.501.143-.167.191-.287.287-.479.095-.192.048-.36-.024-.503-.071-.143-.552-1.329-.756-1.818-.199-.479-.4-.414-.552-.422a9.96 9.96 0 0 0-.47-.008c-.166.005-.398.057-.608.287-.21.23-.802.784-.802 1.913 0 1.128.822 2.218.937 2.372.115.154 1.56 2.456 3.856 3.34 2.296.884 2.296.589 2.71.552.414-.037 1.337-.546 1.525-1.074.188-.528.188-.98.132-1.075-.057-.095-.21-.154-.456-.277z"/>
        </svg>
      )}
      {showLabel && (
        <span>WhatsApp</span>
      )}
    </motion.a>
  )
}