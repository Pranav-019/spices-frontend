import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('userToken');
            console.log('Checking auth with token:', token); // Debug log

            if (token) {
                try {
                    // Set token in axios headers
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    // Get user data
                    const response = await axios.get('http://localhost:5000/api/auth/user');
                    console.log('User data received:', response.data); // Debug log
                    
                    setUser(response.data);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('userToken');
                    delete axios.defaults.headers.common['Authorization'];
                }
            } else {
                console.log('No token found'); // Debug log
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (userData) => {
        console.log('Setting user:', userData); // Debug log
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        setUser: login,
        logout,
        loading
    };

    console.log('Current auth state:', { user, loading }); // Debug log

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 