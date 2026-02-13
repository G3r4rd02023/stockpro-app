import type { Product } from '../types/product.types';
import type { Category } from '../types/category.types';

export const reportService = {
    // Process products and categories to get data for charts
    getInventoryValueByCategory: (products: Product[], categories: Category[]) => {
        const data = categories.map(category => {
            const categoryProducts = products.filter(p => p.categoryId === category.id);
            const totalValue = categoryProducts.reduce((sum, p) => sum + (p.price * p.currentStock), 0);
            return {
                name: category.name,
                value: totalValue,
                color: category.colorHex || '#3b82f6'
            };
        });
        return data.filter(d => d.value > 0);
    },

    getProductCountByCategory: (products: Product[], categories: Category[]) => {
        const data = categories.map(category => {
            const count = products.filter(p => p.categoryId === category.id).length;
            return {
                name: category.name,
                value: count,
                color: category.colorHex || '#3b82f6'
            };
        });
        return data.filter(d => d.value > 0);
    },

    getStockStatusDistribution: (products: Product[]) => {
        const lowStock = products.filter(p => p.currentStock <= (p.minStockThreshold || 5)).length;
        const healthyStock = products.length - lowStock;
        return [
            { name: 'Stock Saludable', value: healthyStock, color: '#10b981' },
            { name: 'Stock Bajo', value: lowStock, color: '#f59e0b' }
        ].filter(d => d.value > 0);
    },

    // Export products to CSV
    exportProductsToCSV: (products: Product[], categories: Category[]) => {
        // Define columns
        const headers = ['Nombre', 'SKU', 'Categoría', 'Precio', 'Stock Actual', 'Umbral Mínimo', 'Estado'];

        // Map data to rows
        const rows = products.map(p => {
            const category = categories.find(c => c.id === p.categoryId)?.name || 'N/A';
            const status = p.currentStock <= (p.minStockThreshold || 5) ? 'Stock Bajo' : 'Normal';
            return [
                `"${p.name.replace(/"/g, '""')}"`,
                `"${p.sku}"`,
                `"${category}"`,
                p.price.toFixed(2),
                p.currentStock,
                p.minStockThreshold,
                `"${status}"`
            ];
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `Reporte_Inventario_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
