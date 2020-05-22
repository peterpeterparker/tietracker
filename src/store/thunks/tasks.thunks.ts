import {RootThunkResult} from './types.thunks';

import {START_TASK, STOP_TASK, INIT_TASK, LIST_TASKS, UPDATE_TASK, CREATE_TASK} from '../types/tasks.types';

import {TaskInProgress} from '../interfaces/task.inprogress';
import {TaskItem} from '../interfaces/task.item';

import {Project} from '../../models/project';
import {Settings} from '../../models/settings';

import {TasksService} from '../../services/tasks/tasks.service';
import {NotificationsService} from '../../services/notifications/notifications.service';
import {TaskData} from '../../models/task';

export function startTask(project: Project, settings: Settings): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const task: TaskInProgress = await TasksService.getInstance().start(project, settings);

    await NotificationsService.getInstance().schedule(project, settings);

    dispatch({type: START_TASK, payload: task});
  };
}

export function updateTask(data: TaskInProgress): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const task: TaskInProgress | undefined = await TasksService.getInstance().updateTaskInProgress(data);

    dispatch({type: UPDATE_TASK, payload: task});
  };
}

export function stopTask(delayDispatch: number = 0, roundTime: number): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    await TasksService.getInstance().stop(roundTime);

    await NotificationsService.getInstance().cancel();

    setTimeout(() => {
      dispatch({type: STOP_TASK});
    }, delayDispatch);
  };
}

export function createTask(taskData: TaskData, roundTime: number): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    await TasksService.getInstance().create(taskData, roundTime);

    dispatch({type: CREATE_TASK});
  };
}

export function initTask(): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const task: TaskInProgress | undefined = await TasksService.getInstance().current();

    dispatch({type: INIT_TASK, payload: task});
  };
}

export function listTasks(forDate: Date): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    await TasksService.getInstance().list((data: TaskItem[], forDate: Date) => {
      dispatch({
        type: LIST_TASKS,
        payload: {
          items: data,
          forDate: forDate,
        },
      });
    }, forDate);
  };
}
