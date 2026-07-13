import {TaskInProgressClientData, TaskInProgressProjectData} from './task.inprogress';

export interface Invoice {
  client_id: string;
  project_id: string;

  client: TaskInProgressClientData;
  project: TaskInProgressProjectData;

  hours: number;
  billable: number;
}
