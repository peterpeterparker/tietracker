import { ProjectDataRate } from "../../models/project";
import { TaskData, TaskInProgressClientData, TaskInProgressProjectData } from "../../models/task";

// Denormalization
export interface TaskProjectExtendedData {
    name: string;
    rate: ProjectDataRate;
}

// Denormalization
export interface TaskInProgressData extends TaskData {
    client: TaskInProgressClientData;
    project: TaskInProgressProjectData;
}

export interface TaskItemData extends TaskData {
    client: TaskInProgressClientData;
    project: TaskProjectExtendedData;
    hours: number;
    billable: number;
}

export interface TaskItem {
    id: string;
    data: TaskItemData;
}
