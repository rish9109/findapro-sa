'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ScrollToTop from './ScrollToTop'

interface FormSubmissionDrawerProps {
  isOpen: boolean
  status: 'submitting' | 'success' | 'error'
  message?: string
  detail?: string
  onClose?: () => void
  onRetry?: () => void
  disableClose?: boolean
  redirectOnSuccess?: string // URL to redirect to on success
  redirectDelay?: number // Delay before redirect (in ms)
}

export default function FormSubmissionDrawer({ 
  isOpen, 
  status, 
  message, 
  detail,
  onClose,
  onRetry,
  disableClose = false,
  redirectOnSuccess = '/providers/dashboard',
  redirectDelay = 2000
}: FormSubmissionDrawerProps) {
  const router = useRouter()
  
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle success redirect
  useEffect(() => {
    if (status === 'success' && isOpen) {
      const timer = setTimeout(() => {
        router.push(redirectOnSuccess)
      }, redirectDelay)
      
      return () => clearTimeout(timer)
    }
  }, [status, isOpen, router, redirectOnSuccess, redirectDelay])

  // Prevent click events when submitting (cannot be stopped mid-process)
  const handleBackdropClick = () => {
    if (!disableClose && onClose && status !== 'submitting') {
      onClose()
    }
  }

  // Get status-specific content
  const getStatusContent = () => {
    switch(status) {
      case 'submitting':
        return {
          icon: (
            <div className="spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
          ),
          title: message || 'Submitting...',
          description: detail || 'Please wait while we process your request',
          iconClass: 'submitting',
          gradient: 'from-purple-600 to-blue-600'
        }
      case 'success':
        return {
          icon: (
            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          title: message || 'Success!',
          description: detail || 'Your changes have been saved successfully',
          iconClass: 'success',
          gradient: 'from-green-500 to-emerald-500'
        }
      case 'error':
        return {
          icon: (
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v5M12 16h.01" strokeLinecap="round"/>
            </svg>
          ),
          title: message || 'Oops!',
          description: detail || 'Something went wrong. Please try again.',
          iconClass: 'error',
          gradient: 'from-red-500 to-pink-500'
        }
      default:
        return {
          icon: null,
          title: '',
          description: '',
          iconClass: '',
          gradient: ''
        }
    }
  }

  const content = getStatusContent()

  return (
    <>
      {/* Scroll to top when drawer opens */}
      {isOpen && <ScrollToTop />}
      
      {/* Backdrop */}
      <div 
        className={`drawer-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={handleBackdropClick}
        style={{ 
          pointerEvents: disableClose && status === 'submitting' ? 'none' : 'auto' 
        }}
      ></div>

      {/* Drawer */}
      <div className={`feedback-drawer ${isOpen ? 'open' : ''} theme-dark`}>
        <div className={`drawer-top-bar bg-gradient-to-r ${content.gradient}`}></div>
        
        <div className="drawer-content">
          <div className={`status-icon ${content.iconClass}`}>
            {content.icon}
          </div>
          
          <div className="status-message">{content.title}</div>
          <div className="status-detail">{content.description}</div>
          
          {status === 'submitting' && (
            <div className="progress-bar">
              <div className={`progress-fill bg-gradient-to-r ${content.gradient}`}></div>
            </div>
          )}

          {status === 'success' && (
            <div className="success-message">
              Redirecting to dashboard...
            </div>
          )}
        </div>

        {/* Only show buttons for error state */}
        {status === 'error' && (
          <div className="drawer-footer">
            {onRetry && (
              <button 
                className="drawer-action-btn secondary"
                onClick={onRetry}
              >
                Try Again
              </button>
            )}
            {onClose && (
              <button 
                className="drawer-action-btn primary"
                onClick={onClose}
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .feedback-drawer {
          position: fixed;
          top: -500px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 450px;
          background: #1a1a1a;
          border-radius: 0 0 28px 28px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transition: top 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1000;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: none;
        }

        .feedback-drawer.open {
          top: 0;
        }

        .drawer-top-bar {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          border-radius: 0 0 4px 4px;
        }

        .bg-gradient-to-r {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s ease;
          z-index: 999;
        }

        .drawer-backdrop.visible {
          opacity: 1;
          visibility: visible;
        }

        .drawer-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-height: 280px;
          justify-content: center;
        }

        .status-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: dropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.3);
          background: #2a2a2a;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        @keyframes dropIn {
          0% { transform: translateY(-30px) scale(0.8); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        .status-icon.submitting {
          background: #2a2a2a;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .spinner {
          position: relative;
          width: 50px;
          height: 50px;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #667eea;
          border-right-color: #764ba2;
          animation: spin 1s linear infinite;
        }

        .spinner-ring:nth-child(2) {
          animation: spin 1.5s linear reverse infinite;
          border-top-color: #fbbf24;
          border-right-color: #f59e0b;
          opacity: 0.7;
        }

        .spinner-ring:nth-child(3) {
          animation: spin 2s linear infinite;
          border-top-color: #34d399;
          border-right-color: #10b981;
          opacity: 0.5;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status-icon.success {
          background: #2a2a2a;
          color: #10b981;
          animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .check-icon {
          width: 50px;
          height: 50px;
          stroke: #10b981;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: drawCheck 0.6s ease forwards 0.3s;
        }

        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }

        @keyframes successPop {
          0% { transform: scale(0) rotate(-180deg); }
          100% { transform: scale(1) rotate(0); }
        }

        .status-icon.error {
          background: #2a2a2a;
          color: #ef4444;
          animation: shake 0.5s ease;
        }

        .error-icon {
          width: 50px;
          height: 50px;
          stroke: #ef4444;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }

        .status-message {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, #fff, #e5e7eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .status-detail {
          color: #9ca3af;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .success-message {
          color: #6b7280;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          animation: fadeInOut 2s infinite;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #2a2a2a;
          border-radius: 3px;
          margin-top: 1rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .progress-fill {
          height: 100%;
          width: 0%;
          border-radius: 3px;
        }

        .progress-fill {
          width: 90%;
          animation: progressPulse 2s ease-in-out infinite;
        }

        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .drawer-footer {
          padding-top: 1.5rem;
          border-top: 2px solid #2a2a2a;
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .drawer-action-btn {
          flex: 1;
          max-width: 200px;
          padding: 0.875rem;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .drawer-action-btn.primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .drawer-action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -10px rgba(102,126,234,0.5);
        }

        .drawer-action-btn.secondary {
          background: #2a2a2a;
          color: #e5e7eb;
        }

        .drawer-action-btn.secondary:hover {
          background: #333;
        }

        @media (max-width: 640px) {
          .feedback-drawer {
            width: 95%;
            padding: 1.5rem;
          }
          
          .drawer-footer {
            flex-direction: column;
            align-items: center;
          }
          
          .drawer-action-btn {
            max-width: 100%;
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}