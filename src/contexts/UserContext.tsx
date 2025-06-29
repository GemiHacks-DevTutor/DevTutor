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

  const refreshUserTools = useCallback(async () => {
    if(!user) return;
        setIsLoadingTools(true);

    try {
      const response = await fetch(`/api/tools?id=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setUserTools(data.tools || []);
      } else {
        // Only log error if it's not a 404 (user not found is expected for new users)
        if (response.status !== 404) {
          console.error('Failed to fetch tools:', response.status);
        }
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

  const createTool = async (toolName: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !user.id) {
      console.error('User not logged in');
      return { success: false, error: 'User not logged in' };
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
          return { success: true };
        } else {
          return { success: false, error: 'No tool data received from API' };
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to create tool:', errorData.error);
        return { success: false, error: errorData.error || 'Failed to create tool' };
      }
    } catch (error) {
      console.error('Error creating tool:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const submitQuestionnaire = async (answers: { style: number; tone: number; pace: number; experience: number }): Promise<{ success: boolean; error?: string }> => {
    if (!user || !user.id) {
      console.error('User not logged in');
      return { success: false, error: 'User not logged in' };
    }

    try {
      const response = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers,
          userId: user.id 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success)
        {
          const updatedUser = {
            ...user,
            hasCompletedSurvey: true
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Failed to submit questionnaire' };
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to submit questionnaire:', errorData.error);
        return { success: false, error: errorData.error || 'Failed to submit questionnaire' };
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      return { success: false, error: 'Network error occurred' };
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
    try
    {
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

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user || !user.id) {
      console.error('User not logged in');
      return { success: false, error: 'User not logged in' };
    }

    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Clear all user data and log out
          setUser(null);
          setUserTools([]);
          localStorage.removeItem('user');
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Failed to delete account' };
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to delete account:', errorData.error);
        return { success: false, error: errorData.error || 'Failed to delete account' };
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, error: 'Network error occurred' };
    }
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
    console.log('UserContext: User changed:', user?.id ? `User ID: ${user.id}` : 'No user');
    if(user && user.id) {
      console.log('UserContext: Calling refreshUserTools');
      refreshUserTools();
    }
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
