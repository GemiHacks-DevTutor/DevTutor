import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Settings, Plus, Wrench } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { Tool } from "@/models/tool";

interface ToolsGridProps {
  filteredTools: Tool[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onCreateTool: () => void;
  onClearSearch: () => void;
}

export const ToolsGrid = ({ 
  filteredTools, 
  isLoading, 
  error, 
  searchQuery, 
  onCreateTool, 
  onClearSearch 
}: ToolsGridProps) => {
  if (isLoading) {
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
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <Settings className="h-12 w-12 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-700">Error loading tools</h3>
              <p className="text-gray-500 max-w-md text-lg">
                There was an error loading your tools. Please try refreshing the page.
              </p>
            </div>
            <Button size="lg" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredTools.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    );
  }

  if (searchQuery.trim()) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-700">No tools found</h3>
              <p className="text-gray-500 max-w-md text-lg">
                No tools match your search for &ldquo;{searchQuery}&rdquo;. Try different keywords or create a new tool.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-3 text-lg"
                onClick={onClearSearch}
              >
                Clear Search
              </Button>
              <Button 
                size="lg" 
                className="px-8 py-3 text-lg"
                onClick={onCreateTool}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-12 text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Wrench className="h-12 w-12 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-700">No tools yet</h3>
            <p className="text-gray-500 max-w-md text-lg">
              Get started by creating your first development tool. Tools help you learn and practice coding concepts.
            </p>
          </div>
          <Button size="lg" className="mt-6 px-8 py-3 text-lg" onClick={onCreateTool}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Tool
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
