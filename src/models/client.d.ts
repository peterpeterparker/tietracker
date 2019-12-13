interface Project {
    name: string;
}

interface Client {
    name: string;
    color?: string;

    projects?: Project[];
}