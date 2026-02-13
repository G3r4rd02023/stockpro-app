import type { Category } from './category.types';

export interface Product {
    id: string;
    name: string;
    sku: string;
    categoryId: string;
    category?: Category;
    price: number;
    currentStock: number;
    minStockThreshold: number;
    imageUrl?: string;
    image?: string; // Some APIs return 'image'
    // PascalCase fallbacks for .NET
    Name?: string;
    Price?: number;
    CurrentStock?: number;
    MinStockThreshold?: number;
    ImageUrl?: string;
    Image?: string;
}

export interface CreateProductRequest {
    name: string;
    sku: string;
    categoryId: string;
    price: number;
    currentStock: number;
    minStockThreshold: number;
    image?: File | string;
}

export interface UpdateProductRequest {
    name: string;
    sku: string;
    categoryId: string;
    price: number;
    currentStock: number;
    minStockThreshold: number;
    image?: File | string;
}
