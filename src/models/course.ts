
export interface Tool {
    id: string;
    name: string;
}

export interface Course {
    id: string;
    userId: string;
    toolId: string;
    modulesCompleted: number;
}