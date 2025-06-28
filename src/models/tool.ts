
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

export type { Tool, ToolModule };