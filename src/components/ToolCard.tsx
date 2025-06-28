'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Tool } from '@/models/tool';

interface ToolCardProps {
    tool: Tool;
}

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner':
            return 'text-green-600 bg-green-50 border-green-200';
        case 'intermediate':
            return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'advanced':
            return 'text-red-600 bg-red-50 border-red-200';
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200';
    }
};

const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner':
            return <Star className="h-4 w-4 text-green-500" />;
        case 'intermediate':
            return <Star className="h-4 w-4 text-yellow-500" />;
        case 'advanced':
            return <Star className="h-4 w-4 text-red-500" />;
        default:
            return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
};

const ToolCard = ({ tool }: ToolCardProps) => {
    const router = useRouter();
    
    const handleStartLearning = () => {
        router.push(`/${tool.id}`);
    };

    return (
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden group">
            <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                        {tool.icon && tool.icon !== '/placeholder-icon.svg' && !tool.icon.includes('placeholder') ? (
                            <Image
                                src={tool.icon}
                                alt={tool.name}
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100"
                                onError={() => {
                                    // This will cause the image to not render and show fallback
                                    console.log('Failed to load icon for', tool.name);
                                }}
                                unoptimized={true} // Allow external URLs from Gemini
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">
                                    {tool.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                            {tool.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                            {getDifficultyIcon(tool.difficulty)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(tool.difficulty)}`}>
                                {tool.difficulty.charAt(0).toUpperCase() + tool.difficulty.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {tool.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
                    <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{tool.modules?.length || 0} modules</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Interactive</span>
                    </div>
                </div>
                
                <Button 
                    className="w-full py-3 text-base font-semibold transition-all duration-200" 
                    onClick={handleStartLearning}
                >
                    Start Learning
                </Button>
            </CardContent>
        </Card>
    );
};

export default ToolCard;
