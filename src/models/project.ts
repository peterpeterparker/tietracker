// Denormalization
export interface ProjectClientData {
  id: string;
  name: string;
  color: string;
}

export interface ProjectDataRate {
  hourly: number;
  vat: boolean;
}

export type ProjectDataType = 'project' | 'yearly' | 'monthly';

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
  id: string;
  data: ProjectData;
}
