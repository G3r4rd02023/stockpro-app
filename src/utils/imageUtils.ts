const BASE_URL = 'https://stockpro.runasp.net';

export const getFullImageUrl = (product?: any) => {
    if (!product) return 'https://via.placeholder.com/40';

    // If it's already a string, process it as a URL
    if (typeof product === 'string') {
        if (!product || product === 'string') return 'https://via.placeholder.com/40';
        if (product.startsWith('http')) return product;
        const cleanUrl = product.startsWith('/') ? product.substring(1) : product;
        return `${BASE_URL}/${cleanUrl}`;
    }

    // Try multiple common field names from the product object
    // Casing can vary depending on API configuration
    const url = product.imageUrl ||
        product.image ||
        product.ImageUrl ||
        product.Image ||
        product.imagePath ||
        product.ImagePath;

    if (!url || url === 'string') return 'https://via.placeholder.com/40';
    if (url.startsWith('http')) return url;

    // Fallback to prepending base URL if it's a relative path
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL}/${cleanUrl}`;
};
