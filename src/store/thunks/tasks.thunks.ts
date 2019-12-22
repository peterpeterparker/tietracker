import { RootThunkResult } from './types.thunks';

import { Project } from '../../models/project';

import {START_TASK, STOP_TASK, INIT_TASK, LIST_TASKS, UPDATE_TASK} from '../types/tasks.types';

import { TasksService } from '../../services/tasks/tasks.service';
import { TaskInProgress } from '../interfaces/task.inprogress';
import { TaskItem } from '../interfaces/task.item';
import {Settings} from '../../models/settings';

export function startTask(project: Project, settings: Settings): RootThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        const task: TaskInProgress = await TasksService.getInstance().start(project, settings);

        dispatch({ type: START_TASK, payload: task });
    };
}

export function updateTask(data: TaskInProgress): RootThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        const task: TaskInProgress | undefined = await TasksService.getInstance().updateTaskInProgress(data);

        dispatch({ type: UPDATE_TASK, payload: task });
    };
}

export function stopTask(delayDispatch: number = 0, roundTime: number): RootThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        await TasksService.getInstance().stop(roundTime);

        setTimeout(() => {
            dispatch({ type: STOP_TASK });
        }, delayDispatch);
    };
}

export function initTask(): RootThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        const task: TaskInProgress | undefined = await TasksService.getInstance().current();

        dispatch({ type: INIT_TASK, payload: task });
    };
}

export function listTasks(): RootThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        await TasksService.getInstance().list((data: TaskItem[]) => {
            dispatch({ type: LIST_TASKS, payload: data });
        });
    };
}
