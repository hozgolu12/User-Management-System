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

export const handleApiError = (error): ApiException => {
  if (error instanceof ApiException) {
    return error;
  }

  if (error.response) {
    // HTTP error response
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
