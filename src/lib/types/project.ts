import type {UUID} from './uuid';

export type ProjectId = UUID;

// Denormalization
export interface ProjectClientData {
  id: ProjectId;
  name: string;
  color: string;
}

export interface ProjectDataRate {
  hourly: number;
  vat: boolean;
}

export type ProjectDataType = 'project' | 'yearly' | 'monthly' | 'weekly';

export interface ProjectDataBudget {
  budget: number;
  billed: number;
  type?: ProjectDataType;
}

export interface ProjectData {
  name: string;

  disabled: boolean;

  rate: ProjectDataRate;

  client?: ProjectClientData;

  budget?: ProjectDataBudget;

  created_at?: Date | number;
  updated_at?: Date | number;
}

export interface Project {
  id: ProjectId;
  data: ProjectData;
}
