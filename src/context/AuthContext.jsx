import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Storage keys for impersonation
const IMPERSONATION_KEY = 'smart_caller_impersonating';
const ADMIN_BACKUP_KEY = 'smart_caller_admin_backup';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [realUser, setRealUser] = useState(null); // The actual logged-in admin
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [impersonatedUser, setImpersonatedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing impersonation on mount
    useEffect(() => {
        const savedImpersonation = localStorage.getItem(IMPERSONATION_KEY);
        const savedAdmin = localStorage.getItem(ADMIN_BACKUP_KEY);
        
        if (savedImpersonation && savedAdmin) {
            const impersonatedData = JSON.parse(savedImpersonation);
            const adminData = JSON.parse(savedAdmin);
            setImpersonatedUser(impersonatedData);
            setRealUser(adminData);
            setIsImpersonating(true);
            setUser(impersonatedData); // Set impersonated user as current user
        }
    }, []);

    useEffect(() => {
        // Check active sessions and subscribe to auth changes
        const getSession = async () => {
            try {
                console.log('AuthContext: Initializing Supabase session...');
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('AuthContext: Error getting session:', error);
                } else {
                    console.log('AuthContext: Session loaded:', session ? 'User logged in' : 'No active session');
                }
                
                const sessionUser = session?.user ?? null;
                setRealUser(sessionUser);
                
                // Only set user if not impersonating
                const savedImpersonation = localStorage.getItem(IMPERSONATION_KEY);
                if (!savedImpersonation) {
                    setUser(sessionUser);
                }
            } catch (error) {
                console.error('AuthContext: Exception during session initialization:', error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('AuthContext: Auth state changed:', _event);
            const sessionUser = session?.user ?? null;
            setRealUser(sessionUser);
            
            // Only update user if not impersonating
            if (!isImpersonating) {
                setUser(sessionUser);
            }
        });

        return () => subscription.unsubscribe();
    }, [isImpersonating]);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data.user;
    };

    const signup = async (name, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });
        if (error) throw error;
        return data.user;
    };

    const logout = async () => {
        // Clear impersonation on logout
        stopImpersonation();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    // Start impersonating a user (admin only)
    const startImpersonation = (targetUser) => {
        if (!realUser) return;
        
        console.log('AuthContext: Starting impersonation of', targetUser.email);
        
        // Save admin user
        localStorage.setItem(ADMIN_BACKUP_KEY, JSON.stringify({
            id: realUser.id,
            email: realUser.email
        }));
        
        // Save impersonated user
        localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(targetUser));
        
        setImpersonatedUser(targetUser);
        setIsImpersonating(true);
        setUser(targetUser);
    };

    // Stop impersonating and return to admin
    const stopImpersonation = () => {
        console.log('AuthContext: Stopping impersonation');
        
        localStorage.removeItem(IMPERSONATION_KEY);
        localStorage.removeItem(ADMIN_BACKUP_KEY);
        
        setImpersonatedUser(null);
        setIsImpersonating(false);
        setUser(realUser);
    };

    const value = {
        user,
        realUser, // The actual admin when impersonating
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        // Impersonation
        isImpersonating,
        impersonatedUser,
        startImpersonation,
        stopImpersonation,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
