'use client';

import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ToolsSectionHeader } from "@/components/dashboard/ToolsSectionHeader";
import { ToolsGrid } from "@/components/dashboard/ToolsGrid";
import { ToolStats } from "@/components/dashboard/ToolStats";
import { Tool } from "@/models/tool";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
    const { user, userTools, isLoadingTools, createTool } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [toolName, setToolName] = useState("");
    const [isCreatingTool, setIsCreatingTool] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if(!user) {
            router.push("/login");
        }
    }, [user, router]);

    // Show loading state if we're checking for user
    if (user === null) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const filteredTools = userTools.filter((tool: Tool) => {
        if (!searchQuery.trim())
            return true;
        
        const query = searchQuery.toLowerCase();
        
        return (
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.difficulty.toLowerCase().includes(query)
        );
    });

    const handleCreateTool = () => {
        setIsDialogOpen(true);
    };

    const handleSubmitTool = async () => {
        if (!toolName.trim()) return;
        
        setIsCreatingTool(true);
        try {
            const success = await createTool(toolName.trim());
            if (success) {
                setToolName("");
                setIsDialogOpen(false);
            } else {
                // TODO: Show error message to user
                console.error('Failed to create tool');
            }
        } catch (error) {
            console.error('Error creating tool:', error);
        } finally {
            setIsCreatingTool(false);
        }
    };

    const handleCancelTool = () => {
        setToolName("");
        setIsDialogOpen(false);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <DashboardHeader 
                    user={user}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                
                <div className="mb-8">
                    <ToolsSectionHeader 
                        tools={userTools}
                        filteredTools={filteredTools}
                        searchQuery={searchQuery}
                        onCreateTool={handleCreateTool}
                    />
                    
                    <ToolsGrid 
                        filteredTools={filteredTools}
                        isLoading={isLoadingTools || false}
                        error={null}
                        searchQuery={searchQuery}
                        onCreateTool={handleCreateTool}
                        onClearSearch={handleClearSearch}
                    />
                </div>

                <ToolStats tools={userTools} />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Tool</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="toolName" className="text-right">
                                Tool Name
                            </Label>
                            <Input
                                id="toolName"
                                value={toolName}
                                onChange={(e) => setToolName(e.target.value)}
                                placeholder="Enter tool name (e.g., React, Angular)"
                                className="col-span-3"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isCreatingTool) {
                                        handleSubmitTool();
                                    }
                                }}
                                disabled={isCreatingTool}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleCancelTool} disabled={isCreatingTool}>
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