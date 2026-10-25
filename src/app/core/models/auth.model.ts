export type Role = 'admin' | 'user' | 'guest';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expirationDate: string;
  role: Role;
  rol?: Role;
  email?: string;
}

export interface ApiResult<T = unknown > {
  value?: T;
  isSuccess: boolean;
  isFailure: boolean;
  message: string;
  errors?: string[];
}

export interface CurrentUser {  
  username: string;
  email: string;
  role: Role;
  rol?: Role;
  token: string;
  expiresAt: string;
}

export interface AdminUser {
  id?: number;
  email: string;
  name?: string;
  rol: Role;
}
