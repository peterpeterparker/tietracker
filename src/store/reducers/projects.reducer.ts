import {Project} from '../../models/project';
import {
  CREATE_PROJECT,
  INIT_ACTIVE_PROJECTS,
  ProjectActionTypes,
  UPDATE_ACTIVE_PROJECTS,
} from '../types/projects.types';

export interface ProjectsState {
  projects: Project[] | undefined;
}

const initialState: ProjectsState = {
  projects: undefined,
};

export function projectsReducer(state = initialState, action: ProjectActionTypes): ProjectsState {
  switch (action.type) {
    case CREATE_PROJECT:
      return {
        projects:
          state.projects !== undefined ? [...state.projects, action.payload] : [action.payload],
      };
    case INIT_ACTIVE_PROJECTS:
    case UPDATE_ACTIVE_PROJECTS:
      return {
        projects: action.payload ? action.payload : [],
      };
    default:
      return state;
  }
}
