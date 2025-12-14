import { API_BASE_URL } from './config';

const headers = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

export interface UserSettings {
  array_size: number;
  speed: number;
}

export interface CreateUserResponse {
  user_id: number;
}

export interface LoginUserResponse {
  user_id: number;
}

export async function createUser(email: string): Promise<CreateUserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  
  return response.json();
}

export async function loginUser(email: string): Promise<LoginUserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to login');
  }
  
  return response.json();
}

export async function getUserSettings(userId: number): Promise<UserSettings> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/settings?user_id=${userId}`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  
  return response.json();
}

export async function updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/settings`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ user_id: userId, ...settings }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update settings');
  }
  
  return response.json();
}
