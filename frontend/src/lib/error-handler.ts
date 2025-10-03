import { toast } from 'sonner';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  public fields?: Record<string, string[]>;

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export function handleApiError(error: any): AppError {
  console.error('API Error:', error);

  // Network/Connection errors
  if (!navigator.onLine) {
    return {
      message: 'No internet connection. Please check your network and try again.',
      code: 'NETWORK_ERROR',
      status: 0
    };
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Unable to connect to server. Please try again later.',
      code: 'CONNECTION_ERROR',
      status: 0
    };
  }

  // API Response errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return {
          message: error.message || 'Invalid request. Please check your input.',
          code: 'BAD_REQUEST',
          status: 400,
          details: error.details
        };
      
      case 401:
        // Clear stored tokens if unauthorized
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        return {
          message: 'Your session has expired. Please sign in again.',
          code: 'UNAUTHORIZED',
          status: 401
        };
      
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN',
          status: 403
        };
      
      case 404:
        return {
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND',
          status: 404
        };
      
      case 409:
        return {
          message: error.message || 'A conflict occurred. Please try again.',
          code: 'CONFLICT',
          status: 409
        };
      
      case 422:
        return {
          message: 'Validation failed. Please check your input.',
          code: 'VALIDATION_ERROR',
          status: 422,
          details: error.details
        };
      
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          code: 'RATE_LIMITED',
          status: 429
        };
      
      case 500:
        return {
          message: 'Internal server error. Please try again later.',
          code: 'SERVER_ERROR',
          status: 500
        };
      
      case 502:
      case 503:
      case 504:
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
          status: error.status
        };
      
      default:
        return {
          message: error.message || 'An unexpected error occurred.',
          code: 'UNKNOWN_ERROR',
          status: error.status
        };
    }
  }

  // JavaScript errors
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred.',
      code: 'JAVASCRIPT_ERROR',
      details: error.stack
    };
  }

  // Fallback for unknown error types
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR'
  };
}

export function showErrorToast(error: AppError | Error | string) {
  let appError: AppError;

  if (typeof error === 'string') {
    appError = { message: error };
  } else if (error instanceof Error) {
    appError = handleApiError(error);
  } else {
    appError = error;
  }

  // Don't show toast for unauthorized errors (redirect will handle it)
  if (appError.code === 'UNAUTHORIZED') {
    return;
  }

  toast.error(appError.message, {
    duration: appError.status && appError.status >= 500 ? 6000 : 4000,
    description: appError.code ? `Error Code: ${appError.code}` : undefined,
  });
}

export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 3000,
  });
}

export function showWarningToast(message: string, description?: string) {
  toast.warning(message, {
    description,
    duration: 4000,
  });
}

export function showInfoToast(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: 3000,
  });
}

// Retry logic
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry certain types of errors
      if (error.status && [400, 401, 403, 404, 422].includes(error.status)) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

// Error reporting (can be extended to send to external services)
export function reportError(error: Error, context?: string, userId?: string) {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    context,
    userId,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  console.error('Error Report:', errorReport);

  // In production, you would send this to an error reporting service
  // like Sentry, LogRocket, Bugsnag, etc.
  // Example:
  // Sentry.captureException(error, {
  //   tags: { context },
  //   user: { id: userId },
  //   extra: errorReport
  // });
}

// Global error handler for unhandled promises
export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return;

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    reportError(new Error(event.reason), 'unhandled_promise_rejection');
    
    // Prevent the default browser behavior
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    reportError(event.error, 'global_error');
  });
}

// Test connection utility
export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch('/api/v1/health/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}