'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Course } from '@/models/course';
import { User } from '@/models/user';

interface CourseContextType {
  userCourses: Course[];
  isLoadingCourses: boolean;
  createCourse: (toolId: string) => Promise<boolean>;
  refreshUserCourses: () => Promise<void>;
  updateModuleProgress: (toolId: string, modulesCompleted: number) => Promise<boolean>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const useCourse = () => {
  const context = useContext(CourseContext);

  if (context === undefined)
    throw new Error('useCourse must be used within a CourseProvider');
  
  return context;
};

interface CourseProviderProps {
  children: ReactNode;
  user: User | null;
}

export const CourseProvider: React.FC<CourseProviderProps> = ({ children, user }) => {

  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const apiRequest = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    return response.ok ? await response.json() : null;
  };

  const refreshUserCourses = useCallback(async () => {
    if (!user?.id) 
      return;

    setIsLoadingCourses(true);

    apiRequest(`/api/courses?userId=${user.id}`)
      .then(data => setUserCourses(data?.courses || []))
      .catch(() => setUserCourses([]))
      .finally(() => setIsLoadingCourses(false));
  }, [user]);

  const createCourse = async (toolId: string): Promise<boolean> => {
    if (!user?.id) 
      return false;

    return apiRequest('/api/courses', {
      method: 'POST',
      body: JSON.stringify({ toolId, userId: user.id }),
    })
      .then(data => {

        if(!data?.course)
          return false;

        setUserCourses(prev => [...prev, data.course]);
        return true;
      })
      .catch(() => false);
  };

  const updateModuleProgress = async (toolId: string, modulesCompleted: number): Promise<boolean> => {
    if (!user?.id)
      return false;

    return apiRequest('/api/courses', {
      method: 'PUT',
      body: JSON.stringify({ toolId, userId: user.id, modulesCompleted }),
    })
      .then(data => {

        if(!data)
          return false;

        setUserCourses(prev => 
          prev.map(course => 
            course.toolId === toolId 
              ? { ...course, modulesCompleted }
              : course
          )
        );
        return true;
      })
      .catch(() => false);
  };

  useEffect(() => {
    if (user?.id) 
      refreshUserCourses();
  }, [user, refreshUserCourses]);

  const value: CourseContextType = {
    userCourses,
    isLoadingCourses,
    createCourse,
    refreshUserCourses,
    updateModuleProgress
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};