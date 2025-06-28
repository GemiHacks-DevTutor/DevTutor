'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Tool } from '@/models/tool';
import { User } from '@/models/user';

interface UserContextType {
  user: User | null;
  userTools: Tool[];
  isLoadingTools: boolean;
  isLoggingIn: boolean;
  setUser: (user: User | null) => void;
  addUserTool: (tool: Tool) => void;
  removeUserTool: (toolId: string) => void;
  createTool: (toolName: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {

  const context = useContext(UserContext);
  if (context === undefined)
    throw new Error('useUser must be used within a UserProvider');

  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [userTools, setUserTools] = useState<Tool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const refreshUserTools = useCallback(async () => {

    if(!user) return;
    
    setIsLoadingTools(true);

    try {
      const response = await fetch(`/api/tools?id=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setUserTools(data.tools || []);
      } else {
        console.error('Failed to fetch tools');
        setUserTools([]);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
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

  const createTool = async (toolName: string): Promise<boolean> => {
    if (!user || !user.id) {
      console.error('User not logged in');
      return false;
    }

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          toolName,
          id: user.id 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTool = data.tool;
        
        if (newTool) {
          addUserTool(newTool);
          return true;
        } else {
          console.error('No tool data received from API');
          return false;
        }
      } else {
        console.error('Failed to create tool');
        return false;
      }
    } catch (error) {
      console.error('Error creating tool:', error);
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoggingIn(true);
    try {
      // TODO: Replace with actual login API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data;

        if (userData && typeof userData === 'object' && userData.id) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return true;
        } else {
          console.error('Invalid user data received from login');
          return false;
        }
      } else {
        console.error('Login failed');
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signup = async (username: string, password: string, firstName?: string, lastName?: string): Promise<boolean> => {
    setIsLoggingIn(true);
    try {
      // TODO: Replace with actual signup API call
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, firstName, lastName }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data;
        if (userData && typeof userData === 'object' && userData.id) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return true;
        } else {
          console.error('Invalid user data received from signup');
          return false;
        }
      } else {
        console.error('Signup failed');
        return false;
      }
    } catch (error) {
      console.error('Error during signup:', error);
      return false;
    } finally {
      setIsLoggingIn(false);
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
    
    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        const userData = JSON.parse(savedUser);
        if (userData && typeof userData === 'object' && userData.id) {
          setUser(userData);
        } else {
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    } else if (savedUser) {
      // Clean up invalid localStorage values
      localStorage.removeItem('user');
    }
  }, []);

  // Load user tools when user changes
  useEffect(() => {
    if(user && user.id)
      refreshUserTools();
  }, [user, refreshUserTools]);

  const value: UserContextType = {
    user,
    userTools,
    isLoadingTools,
    isLoggingIn,
    setUser,
    addUserTool,
    removeUserTool,
    createTool,
    login,
    signup,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
