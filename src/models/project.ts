export interface ProjectData {
    name: string;

    from: Date | number;
    to?: Date | number;

    client_id?: string;

    create_at?: Date | number;
    updated_at?: Date | number;
}

export interface Project {
    id: string;
    data: ProjectData;
}
