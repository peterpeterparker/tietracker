export interface Project {
    name: string;
}

export interface Client {
    name: string;
    color?: string;

    projects?: Project[];
}
