// Denormalization
export interface TaskInProgressClientData {
    name: string;
    color: string;
}

// Denormalization
export interface TaskInProgressProjectData {
    name: string;
}

export interface TaskData {
    from: Date | number;
    to?: Date | number;

    client_id: string;
    project_id: string;

    created_at: Date | number;
    updated_at: Date | number;
}

export interface TaskInProgressData extends TaskData {
    client: TaskInProgressClientData;
    project: TaskInProgressProjectData;
}

export interface Task {
    id: string;
    data: TaskData | TaskInProgressData;
}
