'use client';

import { useCourse } from '@/contexts/CourseContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ToolPage() {
  const { user } = useUser();
  const { currentCourse, isLoadingCourse, isCreatingCourse, createCourse } = useCourse();
  const params = useParams();
  const router = useRouter();
  const toolId = params?.toolId as string;

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleStartCourse = async () => {
    if (toolId) {
      const success = await createCourse(toolId);
      if (!success) {
        console.error('Failed to create course');
      }
    }
  };

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div>Loading course...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Tool: {toolId}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentCourse ? (
              <div>
                <p className="text-lg mb-4">Welcome back to your course!</p>
                <p className="mb-4">
                  Progress: {currentCourse.modulesCompleted} modules completed
                </p>
                <Button>Continue Learning</Button>
              </div>
            ) : (
              <div>
                <p className="text-lg mb-4">
                  You haven&apos;t started this course yet.
                </p>
                <Button 
                  onClick={handleStartCourse}
                  disabled={isCreatingCourse}
                >
                  {isCreatingCourse ? 'Starting Course...' : 'Start Course'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
