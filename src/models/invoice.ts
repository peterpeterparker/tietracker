import {TaskInProgressClientData, TaskInProgressProjectData} from '../store/interfaces/task.inprogress';

export interface Invoice {
    client_id: string;
    project_id: string;

    client: TaskInProgressClientData;
    project: TaskInProgressProjectData;

    hours: number;
    billable: number;
}
