import type {UUID} from '../../types/uuid';
import type {TaskInProgressClientData, TaskInProgressProjectData} from './task.inprogress';

export interface Invoice {
  client_id: UUID;
  project_id: UUID;

  client: TaskInProgressClientData;
  project: TaskInProgressProjectData;

  hours: number;
  billable: number;
}
