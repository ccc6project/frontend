
export interface User {
  user_id: number;
  name: string;
  email: string;
  document_type: string;
  document_number: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  document_type: string;
  document_number: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}


export interface RegisterData {
  name: string;
  email: string;
  password: string;
  document_type: string;
  document_number: string;
}