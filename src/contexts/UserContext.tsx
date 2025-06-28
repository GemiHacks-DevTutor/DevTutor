'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../models/user';

interface UserContextType {
    user: User | null;
    isLoggingIn: boolean;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
    signOut: () => void;
}

interface UserProviderProps {
    children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {

    const [user, setUser] = useState<User | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {

        const savedUser = localStorage.getItem('user');
        if(savedUser)
            setUser(JSON.parse(savedUser) as User);

        setIsLoggingIn(false);
    }, []);

    const login = async (username: string, password: string) => {

        setIsLoggingIn(true);
        
        try
        {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if(response.ok)
            {
                const data = response.json();
                setUser(data as User);

                localStorage.setItem('user', JSON.stringify(data));
            }
            else
            {
                setUser(null);
                localStorage.removeItem('user');
            }
            
        } catch(error)
        {
            console.error('Login error:', error);
        }

        setIsLoggingIn(false);
    };

    const signup = async (username: string, password: string, firstName?: string, lastName?: string) => {

        setIsLoggingIn(true);
        
        try
        {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, username, password }),
            });

            if(response.ok)
            {
                const data = await response.json();
                setUser(data as User);

                localStorage.setItem('user', JSON.stringify(data));
            }
            else
            {
                setUser(null);
                localStorage.removeItem('user');
            }
        } catch (error)
        {
            console.error('signup error:', error);
            setUser(null);
        }

        setIsLoggingIn(false);
    };

    const signOut = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, isLoggingIn, login, signup, signOut }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);

    if (!context)
        throw new Error('useUser must be used within a UserProvider');

    return context;
};