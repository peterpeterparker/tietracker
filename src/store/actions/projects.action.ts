import {Project} from '../../models/project';
import {
  CREATE_PROJECT,
  INIT_ACTIVE_PROJECTS,
  ProjectActionTypes,
  UPDATE_ACTIVE_PROJECTS,
} from '../types/projects.types';

export function createProject(newProject: Project): ProjectActionTypes {
  return {
    type: CREATE_PROJECT,
    payload: newProject,
  };
}

export function updateActiveProject(projects: Project[]): ProjectActionTypes {
  return {
    type: UPDATE_ACTIVE_PROJECTS,
    payload: projects,
  };
}

export function initActiveProjects(projects: Project[]): ProjectActionTypes {
  return {
    type: INIT_ACTIVE_PROJECTS,
    payload: projects,
  };
}
