export interface User {
    id: string;
    email: string;
    fullName?: string;
    role?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// Wait, looking at the user request "HU-001: registrarme con email y contraseña".
// I need to be careful with the API expectation. The user provided `https://apistock.somee.com/`.
// I don't have the API docs. I should assume standard `email` and `password` for now.
// If the previous conversation 08fc478d mentioned `AppUser` and `RegisterDto`, it likely expects specific fields. 
// I'll stick to a generic structure and adjust if I see errors or can inspect the network.

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    confirmPassword?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        email: string;
        fullName: string;
        role: number | string;
    };
}
