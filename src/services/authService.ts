// src/services/authService.ts
// This file contains functions for user authentication, including login, fetching the current user, and managing user roles.
// It uses an API client to make requests to the backend authentication endpoints.
import apiClient from '../api/client';
import type { User } from '../models/interfaces/User';
import type { Role } from '../models/interfaces/Role';

export async function login(username: string, password: string): Promise<string> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await apiClient.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const { access_token } = response.data;
  return access_token;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function getUserRoles(userId: number): Promise<Role[]> {
  const response = await apiClient.get(`/roles/user/${userId}`);
  return response.data as Role[]; // ✅ Return full roles
}


export function logout(): void {
  localStorage.removeItem('token');
}
