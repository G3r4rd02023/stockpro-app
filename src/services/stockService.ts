import api from './api';
import type { StockMovement, CreateStockMovementRequest } from '../types/stock.types';

export const stockService = {
    getAll: async (): Promise<StockMovement[]> => {
        try {
            const response = await api.get<StockMovement[]>('/stockmovements');
            return response.data;
        } catch (error: any) {
            console.error('API Error (GetMovements):', error.response?.data || error.message);
            throw error;
        }
    },

    create: async (data: CreateStockMovementRequest): Promise<StockMovement> => {
        try {
            const response = await api.post<StockMovement>('/stockmovements', data);
            return response.data;
        } catch (error: any) {
            console.error('API Error (CreateMovement):', error.response?.data || error.message);
            throw error;
        }
    }
};
