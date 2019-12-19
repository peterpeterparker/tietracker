import { TaskActionTypes, START_TASK, STOP_TASK, INIT_TASK, LIST_TASKS, TasksActionTypes } from '../types/tasks.types';

import { Task } from '../../models/task';

export interface TaskState {
    task: Task | undefined;
    tasks: Task[] | [];
}

const initialState: TaskState = {
    task: undefined,
    tasks: []
}

export function tasksReducer(state = initialState, action: TaskActionTypes | TasksActionTypes): TaskState {
    switch (action.type) {
        case INIT_TASK:
        case START_TASK:
            return {
                task: action.payload,
                tasks: state.tasks
            };
        case STOP_TASK:
            return {
                task: undefined,
                tasks: state.tasks
            };
        case LIST_TASKS:
            return {
                task: state.task,
                tasks: action.payload
            };
        default:
            return state;
    }
}
