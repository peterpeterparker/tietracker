import { combineReducers } from 'redux';

import { clientsReducer } from './clients.reducer';
import { projectsReducer } from './projects.reducer';
import { tasksReducer } from './tasks.reducer';
import { summaryReducer } from './summary.reducer';

export const rootReducer = combineReducers({
    clients: clientsReducer,
    activeProjects: projectsReducer,
    taskInProgress: tasksReducer,
    summary: summaryReducer
});

export type RootState = ReturnType<typeof rootReducer>;
