'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Course } from '@/models/course';
import { User } from '@/models/user';
import { useParams } from 'next/navigation';

interface CourseContextType {
  currentCourse: Course | null;
  userCourses: Course[];
  isLoadingCourse: boolean;
  isCreatingCourse: boolean;
  createCourse: (toolId: string) => Promise<boolean>;
  refreshUserCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};

interface CourseProviderProps {
  children: ReactNode;
  user: User | null;
}

export const CourseProvider: React.FC<CourseProviderProps> = ({ children, user }) => {
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const params = useParams();
  const toolId = params?.toolId as string;

  const refreshUserCourses = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingCourse(true);
    try {
      const response = await fetch(`/api/courses?userId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setUserCourses(data.courses || []);
        
        // Find the current course for this tool
        if (toolId) {
          const course = data.courses?.find((c: Course) => c.toolId === toolId);
          setCurrentCourse(course || null);
        }
      } else {
        console.error('Failed to fetch courses');
        setUserCourses([]);
        setCurrentCourse(null);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setUserCourses([]);
      setCurrentCourse(null);
    } finally {
      setIsLoadingCourse(false);
    }
  }, [user?.id, toolId]);

  const createCourse = async (toolId: string): Promise<boolean> => {
    if (!user?.id) {
      console.error('User not logged in');
      return false;
    }

    setIsCreatingCourse(true);
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
          
          // If this is the current tool, set as current course
          if (newCourse.toolId === toolId) {
            setCurrentCourse(newCourse);
          }
          
          return true;
        } else {
          console.error('No course data received from API');
          return false;
        }
      } else {
        console.error('Failed to create course');
        return false;
      }
    } catch (error) {
      console.error('Error creating course:', error);
      return false;
    } finally {
      setIsCreatingCourse(false);
    }
  };

  // Load user courses when user or toolId changes
  useEffect(() => {
    if (user?.id) {
      refreshUserCourses();
    }
  }, [user?.id, toolId, refreshUserCourses]);

  const value: CourseContextType = {
    currentCourse,
    userCourses,
    isLoadingCourse,
    isCreatingCourse,
    createCourse,
    refreshUserCourses,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};
