// services/api.ts

// services/api.ts
import type { LoginData, RegisterData, AuthResponse, User, LogoutResponse } from '../types/user';

const API_BASE_URL = 'http://localhost:5300'; // ✅ Puerto 5300 confirmado

export const authAPI = {
  // Registrar nuevo usuario
  async register(userData: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en el registro');
    }

    return await response.json();
  },

  // Login de usuario
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en el login');
    }

    return await response.json();
  },
  // Logout
  async logout(): Promise<LogoutResponse> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error en el logout');
    }

    return await response.json();
  },

  // Obtener lista de usuarios (opcional, para admin)
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`);

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return await response.json();
  },

};