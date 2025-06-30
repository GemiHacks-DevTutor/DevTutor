import { Course } from '@/models/course';
import { Tool } from '@/models/tool';
import CourseCard from '@/components/CourseCard';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface CoursesGridProps {
  courses: Course[];
  tools: Tool[];
  isLoading: boolean;
}

export const CoursesGrid = ({ courses, tools, isLoading }: CoursesGridProps) => {
  const getToolForCourse = (course: Course) => {
    return tools.find(tool => tool.id === course.toolId);
  };

  if (isLoading) 
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  

  if (courses.length === 0) 
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-700">No courses yet</h3>
              <p className="text-gray-500 max-w-md text-lg">
                Start learning by clicking on a tool below to create your first course.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          tool={getToolForCourse(course)}
        />
      ))}
    </div>
  );
};
