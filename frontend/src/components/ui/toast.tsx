'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export interface Toast {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastComponent({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Show toast
    const showTimer = setTimeout(() => setIsVisible(true), 50)
    
    // Don't auto-hide if persistent
    if (toast.persistent) {
      clearTimeout(showTimer)
      setIsVisible(true)
      return () => clearTimeout(showTimer)
    }
    
    // Progress bar animation
    const duration = toast.duration || 5000
    let progressTimer: NodeJS.Timeout
    let hideTimer: NodeJS.Timeout

    if (!isPaused) {
      progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100))
          return newProgress <= 0 ? 0 : newProgress
        })
      }, 100)

      // Auto hide timer
      hideTimer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onRemove(toast.id), 300)
      }, duration)
    }

    return () => {
      clearTimeout(showTimer)
      if (hideTimer) clearTimeout(hideTimer)
      if (progressTimer) clearInterval(progressTimer)
    }
  }, [toast.id, toast.duration, toast.persistent, onRemove, isPaused])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-white border-l-4 border-green-500 shadow-lg',
          text: 'text-green-800',
          progress: 'bg-green-500'
        }
      case 'error':
        return {
          bg: 'bg-white border-l-4 border-red-500 shadow-lg',
          text: 'text-red-800', 
          progress: 'bg-red-500'
        }
      case 'warning':
        return {
          bg: 'bg-white border-l-4 border-amber-500 shadow-lg',
          text: 'text-amber-800',
          progress: 'bg-amber-500'
        }
      case 'info':
        return {
          bg: 'bg-white border-l-4 border-blue-500 shadow-lg',
          text: 'text-blue-800',
          progress: 'bg-blue-500'
        }
    }
  }

  const styles = getStyles()

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
      onMouseEnter={() => !toast.persistent && setIsPaused(true)}
      onMouseLeave={() => !toast.persistent && setIsPaused(false)}
    >
      <div className={`max-w-sm w-full rounded-lg ${styles.bg} overflow-hidden relative group hover:shadow-xl transition-shadow duration-200`}>
        {/* Progress bar */}
        {!toast.persistent && (
          <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full">
            <div 
              className={`h-full ${styles.progress} transition-all duration-100 ease-linear ${isPaused ? 'animation-paused' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        <div className="p-4 pt-5">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className={`text-sm font-semibold ${styles.text}`}>
                {toast.title}
              </p>
              {toast.message && (
                <p className={`mt-1 text-sm ${styles.text} opacity-70`}>
                  {toast.message}
                </p>
              )}
              
              {/* Action button */}
              {toast.action && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      toast.action?.onClick()
                      handleClose()
                    }}
                    className={`text-sm font-medium ${styles.text} hover:underline focus:outline-none focus:underline transition-colors duration-150`}
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={handleClose}
                className={`inline-flex rounded-md p-1.5 transition-colors duration-150 ${styles.text} hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 opacity-60 hover:opacity-100`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto"
          style={{
            animationDelay: `${index * 100}ms`,
            transform: `translateY(${index * 4}px)`,
            zIndex: 9999 - index
          }}
        >
          <ToastComponent toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (title: string, message?: string, duration?: number) => {
    addToast({ title, message, type: 'success', duration })
  }

  const error = (title: string, message?: string, duration?: number) => {
    addToast({ title, message, type: 'error', duration })
  }

  const warning = (title: string, message?: string, duration?: number) => {
    addToast({ title, message, type: 'warning', duration })
  }

  const info = (title: string, message?: string, duration?: number) => {
    addToast({ title, message, type: 'info', duration })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}

// Global toast instance
let globalToast: ReturnType<typeof useToast> | null = null

export function setGlobalToast(toast: ReturnType<typeof useToast>) {
  globalToast = toast
}

export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    if (globalToast) globalToast.success(title, message, duration)
  },
  error: (title: string, message?: string, duration?: number) => {
    if (globalToast) globalToast.error(title, message, duration)
  },
  warning: (title: string, message?: string, duration?: number) => {
    if (globalToast) globalToast.warning(title, message, duration)
  },
  info: (title: string, message?: string, duration?: number) => {
    if (globalToast) globalToast.info(title, message, duration)
  },
  // Enhanced methods with action support
  successWithAction: (title: string, message?: string, action?: { label: string; onClick: () => void }, duration?: number) => {
    if (globalToast) globalToast.addToast({ title, message, type: 'success', action, duration })
  },
  errorPersistent: (title: string, message?: string, action?: { label: string; onClick: () => void }) => {
    if (globalToast) globalToast.addToast({ title, message, type: 'error', action, persistent: true })
  },
  warningWithAction: (title: string, message?: string, action?: { label: string; onClick: () => void }, duration?: number) => {
    if (globalToast) globalToast.addToast({ title, message, type: 'warning', action, duration })
  },
  // Quick access methods
  deleted: (itemName: string, undoAction?: () => void) => {
    if (globalToast) {
      globalToast.addToast({
        title: `${itemName} deleted`,
        message: undoAction ? 'Click to undo this action' : undefined,
        type: 'success',
        action: undoAction ? { label: 'Undo', onClick: undoAction } : undefined,
        duration: undoAction ? 8000 : 3000
      })
    }
  },
  updated: (itemName: string) => {
    if (globalToast) globalToast.success(`${itemName} updated successfully`, undefined, 3000)
  },
  created: (itemName: string) => {
    if (globalToast) globalToast.success(`${itemName} created successfully`, undefined, 3000)
  },
  networkError: (retry?: () => void) => {
    if (globalToast) {
      globalToast.addToast({
        title: 'Network Error',
        message: 'Unable to connect to server. Please check your connection.',
        type: 'error',
        action: retry ? { label: 'Retry', onClick: retry } : undefined,
        persistent: !retry
      })
    }
  }
}