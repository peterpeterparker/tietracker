import {CREATE_TASK, INIT_TASK, LIST_TASKS, START_TASK, STOP_TASK, TaskActionTypes, TasksActionTypes, UPDATE_TASK} from '../types/tasks.types';

import {TaskInProgress} from '../interfaces/task.inprogress';
import {TaskItem} from '../interfaces/task.item';

export function startTask(task: TaskInProgress): TaskActionTypes {
  return {
    type: START_TASK,
    payload: task,
  };
}

export function updateTask(task: TaskInProgress): TaskActionTypes {
  return {
    type: UPDATE_TASK,
    payload: task,
  };
}

export function stopTask(): TaskActionTypes {
  return {
    type: STOP_TASK,
  };
}

export function createTask(): TaskActionTypes {
  return {
    type: CREATE_TASK,
  };
}

export function initTask(task: TaskInProgress): TaskActionTypes {
  return {
    type: INIT_TASK,
    payload: task,
  };
}

export function listTasks(data: TaskItem[], forDate: Date): TasksActionTypes {
  return {
    type: LIST_TASKS,
    payload: {
      items: data,
      forDate: forDate,
    },
  };
}
