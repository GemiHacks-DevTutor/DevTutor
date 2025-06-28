'use client';

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import { Search, BookOpen, CheckCircle, Play } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import CourseCard from "@/components/CourseCard";

const Dashboard = () => {

    const { user, userCourses, isLoadingCourses } = useUser();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCourses = userCourses.filter(course => {

        if (!searchQuery.trim())
            return true;
        
        const query = searchQuery.toLowerCase();

        return (
            course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query)
        );
    });

    const handleCreateCourse = () => {
        
        console.log('Handle create course:', searchQuery);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Welcome back, {user?.firstName || 'Student'}!
                            </h1>
                            <p className="text-gray-600 text-lg">Continue your learning journey</p>
                        </div>
                        <UserAvatar />
                    </div>
                    <div className="relative w-full max-w-3xl mx-auto">
                        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 z-10 " />
                        <Input
                            type="text"
                            placeholder="Search for courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-6 text-xl border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-neutral-800 rounded-2xl shadow-lg bg-white transition-all duration-200"
                        />
                    </div>
                </div>
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {searchQuery.trim() ? 'Search Results' : 'Your Courses'}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">
                                {searchQuery.trim() 
                                    ? `${filteredCourses.length} of ${userCourses.length} course${userCourses.length !== 1 ? 's' : ''}`
                                    : `${userCourses.length} course${userCourses.length !== 1 ? 's' : ''}`
                                }
                            </span>
                        </div>
                    </div>
                    {
                        isLoadingCourses ? (
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
                        ) : filteredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCourses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        ) : searchQuery.trim() ? (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <div className="flex flex-col items-center space-y-6">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Search className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-gray-700">No courses found</h3>
                                            <p className="text-gray-500 max-w-md text-lg">
                                                No courses match your search for &ldquo;{searchQuery}&rdquo;. Try different keywords or clear your search.
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                            <Button 
                                                size="lg" 
                                                variant="outline"
                                                className="px-8 py-3 text-lg"
                                                onClick={() => setSearchQuery("")}
                                            >
                                                Clear Search
                                            </Button>
                                            <Button 
                                                size="lg" 
                                                className="px-8 py-3 text-lg"
                                                onClick={handleCreateCourse}
                                            >
                                                Create Course
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <div className="flex flex-col items-center space-y-6">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-gray-700">No courses yet</h3>
                                            <p className="text-gray-500 max-w-md text-lg">
                                                Start your learning journey by browsing our course catalog and enrolling in courses that interest you.
                                            </p>
                                        </div>
                                        <Button size="lg" className="mt-6 px-8 py-3 text-lg">
                                            Browse Courses
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }
                </div>

                {userCourses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <BookOpen className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Courses</p>
                                        <p className="text-3xl font-bold text-gray-900">{userCourses.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-green-100 rounded-xl">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Completed</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {userCourses.filter(course => course.status === 'Completed').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-orange-100 rounded-xl">
                                        <Play className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">In Progress</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {userCourses.filter(course => course.status === 'In Progress').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

