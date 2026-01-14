// src/contexts/authContext.tsx
// This file manages user authentication state and provides methods for login, logout, and fetching user data
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Role } from '../models/interfaces/Role';
import type { User } from '../models/interfaces/User';
import * as authService from '../services/authService';
import { isJwtExpired } from '../utils/jwt';

interface AuthContextType {
    user: User | null;
    token: string | null;
    roles: Role[];
    loading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    getUser: () => Promise<void>;
    showLoginModal: boolean;
    setShowLoginModal: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [roles, setRoles] = useState<Role[]>([]);

    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
    if (token) {
        if (isJwtExpired(token)) {
            logout();
            setShowLoginModal(true); // 🟢 trigger login modal immediately
        } else {
            getUser();
        }
    } else {
        setLoading(false);
    }
}, [token]);


    const login = async (username: string, password: string) => {
        const accessToken = await authService.login(username, password);
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
        await getUser();
    };

    const logout = () => {
        authService.logout();
        setToken(null);
        setUser(null);
        setRoles([]);
        setShowLoginModal(true); // 🟢 open login modal on manual or forced logout
    };

    const getUser = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);

            const userRoles = await authService.getUserRoles(userData.id);
            setRoles(userRoles);
        } catch (error) {
            logout(); // token might be invalid or expired
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                roles,
                loading,
                isAuthenticated: !!user,
                login,
                logout,
                getUser,
                showLoginModal,
                setShowLoginModal,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
