'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Course } from '@/models/course';
import { Tool } from '@/models/tool';

interface CourseCardProps {
    course: Course;
    tool?: Tool;
}

const CourseCard = ({ course, tool }: CourseCardProps) => {
    const router = useRouter();
    
    const handleContinueLearning = () => {
        router.push(`/${course.toolId}`);
    };

    return (
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden group">
            <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                            {tool?.name || `Course ${course.toolId}`}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 text-xs font-medium rounded-full border bg-blue-50 text-blue-600 border-blue-200">
                                <Star className="h-3 w-3 inline mr-1" />
                                In Progress
                            </span>
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {tool?.description || `Continue learning ${course.toolId}. Track your progress and complete modules.`}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
                    <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.modulesCompleted} modules completed</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Play className="h-4 w-4" />
                        <span>Active</span>
                    </div>
                </div>
                
                <Button 
                    className="w-full py-3 text-base font-semibold transition-all duration-200" 
                    onClick={handleContinueLearning}
                >
                    Continue Learning
                </Button>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
