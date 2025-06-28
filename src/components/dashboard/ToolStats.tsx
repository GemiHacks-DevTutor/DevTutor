import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Settings } from "lucide-react";
import { Tool } from "@/models/course";

interface ToolStatsProps {
  tools: Tool[];
}

export const ToolStats = ({ tools }: ToolStatsProps) => {
  if (tools.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Tools</p>
              <p className="text-3xl font-bold text-gray-900">{tools.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Settings className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Beginner</p>
              <p className="text-3xl font-bold text-gray-900">
                {tools.filter(tool => tool.difficulty === 'beginner').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Advanced</p>
              <p className="text-3xl font-bold text-gray-900">
                {tools.filter(tool => tool.difficulty === 'advanced').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
