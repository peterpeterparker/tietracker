import { TaskActionTypes, START_TASK, STOP_TASK, INIT_TASK } from '../types/tasks.types';
import { Task } from '../../models/task';

export function startTask(task: Task): TaskActionTypes {
    return {
        type: START_TASK,
        payload: task
    }
}

export function stopTask(): TaskActionTypes {
    return {
        type: STOP_TASK
    }
}

export function initTask(task: Task): TaskActionTypes {
    return {
        type: INIT_TASK,
        payload: task
    }
}
