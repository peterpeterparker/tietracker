import { Task } from '../../models/task';

export const START_TASK = 'START_TASK';
export const STOP_TASK = 'STOP_TASK';
export const INIT_TASK = 'INIT_TASK';

export const LIST_TASKS = 'LIST_TASKS';

interface TrackTaskAction {
    type: typeof START_TASK | typeof INIT_TASK
    payload: Task | undefined
}

interface StopTaskAction {
    type: typeof STOP_TASK
}

interface ListTasksAction {
    type: typeof LIST_TASKS;
    payload: Task[];
}

export type TaskActionTypes = TrackTaskAction | StopTaskAction;

export type TasksActionTypes = ListTasksAction;
