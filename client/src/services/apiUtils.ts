export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiException extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
  }
}

export class InvalidCredentialsException extends ApiException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCredentialsException';
    this.status = 422;
    this.code = 'INVALID_CREDENTIALS';
  }
}

export const handleApiError = (error): ApiException => {
  if (error instanceof ApiException) {
    return error;
  }

  if (error.response) {
    // HTTP error response
    if (error.response.status === 422 && error.response.data.code === 'INVALID_CREDENTIALS') {
      return new InvalidCredentialsException('Invalid credentials');
    }
    return new ApiException(
      error.response.data?.message || 'An error occurred',
      error.response.status,
      error.response.data?.code
    );
  }

  if (error.request) {
    // Network error
    return new ApiException('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
  }

  // Other error
  return new ApiException(error.message || 'An unexpected error occurred');
};

export const isNetworkError = (error: ApiException): boolean => {
  return error.code === 'NETWORK_ERROR' || error.status === 0;
};

export const isAuthError = (error: ApiException): boolean => {
  return error.status === 401 || error.status === 403;
};

export const isInvalidCredentialsError = (error: ApiException): boolean => {
  return error.status === 422 && error.code === 'INVALID_CREDENTIALS';
};