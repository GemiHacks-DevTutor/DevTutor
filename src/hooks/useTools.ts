'use client';

import { useState } from 'react';
import { Tool } from '@/models/course';

interface CreateToolOptions {
  toolName: string;
  id: string; // userId for verification
}

export function useTools() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTools = async (): Promise<Tool[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tools');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tools');
      }

      return data.tools;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createTool = async (options: CreateToolOptions): Promise<Tool | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tool');
      }

      return data.tool;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInCourse = async (userId: string, toolId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, toolId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll in course');
      }

      return data.course;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getTools,
    createTool,
    enrollInCourse,
    isLoading,
    error,
  };
}
