export interface User {
  isSuperAdmin: string;
  _id: string;
  name: string;
  email: string;
  address: string;
  role: 'user' | 'admin';
  isApproved?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  address: string;
  role: 'user' | 'admin';
}
