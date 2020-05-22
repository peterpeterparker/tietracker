import {ProjectActionTypes, CREATE_PROJECT, INIT_ACTIVE_PROJECTS} from '../types/projects.types';
import {Project} from '../../models/project';

export function createProject(newProject: Project): ProjectActionTypes {
  return {
    type: CREATE_PROJECT,
    payload: newProject,
  };
}

export function initActiveProjects(projects: Project[]): ProjectActionTypes {
  return {
    type: INIT_ACTIVE_PROJECTS,
    payload: projects,
  };
}
