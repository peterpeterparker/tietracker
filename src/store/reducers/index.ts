import { combineReducers } from 'redux';

import { clientsReducer } from './clients.reducer';
import { projectsReducer } from './projects.reducer';
import { tasksReducer } from './tasks.reducer';

export const rootReducer = combineReducers({
    clients: clientsReducer,
    activeProjects: projectsReducer,
    taskInProgress: tasksReducer
});

export type RootState = ReturnType<typeof rootReducer>;
