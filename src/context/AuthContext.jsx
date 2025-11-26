import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for stored user
        const storedUser = localStorage.getItem('smart_caller_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Mock login
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockUser = { id: '1', email, name: 'Demo User' };
                setUser(mockUser);
                localStorage.setItem('smart_caller_user', JSON.stringify(mockUser));
                resolve(mockUser);
            }, 800);
        });
    };

    const signup = async (name, email, password) => {
        // Mock signup
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockUser = { id: '1', email, name };
                setUser(mockUser);
                localStorage.setItem('smart_caller_user', JSON.stringify(mockUser));
                resolve(mockUser);
            }, 800);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('smart_caller_user');
    };

    const value = {
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
