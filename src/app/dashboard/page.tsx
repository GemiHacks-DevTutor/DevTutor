'use client';

import { useUser } from '@/contexts/UserContext';
import { useCourse } from '@/contexts/CourseContext';
import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CoursesSectionHeader } from '@/components/dashboard/CoursesSectionHeader';
import { CoursesGrid } from '@/components/dashboard/CoursesGrid';
import { ToolsSectionHeader } from '@/components/dashboard/ToolsSectionHeader';
import { ToolsGrid } from '@/components/dashboard/ToolsGrid';
import { ToolStats } from '@/components/dashboard/ToolStats';
import { Tool } from '@/models/tool';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const { user, userTools, isLoadingTools, createTool } = useUser();
    const { userCourses, isLoadingCourses } = useCourse();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [toolName, setToolName] = useState('');
    const [isCreatingTool, setIsCreatingTool] = useState(false);
    const [toolError, setToolError] = useState<string | null>(null);

    const filteredTools = userTools.filter((tool: Tool) => {

        const hasExistingCourse = userCourses.some(course => course.toolId === tool.id);

        if (hasExistingCourse)
            return false;
        
        if (!searchQuery.trim())
            return true;

        const query = searchQuery.toLowerCase();

        return (
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.difficulty.toLowerCase().includes(query)
        );
    });

    const filteredCourses = userCourses.filter((course) => {
        
        const correspondingTool = userTools.find(tool => tool.id === course.toolId);
        
        if (!searchQuery.trim())
            return true;

        if (!correspondingTool)
            return false;

        const query = searchQuery.toLowerCase();

        return (
            correspondingTool.name.toLowerCase().includes(query) ||
            correspondingTool.description.toLowerCase().includes(query) ||
            correspondingTool.difficulty.toLowerCase().includes(query)
        );
    });

    const openDialog = () => {
        setToolError(null);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setToolName('');
        setToolError(null);
        setIsDialogOpen(false);
    };

    const handleSubmitTool = async () => {

        if(!toolName.trim())
            return;
        
        setIsCreatingTool(true);
        setToolError(null);
        
        try
        {
            const result = await createTool(toolName.trim());

            if (result.success) 
                closeDialog();
            else
                setToolError(result.error || 'Failed to create tool');
        } catch
        {
            setToolError('An unexpected error occurred');
        } finally
        {
            setIsCreatingTool(false);
        }
    };

    if (!user) 
        return (
            <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p>No user found - redirecting to login...</p>
                    <p className='text-sm text-gray-500 mt-2'>Please log in to access the dashboard</p>
                </div>
            </div>
        );
    
    if (user && !user.hasCompletedSurvey) 
        return (
            <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p>Redirecting to questionnaire...</p>
                    <p className='text-sm text-gray-500 mt-2'>Please complete the questionnaire to access the dashboard</p>
                </div>
            </div>
        );
    
    return (
        <div className='min-h-screen bg-gray-50 p-6'>
            <div className='max-w-7xl mx-auto'>
                <DashboardHeader 
                    user={user}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <div className='mb-8'>
                    <CoursesSectionHeader courses={filteredCourses} />
                    <CoursesGrid 
                        courses={filteredCourses}
                        tools={userTools}
                        isLoading={isLoadingCourses}
                    />
                </div>
                <div className='mb-8'>
                    <ToolsSectionHeader 
                        tools={userTools}
                        filteredTools={filteredTools}
                        searchQuery={searchQuery}
                        onCreateTool={openDialog}
                    />
                    <ToolsGrid 
                        filteredTools={filteredTools}
                        isLoading={isLoadingTools || false}
                        error={null}
                        searchQuery={searchQuery}
                        onCreateTool={openDialog}
                        onClearSearch={() => setSearchQuery('')}
                    />
                </div>
                <ToolStats tools={userTools} />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>Add New Tool</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor='toolName' className='text-right'>
                                Tool Name
                            </Label>
                            <Input
                                id='toolName'
                                value={toolName}
                                onChange={(e) => {
                                    setToolName(e.target.value);
                                    if (toolError) setToolError(null);
                                }}
                                placeholder='Enter tool name (e.g., React, Angular)'
                                className={`col-span-3 ${toolError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isCreatingTool) handleSubmitTool();
                                }}
                                disabled={isCreatingTool}
                            />
                        </div>
                        {toolError && (
                            <div className='flex items-start gap-3 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg shadow-sm'>
                                <AlertCircle className='h-4 w-4 text-red-500 mt-0.5 flex-shrink-0' />
                                <div className='flex-1'>
                                    <p className='font-medium'>Invalid Tool</p>
                                    <p className='mt-1 text-red-600'>{toolError}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='flex justify-end gap-2'>
                        <Button variant='outline' onClick={closeDialog} disabled={isCreatingTool}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmitTool}
                            disabled={!toolName.trim() || isCreatingTool}
                        >
                            {isCreatingTool ? 'Creating...' : 'Add Tool'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Dashboard;