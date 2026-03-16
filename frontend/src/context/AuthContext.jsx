/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    setUser(JSON.parse(userInfo));
                }
            } catch (error) {
                console.error("Auth check failed", error);
            } finally {
                setLoading(false);
            }
        };
        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            if (response.data.success) {
                const userData = response.data.data;
                setUser(userData);
                localStorage.setItem('userInfo', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const signup = async (username, email, password, role, restaurantDetails) => {
        try {
            const response = await api.post('/api/auth/register', {
                username,
                email,
                password,
                role,
                restaurantDetails
            });
            if (response.data.success) {
                const userData = response.data.data;
                setUser(userData);
                localStorage.setItem('userInfo', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            throw error.response?.data?.message || 'Signup failed';
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
            setUser(null);
            localStorage.removeItem('userInfo');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Update user in context + localStorage (after profile edit)
    const updateUser = (updatedData) => {
        setUser((currentUser) => {
            const merged = { ...currentUser, ...updatedData };
            localStorage.setItem('userInfo', JSON.stringify(merged));
            return merged;
        });
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
