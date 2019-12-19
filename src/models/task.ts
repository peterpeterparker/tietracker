export interface TaskData {
    from: Date | number;
    to?: Date | number;

    client_id: string;
    project_id: string;

    created_at: Date | number;
    updated_at: Date | number;
}

export interface Task {
    id: string;
    data: TaskData
}
