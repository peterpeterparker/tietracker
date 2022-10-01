import {ProjectDataBudget, ProjectDataRate} from '../../models/project';
import {TaskData} from '../../models/task';

// Denormalization
export interface TaskInProgressClientData {
  name: string;
  color: string;
}

// Denormalization
export interface TaskInProgressProjectData {
  name: string;
  rate: ProjectDataRate;
  budget?: ProjectDataBudget;
}

export interface TaskInProgressData extends TaskData {
  client?: TaskInProgressClientData;
  project?: TaskInProgressProjectData;
}

export interface TaskInProgress {
  id: string;
  data: TaskInProgressData;
}
