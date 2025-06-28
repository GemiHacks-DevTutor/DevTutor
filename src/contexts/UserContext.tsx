'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../models/user';
import { UserCourse } from '@/models/course';

interface UserContextType {
    user: User | null;
    isLoggingIn: boolean;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
    signOut: () => void;

    userCourses: UserCourse[];
    isLoadingCourses?: boolean;
}

interface UserProviderProps {
    children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {

    const [user, setUser] = useState<User | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);

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
                const data = await response.json();
                setUser(data.data as User);

                localStorage.setItem('user', JSON.stringify(data.data));
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
        loadCourses();
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
                setUser(data.data as User);

                localStorage.setItem('user', JSON.stringify(data.data));
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
        loadCourses();
    };

    const signOut = () => {
        setUser(null);
        localStorage.removeItem('user');
        setIsLoggingIn(false);
        window.location.href = '/login';
    };

    const loadCourses = useCallback(async () => {

        if(!user)
            return;

        setIsLoadingCourses(true);

        // Mock course data for development
        const mockCourses: UserCourse[] = [
            {
                id: "1",
                userId: user.id,
                iconURL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
                title: "React Fundamentals",
                description: "Learn the basics of React including components, props, state management, and hooks. Build modern user interfaces with confidence.",
                status: "In Progress"
            },
            {
                id: "2",
                userId: user.id,
                iconURL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
                title: "TypeScript Essentials",
                description: "Master TypeScript for better code quality, type safety, and enhanced developer experience in modern web development.",
                status: "Completed"
            },
            {
                id: "3",
                userId: user.id,
                iconURL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
                title: "Next.js Advanced",
                description: "Build full-stack applications with Next.js, including SSR, API routes, and modern React patterns for production apps.",
                status: "Not Started"
            },
            {
                id: "4",
                userId: user.id,
                iconURL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
                title: "Node.js Backend Development",
                description: "Create scalable backend services with Node.js, Express, and modern JavaScript. Learn API design and database integration.",
                status: "In Progress"
            },
            {
                id: "5",
                userId: user.id,
                iconURL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
                title: "Python for Data Science",
                description: "Dive into data analysis and machine learning with Python, pandas, numpy, and scikit-learn.",
                status: "Not Started"
            },
            {
                id: "6",
                userId: user.id,
                iconURL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
                title: "Modern JavaScript",
                description: "Master ES6+ features, async programming, and modern JavaScript patterns for web development.",
                status: "Completed"
            }
        ];

        try
        {
            const response = await fetch(`/api/courses?id=${user.id}`);

            if(response.ok)
            {
                const data = await response.json();
                if (data.courses && data.courses.length > 0) {
                    setUserCourses(data.courses as UserCourse[]);
                    localStorage.setItem('userCourses', JSON.stringify(data.courses));
                } else {
                    // Use mock data if no courses returned
                    setUserCourses(mockCourses);
                    localStorage.setItem('userCourses', JSON.stringify(mockCourses));
                }
            }
            else
            {
                console.error('Failed to load courses, using mock data');
                setUserCourses(mockCourses);
                localStorage.setItem('userCourses', JSON.stringify(mockCourses));
            }
        } catch (error)
        {
            console.error('Error loading courses, using mock data:', error);
            setUserCourses(mockCourses);
            localStorage.setItem('userCourses', JSON.stringify(mockCourses));
        }

        setIsLoadingCourses(false);
    }, [user]);

    // Load courses when user changes
    useEffect(() => {
        if (user) {
            loadCourses();
        } else {
            setUserCourses([]);
            setIsLoadingCourses(false);
        }
    }, [user, loadCourses]);

    return (
        <UserContext.Provider value={{ user, isLoggingIn, login, signup, signOut, userCourses, isLoadingCourses }}>
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