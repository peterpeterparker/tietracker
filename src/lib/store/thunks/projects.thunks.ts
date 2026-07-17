import {ProjectsService} from '../../services/projects.service';
import {Client} from '../../types/client';
import {Project, ProjectData} from '../../types/project';
import {
  CREATE_PROJECT,
  INIT_ACTIVE_PROJECTS,
  UPDATE_ACTIVE_PROJECTS,
} from '../types/projects.types';
import {WithSettings} from '../types/store.types';
import {RootThunkResult} from './types.thunks';

export function createProject({
  client,
  data,
  settings,
}: {client: Client; data: ProjectData} & WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    const project: Project = await ProjectsService.create(settings).create(client, data);

    dispatch({type: CREATE_PROJECT, payload: project});
  };
}

export function initActiveProjects({settings}: WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    const projects: Project[] = await ProjectsService.create(settings).list();

    dispatch({type: INIT_ACTIVE_PROJECTS, payload: projects});
  };
}

export function updateActiveProject({
  project,
  settings,
}: {
  project: Project;
} & WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    const service = ProjectsService.create(settings);

    await service.updateActiveProject(project);

    const projects = await service.list();

    dispatch({type: UPDATE_ACTIVE_PROJECTS, payload: projects});
  };
}
