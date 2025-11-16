export interface User {
  id: string;
  username: string;
  password: string; // hashed
  role: 'admin';
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  message?: string;
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

