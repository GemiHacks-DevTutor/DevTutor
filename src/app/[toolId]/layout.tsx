'use client';

import { CourseProvider } from '@/contexts/CourseContext';
import { useUser } from '@/contexts/UserContext';
import { ReactNode } from 'react';

interface ToolLayoutProps {
  children: ReactNode;
  params: Promise<{
    toolId: string;
  }>;
}

export default function ToolLayout({ children }: ToolLayoutProps) {
  const { user } = useUser();

  return (
    <CourseProvider user={user}>
      {children}
    </CourseProvider>
  );
}
