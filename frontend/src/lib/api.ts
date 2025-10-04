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

interface MobileSendOTPData {
  phone: string;
  purpose: 'registration' | 'login';
}

interface MobileVerifyOTPData {
  phone: string;
  otp: string;
  purpose: 'registration' | 'login';
}

interface MobileRegistrationData {
  phone: string;
  otp: string;
  first_name?: string;
  last_name?: string;
}

interface MobileLoginData {
  phone: string;
  otp: string;
}

interface MobilePasswordRegistrationData {
  phone: string;
  otp: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
}

interface MobilePasswordLoginData {
  phone: string;
  password: string;
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
    console.log('API Request:', { url, method: fetchOptions.method || 'GET', baseUrl: this.baseUrl, endpoint });
    
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
            console.error('422 Validation Error:', errorData);
            throw new ValidationError(
              errorData.message || 'Validation failed',
              errorData.errors || errorData.detail
            );
          }

          console.error('API Error Response:', {
            status: res.status,
            errorData: errorData,
            url: url,
            method: config.method
          });

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
        console.error('Network Error Details:', { error, url, message: error.message });
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

  // Mobile Authentication methods
  async mobileSendOTP(data: MobileSendOTPData): Promise<any> {
    console.log('mobileSendOTP called with:', data);
    console.log('API Base URL:', this.baseUrl);
    try {
      const result = await this.makeRequest('/auth/mobile/send-otp/', {
        method: 'POST',
        body: JSON.stringify(data),
        skipAuth: true,
      });
      console.log('mobileSendOTP success:', result);
      return result;
    } catch (error: any) {
      console.error('mobileSendOTP error:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        data: error?.data,
        fullError: JSON.stringify(error)
      });
      throw error;
    }
  }

  async mobileVerifyOTP(data: MobileVerifyOTPData): Promise<any> {
    return this.makeRequest('/auth/mobile/verify-otp/', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  }

  async mobileRegister(data: MobileRegistrationData): Promise<ApiResponse> {
    const response = await this.makeRequest<ApiResponse>('/auth/mobile/register/', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });

    // Store tokens in localStorage
    if (response.tokens) {
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async mobileLogin(data: MobileLoginData): Promise<ApiResponse> {
    const response = await this.makeRequest<ApiResponse>('/auth/mobile/login/', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });

    // Store tokens in localStorage
    if (response.tokens) {
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async mobilePasswordRegister(data: MobilePasswordRegistrationData): Promise<ApiResponse> {
    const response = await this.makeRequest<ApiResponse>('/auth/mobile/password/register/', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });

    // Store tokens in localStorage
    if (response.tokens) {
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async mobilePasswordLogin(data: MobilePasswordLoginData): Promise<ApiResponse> {
    const response = await this.makeRequest<ApiResponse>('/auth/mobile/password/login/', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });

    // Store tokens in localStorage
    if (response.tokens) {
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  // Test and Exam API methods
  async getExams(params?: { category?: string; search?: string }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.makeRequest(`/exams/exams/${query}`);
  }

  async getExam(examId: string): Promise<any> {
    return this.makeRequest(`/exams/exams/${examId}/`);
  }

  async getExamTests(examId: string): Promise<any> {
    return this.makeRequest(`/exams/exams/${examId}/tests/`);
  }

  async getTests(params?: { exam?: string; active_only?: boolean }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.exam) searchParams.append('exam', params.exam);
    if (params?.active_only) searchParams.append('active_only', 'true');
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.makeRequest(`/exams/tests/${query}`);
  }

  async getTest(testId: string): Promise<any> {
    return this.makeRequest(`/exams/tests/${testId}/`);
  }

  async startTestAttempt(testId: string): Promise<any> {
    return this.makeRequest(`/exams/tests/${testId}/start_attempt/`, {
      method: 'POST',
    });
  }

  async getTestAttempts(): Promise<any> {
    return this.makeRequest('/exams/test-attempts/');
  }

  async getTestAttempt(attemptId: string): Promise<any> {
    return this.makeRequest(`/exams/test-attempts/${attemptId}/`);
  }

  async getTestAttemptQuestions(attemptId: string): Promise<any> {
    return this.makeRequest(`/exams/test-attempts/${attemptId}/questions/`);
  }

  async getTestAttemptAnswers(attemptId: string): Promise<any> {
    return this.makeRequest(`/exams/test-attempts/${attemptId}/answers/`);
  }

  async autoSaveTestAnswers(attemptId: string, answers: Record<string, any>): Promise<any> {
    return this.makeRequest(`/exams/test-attempts/${attemptId}/auto_save/`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async submitTestAttempt(attemptId: string): Promise<any> {
    return this.makeRequest(`/exams/test-attempts/${attemptId}/submit/`, {
      method: 'POST',
    });
  }

  async getTestAttemptResults(attemptId: string): Promise<any> {
    return this.makeRequest(`/exams/test-attempts/${attemptId}/results/`);
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

  // Content update methods
  async updateQuestionBank(bankId: string, data: any): Promise<ApiResponse> {
    return this.makeRequest(`/api/v1/questions/admin/update-question-bank/${bankId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateExam(examId: number, data: any): Promise<ApiResponse> {
    return this.makeRequest(`/api/v1/questions/admin/update-exam/${examId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateTest(testId: number, data: any): Promise<ApiResponse> {
    return this.makeRequest(`/api/v1/questions/admin/update-test/${testId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Content deletion methods
  async deleteQuestionBank(bankId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/v1/questions/admin/delete-question-bank/${bankId}/`, {
      method: 'DELETE',
    });
  }

  async deleteExam(examId: number): Promise<ApiResponse> {
    return this.makeRequest(`/api/v1/questions/admin/delete-exam/${examId}/`, {
      method: 'DELETE',
    });
  }

  async deleteTest(testId: number): Promise<ApiResponse> {
    return this.makeRequest(`/api/v1/questions/admin/delete-test/${testId}/`, {
      method: 'DELETE',
    });
  }

  async deleteContent(uploadId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/v1/questions/admin/content-delete/${uploadId}/`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();

// Export a convenient function for making API requests
export const apiRequest = (endpoint: string, options?: RequestInit) => 
  apiService.request(endpoint, options);

export type { 
  LoginData, 
  RegisterData, 
  MobileSendOTPData,
  MobileVerifyOTPData,
  MobileRegistrationData,
  MobileLoginData,
  MobilePasswordRegistrationData,
  MobilePasswordLoginData,
  ApiResponse, 
  RequestOptions 
};