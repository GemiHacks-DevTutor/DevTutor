
interface Tool {
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    modules: ToolModule[];
}

interface ToolModule {
    id: string;
    title: string;
    description: string;
}


// TODO: REMOVE THIS
interface UserCourse {
    id: string;
    userId: string;
    toolId: string; // Reference to the Tool
    status: 'Not Started' | 'In Progress' | 'Completed';
    currentModuleId?: string; // Current module the user is on
    completedModules: string[]; // Array of completed module IDs
}

export type { Tool, ToolModule, UserCourse };