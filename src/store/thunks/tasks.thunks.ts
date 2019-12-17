import { RootThunkResult } from './types.thunks';

import { Project } from '../../models/project';
import { Task } from '../../models/task';

import { START_TASK, STOP_TASK, INIT_TASK } from '../types/tasks.types';

import { TasksService } from '../../services/tasks/tasks.service';

export function startTask(project: Project): RootThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        const task: Task = await TasksService.getInstance().start(project);

        dispatch({ type: START_TASK, payload: task });
    };
}

export function stopTask(): RootThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        await TasksService.getInstance().stop();

        dispatch({ type: STOP_TASK });
    };
}

export function initTask(): RootThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        const task: Task | undefined = await TasksService.getInstance().current();

        dispatch({ type: INIT_TASK, payload: task });
    };
}
