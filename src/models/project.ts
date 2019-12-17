// Denormalization
export interface ProjectClientData {
    id: string;
    name: string;
    color: string;
}

export interface ProjectData {
    name: string;

    from: Date | number;
    to?: Date | number;

    client?: ProjectClientData;

    created_at?: Date | number;
    updated_at?: Date | number;
}

export interface Project {
    id: string;
    data: ProjectData;
}
