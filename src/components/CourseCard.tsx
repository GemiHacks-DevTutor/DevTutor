'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, Play } from "lucide-react";
import Image from "next/image";
import { UserCourse } from "@/models/course";

interface CourseCardProps {
    course: UserCourse;
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Completed':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'In Progress':
            return <Play className="h-4 w-4 text-blue-500" />;
        case 'Not Started':
            return <Clock className="h-4 w-4 text-gray-400" />;
        default:
            return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'text-green-600 bg-green-50 border-green-200';
        case 'In Progress':
            return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'Not Started':
            return 'text-gray-600 bg-gray-50 border-gray-200';
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200';
    }
};

const getButtonText = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'Review Course';
        case 'In Progress':
            return 'Continue Course';
        case 'Not Started':
            return 'Start Course';
        default:
            return 'View Course';
    }
};

const CourseCard = ({ course }: CourseCardProps) => {
    return (
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden group">
            <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                        {course.iconURL ? (
                            <Image
                                src={course.iconURL}
                                alt={course.title}
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                            {course.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(course.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(course.status)}`}>
                                {course.status}
                            </span>
                        </div>
                    </div>
                </div>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {course.description}
                </p>
                <Button 
                    className="w-full py-3 text-base font-semibold transition-all duration-200" 
                    variant={course.status === 'Not Started' ? 'default' : 'outline'}
                >
                    {getButtonText(course.status)}
                </Button>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
