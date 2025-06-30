'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/contexts/CourseContext';
import Link from 'next/link';
import { 
  MessageCircle, 
  BookOpen, 
  Code,
  Lightbulb,
  Trophy,
  Clock
} from 'lucide-react';
import { 
  FeatureCard, 
  CourseStatusCard, 
  StartJourneyCard,
  Feature
} from '@/components/tool-page/ToolPageComponents';
import { PageHeader } from '@/components/PageHeader';

const features: Feature[] = [
  {
    icon: MessageCircle,
    title: 'AI Assistant',
    description: 'Get instant help with coding questions, explanations, and debugging assistance powered by advanced AI.',
    action: 'Try it now →',
    gradient: 'gradient-blue-purple',
    href: 'chat_window'
  },
  {
    icon: Lightbulb,
    title: 'Interactive Learning',
    description: 'Learn through hands-on coding exercises, real-world projects, and interactive tutorials.',
    gradient: 'gradient-green-teal',
    meta: { icon: Clock, text: 'Self-paced' }
  },
  {
    icon: Trophy,
    title: 'Track Progress',
    description: 'Monitor your learning journey with detailed progress tracking and achievement badges.',
    gradient: 'gradient-purple-pink'
  }
];

const ToolPage = () => {

  const { userTools } = useUser();
  const { userCourses, createCourse } = useCourse();
  const params = useParams();
  const toolId = params?.toolId as string;
  
  const currentTool = userTools.find(tool => tool.id === toolId);
  const currentCourse = userCourses.find(course => course.toolId === toolId);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const handleStartCourse = async () => {
    if(toolId) {
      setIsCreatingCourse(true);
      await createCourse(toolId);
      setIsCreatingCourse(false);
    }
  };

  return (
    <div className="app-background">
      <PageHeader
        title={currentTool?.name || toolId}
        backButton={{
          href: '/dashboard',
          label: 'Dashboard'
        }}
      />
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href={`/${toolId}/chat_window`}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center space-x-2">
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
                className="font-semibold px-8 py-3 rounded-xl flex items-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>{isCreatingCourse ? 'Starting Course...' : 'Start Structured Course'}</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              feature={feature} 
              toolId={toolId} 
              currentCourse={currentCourse} 
            />
          ))}
        </div>

        {currentCourse ? (
          <CourseStatusCard 
            currentCourse={currentCourse} 
            currentTool={currentTool} 
            toolId={toolId} 
          />
        ) : (
          <StartJourneyCard 
            currentTool={currentTool} 
            toolId={toolId} 
            handleStartCourse={handleStartCourse} 
            isCreatingCourse={isCreatingCourse} 
          />
        )}
      </div>
    </div>
  );
};

export default ToolPage;
