import { TaskInProgress } from '../interfaces/task.inprogress';
import { TaskItem } from '../interfaces/task.item';

export const START_TASK = 'START_TASK';
export const STOP_TASK = 'STOP_TASK';
export const INIT_TASK = 'INIT_TASK';

export const LIST_TASKS = 'LIST_TASKS';

interface TrackTaskAction {
    type: typeof START_TASK | typeof INIT_TASK
    payload: TaskInProgress | undefined
}

interface StopTaskAction {
    type: typeof STOP_TASK
}

interface ListTasksAction {
    type: typeof LIST_TASKS;
    payload: TaskItem[];
}

export type TaskActionTypes = TrackTaskAction | StopTaskAction;

export type TasksActionTypes = ListTasksAction;
