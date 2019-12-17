import { combineReducers } from 'redux';

import { clientsReducer } from './clients.reducer';
import { projectsReducer } from './projects.reducer';

export const rootReducer = combineReducers({
    clients: clientsReducer,
    activeProjects: projectsReducer
});

export type RootState = ReturnType<typeof rootReducer>;
