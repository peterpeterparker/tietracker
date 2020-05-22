export interface TaskDataInvoice {
  status: 'open' | 'billed';
  billed_at?: Date | number;
}

export interface TaskData {
  from: Date | number;
  to?: Date | number;

  client_id: string;
  project_id: string;

  invoice: TaskDataInvoice;

  description?: string;

  created_at: Date | number;
  updated_at: Date | number;
}

export interface Task {
  id: string;
  data: TaskData;
}
