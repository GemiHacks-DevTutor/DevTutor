'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCourse } from '@/contexts/CourseContext';
import UserAvatar from '@/components/UserAvatar';
import Link from 'next/link';
import { 
  MessageCircle, 
  BookOpen, 
  Target, 
  Clock, 
  ArrowLeft,
  Code,
  Lightbulb,
  Trophy
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentTool?.name || toolId}
              </h1>
            </div>
            <UserAvatar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Code className="w-4 h-4" />
            <span>{currentTool?.difficulty || 'Programming'} Level</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Master {currentTool?.name}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            {currentTool?.description || `Learn ${currentTool?.name} from the ground up with interactive lessons, hands-on projects, and AI-powered assistance.`}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href={`/${toolId}/chat_window`}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Start Learning with AI</span>
              </Button>
            </Link>
            
            {!currentCourse && (
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleStartCourse}
                disabled={isCreatingCourse}
                className="font-semibold px-8 py-3 rounded-xl border-2 flex items-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>{isCreatingCourse ? 'Starting Course...' : 'Start Structured Course'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* AI Chat Feature */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get instant help with coding questions, explanations, and debugging assistance powered by advanced AI.
              </p>
              <Link href={`/${toolId}/chat_window`}>
                <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0 h-auto font-medium">
                  Try it now →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Interactive Learning */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Interactive Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Learn through hands-on coding exercises, real-world projects, and interactive tutorials.
              </p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span>Self-paced</span>
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Monitor your learning journey with detailed progress tracking and achievement badges.
              </p>
              {currentCourse && (
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <Target className="w-4 h-4 mr-2" />
                  <span>{currentCourse.modulesCompleted} modules completed</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Course Status */}
        {currentCourse ? (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-green-900 dark:text-green-100 mb-2">
                    Welcome back! 🎉
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-lg">
                    You&apos;ve completed {currentCourse.modulesCompleted} modules in your {currentTool?.name} journey.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {Math.round((currentCourse.modulesCompleted / 10) * 100)}%
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Complete</div>
                  </div>
                  <Link href={`/${toolId}/chat_window`}>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                      Continue with AI Chat
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Ready to start your {currentTool?.name} journey?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                Begin with our structured course or jump right into the AI chat for personalized learning assistance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={handleStartCourse}
                  disabled={isCreatingCourse}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  {isCreatingCourse ? 'Starting Course...' : 'Start Structured Course'}
                </Button>
                <span className="text-gray-400 dark:text-gray-500">or</span>
                <Link href={`/${toolId}/chat_window`}>
                  <Button size="lg" variant="outline" className="font-semibold px-8">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Ask AI Anything
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
