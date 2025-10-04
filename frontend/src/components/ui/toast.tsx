'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export interface Toast {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastComponent({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
    }
  }

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`max-w-sm w-full shadow-lg rounded-lg border ${getBackgroundColor()} p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`mt-1 text-sm ${getTextColor()} opacity-80`}>
                {toast.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => onRemove(toast.id), 300)
              }}
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getTextColor()} hover:opacity-80`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
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
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
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
  }
}