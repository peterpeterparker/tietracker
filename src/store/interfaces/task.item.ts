import {ProjectDataRate} from '../../models/project';
import {TaskData} from '../../models/task';
import {TaskInProgressClientData, TaskInProgressProjectData} from './task.inprogress';

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
  milliseconds: number;
  billable: number;
}

export interface TaskItem {
  id: string;
  data: TaskItemData;
}
