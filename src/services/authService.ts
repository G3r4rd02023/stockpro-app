import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export const authService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        // Try PascalCase route first as typical in .NET
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        // Exclude confirmPassword from the request body
        const { confirmPassword, ...registerData } = data;
        const response = await api.post<AuthResponse>('/auth/register', registerData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
};
