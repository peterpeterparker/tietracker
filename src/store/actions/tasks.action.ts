import { TaskActionTypes, START_TASK, STOP_TASK, INIT_TASK, TasksActionTypes, LIST_TASKS } from '../types/tasks.types';

import { TaskInProgress } from '../interfaces/task.inprogress';
import { TaskItem } from '../interfaces/task.item';

export function startTask(task: TaskInProgress): TaskActionTypes {
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

export function initTask(task: TaskInProgress): TaskActionTypes {
    return {
        type: INIT_TASK,
        payload: task
    }
}

export function listTasks(tasks: TaskItem[]): TasksActionTypes {
    return {
        type: LIST_TASKS,
        payload: tasks
    }
}
