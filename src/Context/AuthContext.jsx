import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize axios interceptors
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const checkAuth = async () => {
            try {
                if (token) {
                    const response = await axios.get('https://spices-backend.vercel.app/api/auth/user');
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('userToken');
                    delete axios.defaults.headers.common['Authorization'];
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser: login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};