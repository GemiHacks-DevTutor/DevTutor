'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Tool } from '@/models/course';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  userTools: Tool[];
  isLoadingTools: boolean;
  setUser: (user: User | null) => void;
  addUserTool: (tool: Tool) => void;
  removeUserTool: (toolId: string) => void;
  refreshUserTools: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userTools, setUserTools] = useState<Tool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);

  const refreshUserTools = useCallback(async () => {
    if (!user) {
      setUserTools([]);
      setIsLoadingTools(false);
      return;
    }

    setIsLoadingTools(true);
    try {
      // TODO: Replace with actual API call to fetch user's tools
      const response = await fetch(`/api/user/${user.id}/tools`);
      
      if (response.ok) {
        const data = await response.json();
        setUserTools(data.tools || []);
      } else {
        console.error('Failed to fetch user tools');
        setUserTools([]);
      }
    } catch (error) {
      console.error('Error fetching user tools:', error);
      setUserTools([]);
    } finally {
      setIsLoadingTools(false);
    }
  }, [user]);

  const addUserTool = (tool: Tool) => {
    setUserTools(prev => [...prev, tool]);
  };

  const removeUserTool = (toolId: string) => {
    setUserTools(prev => prev.filter(tool => tool.id !== toolId));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual login API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        console.error('Login failed');
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setUserTools([]);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    // Load user from localStorage if available
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Load user tools when user changes
  useEffect(() => {
    refreshUserTools();
  }, [refreshUserTools]);

  const value: UserContextType = {
    user,
    userTools,
    isLoadingTools,
    setUser,
    addUserTool,
    removeUserTool,
    refreshUserTools,
    login,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
