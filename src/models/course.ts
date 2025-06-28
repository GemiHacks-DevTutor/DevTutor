
interface UserCourse {
    id: string;
    userId: string;
    iconURL: string;
    title: string;
    description: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
};

export type { UserCourse };