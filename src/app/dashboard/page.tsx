'use client';

import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ToolsSectionHeader } from "@/components/dashboard/ToolsSectionHeader";
import { ToolsGrid } from "@/components/dashboard/ToolsGrid";
import { ToolStats } from "@/components/dashboard/ToolStats";
import { Tool } from "@/models/course";

const Dashboard = () => {
    const { user, userTools, isLoadingTools } = useUser();
    const [searchQuery, setSearchQuery] = useState("");

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
        // TODO: Navigate to tool creation page
        console.log('Navigate to tool creation');
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
        </div>
    );
};

export default Dashboard;