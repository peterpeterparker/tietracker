import { Task } from '../../models/task';

export const START_TASK = 'START_TASK';
export const STOP_TASK = 'STOP_TASK';
export const INIT_TASK = 'INIT_TASK';

interface TrackTaskAction {
    type: typeof START_TASK | typeof INIT_TASK
    payload: Task | undefined
}

interface StopTaskAction {
    type: typeof STOP_TASK
}

export type TaskActionTypes = TrackTaskAction | StopTaskAction;
