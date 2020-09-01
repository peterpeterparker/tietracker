import {CREATE_TASK, INIT_TASK, LIST_TASKS, START_TASK, STOP_TASK, TaskActionTypes, TasksActionTypes, UPDATE_TASK} from '../types/tasks.types';

import {TaskItem} from '../interfaces/task.item';
import {TaskInProgress} from '../interfaces/task.inprogress';

export interface TaskState {
  taskInProgress: TaskInProgress | undefined;
  taskItems: TaskItem[];
  taskItemsSelectedDate: Date;
}

const initialState: TaskState = {
  taskInProgress: undefined,
  taskItems: [] as TaskItem[],
  taskItemsSelectedDate: new Date(),
};

export function tasksReducer(state = initialState, action: TaskActionTypes | TasksActionTypes): TaskState {
  switch (action.type) {
    case INIT_TASK:
    case UPDATE_TASK:
    case START_TASK:
      return {
        taskInProgress: action.payload ? {...action.payload} : undefined,
        taskItems: state.taskItems,
        taskItemsSelectedDate: state.taskItemsSelectedDate,
      };
    case STOP_TASK:
    case CREATE_TASK:
      return {
        taskInProgress: undefined,
        taskItems: state.taskItems,
        taskItemsSelectedDate: state.taskItemsSelectedDate,
      };
    case LIST_TASKS:
      return {
        taskInProgress: state.taskInProgress,
        taskItems: [...action.payload.items],
        taskItemsSelectedDate: action.payload.forDate,
      };
    default:
      return state;
  }
}
