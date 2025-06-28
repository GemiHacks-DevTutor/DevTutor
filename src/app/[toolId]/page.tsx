'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCourse } from '@/contexts/CourseContext';
import UserAvatar from '@/components/UserAvatar';

export default function ToolPage() {
  const { user, userTools } = useUser();
  const { userCourses, createCourse } = useCourse();
  const params = useParams();
  const router = useRouter();
  const toolId = params?.toolId as string;
  
  const currentTool = userTools.find(tool => tool.id === toolId);
  const currentCourse = userCourses.find(course => course.toolId === toolId);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  useEffect(() => {

    if(!user)
      router.push('/login');

    if(user && !user.hasCompletedSurvey)
      router.push('/questionnaire');

  }, [user, router]);

  const handleStartCourse = async () => {

    if(toolId)
    {
      setIsCreatingCourse(true);
      await createCourse(toolId);
      setIsCreatingCourse(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (!user)
    return <div>Redirecting to login...</div>;

  if (user && !user.hasCompletedSurvey)
    return <div>Redirecting to questionnaire...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header with UserAvatar */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col gap-6">
            <Button 
              variant="outline" 
              onClick={handleBackToDashboard}
              className="self-start"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Course: {currentTool?.name || toolId}
            </h1>
          </div>
          <UserAvatar />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
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
