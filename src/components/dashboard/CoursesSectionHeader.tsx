import { Course } from '@/models/course';

interface CoursesSectionHeaderProps {
  courses: Course[];
}

export const CoursesSectionHeader = ({ courses }: CoursesSectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold text-gray-900">
        Your Courses
      </h2>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">
          {courses.length} course{courses.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};
