import { LoginCredentials, SignupData, AuthResponse, User } from '@/types/auth';
import { API_CONFIG, getApiUrl } from './config';
import { ApiException, handleApiError, InvalidCredentialsException } from './apiUtils';




class ApiService {
    
  private getAuthHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
        if (response.status === 401 && response.url.endsWith('/auth/login')) {
        throw new InvalidCredentialsException(
          errorData.message || `Invalid credentials`
        );
      }
      else if (response.status === 401) {
        console.log('Unauthorized request, redirecting to login...');
        alert('Unauthorized request or Token expired, redirecting to login...');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new ApiException(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData.code
      );
    }
    return response.json();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    try {
      const url = getApiUrl(endpoint);
      const headers = this.getAuthHeaders(token);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async sendEmailVerification(email: string) {
    return this.makeRequest('/email-verification/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmail(email: string, code: string) {
    return this.makeRequest('/email-verification/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    return this.makeRequest<{ exists: boolean }>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(data: SignupData): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers(token: string): Promise<User[]> {
    return this.makeRequest<User[]>('/users', {
      method: 'GET',
    }, token);
  }

  async getUser(id: string, token: string): Promise<User> {
    return this.makeRequest<User>(`/users/${id}`, {
      method: 'GET',
    }, token);
  }

  async updateUser(id: string, userData: Partial<User>, token: string): Promise<User> {
    return this.makeRequest<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }, token);
  }

  async deleteUser(id: string, token: string): Promise<void> {
    await this.makeRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    }, token);
  }

  async getPendingAdmins(token: string): Promise<User[]> {
    return this.makeRequest<User[]>('/auth/pending-admins', {
      method: 'GET',
    }, token);
  }

  async approveAdmin(id: string, token: string): Promise<void> {
    await this.makeRequest<void>(`/auth/approve-admin/${id}`, {
      method: 'PATCH',
    }, token);
  }

  async rejectAdmin(id: string, token: string): Promise<void> {
    await this.makeRequest<void>(`/auth/reject-admin/${id}`, {
      method: 'PATCH',
    }, token);
  }

  async sendApprovalEmail(emailData: unknown, token: string): Promise<void> {
    await this.makeRequest<void>('/email/send-approval', {
      method: 'POST',
      body: JSON.stringify(emailData),
    }, token);
  }

  async updateOwnProfile(userData: Partial<User>, token: string): Promise<User> {
    return this.makeRequest<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }, token);
  }

  async deleteOwnAccount(token: string): Promise<void> {
    await this.makeRequest<void>('/users/profile', {
      method: 'DELETE',
    }, token);
  }
}

export const apiService = new ApiService();
