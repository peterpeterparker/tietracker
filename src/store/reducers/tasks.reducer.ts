import { TaskActionTypes, START_TASK, STOP_TASK, INIT_TASK, LIST_TASKS, TasksActionTypes } from '../types/tasks.types';

import { TaskItem } from '../interfaces/task.item';
import { TaskInProgress } from '../interfaces/task.inprogress';

export interface TaskState {
    taskInProgress: TaskInProgress | undefined;
    taskItems: TaskItem[] | [];
}

const initialState: TaskState = {
    taskInProgress: undefined,
    taskItems: []
}

export function tasksReducer(state = initialState, action: TaskActionTypes | TasksActionTypes): TaskState {
    switch (action.type) {
        case INIT_TASK:
        case START_TASK:
            return {
                taskInProgress: action.payload,
                taskItems: state.taskItems
            };
        case STOP_TASK:
            return {
                taskInProgress: undefined,
                taskItems: state.taskItems
            };
        case LIST_TASKS:
            return {
                taskInProgress: state.taskInProgress,
                taskItems: action.payload
            };
        default:
            return state;
    }
}
