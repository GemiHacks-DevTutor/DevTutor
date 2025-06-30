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
  createTool: (toolName: string) => Promise<{ success: boolean; error?: string }>;
  submitQuestionnaire: (answers: { style: number; tone: number; pace: number; experience: number }) => Promise<{ success: boolean; error?: string }>;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  logout: () => void;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
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

  const apiRequest = async (endpoint: string, options?: RequestInit) => {

    const response = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    return response.ok ? await response.json() : null;
  };

  const refreshUserTools = useCallback(async () => {
    if (!user) 
      return;
    
    setIsLoadingTools(true);
    apiRequest(`/api/tools?id=${user.id}`)
      .then(data => setUserTools(data?.tools || []))
      .catch(() => setUserTools([]))
      .finally(() => setIsLoadingTools(false));

  }, [user]);

  const addUserTool = (tool: Tool) => setUserTools(prev => [...prev, tool]);

  const removeUserTool = (toolId: string) => setUserTools(prev => prev.filter(tool => tool.id !== toolId));

  const createTool = async (toolName: string): Promise<{ success: boolean; error?: string }> => {

    if (!user?.id) 
      return { success: false, error: 'User not logged in' };

    return apiRequest('/api/tools', {
      method: 'POST',
      body: JSON.stringify({ toolName, id: user.id }),
    })
      .then(data => {
        if(!data?.tool)
          return { success: false, error: 'No tool data received from API' };

        addUserTool(data.tool);

        return { success: true };
      })
      .catch(() => ({ success: false, error: 'Network error occurred' }));
  };

  const submitQuestionnaire = async (answers: { style: number; tone: number; pace: number; experience: number }): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) 
      return { success: false, error: 'User not logged in' };

    return apiRequest('/api/questionnaire', {
      method: 'POST',
      body: JSON.stringify({ answers, userId: user.id }),
    })
      .then(data => {

        if(!data?.success)
          return { success: false, error: data?.error || 'Failed to submit questionnaire' };

        const updatedUser = { ...user, hasCompletedSurvey: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return { success: true };
      })
      .catch(() => ({ success: false, error: 'Network error occurred' }));
  };

  const login = async (username: string, password: string): Promise<boolean> => {

    setIsLoggingIn(true);

    return apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
      .then(data => {

        if(!data?.data?.id)
          return false;

        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));

        return true;
      })
      .catch(() => false)
      .finally(() => setIsLoggingIn(false));
  };

  const signup = async (username: string, password: string, firstName?: string, lastName?: string): Promise<boolean> => {
    
    setIsLoggingIn(true);

    return apiRequest('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password, firstName, lastName }),
    })
      .then(data => {

        if(!data?.data?.id)
          return false;

        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        return true;
      })
      .catch(() => false)
      .finally(() => setIsLoggingIn(false));
  };

  const logout = () => {
    setUser(null);
    setUserTools([]);
    localStorage.removeItem('user');
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) 
      return { success: false, error: 'User not logged in' };

    return apiRequest('/api/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ userId: user.id }),
    })
      .then(data => {

        if(!data?.success)
          return { success: false, error: data?.error || 'Failed to delete account' };

        setUser(null);
        setUserTools([]);
        localStorage.removeItem('user');

        return { success: true };
      })
      .catch(() => ({ success: false, error: 'Network error occurred' }))
  };

  useEffect(() => {

    const savedUser = localStorage.getItem('user');

    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') 
      try {
        const userData = JSON.parse(savedUser);
        if (userData?.id) 
          setUser(userData);
        else 
          localStorage.removeItem('user');
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    else if (savedUser) 
      localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    if (user?.id)
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
    submitQuestionnaire,
    login,
    signup,
    logout,
    deleteAccount
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
