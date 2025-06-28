import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tool } from '@/models/tool';

interface ToolsSectionHeaderProps {
  tools: Tool[];
  filteredTools: Tool[];
  searchQuery: string;
  onCreateTool: () => void;
}

export const ToolsSectionHeader = ({ 
  tools, 
  filteredTools, 
  searchQuery, 
  onCreateTool 
}: ToolsSectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold text-gray-900">
        {searchQuery.trim() ? 'Search Results' : 'Explore Tools'}
      </h2>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">
          {searchQuery.trim() 
            ? `${filteredTools.length} of ${tools.length} tool${tools.length !== 1 ? 's' : ''}`
            : `${tools.length} tool${tools.length !== 1 ? 's' : ''}`
          }
        </span>
        <Button onClick={onCreateTool} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Tool</span>
        </Button>
      </div>
    </div>
  );
};
