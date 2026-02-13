import api from './api';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types/product.types';

export const productService = {
    getAll: async (params?: any): Promise<Product[]> => {
        try {
            const response = await api.get<Product[]>('/products', { params });
            return response.data;
        } catch (error: any) {
            console.error('API Error (GetAll):', error.response?.data || error.message);
            throw error;
        }
    },

    getById: async (id: string): Promise<Product> => {
        try {
            const response = await api.get<Product>(`/products/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('API Error (GetById):', error.response?.data || error.message);
            throw error;
        }
    },

    create: async (data: CreateProductRequest): Promise<Product> => {
        try {
            const formData = new FormData();
            formData.append('Name', data.name);
            formData.append('SKU', data.sku);
            formData.append('CategoryId', data.categoryId);
            formData.append('Price', data.price.toString());
            formData.append('CurrentStock', data.currentStock.toString());
            formData.append('MinStockThreshold', data.minStockThreshold.toString());

            if (data.image instanceof File) {
                formData.append('ImageFile', data.image);
            } else if (data.image) {
                formData.append('ImageUrl', data.image);
            }

            const response = await api.post<Product>('/products', formData);
            return response.data;
        } catch (error: any) {
            console.error('API Error (Create):', error.response?.data?.message || error.message);
            throw error;
        }
    },

    update: async (id: string, data: UpdateProductRequest) => {
        try {
            const formData = new FormData();
            formData.append('Name', data.name);
            formData.append('SKU', data.sku);
            formData.append('CategoryId', data.categoryId);
            formData.append('Price', data.price.toString());
            formData.append('CurrentStock', data.currentStock.toString());
            formData.append('MinStockThreshold', data.minStockThreshold.toString());

            if (data.image instanceof File) {
                formData.append('ImageFile', data.image);
            } else if (data.image) {
                formData.append('ImageUrl', data.image);
            }

            const response = await api.put<Product>(`/products/${id}`, formData);
            return response.data;
        } catch (error: any) {
            console.error('API Error (Update):', error.response?.data || error.message);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/products/${id}`);
        } catch (error: any) {
            console.error('API Error (Delete):', error.response?.data || error.message);
            throw error;
        }
    }
};
