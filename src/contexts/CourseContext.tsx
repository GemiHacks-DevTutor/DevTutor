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

  const refreshUserCourses = useCallback(async () => {

    if (!user?.id)  
        return;

    setIsLoadingCourses(true);

    try
    {
      const response = await fetch(`/api/courses?userId=${user.id}`);
      
        if(response.ok)
        {
            const data = await response.json();
            setUserCourses(data.courses || []);
        }
        else
            setUserCourses([]);

    } catch (error)
    {
      console.error('Error fetching courses:', error);
      setUserCourses([]);
    }

    setIsLoadingCourses(false);
  }, [user]);

  const createCourse = async (toolId: string): Promise<boolean> => {

    if (!user?.id) {
      console.error('User not logged in');
      return false;
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          toolId,
          userId: user.id 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newCourse = data.course;
        
        if (newCourse) {
          setUserCourses(prev => [...prev, newCourse]);
          return true;
        } else {
          return false;
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to create course:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Error creating course:', error);
      return false;
    }
  };

  const updateModuleProgress = async (toolId: string, modulesCompleted: number): Promise<boolean> => {
    if (!user?.id) {
      console.error('User not logged in');
      return false;
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          toolId,
          userId: user.id,
          modulesCompleted
        }),
      });

      if (response.ok) {
        // Update local state
        setUserCourses(prev => 
          prev.map(course => 
            course.toolId === toolId 
              ? { ...course, modulesCompleted }
              : course
          )
        );
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to update module progress:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating module progress:', error);
      return false;
    }
  };

  // Load user courses when user changes
  useEffect(() => {
    if (user && user.id) {
      refreshUserCourses();
    }
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