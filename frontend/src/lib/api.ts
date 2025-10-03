import { ApiError, NetworkError, ValidationError, handleApiError, withRetry } from './error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  password: string;
  confirm_password: string;
}

interface ApiResponse<T = any> {
  user?: T;
  tokens?: {
    access: string;
    refresh: string;
  };
  message?: string;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  retries?: number;
  timeout?: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const { skipAuth = false, retries = 1, timeout = 30000, ...fetchOptions } = options;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    };

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    // Add auth token if available and not skipped
    if (!skipAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await withRetry(async () => {
        const res = await fetch(url, config);
        
        if (!res.ok) {
          let errorData: any = {};
          const contentType = res.headers.get('content-type');
          
          try {
            if (contentType && contentType.includes('application/json')) {
              errorData = await res.json();
            } else {
              errorData = { message: await res.text() };
            }
          } catch {
            errorData = { message: `HTTP ${res.status} Error` };
          }

          // Handle different error types
          if (res.status === 401) {
            // Try to refresh token automatically
            if (!skipAuth && endpoint !== '/auth/token/refresh/') {
              try {
                await this.refreshToken();
                // Retry the original request with new token
                return this.makeRequest(endpoint, { ...options, retries: 0 });
              } catch (refreshError) {
                // Refresh failed, throw unauthorized error
                throw new ApiError('Session expired. Please sign in again.', 401, 'UNAUTHORIZED');
              }
            }
            throw new ApiError('Unauthorized access', 401, 'UNAUTHORIZED', errorData);
          }

          if (res.status === 422) {
            throw new ValidationError(
              errorData.message || 'Validation failed',
              errorData.errors || errorData.detail
            );
          }

          throw new ApiError(
            errorData.detail || errorData.message || `Request failed with status ${res.status}`,
            res.status,
            errorData.code,
            errorData
          );
        }

        return res;
      }, retries);

      clearTimeout(timeoutId);

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        return text ? JSON.parse(text) : {};
      }

      return {} as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout errors
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout. Please try again.');
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed. Please check your internet connection.');
      }

      // Re-throw our custom errors
      if (error instanceof ApiError || error instanceof ValidationError || error instanceof NetworkError) {
        throw error;
      }

      // Handle unknown errors
      console.error('API Request failed:', error);
      throw new ApiError(
        error.message || 'An unexpected error occurred',
        error.status || 500,
        'UNKNOWN_ERROR'
      );
    }
  }

  // Authentication methods
  async login(data: LoginData): Promise<ApiResponse> {
    const response = await this.makeRequest<ApiResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens in localStorage
    if (response.tokens) {
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async register(data: RegisterData): Promise<ApiResponse> {
    const response = await this.makeRequest<ApiResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens in localStorage
    if (response.tokens) {
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.makeRequest<{ access: string }>('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    localStorage.setItem('access_token', response.access);
    return response;
  }

  // Profile methods
  async getProfile(): Promise<any> {
    return this.makeRequest('/auth/profile/');
  }

  async updateProfile(data: any): Promise<any> {
    return this.makeRequest('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getDashboardStats(): Promise<any> {
    return this.makeRequest('/auth/dashboard/stats/');
  }

  async getRecentActivity(): Promise<any> {
    return this.makeRequest('/auth/dashboard/activity/');
  }

  // Utility methods
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  }

  getCurrentUser(): any {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/health/', { 
      skipAuth: true,
      timeout: 5000 // 5 second timeout for health checks
    });
  }

  // Generic API request method with enhanced options
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, options);
  }

  // Batch requests
  async batchRequest<T = any>(requests: Array<{ endpoint: string; options?: RequestOptions }>): Promise<T[]> {
    const promises = requests.map(({ endpoint, options = {} }) => 
      this.makeRequest<T>(endpoint, options).catch(error => ({ error }))
    );
    
    return Promise.all(promises);
  }

  // Upload file
  async uploadFile(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const config: RequestOptions = {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData, let browser set it
    };

    // Add progress tracking if XMLHttpRequest is needed
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              resolve(xhr.responseText);
            }
          } else {
            reject(new ApiError(`Upload failed with status ${xhr.status}`, xhr.status));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new NetworkError('Upload failed'));
        });

        const token = localStorage.getItem('access_token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.open('POST', `${this.baseUrl}${endpoint}`);
        xhr.send(formData);
      });
    }

    return this.makeRequest(endpoint, config);
  }
}

export const apiService = new ApiService();

// Export a convenient function for making API requests
export const apiRequest = (endpoint: string, options?: RequestInit) => 
  apiService.request(endpoint, options);

export type { LoginData, RegisterData, ApiResponse, RequestOptions };