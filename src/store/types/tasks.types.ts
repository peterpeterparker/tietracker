import {TaskInProgress} from '../interfaces/task.inprogress';
import {TaskItem} from '../interfaces/task.item';

export const START_TASK = 'START_TASK';
export const UPDATE_TASK = 'UPDATE_TASK';
export const STOP_TASK = 'STOP_TASK';
export const INIT_TASK = 'INIT_TASK';
export const CREATE_TASK = 'CREATE_TASK';

export const LIST_TASKS = 'LIST_TASKS';

interface TrackTaskAction {
  type: typeof START_TASK | typeof INIT_TASK | typeof UPDATE_TASK;
  payload: TaskInProgress | undefined;
}

interface StopTaskAction {
  type: typeof STOP_TASK;
}

interface CreateTaskAction {
  type: typeof CREATE_TASK;
}

interface ListTasksActionPayload {
  items: TaskItem[];
  forDate: Date;
}

interface ListTasksAction {
  type: typeof LIST_TASKS;
  payload: ListTasksActionPayload;
}

export type TaskActionTypes = TrackTaskAction | StopTaskAction | CreateTaskAction;

export type TasksActionTypes = ListTasksAction;
