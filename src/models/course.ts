
interface Tool {
    id: string; // MongoDB generated ID
    name: string; // e.g., "React", "Node.js", "Express.js"
    description: string; // Description of the tool
    icon: string; // Icon URL or path
    difficulty: 'beginner' | 'intermediate' | 'advanced'; // Determined by Gemini
    modules: ToolModule[];
}

interface ToolModule {
    id: string;
    title: string;
    description: string;
}

export type { Tool, ToolModule };