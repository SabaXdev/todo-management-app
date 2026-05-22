import { User } from './user.model';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
