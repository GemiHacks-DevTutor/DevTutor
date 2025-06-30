import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, BookOpen, MessageCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FeatureMeta {
  icon: LucideIcon;
  text: string;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: string;
  gradient: string;
  href?: string;
  meta?: FeatureMeta;
}

interface Course {
  modulesCompleted: number;
  toolId: string;
}

interface Tool {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
}

interface FeatureCardProps {
  feature: Feature;
  toolId: string;
  currentCourse: Course | undefined;
}

interface CourseStatusCardProps {
  currentCourse: Course;
  currentTool: Tool | undefined;
  toolId: string;
}

interface StartJourneyCardProps {
  currentTool: Tool | undefined;
  toolId: string;
  handleStartCourse: () => void;
  isCreatingCourse: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, toolId, currentCourse }) => {

  const Icon = feature.icon;
  const MetaIcon = feature.meta?.icon;
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
        {feature.action && feature.href && (
          <Link href={`/${toolId}/${feature.href}`}>
            <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0 h-auto font-medium">
              {feature.action}
            </Button>
          </Link>
        )}
        {feature.meta && MetaIcon && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MetaIcon className="w-4 h-4 mr-2" />
            <span>{feature.meta.text}</span>
          </div>
        )}
        {feature.title === 'Track Progress' && currentCourse && (
          <div className="flex items-center text-sm text-green-600 dark:text-green-400">
            <Target className="w-4 h-4 mr-2" />
            <span>{currentCourse.modulesCompleted} modules completed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const CourseStatusCard: React.FC<CourseStatusCardProps> = ({ currentCourse, currentTool, toolId }) => {
  const completionPercentage = Math.round((currentCourse.modulesCompleted / 10) * 100);
  
  return (
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
                {completionPercentage}%
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
  );
};

export const StartJourneyCard: React.FC<StartJourneyCardProps> = ({ 
  currentTool, 
  toolId, 
  handleStartCourse, 
  isCreatingCourse 
}) => (
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
);

export type { Feature, Course, Tool, FeatureCardProps, CourseStatusCardProps, StartJourneyCardProps };
