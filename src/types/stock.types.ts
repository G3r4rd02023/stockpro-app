export type MovementType = 0 | 1;

export const MovementTypes = {
    Entry: 0 as MovementType,
    Exit: 1 as MovementType
};

export interface StockMovement {
    id: string;
    productId: string;
    productName: string;
    userId: string;
    userName: string;
    movementType: MovementType;
    quantity: number;
    reason: string;
    stockBefore: number;
    stockAfter: number;
    movementDate: string;
}

export interface CreateStockMovementRequest {
    productId: string;
    quantity: number;
    movementType: MovementType;
    reason: string;
    date: string;
}
