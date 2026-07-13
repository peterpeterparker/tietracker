import type {TaskInProgressClientData, TaskInProgressProjectData} from './task.inprogress';
import type {UUID} from '../../types/uuid';

export interface Invoice {
  client_id: UUID;
  project_id: UUID;

  client: TaskInProgressClientData;
  project: TaskInProgressProjectData;

  hours: number;
  billable: number;
}
