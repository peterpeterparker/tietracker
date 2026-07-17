import {NotificationsService} from '../../services/notifications.service';
import {TasksService} from '../../services/tasks.service';
import {Project} from '../../types/project';
import {TaskData} from '../../types/task';
import {TaskInProgress} from '../interfaces/task.inprogress';
import {TaskItem} from '../interfaces/task.item';
import {WithSettings} from '../types/store.types';
import {
  CREATE_TASK,
  INIT_TASK,
  LIST_TASKS,
  START_TASK,
  STOP_TASK,
  UPDATE_TASK,
} from '../types/tasks.types';
import {RootThunkResult} from './types.thunks';

export function startTask({
  project,
  settings,
}: {project: Project} & WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    const task = await TasksService.create(settings).start(project, settings);

    await NotificationsService.getInstance().schedule(project, settings);

    dispatch({type: START_TASK, payload: task});
  };
}

export function updateTask({
  task: data,
  settings,
}: {task: TaskInProgress} & WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    const task = await TasksService.create(settings).updateTaskInProgress(data);

    dispatch({type: UPDATE_TASK, payload: task});
  };
}

export function stopTask({
  delayDispatch = 0,
  roundTime,
  settings,
}: {
  delayDispatch?: number;
  roundTime: number;
} & WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    await TasksService.create(settings).stop(roundTime);

    await NotificationsService.getInstance().cancel();

    setTimeout(() => {
      dispatch({type: STOP_TASK});
    }, delayDispatch);
  };
}

export function createTask({
  taskData,
  roundTime,
  settings,
}: {taskData: TaskData; roundTime: number} & WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    await TasksService.create(settings).create(taskData, roundTime);

    dispatch({type: CREATE_TASK});
  };
}

export function initTask({settings}: WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    const task = await TasksService.create(settings).current();

    dispatch({type: INIT_TASK, payload: task});
  };
}

export function listTasks({
  forDate,
  settings,
}: {forDate: Date} & WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    await TasksService.create(settings).list((data: TaskItem[], forDate: Date) => {
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
