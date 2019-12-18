import { TaskActionTypes, START_TASK, STOP_TASK, INIT_TASK } from '../types/tasks.types';

import { Task } from '../../models/task';

export interface TaskState {
    task: Task | undefined;
}

const initialState: TaskState = {
    task: undefined
}

export function tasksReducer(state = initialState, action: TaskActionTypes): TaskState {
    switch (action.type) {
        case INIT_TASK:
        case START_TASK:
            return {
                task: action.payload
            };
        case STOP_TASK:
            return {
                task: undefined
            };
        default:
            return state;
    }
}
