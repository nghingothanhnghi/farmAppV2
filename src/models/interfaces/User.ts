// src/models/interfaces/User.ts
import type { Role } from "./Role";
export interface User {
    id: number;
    username: string;
    phoneNumber: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    roles: Role[];
    image_url?: string;
    client_id?: string; 
    // Add any other fields returned by your backend for the user
}

export interface AuthResponse {
    jwt: string;
    user: User;
}

export interface ForgotPasswordResponse {
    message: string;
}

// Define the AuthState for Redux
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  }