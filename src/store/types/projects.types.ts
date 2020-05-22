import {Project} from '../../models/project';

export const CREATE_PROJECT = 'CREATE_PROJECT';
export const INIT_ACTIVE_PROJECTS = 'INIT_ACTIVE_PROJECTS';

interface CreateProjectAction {
  type: typeof CREATE_PROJECT;
  payload: Project;
}

interface InitActiveProjectsAction {
  type: typeof INIT_ACTIVE_PROJECTS;
  payload: Project[];
}

export type ProjectActionTypes = CreateProjectAction | InitActiveProjectsAction;
