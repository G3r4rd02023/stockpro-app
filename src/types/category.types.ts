export interface Category {
    id: string;
    name: string;
    colorHex: string;
}

export interface CreateCategoryRequest {
    name: string;
    colorHex: string;
}

export interface UpdateCategoryRequest {
    name: string;
    colorHex: string;
}
