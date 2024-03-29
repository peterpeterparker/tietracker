import {RootThunkResult} from './types.thunks';

import {Client} from '../../models/client';
import {Project, ProjectData} from '../../models/project';

import {
  CREATE_PROJECT,
  INIT_ACTIVE_PROJECTS,
  UPDATE_ACTIVE_PROJECTS,
} from '../types/projects.types';

import {ProjectsService} from '../../services/projects/projects.service';

export function createProject(client: Client, data: ProjectData): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const project: Project = await ProjectsService.getInstance().create(client, data);

    dispatch({type: CREATE_PROJECT, payload: project});
  };
}

export function initActiveProjects(): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const projects: Project[] = await ProjectsService.getInstance().list();

    dispatch({type: INIT_ACTIVE_PROJECTS, payload: projects});
  };
}

export function updateActiveProject(project: Project): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    await ProjectsService.getInstance().updateActiveProject(project);

    const projects: Project[] = await ProjectsService.getInstance().list();

    dispatch({type: UPDATE_ACTIVE_PROJECTS, payload: projects});
  };
}
