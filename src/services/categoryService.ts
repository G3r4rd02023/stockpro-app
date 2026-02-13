import api from './api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category.types';

export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },

    create: async (data: CreateCategoryRequest): Promise<Category> => {
        const response = await api.post<Category>('/categories', data);
        return response.data;
    },

    update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
        const response = await api.put<Category>(`/categories/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/categories/${id}`);
    }
};
