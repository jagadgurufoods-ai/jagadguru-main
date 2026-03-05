'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = 'http://localhost:5001/api';

interface User {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    sendOtp: (identifier: string, type: 'email' | 'phone') => Promise<{ success: boolean; error?: string }>;
    verifyOtp: (identifier: string, otp: string, type: 'email' | 'phone', name?: string) => Promise<{ success: boolean; error?: string }>;
    passwordLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoggedIn: false,
    isAdmin: false,
    loading: true,
    login: () => { },
    logout: () => { },
    sendOtp: async () => ({ success: false }),
    verifyOtp: async () => ({ success: false }),
    passwordLogin: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('jgf_token');
        if (savedToken) {
            setToken(savedToken);
            fetchUser(savedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (tkn: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${tkn}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                setToken(tkn);
            } else {
                localStorage.removeItem('jgf_token');
                setToken(null);
                setUser(null);
            }
        } catch {
            localStorage.removeItem('jgf_token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (tkn: string, usr: User) => {
        localStorage.setItem('jgf_token', tkn);
        setToken(tkn);
        setUser(usr);
    };

    const logout = () => {
        localStorage.removeItem('jgf_token');
        setToken(null);
        setUser(null);
    };

    const sendOtp = async (identifier: string, type: 'email' | 'phone') => {
        try {
            const body = type === 'email' ? { email: identifier } : { phone: identifier };
            const res = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error };
            return { success: true };
        } catch {
            return { success: false, error: 'Network error' };
        }
    };

    const verifyOtp = async (identifier: string, otp: string, type: 'email' | 'phone', name?: string) => {
        try {
            const body: Record<string, string> = { otp };
            if (type === 'email') body.email = identifier;
            else body.phone = identifier;
            if (name) body.name = name;

            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error };
            login(data.token, data.user);
            return { success: true };
        } catch {
            return { success: false, error: 'Network error' };
        }
    };

    const passwordLogin = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error };
            login(data.token, data.user);
            return { success: true };
        } catch {
            return { success: false, error: 'Network error' };
        }
    };

    return (
        <AuthContext.Provider value={{
            user, token, loading,
            isLoggedIn: !!user,
            isAdmin: user?.role === 'admin',
            login, logout, sendOtp, verifyOtp, passwordLogin
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
