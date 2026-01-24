import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Base URL for backend
// Base URL for backend
const API_URL = "http://127.0.0.1:8000";

export const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

export const setAuthToken = (token: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
    }
};

export const clearAuthToken = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
    }
};

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const apiRequest = async (endpoint: string, options: FetchOptions = {}) => {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Auto-logout on 401
        clearAuthToken();
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Something went wrong");
    }

    return response.json();
};
